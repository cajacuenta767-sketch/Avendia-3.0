from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import delete, func, or_, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.modules.admin.model import AdminAuditLog
from app.modules.users.model import User
from app.modules.utilities.model import (
    Idea,
    IdeaComment,
    IdeaVote,
    Notification,
    Tutorial,
    TutorialProgress,
)
from app.modules.utilities.schemas import (
    CommentInput,
    IdeaEdit,
    IdeaInput,
    ProgressInput,
    Review,
    TutorialInput,
)

router = APIRouter(tags=["utilities"])


def require_admin(user: User) -> None:
    if user.role != "admin":
        raise HTTPException(403, "Esta acción requiere administración")


def audit(db: AsyncSession, user: User, action: str, entity_id: UUID, reason: str) -> None:
    db.add(
        AdminAuditLog(
            actor_id=user.id,
            action=action,
            target_type="utilities",
            target_id=str(entity_id),
            reason=reason,
            detail_json={},
        )
    )


async def find_idea(db: AsyncSession, idea_id: UUID, user: User) -> Idea:
    idea = await db.get(Idea, idea_id)
    if not idea or (idea.status == "hidden" and idea.author_id != user.id and user.role != "admin"):
        raise HTTPException(404, "Propuesta no encontrada")
    return idea


async def idea_view(db: AsyncSession, idea: Idea, user: User) -> dict:
    count = await db.scalar(
        select(func.count()).select_from(IdeaVote).where(IdeaVote.idea_id == idea.id)
    )
    voted = await db.get(IdeaVote, (idea.id, user.id))
    return {
        "id": idea.id,
        "title": idea.title,
        "description": idea.description,
        "category": idea.category,
        "tool": idea.tool,
        "status": idea.status,
        "response": idea.response,
        "created_at": idea.created_at,
        "updated_at": idea.updated_at,
        "mine": idea.author_id == user.id,
        "votes": count,
        "voted": voted is not None,
    }


@router.get("/ideas")
async def list_ideas(
    q: str = Query("", max_length=120),
    state: str = "",
    mine: bool = False,
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=50),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    filters = []
    if user.role != "admin":
        filters.append(or_(Idea.status != "hidden", Idea.author_id == user.id))
    if mine:
        filters.append(Idea.author_id == user.id)
    if state:
        filters.append(Idea.status == state)
    if q:
        filters.append(
            or_(
                Idea.title.icontains(q, autoescape=True),
                Idea.description.icontains(q, autoescape=True),
            )
        )
    total = await db.scalar(select(func.count()).select_from(Idea).where(*filters))
    items = await db.scalars(
        select(Idea)
        .where(*filters)
        .order_by(Idea.created_at.desc(), Idea.id)
        .offset((page - 1) * size)
        .limit(size)
    )
    return {
        "items": [await idea_view(db, idea, user) for idea in items],
        "total": total,
        "page": page,
        "size": size,
    }


@router.post("/ideas", status_code=201)
async def create_idea(
    payload: IdeaInput, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    statement = select(Idea).where(Idea.author_id == user.id, Idea.request_id == payload.request_id)
    idea = await db.scalar(statement)
    if not idea:
        idea = Idea(author_id=user.id, **payload.model_dump())
        db.add(idea)
        try:
            await db.flush()
            audit(db, user, "idea.created", idea.id, "Propuesta registrada")
            await db.commit()
        except IntegrityError:
            await db.rollback()
            idea = await db.scalar(statement)
            if not idea:
                raise
    return await idea_view(db, idea, user)


@router.patch("/ideas/{idea_id}")
async def edit_idea(
    idea_id: UUID,
    payload: IdeaEdit,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    idea = await find_idea(db, idea_id, user)
    if idea.author_id != user.id:
        raise HTTPException(403, "Solo puedes editar tu propuesta")
    if idea.status != "received":
        raise HTTPException(409, "La propuesta ya está en revisión; puedes añadir un comentario")
    idea.title, idea.description = payload.title, payload.description
    audit(db, user, "idea.edited", idea.id, "Autor actualizó su propuesta")
    await db.commit()
    return await idea_view(db, idea, user)


@router.put("/ideas/{idea_id}/vote")
async def vote(
    idea_id: UUID,
    enabled: bool = True,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await find_idea(db, idea_id, user)
    existing = await db.get(IdeaVote, (idea_id, user.id))
    if enabled and not existing:
        db.add(IdeaVote(idea_id=idea_id, user_id=user.id))
    elif not enabled:
        await db.execute(
            delete(IdeaVote).where(IdeaVote.idea_id == idea_id, IdeaVote.user_id == user.id)
        )
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
    return await idea_view(db, await find_idea(db, idea_id, user), user)


@router.patch("/admin/ideas/{idea_id}")
async def review_idea(
    idea_id: UUID,
    payload: Review,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(user)
    idea = await find_idea(db, idea_id, user)
    if (idea.status, idea.response) != (payload.status, payload.response):
        idea.status, idea.response = payload.status, payload.response
        audit(db, user, "idea.reviewed", idea.id, payload.response)
        db.add(
            Notification(
                user_id=idea.author_id,
                category="ideas",
                message="Tu propuesta tiene una respuesta de administración.",
                path="/dashboard/ideas",
            )
        )
        await db.commit()
    return await idea_view(db, idea, user)


@router.get("/ideas/{idea_id}/comments")
async def comments(
    idea_id: UUID,
    page: int = Query(1, ge=1),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await find_idea(db, idea_id, user)
    rows = await db.execute(
        select(IdeaComment, User.full_name)
        .join(User, User.id == IdeaComment.author_id)
        .where(IdeaComment.idea_id == idea_id)
        .order_by(IdeaComment.created_at, IdeaComment.id)
        .offset((page - 1) * 20)
        .limit(20)
    )
    total = await db.scalar(
        select(func.count()).select_from(IdeaComment).where(IdeaComment.idea_id == idea_id)
    )
    return {
        "items": [
            {
                "id": c.id,
                "content": c.content,
                "author": name,
                "mine": c.author_id == user.id,
                "created_at": c.created_at,
            }
            for c, name in rows
        ],
        "total": total,
    }


@router.post("/ideas/{idea_id}/comments", status_code=201)
async def add_comment(
    idea_id: UUID,
    payload: CommentInput,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    idea = await find_idea(db, idea_id, user)
    statement = select(IdeaComment).where(
        IdeaComment.author_id == user.id, IdeaComment.request_id == payload.request_id
    )
    comment = await db.scalar(statement)
    if comment and comment.idea_id != idea_id:
        raise HTTPException(409, "El identificador ya corresponde a otro comentario")
    if not comment:
        comment = IdeaComment(idea_id=idea_id, author_id=user.id, **payload.model_dump())
        db.add(comment)
        if idea.author_id != user.id:
            db.add(
                Notification(
                    user_id=idea.author_id,
                    category="ideas",
                    message="Hay un comentario nuevo en tu propuesta.",
                    path="/dashboard/ideas",
                )
            )
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            comment = await db.scalar(statement)
            if not comment:
                raise
    return {"id": comment.id}


@router.get("/notifications")
async def notifications(
    page: int = Query(1, ge=1),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rows = await db.scalars(
        select(Notification)
        .where(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc(), Notification.id)
        .offset((page - 1) * 20)
        .limit(20)
    )
    total = await db.scalar(
        select(func.count()).select_from(Notification).where(Notification.user_id == user.id)
    )
    unread = await db.scalar(
        select(func.count())
        .select_from(Notification)
        .where(Notification.user_id == user.id, Notification.is_read.is_(False))
    )
    return {
        "items": [
            {
                "id": n.id,
                "message": n.message,
                "path": n.path,
                "is_read": n.is_read,
                "created_at": n.created_at,
            }
            for n in rows
        ],
        "total": total,
        "unread": unread,
    }


@router.put("/notifications/read")
async def read_notifications(
    user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    await db.execute(
        update(Notification).where(Notification.user_id == user.id).values(is_read=True)
    )
    await db.commit()
    return {"ok": True}


async def find_tutorial(db: AsyncSession, tutorial_id: UUID, user: User) -> Tutorial:
    tutorial = await db.get(Tutorial, tutorial_id)
    if not tutorial or (not tutorial.published and user.role != "admin"):
        raise HTTPException(404, "Tutorial no disponible")
    return tutorial


async def tutorial_view(db: AsyncSession, t: Tutorial, user: User):
    progress = await db.get(TutorialProgress, (t.id, user.id))
    return {
        "id": t.id,
        "title": t.title,
        "description": t.description,
        "url": t.url,
        "category": t.category,
        "difficulty": t.difficulty,
        "tool_path": t.tool_path,
        "transcript": t.transcript,
        "published": t.published,
        "position": t.position,
        "seconds": progress.seconds if progress else 0,
        "completed": progress.completed if progress else False,
        "favorite": progress.favorite if progress else False,
    }


@router.get("/tutorials")
async def tutorials(
    q: str = Query("", max_length=120),
    page: int = Query(1, ge=1),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    filters = [] if user.role == "admin" else [Tutorial.published.is_(True)]
    if q:
        filters.append(
            or_(
                Tutorial.title.icontains(q, autoescape=True),
                Tutorial.transcript.icontains(q, autoescape=True),
                Tutorial.category.icontains(q, autoescape=True),
            )
        )
    rows = await db.scalars(
        select(Tutorial)
        .where(*filters)
        .order_by(Tutorial.position, Tutorial.id)
        .offset((page - 1) * 12)
        .limit(12)
    )
    total = await db.scalar(select(func.count()).select_from(Tutorial).where(*filters))
    return {"items": [await tutorial_view(db, t, user) for t in rows], "total": total}


@router.post("/admin/tutorials", status_code=201)
async def create_tutorial(
    payload: TutorialInput,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(user)
    if payload.request_id:
        existing = await db.scalar(
            select(Tutorial).where(Tutorial.request_id == payload.request_id)
        )
        if existing:
            return await tutorial_view(db, existing, user)
    t = Tutorial(**payload.model_dump())
    db.add(t)
    try:
        await db.flush()
        audit(db, user, "tutorial.created", t.id, "Tutorial creado")
        await db.commit()
    except IntegrityError:
        await db.rollback()
        existing = (
            await db.scalar(select(Tutorial).where(Tutorial.request_id == payload.request_id))
            if payload.request_id
            else None
        )
        if not existing:
            raise
        return await tutorial_view(db, existing, user)
    return await tutorial_view(db, t, user)


@router.put("/admin/tutorials/{tutorial_id}")
async def edit_tutorial(
    tutorial_id: UUID,
    payload: TutorialInput,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(user)
    t = await find_tutorial(db, tutorial_id, user)
    for key, value in payload.model_dump(exclude={"request_id"}).items():
        setattr(t, key, value)
    audit(db, user, "tutorial.updated", t.id, "Catálogo actualizado")
    await db.commit()
    return await tutorial_view(db, t, user)


@router.put("/tutorials/{tutorial_id}/progress")
async def progress(
    tutorial_id: UUID,
    payload: ProgressInput,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await find_tutorial(db, tutorial_id, user)
    item = await db.get(TutorialProgress, (tutorial_id, user.id))
    if not item:
        item = TutorialProgress(tutorial_id=tutorial_id, user_id=user.id)
        db.add(item)
    values = payload.model_dump(exclude_none=True)
    for key, value in values.items():
        setattr(item, key, value)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        await db.execute(
            update(TutorialProgress)
            .where(TutorialProgress.tutorial_id == tutorial_id, TutorialProgress.user_id == user.id)
            .values(**values)
        )
        await db.commit()
    return await tutorial_view(db, await find_tutorial(db, tutorial_id, user), user)

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.modules.community.model import CommunityPost
from app.modules.community.schemas import (
    CommunityPostCreate,
    CommunityPostRead,
    CommunityPostUpdate,
)
from app.modules.users.model import User
from app.modules.utilities.community import CommunityReaction, react

router = APIRouter(prefix="/community/posts", tags=["community"])


def serialize(post: CommunityPost) -> CommunityPostRead:
    return CommunityPostRead(
        id=post.id,
        author_id=post.author_id,
        author_name=post.author.full_name if post.author else "Docente",
        title=post.title,
        content=post.content,
        category=post.category,
        modality=post.modality,
        education_level=post.education_level,
        curricular_area=post.curricular_area,
        context=post.context,
        status=post.status,
        useful_count=post.useful_count,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


async def owned_post(post_id: UUID, user: User, db: AsyncSession) -> CommunityPost:
    post = await db.scalar(
        select(CommunityPost)
        .options(selectinload(CommunityPost.author))
        .where(CommunityPost.id == post_id)
    )
    if post is None or (post.author_id != user.id and user.role != "admin"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Publicación no encontrada"
        )
    return post


@router.get("", response_model=list[CommunityPostRead])
async def list_posts(
    query: str | None = Query(None, max_length=120),
    category: str | None = Query(None, max_length=32),
    modality: str | None = Query(None, max_length=16),
    education_level: str | None = Query(None, max_length=32),
    context: str | None = Query(None, max_length=24),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[CommunityPostRead]:
    statement = (
        select(CommunityPost)
        .options(selectinload(CommunityPost.author))
        .where(CommunityPost.status == "published")
    )
    if category:
        statement = statement.where(CommunityPost.category == category)
    if modality:
        statement = statement.where(CommunityPost.modality == modality)
    if education_level:
        statement = statement.where(CommunityPost.education_level == education_level)
    if context:
        statement = statement.where(CommunityPost.context == context)
    if query:
        pattern = f"%{query.strip()}%"
        statement = statement.where(
            CommunityPost.title.ilike(pattern) | CommunityPost.content.ilike(pattern)
        )
    posts = list(await db.scalars(statement.order_by(CommunityPost.created_at.desc()).limit(100)))
    return [serialize(post) for post in posts]


@router.post("", response_model=CommunityPostRead, status_code=status.HTTP_201_CREATED)
async def create_post(
    payload: CommunityPostCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CommunityPostRead:
    if payload.request_id:
        existing = await db.scalar(
            select(CommunityPost)
            .options(selectinload(CommunityPost.author))
            .where(
                CommunityPost.author_id == user.id, CommunityPost.request_id == payload.request_id
            )
        )
        if existing:
            return serialize(existing)
    post = CommunityPost(author_id=user.id, **payload.model_dump())
    db.add(post)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        if not payload.request_id:
            raise
        existing = await db.scalar(
            select(CommunityPost)
            .options(selectinload(CommunityPost.author))
            .where(
                CommunityPost.author_id == user.id, CommunityPost.request_id == payload.request_id
            )
        )
        if not existing:
            raise
        return serialize(existing)
    await db.refresh(post, ["author"])
    return serialize(post)


@router.patch("/{post_id}", response_model=CommunityPostRead)
async def update_post(
    post_id: UUID,
    payload: CommunityPostUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CommunityPostRead:
    post = await owned_post(post_id, user, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(post, field, value)
    await db.commit()
    await db.refresh(post, ["author"])
    return serialize(post)


@router.post("/{post_id}/useful", response_model=CommunityPostRead)
async def mark_useful(
    post_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CommunityPostRead:
    post = await db.scalar(
        select(CommunityPost)
        .options(selectinload(CommunityPost.author))
        .where(CommunityPost.id == post_id, CommunityPost.status == "published")
    )
    if post is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Publicación no encontrada"
        )
    await react(post_id, "useful", True, user, db)
    post.useful_count = await db.scalar(
        select(func.count())
        .select_from(CommunityReaction)
        .where(CommunityReaction.post_id == post_id, CommunityReaction.kind == "useful")
    )
    await db.commit()
    await db.refresh(post, ["author"])
    return serialize(post)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    post = await owned_post(post_id, user, db)
    post.status = "hidden"
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import Field
from sqlalchemy import ForeignKey, String, Text, UniqueConstraint, delete, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from app.api.dependencies import get_current_user
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.db.session import get_db
from app.modules.community.model import CommunityPost
from app.modules.users.model import User
from app.modules.utilities.model import Notification
from app.modules.utilities.router import audit, require_admin
from app.modules.utilities.schemas import CommentInput, Input


class CommunityReaction(TimestampMixin, Base):
    __tablename__ = "community_reactions"
    post_id: Mapped[UUID] = mapped_column(ForeignKey("community_posts.id"), primary_key=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), primary_key=True)
    kind: Mapped[str] = mapped_column(String(16), primary_key=True)


class CommunityComment(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "community_comments"
    __table_args__ = (UniqueConstraint("author_id", "request_id"),)
    post_id: Mapped[UUID] = mapped_column(ForeignKey("community_posts.id"), index=True)
    author_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    request_id: Mapped[UUID] = mapped_column()
    content: Mapped[str] = mapped_column(Text)


class ModerationInput(Input):
    status: Literal["published", "hidden"]
    reason: str = Field(min_length=4, max_length=500)


router = APIRouter(tags=["community"])


async def visible_post(db: AsyncSession, post_id: UUID, user: User):
    post = await db.get(CommunityPost, post_id)
    if not post or (post.status != "published" and user.role != "admin"):
        raise HTTPException(404, "Publicación no disponible")
    return post


@router.put("/community/posts/{post_id}/reactions/{kind}")
async def react(
    post_id: UUID,
    kind: Literal["useful", "saved"],
    enabled: bool = True,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await visible_post(db, post_id, user)
    existing = await db.get(CommunityReaction, (post_id, user.id, kind))
    if enabled and not existing:
        db.add(CommunityReaction(post_id=post_id, user_id=user.id, kind=kind))
    elif not enabled:
        await db.execute(
            delete(CommunityReaction).where(
                CommunityReaction.post_id == post_id,
                CommunityReaction.user_id == user.id,
                CommunityReaction.kind == kind,
            )
        )
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
    return {"enabled": enabled}


@router.get("/community/feed")
async def feed(
    q: str = Query("", max_length=120),
    category: str = "",
    modality: str = "",
    saved: bool = False,
    page: int = Query(1, ge=1),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    filters = [CommunityPost.status == "published"]
    if q:
        filters.append(
            CommunityPost.title.icontains(q, autoescape=True)
            | CommunityPost.content.icontains(q, autoescape=True)
        )
    if category:
        filters.append(CommunityPost.category == category)
    if modality:
        filters.append(CommunityPost.modality == modality)
    if saved:
        filters.append(
            CommunityPost.id.in_(
                select(CommunityReaction.post_id).where(
                    CommunityReaction.user_id == user.id, CommunityReaction.kind == "saved"
                )
            )
        )
    rows = list(
        await db.execute(
            select(CommunityPost, User.full_name)
            .join(User, User.id == CommunityPost.author_id)
            .where(*filters)
            .order_by(CommunityPost.created_at.desc(), CommunityPost.id)
            .offset((page - 1) * 12)
            .limit(12)
        )
    )
    total = await db.scalar(select(func.count()).select_from(CommunityPost).where(*filters))
    ids = [post.id for post, _ in rows]
    counts = dict(
        (
            await db.execute(
                select(CommunityReaction.post_id, func.count())
                .where(CommunityReaction.post_id.in_(ids), CommunityReaction.kind == "useful")
                .group_by(CommunityReaction.post_id)
            )
        ).all()
    )
    own = set(
        (
            await db.execute(
                select(CommunityReaction.post_id, CommunityReaction.kind).where(
                    CommunityReaction.post_id.in_(ids), CommunityReaction.user_id == user.id
                )
            )
        ).all()
    )
    return {
        "total": total,
        "items": [
            {
                "id": p.id,
                "title": p.title,
                "content": p.content,
                "author": author,
                "mine": p.author_id == user.id,
                "category": p.category,
                "modality": p.modality,
                "education_level": p.education_level,
                "curricular_area": p.curricular_area,
                "context": p.context,
                "created_at": p.created_at,
                "useful_count": counts.get(p.id, 0),
                "useful": (p.id, "useful") in own,
                "saved": (p.id, "saved") in own,
            }
            for p, author in rows
        ],
    }


@router.get("/community/posts/{post_id}/comments")
async def comments(
    post_id: UUID,
    page: int = Query(1, ge=1),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await visible_post(db, post_id, user)
    rows = await db.execute(
        select(CommunityComment, User.full_name)
        .join(User, User.id == CommunityComment.author_id)
        .where(CommunityComment.post_id == post_id)
        .order_by(CommunityComment.created_at, CommunityComment.id)
        .offset((page - 1) * 20)
        .limit(20)
    )
    total = await db.scalar(
        select(func.count())
        .select_from(CommunityComment)
        .where(CommunityComment.post_id == post_id)
    )
    return {
        "items": [{"id": c.id, "content": c.content, "author": name} for c, name in rows],
        "total": total,
    }


@router.post("/community/posts/{post_id}/comments", status_code=201)
async def comment(
    post_id: UUID,
    payload: CommentInput,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = await visible_post(db, post_id, user)
    statement = select(CommunityComment).where(
        CommunityComment.author_id == user.id, CommunityComment.request_id == payload.request_id
    )
    item = await db.scalar(statement)
    if item and item.post_id != post_id:
        raise HTTPException(409, "El identificador pertenece a otro comentario")
    if not item:
        item = CommunityComment(post_id=post_id, author_id=user.id, **payload.model_dump())
        db.add(item)
        if post.author_id != user.id:
            db.add(
                Notification(
                    user_id=post.author_id,
                    category="community",
                    message="Un docente comentó tu publicación.",
                    path="/dashboard/comunidad-activa",
                )
            )
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            item = await db.scalar(statement)
            if not item:
                raise
    return {"id": item.id}


@router.patch("/admin/community/{post_id}")
async def moderate(
    post_id: UUID,
    payload: ModerationInput,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(user)
    post = await visible_post(db, post_id, user)
    post.status = payload.status
    audit(db, user, "community.moderated", post.id, payload.reason)
    await db.commit()
    return {"status": post.status}

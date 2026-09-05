"""Persistent utility entities. Existing documents/templates remain their source of truth."""

from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Notification(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "utility_notifications"
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), index=True)
    message: Mapped[str] = mapped_column(String(300))
    path: Mapped[str] = mapped_column(String(300))
    category: Mapped[str] = mapped_column(String(32), index=True)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)


class Idea(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "utility_ideas"
    __table_args__ = (UniqueConstraint("author_id", "request_id"),)
    author_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), index=True)
    request_id: Mapped[UUID] = mapped_column()
    title: Mapped[str] = mapped_column(String(180))
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(40), index=True)
    tool: Mapped[str] = mapped_column(String(180), default="")
    status: Mapped[str] = mapped_column(String(32), default="received", index=True)
    response: Mapped[str] = mapped_column(Text, default="")


class IdeaVote(TimestampMixin, Base):
    __tablename__ = "utility_idea_votes"
    idea_id: Mapped[UUID] = mapped_column(ForeignKey("utility_ideas.id"), primary_key=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), primary_key=True)


class IdeaComment(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "utility_idea_comments"
    __table_args__ = (UniqueConstraint("author_id", "request_id"),)
    idea_id: Mapped[UUID] = mapped_column(ForeignKey("utility_ideas.id"), index=True)
    author_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"))
    request_id: Mapped[UUID] = mapped_column()
    content: Mapped[str] = mapped_column(Text)


class Tutorial(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "utility_tutorials"
    request_id: Mapped[UUID | None] = mapped_column(nullable=True, unique=True)
    title: Mapped[str] = mapped_column(String(180))
    description: Mapped[str] = mapped_column(Text, default="")
    url: Mapped[str] = mapped_column(String(2000))
    category: Mapped[str] = mapped_column(String(80), index=True)
    difficulty: Mapped[str] = mapped_column(String(32), default="inicial")
    tool_path: Mapped[str] = mapped_column(String(240), default="")
    transcript: Mapped[str] = mapped_column(Text, default="")
    published: Mapped[bool] = mapped_column(Boolean, default=False)
    position: Mapped[int] = mapped_column(Integer, default=0)


class TutorialProgress(TimestampMixin, Base):
    __tablename__ = "utility_tutorial_progress"
    tutorial_id: Mapped[UUID] = mapped_column(ForeignKey("utility_tutorials.id"), primary_key=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), primary_key=True)
    seconds: Mapped[int] = mapped_column(Integer, default=0)
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    favorite: Mapped[bool] = mapped_column(Boolean, default=False)

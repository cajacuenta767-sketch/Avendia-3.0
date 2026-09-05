from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.modules.users.model import User


class CommunityPost(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "community_posts"
    __table_args__ = (UniqueConstraint("author_id", "request_id"),)
    request_id: Mapped[UUID | None] = mapped_column(nullable=True)

    author_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    modality: Mapped[str] = mapped_column(String(16), index=True, nullable=False)
    education_level: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    curricular_area: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    context: Mapped[str] = mapped_column(String(24), index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="published", index=True, nullable=False)
    useful_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    author: Mapped["User"] = relationship()

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, ForeignKey, Integer, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.modules.users.model import User


class InstitutionalTemplate(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "institutional_templates"
    trashed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    revision: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    owner_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(240), nullable=False)
    extension: Mapped[str] = mapped_column(String(8), nullable=False)
    mime_type: Mapped[str] = mapped_column(String(120), nullable=False)
    size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    owner: Mapped["User"] = relationship()


class TemplateVersion(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "template_versions"
    template_id: Mapped[UUID] = mapped_column(ForeignKey("institutional_templates.id"), index=True)
    revision: Mapped[int] = mapped_column(Integer)
    name: Mapped[str] = mapped_column(String(240))
    extension: Mapped[str] = mapped_column(String(8))
    mime_type: Mapped[str] = mapped_column(String(120))
    size_bytes: Mapped[int] = mapped_column(Integer)
    content: Mapped[bytes] = mapped_column(LargeBinary)

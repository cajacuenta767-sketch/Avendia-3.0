from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import JSON, Boolean, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.modules.users.model import User


class Document(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "documents"
    revision: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    favorite: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    owner_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(240), nullable=False)
    document_type: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(32), default="draft", nullable=False)
    content: Mapped[str | None] = mapped_column(Text)
    metadata_json: Mapped[dict[str, object]] = mapped_column(JSON, default=dict, nullable=False)

    owner: Mapped["User"] = relationship(back_populates="documents")


class DocumentVersion(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "document_versions"
    __table_args__ = (UniqueConstraint("document_id", "revision"),)
    document_id: Mapped[UUID] = mapped_column(ForeignKey("documents.id"), index=True)
    revision: Mapped[int] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(240))
    content: Mapped[str | None] = mapped_column(Text)
    metadata_json: Mapped[dict[str, object]] = mapped_column(JSON)


class DocumentRelation(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "document_relations"
    __table_args__ = (UniqueConstraint("parent_document_id", "child_document_id", "relation_type"),)

    owner_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    parent_document_id: Mapped[UUID] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"), index=True
    )
    child_document_id: Mapped[UUID] = mapped_column(
        ForeignKey("documents.id", ondelete="CASCADE"), index=True
    )
    relation_type: Mapped[str] = mapped_column(String(32), default="reference", nullable=False)
    source_revision: Mapped[int] = mapped_column(Integer, nullable=False)
    inherited_fields_json: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    context_json: Mapped[dict[str, object]] = mapped_column(JSON, default=dict, nullable=False)
    compatibility_status: Mapped[str] = mapped_column(
        String(32), default="compatible", nullable=False
    )
    consent: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import JSON, Boolean, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.modules.users.model import User


class AIUsageEvent(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "ai_usage_events"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    tool_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    module: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    model: Mapped[str] = mapped_column(String(120), nullable=False)
    credit_cost: Mapped[int] = mapped_column(Integer, nullable=False)
    estimated_tokens: Mapped[int] = mapped_column(Integer, nullable=False)

    user: Mapped["User"] = relationship()


class AIGenerationQualityEvent(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "ai_generation_quality_events"

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    tool_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    module: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    model: Mapped[str] = mapped_column(String(120), nullable=False)
    outcome: Mapped[str] = mapped_column(String(24), index=True, nullable=False)
    quality_status: Mapped[str] = mapped_column(String(24), index=True, nullable=False)
    repair_attempted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    repair_succeeded: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    failed_checks_json: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    credit_charged: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user: Mapped["User"] = relationship()


class AIGenerationRecord(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """Durable, idempotent record for an expensive workflow generation."""

    __tablename__ = "ai_generation_records"
    __table_args__ = (UniqueConstraint("user_id", "request_id"),)

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    request_id: Mapped[str] = mapped_column(String(80), nullable=False)
    request_fingerprint: Mapped[str] = mapped_column(String(64), nullable=False)
    tool_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    module: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    model: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[str] = mapped_column(String(24), index=True, nullable=False)
    result_json: Mapped[dict[str, object] | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    credit_cost: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    estimated_tokens: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    user: Mapped["User"] = relationship()


class AdminAuditLog(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "admin_audit_logs"

    actor_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), index=True, nullable=True
    )
    action: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    target_type: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    target_id: Mapped[str | None] = mapped_column(String(120), index=True, nullable=True)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    detail_json: Mapped[dict[str, object]] = mapped_column(JSON, default=dict, nullable=False)

    actor: Mapped["User | None"] = relationship()


class PlatformSettings(TimestampMixin, Base):
    __tablename__ = "platform_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    registration_open: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    default_ai_credits: Mapped[int] = mapped_column(Integer, default=10_000, nullable=False)
    low_credit_threshold: Mapped[int] = mapped_column(Integer, default=1_000, nullable=False)


class AISuggestionFeedback(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "ai_suggestion_feedback"

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    tool_id: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    field_id: Mapped[str] = mapped_column(String(120), index=True, nullable=False)
    outcome: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    assistance_mode: Mapped[str] = mapped_column(String(24), nullable=False)
    context_fingerprint: Mapped[str] = mapped_column(String(80), nullable=False)
    edited: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

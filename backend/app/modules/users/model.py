from datetime import datetime
from enum import StrEnum

from sqlalchemy import JSON, Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class UserRole(StrEnum):
    TEACHER = "teacher"
    ADMIN = "admin"


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(160), nullable=False)
    dre: Mapped[str] = mapped_column(String(120), nullable=False)
    ugel: Mapped[str] = mapped_column(String(120), nullable=False)
    school_name: Mapped[str] = mapped_column(String(200), nullable=False)
    director_name: Mapped[str] = mapped_column(String(160), nullable=False)
    education_modality: Mapped[str] = mapped_column(String(16), nullable=False)
    education_level: Mapped[str] = mapped_column(String(32), nullable=False)
    grade: Mapped[str] = mapped_column(String(64), nullable=False)
    section: Mapped[str] = mapped_column(String(32), nullable=False)
    curricular_area: Mapped[str] = mapped_column(String(120), nullable=False)
    school_year: Mapped[int] = mapped_column(nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(32), default=UserRole.TEACHER, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)
    subscription_start: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    subscription_end: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    created_by_admin: Mapped[str | None] = mapped_column(String(160), nullable=True)
    updated_by_admin: Mapped[str | None] = mapped_column(String(160), nullable=True)
    ai_credits_balance: Mapped[int] = mapped_column(Integer, default=10_000, nullable=False)
    ai_credits_total: Mapped[int] = mapped_column(Integer, default=10_000, nullable=False)
    ai_tokens_consumed: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    ai_generations: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    assistance_preferences: Mapped[dict[str, object]] = mapped_column(
        JSON, default=dict, nullable=False
    )

    documents: Mapped[list["Document"]] = relationship(back_populates="owner")  # noqa: F821
    calendar_events: Mapped[list["CalendarEvent"]] = relationship(back_populates="owner")  # noqa: F821
    rosters: Mapped[list["Roster"]] = relationship(back_populates="owner")  # noqa: F821
    evaluation_instruments: Mapped[list["EvaluationInstrument"]] = relationship(  # noqa: F821
        back_populates="owner"
    )

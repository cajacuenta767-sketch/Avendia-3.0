from datetime import date, time
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, Date, ForeignKey, String, Text, Time
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.modules.users.model import User


class CalendarEvent(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "calendar_events"

    owner_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    event_date: Mapped[date] = mapped_column(Date, index=True, nullable=False)
    event_time: Mapped[time | None] = mapped_column(Time, nullable=True)
    event_type: Mapped[str] = mapped_column(String(32), default="general", index=True)
    notes: Mapped[str | None] = mapped_column(Text)
    completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    owner: Mapped["User"] = relationship(back_populates="calendar_events")

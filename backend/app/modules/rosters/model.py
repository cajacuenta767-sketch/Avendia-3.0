from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.modules.users.model import User


class Roster(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "rosters"
    __table_args__ = (
        CheckConstraint(
            "school_year BETWEEN 2020 AND 2100",
            name="valid_school_year",
        ),
        CheckConstraint(
            "modality IN ('EBR', 'EBA', 'EBE')",
            name="valid_modality",
        ),
    )

    owner_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    school_year: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    institution_name: Mapped[str] = mapped_column(String(200), nullable=False)
    modality: Mapped[str] = mapped_column(String(16), index=True, nullable=False)
    education_level: Mapped[str] = mapped_column(String(80), index=True, nullable=False)
    grade: Mapped[str] = mapped_column(String(64), nullable=False)
    section: Mapped[str] = mapped_column(String(32), nullable=False)
    name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)

    owner: Mapped["User"] = relationship(back_populates="rosters")
    students: Mapped[list["Student"]] = relationship(
        back_populates="roster",
        cascade="all, delete-orphan",
        order_by="Student.sort_order",
    )


class Student(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "students"
    __table_args__ = (
        CheckConstraint("sort_order >= 0", name="non_negative_sort_order"),
        UniqueConstraint(
            "roster_id",
            "internal_code",
            name="uq_students_roster_internal_code",
        ),
        UniqueConstraint(
            "roster_id",
            "document_number",
            name="uq_students_roster_document_number",
        ),
    )

    roster_id: Mapped[UUID] = mapped_column(
        ForeignKey("rosters.id", ondelete="CASCADE"), index=True, nullable=False
    )
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    internal_code: Mapped[str | None] = mapped_column(String(80), nullable=True)
    document_number: Mapped[str | None] = mapped_column(String(32), nullable=True)
    sex: Mapped[str | None] = mapped_column(String(32), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True, index=True, nullable=False)

    roster: Mapped[Roster] = relationship(back_populates="students")

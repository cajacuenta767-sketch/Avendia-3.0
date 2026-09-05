from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from sqlalchemy import (
    JSON,
    Boolean,
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    LargeBinary,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.modules.rosters.model import Roster, Student
    from app.modules.users.model import User


INSTRUMENT_KINDS = (
    "checklist",
    "rubric",
    "observation",
    "recovery",
    "auxiliary_record",
    "learning_sheet",
    "text_questions",
)


class EvaluationInstrument(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "evaluation_instruments"
    __table_args__ = (
        CheckConstraint(
            "kind IN ('checklist', 'rubric', 'observation', 'recovery', "
            "'auxiliary_record', 'learning_sheet', 'text_questions')",
            name="valid_kind",
        ),
        CheckConstraint(
            "status IN ('draft', 'generated', 'archived')",
            name="valid_status",
        ),
        CheckConstraint("revision >= 0", name="non_negative_revision"),
    )

    owner_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    roster_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("rosters.id", ondelete="RESTRICT"), index=True, nullable=True
    )
    kind: Mapped[str] = mapped_column(String(32), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(240), nullable=False)
    status: Mapped[str] = mapped_column(String(16), default="draft", index=True, nullable=False)
    general_data_json: Mapped[dict[str, object]] = mapped_column(JSON, default=dict, nullable=False)
    settings_json: Mapped[dict[str, object]] = mapped_column(JSON, default=dict, nullable=False)
    general_observation: Mapped[str | None] = mapped_column(Text, nullable=True)
    revision: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    archived_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    owner: Mapped[User] = relationship(back_populates="evaluation_instruments")
    roster: Mapped[Roster | None] = relationship()
    participants: Mapped[list[EvaluationParticipant]] = relationship(
        back_populates="instrument",
        cascade="all, delete-orphan",
        order_by="EvaluationParticipant.sort_order",
        passive_deletes=True,
    )
    criteria: Mapped[list[EvaluationCriterion]] = relationship(
        back_populates="instrument",
        cascade="all, delete-orphan",
        order_by="EvaluationCriterion.sort_order",
        passive_deletes=True,
    )
    records: Mapped[list[EvaluationRecord]] = relationship(
        back_populates="instrument",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    observations: Mapped[list[EvaluationObservation]] = relationship(
        back_populates="instrument",
        cascade="all, delete-orphan",
        order_by="EvaluationObservation.observed_at",
        passive_deletes=True,
    )
    sources: Mapped[list[EvaluationSourceFile]] = relationship(
        back_populates="instrument",
        cascade="all, delete-orphan",
        order_by="EvaluationSourceFile.created_at",
        passive_deletes=True,
    )
    draft: Mapped[EvaluationDraft | None] = relationship(
        back_populates="instrument",
        cascade="all, delete-orphan",
        passive_deletes=True,
        uselist=False,
    )


class EvaluationParticipant(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "evaluation_participants"
    __table_args__ = (
        UniqueConstraint("instrument_id", "student_id", name="uq_eval_participant_student"),
        CheckConstraint("sort_order >= 0", name="non_negative_sort_order"),
        CheckConstraint(
            "role IN ('student', 'team_member', 'group')",
            name="valid_role",
        ),
    )

    instrument_id: Mapped[UUID] = mapped_column(
        ForeignKey("evaluation_instruments.id", ondelete="CASCADE"), index=True, nullable=False
    )
    student_id: Mapped[UUID] = mapped_column(
        ForeignKey("students.id", ondelete="RESTRICT"), index=True, nullable=False
    )
    role: Mapped[str] = mapped_column(String(24), default="student", nullable=False)
    team_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    common_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    individual_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    instrument: Mapped[EvaluationInstrument] = relationship(back_populates="participants")
    student: Mapped[Student] = relationship()
    records: Mapped[list[EvaluationRecord]] = relationship(
        back_populates="participant", passive_deletes=True
    )
    observations: Mapped[list[EvaluationObservation]] = relationship(
        back_populates="participant", passive_deletes=True
    )


class EvaluationCriterion(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "evaluation_criteria"
    __table_args__ = (
        UniqueConstraint("instrument_id", "client_key", name="uq_eval_criterion_client_key"),
        UniqueConstraint("instrument_id", "code", name="uq_eval_criterion_code"),
        CheckConstraint("sort_order >= 0", name="non_negative_sort_order"),
        CheckConstraint("weight IS NULL OR weight >= 0", name="non_negative_weight"),
    )

    instrument_id: Mapped[UUID] = mapped_column(
        ForeignKey("evaluation_instruments.id", ondelete="CASCADE"), index=True, nullable=False
    )
    client_key: Mapped[str] = mapped_column(String(64), nullable=False)
    code: Mapped[str] = mapped_column(String(24), nullable=False)
    title: Mapped[str] = mapped_column(String(240), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    weight: Mapped[float | None] = mapped_column(Float, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    instrument: Mapped[EvaluationInstrument] = relationship(back_populates="criteria")
    levels: Mapped[list[EvaluationLevel]] = relationship(
        back_populates="criterion",
        cascade="all, delete-orphan",
        order_by="EvaluationLevel.sort_order",
        passive_deletes=True,
    )
    records: Mapped[list[EvaluationRecord]] = relationship(
        back_populates="criterion", passive_deletes=True
    )


class EvaluationLevel(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "evaluation_levels"
    __table_args__ = (
        UniqueConstraint("criterion_id", "client_key", name="uq_eval_level_client_key"),
        UniqueConstraint("criterion_id", "code", name="uq_eval_level_code"),
        CheckConstraint("sort_order >= 0", name="non_negative_sort_order"),
    )

    instrument_id: Mapped[UUID] = mapped_column(
        ForeignKey("evaluation_instruments.id", ondelete="CASCADE"), index=True, nullable=False
    )
    criterion_id: Mapped[UUID] = mapped_column(
        ForeignKey("evaluation_criteria.id", ondelete="CASCADE"), index=True, nullable=False
    )
    client_key: Mapped[str] = mapped_column(String(64), nullable=False)
    code: Mapped[str] = mapped_column(String(24), nullable=False)
    label: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    criterion: Mapped[EvaluationCriterion] = relationship(back_populates="levels")


class EvaluationRecord(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "evaluation_records"
    __table_args__ = (
        UniqueConstraint(
            "instrument_id",
            "participant_id",
            "criterion_id",
            name="uq_eval_record_participant_criterion",
        ),
        CheckConstraint(
            "value IS NULL OR value IN ('yes', 'no', 'in_progress')",
            name="valid_value",
        ),
    )

    instrument_id: Mapped[UUID] = mapped_column(
        ForeignKey("evaluation_instruments.id", ondelete="CASCADE"), index=True, nullable=False
    )
    participant_id: Mapped[UUID] = mapped_column(
        ForeignKey("evaluation_participants.id", ondelete="CASCADE"), index=True, nullable=False
    )
    criterion_id: Mapped[UUID] = mapped_column(
        ForeignKey("evaluation_criteria.id", ondelete="CASCADE"), index=True, nullable=False
    )
    level_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("evaluation_levels.id", ondelete="SET NULL"), index=True, nullable=True
    )
    value: Mapped[str | None] = mapped_column(String(24), nullable=True)
    evidence: Mapped[str | None] = mapped_column(Text, nullable=True)
    strength: Mapped[str | None] = mapped_column(Text, nullable=True)
    improvement: Mapped[str | None] = mapped_column(Text, nullable=True)
    recommendation: Mapped[str | None] = mapped_column(Text, nullable=True)
    teacher_decision: Mapped[str | None] = mapped_column(Text, nullable=True)
    observation: Mapped[str | None] = mapped_column(Text, nullable=True)

    instrument: Mapped[EvaluationInstrument] = relationship(back_populates="records")
    participant: Mapped[EvaluationParticipant] = relationship(back_populates="records")
    criterion: Mapped[EvaluationCriterion] = relationship(back_populates="records")
    level: Mapped[EvaluationLevel | None] = relationship()


class EvaluationObservation(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "evaluation_observations"

    instrument_id: Mapped[UUID] = mapped_column(
        ForeignKey("evaluation_instruments.id", ondelete="CASCADE"), index=True, nullable=False
    )
    participant_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("evaluation_participants.id", ondelete="CASCADE"), index=True, nullable=True
    )
    observed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), index=True, nullable=False
    )
    situation: Mapped[str] = mapped_column(Text, nullable=False)
    focus: Mapped[str] = mapped_column(Text, nullable=False)
    objective_facts: Mapped[str] = mapped_column(Text, nullable=False)
    context_factors: Mapped[str | None] = mapped_column(Text, nullable=True)
    interpretation: Mapped[str | None] = mapped_column(Text, nullable=True)
    conclusion: Mapped[str | None] = mapped_column(Text, nullable=True)
    commitments: Mapped[str | None] = mapped_column(Text, nullable=True)
    common_to_group: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    instrument: Mapped[EvaluationInstrument] = relationship(back_populates="observations")
    participant: Mapped[EvaluationParticipant | None] = relationship(back_populates="observations")


class EvaluationSourceFile(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "evaluation_source_files"
    __table_args__ = (
        UniqueConstraint("instrument_id", "sha256", name="uq_eval_source_sha256"),
        CheckConstraint("byte_size > 0", name="positive_byte_size"),
    )

    instrument_id: Mapped[UUID] = mapped_column(
        ForeignKey("evaluation_instruments.id", ondelete="CASCADE"), index=True, nullable=False
    )
    filename: Mapped[str] = mapped_column(String(240), nullable=False)
    media_type: Mapped[str] = mapped_column(String(160), nullable=False)
    extension: Mapped[str] = mapped_column(String(12), nullable=False)
    byte_size: Mapped[int] = mapped_column(Integer, nullable=False)
    sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    extracted_text: Mapped[str] = mapped_column(Text, nullable=False)
    extraction_status: Mapped[str] = mapped_column(String(24), default="completed", nullable=False)
    original_content: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)

    instrument: Mapped[EvaluationInstrument] = relationship(back_populates="sources")


class EvaluationDraft(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "evaluation_drafts"
    __table_args__ = (
        UniqueConstraint("instrument_id", name="uq_evaluation_drafts_instrument_id"),
        CheckConstraint("revision >= 0", name="non_negative_revision"),
    )

    instrument_id: Mapped[UUID] = mapped_column(
        ForeignKey("evaluation_instruments.id", ondelete="CASCADE"), index=True, nullable=False
    )
    owner_id: Mapped[UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False
    )
    revision: Mapped[int] = mapped_column(Integer, nullable=False)
    payload_json: Mapped[dict[str, object]] = mapped_column(JSON, default=dict, nullable=False)

    instrument: Mapped[EvaluationInstrument] = relationship(back_populates="draft")

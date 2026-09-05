"""Add persistent evaluation instruments and source documents."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0008_evaluation_instruments"
down_revision: str | None = "0007_rosters_and_students"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "evaluation_instruments",
        sa.Column("owner_id", sa.Uuid(), nullable=False),
        sa.Column("roster_id", sa.Uuid(), nullable=True),
        sa.Column("kind", sa.String(length=32), nullable=False),
        sa.Column("title", sa.String(length=240), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False),
        sa.Column("general_data_json", sa.JSON(), nullable=False),
        sa.Column("settings_json", sa.JSON(), nullable=False),
        sa.Column("general_observation", sa.Text(), nullable=True),
        sa.Column("revision", sa.Integer(), nullable=False),
        sa.Column("archived_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "kind IN ('checklist', 'rubric', 'observation', 'recovery', "
            "'auxiliary_record', 'learning_sheet', 'text_questions')",
            name=op.f("ck_evaluation_instruments_valid_kind"),
        ),
        sa.CheckConstraint(
            "revision >= 0",
            name=op.f("ck_evaluation_instruments_non_negative_revision"),
        ),
        sa.CheckConstraint(
            "status IN ('draft', 'generated', 'archived')",
            name=op.f("ck_evaluation_instruments_valid_status"),
        ),
        sa.ForeignKeyConstraint(
            ["owner_id"],
            ["users.id"],
            name=op.f("fk_evaluation_instruments_owner_id_users"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["roster_id"],
            ["rosters.id"],
            name=op.f("fk_evaluation_instruments_roster_id_rosters"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_evaluation_instruments")),
    )
    op.create_index(
        op.f("ix_evaluation_instruments_kind"), "evaluation_instruments", ["kind"]
    )
    op.create_index(
        op.f("ix_evaluation_instruments_owner_id"), "evaluation_instruments", ["owner_id"]
    )
    op.create_index(
        op.f("ix_evaluation_instruments_roster_id"), "evaluation_instruments", ["roster_id"]
    )
    op.create_index(
        op.f("ix_evaluation_instruments_status"), "evaluation_instruments", ["status"]
    )

    op.create_table(
        "evaluation_participants",
        sa.Column("instrument_id", sa.Uuid(), nullable=False),
        sa.Column("student_id", sa.Uuid(), nullable=False),
        sa.Column("role", sa.String(length=24), nullable=False),
        sa.Column("team_name", sa.String(length=120), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("common_notes", sa.Text(), nullable=True),
        sa.Column("individual_notes", sa.Text(), nullable=True),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "role IN ('student', 'team_member', 'group')",
            name=op.f("ck_evaluation_participants_valid_role"),
        ),
        sa.CheckConstraint(
            "sort_order >= 0",
            name=op.f("ck_evaluation_participants_non_negative_sort_order"),
        ),
        sa.ForeignKeyConstraint(
            ["instrument_id"],
            ["evaluation_instruments.id"],
            name=op.f("fk_evaluation_participants_instrument_id_evaluation_instruments"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["student_id"],
            ["students.id"],
            name=op.f("fk_evaluation_participants_student_id_students"),
            ondelete="RESTRICT",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_evaluation_participants")),
        sa.UniqueConstraint(
            "instrument_id",
            "student_id",
            name=op.f("uq_eval_participant_student"),
        ),
    )
    op.create_index(
        op.f("ix_evaluation_participants_instrument_id"),
        "evaluation_participants",
        ["instrument_id"],
    )
    op.create_index(
        op.f("ix_evaluation_participants_student_id"),
        "evaluation_participants",
        ["student_id"],
    )

    op.create_table(
        "evaluation_criteria",
        sa.Column("instrument_id", sa.Uuid(), nullable=False),
        sa.Column("client_key", sa.String(length=64), nullable=False),
        sa.Column("code", sa.String(length=24), nullable=False),
        sa.Column("title", sa.String(length=240), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("weight", sa.Float(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "sort_order >= 0",
            name=op.f("ck_evaluation_criteria_non_negative_sort_order"),
        ),
        sa.CheckConstraint(
            "weight IS NULL OR weight >= 0",
            name=op.f("ck_evaluation_criteria_non_negative_weight"),
        ),
        sa.ForeignKeyConstraint(
            ["instrument_id"],
            ["evaluation_instruments.id"],
            name=op.f("fk_evaluation_criteria_instrument_id_evaluation_instruments"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_evaluation_criteria")),
        sa.UniqueConstraint(
            "instrument_id", "client_key", name=op.f("uq_eval_criterion_client_key")
        ),
        sa.UniqueConstraint(
            "instrument_id", "code", name=op.f("uq_eval_criterion_code")
        ),
    )
    op.create_index(
        op.f("ix_evaluation_criteria_instrument_id"),
        "evaluation_criteria",
        ["instrument_id"],
    )

    op.create_table(
        "evaluation_levels",
        sa.Column("instrument_id", sa.Uuid(), nullable=False),
        sa.Column("criterion_id", sa.Uuid(), nullable=False),
        sa.Column("client_key", sa.String(length=64), nullable=False),
        sa.Column("code", sa.String(length=24), nullable=False),
        sa.Column("label", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("score", sa.Float(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "sort_order >= 0",
            name=op.f("ck_evaluation_levels_non_negative_sort_order"),
        ),
        sa.ForeignKeyConstraint(
            ["criterion_id"],
            ["evaluation_criteria.id"],
            name=op.f("fk_evaluation_levels_criterion_id_evaluation_criteria"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["instrument_id"],
            ["evaluation_instruments.id"],
            name=op.f("fk_evaluation_levels_instrument_id_evaluation_instruments"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_evaluation_levels")),
        sa.UniqueConstraint(
            "criterion_id", "client_key", name=op.f("uq_eval_level_client_key")
        ),
        sa.UniqueConstraint("criterion_id", "code", name=op.f("uq_eval_level_code")),
    )
    op.create_index(
        op.f("ix_evaluation_levels_criterion_id"),
        "evaluation_levels",
        ["criterion_id"],
    )
    op.create_index(
        op.f("ix_evaluation_levels_instrument_id"),
        "evaluation_levels",
        ["instrument_id"],
    )

    op.create_table(
        "evaluation_records",
        sa.Column("instrument_id", sa.Uuid(), nullable=False),
        sa.Column("participant_id", sa.Uuid(), nullable=False),
        sa.Column("criterion_id", sa.Uuid(), nullable=False),
        sa.Column("level_id", sa.Uuid(), nullable=True),
        sa.Column("value", sa.String(length=24), nullable=True),
        sa.Column("evidence", sa.Text(), nullable=True),
        sa.Column("strength", sa.Text(), nullable=True),
        sa.Column("improvement", sa.Text(), nullable=True),
        sa.Column("recommendation", sa.Text(), nullable=True),
        sa.Column("teacher_decision", sa.Text(), nullable=True),
        sa.Column("observation", sa.Text(), nullable=True),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "value IS NULL OR value IN ('yes', 'no', 'in_progress')",
            name=op.f("ck_evaluation_records_valid_value"),
        ),
        sa.ForeignKeyConstraint(
            ["criterion_id"],
            ["evaluation_criteria.id"],
            name=op.f("fk_evaluation_records_criterion_id_evaluation_criteria"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["instrument_id"],
            ["evaluation_instruments.id"],
            name=op.f("fk_evaluation_records_instrument_id_evaluation_instruments"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["level_id"],
            ["evaluation_levels.id"],
            name=op.f("fk_evaluation_records_level_id_evaluation_levels"),
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["participant_id"],
            ["evaluation_participants.id"],
            name=op.f("fk_evaluation_records_participant_id_evaluation_participants"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_evaluation_records")),
        sa.UniqueConstraint(
            "instrument_id",
            "participant_id",
            "criterion_id",
            name=op.f("uq_eval_record_participant_criterion"),
        ),
    )
    op.create_index(
        op.f("ix_evaluation_records_criterion_id"),
        "evaluation_records",
        ["criterion_id"],
    )
    op.create_index(
        op.f("ix_evaluation_records_instrument_id"),
        "evaluation_records",
        ["instrument_id"],
    )
    op.create_index(
        op.f("ix_evaluation_records_level_id"), "evaluation_records", ["level_id"]
    )
    op.create_index(
        op.f("ix_evaluation_records_participant_id"),
        "evaluation_records",
        ["participant_id"],
    )

    op.create_table(
        "evaluation_observations",
        sa.Column("instrument_id", sa.Uuid(), nullable=False),
        sa.Column("participant_id", sa.Uuid(), nullable=True),
        sa.Column("observed_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("situation", sa.Text(), nullable=False),
        sa.Column("focus", sa.Text(), nullable=False),
        sa.Column("objective_facts", sa.Text(), nullable=False),
        sa.Column("context_factors", sa.Text(), nullable=True),
        sa.Column("interpretation", sa.Text(), nullable=True),
        sa.Column("conclusion", sa.Text(), nullable=True),
        sa.Column("commitments", sa.Text(), nullable=True),
        sa.Column("common_to_group", sa.Boolean(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["instrument_id"],
            ["evaluation_instruments.id"],
            name=op.f("fk_evaluation_observations_instrument_id_evaluation_instruments"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["participant_id"],
            ["evaluation_participants.id"],
            name=op.f("fk_evaluation_observations_participant_id_evaluation_participants"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_evaluation_observations")),
    )
    op.create_index(
        op.f("ix_evaluation_observations_instrument_id"),
        "evaluation_observations",
        ["instrument_id"],
    )
    op.create_index(
        op.f("ix_evaluation_observations_observed_at"),
        "evaluation_observations",
        ["observed_at"],
    )
    op.create_index(
        op.f("ix_evaluation_observations_participant_id"),
        "evaluation_observations",
        ["participant_id"],
    )

    op.create_table(
        "evaluation_source_files",
        sa.Column("instrument_id", sa.Uuid(), nullable=False),
        sa.Column("filename", sa.String(length=240), nullable=False),
        sa.Column("media_type", sa.String(length=160), nullable=False),
        sa.Column("extension", sa.String(length=12), nullable=False),
        sa.Column("byte_size", sa.Integer(), nullable=False),
        sa.Column("sha256", sa.String(length=64), nullable=False),
        sa.Column("extracted_text", sa.Text(), nullable=False),
        sa.Column("extraction_status", sa.String(length=24), nullable=False),
        sa.Column("original_content", sa.LargeBinary(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "byte_size > 0",
            name=op.f("ck_evaluation_source_files_positive_byte_size"),
        ),
        sa.ForeignKeyConstraint(
            ["instrument_id"],
            ["evaluation_instruments.id"],
            name=op.f("fk_evaluation_source_files_instrument_id_evaluation_instruments"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_evaluation_source_files")),
        sa.UniqueConstraint(
            "instrument_id", "sha256", name=op.f("uq_eval_source_sha256")
        ),
    )
    op.create_index(
        op.f("ix_evaluation_source_files_instrument_id"),
        "evaluation_source_files",
        ["instrument_id"],
    )

    op.create_table(
        "evaluation_drafts",
        sa.Column("instrument_id", sa.Uuid(), nullable=False),
        sa.Column("owner_id", sa.Uuid(), nullable=False),
        sa.Column("revision", sa.Integer(), nullable=False),
        sa.Column("payload_json", sa.JSON(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "revision >= 0", name=op.f("ck_evaluation_drafts_non_negative_revision")
        ),
        sa.ForeignKeyConstraint(
            ["instrument_id"],
            ["evaluation_instruments.id"],
            name=op.f("fk_evaluation_drafts_instrument_id_evaluation_instruments"),
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["owner_id"],
            ["users.id"],
            name=op.f("fk_evaluation_drafts_owner_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_evaluation_drafts")),
        sa.UniqueConstraint(
            "instrument_id", name=op.f("uq_evaluation_drafts_instrument_id")
        ),
    )
    op.create_index(
        op.f("ix_evaluation_drafts_instrument_id"),
        "evaluation_drafts",
        ["instrument_id"],
    )
    op.create_index(
        op.f("ix_evaluation_drafts_owner_id"), "evaluation_drafts", ["owner_id"]
    )


def downgrade() -> None:
    op.drop_table("evaluation_drafts")
    op.drop_table("evaluation_source_files")
    op.drop_table("evaluation_observations")
    op.drop_table("evaluation_records")
    op.drop_table("evaluation_levels")
    op.drop_table("evaluation_criteria")
    op.drop_table("evaluation_participants")
    op.drop_table("evaluation_instruments")

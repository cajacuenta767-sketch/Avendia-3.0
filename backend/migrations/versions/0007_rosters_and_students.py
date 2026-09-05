"""Add central student rosters and students."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0007_rosters_and_students"
down_revision: str | None = "0006_password_resets_and_templates"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "rosters",
        sa.Column("owner_id", sa.Uuid(), nullable=False),
        sa.Column("school_year", sa.Integer(), nullable=False),
        sa.Column("institution_name", sa.String(length=200), nullable=False),
        sa.Column("modality", sa.String(length=16), nullable=False),
        sa.Column("education_level", sa.String(length=80), nullable=False),
        sa.Column("grade", sa.String(length=64), nullable=False),
        sa.Column("section", sa.String(length=32), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=True),
        sa.Column("active", sa.Boolean(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "modality IN ('EBR', 'EBA', 'EBE')",
            name=op.f("ck_rosters_valid_modality"),
        ),
        sa.CheckConstraint(
            "school_year BETWEEN 2020 AND 2100",
            name=op.f("ck_rosters_valid_school_year"),
        ),
        sa.ForeignKeyConstraint(
            ["owner_id"],
            ["users.id"],
            name=op.f("fk_rosters_owner_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_rosters")),
    )
    op.create_index(op.f("ix_rosters_active"), "rosters", ["active"])
    op.create_index(op.f("ix_rosters_education_level"), "rosters", ["education_level"])
    op.create_index(op.f("ix_rosters_modality"), "rosters", ["modality"])
    op.create_index(op.f("ix_rosters_owner_id"), "rosters", ["owner_id"])
    op.create_index(op.f("ix_rosters_school_year"), "rosters", ["school_year"])

    op.create_table(
        "students",
        sa.Column("roster_id", sa.Uuid(), nullable=False),
        sa.Column("full_name", sa.String(length=200), nullable=False),
        sa.Column("internal_code", sa.String(length=80), nullable=True),
        sa.Column("document_number", sa.String(length=32), nullable=True),
        sa.Column("sex", sa.String(length=32), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("active", sa.Boolean(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint(
            "sort_order >= 0",
            name=op.f("ck_students_non_negative_sort_order"),
        ),
        sa.ForeignKeyConstraint(
            ["roster_id"],
            ["rosters.id"],
            name=op.f("fk_students_roster_id_rosters"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_students")),
        sa.UniqueConstraint(
            "roster_id",
            "document_number",
            name=op.f("uq_students_roster_document_number"),
        ),
        sa.UniqueConstraint(
            "roster_id",
            "internal_code",
            name=op.f("uq_students_roster_internal_code"),
        ),
    )
    op.create_index(op.f("ix_students_active"), "students", ["active"])
    op.create_index(op.f("ix_students_roster_id"), "students", ["roster_id"])


def downgrade() -> None:
    op.drop_table("students")
    op.drop_table("rosters")

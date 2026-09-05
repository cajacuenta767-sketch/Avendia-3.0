"""Add the required institutional profile to users."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0003_required_institutional_profile"
down_revision: str | None = "0002_calendar_events"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("dre", sa.String(length=120), nullable=False, server_default="Sin registrar"),
    )
    op.add_column(
        "users",
        sa.Column("ugel", sa.String(length=120), nullable=False, server_default="Sin registrar"),
    )
    op.add_column(
        "users",
        sa.Column(
            "school_name", sa.String(length=200), nullable=False, server_default="Sin registrar"
        ),
    )
    op.add_column(
        "users",
        sa.Column(
            "director_name", sa.String(length=160), nullable=False, server_default="Sin registrar"
        ),
    )
    op.add_column(
        "users",
        sa.Column("education_modality", sa.String(length=16), nullable=False, server_default="EBR"),
    )
    op.add_column(
        "users",
        sa.Column(
            "education_level", sa.String(length=32), nullable=False, server_default="Primaria"
        ),
    )
    op.add_column(
        "users", sa.Column("grade", sa.String(length=64), nullable=False, server_default="1°")
    )
    op.add_column(
        "users", sa.Column("section", sa.String(length=32), nullable=False, server_default="A")
    )
    op.add_column(
        "users",
        sa.Column(
            "curricular_area", sa.String(length=120), nullable=False, server_default="General"
        ),
    )
    op.add_column(
        "users", sa.Column("school_year", sa.Integer(), nullable=False, server_default="2026")
    )


def downgrade() -> None:
    for column in (
        "school_year",
        "curricular_area",
        "section",
        "grade",
        "education_level",
        "education_modality",
        "director_name",
        "school_name",
        "ugel",
        "dre",
    ):
        op.drop_column("users", column)

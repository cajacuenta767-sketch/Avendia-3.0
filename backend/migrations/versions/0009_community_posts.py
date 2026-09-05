"""Add persistent community posts."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0009_community_posts"
down_revision: str | None = "0008_evaluation_instruments"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "community_posts",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("author_id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=32), nullable=False),
        sa.Column("modality", sa.String(length=16), nullable=False),
        sa.Column("education_level", sa.String(length=32), nullable=False),
        sa.Column("curricular_area", sa.String(length=120), nullable=False),
        sa.Column("context", sa.String(length=24), nullable=False),
        sa.Column("status", sa.String(length=16), nullable=False, server_default="published"),
        sa.Column("useful_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    indexed_columns = (
        "author_id",
        "category",
        "modality",
        "education_level",
        "curricular_area",
        "context",
        "status",
    )
    for column in indexed_columns:
        op.create_index(
            op.f(f"ix_community_posts_{column}"), "community_posts", [column], unique=False
        )


def downgrade() -> None:
    indexed_columns = (
        "status",
        "context",
        "curricular_area",
        "education_level",
        "modality",
        "category",
        "author_id",
    )
    for column in indexed_columns:
        op.drop_index(op.f(f"ix_community_posts_{column}"), table_name="community_posts")
    op.drop_table("community_posts")

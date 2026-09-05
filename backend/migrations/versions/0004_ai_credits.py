"""Add Gemini credit and usage counters to users."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0004_ai_credits"
down_revision: str | None = "0003_required_institutional_profile"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "ai_credits_balance", sa.Integer(), nullable=False, server_default="10000"
        ),
    )
    op.add_column(
        "users", sa.Column("ai_credits_total", sa.Integer(), nullable=False, server_default="10000")
    )
    op.add_column(
        "users", sa.Column("ai_tokens_consumed", sa.Integer(), nullable=False, server_default="0")
    )
    op.add_column(
        "users", sa.Column("ai_generations", sa.Integer(), nullable=False, server_default="0")
    )


def downgrade() -> None:
    for column in (
        "ai_generations",
        "ai_tokens_consumed",
        "ai_credits_total",
        "ai_credits_balance",
    ):
        op.drop_column("users", column)

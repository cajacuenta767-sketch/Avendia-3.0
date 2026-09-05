"""Persist idempotent workflow generations."""

import sqlalchemy as sa
from alembic import op

revision = "0019_ai_generation_records"
down_revision = "0018_ai_generation_quality"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "ai_generation_records",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("request_id", sa.String(length=80), nullable=False),
        sa.Column("request_fingerprint", sa.String(length=64), nullable=False),
        sa.Column("tool_id", sa.String(length=100), nullable=False),
        sa.Column("module", sa.String(length=80), nullable=False),
        sa.Column("model", sa.String(length=120), nullable=False),
        sa.Column("status", sa.String(length=24), nullable=False),
        sa.Column("result_json", sa.JSON(), nullable=True),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("credit_cost", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("estimated_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "request_id"),
    )
    op.create_index("ix_ai_generation_records_user_id", "ai_generation_records", ["user_id"])
    op.create_index("ix_ai_generation_records_tool_id", "ai_generation_records", ["tool_id"])
    op.create_index("ix_ai_generation_records_module", "ai_generation_records", ["module"])
    op.create_index("ix_ai_generation_records_status", "ai_generation_records", ["status"])


def downgrade():
    op.drop_index("ix_ai_generation_records_status", table_name="ai_generation_records")
    op.drop_index("ix_ai_generation_records_module", table_name="ai_generation_records")
    op.drop_index("ix_ai_generation_records_tool_id", table_name="ai_generation_records")
    op.drop_index("ix_ai_generation_records_user_id", table_name="ai_generation_records")
    op.drop_table("ai_generation_records")

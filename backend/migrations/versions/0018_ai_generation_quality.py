"""Track semantic generation quality and automatic repair outcomes."""

import sqlalchemy as sa
from alembic import op

revision = "0018_ai_generation_quality"
down_revision = "0017_document_relations"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "ai_generation_quality_events",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("tool_id", sa.String(length=100), nullable=False),
        sa.Column("module", sa.String(length=80), nullable=False),
        sa.Column("model", sa.String(length=120), nullable=False),
        sa.Column("outcome", sa.String(length=24), nullable=False),
        sa.Column("quality_status", sa.String(length=24), nullable=False),
        sa.Column("repair_attempted", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("repair_succeeded", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("failed_checks_json", sa.JSON(), nullable=False, server_default="[]"),
        sa.Column("credit_charged", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_ai_generation_quality_events_user_id", "ai_generation_quality_events", ["user_id"]
    )
    op.create_index(
        "ix_ai_generation_quality_events_tool_id", "ai_generation_quality_events", ["tool_id"]
    )
    op.create_index(
        "ix_ai_generation_quality_events_module", "ai_generation_quality_events", ["module"]
    )
    op.create_index(
        "ix_ai_generation_quality_events_outcome", "ai_generation_quality_events", ["outcome"]
    )
    op.create_index(
        "ix_ai_generation_quality_events_quality_status",
        "ai_generation_quality_events",
        ["quality_status"],
    )


def downgrade():
    op.drop_index(
        "ix_ai_generation_quality_events_quality_status",
        table_name="ai_generation_quality_events",
    )
    op.drop_index(
        "ix_ai_generation_quality_events_outcome", table_name="ai_generation_quality_events"
    )
    op.drop_index(
        "ix_ai_generation_quality_events_module", table_name="ai_generation_quality_events"
    )
    op.drop_index(
        "ix_ai_generation_quality_events_tool_id", table_name="ai_generation_quality_events"
    )
    op.drop_index(
        "ix_ai_generation_quality_events_user_id", table_name="ai_generation_quality_events"
    )
    op.drop_table("ai_generation_quality_events")

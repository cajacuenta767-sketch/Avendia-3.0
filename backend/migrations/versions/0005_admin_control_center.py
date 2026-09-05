"""Add administrative audit, AI usage history and platform settings."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0005_admin_control_center"
down_revision: str | None = "0004_ai_credits"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "ai_usage_events",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("tool_id", sa.String(length=100), nullable=False),
        sa.Column("module", sa.String(length=80), nullable=False),
        sa.Column("model", sa.String(length=120), nullable=False),
        sa.Column("credit_cost", sa.Integer(), nullable=False),
        sa.Column("estimated_tokens", sa.Integer(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_ai_usage_events_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_ai_usage_events")),
    )
    op.create_index(op.f("ix_ai_usage_events_user_id"), "ai_usage_events", ["user_id"])
    op.create_index(op.f("ix_ai_usage_events_tool_id"), "ai_usage_events", ["tool_id"])
    op.create_index(op.f("ix_ai_usage_events_module"), "ai_usage_events", ["module"])

    op.create_table(
        "admin_audit_logs",
        sa.Column("actor_id", sa.Uuid(), nullable=True),
        sa.Column("action", sa.String(length=80), nullable=False),
        sa.Column("target_type", sa.String(length=80), nullable=False),
        sa.Column("target_id", sa.String(length=120), nullable=True),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("detail_json", sa.JSON(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["actor_id"],
            ["users.id"],
            name=op.f("fk_admin_audit_logs_actor_id_users"),
            ondelete="SET NULL",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_admin_audit_logs")),
    )
    op.create_index(op.f("ix_admin_audit_logs_actor_id"), "admin_audit_logs", ["actor_id"])
    op.create_index(op.f("ix_admin_audit_logs_action"), "admin_audit_logs", ["action"])
    op.create_index(
        op.f("ix_admin_audit_logs_target_type"), "admin_audit_logs", ["target_type"]
    )
    op.create_index(
        op.f("ix_admin_audit_logs_target_id"), "admin_audit_logs", ["target_id"]
    )

    op.create_table(
        "platform_settings",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("registration_open", sa.Boolean(), nullable=False),
        sa.Column("default_ai_credits", sa.Integer(), nullable=False),
        sa.Column("low_credit_threshold", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_platform_settings")),
    )


def downgrade() -> None:
    op.drop_table("platform_settings")
    op.drop_table("admin_audit_logs")
    op.drop_table("ai_usage_events")

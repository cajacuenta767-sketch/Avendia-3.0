"""Add password recovery challenges and institutional templates."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0006_password_resets_and_templates"
down_revision: str | None = "0005_admin_control_center"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "password_reset_challenges",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("code_hash", sa.String(length=64), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("attempt_count", sa.Integer(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.id"],
            name=op.f("fk_password_reset_challenges_user_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_password_reset_challenges")),
    )
    op.create_index(
        op.f("ix_password_reset_challenges_user_id"),
        "password_reset_challenges",
        ["user_id"],
    )
    op.create_index(
        op.f("ix_password_reset_challenges_expires_at"),
        "password_reset_challenges",
        ["expires_at"],
    )

    op.create_table(
        "institutional_templates",
        sa.Column("owner_id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=240), nullable=False),
        sa.Column("extension", sa.String(length=8), nullable=False),
        sa.Column("mime_type", sa.String(length=120), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("content", sa.LargeBinary(), nullable=False),
        sa.Column("is_default", sa.Boolean(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["owner_id"],
            ["users.id"],
            name=op.f("fk_institutional_templates_owner_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_institutional_templates")),
    )
    op.create_index(
        op.f("ix_institutional_templates_owner_id"),
        "institutional_templates",
        ["owner_id"],
    )


def downgrade() -> None:
    op.drop_table("institutional_templates")
    op.drop_table("password_reset_challenges")

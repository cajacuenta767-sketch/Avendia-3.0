"""Recoverable institutional formats and binary versions."""

import sqlalchemy as sa
from alembic import op

revision = "0015_template_versions"
down_revision = "0014_template_details"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "institutional_templates",
        sa.Column("revision", sa.Integer(), nullable=False, server_default="1"),
    )
    op.add_column(
        "institutional_templates",
        sa.Column("trashed", sa.Boolean(), nullable=False, server_default=sa.false()),
    )
    op.create_table(
        "template_versions",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "template_id", sa.Uuid(), sa.ForeignKey("institutional_templates.id"), nullable=False
        ),
        sa.Column("revision", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(240), nullable=False),
        sa.Column("extension", sa.String(8), nullable=False),
        sa.Column("mime_type", sa.String(120), nullable=False),
        sa.Column("size_bytes", sa.Integer(), nullable=False),
        sa.Column("content", sa.LargeBinary(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_template_versions_template_id", "template_versions", ["template_id"])


def downgrade():
    op.drop_table("template_versions")
    op.drop_column("institutional_templates", "trashed")
    op.drop_column("institutional_templates", "revision")

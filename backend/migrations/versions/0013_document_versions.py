"""Recoverable documents and version history."""

import sqlalchemy as sa
from alembic import op

revision = "0013_document_versions"
down_revision = "0012_community_interactions"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "documents", sa.Column("revision", sa.Integer(), nullable=False, server_default="1")
    )
    op.add_column(
        "documents", sa.Column("favorite", sa.Boolean(), nullable=False, server_default=sa.false())
    )
    op.create_table(
        "document_versions",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("document_id", sa.Uuid(), sa.ForeignKey("documents.id"), nullable=False),
        sa.Column("revision", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(240), nullable=False),
        sa.Column("content", sa.Text(), nullable=True),
        sa.Column("metadata_json", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("document_id", "revision"),
    )
    op.create_index("ix_document_versions_document_id", "document_versions", ["document_id"])


def downgrade():
    op.drop_table("document_versions")
    op.drop_column("documents", "favorite")
    op.drop_column("documents", "revision")

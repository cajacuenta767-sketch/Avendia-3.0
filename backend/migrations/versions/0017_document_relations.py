"""Persistent pedagogical document relations."""

import sqlalchemy as sa
from alembic import op

revision = "0017_document_relations"
down_revision = "0016_publication_requests"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "users", sa.Column("assistance_preferences", sa.JSON(), nullable=False, server_default="{}")
    )
    op.create_table(
        "document_relations",
        sa.Column("owner_id", sa.Uuid(), nullable=False),
        sa.Column("parent_document_id", sa.Uuid(), nullable=False),
        sa.Column("child_document_id", sa.Uuid(), nullable=False),
        sa.Column("relation_type", sa.String(length=32), nullable=False),
        sa.Column("source_revision", sa.Integer(), nullable=False),
        sa.Column("inherited_fields_json", sa.JSON(), nullable=False),
        sa.Column("context_json", sa.JSON(), nullable=False),
        sa.Column("compatibility_status", sa.String(length=32), nullable=False),
        sa.Column("consent", sa.Boolean(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["owner_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["parent_document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["child_document_id"], ["documents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("parent_document_id", "child_document_id", "relation_type"),
    )
    op.create_index("ix_document_relations_owner_id", "document_relations", ["owner_id"])
    op.create_index(
        "ix_document_relations_parent_document_id", "document_relations", ["parent_document_id"]
    )
    op.create_index(
        "ix_document_relations_child_document_id", "document_relations", ["child_document_id"]
    )
    op.create_table(
        "ai_suggestion_feedback",
        sa.Column("user_id", sa.Uuid(), nullable=False),
        sa.Column("tool_id", sa.String(length=100), nullable=False),
        sa.Column("field_id", sa.String(length=120), nullable=False),
        sa.Column("outcome", sa.String(length=32), nullable=False),
        sa.Column("assistance_mode", sa.String(length=24), nullable=False),
        sa.Column("context_fingerprint", sa.String(length=80), nullable=False),
        sa.Column("edited", sa.Boolean(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ai_suggestion_feedback_user_id", "ai_suggestion_feedback", ["user_id"])
    op.create_index("ix_ai_suggestion_feedback_tool_id", "ai_suggestion_feedback", ["tool_id"])
    op.create_index("ix_ai_suggestion_feedback_field_id", "ai_suggestion_feedback", ["field_id"])
    op.create_index("ix_ai_suggestion_feedback_outcome", "ai_suggestion_feedback", ["outcome"])


def downgrade():
    op.drop_index("ix_ai_suggestion_feedback_outcome", table_name="ai_suggestion_feedback")
    op.drop_index("ix_ai_suggestion_feedback_field_id", table_name="ai_suggestion_feedback")
    op.drop_index("ix_ai_suggestion_feedback_tool_id", table_name="ai_suggestion_feedback")
    op.drop_index("ix_ai_suggestion_feedback_user_id", table_name="ai_suggestion_feedback")
    op.drop_table("ai_suggestion_feedback")
    op.drop_index("ix_document_relations_child_document_id", table_name="document_relations")
    op.drop_index("ix_document_relations_parent_document_id", table_name="document_relations")
    op.drop_index("ix_document_relations_owner_id", table_name="document_relations")
    op.drop_table("document_relations")
    op.drop_column("users", "assistance_preferences")

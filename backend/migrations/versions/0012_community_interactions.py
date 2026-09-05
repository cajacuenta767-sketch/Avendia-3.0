"""Unique community reactions and comments."""

import sqlalchemy as sa
from alembic import op

revision = "0012_community_interactions"
down_revision = "0011_referrals"
branch_labels = None
depends_on = None


def timestamps():
    return [
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    ]


def upgrade():
    op.create_table(
        "community_reactions",
        sa.Column("post_id", sa.Uuid(), sa.ForeignKey("community_posts.id"), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), primary_key=True),
        sa.Column("kind", sa.String(16), primary_key=True),
        *timestamps(),
    )
    op.create_table(
        "community_comments",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("post_id", sa.Uuid(), sa.ForeignKey("community_posts.id"), nullable=False),
        sa.Column("author_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("request_id", sa.Uuid(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        *timestamps(),
        sa.UniqueConstraint("author_id", "request_id"),
    )
    op.create_index("ix_community_comments_post_id", "community_comments", ["post_id"])


def downgrade():
    op.drop_table("community_comments")
    op.drop_table("community_reactions")

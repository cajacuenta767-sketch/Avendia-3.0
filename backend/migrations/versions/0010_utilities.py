"""Persistent ideas, notifications and tutorials."""

import sqlalchemy as sa
from alembic import op

revision = "0010_utilities"
down_revision = "c7f0686049e8"
branch_labels = None
depends_on = None


def timestamps():
    return [
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    ]


def user_column(name="user_id", primary=False):
    return sa.Column(
        name, sa.Uuid(), sa.ForeignKey("users.id"), nullable=False, primary_key=primary
    )


def upgrade():
    op.create_table(
        "utility_notifications",
        sa.Column("id", sa.Uuid(), primary_key=True),
        user_column(),
        sa.Column("message", sa.String(300), nullable=False),
        sa.Column("path", sa.String(300), nullable=False),
        sa.Column("category", sa.String(32), nullable=False),
        sa.Column("is_read", sa.Boolean(), nullable=False),
        *timestamps(),
    )
    op.create_table(
        "utility_ideas",
        sa.Column("id", sa.Uuid(), primary_key=True),
        user_column("author_id"),
        sa.Column("request_id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(180), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(40), nullable=False),
        sa.Column("tool", sa.String(180), nullable=False),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("response", sa.Text(), nullable=False),
        *timestamps(),
        sa.UniqueConstraint("author_id", "request_id"),
    )
    op.create_table(
        "utility_idea_votes",
        sa.Column("idea_id", sa.Uuid(), sa.ForeignKey("utility_ideas.id"), primary_key=True),
        user_column(primary=True),
        *timestamps(),
    )
    op.create_table(
        "utility_idea_comments",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("idea_id", sa.Uuid(), sa.ForeignKey("utility_ideas.id"), nullable=False),
        user_column("author_id"),
        sa.Column("request_id", sa.Uuid(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        *timestamps(),
        sa.UniqueConstraint("author_id", "request_id"),
    )
    op.create_table(
        "utility_tutorials",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("title", sa.String(180), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("url", sa.String(2000), nullable=False),
        sa.Column("category", sa.String(80), nullable=False),
        sa.Column("difficulty", sa.String(32), nullable=False),
        sa.Column("tool_path", sa.String(240), nullable=False),
        sa.Column("transcript", sa.Text(), nullable=False),
        sa.Column("published", sa.Boolean(), nullable=False),
        sa.Column("position", sa.Integer(), nullable=False),
        *timestamps(),
    )
    op.create_table(
        "utility_tutorial_progress",
        sa.Column(
            "tutorial_id", sa.Uuid(), sa.ForeignKey("utility_tutorials.id"), primary_key=True
        ),
        user_column(primary=True),
        sa.Column("seconds", sa.Integer(), nullable=False),
        sa.Column("completed", sa.Boolean(), nullable=False),
        sa.Column("favorite", sa.Boolean(), nullable=False),
        *timestamps(),
    )
    for table, columns in {
        "utility_notifications": ["user_id", "category"],
        "utility_ideas": ["author_id", "category", "status"],
        "utility_idea_comments": ["idea_id"],
        "utility_tutorials": ["category"],
    }.items():
        for column in columns:
            op.create_index(f"ix_{table}_{column}", table, [column])


def downgrade():
    for table in [
        "utility_tutorial_progress",
        "utility_tutorials",
        "utility_idea_comments",
        "utility_idea_votes",
        "utility_ideas",
        "utility_notifications",
    ]:
        op.drop_table(table)

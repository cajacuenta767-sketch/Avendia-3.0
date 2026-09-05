"""Idempotent community and tutorial publication requests."""

import sqlalchemy as sa
from alembic import op

revision = "0016_publication_requests"
down_revision = "0015_template_versions"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column("community_posts", sa.Column("request_id", sa.Uuid(), nullable=True))
    op.create_index(
        "uq_community_posts_request", "community_posts", ["author_id", "request_id"], unique=True
    )
    op.add_column("utility_tutorials", sa.Column("request_id", sa.Uuid(), nullable=True))
    op.create_index(
        "uq_utility_tutorials_request", "utility_tutorials", ["request_id"], unique=True
    )


def downgrade():
    op.drop_index("uq_utility_tutorials_request", "utility_tutorials")
    op.drop_column("utility_tutorials", "request_id")
    op.drop_index("uq_community_posts_request", "community_posts")
    op.drop_column("community_posts", "request_id")

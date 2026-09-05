"""Private template classifications and analysis."""

import sqlalchemy as sa
from alembic import op

revision = "0014_template_details"
down_revision = "0013_document_versions"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "template_details",
        sa.Column(
            "template_id",
            sa.Uuid(),
            sa.ForeignKey("institutional_templates.id", ondelete="CASCADE"),
            primary_key=True,
        ),
        sa.Column("category", sa.String(80), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("tags", sa.JSON(), nullable=False),
        sa.Column("analysis", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade():
    op.drop_table("template_details")

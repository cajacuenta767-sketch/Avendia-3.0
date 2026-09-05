"""Add user-owned academic calendar events."""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002_calendar_events"
down_revision: str | None = "0001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "calendar_events",
        sa.Column("owner_id", sa.Uuid(), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("event_date", sa.Date(), nullable=False),
        sa.Column("event_time", sa.Time(), nullable=True),
        sa.Column("event_type", sa.String(length=32), nullable=False),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("completed", sa.Boolean(), nullable=False),
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(
            ["owner_id"],
            ["users.id"],
            name=op.f("fk_calendar_events_owner_id_users"),
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_calendar_events")),
    )
    op.create_index(op.f("ix_calendar_events_owner_id"), "calendar_events", ["owner_id"])
    op.create_index(op.f("ix_calendar_events_event_date"), "calendar_events", ["event_date"])
    op.create_index(op.f("ix_calendar_events_event_type"), "calendar_events", ["event_type"])


def downgrade() -> None:
    op.drop_table("calendar_events")

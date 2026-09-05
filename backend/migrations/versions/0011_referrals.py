"""Referral attribution and transactional rewards."""

import sqlalchemy as sa
from alembic import op

revision = "0011_referrals"
down_revision = "0010_utilities"
branch_labels = None
depends_on = None


def timestamps():
    return [
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    ]


def upgrade():
    op.create_table(
        "utility_referral_codes",
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), primary_key=True),
        sa.Column("code", sa.String(32), nullable=False, unique=True),
        *timestamps(),
    )
    op.create_table(
        "utility_referral_settings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.Column("reward", sa.Integer(), nullable=False),
        *timestamps(),
    )
    op.create_table(
        "utility_referrals",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("referrer_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("invitee_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False, unique=True),
        sa.Column("status", sa.String(32), nullable=False),
        sa.Column("reward", sa.Integer(), nullable=False),
        sa.Column("reason", sa.String(500), nullable=False),
        *timestamps(),
    )
    op.create_index("ix_utility_referrals_referrer_id", "utility_referrals", ["referrer_id"])
    op.create_table(
        "utility_referral_movements",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column(
            "referral_id",
            sa.Uuid(),
            sa.ForeignKey("utility_referrals.id"),
            nullable=False,
            unique=True,
        ),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("balance_after", sa.Integer(), nullable=False),
        *timestamps(),
    )
    op.create_index(
        "ix_utility_referral_movements_user_id", "utility_referral_movements", ["user_id"]
    )


def downgrade():
    for name in [
        "utility_referral_movements",
        "utility_referrals",
        "utility_referral_settings",
        "utility_referral_codes",
    ]:
        op.drop_table(name)

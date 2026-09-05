from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.admin.model import (
    AdminAuditLog,
    AIGenerationQualityEvent,
    AIUsageEvent,
    PlatformSettings,
)
from app.modules.users.model import User


class InsufficientAICredits(RuntimeError):
    pass


def ensure_ai_credits(user: User, cost: int) -> None:
    if user.ai_credits_balance < cost:
        raise InsufficientAICredits("Insufficient AI credits")


async def record_ai_usage(
    db: AsyncSession,
    user: User,
    *,
    credit_cost: int,
    estimated_tokens: int,
    tool_id: str,
    module: str,
    model: str,
) -> None:
    user.ai_credits_balance = max(0, user.ai_credits_balance - credit_cost)
    user.ai_tokens_consumed += max(0, estimated_tokens)
    user.ai_generations += 1
    db.add(
        AIUsageEvent(
            user_id=user.id,
            tool_id=tool_id,
            module=module,
            model=model,
            credit_cost=credit_cost,
            estimated_tokens=max(0, estimated_tokens),
        )
    )
    await db.commit()


async def record_generation_quality(
    db: AsyncSession,
    user: User,
    *,
    tool_id: str,
    module: str,
    model: str,
    outcome: str,
    quality_status: str,
    repair_attempted: bool,
    repair_succeeded: bool,
    failed_checks: list[str],
    credit_charged: int,
    commit: bool = True,
) -> None:
    db.add(
        AIGenerationQualityEvent(
            user_id=user.id,
            tool_id=tool_id,
            module=module,
            model=model,
            outcome=outcome,
            quality_status=quality_status,
            repair_attempted=repair_attempted,
            repair_succeeded=repair_succeeded,
            failed_checks_json=failed_checks[:24],
            credit_charged=max(0, credit_charged),
        )
    )
    if commit:
        await db.commit()


async def get_platform_settings(db: AsyncSession) -> PlatformSettings:
    settings = await db.scalar(select(PlatformSettings).where(PlatformSettings.id == 1))
    if settings is None:
        settings = PlatformSettings(id=1)
        db.add(settings)
        await db.flush()
    return settings


def add_admin_audit(
    db: AsyncSession,
    *,
    actor_id: UUID,
    action: str,
    target_type: str,
    target_id: str | None,
    reason: str,
    detail: dict[str, object],
) -> None:
    db.add(
        AdminAuditLog(
            actor_id=actor_id,
            action=action,
            target_type=target_type,
            target_id=target_id,
            reason=reason,
            detail_json=detail,
        )
    )

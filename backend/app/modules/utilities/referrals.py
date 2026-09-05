import secrets
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import Boolean, ForeignKey, Integer, String, func, select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from app.api.dependencies import get_current_user
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.db.session import get_db
from app.modules.users.model import User
from app.modules.utilities.model import Notification
from app.modules.utilities.router import audit, require_admin


class ReferralCode(TimestampMixin, Base):
    __tablename__ = "utility_referral_codes"
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), primary_key=True)
    code: Mapped[str] = mapped_column(String(32), unique=True)


class Referral(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "utility_referrals"
    referrer_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), index=True)
    invitee_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), unique=True)
    status: Mapped[str] = mapped_column(String(32), default="pending")
    reward: Mapped[int] = mapped_column(Integer)
    reason: Mapped[str] = mapped_column(String(500), default="Pendiente de revisión")


class ReferralSettings(TimestampMixin, Base):
    __tablename__ = "utility_referral_settings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, default=1)
    enabled: Mapped[bool] = mapped_column(Boolean, default=False)
    reward: Mapped[int] = mapped_column(Integer, default=1000)


class ReferralMovement(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "utility_referral_movements"
    referral_id: Mapped[UUID] = mapped_column(ForeignKey("utility_referrals.id"), unique=True)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id"), index=True)
    amount: Mapped[int] = mapped_column(Integer)
    balance_after: Mapped[int] = mapped_column(Integer)


class SettingsInput(BaseModel):
    enabled: bool
    reward: int = Field(ge=0, le=100000)


class Decision(BaseModel):
    status: Literal["credited", "rejected"]
    reason: str = Field(min_length=4, max_length=500)


router = APIRouter(tags=["referrals"])


async def settings_view(db: AsyncSession):
    config = await db.get(ReferralSettings, 1)
    return {
        "enabled": config.enabled if config else False,
        "reward": config.reward if config else 1000,
    }


async def attribute_referral(db: AsyncSession, invitee: User, code: str):
    config = await settings_view(db)
    if not config["enabled"]:
        raise HTTPException(
            409, "El programa de referidos está pausado. Puedes registrarte sin código."
        )
    origin = await db.scalar(
        select(ReferralCode)
        .join(User, User.id == ReferralCode.user_id)
        .where(ReferralCode.code == code.strip(), User.is_active.is_(True))
    )
    if not origin or origin.user_id == invitee.id:
        raise HTTPException(422, "El código de invitación no es válido")
    db.add(Referral(referrer_id=origin.user_id, invitee_id=invitee.id, reward=config["reward"]))


@router.get("/referrals/me")
async def mine(
    page: int = Query(1, ge=1),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    code = await db.get(ReferralCode, user.id)
    items = await db.scalars(
        select(Referral)
        .where(Referral.referrer_id == user.id)
        .order_by(Referral.created_at.desc())
        .offset((page - 1) * 20)
        .limit(20)
    )
    total = await db.scalar(
        select(func.count()).select_from(Referral).where(Referral.referrer_id == user.id)
    )
    credited = await db.scalar(
        select(func.coalesce(func.sum(ReferralMovement.amount), 0)).where(
            ReferralMovement.user_id == user.id
        )
    )
    return {
        "code": code.code if code else None,
        "settings": await settings_view(db),
        "balance": user.ai_credits_balance,
        "credited": credited,
        "total": total,
        "items": [
            {
                "id": r.id,
                "status": r.status,
                "reward": r.reward,
                "reason": r.reason,
                "created_at": r.created_at,
            }
            for r in items
        ],
    }


@router.put("/referrals/code")
async def issue(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not (await settings_view(db))["enabled"]:
        raise HTTPException(409, "El programa está pausado")
    code = await db.get(ReferralCode, user.id)
    if not code:
        code = ReferralCode(user_id=user.id, code=secrets.token_urlsafe(16))
        db.add(code)
        try:
            await db.commit()
        except IntegrityError:
            await db.rollback()
            code = await db.get(ReferralCode, user.id)
            if not code:
                raise HTTPException(409, "Intenta crear el código nuevamente") from None
    return {"code": code.code}


@router.put("/admin/referrals/settings")
async def configure(
    payload: SettingsInput,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(user)
    config = await db.get(ReferralSettings, 1)
    if not config:
        config = ReferralSettings(id=1)
        db.add(config)
    config.enabled, config.reward = payload.enabled, payload.reward
    audit(
        db,
        user,
        "referral.settings",
        user.id,
        "Reglas de referidos actualizadas para futuras invitaciones",
    )
    await db.commit()
    return await settings_view(db)


@router.get("/admin/referrals")
async def review_list(
    page: int = Query(1, ge=1),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(user)
    items = await db.scalars(
        select(Referral)
        .where(Referral.status == "pending")
        .order_by(Referral.created_at, Referral.id)
        .offset((page - 1) * 20)
        .limit(20)
    )
    total = await db.scalar(
        select(func.count()).select_from(Referral).where(Referral.status == "pending")
    )
    return {
        "items": [
            {
                "id": r.id,
                "status": r.status,
                "reward": r.reward,
                "referrer_id": r.referrer_id,
                "invitee_id": r.invitee_id,
                "created_at": r.created_at,
            }
            for r in items
        ],
        "total": total,
    }


@router.post("/admin/referrals/{referral_id}/review")
async def decide(
    referral_id: UUID,
    payload: Decision,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    require_admin(user)
    referral = await db.get(Referral, referral_id)
    if not referral:
        raise HTTPException(404, "Referido no encontrado")
    claimed = await db.execute(
        update(Referral)
        .where(Referral.id == referral_id, Referral.status == "pending")
        .values(status=payload.status, reason=payload.reason)
    )
    if not claimed.rowcount:
        await db.rollback()
        raise HTTPException(409, "Este referido ya fue revisado; no se duplicaron créditos")
    if payload.status == "credited":
        eligible = await db.scalar(
            select(User.id).where(User.id == referral.invitee_id, User.is_active.is_(True))
        )
        if not eligible:
            await db.rollback()
            raise HTTPException(409, "La cuenta invitada no está activa")
        balance = await db.scalar(
            update(User)
            .where(User.id == referral.referrer_id, User.is_active.is_(True))
            .values(
                ai_credits_balance=User.ai_credits_balance + referral.reward,
                ai_credits_total=User.ai_credits_total + referral.reward,
            )
            .returning(User.ai_credits_balance)
        )
        if balance is None:
            await db.rollback()
            raise HTTPException(409, "La cuenta referente no está activa")
        db.add(
            ReferralMovement(
                referral_id=referral.id,
                user_id=referral.referrer_id,
                amount=referral.reward,
                balance_after=balance,
            )
        )
    audit(db, user, "referral.reviewed", referral_id, payload.reason)
    db.add(
        Notification(
            user_id=referral.referrer_id,
            category="referrals",
            message="Se actualizó el estado de una invitación.",
            path="/dashboard/referidos",
        )
    )
    await db.commit()
    return {"status": payload.status}

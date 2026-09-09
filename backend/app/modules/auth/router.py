from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.ratelimit import (
    LOGIN_PER_ACCOUNT,
    LOGIN_PER_IP,
    PASSWORD_RESET_COMPLETE_PER_ACCOUNT,
    PASSWORD_RESET_PER_IP,
    PASSWORD_RESET_REQUEST_PER_ACCOUNT,
    REGISTER_PER_IP,
    enforce_ip_rate_limit,
    enforce_rate_limit,
)
from app.core.security import (
    create_access_token,
    create_password_reset_code,
    hash_password,
    hash_password_reset_code,
    verify_password,
    verify_password_reset_code,
)
from app.db.session import get_db
from app.modules.admin.service import get_platform_settings
from app.modules.auth.email_service import send_password_reset_email
from app.modules.auth.model import PasswordResetChallenge
from app.modules.auth.schemas import (
    LoginRequest,
    PasswordResetComplete,
    PasswordResetCompleteResponse,
    PasswordResetRequest,
    PasswordResetRequestResponse,
    RegisterRequest,
    TokenResponse,
)
from app.modules.users.model import User, UserRole
from app.modules.users.schemas import UserRead
from app.modules.utilities.referrals import attribute_referral

router = APIRouter(prefix="/auth", tags=["auth"])
settings = get_settings()


def aware_utc(value: datetime) -> datetime:
    return value if value.tzinfo is not None else value.replace(tzinfo=UTC)


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db)
) -> User:
    enforce_ip_rate_limit(request, "auth.register", REGISTER_PER_IP)
    platform_settings = await get_platform_settings(db)
    if not platform_settings.registration_open:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="El registro de nuevas cuentas está temporalmente cerrado.",
        )
    email = payload.email.lower().strip()
    if await db.scalar(select(User.id).where(User.email == email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        email=email,
        full_name=payload.full_name,
        dre=payload.dre,
        ugel=payload.ugel,
        school_name=payload.school_name,
        director_name=payload.director_name,
        education_modality=payload.education_modality,
        education_level=payload.education_level,
        grade=payload.grade,
        section=payload.section,
        curricular_area=payload.curricular_area,
        school_year=payload.school_year,
        password_hash=hash_password(payload.password),
        role=UserRole.TEACHER,
        ai_credits_balance=platform_settings.default_ai_credits,
        ai_credits_total=platform_settings.default_ai_credits,
    )
    db.add(user)
    if payload.referral_code:
        await db.flush()
        await attribute_referral(db, user, payload.referral_code)
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)
) -> TokenResponse:
    email = payload.email.lower().strip()
    enforce_ip_rate_limit(request, "auth.login", LOGIN_PER_IP)
    enforce_rate_limit("auth.login.account", email, LOGIN_PER_ACCOUNT)
    user = await db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive account")

    return TokenResponse(
        access_token=create_access_token(user.id, user.role),
        user=UserRead.model_validate(user),
    )


@router.post("/password-reset/request", response_model=PasswordResetRequestResponse)
async def request_password_reset(
    payload: PasswordResetRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> PasswordResetRequestResponse:
    neutral_message = "Si el correo está registrado, recibirás un código para recuperar tu cuenta."
    email = payload.email.lower().strip()
    enforce_ip_rate_limit(request, "auth.reset.request", PASSWORD_RESET_PER_IP)
    enforce_rate_limit("auth.reset.request.account", email, PASSWORD_RESET_REQUEST_PER_ACCOUNT)
    user = await db.scalar(select(User).where(User.email == email))
    if user is None or not user.is_active:
        return PasswordResetRequestResponse(message=neutral_message)

    now = datetime.now(UTC)
    await db.execute(
        update(PasswordResetChallenge)
        .where(
            PasswordResetChallenge.user_id == user.id,
            PasswordResetChallenge.used_at.is_(None),
        )
        .values(used_at=now)
    )
    code = create_password_reset_code()
    challenge = PasswordResetChallenge(
        user_id=user.id,
        code_hash="pending",
        expires_at=now + timedelta(minutes=settings.password_reset_expire_minutes),
    )
    db.add(challenge)
    await db.flush()
    challenge.code_hash = hash_password_reset_code(challenge.id, code)
    await db.commit()

    delivered = await send_password_reset_email(user.email, code)
    development_code = code if settings.expose_password_reset_code and not delivered else None
    return PasswordResetRequestResponse(
        message=neutral_message,
        development_reset_code=development_code,
    )


@router.post("/password-reset/complete", response_model=PasswordResetCompleteResponse)
async def complete_password_reset(
    payload: PasswordResetComplete,
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> PasswordResetCompleteResponse:
    email = payload.email.lower().strip()
    enforce_ip_rate_limit(request, "auth.reset.complete", PASSWORD_RESET_PER_IP)
    enforce_rate_limit("auth.reset.complete.account", email, PASSWORD_RESET_COMPLETE_PER_ACCOUNT)
    if payload.new_password == payload.code:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="La nueva contraseña no puede ser igual al código de recuperación.",
        )

    user = await db.scalar(select(User).where(User.email == email))
    generic_error = HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="El código es inválido o ya venció. Solicita uno nuevo.",
    )
    if user is None or not user.is_active:
        raise generic_error

    challenge = await db.scalar(
        select(PasswordResetChallenge)
        .where(
            PasswordResetChallenge.user_id == user.id,
            PasswordResetChallenge.used_at.is_(None),
        )
        .order_by(PasswordResetChallenge.created_at.desc())
    )
    now = datetime.now(UTC)
    if challenge is None or aware_utc(challenge.expires_at) <= now:
        if challenge is not None:
            challenge.used_at = now
            await db.commit()
        raise generic_error
    if challenge.attempt_count >= settings.password_reset_max_attempts:
        challenge.used_at = now
        await db.commit()
        raise generic_error
    if not verify_password_reset_code(challenge.id, payload.code, challenge.code_hash):
        challenge.attempt_count += 1
        if challenge.attempt_count >= settings.password_reset_max_attempts:
            challenge.used_at = now
        await db.commit()
        raise generic_error

    user.password_hash = hash_password(payload.new_password)
    challenge.used_at = now
    await db.execute(
        update(PasswordResetChallenge)
        .where(
            PasswordResetChallenge.user_id == user.id,
            PasswordResetChallenge.id != challenge.id,
            PasswordResetChallenge.used_at.is_(None),
        )
        .values(used_at=now)
    )
    await db.commit()
    return PasswordResetCompleteResponse(
        message="Tu contraseña fue actualizada. Ya puedes ingresar."
    )

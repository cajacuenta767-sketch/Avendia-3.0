import hashlib
import hmac
import secrets
from datetime import UTC, datetime, timedelta
from uuid import UUID

import bcrypt
import jwt

from app.core.config import get_settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_access_token(user_id: UUID, role: str) -> str:
    settings = get_settings()
    now = datetime.now(UTC)
    payload = {
        "sub": str(user_id),
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=settings.access_token_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret_key.get_secret_value(), algorithm="HS256")


def decode_access_token(token: str) -> dict[str, object]:
    settings = get_settings()
    return jwt.decode(token, settings.jwt_secret_key.get_secret_value(), algorithms=["HS256"])


def create_password_reset_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def hash_password_reset_code(challenge_id: UUID, code: str) -> str:
    settings = get_settings()
    message = f"{challenge_id}:{code}".encode()
    return hmac.new(
        settings.jwt_secret_key.get_secret_value().encode(),
        message,
        hashlib.sha256,
    ).hexdigest()


def verify_password_reset_code(challenge_id: UUID, code: str, expected_hash: str) -> bool:
    return hmac.compare_digest(hash_password_reset_code(challenge_id, code), expected_hash)

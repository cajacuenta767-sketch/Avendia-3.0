from __future__ import annotations

import asyncio
import os

from alembic import command
from alembic.config import Config
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import create_async_engine


def required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


async def ensure_schema(database_url: str, schema: str) -> None:
    connect_args = {"ssl": "require"} if os.getenv("DATABASE_SSL_REQUIRED") == "true" else {}
    engine = create_async_engine(database_url, pool_pre_ping=True, connect_args=connect_args)
    async with engine.begin() as connection:
        await connection.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema}"'))
    await engine.dispose()


async def seed_admin() -> None:
    from app.core.security import hash_password
    from app.db.session import session_factory
    from app.modules.users.model import User, UserRole

    async with session_factory() as session:
        current_admin = await session.scalar(select(User).where(User.role == UserRole.ADMIN))
        if current_admin is not None:
            print(f"Administrator already ready: {current_admin.email}")
            return

        legacy = (
            await session.execute(
                text(
                    "SELECT email, full_name, password_hash FROM public.users "
                    "WHERE role = 'ADMIN' OR is_admin IS TRUE ORDER BY created_at LIMIT 1"
                )
            )
        ).mappings().first()
        if legacy:
            email = str(legacy["email"]).lower()
            full_name = str(legacy["full_name"] or "Administrador Avendia")
            password_hash = str(legacy["password_hash"])
        else:
            email = required_env("ADMIN_EMAIL").lower()
            password = required_env("ADMIN_PASSWORD")
            full_name = os.getenv("ADMIN_FULL_NAME", "Administrador Avendia").strip()
            password_hash = hash_password(password)

        session.add(
            User(
                email=email,
                full_name=full_name,
                password_hash=password_hash,
                role=UserRole.ADMIN,
                is_active=True,
                dre="Administración Avendia",
                ugel="Administración Avendia",
                school_name="Avendia",
                director_name=full_name,
                education_modality="EBR",
                education_level="Primaria",
                grade="1°",
                section="A",
                curricular_area="General",
                school_year=2026,
                ai_credits_balance=100_000,
                ai_credits_total=100_000,
            )
        )
        await session.commit()
    print(f"Administrator ready: {email}")


async def main() -> None:
    database_url = required_env("DATABASE_URL")
    schema = required_env("DATABASE_SCHEMA")
    await ensure_schema(database_url, schema)
    await asyncio.to_thread(command.upgrade, Config("alembic.ini"), "head")
    await seed_admin()


if __name__ == "__main__":
    asyncio.run(main())

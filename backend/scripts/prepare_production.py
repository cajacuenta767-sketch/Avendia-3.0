"""Prepara la base de datos antes de arrancar la API en producción.

1. Crea el esquema indicado en ``DATABASE_SCHEMA`` si no existe.
2. Aplica las migraciones hasta ``head`` (``migrations/env.py`` se encarga de
   que ``alembic_version`` admita los identificadores largos del proyecto).
3. Garantiza que exista al menos una cuenta de administrador activa, tomada
   de un despliegue heredado si lo hubiera o de ``ADMIN_EMAIL`` /
   ``ADMIN_PASSWORD`` / ``ADMIN_FULL_NAME``.
"""

from __future__ import annotations

import asyncio
import os

from alembic import command
from alembic.config import Config
from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

DEFAULT_ADMIN_NAME = "Administrador Avendia"


def required_env(name: str) -> str:
    value = os.getenv(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


async def ensure_schema(database_url: str, schema: str) -> None:
    if not schema.replace("_", "").isalnum() or schema[0].isdigit():
        raise RuntimeError("DATABASE_SCHEMA must be a valid PostgreSQL identifier")
    connect_args = {"ssl": "require"} if os.getenv("DATABASE_SSL_REQUIRED") == "true" else {}
    engine = create_async_engine(database_url, pool_pre_ping=True, connect_args=connect_args)
    async with engine.begin() as connection:
        await connection.execute(text(f'CREATE SCHEMA IF NOT EXISTS "{schema}"'))
    await engine.dispose()


async def _legacy_admin(session: AsyncSession, current_schema: str) -> dict[str, str] | None:
    """Busca un administrador en la tabla ``public.users`` de la versión anterior.

    Solo aplica cuando la app vive en otro esquema; si el esquema actual es
    ``public``, esa tabla es la propia de Avendia 3.0 y no hay nada heredado.
    """
    if session.bind is None or session.bind.dialect.name != "postgresql":
        return None
    if current_schema in ("", "public"):
        return None
    columns = {
        row[0]
        for row in await session.execute(
            text(
                "SELECT column_name FROM information_schema.columns "
                "WHERE table_schema = 'public' AND table_name = 'users'"
            )
        )
    }
    required = {"email", "full_name", "password_hash"}
    if not required.issubset(columns):
        return None
    conditions = []
    if "role" in columns:
        conditions.append("lower(role) = 'admin'")
    if "is_admin" in columns:
        conditions.append("is_admin IS TRUE")
    if not conditions:
        return None
    order = "created_at" if "created_at" in columns else "email"
    row = (
        (
            await session.execute(
                text(
                    "SELECT email, full_name, password_hash FROM public.users "
                    f"WHERE {' OR '.join(conditions)} ORDER BY {order} LIMIT 1"
                )
            )
        )
        .mappings()
        .first()
    )
    return dict(row) if row else None


async def seed_admin() -> str:
    import app.main  # noqa: F401  (registra todos los modelos del ORM)
    from app.core.security import hash_password
    from app.db.session import session_factory, settings
    from app.modules.users.model import User, UserRole

    async with session_factory() as session:
        current_admin = await session.scalar(select(User).where(User.role == UserRole.ADMIN))
        if current_admin is not None:
            print(f"Administrator already ready: {current_admin.email}")
            return current_admin.email

        legacy = await _legacy_admin(session, settings.database_schema or "")
        if legacy:
            email = str(legacy["email"]).lower()
            full_name = str(legacy["full_name"] or DEFAULT_ADMIN_NAME)
            password_hash = str(legacy["password_hash"])
        else:
            email = required_env("ADMIN_EMAIL").lower()
            password = required_env("ADMIN_PASSWORD")
            full_name = os.getenv("ADMIN_FULL_NAME", "").strip() or DEFAULT_ADMIN_NAME
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
                grade="1° de Primaria",
                section="A",
                curricular_area="General",
                school_year=2026,
                ai_credits_balance=100_000,
                ai_credits_total=100_000,
            )
        )
        await session.commit()
    print(f"Administrator ready: {email}")
    return email


async def main() -> None:
    database_url = required_env("DATABASE_URL")
    schema = required_env("DATABASE_SCHEMA")
    await ensure_schema(database_url, schema)
    await asyncio.to_thread(command.upgrade, Config("alembic.ini"), "head")
    await seed_admin()


if __name__ == "__main__":
    asyncio.run(main())

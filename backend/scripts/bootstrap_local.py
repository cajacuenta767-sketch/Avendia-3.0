"""Prepara un entorno local listo para iniciar sesión.

Ejecutar desde ``backend/``::

    uv run python scripts/bootstrap_local.py

Pasos que realiza:

1. Aplica todas las migraciones hasta ``head`` (``migrations/env.py`` amplía
   ``alembic_version`` en PostgreSQL para los identificadores largos).
2. Crea (o promueve) una cuenta de administrador activa con la que entrar.

Las credenciales se toman de ``ADMIN_EMAIL`` / ``ADMIN_PASSWORD`` /
``ADMIN_FULL_NAME`` o de los argumentos ``--email`` / ``--password`` /
``--name``. Sin ellos se usan valores de desarrollo.
"""

from __future__ import annotations

import argparse
import asyncio
import os
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))
os.chdir(BACKEND_DIR)

from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from sqlalchemy import select  # noqa: E402

DEFAULT_EMAIL = "admin@avendia.com"
DEFAULT_PASSWORD = "Avendia2026!"
DEFAULT_NAME = "Administrador Avendia"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Prepara la base local y un administrador.")
    parser.add_argument("--email", default=os.getenv("ADMIN_EMAIL", DEFAULT_EMAIL))
    parser.add_argument("--password", default=os.getenv("ADMIN_PASSWORD", DEFAULT_PASSWORD))
    parser.add_argument("--name", default=os.getenv("ADMIN_FULL_NAME", DEFAULT_NAME))
    parser.add_argument(
        "--reset-password",
        action="store_true",
        help="Si la cuenta ya existe, reemplaza su contraseña por la indicada.",
    )
    return parser.parse_args()


async def ensure_admin(email: str, password: str, full_name: str, reset_password: bool) -> str:
    import app.main  # noqa: F401  (registra todos los modelos del ORM)
    from app.core.security import hash_password
    from app.db.session import session_factory
    from app.modules.users.model import User, UserRole

    normalized_email = email.strip().lower()
    async with session_factory() as session:
        user = await session.scalar(select(User).where(User.email == normalized_email))
        if user is None:
            session.add(
                User(
                    email=normalized_email,
                    full_name=full_name.strip() or DEFAULT_NAME,
                    password_hash=hash_password(password),
                    role=UserRole.ADMIN,
                    is_active=True,
                    dre="Administración Avendia",
                    ugel="Administración Avendia",
                    school_name="Avendia",
                    director_name=full_name.strip() or DEFAULT_NAME,
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
            outcome = "creado"
        else:
            user.role = UserRole.ADMIN
            user.is_active = True
            if reset_password:
                user.password_hash = hash_password(password)
            outcome = "existente, activado como administrador"
        await session.commit()
    return outcome


async def main() -> None:
    args = parse_args()
    from app.db.session import engine, settings

    print(f"Base de datos: {settings.database_url.split('@')[-1]}")
    await asyncio.to_thread(command.upgrade, Config("alembic.ini"), "head")
    outcome = await ensure_admin(args.email, args.password, args.name, args.reset_password)
    await engine.dispose()

    print()
    print(f"Administrador {outcome}: {args.email}")
    if outcome == "creado" or args.reset_password:
        print(f"Contraseña: {args.password}")
    print("Backend:  uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8001")
    print("Frontend: cd ../frontend && npm run dev")
    print("Entrar:   http://127.0.0.1:5173")


if __name__ == "__main__":
    asyncio.run(main())

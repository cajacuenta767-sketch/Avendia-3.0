import sys
from pathlib import Path

import pytest
from sqlalchemy import select

from app.db.session import session_factory
from app.modules.users.model import User, UserRole

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "scripts"))

import prepare_production  # noqa: E402


async def test_seed_admin_creates_account_from_environment(monkeypatch):
    monkeypatch.setenv("ADMIN_EMAIL", "Directora@Colegio.edu")
    monkeypatch.setenv("ADMIN_PASSWORD", "Clave-Segura-2026")
    monkeypatch.setenv("ADMIN_FULL_NAME", "Directora Avendia")

    email = await prepare_production.seed_admin()
    assert email == "directora@colegio.edu"

    async with session_factory() as session:
        admin = await session.scalar(select(User).where(User.role == UserRole.ADMIN))
        assert admin is not None
        assert admin.email == "directora@colegio.edu"
        assert admin.full_name == "Directora Avendia"
        assert admin.is_active is True
        assert admin.grade == "1° de Primaria"

    # Es idempotente: una segunda ejecución no crea otra cuenta.
    assert await prepare_production.seed_admin() == "directora@colegio.edu"
    async with session_factory() as session:
        admins = (await session.scalars(select(User).where(User.role == UserRole.ADMIN))).all()
        assert len(admins) == 1


async def test_seed_admin_requires_credentials_when_nothing_exists(monkeypatch):
    monkeypatch.delenv("ADMIN_EMAIL", raising=False)
    monkeypatch.delenv("ADMIN_PASSWORD", raising=False)
    with pytest.raises(RuntimeError, match="ADMIN_EMAIL"):
        await prepare_production.seed_admin()

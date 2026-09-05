from uuid import UUID

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.db.session import session_factory
from app.main import app
from app.modules.admin.model import AdminAuditLog
from app.modules.users.model import User, UserRole


def _registration(email: str, full_name: str) -> dict[str, object]:
    return {
        "email": email,
        "full_name": full_name,
        "password": "a-secure-password",
        "dre": "DRE Lima Metropolitana",
        "ugel": "UGEL 03",
        "school_name": "I.E. José María Arguedas",
        "director_name": "Elena Torres",
        "education_modality": "EBR",
        "education_level": "Primaria",
        "grade": "4° de Primaria",
        "section": "A",
        "curricular_area": "Ciencia y Tecnología",
        "school_year": 2026,
    }


async def _account(client: AsyncClient, email: str, name: str) -> tuple[str, dict]:
    payload = _registration(email, name)
    created = await client.post("/api/v1/auth/register", json=payload)
    assert created.status_code == 201
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": payload["password"]},
    )
    assert login.status_code == 200
    return login.json()["access_token"], created.json()


async def _promote(user_id: str) -> None:
    async with session_factory() as db:
        user = await db.get(User, UUID(user_id))
        assert user is not None
        user.role = UserRole.ADMIN
        await db.commit()


@pytest.mark.asyncio
async def test_admin_dashboard_uses_real_data_and_teacher_is_rejected() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        teacher_token, _ = await _account(client, "teacher-dashboard@example.edu", "Docente Uno")
        _, admin = await _account(client, "admin-dashboard@example.edu", "Admin Uno")
        await _promote(admin["id"])
        login = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin-dashboard@example.edu", "password": "a-secure-password"},
        )
        admin_token = login.json()["access_token"]

        forbidden = await client.get(
            "/api/v1/admin/dashboard",
            headers={"Authorization": f"Bearer {teacher_token}"},
        )
        dashboard = await client.get(
            "/api/v1/admin/dashboard?days=30",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

    assert forbidden.status_code == 403
    assert dashboard.status_code == 200
    data = dashboard.json()
    assert data["kpis"]["users_total"] == 2
    assert data["kpis"]["users_active"] == 2
    assert data["kpis"]["admins"] == 1
    assert data["kpis"]["teachers"] == 1
    assert len(data["activity"]) == 30
    assert sum(point["registrations"] for point in data["activity"]) == 2


@pytest.mark.asyncio
async def test_admin_user_controls_are_audited_and_preserve_an_admin() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        _, admin = await _account(client, "admin-guard@example.edu", "Admin Guardián")
        _, teacher = await _account(client, "managed@example.edu", "Docente Gestionada")
        await _promote(admin["id"])
        login = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin-guard@example.edu", "password": "a-secure-password"},
        )
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}

        users = await client.get("/api/v1/admin/users", headers=headers)
        detail = await client.get(f"/api/v1/admin/users/{teacher['id']}", headers=headers)

        self_deactivate = await client.patch(
            f"/api/v1/admin/users/{admin['id']}",
            headers=headers,
            json={"is_active": False, "reason": "Prueba de seguridad"},
        )
        promoted = await client.patch(
            f"/api/v1/admin/users/{teacher['id']}",
            headers=headers,
            json={"role": "admin", "reason": "Responsable institucional"},
        )
        credits = await client.patch(
            f"/api/v1/admin/ai-usage/accounts/{teacher['id']}",
            headers=headers,
            json={"amount": 750, "reason": "Recarga mensual aprobada"},
        )
        audit = await client.get("/api/v1/admin/audit", headers=headers)

    assert users.status_code == 200
    assert users.json()["total"] == 2
    assert users.json()["teachers_count"] == 1
    assert users.json()["admins_count"] == 1
    assert {item["email"] for item in users.json()["items"]} == {
        "admin-guard@example.edu",
        "managed@example.edu",
    }
    assert detail.status_code == 200
    assert detail.json()["email"] == "managed@example.edu"
    assert "subscription_end" in detail.json()
    assert self_deactivate.status_code == 422
    assert promoted.status_code == 200
    assert credits.status_code == 200
    assert credits.json()["ai_credits_balance"] == 10_750
    actions = {item["action"] for item in audit.json()["items"]}
    assert {"user_updated", "credits_adjusted"}.issubset(actions)


@pytest.mark.asyncio
async def test_platform_settings_control_registration_and_default_credits() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        _, admin = await _account(client, "settings-admin@example.edu", "Admin Configuración")
        await _promote(admin["id"])
        login = await client.post(
            "/api/v1/auth/login",
            json={"email": "settings-admin@example.edu", "password": "a-secure-password"},
        )
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
        updated = await client.patch(
            "/api/v1/admin/settings",
            headers=headers,
            json={
                "registration_open": False,
                "default_ai_credits": 25_000,
                "low_credit_threshold": 1_500,
                "reason": "Configuración institucional de prueba",
            },
        )
        rejected = await client.post(
            "/api/v1/auth/register",
            json=_registration("closed@example.edu", "Registro Cerrado"),
        )

    assert updated.status_code == 200
    assert updated.json()["default_ai_credits"] == 25_000
    assert rejected.status_code == 403
    async with session_factory() as db:
        entry = await db.scalar(
            select(AdminAuditLog).where(AdminAuditLog.action == "settings_updated")
        )
        assert entry is not None

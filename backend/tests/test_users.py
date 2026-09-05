import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_teacher_can_update_own_educational_profile() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": "profile@example.com",
                "full_name": "Docente Inicial",
                "password": "secure-password",
                "dre": "DRE Lima",
                "ugel": "UGEL 03",
                "school_name": "I.E. Inicial",
                "director_name": "Director Inicial",
                "education_modality": "EBR",
                "education_level": "Primaria",
                "grade": "4° de Primaria",
                "section": "A",
                "curricular_area": "Comunicación",
                "school_year": 2026,
            },
        )
        login = await client.post(
            "/api/v1/auth/login",
            json={"email": "profile@example.com", "password": "secure-password"},
        )
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
        updated = await client.patch(
            "/api/v1/users/me",
            headers=headers,
            json={
                "full_name": "Docente Actualizada",
                "school_name": "I.E. Nueva",
                "education_level": "Secundaria",
                "grade": "3° de Secundaria",
                "curricular_area": "Ciencia y Tecnología",
            },
        )
        assert updated.status_code == 200
        assert updated.json()["full_name"] == "Docente Actualizada"
        assert updated.json()["school_name"] == "I.E. Nueva"
        me = await client.get("/api/v1/users/me", headers=headers)
        assert me.json()["grade"] == "3° de Secundaria"

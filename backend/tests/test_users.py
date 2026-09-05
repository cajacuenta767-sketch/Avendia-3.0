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


@pytest.mark.asyncio
async def test_teacher_experience_preferences_persist_without_losing_ai_preferences() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": "guided@example.com",
                "full_name": "Docente Guiada",
                "password": "secure-password",
                "dre": "DRE Lima",
                "ugel": "UGEL 03",
                "school_name": "I.E. Guiada",
                "director_name": "Directora Guiada",
                "education_modality": "EBR",
                "education_level": "Primaria",
                "grade": "4° de Primaria",
                "section": "A",
                "curricular_area": "Matemática",
                "school_year": 2026,
            },
        )
        login = await client.post(
            "/api/v1/auth/login",
            json={"email": "guided@example.com", "password": "secure-password"},
        )
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
        await client.patch(
            "/api/v1/ai/tools/field-assist/preferences",
            headers=headers,
            json={"consent": True, "assistance_mode": "guided", "preferred_length": "balanced"},
        )

        updated = await client.patch(
            "/api/v1/users/me/experience-preferences",
            headers=headers,
            json={
                "guided_mode": True,
                "comfortable_spacing": True,
                "always_show_help": True,
                "read_aloud": False,
                "reduced_motion": True,
                "remember_recent_context": True,
                "last_context": {"grade": "4° de Primaria", "curricular_area": "Matemática"},
            },
        )
        assert updated.status_code == 200
        assert updated.json()["reduced_motion"] is True
        reread = await client.get("/api/v1/users/me/experience-preferences", headers=headers)
        assert reread.json()["last_context"]["curricular_area"] == "Matemática"
        ai_preferences = await client.get(
            "/api/v1/ai/tools/field-assist/preferences", headers=headers
        )
        assert ai_preferences.json()["assistance_mode"] == "guided"


@pytest.mark.asyncio
async def test_workspace_preferences_persist_and_preserve_other_preferences() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": "workspace@example.com",
                "full_name": "Docente Preferencias",
                "password": "secure-password",
                "dre": "DRE Lima",
                "ugel": "UGEL 03",
                "school_name": "I.E. Preferencias",
                "director_name": "Directora Preferencias",
                "education_modality": "EBR",
                "education_level": "Primaria",
                "grade": "5° de Primaria",
                "section": "B",
                "curricular_area": "Matemática",
                "school_year": 2026,
            },
        )
        login = await client.post(
            "/api/v1/auth/login",
            json={"email": "workspace@example.com", "password": "secure-password"},
        )
        headers = {"Authorization": f"Bearer {login.json()['access_token']}"}
        await client.patch(
            "/api/v1/users/me/experience-preferences",
            headers=headers,
            json={"reduced_motion": True},
        )

        payload = {
            "schema_version": 1,
            "theme": "dark",
            "font_scale": 112.5,
            "sidebar_collapsed": True,
            "context_panel_open": False,
            "favorite_tools": ["examen", "examen", "rubrica-evaluacion"],
            "recent_tools": ["examen"],
            "home_academic_level": "Primaria",
            "daily_phrase": "Avanzamos paso a paso.",
            "calendar_reference_ids": ["inicio-clases"],
            "calendar_blocks": {
                "2026": [
                    {
                        "id": "bimestre-1",
                        "label": "Primer bimestre",
                        "start_date": "2026-03-16",
                        "end_date": "2026-05-15",
                        "color": "blue",
                    }
                ]
            },
        }
        updated = await client.patch(
            "/api/v1/users/me/workspace-preferences",
            headers=headers,
            json=payload,
        )

        assert updated.status_code == 200
        assert updated.json()["favorite_tools"] == ["examen", "rubrica-evaluacion"]
        reread = await client.get("/api/v1/users/me/workspace-preferences", headers=headers)
        assert reread.json()["theme"] == "dark"
        experience = await client.get(
            "/api/v1/users/me/experience-preferences", headers=headers
        )
        assert experience.json()["reduced_motion"] is True

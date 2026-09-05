import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


async def teacher_token(client: AsyncClient, email: str) -> str:
    registered = await client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "full_name": "Docente Comunidad",
            "password": "a-secure-password",
            "dre": "DRE Lima",
            "ugel": "UGEL 01",
            "school_name": "I.E. Comunidad",
            "director_name": "Directivo",
            "education_modality": "EBR",
            "education_level": "Primaria",
            "grade": "4\u00b0 de Primaria",
            "section": "A",
            "curricular_area": "Comunicacion",
            "school_year": 2026,
        },
    )
    assert registered.status_code == 201, registered.text
    login = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": "a-secure-password"}
    )
    assert login.status_code == 200, login.text
    return str(login.json()["access_token"])


@pytest.mark.asyncio
async def test_community_post_is_persisted_and_filterable() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token = await teacher_token(client, "community@example.edu")
        headers = {"Authorization": f"Bearer {token}"}
        created = await client.post(
            "/api/v1/community/posts",
            headers=headers,
            json={
                "title": "Lectura con noticias locales",
                "content": "Probé una secuencia con noticias de la comunidad y diálogo guiado.",
                "category": "experiencia",
                "modality": "EBR",
                "education_level": "Primaria",
                "curricular_area": "Comunicacion",
                "context": "rural",
            },
        )
        assert created.status_code == 201
        post_id = created.json()["id"]
        listed = await client.get("/api/v1/community/posts?context=rural", headers=headers)

    assert listed.status_code == 200
    assert listed.json()[0]["id"] == post_id
    assert listed.json()[0]["author_name"] == "Docente Comunidad"

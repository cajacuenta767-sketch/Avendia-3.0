from unittest.mock import AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.modules.ai.schemas import (
    WordGroupingCategory,
    WordGroupingResponse,
    WordGroupingWord,
)


async def _teacher_token(client: AsyncClient) -> str:
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "taxonomy@example.edu",
            "full_name": "María Gómez",
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
        },
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "taxonomy@example.edu", "password": "a-secure-password"},
    )
    return str(login.json()["access_token"])


@pytest.mark.asyncio
async def test_word_grouping_requires_authentication() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/ai/tools/agrupar-palabras/generate",
            json={
                "modality": "EBR",
                "level": "Primaria",
                "grade": "4° de Primaria",
                "curricular_area": "Ciencia y Tecnología",
                "topic": "Los sistemas del cuerpo humano",
                "category_count": 3,
            },
        )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_word_grouping_returns_validated_ai_activity(monkeypatch: pytest.MonkeyPatch) -> None:
    generated = WordGroupingResponse(
        activity_title="Clasificamos los sistemas del cuerpo humano",
        instructions="Ubica cada órgano en el sistema del cuerpo humano al que pertenece.",
        categories=[
            WordGroupingCategory(
                id="category-1",
                name="Sistema digestivo",
                explanation="Órganos que transforman y absorben los alimentos.",
            ),
            WordGroupingCategory(
                id="category-2",
                name="Sistema respiratorio",
                explanation="Órganos que permiten el intercambio de gases.",
            ),
        ],
        words=[
            WordGroupingWord(id="word-1-1", word="Estómago", correct_category_id="category-1"),
            WordGroupingWord(id="word-1-2", word="Intestino", correct_category_id="category-1"),
            WordGroupingWord(id="word-2-1", word="Pulmones", correct_category_id="category-2"),
            WordGroupingWord(id="word-2-2", word="Tráquea", correct_category_id="category-2"),
        ],
        model="gemini-3.6-flash",
    )
    generation_mock = AsyncMock(return_value=generated)
    monkeypatch.setattr("app.modules.ai.router.generate_word_grouping", generation_mock)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token = await _teacher_token(client)
        response = await client.post(
            "/api/v1/ai/tools/agrupar-palabras/generate",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "modality": "EBR",
                "level": "Primaria",
                "grade": "4° de Primaria",
                "curricular_area": "Ciencia y Tecnología",
                "topic": "Los sistemas del cuerpo humano",
                "category_count": 2,
            },
        )

    assert response.status_code == 200
    assert response.json()["categories"][0]["name"] == "Sistema digestivo"
    assert response.json()["words"][2]["correct_category_id"] == "category-2"
    generation_mock.assert_awaited_once()

from unittest.mock import AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.modules.ai.schemas import (
    GeneratedPresentationSlide,
    PresentationGenerationRequest,
    PresentationGenerationResponse,
)
from app.modules.ai.service import _presentation_prompt


async def _teacher_token(client: AsyncClient) -> str:
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "presentation@example.edu",
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
        json={"email": "presentation@example.edu", "password": "a-secure-password"},
    )
    return str(login.json()["access_token"])


def _payload() -> dict[str, object]:
    return {
        "teacher_name": "María Gómez",
        "institution": "I.E. José María Arguedas",
        "modality": "EBR",
        "level": "Primaria",
        "grade": "4° de Primaria",
        "curricular_area": "Ciencia y Tecnología",
        "slide_count": 3,
        "visual_style": "infografico",
        "topic": "El ciclo del agua",
        "competencies": ["Indaga mediante métodos científicos para construir sus conocimientos"],
        "didactic_purpose": "Introducción a un nuevo tema / Motivación inicial",
        "interactions": ["Preguntas de saberes previos y metacognición"],
    }


def test_presentation_prompt_requires_progression_and_honest_visual_references() -> None:
    prompt = _presentation_prompt(PresentationGenerationRequest.model_validate(_payload()))

    assert "exactamente 3 diapositivas" in prompt
    assert "Para 3 diapositivas" in prompt
    # La regla ahora especifica la secuencia concreta.
    assert "no una lista repetitiva" not in prompt
    assert "Nunca devuelvas URL, resultados de Google" in prompt
    assert "No uses Markdown, asteriscos" in prompt


@pytest.mark.asyncio
async def test_presentation_requires_authentication() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/ai/tools/presentaciones-didacticas/generate",
            json=_payload(),
        )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_presentation_returns_editable_slides(monkeypatch: pytest.MonkeyPatch) -> None:
    generated = PresentationGenerationResponse(
        presentation_title="Descubrimos el ciclo del agua",
        learning_objective="Explicar las transformaciones del agua mediante evidencias cercanas.",
        slides=[
            GeneratedPresentationSlide(
                order=index,
                type="portada" if index == 1 else "cierre" if index == 3 else "contenido",
                title=title,
                subtitle="Una secuencia para observar, explicar y comunicar",
                key_points=(
                    [] if index == 1 else ["Observamos un cambio", "Explicamos con evidencia"]
                ),
                highlighted_quote="",
                interactive_activity="Comparte una predicción con tu equipo.",
                speaker_notes="Presenta la situación y formula preguntas abiertas al grupo.",
                visual_prompt="Ilustración horizontal del ciclo del agua en una comunidad andina.",
            )
            for index, title in [
                (1, "El ciclo del agua"),
                (2, "¿Cómo cambia el agua?"),
                (3, "Explicamos lo aprendido"),
            ]
        ],
        model="gemini-3.6-flash",
    )
    generation_mock = AsyncMock(return_value=generated)
    monkeypatch.setattr("app.modules.ai.router.generate_presentation", generation_mock)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token = await _teacher_token(client)
        response = await client.post(
            "/api/v1/ai/tools/presentaciones-didacticas/generate",
            headers={"Authorization": f"Bearer {token}"},
            json=_payload(),
        )

    assert response.status_code == 200
    assert len(response.json()["slides"]) == 3
    assert response.json()["slides"][1]["key_points"][0] == "Observamos un cambio"
    generation_mock.assert_awaited_once()


@pytest.mark.asyncio
async def test_presentation_rejects_unsupported_slide_count() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token = await _teacher_token(client)
        payload = _payload()
        payload["slide_count"] = 6
        response = await client.post(
            "/api/v1/ai/tools/presentaciones-didacticas/generate",
            headers={"Authorization": f"Bearer {token}"},
            json=payload,
        )
    assert response.status_code == 422

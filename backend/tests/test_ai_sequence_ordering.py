from unittest.mock import AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app
from app.modules.ai.schemas import SequenceOrderingBlock, SequenceOrderingResponse


async def _teacher_token(client: AsyncClient) -> str:
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "sequence@example.edu",
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
        json={"email": "sequence@example.edu", "password": "a-secure-password"},
    )
    return str(login.json()["access_token"])


def _payload() -> dict[str, object]:
    return {
        "modality": "EBR",
        "level": "Primaria",
        "grade": "4° de Primaria",
        "curricular_area": "Ciencia y Tecnología",
        "sequence_type": "Proceso científico o natural",
        "topic": "El ciclo del agua",
        "step_count": 4,
    }


@pytest.mark.asyncio
async def test_sequence_ordering_requires_authentication() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post(
            "/api/v1/ai/tools/ordenar-bloques/generate",
            json=_payload(),
        )

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_sequence_ordering_returns_validated_ai_activity(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    generated = SequenceOrderingResponse(
        activity_title="Ordenamos el ciclo del agua",
        instructions="Ordena los bloques según las transformaciones del agua en la naturaleza.",
        pedagogical_rationale=(
            "La evaporación inicia el flujo y permite la condensación; después ocurre la "
            "precipitación y finalmente el agua se acumula nuevamente."
        ),
        blocks=[
            SequenceOrderingBlock(
                id=f"block-{order}",
                correct_order=order,
                text=text,
                hint=hint,
            )
            for order, text, hint in [
                (
                    1,
                    "El calor solar evapora el agua de mares, ríos y lagos.",
                    "El Sol inicia el cambio.",
                ),
                (
                    2,
                    "El vapor asciende, se enfría y forma pequeñas gotas en las nubes.",
                    "Ocurre en la atmósfera.",
                ),
                (
                    3,
                    "Las gotas aumentan de tamaño y caen como precipitación.",
                    "Las nubes ya están cargadas.",
                ),
                (
                    4,
                    "El agua se acumula y retorna a ríos, lagos y océanos.",
                    "El ciclo vuelve al inicio.",
                ),
            ]
        ],
        model="gemini-3.6-flash",
    )
    generation_mock = AsyncMock(return_value=generated)
    monkeypatch.setattr("app.modules.ai.router.generate_sequence_ordering", generation_mock)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token = await _teacher_token(client)
        response = await client.post(
            "/api/v1/ai/tools/ordenar-bloques/generate",
            headers={"Authorization": f"Bearer {token}"},
            json=_payload(),
        )

    assert response.status_code == 200
    assert response.json()["activity_title"] == "Ordenamos el ciclo del agua"
    assert response.json()["blocks"][3]["correct_order"] == 4
    generation_mock.assert_awaited_once()


@pytest.mark.asyncio
async def test_sequence_ordering_rejects_invalid_step_count() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token = await _teacher_token(client)
        payload = _payload()
        payload["step_count"] = 3
        response = await client.post(
            "/api/v1/ai/tools/ordenar-bloques/generate",
            headers={"Authorization": f"Bearer {token}"},
            json=payload,
        )

    assert response.status_code == 422

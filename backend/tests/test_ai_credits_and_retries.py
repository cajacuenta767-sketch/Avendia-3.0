import httpx
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.core.config import get_settings
from app.db.session import session_factory
from app.main import app
from app.modules.ai import service as ai_service
from app.modules.ai.service import AIGenerationError, _post_gemini
from app.modules.users.model import User


async def _teacher(client: AsyncClient, email: str, credits: int) -> str:
    registration = {
        "email": email,
        "full_name": "Docente Prueba",
        "password": "Clave-segura-2026",
        "dre": "DRE Lima",
        "ugel": "UGEL 03",
        "school_name": "I.E. Prueba",
        "director_name": "Director",
        "education_modality": "EBR",
        "education_level": "Primaria",
        "grade": "4° de Primaria",
        "section": "A",
        "curricular_area": "Comunicación",
        "school_year": 2026,
    }
    assert (await client.post("/api/v1/auth/register", json=registration)).status_code == 201
    async with session_factory() as session:
        user = await session.scalar(select(User).where(User.email == email))
        assert user is not None
        user.ai_credits_balance = credits
        await session.commit()
    login = await client.post(
        "/api/v1/auth/login", json={"email": email, "password": "Clave-segura-2026"}
    )
    return login.json()["access_token"]


async def _balance(email: str) -> int:
    async with session_factory() as session:
        user = await session.scalar(select(User).where(User.email == email))
        assert user is not None
        return user.ai_credits_balance


async def test_failed_generation_refunds_reserved_credits(monkeypatch):
    calls = []

    async def failing_generation(payload):
        calls.append(payload.module)
        raise AIGenerationError("Gemini no respondió")

    monkeypatch.setattr("app.modules.ai.router.generate_copilot_reply", failing_generation)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token = await _teacher(client, "refund@example.edu", 100)
        response = await client.post(
            "/api/v1/ai/tools/copilot",
            json={
                "module": "planificamos",
                "tool_title": "Sesión de aprendizaje",
                "message": "Ayúdame con la sesión",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 502
    assert calls == ["planificamos"]
    assert await _balance("refund@example.edu") == 100


async def test_reservation_blocks_generation_when_credits_are_missing(monkeypatch):
    calls = []

    async def generation(payload):
        calls.append(1)
        raise AssertionError("no debería llamarse a la IA sin créditos")

    monkeypatch.setattr("app.modules.ai.router.generate_copilot_reply", generation)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token = await _teacher(client, "broke@example.edu", 10)
        response = await client.post(
            "/api/v1/ai/tools/copilot",
            json={
                "module": "planificamos",
                "tool_title": "Sesión de aprendizaje",
                "message": "Ayúdame con la sesión",
            },
            headers={"Authorization": f"Bearer {token}"},
        )
        assert response.status_code == 402
    assert calls == []
    assert await _balance("broke@example.edu") == 10


class _Response:
    def __init__(self, status_code: int, body: dict | None = None):
        self.status_code = status_code
        self._body = body or {}
        self.request = httpx.Request("POST", "https://gemini.test")

    def raise_for_status(self):
        if self.status_code >= 400:
            raise httpx.HTTPStatusError(
                "error",
                request=self.request,
                response=httpx.Response(self.status_code, request=self.request),
            )

    def json(self):
        return self._body


@pytest.fixture
def gemini_key(monkeypatch):
    from pydantic import SecretStr

    settings = get_settings()
    previous = settings.gemini_api_key
    settings.gemini_api_key = SecretStr("test-key")
    yield
    settings.gemini_api_key = previous


async def test_post_gemini_retries_once_on_transient_failure(monkeypatch, gemini_key):
    attempts = []

    class FakeClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        async def post(self, endpoint, headers=None, json=None):
            attempts.append(endpoint)
            if len(attempts) == 1:
                return _Response(503)
            return _Response(200, {"candidates": []})

    monkeypatch.setattr(ai_service.httpx, "AsyncClient", FakeClient)
    monkeypatch.setattr(ai_service.asyncio, "sleep", _no_sleep)
    body = await _post_gemini("https://gemini.test", {}, failure_message="fallo")
    assert body == {"candidates": []}
    assert len(attempts) == 2


async def test_post_gemini_does_not_retry_contract_errors(monkeypatch, gemini_key):
    attempts = []

    class FakeClient:
        def __init__(self, *args, **kwargs):
            pass

        async def __aenter__(self):
            return self

        async def __aexit__(self, *args):
            return False

        async def post(self, endpoint, headers=None, json=None):
            attempts.append(endpoint)
            return _Response(400)

    monkeypatch.setattr(ai_service.httpx, "AsyncClient", FakeClient)
    with pytest.raises(AIGenerationError, match="fallo"):
        await _post_gemini("https://gemini.test", {}, failure_message="fallo")
    assert len(attempts) == 1


async def _no_sleep(_seconds):
    return None

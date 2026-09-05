from httpx import ASGITransport, AsyncClient

from app.main import app


async def test_validation_errors_include_stable_envelope_and_request_id():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post(
            "/api/v1/auth/login",
            json={"email": "not-an-email"},
            headers={"X-Request-ID": "test-request-123"},
        )

    assert response.status_code == 422
    assert response.headers["X-Request-ID"] == "test-request-123"
    payload = response.json()
    assert isinstance(payload["detail"], list)
    assert payload["error"] == {
        "code": "validation_failed",
        "message": "Revisa los campos indicados antes de continuar.",
        "field": "email",
        "retryable": False,
        "request_id": "test-request-123",
    }


async def test_http_errors_keep_legacy_detail_and_add_structured_error():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get(
            "/api/v1/users/me",
            headers={"X-Request-ID": "missing-session-456"},
        )

    assert response.status_code == 401
    payload = response.json()
    assert "detail" in payload
    assert payload["error"]["code"] == "authentication_required"
    assert payload["error"]["request_id"] == "missing-session-456"

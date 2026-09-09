import pytest
from httpx import ASGITransport, AsyncClient

from app.core.config import get_settings
from app.core.ratelimit import RateLimit, SlidingWindowLimiter, limiter
from app.main import app


def test_sliding_window_blocks_after_limit_and_recovers():
    window = SlidingWindowLimiter()
    rule = RateLimit(limit=3, window_seconds=60)
    assert window.hit("k", rule, now=0.0) is None
    assert window.hit("k", rule, now=1.0) is None
    assert window.hit("k", rule, now=2.0) is None
    retry_after = window.hit("k", rule, now=3.0)
    assert retry_after is not None and retry_after >= 57
    assert window.hit("k", rule, now=61.0) is None
    assert window.hit("other", rule, now=61.0) is None


@pytest.fixture
def rate_limit_enabled():
    settings = get_settings()
    previous = settings.rate_limit_enabled
    settings.rate_limit_enabled = True
    limiter.reset()
    yield
    settings.rate_limit_enabled = previous
    limiter.reset()


async def test_login_is_rate_limited_per_account(rate_limit_enabled):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        statuses = []
        for _ in range(11):
            response = await client.post(
                "/api/v1/auth/login",
                json={"email": "brute@example.edu", "password": "wrong-password"},
            )
            statuses.append(response.status_code)
        assert statuses[:10] == [401] * 10
        assert statuses[10] == 429
        body = response.json()
        assert body["error"]["code"] == "rate_limited"
        assert body["error"]["retryable"] is True
        assert int(response.headers["Retry-After"]) >= 1


async def test_password_reset_requests_are_rate_limited(rate_limit_enabled):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        codes = [
            (
                await client.post(
                    "/api/v1/auth/password-reset/request",
                    json={"email": "someone@example.edu"},
                )
            ).status_code
            for _ in range(4)
        ]
        assert codes == [200, 200, 200, 429]

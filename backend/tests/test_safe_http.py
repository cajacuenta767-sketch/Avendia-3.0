import httpx
import pytest

from app.core import safe_http
from app.core.safe_http import (
    UnsafeUrlError,
    fetch_public_https_async,
    trusted_api_client,
    validate_public_https_url,
)


@pytest.mark.parametrize(
    "url",
    [
        "http://example.com/image.png",
        "https://localhost/image.png",
        "https://metadata.google.internal/computeMetadata/v1/",
        "https://user:pass@example.com/image.png",
        "https://example.com:8080/image.png",
        "https://127.0.0.1/image.png",
        "https://169.254.169.254/latest/meta-data/",
        "https://10.0.0.5/secret.png",
        "https://[::1]/image.png",
    ],
)
def test_rejects_non_public_urls(url, monkeypatch):
    monkeypatch.setattr(
        safe_http.socket,
        "getaddrinfo",
        lambda host, *args, **kwargs: [(None, None, None, None, (host, 443))],
    )
    with pytest.raises(UnsafeUrlError):
        validate_public_https_url(url)


def test_rejects_hosts_resolving_to_private_addresses(monkeypatch):
    monkeypatch.setattr(
        safe_http.socket,
        "getaddrinfo",
        lambda *args, **kwargs: [(None, None, None, None, ("10.1.2.3", 443))],
    )
    with pytest.raises(UnsafeUrlError):
        validate_public_https_url("https://images.example.com/photo.jpg")


def test_accepts_public_https_host(monkeypatch):
    monkeypatch.setattr(
        safe_http.socket,
        "getaddrinfo",
        lambda *args, **kwargs: [(None, None, None, None, ("93.184.216.34", 443))],
    )
    url = "https://upload.wikimedia.org/wikipedia/commons/a/ab/Example.jpg"
    assert validate_public_https_url(url) == url


def _mock_transport(payload: bytes = b"ok") -> httpx.MockTransport:
    return httpx.MockTransport(lambda request: httpx.Response(200, content=payload))


@pytest.fixture
def no_proxy(monkeypatch):
    for name in ("HTTP_PROXY", "HTTPS_PROXY", "ALL_PROXY"):
        monkeypatch.delenv(name, raising=False)
        monkeypatch.delenv(name.lower(), raising=False)


@pytest.mark.asyncio
async def test_trusted_client_rejects_hosts_outside_the_allowlist(no_proxy):
    async with trusted_api_client(timeout=1.0, transport=_mock_transport()) as client:
        with pytest.raises(UnsafeUrlError):
            await client.get("https://evil.example.com/steal")
        with pytest.raises(UnsafeUrlError):
            await client.post("http://generativelanguage.googleapis.com/v1beta/models")


@pytest.mark.asyncio
async def test_trusted_client_accepts_allowlisted_hosts_and_limits_size(no_proxy):
    small = trusted_api_client(timeout=1.0, max_bytes=3, transport=_mock_transport(b"ok"))
    async with small as client:
        response = await client.get("https://commons.wikimedia.org/w/api.php")
        assert response.status_code == 200

    large = trusted_api_client(timeout=1.0, max_bytes=3, transport=_mock_transport(b"demasiado"))
    async with large as client:
        with pytest.raises(UnsafeUrlError):
            await client.get("https://commons.wikimedia.org/w/api.php")


@pytest.mark.asyncio
async def test_trusted_client_allows_validated_public_downloads(monkeypatch, no_proxy):
    monkeypatch.setattr(
        safe_http.socket,
        "getaddrinfo",
        lambda *args, **kwargs: [(None, None, None, None, ("93.184.216.34", 443))],
    )
    async with trusted_api_client(timeout=1.0, transport=_mock_transport(b"imagen")) as client:
        response = await fetch_public_https_async(
            client, "https://upload.wikimedia.org/wikipedia/commons/a/ab/Example.jpg"
        )
        assert response.content == b"imagen"

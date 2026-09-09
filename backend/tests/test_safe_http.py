import pytest

from app.core import safe_http
from app.core.safe_http import UnsafeUrlError, validate_public_https_url


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

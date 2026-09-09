"""Descargas HTTPS seguras frente a SSRF.

Solo se aceptan URLs ``https://`` cuyo host resuelve a direcciones públicas.
Las redirecciones se siguen manualmente y cada salto se vuelve a validar, de
modo que un destino público no pueda redirigir a la red interna ni al servicio
de metadatos de la nube.
"""

from __future__ import annotations

import ipaddress
import socket
from urllib.parse import urljoin, urlparse

import httpx

DEFAULT_MAX_BYTES = 10_000_000
DEFAULT_MAX_REDIRECTS = 3
_USER_AGENT = "Avendia/3.0 (+https://avendia.pe)"


class UnsafeUrlError(ValueError):
    """La URL no es una dirección HTTPS pública válida."""


def _is_public_address(address: str) -> bool:
    try:
        ip = ipaddress.ip_address(address)
    except ValueError:
        return False
    return ip.is_global and not ip.is_multicast


def validate_public_https_url(url: str) -> str:
    parsed = urlparse(url)
    if parsed.scheme != "https" or not parsed.hostname:
        raise UnsafeUrlError("Solo se admiten direcciones https://")
    if parsed.username or parsed.password:
        raise UnsafeUrlError("La URL no puede incluir credenciales")
    if parsed.port not in (None, 443):
        raise UnsafeUrlError("Solo se admite el puerto 443")
    host = parsed.hostname
    if host in {"localhost", "metadata.google.internal"} or host.endswith((".local", ".internal")):
        raise UnsafeUrlError("Host no permitido")
    try:
        resolved = socket.getaddrinfo(host, 443, proto=socket.IPPROTO_TCP)
    except socket.gaierror as exc:
        raise UnsafeUrlError("No se pudo resolver el host") from exc
    addresses = {entry[4][0] for entry in resolved}
    if not addresses or not all(_is_public_address(address) for address in addresses):
        raise UnsafeUrlError("El host no resuelve a una dirección pública")
    return url


def _check_size(response: httpx.Response, max_bytes: int) -> None:
    declared = response.headers.get("content-length")
    if declared and declared.isdigit() and int(declared) > max_bytes:
        raise UnsafeUrlError("El archivo remoto supera el tamaño permitido")
    if len(response.content) > max_bytes:
        raise UnsafeUrlError("El archivo remoto supera el tamaño permitido")


def fetch_public_https(
    url: str,
    *,
    timeout: float = 20.0,
    max_bytes: int = DEFAULT_MAX_BYTES,
    max_redirects: int = DEFAULT_MAX_REDIRECTS,
) -> httpx.Response:
    current = url
    for _ in range(max_redirects + 1):
        validate_public_https_url(current)
        response = httpx.get(
            current,
            timeout=timeout,
            follow_redirects=False,
            headers={"User-Agent": _USER_AGENT},
        )
        if response.is_redirect and response.headers.get("location"):
            current = urljoin(current, response.headers["location"])
            continue
        response.raise_for_status()
        _check_size(response, max_bytes)
        return response
    raise UnsafeUrlError("Demasiadas redirecciones")


async def fetch_public_https_async(
    client: httpx.AsyncClient,
    url: str,
    *,
    max_bytes: int = DEFAULT_MAX_BYTES,
    max_redirects: int = DEFAULT_MAX_REDIRECTS,
) -> httpx.Response:
    current = url
    for _ in range(max_redirects + 1):
        validate_public_https_url(current)
        response = await client.get(
            current,
            follow_redirects=False,
            headers={"User-Agent": _USER_AGENT},
        )
        if response.is_redirect and response.headers.get("location"):
            current = urljoin(current, response.headers["location"])
            continue
        response.raise_for_status()
        _check_size(response, max_bytes)
        return response
    raise UnsafeUrlError("Demasiadas redirecciones")

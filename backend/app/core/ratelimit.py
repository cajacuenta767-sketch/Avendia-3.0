"""Limitador de ritmo en memoria con ventana deslizante.

Protege los endpoints de autenticación y los que consumen créditos de IA.
Es por proceso: suficiente para frenar fuerza bruta y abuso en un despliegue de
un solo proceso; en despliegues multiproceso conviene respaldarlo con Redis.
"""

from __future__ import annotations

import math
import threading
import time
from collections import deque
from dataclasses import dataclass

from fastapi import HTTPException, Request, status

from app.core.config import get_settings


@dataclass(frozen=True)
class RateLimit:
    limit: int
    window_seconds: int


class SlidingWindowLimiter:
    def __init__(self, max_keys: int = 50_000) -> None:
        self._events: dict[str, deque[float]] = {}
        self._lock = threading.Lock()
        self._max_keys = max_keys

    def hit(self, key: str, rule: RateLimit, now: float | None = None) -> int | None:
        """Registra un intento. Devuelve los segundos de espera si el límite se superó."""
        current = time.monotonic() if now is None else now
        cutoff = current - rule.window_seconds
        with self._lock:
            events = self._events.get(key)
            if events is None:
                if len(self._events) >= self._max_keys:
                    self._prune(cutoff)
                events = self._events[key] = deque()
            while events and events[0] <= cutoff:
                events.popleft()
            if len(events) >= rule.limit:
                return max(1, math.ceil(events[0] + rule.window_seconds - current))
            events.append(current)
            return None

    def reset(self) -> None:
        with self._lock:
            self._events.clear()

    def _prune(self, cutoff: float) -> None:
        stale = [key for key, events in self._events.items() if not events or events[-1] <= cutoff]
        for key in stale:
            del self._events[key]


limiter = SlidingWindowLimiter()

LOGIN_PER_ACCOUNT = RateLimit(limit=10, window_seconds=600)
LOGIN_PER_IP = RateLimit(limit=30, window_seconds=600)
REGISTER_PER_IP = RateLimit(limit=5, window_seconds=3600)
PASSWORD_RESET_REQUEST_PER_ACCOUNT = RateLimit(limit=3, window_seconds=900)
PASSWORD_RESET_PER_IP = RateLimit(limit=10, window_seconds=900)
PASSWORD_RESET_COMPLETE_PER_ACCOUNT = RateLimit(limit=10, window_seconds=900)
AI_GENERATION_PER_USER = RateLimit(limit=20, window_seconds=60)


def client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        first = forwarded.split(",", 1)[0].strip()
        if first:
            return first
    return request.client.host if request.client else "unknown"


def enforce_rate_limit(scope: str, key: str, rule: RateLimit) -> None:
    if not get_settings().rate_limit_enabled:
        return
    retry_after = limiter.hit(f"{scope}:{key}", rule)
    if retry_after is None:
        return
    raise HTTPException(
        status_code=status.HTTP_429_TOO_MANY_REQUESTS,
        detail=("Demasiados intentos. Espera un momento antes de volver a intentarlo."),
        headers={"Retry-After": str(retry_after)},
    )


def enforce_ip_rate_limit(request: Request, scope: str, rule: RateLimit) -> None:
    enforce_rate_limit(scope, client_ip(request), rule)

import logging
from typing import Any

from fastapi import HTTPException, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)


def _request_id(request: Request) -> str | None:
    value = getattr(request.state, "request_id", None)
    return str(value) if value else None


def _message_from_detail(detail: Any, fallback: str) -> str:
    if isinstance(detail, str):
        return detail
    if isinstance(detail, dict) and isinstance(detail.get("message"), str):
        return detail["message"]
    return fallback


def _classification(status_code: int) -> tuple[str, bool]:
    if status_code == status.HTTP_401_UNAUTHORIZED:
        return "authentication_required", False
    if status_code == status.HTTP_403_FORBIDDEN:
        return "permission_denied", False
    if status_code == status.HTTP_404_NOT_FOUND:
        return "not_found", False
    if status_code == status.HTTP_409_CONFLICT:
        return "revision_conflict", False
    if status_code == status.HTTP_422_UNPROCESSABLE_CONTENT:
        return "validation_failed", False
    if status_code == status.HTTP_429_TOO_MANY_REQUESTS:
        return "rate_limited", True
    if status_code >= 500:
        return "service_unavailable", True
    return f"http_{status_code}", False


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    code, retryable = _classification(exc.status_code)
    message = _message_from_detail(exc.detail, "No se pudo completar la solicitud.")
    headers = dict(exc.headers or {})
    return JSONResponse(
        status_code=exc.status_code,
        headers=headers,
        content={
            "detail": jsonable_encoder(exc.detail),
            "error": {
                "code": code,
                "message": message,
                "field": None,
                "retryable": retryable,
                "request_id": _request_id(request),
            },
        },
    )


async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    errors = exc.errors()
    field = None
    if errors:
        location = errors[0].get("loc", ())
        visible_parts = [str(part) for part in location if part not in {"body", "query", "path"}]
        field = ".".join(visible_parts) or None
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={
            "detail": jsonable_encoder(errors),
            "error": {
                "code": "validation_failed",
                "message": "Revisa los campos indicados antes de continuar.",
                "field": field,
                "retryable": False,
                "request_id": _request_id(request),
            },
        },
    )


async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = _request_id(request)
    logger.exception("Unhandled API error request_id=%s", request_id, exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "error": {
                "code": "internal_error",
                "message": "Avendia encontró un problema inesperado. Inténtalo nuevamente.",
                "field": None,
                "retryable": True,
                "request_id": request_id,
            },
        },
    )

from typing import Literal
from urllib.parse import urlsplit
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class Input(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class IdeaInput(Input):
    request_id: UUID
    title: str = Field(min_length=4, max_length=180)
    description: str = Field(min_length=12, max_length=6000)
    category: Literal["flujo", "error", "pedagogia", "accesibilidad", "exportacion", "otra"]
    tool: str = Field(default="", max_length=180)


class IdeaEdit(Input):
    title: str = Field(min_length=4, max_length=180)
    description: str = Field(min_length=12, max_length=6000)


class Review(Input):
    status: Literal[
        "received",
        "review",
        "planned",
        "development",
        "published",
        "resolved",
        "declined",
        "hidden",
    ]
    response: str = Field(min_length=4, max_length=4000)


class CommentInput(Input):
    request_id: UUID
    content: str = Field(min_length=2, max_length=3000)


class TutorialInput(Input):
    request_id: UUID | None = None
    title: str = Field(min_length=4, max_length=180)
    description: str = Field(default="", max_length=4000)
    url: str = Field(max_length=2000)
    category: str = Field(min_length=2, max_length=80)
    difficulty: Literal["inicial", "intermedio", "avanzado"] = "inicial"
    tool_path: str = Field(default="", max_length=240)
    transcript: str = Field(default="", max_length=50000)
    published: bool = False
    position: int = Field(default=0, ge=0, le=10000)

    @field_validator("url")
    @classmethod
    def video_url(cls, value: str) -> str:
        parsed = urlsplit(value)
        if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
            raise ValueError("Usa una dirección HTTPS de video válida")
        if parsed.hostname not in {
            "www.youtube.com",
            "youtube.com",
            "youtu.be",
        } and not parsed.path.lower().endswith((".mp4", ".webm")):
            raise ValueError("Usa un video MP4, WebM o un enlace de YouTube")
        return value

    @field_validator("tool_path")
    @classmethod
    def internal_path(cls, value: str) -> str:
        if value and (
            not value.startswith("/dashboard/") or "?" in value or "#" in value or ".." in value
        ):
            raise ValueError("Selecciona una ruta interna de herramienta")
        return value


class ProgressInput(Input):
    seconds: int | None = Field(default=None, ge=0, le=86400)
    completed: bool | None = None
    favorite: bool | None = None

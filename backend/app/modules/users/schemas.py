from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: EmailStr
    full_name: str
    dre: str
    ugel: str
    school_name: str
    director_name: str
    education_modality: str
    education_level: str
    grade: str
    section: str
    curricular_area: str
    school_year: int
    role: str
    is_active: bool
    ai_credits_balance: int
    ai_credits_total: int
    ai_tokens_consumed: int
    ai_generations: int
    created_at: datetime


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=160)
    dre: str | None = Field(default=None, min_length=2, max_length=120)
    ugel: str | None = Field(default=None, min_length=2, max_length=120)
    school_name: str | None = Field(default=None, min_length=2, max_length=200)
    director_name: str | None = Field(default=None, min_length=2, max_length=160)
    education_modality: Literal["EBR", "EBA", "EBE"] | None = None
    education_level: str | None = Field(default=None, min_length=2, max_length=80)
    grade: str | None = Field(default=None, min_length=1, max_length=64)
    section: str | None = Field(default=None, min_length=1, max_length=32)
    curricular_area: str | None = Field(default=None, min_length=2, max_length=120)
    school_year: int | None = Field(default=None, ge=2020, le=2100)

    @field_validator(
        "full_name",
        "dre",
        "ugel",
        "school_name",
        "director_name",
        "grade",
        "section",
        "curricular_area",
    )
    @classmethod
    def strip_profile_text(cls, value: str | None) -> str | None:
        return value.strip() if value is not None else None


class TeacherExperiencePreferences(BaseModel):
    """Accessibility and guidance choices shared across teacher tools."""

    model_config = ConfigDict(extra="forbid")

    guided_mode: bool = True
    comfortable_spacing: bool = True
    always_show_help: bool = True
    read_aloud: bool = False
    reduced_motion: bool = False
    remember_recent_context: bool = True
    last_context: dict[str, str] = Field(default_factory=dict)

    @field_validator("last_context")
    @classmethod
    def validate_last_context(cls, values: dict[str, str]) -> dict[str, str]:
        if len(values) > 16:
            raise ValueError("Solo se pueden recordar 16 datos recientes")
        cleaned: dict[str, str] = {}
        for key, value in values.items():
            clean_key = key.strip()
            clean_value = value.strip()
            if not clean_key or len(clean_key) > 80 or len(clean_value) > 240:
                raise ValueError("La información reciente contiene un dato inválido")
            cleaned[clean_key] = clean_value
        return cleaned


class AcademicBlockPreference(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1, max_length=80)
    label: str = Field(min_length=1, max_length=120)
    start_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    end_date: str = Field(pattern=r"^\d{4}-\d{2}-\d{2}$")
    color: str = Field(default="blue", min_length=1, max_length=32)


class WorkspacePreferences(BaseModel):
    """Cross-device presentation and workspace choices."""

    model_config = ConfigDict(extra="forbid")

    schema_version: Literal[1] = 1
    migrated_from_local: bool = False
    theme: Literal["light", "dark"] = "light"
    font_scale: Literal[87.5, 100, 112.5] = 100
    sidebar_collapsed: bool = False
    context_panel_open: bool = True
    favorite_tools: list[str] = Field(default_factory=list, max_length=57)
    recent_tools: list[str] = Field(default_factory=list, max_length=20)
    home_academic_level: str = Field(default="", max_length=80)
    daily_phrase: str = Field(default="", max_length=240)
    calendar_reference_ids: list[str] = Field(default_factory=list, max_length=64)
    calendar_blocks: dict[str, list[AcademicBlockPreference]] = Field(default_factory=dict)

    @field_validator("favorite_tools", "recent_tools", "calendar_reference_ids")
    @classmethod
    def validate_unique_identifiers(cls, values: list[str]) -> list[str]:
        cleaned = [value.strip() for value in values if value.strip()]
        if any(len(value) > 120 for value in cleaned):
            raise ValueError("Una preferencia contiene un identificador demasiado largo")
        return list(dict.fromkeys(cleaned))

    @field_validator("calendar_blocks")
    @classmethod
    def validate_calendar_blocks(
        cls,
        values: dict[str, list[AcademicBlockPreference]],
    ) -> dict[str, list[AcademicBlockPreference]]:
        if len(values) > 10 or any(len(blocks) > 24 for blocks in values.values()):
            raise ValueError("La configuración del calendario supera el límite permitido")
        if any(not year.isdigit() or not 2020 <= int(year) <= 2100 for year in values):
            raise ValueError("La configuración contiene un año inválido")
        return values

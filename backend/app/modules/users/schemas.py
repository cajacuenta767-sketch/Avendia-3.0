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

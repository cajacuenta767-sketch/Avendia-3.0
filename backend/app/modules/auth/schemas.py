from datetime import UTC, datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from app.modules.users.education_catalog import validate_education_selection
from app.modules.users.schemas import UserRead


class RegisterRequest(BaseModel):
    referral_code: str | None = Field(default=None, max_length=32)
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=160)
    password: str = Field(min_length=10, max_length=128)
    dre: str = Field(min_length=2, max_length=120)
    ugel: str = Field(min_length=2, max_length=120)
    school_name: str = Field(min_length=2, max_length=200)
    director_name: str = Field(min_length=2, max_length=160)
    education_modality: Literal["EBR", "EBA", "EBE"]
    education_level: str = Field(min_length=2, max_length=80)
    grade: str = Field(min_length=1, max_length=64)
    section: str = Field(min_length=1, max_length=32)
    curricular_area: str = Field(min_length=2, max_length=120)
    school_year: int = Field(ge=2020, le=2100)

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
    def strip_required_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("This field is required")
        return cleaned

    @field_validator("school_year")
    @classmethod
    def validate_school_year(cls, value: int) -> int:
        if value < datetime.now(UTC).year - 1:
            raise ValueError("School year is too old")
        return value

    @model_validator(mode="after")
    def validate_education_context(self) -> "RegisterRequest":
        validate_education_selection(self.education_modality, self.education_level, self.grade)
        return self


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetRequestResponse(BaseModel):
    message: str
    development_reset_code: str | None = None


class PasswordResetComplete(BaseModel):
    email: EmailStr
    code: str = Field(pattern=r"^\d{6}$")
    new_password: str = Field(min_length=10, max_length=128)


class PasswordResetCompleteResponse(BaseModel):
    message: str

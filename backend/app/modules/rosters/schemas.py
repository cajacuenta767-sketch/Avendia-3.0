import re
from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.modules.users.education_catalog import validate_education_selection

Modality = Literal["EBR", "EBA", "EBE"]


def _single_line(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _optional_single_line(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = _single_line(value)
    return cleaned or None


class RosterCreate(BaseModel):
    school_year: int = Field(ge=2020, le=2100)
    institution_name: str = Field(min_length=2, max_length=200)
    modality: Modality
    education_level: str = Field(min_length=2, max_length=80)
    grade: str = Field(min_length=1, max_length=64)
    section: str = Field(min_length=1, max_length=32)
    name: str | None = Field(default=None, max_length=160)

    @field_validator("institution_name", "education_level", "grade", "section", mode="before")
    @classmethod
    def clean_required_text(cls, value: object) -> object:
        return _single_line(value) if isinstance(value, str) else value

    @field_validator("name", mode="before")
    @classmethod
    def clean_optional_name(cls, value: object) -> object:
        return _optional_single_line(value) if isinstance(value, str) else value

    @model_validator(mode="after")
    def validate_education(self) -> "RosterCreate":
        validate_education_selection(self.modality, self.education_level, self.grade)
        return self


class RosterUpdate(BaseModel):
    school_year: int | None = Field(default=None, ge=2020, le=2100)
    institution_name: str | None = Field(default=None, min_length=2, max_length=200)
    modality: Modality | None = None
    education_level: str | None = Field(default=None, min_length=2, max_length=80)
    grade: str | None = Field(default=None, min_length=1, max_length=64)
    section: str | None = Field(default=None, min_length=1, max_length=32)
    name: str | None = Field(default=None, max_length=160)
    active: bool | None = None

    @field_validator("institution_name", "education_level", "grade", "section", mode="before")
    @classmethod
    def clean_required_text(cls, value: object) -> object:
        return _single_line(value) if isinstance(value, str) else value

    @field_validator("name", mode="before")
    @classmethod
    def clean_optional_name(cls, value: object) -> object:
        return _optional_single_line(value) if isinstance(value, str) else value

    @model_validator(mode="after")
    def validate_complete_education_update(self) -> "RosterUpdate":
        required_fields = {
            "school_year",
            "institution_name",
            "modality",
            "education_level",
            "grade",
            "section",
            "active",
        }
        null_fields = {
            field
            for field in required_fields & self.model_fields_set
            if getattr(self, field) is None
        }
        if null_fields:
            raise ValueError("Los campos obligatorios de la nómina no pueden quedar vacíos.")
        if self.modality and self.education_level and self.grade:
            validate_education_selection(self.modality, self.education_level, self.grade)
        return self


class RosterRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    school_year: int
    institution_name: str
    modality: str
    education_level: str
    grade: str
    section: str
    name: str | None
    active: bool
    student_count: int = 0
    active_student_count: int = 0
    created_at: datetime
    updated_at: datetime


class RosterListResponse(BaseModel):
    items: list[RosterRead]
    total: int
    limit: int
    offset: int


class StudentCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=200)
    internal_code: str | None = Field(default=None, max_length=80)
    document_number: str | None = Field(default=None, max_length=32)
    sex: str | None = Field(default=None, max_length=32)
    notes: str | None = Field(default=None, max_length=2000)

    @field_validator("full_name", mode="before")
    @classmethod
    def clean_full_name(cls, value: object) -> object:
        return _single_line(value) if isinstance(value, str) else value

    @field_validator("internal_code", "document_number", "sex", mode="before")
    @classmethod
    def clean_optional_text(cls, value: object) -> object:
        return _optional_single_line(value) if isinstance(value, str) else value

    @field_validator("notes", mode="before")
    @classmethod
    def clean_notes(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        cleaned = value.strip()
        return cleaned or None


class StudentUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=200)
    internal_code: str | None = Field(default=None, max_length=80)
    document_number: str | None = Field(default=None, max_length=32)
    sex: str | None = Field(default=None, max_length=32)
    notes: str | None = Field(default=None, max_length=2000)
    active: bool | None = None

    @field_validator("full_name", mode="before")
    @classmethod
    def clean_full_name(cls, value: object) -> object:
        return _single_line(value) if isinstance(value, str) else value

    @field_validator("internal_code", "document_number", "sex", mode="before")
    @classmethod
    def clean_optional_text(cls, value: object) -> object:
        return _optional_single_line(value) if isinstance(value, str) else value

    @field_validator("notes", mode="before")
    @classmethod
    def clean_notes(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        cleaned = value.strip()
        return cleaned or None

    @model_validator(mode="after")
    def reject_null_required_fields(self) -> "StudentUpdate":
        for field in ("full_name", "active"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field} no puede quedar vacío")
        return self


class StudentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    roster_id: UUID
    full_name: str
    internal_code: str | None
    document_number: str | None
    sex: str | None
    notes: str | None
    sort_order: int
    active: bool
    created_at: datetime
    updated_at: datetime


class StudentListResponse(BaseModel):
    items: list[StudentRead]
    total: int
    limit: int
    offset: int


class StudentReorderRequest(BaseModel):
    student_ids: list[UUID] = Field(min_length=1, max_length=5000)

    @field_validator("student_ids")
    @classmethod
    def unique_student_ids(cls, value: list[UUID]) -> list[UUID]:
        if len(value) != len(set(value)):
            raise ValueError("student_ids must not contain duplicates")
        return value


class ImportColumnMapping(BaseModel):
    full_name: str | None = Field(default=None, max_length=200)
    first_names: str | None = Field(default=None, max_length=200)
    last_names: str | None = Field(default=None, max_length=200)
    internal_code: str | None = Field(default=None, max_length=200)
    document_number: str | None = Field(default=None, max_length=200)
    sex: str | None = Field(default=None, max_length=200)
    notes: str | None = Field(default=None, max_length=200)

    @field_validator("*", mode="before")
    @classmethod
    def clean_header_names(cls, value: object) -> object:
        return _optional_single_line(value) if isinstance(value, str) else value


class RosterImportRow(BaseModel):
    row_number: int
    values: dict[str, str]
    status: Literal["valid", "duplicate", "invalid"] | None = None
    message: str | None = None

    @field_validator("values", mode="before")
    @classmethod
    def stringify_values(cls, value: object) -> object:
        if not isinstance(value, dict):
            return value
        return {str(key): "" if item is None else str(item) for key, item in value.items()}


class ImportPreviewResponse(BaseModel):
    preview_token: str | None = None
    filename: str
    file_type: Literal["xlsx", "xls", "csv"]
    sheet_name: str | None
    available_sheets: list[str]
    columns: list[str]
    rows: list[RosterImportRow]
    suggested_mapping: ImportColumnMapping
    total_rows: int
    valid_rows: int
    invalid_rows: int
    duplicate_rows: int
    ignored_empty_rows: int
    ignored_example_rows: int
    requires_mapping: bool
    warnings: list[str] = Field(default_factory=list)


class ImportConfirmRequest(BaseModel):
    preview_token: str | None = Field(default=None, max_length=2048)
    mapping: ImportColumnMapping
    rows: list[dict[str, str]] = Field(min_length=1, max_length=5000)
    skip_duplicates: bool = False

    @field_validator("rows", mode="before")
    @classmethod
    def stringify_rows(cls, value: object) -> object:
        if not isinstance(value, list):
            return value
        normalized: list[object] = []
        for row in value:
            if not isinstance(row, dict):
                normalized.append(row)
                continue
            normalized.append(
                {str(key): "" if item is None else str(item) for key, item in row.items()}
            )
        return normalized


class ImportConfirmResponse(BaseModel):
    created_count: int
    skipped_count: int = 0
    students: list[StudentRead]

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class DocumentCreate(BaseModel):
    title: str = Field(min_length=3, max_length=240)
    document_type: str = Field(min_length=2, max_length=80)
    content: str | None = None
    metadata: dict[str, object] = Field(default_factory=dict)


class DocumentUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=240)
    document_type: str | None = Field(default=None, min_length=2, max_length=80)
    status: Literal["draft", "completed", "archived"] | None = None
    favorite: bool | None = None
    expected_revision: int | None = Field(default=None, ge=1)
    content: str | None = None
    metadata: dict[str, object] | None = None

    @field_validator("title", "document_type", "status", "favorite", "metadata")
    @classmethod
    def reject_explicit_null(cls, value):
        if value is None:
            raise ValueError("Este campo no admite un valor nulo")
        return value


class DocumentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    revision: int
    favorite: bool
    title: str
    document_type: str
    status: str
    content: str | None
    metadata_json: dict[str, object]
    created_at: datetime
    updated_at: datetime


class DocumentRelationCreate(BaseModel):
    parent_document_id: UUID
    child_document_id: UUID
    relation_type: Literal["reference", "continuation", "adaptation", "assessment", "resource"] = (
        "reference"
    )
    inherited_fields: list[str] = Field(default_factory=list, max_length=120)
    context: dict[str, object] = Field(default_factory=dict)
    compatibility_status: Literal["compatible", "review", "disconnected"] = "compatible"
    consent: bool


class DocumentRelationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    parent_document_id: UUID
    child_document_id: UUID
    relation_type: str
    source_revision: int
    inherited_fields_json: list[str]
    context_json: dict[str, object]
    compatibility_status: str
    consent: bool
    created_at: datetime


class CompatibleDocumentRead(DocumentRead):
    compatibility_status: Literal["compatible", "review", "not_recommended"]
    compatibility_reasons: list[str]

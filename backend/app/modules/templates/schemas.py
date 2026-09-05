from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.modules.ai.schemas import GeneratedWorkflowArtifact


class InstitutionalTemplateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    revision: int
    trashed: bool
    name: str
    extension: str
    mime_type: str
    size_bytes: int
    is_default: bool
    created_at: datetime
    updated_at: datetime


class TemplateRenderRequest(BaseModel):
    artifact: GeneratedWorkflowArtifact
    document_type: str = Field(min_length=2, max_length=80)

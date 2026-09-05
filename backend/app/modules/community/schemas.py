from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

PostCategory = Literal["idea", "experiencia", "recurso", "pregunta"]
CommunityModality = Literal["EBR", "EBA", "EBE"]
CommunityContext = Literal["urbano", "rural", "rural_multigrado"]


class CommunityPostCreate(BaseModel):
    request_id: UUID | None = None
    title: str = Field(min_length=4, max_length=180)
    content: str = Field(min_length=12, max_length=6000)
    category: PostCategory = "experiencia"
    modality: CommunityModality = "EBR"
    education_level: str = Field(min_length=2, max_length=32)
    curricular_area: str = Field(min_length=2, max_length=120)
    context: CommunityContext = "urbano"


class CommunityPostUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=4, max_length=180)
    content: str | None = Field(default=None, min_length=12, max_length=6000)
    category: PostCategory | None = None
    modality: CommunityModality | None = None
    education_level: str | None = Field(default=None, min_length=2, max_length=32)
    curricular_area: str | None = Field(default=None, min_length=2, max_length=120)
    context: CommunityContext | None = None


class CommunityPostRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    author_id: UUID
    author_name: str
    title: str
    content: str
    category: str
    modality: str
    education_level: str
    curricular_area: str
    context: str
    status: str
    useful_count: int
    created_at: datetime
    updated_at: datetime

from datetime import date, datetime, time
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

EventType = Literal[
    "planificacion",
    "tutoria",
    "feriado",
    "minedu",
    "civica",
    "concurso",
    "gestion",
    "general",
]


class CalendarEventCreate(BaseModel):
    title: str = Field(min_length=3, max_length=180)
    event_date: date
    event_time: time | None = None
    event_type: EventType = "general"
    notes: str | None = Field(default=None, max_length=4000)


class CalendarEventUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=180)
    event_date: date | None = None
    event_time: time | None = None
    event_type: EventType | None = None
    notes: str | None = Field(default=None, max_length=4000)
    completed: bool | None = None


class CalendarEventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    title: str
    event_date: date
    event_time: time | None
    event_type: str
    notes: str | None
    completed: bool
    created_at: datetime
    updated_at: datetime

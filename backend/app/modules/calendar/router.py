from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.modules.calendar.model import CalendarEvent
from app.modules.calendar.schemas import CalendarEventCreate, CalendarEventRead, CalendarEventUpdate
from app.modules.users.model import User

router = APIRouter(prefix="/calendar/events", tags=["calendar"])


async def owned_event(event_id: UUID, user: User, db: AsyncSession) -> CalendarEvent:
    event = await db.scalar(
        select(CalendarEvent).where(CalendarEvent.id == event_id, CalendarEvent.owner_id == user.id)
    )
    if event is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Calendar event not found"
        )
    return event


@router.get("", response_model=list[CalendarEventRead])
async def list_events(
    start: date | None = Query(None),
    end: date | None = Query(None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[CalendarEvent]:
    query = select(CalendarEvent).where(CalendarEvent.owner_id == user.id)
    if start:
        query = query.where(CalendarEvent.event_date >= start)
    if end:
        query = query.where(CalendarEvent.event_date <= end)
    return list(
        await db.scalars(query.order_by(CalendarEvent.event_date, CalendarEvent.event_time))
    )


@router.post("", response_model=CalendarEventRead, status_code=status.HTTP_201_CREATED)
async def create_event(
    payload: CalendarEventCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CalendarEvent:
    event = CalendarEvent(owner_id=user.id, **payload.model_dump())
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return event


@router.patch("/{event_id}", response_model=CalendarEventRead)
async def update_event(
    event_id: UUID,
    payload: CalendarEventUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CalendarEvent:
    event = await owned_event(event_id, user, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, field, value)
    await db.commit()
    await db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> Response:
    event = await owned_event(event_id, user, db)
    await db.delete(event)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

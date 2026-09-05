from datetime import UTC, date, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.modules.calendar.model import CalendarEvent
from app.modules.dashboard.schemas import (
    DashboardNotification,
    DashboardOverview,
    DashboardRecentDocument,
)
from app.modules.documents.model import Document
from app.modules.users.model import User

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _document_path(document: Document) -> str:
    source_route = (document.metadata_json or {}).get("source_route")
    if isinstance(source_route, str) and source_route.startswith("/dashboard/"):
        return source_route
    return "/dashboard/historial"


def _tool_id(document_type: str) -> str:
    return document_type.rsplit("/", 1)[-1]


@router.get("/overview", response_model=DashboardOverview)
async def dashboard_overview(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardOverview:
    active_filter = (Document.owner_id == user.id, Document.status != "trashed")
    document_count = int(
        await db.scalar(select(func.count(Document.id)).where(*active_filter)) or 0
    )
    recent_documents = list(
        await db.scalars(
            select(Document)
            .where(*active_filter)
            .order_by(Document.updated_at.desc())
            .limit(5)
        )
    )
    usage_rows = (
        await db.execute(
            select(Document.document_type, func.count(Document.id).label("uses"))
            .where(*active_filter)
            .group_by(Document.document_type)
            .order_by(desc("uses"), Document.document_type)
            .limit(8)
        )
    ).all()

    today = date.today()
    upcoming_events = list(
        await db.scalars(
            select(CalendarEvent)
            .where(
                CalendarEvent.owner_id == user.id,
                CalendarEvent.completed.is_(False),
                CalendarEvent.event_date >= today,
                CalendarEvent.event_date <= today + timedelta(days=45),
            )
            .order_by(CalendarEvent.event_date, CalendarEvent.event_time)
            .limit(2)
        )
    )
    notifications = [
        DashboardNotification(
            id=f"event-{event.id}",
            message=(
                f"{event.title} · "
                f"{event.event_date.strftime('%d/%m')}"
            ),
            path=(
                f"/dashboard/calendario?month={event.event_date.month}"
                f"&year={event.event_date.year}&event={event.id}"
            ),
            event_date=event.event_date,
        )
        for event in upcoming_events
    ]
    if recent_documents:
        latest = recent_documents[0]
        notifications.append(
            DashboardNotification(
                id=f"document-{latest.id}",
                message=f"Continúa: {latest.title}",
                path=f"{_document_path(latest)}?document={latest.id}",
            )
        )
    else:
        notifications.append(
            DashboardNotification(
                id="first-document",
                message="Crea tu primer documento para iniciar tu historial docente.",
                path="/dashboard",
            )
        )

    return DashboardOverview(
        document_count=document_count,
        recent_documents=[
            DashboardRecentDocument(
                id=document.id,
                title=document.title,
                status=document.status,
                path=_document_path(document),
                updated_at=document.updated_at,
            )
            for document in recent_documents
        ],
        most_used_tool_ids=[_tool_id(row.document_type) for row in usage_rows],
        notifications=notifications[:3],
        generated_at=datetime.now(UTC),
    )

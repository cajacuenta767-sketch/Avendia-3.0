from datetime import UTC, date, datetime, time, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import case, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.config import get_settings
from app.db.session import get_db
from app.modules.admin.model import AdminAuditLog, AIGenerationQualityEvent, AIUsageEvent
from app.modules.admin.schemas import (
    ActivityPoint,
    AdminAlert,
    AdminContentSummary,
    AdminDashboardResponse,
    AdminKpis,
    AdminSystemStatus,
    AdminTokenAccount,
    AdminUsageSummary,
    AdminUserDetail,
    AdminUserListItem,
    AdminUserListResponse,
    AIQualitySummary,
    AIUsageEntry,
    AIUsageListResponse,
    AuditEntry,
    AuditListResponse,
    CreditAdjustment,
    PlatformSettingsRead,
    PlatformSettingsUpdate,
    RankedAIUsage,
    RecentCalendarEvent,
    RecentDocument,
    SegmentValue,
    UserAdminUpdate,
)
from app.modules.admin.service import add_admin_audit, get_platform_settings
from app.modules.calendar.model import CalendarEvent
from app.modules.documents.model import Document
from app.modules.users.model import User, UserRole

router = APIRouter(prefix="/admin", tags=["admin"])

ROLE_LABELS = {"teacher": "Docentes", "admin": "Administradores"}
STATUS_LABELS = {"active": "Activas", "inactive": "Inactivas"}


async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso de administrador requerido",
        )
    return user


def _since(days: int) -> tuple[date, datetime]:
    start_date = datetime.now(UTC).date() - timedelta(days=days - 1)
    return start_date, datetime.combine(start_date, time.min, tzinfo=UTC)


def _segment(
    rows: list[tuple[object, int]], labels: dict[str, str] | None = None
) -> list[SegmentValue]:
    return [
        SegmentValue(
            key=str(key or "Sin dato"),
            label=(labels or {}).get(str(key), str(key or "Sin dato")),
            value=int(value),
        )
        for key, value in rows
    ]


async def _audit_entries(
    db: AsyncSession,
    *,
    limit: int,
    action: str | None = None,
    search: str | None = None,
) -> list[AuditEntry]:
    query = select(AdminAuditLog, User.full_name).outerjoin(User, User.id == AdminAuditLog.actor_id)
    if action:
        query = query.where(AdminAuditLog.action == action)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(
                AdminAuditLog.action.ilike(pattern),
                AdminAuditLog.reason.ilike(pattern),
                User.full_name.ilike(pattern),
            )
        )
    rows = (await db.execute(query.order_by(AdminAuditLog.created_at.desc()).limit(limit))).all()
    return [
        AuditEntry(
            id=entry.id,
            actor_id=entry.actor_id,
            actor_name=actor_name or "Cuenta eliminada",
            action=entry.action,
            target_type=entry.target_type,
            target_id=entry.target_id,
            reason=entry.reason,
            detail=entry.detail_json,
            created_at=entry.created_at,
        )
        for entry, actor_name in rows
    ]


@router.get("/dashboard", response_model=AdminDashboardResponse)
async def dashboard(
    days: int = Query(30, ge=7, le=90),
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminDashboardResponse:
    start_date, start_datetime = _since(days)
    today = datetime.now(UTC).date()
    settings = await get_platform_settings(db)
    await db.commit()

    user_stats = (
        await db.execute(
            select(
                func.count(User.id),
                func.coalesce(func.sum(case((User.is_active.is_(True), 1), else_=0)), 0),
                func.coalesce(func.sum(case((User.is_active.is_(False), 1), else_=0)), 0),
                func.coalesce(func.sum(case((User.role == UserRole.TEACHER, 1), else_=0)), 0),
                func.coalesce(func.sum(case((User.role == UserRole.ADMIN, 1), else_=0)), 0),
                func.coalesce(func.sum(User.ai_credits_balance), 0),
                func.coalesce(func.sum(User.ai_credits_total), 0),
                func.coalesce(func.sum(User.ai_tokens_consumed), 0),
                func.coalesce(func.sum(User.ai_generations), 0),
                func.coalesce(
                    func.sum(
                        case((User.ai_credits_balance <= settings.low_credit_threshold, 1), else_=0)
                    ),
                    0,
                ),
            )
        )
    ).one()
    users_created_period = int(
        await db.scalar(select(func.count(User.id)).where(User.created_at >= start_datetime)) or 0
    )

    document_stats = (
        await db.execute(
            select(
                func.count(Document.id),
                func.coalesce(
                    func.sum(case((Document.created_at >= start_datetime, 1), else_=0)), 0
                ),
            )
        )
    ).one()
    event_stats = (
        await db.execute(
            select(
                func.count(CalendarEvent.id),
                func.coalesce(
                    func.sum(case((CalendarEvent.created_at >= start_datetime, 1), else_=0)), 0
                ),
                func.coalesce(func.sum(case((CalendarEvent.event_date >= today, 1), else_=0)), 0),
                func.coalesce(func.sum(case((CalendarEvent.completed.is_(True), 1), else_=0)), 0),
            )
        )
    ).one()

    tracked_stats = (
        await db.execute(
            select(
                func.count(AIUsageEvent.id),
                func.coalesce(func.sum(AIUsageEvent.credit_cost), 0),
                func.min(AIUsageEvent.created_at),
            ).where(AIUsageEvent.created_at >= start_datetime)
        )
    ).one()
    tracking_started_at = await db.scalar(select(func.min(AIUsageEvent.created_at)))
    tracked_count = int(tracked_stats[0])
    average_cost = round(int(tracked_stats[1]) / tracked_count, 2) if tracked_count else None

    activity = {
        start_date + timedelta(days=index): ActivityPoint(date=start_date + timedelta(days=index))
        for index in range(days)
    }
    activity_sources = (
        (User, "registrations"),
        (Document, "documents"),
        (CalendarEvent, "calendar_events"),
        (AIUsageEvent, "ai_generations"),
    )
    for model, field in activity_sources:
        timestamps = await db.scalars(
            select(model.created_at).where(model.created_at >= start_datetime)
        )
        for created_at in timestamps:
            day = created_at.date()
            if day in activity:
                setattr(activity[day], field, getattr(activity[day], field) + 1)

    users_by_role = _segment(
        list((await db.execute(select(User.role, func.count(User.id)).group_by(User.role))).all()),
        ROLE_LABELS,
    )
    users_by_status = _segment(
        [
            ("active", int(user_stats[1])),
            ("inactive", int(user_stats[2])),
        ],
        STATUS_LABELS,
    )
    users_by_modality = _segment(
        list(
            (
                await db.execute(
                    select(User.education_modality, func.count(User.id))
                    .group_by(User.education_modality)
                    .order_by(func.count(User.id).desc())
                )
            ).all()
        )
    )
    users_by_level = _segment(
        list(
            (
                await db.execute(
                    select(User.education_level, func.count(User.id))
                    .group_by(User.education_level)
                    .order_by(func.count(User.id).desc())
                )
            ).all()
        )
    )

    tool_rows = (
        await db.execute(
            select(
                AIUsageEvent.tool_id,
                func.count(AIUsageEvent.id),
                func.coalesce(func.sum(AIUsageEvent.credit_cost), 0),
                func.coalesce(func.sum(AIUsageEvent.estimated_tokens), 0),
            )
            .where(AIUsageEvent.created_at >= start_datetime)
            .group_by(AIUsageEvent.tool_id)
            .order_by(func.sum(AIUsageEvent.credit_cost).desc())
            .limit(10)
        )
    ).all()
    user_rows = (
        await db.execute(
            select(
                User.id,
                User.full_name,
                func.count(AIUsageEvent.id),
                func.coalesce(func.sum(AIUsageEvent.credit_cost), 0),
                func.coalesce(func.sum(AIUsageEvent.estimated_tokens), 0),
            )
            .join(AIUsageEvent, AIUsageEvent.user_id == User.id)
            .where(AIUsageEvent.created_at >= start_datetime)
            .group_by(User.id, User.full_name)
            .order_by(func.sum(AIUsageEvent.credit_cost).desc())
            .limit(10)
        )
    ).all()
    alerts: list[AdminAlert] = []
    if int(user_stats[9]) > 0:
        alerts.append(
            AdminAlert(
                id="low-credit",
                severity="warning",
                title="Cuentas con saldo bajo",
                detail=f"Saldo igual o menor a {settings.low_credit_threshold:,} créditos.",
                count=int(user_stats[9]),
                tab="users",
            )
        )
    if int(user_stats[2]) > 0:
        alerts.append(
            AdminAlert(
                id="inactive-users",
                severity="neutral",
                title="Cuentas inactivas",
                detail="Revisa si deben reactivarse o permanecer bloqueadas.",
                count=int(user_stats[2]),
                tab="users",
            )
        )
    gemini_key = get_settings().gemini_api_key
    if not (gemini_key and gemini_key.get_secret_value().strip()):
        alerts.append(
            AdminAlert(
                id="gemini-unconfigured",
                severity="critical",
                title="Gemini no está configurado",
                detail="Las herramientas de generación no estarán disponibles.",
                count=1,
                tab="settings",
            )
        )

    return AdminDashboardResponse(
        generated_at=datetime.now(UTC),
        period_days=days,
        usage_tracking_started_at=tracking_started_at,
        kpis=AdminKpis(
            users_total=int(user_stats[0]),
            users_active=int(user_stats[1]),
            users_inactive=int(user_stats[2]),
            teachers=int(user_stats[3]),
            admins=int(user_stats[4]),
            users_created_period=users_created_period,
            credits_available=int(user_stats[5]),
            credits_assigned=int(user_stats[6]),
            tokens_consumed=int(user_stats[7]),
            generations_total=int(user_stats[8]),
            generations_period=tracked_count,
            documents_total=int(document_stats[0]),
            documents_period=int(document_stats[1]),
            calendar_events_total=int(event_stats[0]),
            calendar_events_period=int(event_stats[1]),
            calendar_events_upcoming=int(event_stats[2]),
            calendar_events_completed=int(event_stats[3]),
            low_credit_accounts=int(user_stats[9]),
            average_credits_per_tracked_generation=average_cost,
        ),
        activity=list(activity.values()),
        users_by_role=users_by_role,
        users_by_status=users_by_status,
        users_by_modality=users_by_modality,
        users_by_level=users_by_level,
        ai_by_tool=[
            RankedAIUsage(
                key=str(tool_id),
                label=str(tool_id).replace("-", " ").title(),
                generations=int(generations),
                credits=int(credits),
                tokens=int(tokens),
            )
            for tool_id, generations, credits, tokens in tool_rows
        ],
        ai_by_user=[
            RankedAIUsage(
                key=str(user_id),
                label=str(full_name),
                generations=int(generations),
                credits=int(credits),
                tokens=int(tokens),
            )
            for user_id, full_name, generations, credits, tokens in user_rows
        ],
        alerts=alerts,
        recent_audit=await _audit_entries(db, limit=6),
    )


@router.get("/users", response_model=AdminUserListResponse)
async def list_users(
    search: str | None = Query(None, max_length=160),
    role: str | None = Query(None, pattern=r"^(teacher|admin)$"),
    active: bool | None = None,
    modality: str | None = Query(None, max_length=32),
    level: str | None = Query(None, max_length=64),
    sort: str = Query("newest", pattern=r"^(newest|name|credits|usage)$"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminUserListResponse:
    filters = []
    if search:
        pattern = f"%{search.strip()}%"
        filters.append(
            or_(
                User.full_name.ilike(pattern),
                User.email.ilike(pattern),
                User.school_name.ilike(pattern),
            )
        )
    if role:
        filters.append(User.role == role)
    if active is not None:
        filters.append(User.is_active.is_(active))
    if modality:
        filters.append(User.education_modality == modality)
    if level:
        filters.append(User.education_level == level)

    total_query = select(func.count(User.id))
    query = select(User)
    if filters:
        total_query = total_query.where(*filters)
        query = query.where(*filters)
    order = {
        "newest": User.created_at.desc(),
        "name": User.full_name,
        "credits": User.ai_credits_balance.asc(),
        "usage": User.ai_generations.desc(),
    }[sort]
    users = list(await db.scalars(query.order_by(order).offset(offset).limit(limit)))
    total = int(await db.scalar(total_query) or 0)
    ids = [user.id for user in users]
    doc_stats: dict[UUID, tuple[int, datetime | None]] = {}
    event_stats: dict[UUID, tuple[int, datetime | None]] = {}
    ai_last: dict[UUID, datetime] = {}
    if ids:
        doc_stats = {
            owner_id: (int(count), updated_at)
            for owner_id, count, updated_at in (
                await db.execute(
                    select(
                        Document.owner_id, func.count(Document.id), func.max(Document.updated_at)
                    )
                    .where(Document.owner_id.in_(ids))
                    .group_by(Document.owner_id)
                )
            ).all()
        }
        event_stats = {
            owner_id: (int(count), updated_at)
            for owner_id, count, updated_at in (
                await db.execute(
                    select(
                        CalendarEvent.owner_id,
                        func.count(CalendarEvent.id),
                        func.max(CalendarEvent.updated_at),
                    )
                    .where(CalendarEvent.owner_id.in_(ids))
                    .group_by(CalendarEvent.owner_id)
                )
            ).all()
        }
        ai_last = {
            user_id: created_at
            for user_id, created_at in (
                await db.execute(
                    select(AIUsageEvent.user_id, func.max(AIUsageEvent.created_at))
                    .where(AIUsageEvent.user_id.in_(ids))
                    .group_by(AIUsageEvent.user_id)
                )
            ).all()
        }

    items: list[AdminUserListItem] = []
    for user in users:
        activity_dates = [user.updated_at]
        if doc_stats.get(user.id, (0, None))[1]:
            activity_dates.append(doc_stats[user.id][1])
        if event_stats.get(user.id, (0, None))[1]:
            activity_dates.append(event_stats[user.id][1])
        if ai_last.get(user.id):
            activity_dates.append(ai_last[user.id])
        items.append(
            AdminUserListItem(
                id=user.id,
                full_name=user.full_name,
                email=user.email,
                school_name=user.school_name,
                role=user.role,
                is_active=user.is_active,
                education_modality=user.education_modality,
                education_level=user.education_level,
                grade=user.grade,
                ai_credits_balance=user.ai_credits_balance,
                ai_credits_total=user.ai_credits_total,
                ai_tokens_consumed=user.ai_tokens_consumed,
                ai_generations=user.ai_generations,
                documents_count=doc_stats.get(user.id, (0, None))[0],
                events_count=event_stats.get(user.id, (0, None))[0],
                last_activity_at=max(activity_dates),
                created_at=user.created_at,
            )
        )
    return AdminUserListResponse(items=items, total=total, limit=limit, offset=offset)


@router.get("/users/{user_id}", response_model=AdminUserDetail)
async def user_detail(
    user_id: UUID,
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminUserDetail:
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    documents = list(
        await db.scalars(
            select(Document)
            .where(Document.owner_id == user.id)
            .order_by(Document.updated_at.desc())
            .limit(8)
        )
    )
    events = list(
        await db.scalars(
            select(CalendarEvent)
            .where(CalendarEvent.owner_id == user.id)
            .order_by(CalendarEvent.event_date.desc())
            .limit(8)
        )
    )
    ai_rows = (
        await db.execute(
            select(AIUsageEvent, User.full_name)
            .join(User, User.id == AIUsageEvent.user_id)
            .where(AIUsageEvent.user_id == user.id)
            .order_by(AIUsageEvent.created_at.desc())
            .limit(8)
        )
    ).all()
    documents_count = int(
        await db.scalar(select(func.count(Document.id)).where(Document.owner_id == user.id)) or 0
    )
    events_count = int(
        await db.scalar(
            select(func.count(CalendarEvent.id)).where(CalendarEvent.owner_id == user.id)
        )
        or 0
    )
    last_dates = [user.updated_at]
    last_dates.extend(document.updated_at for document in documents)
    last_dates.extend(event.updated_at for event in events)
    last_dates.extend(entry.created_at for entry, _ in ai_rows)
    return AdminUserDetail(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        school_name=user.school_name,
        role=user.role,
        is_active=user.is_active,
        education_modality=user.education_modality,
        education_level=user.education_level,
        grade=user.grade,
        ai_credits_balance=user.ai_credits_balance,
        ai_credits_total=user.ai_credits_total,
        ai_tokens_consumed=user.ai_tokens_consumed,
        ai_generations=user.ai_generations,
        documents_count=documents_count,
        events_count=events_count,
        last_activity_at=max(last_dates),
        created_at=user.created_at,
        dre=user.dre,
        ugel=user.ugel,
        director_name=user.director_name,
        section=user.section,
        curricular_area=user.curricular_area,
        school_year=user.school_year,
        recent_documents=[
            RecentDocument.model_validate(document, from_attributes=True) for document in documents
        ],
        recent_calendar_events=[
            RecentCalendarEvent.model_validate(event, from_attributes=True) for event in events
        ],
        recent_ai_usage=[
            AIUsageEntry(
                id=entry.id,
                user_id=entry.user_id,
                user_name=user_name,
                tool_id=entry.tool_id,
                module=entry.module,
                model=entry.model,
                credit_cost=entry.credit_cost,
                estimated_tokens=entry.estimated_tokens,
                created_at=entry.created_at,
            )
            for entry, user_name in ai_rows
        ],
    )


@router.patch("/users/{user_id}", response_model=AdminTokenAccount)
async def update_user(
    user_id: UUID,
    payload: UserAdminUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> User:
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if user.id == admin.id and payload.is_active is False:
        raise HTTPException(status_code=422, detail="No puedes desactivar tu propia cuenta")

    removing_admin = user.role == UserRole.ADMIN and (
        payload.role == UserRole.TEACHER or payload.is_active is False
    )
    if removing_admin and user.is_active:
        active_admins = int(
            await db.scalar(
                select(func.count(User.id)).where(
                    User.role == UserRole.ADMIN, User.is_active.is_(True)
                )
            )
            or 0
        )
        if active_admins <= 1:
            raise HTTPException(
                status_code=422,
                detail="Debe permanecer al menos un administrador activo",
            )

    before = {"role": user.role, "is_active": user.is_active}
    if payload.role is not None:
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active
    after = {"role": user.role, "is_active": user.is_active}
    add_admin_audit(
        db,
        actor_id=admin.id,
        action="user_updated",
        target_type="user",
        target_id=str(user.id),
        reason=payload.reason,
        detail={"before": before, "after": after},
    )
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/ai-usage/summary", response_model=AdminUsageSummary)
async def usage_summary(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminUsageSummary:
    row = (
        await db.execute(
            select(
                func.count(User.id),
                func.coalesce(func.sum(User.ai_credits_balance), 0),
                func.coalesce(func.sum(User.ai_credits_total), 0),
                func.coalesce(func.sum(User.ai_tokens_consumed), 0),
                func.coalesce(func.sum(User.ai_generations), 0),
            )
        )
    ).one()
    return AdminUsageSummary(
        users_total=row[0],
        credits_available=row[1],
        credits_assigned=row[2],
        tokens_consumed=row[3],
        generations=row[4],
    )


@router.get("/ai-usage/accounts", response_model=list[AdminTokenAccount])
async def usage_accounts(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> list[User]:
    return list((await db.scalars(select(User).order_by(User.full_name))).all())


@router.patch("/ai-usage/accounts/{user_id}", response_model=AdminTokenAccount)
async def adjust_credits(
    user_id: UUID,
    payload: CreditAdjustment,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> User:
    user = await db.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    previous_balance = user.ai_credits_balance
    new_balance = previous_balance + payload.amount
    if new_balance < 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El saldo no puede quedar negativo",
        )
    user.ai_credits_balance = new_balance
    if payload.amount > 0:
        user.ai_credits_total += payload.amount
    add_admin_audit(
        db,
        actor_id=admin.id,
        action="credits_adjusted",
        target_type="user",
        target_id=str(user.id),
        reason=payload.reason,
        detail={
            "amount": payload.amount,
            "previous_balance": previous_balance,
            "new_balance": new_balance,
        },
    )
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/ai-usage/events", response_model=AIUsageListResponse)
async def usage_events(
    days: int = Query(30, ge=1, le=365),
    module: str | None = Query(None, max_length=80),
    tool: str | None = Query(None, max_length=100),
    user_id: UUID | None = None,
    limit: int = Query(100, ge=1, le=500),
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AIUsageListResponse:
    _, start_datetime = _since(days)
    filters = [AIUsageEvent.created_at >= start_datetime]
    if module:
        filters.append(AIUsageEvent.module == module)
    if tool:
        filters.append(AIUsageEvent.tool_id == tool)
    if user_id:
        filters.append(AIUsageEvent.user_id == user_id)
    total = int(await db.scalar(select(func.count(AIUsageEvent.id)).where(*filters)) or 0)
    rows = (
        await db.execute(
            select(AIUsageEvent, User.full_name)
            .join(User, User.id == AIUsageEvent.user_id)
            .where(*filters)
            .order_by(AIUsageEvent.created_at.desc())
            .limit(limit)
        )
    ).all()
    quality_filters = [AIGenerationQualityEvent.created_at >= start_datetime]
    if module:
        quality_filters.append(AIGenerationQualityEvent.module == module)
    if tool:
        quality_filters.append(AIGenerationQualityEvent.tool_id == tool)
    if user_id:
        quality_filters.append(AIGenerationQualityEvent.user_id == user_id)
    quality_row = (
        await db.execute(
            select(
                func.count(AIGenerationQualityEvent.id),
                func.coalesce(
                    func.sum(
                        case((AIGenerationQualityEvent.outcome == "completed", 1), else_=0)
                    ),
                    0,
                ),
                func.coalesce(
                    func.sum(
                        case((AIGenerationQualityEvent.outcome == "repaired", 1), else_=0)
                    ),
                    0,
                ),
                func.coalesce(
                    func.sum(
                        case(
                            (
                                (AIGenerationQualityEvent.outcome == "rejected")
                                & (AIGenerationQualityEvent.credit_charged == 0),
                                1,
                            ),
                            else_=0,
                        )
                    ),
                    0,
                ),
                func.coalesce(func.sum(AIGenerationQualityEvent.credit_charged), 0),
            ).where(*quality_filters)
        )
    ).one()
    return AIUsageListResponse(
        total=total,
        quality=AIQualitySummary(
            attempts=int(quality_row[0]),
            completed=int(quality_row[1]),
            repaired=int(quality_row[2]),
            rejected_without_charge=int(quality_row[3]),
            credits_charged=int(quality_row[4]),
        ),
        items=[
            AIUsageEntry(
                id=entry.id,
                user_id=entry.user_id,
                user_name=user_name,
                tool_id=entry.tool_id,
                module=entry.module,
                model=entry.model,
                credit_cost=entry.credit_cost,
                estimated_tokens=entry.estimated_tokens,
                created_at=entry.created_at,
            )
            for entry, user_name in rows
        ],
    )


@router.get("/content", response_model=AdminContentSummary)
async def content_summary(
    days: int = Query(30, ge=7, le=90),
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminContentSummary:
    _, start_datetime = _since(days)
    today = datetime.now(UTC).date()
    documents_total = int(await db.scalar(select(func.count(Document.id))) or 0)
    documents_period = int(
        await db.scalar(
            select(func.count(Document.id)).where(Document.created_at >= start_datetime)
        )
        or 0
    )
    events_total = int(await db.scalar(select(func.count(CalendarEvent.id))) or 0)
    events_period = int(
        await db.scalar(
            select(func.count(CalendarEvent.id)).where(CalendarEvent.created_at >= start_datetime)
        )
        or 0
    )
    upcoming_events = int(
        await db.scalar(
            select(func.count(CalendarEvent.id)).where(CalendarEvent.event_date >= today)
        )
        or 0
    )
    completed_events = int(
        await db.scalar(
            select(func.count(CalendarEvent.id)).where(CalendarEvent.completed.is_(True))
        )
        or 0
    )
    document_types = _segment(
        list(
            (
                await db.execute(
                    select(Document.document_type, func.count(Document.id))
                    .group_by(Document.document_type)
                    .order_by(func.count(Document.id).desc())
                )
            ).all()
        )
    )
    event_types = _segment(
        list(
            (
                await db.execute(
                    select(CalendarEvent.event_type, func.count(CalendarEvent.id))
                    .group_by(CalendarEvent.event_type)
                    .order_by(func.count(CalendarEvent.id).desc())
                )
            ).all()
        )
    )
    recent_documents = (
        await db.execute(
            select(Document, User.full_name)
            .join(User, User.id == Document.owner_id)
            .order_by(Document.updated_at.desc())
            .limit(20)
        )
    ).all()
    recent_events = (
        await db.execute(
            select(CalendarEvent, User.full_name)
            .join(User, User.id == CalendarEvent.owner_id)
            .order_by(CalendarEvent.updated_at.desc())
            .limit(20)
        )
    ).all()
    return AdminContentSummary(
        documents_total=documents_total,
        documents_period=documents_period,
        events_total=events_total,
        events_period=events_period,
        upcoming_events=upcoming_events,
        completed_events=completed_events,
        documents_by_type=document_types,
        events_by_type=event_types,
        recent_documents=[
            {
                "id": str(document.id),
                "title": document.title,
                "document_type": document.document_type,
                "status": document.status,
                "owner_name": owner_name,
                "updated_at": document.updated_at.isoformat(),
            }
            for document, owner_name in recent_documents
        ],
        recent_events=[
            {
                "id": str(event.id),
                "title": event.title,
                "event_date": event.event_date.isoformat(),
                "event_type": event.event_type,
                "completed": event.completed,
                "owner_name": owner_name,
                "updated_at": event.updated_at.isoformat(),
            }
            for event, owner_name in recent_events
        ],
    )


@router.get("/audit", response_model=AuditListResponse)
async def audit_log(
    action: str | None = Query(None, max_length=80),
    search: str | None = Query(None, max_length=160),
    limit: int = Query(100, ge=1, le=500),
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AuditListResponse:
    count_query = select(func.count(AdminAuditLog.id))
    if action:
        count_query = count_query.where(AdminAuditLog.action == action)
    if search:
        pattern = f"%{search.strip()}%"
        count_query = count_query.outerjoin(User, User.id == AdminAuditLog.actor_id).where(
            or_(
                AdminAuditLog.action.ilike(pattern),
                AdminAuditLog.reason.ilike(pattern),
                User.full_name.ilike(pattern),
            )
        )
    total = int(await db.scalar(count_query) or 0)
    return AuditListResponse(
        total=total,
        items=await _audit_entries(db, limit=limit, action=action, search=search),
    )


@router.get("/settings", response_model=PlatformSettingsRead)
async def read_settings(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> PlatformSettingsRead:
    settings = await get_platform_settings(db)
    await db.commit()
    await db.refresh(settings)
    return settings


@router.patch("/settings", response_model=PlatformSettingsRead)
async def update_settings(
    payload: PlatformSettingsUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> PlatformSettingsRead:
    settings = await get_platform_settings(db)
    before = {
        "registration_open": settings.registration_open,
        "default_ai_credits": settings.default_ai_credits,
        "low_credit_threshold": settings.low_credit_threshold,
    }
    settings.registration_open = payload.registration_open
    settings.default_ai_credits = payload.default_ai_credits
    settings.low_credit_threshold = payload.low_credit_threshold
    after = {
        "registration_open": settings.registration_open,
        "default_ai_credits": settings.default_ai_credits,
        "low_credit_threshold": settings.low_credit_threshold,
    }
    add_admin_audit(
        db,
        actor_id=admin.id,
        action="settings_updated",
        target_type="platform_settings",
        target_id="1",
        reason=payload.reason,
        detail={"before": before, "after": after},
    )
    await db.commit()
    await db.refresh(settings)
    return settings


@router.get("/system/status", response_model=AdminSystemStatus)
async def system_status(
    _admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
) -> AdminSystemStatus:
    database_status = "ok"
    try:
        await db.execute(select(1))
    except Exception:
        database_status = "error"
    settings = get_settings()
    gemini_key = settings.gemini_api_key
    return AdminSystemStatus(
        api="ok",
        database=database_status,
        gemini_configured=bool(gemini_key and gemini_key.get_secret_value().strip()),
        gemini_model=settings.gemini_model,
        environment=settings.environment,
        checked_at=datetime.now(UTC),
    )

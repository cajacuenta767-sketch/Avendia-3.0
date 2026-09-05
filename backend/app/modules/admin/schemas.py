from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator


class AdminUsageSummary(BaseModel):
    users_total: int
    credits_available: int
    credits_assigned: int
    tokens_consumed: int
    generations: int


class AdminTokenAccount(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    email: str
    role: str
    is_active: bool
    ai_credits_balance: int
    ai_credits_total: int
    ai_tokens_consumed: int
    ai_generations: int
    created_at: datetime


class CreditAdjustment(BaseModel):
    amount: int = Field(ge=-100_000, le=100_000)
    reason: str = Field(min_length=3, max_length=240)


class AdminKpis(BaseModel):
    users_total: int
    users_active: int
    users_inactive: int
    teachers: int
    admins: int
    users_created_period: int
    credits_available: int
    credits_assigned: int
    tokens_consumed: int
    generations_total: int
    generations_period: int
    documents_total: int
    documents_period: int
    calendar_events_total: int
    calendar_events_period: int
    calendar_events_upcoming: int
    calendar_events_completed: int
    low_credit_accounts: int
    average_credits_per_tracked_generation: float | None


class ActivityPoint(BaseModel):
    date: date
    registrations: int = 0
    documents: int = 0
    calendar_events: int = 0
    ai_generations: int = 0


class SegmentValue(BaseModel):
    key: str
    label: str
    value: int


class RankedAIUsage(BaseModel):
    key: str
    label: str
    generations: int
    credits: int
    tokens: int


class AdminAlert(BaseModel):
    id: str
    severity: str
    title: str
    detail: str
    count: int
    tab: str


class AuditEntry(BaseModel):
    id: UUID
    actor_id: UUID | None
    actor_name: str
    action: str
    target_type: str
    target_id: str | None
    reason: str
    detail: dict[str, object]
    created_at: datetime


class AdminDashboardResponse(BaseModel):
    generated_at: datetime
    period_days: int
    usage_tracking_started_at: datetime | None
    kpis: AdminKpis
    activity: list[ActivityPoint]
    users_by_role: list[SegmentValue]
    users_by_status: list[SegmentValue]
    users_by_modality: list[SegmentValue]
    users_by_level: list[SegmentValue]
    ai_by_tool: list[RankedAIUsage]
    ai_by_user: list[RankedAIUsage]
    alerts: list[AdminAlert]
    recent_audit: list[AuditEntry]


class AdminUserListItem(BaseModel):
    id: UUID
    full_name: str
    email: str
    phone: str | None
    school_name: str
    role: str
    is_active: bool
    subscription_start: datetime | None
    subscription_end: datetime | None
    created_by_admin: str | None
    updated_by_admin: str | None
    education_modality: str
    education_level: str
    grade: str
    ai_credits_balance: int
    ai_credits_total: int
    ai_tokens_consumed: int
    ai_generations: int
    documents_count: int
    events_count: int
    last_activity_at: datetime
    created_at: datetime


class AdminUserListResponse(BaseModel):
    items: list[AdminUserListItem]
    total: int
    limit: int
    offset: int
    teachers_count: int
    admins_count: int


class RecentDocument(BaseModel):
    id: UUID
    title: str
    document_type: str
    status: str
    updated_at: datetime


class RecentCalendarEvent(BaseModel):
    id: UUID
    title: str
    event_date: date
    event_type: str
    completed: bool


class AIUsageEntry(BaseModel):
    id: UUID
    user_id: UUID
    user_name: str
    tool_id: str
    module: str
    model: str
    credit_cost: int
    estimated_tokens: int
    created_at: datetime


class AIQualitySummary(BaseModel):
    attempts: int = 0
    completed: int = 0
    repaired: int = 0
    rejected_without_charge: int = 0
    credits_charged: int = 0


class AdminUserDetail(AdminUserListItem):
    dre: str
    ugel: str
    director_name: str
    section: str
    curricular_area: str
    school_year: int
    recent_documents: list[RecentDocument]
    recent_calendar_events: list[RecentCalendarEvent]
    recent_ai_usage: list[AIUsageEntry]


class UserAdminCreate(BaseModel):
    full_name: str
    email: str
    phone: str | None = None
    role: str = Field(pattern=r"^(teacher|admin)$")
    subscription_end: datetime | None = None
    password: str

    dre: str | None = "Sin asignar"
    ugel: str | None = "Sin asignar"
    school_name: str | None = "Sin asignar"
    director_name: str | None = "Sin asignar"
    education_modality: str | None = "EBR"
    education_level: str | None = "Secundaria"
    grade: str | None = "N/A"
    section: str | None = "N/A"
    curricular_area: str | None = "N/A"
    school_year: int | None = 2024


class UserAdminUpdate(BaseModel):
    role: str | None = Field(default=None, pattern=r"^(teacher|admin)$")
    is_active: bool | None = None
    phone: str | None = None
    subscription_end: datetime | None = None
    reason: str = Field(min_length=3, max_length=240)

    @model_validator(mode="after")
    def require_change(self) -> "UserAdminUpdate":
        if (
            self.role is None
            and self.is_active is None
            and self.phone is None
            and self.subscription_end is None
        ):
            raise ValueError("At least one administrative change is required")
        return self


class AdminContentSummary(BaseModel):
    documents_total: int
    documents_period: int
    events_total: int
    events_period: int
    upcoming_events: int
    completed_events: int
    documents_by_type: list[SegmentValue]
    events_by_type: list[SegmentValue]
    recent_documents: list[dict[str, object]]
    recent_events: list[dict[str, object]]


class AuditListResponse(BaseModel):
    items: list[AuditEntry]
    total: int


class AIUsageListResponse(BaseModel):
    items: list[AIUsageEntry]
    total: int
    quality: AIQualitySummary = Field(default_factory=AIQualitySummary)


class PlatformSettingsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    registration_open: bool
    default_ai_credits: int
    low_credit_threshold: int
    updated_at: datetime


class PlatformSettingsUpdate(BaseModel):
    registration_open: bool
    default_ai_credits: int = Field(ge=0, le=1_000_000)
    low_credit_threshold: int = Field(ge=0, le=1_000_000)
    reason: str = Field(min_length=3, max_length=240)


class AdminSystemStatus(BaseModel):
    api: str
    database: str
    gemini_configured: bool
    gemini_model: str
    environment: str
    checked_at: datetime

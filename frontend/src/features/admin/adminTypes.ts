export type Segment = { key: string; label: string; value: number };
export type RankedUsage = { key: string; label: string; generations: number; credits: number; tokens: number };
export type ActivityPoint = { date: string; registrations: number; documents: number; calendar_events: number; ai_generations: number };
export type AuditEntry = { id: string; actor_id: string | null; actor_name: string; action: string; target_type: string; target_id: string | null; reason: string; detail: Record<string, unknown>; created_at: string };
export type AdminAlert = { id: string; severity: "critical" | "warning" | "neutral"; title: string; detail: string; count: number; tab: AdminTab };

export type AdminDashboard = {
  generated_at: string;
  period_days: number;
  usage_tracking_started_at: string | null;
  kpis: {
    users_total: number; users_active: number; users_inactive: number; teachers: number; admins: number; users_created_period: number;
    credits_available: number; credits_assigned: number; tokens_consumed: number; generations_total: number; generations_period: number;
    documents_total: number; documents_period: number; calendar_events_total: number; calendar_events_period: number;
    calendar_events_upcoming: number; calendar_events_completed: number; low_credit_accounts: number;
    average_credits_per_tracked_generation: number | null;
  };
  activity: ActivityPoint[];
  users_by_role: Segment[];
  users_by_status: Segment[];
  users_by_modality: Segment[];
  users_by_level: Segment[];
  ai_by_tool: RankedUsage[];
  ai_by_user: RankedUsage[];
  alerts: AdminAlert[];
  recent_audit: AuditEntry[];
};

export type AdminUser = {
  id: string; full_name: string; email: string; school_name: string; role: "teacher" | "admin"; is_active: boolean;
  phone: string | null; subscription_start: string | null; subscription_end: string | null; created_by_admin: string | null; updated_by_admin: string | null;
  education_modality: string; education_level: string; grade: string; ai_credits_balance: number; ai_credits_total: number;
  ai_tokens_consumed: number; ai_generations: number; documents_count: number; events_count: number; last_activity_at: string; created_at: string;
};
export type AdminUsersResponse = { items: AdminUser[]; total: number; limit: number; offset: number; teachers_count: number; admins_count: number };
export type AIUsageEntry = { id: string; user_id: string; user_name: string; tool_id: string; module: string; model: string; credit_cost: number; estimated_tokens: number; created_at: string };
export type AdminUserDetail = AdminUser & {
  dre: string; ugel: string; director_name: string; section: string; curricular_area: string; school_year: number;
  recent_documents: Array<{ id: string; title: string; document_type: string; status: string; updated_at: string }>;
  recent_calendar_events: Array<{ id: string; title: string; event_date: string; event_type: string; completed: boolean }>;
  recent_ai_usage: AIUsageEntry[];
};
export type AIUsageResponse = {
  items: AIUsageEntry[];
  total: number;
  quality?: { attempts: number; completed: number; repaired: number; rejected_without_charge: number; credits_charged: number };
};
export type ContentSummary = {
  documents_total: number; documents_period: number; events_total: number; events_period: number; upcoming_events: number; completed_events: number;
  documents_by_type: Segment[]; events_by_type: Segment[];
  recent_documents: Array<Record<string, string>>; recent_events: Array<Record<string, string | boolean>>;
};
export type PlatformSettings = { registration_open: boolean; default_ai_credits: number; low_credit_threshold: number; updated_at: string };
export type SystemStatus = { api: string; database: string; gemini_configured: boolean; gemini_model: string; environment: string; checked_at: string };
export type AdminTab = "summary" | "users" | "ai" | "content" | "audit" | "settings";

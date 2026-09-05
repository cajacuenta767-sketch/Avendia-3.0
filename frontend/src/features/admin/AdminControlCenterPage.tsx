import {
  Activity, AlertTriangle, Bot, CalendarDays, CheckCircle2, ChevronRight, CircleGauge,
  Coins, Download, FileText, LoaderCircle, RefreshCw, Search, Settings2, ShieldCheck, Sparkles,
  UserCog, UsersRound, X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";

import { apiRequest } from "../../lib/api";
import { readSessionUser } from "../../lib/session";
import { ActivityChart, RankingChart, SegmentDonut } from "./AdminCharts";
import type {
  AdminDashboard, AdminTab, AdminUser, AdminUserDetail, AdminUsersResponse, AIUsageResponse,
  AuditEntry, ContentSummary, PlatformSettings, SystemStatus,
} from "./adminTypes";

const tabs: Array<{ id: AdminTab; label: string; icon: typeof CircleGauge }> = [
  { id: "summary", label: "Resumen", icon: CircleGauge }, { id: "users", label: "Usuarios", icon: UsersRound },
  { id: "ai", label: "IA y créditos", icon: Bot }, { id: "content", label: "Contenido", icon: FileText },
  { id: "audit", label: "Auditoría", icon: ShieldCheck }, { id: "settings", label: "Configuración", icon: Settings2 },
];
const validTabs = new Set(tabs.map((tab) => tab.id));
const formatNumber = new Intl.NumberFormat("es-PE");
const formatDate = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" });

function authHeaders() {
  const token = sessionStorage.getItem("avendia.accessToken");
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}
function explainError(error: unknown) { return error instanceof Error ? error.message : "No se pudo completar la solicitud."; }
function niceAction(action: string) {
  return ({ user_updated: "Cuenta actualizada", credits_adjusted: "Créditos ajustados", settings_updated: "Configuración actualizada" } as Record<string, string>)[action] ?? action.replaceAll("_", " ");
}
function CsvButton({ users }: { users: AdminUser[] }) {
  function download() {
    const columns = ["Nombre", "Correo", "Institución", "Rol", "Estado", "Modalidad", "Nivel", "Grado", "Créditos", "Generaciones", "Documentos", "Eventos"];
    const rows = users.map((user) => [user.full_name, user.email, user.school_name, user.role, user.is_active ? "Activa" : "Inactiva", user.education_modality, user.education_level, user.grade, user.ai_credits_balance, user.ai_generations, user.documents_count, user.events_count]);
    const csv = [columns, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" }));
    link.download = `usuarios-avendia-${new Date().toISOString().slice(0, 10)}.csv`; link.click(); URL.revokeObjectURL(link.href);
  }
  return <button className="admin-button admin-button--secondary" onClick={download} disabled={!users.length}><Download/> Exportar vista</button>;
}

function LoadingPanel() { return <div className="admin-state"><LoaderCircle className="is-spinning"/><strong>Cargando información real…</strong></div>; }
function ErrorPanel({ message, retry }: { message: string; retry: () => void }) { return <div className="admin-state admin-state--error"><AlertTriangle/><div><strong>No pudimos cargar esta sección</strong><p>{message}</p></div><button onClick={retry}>Reintentar</button></div>; }

export function AdminControlCenterPage() {
  const currentUser = readSessionUser();
  const [params, setParams] = useSearchParams();
  const requestedTab = params.get("tab") as AdminTab | null;
  const tab: AdminTab = requestedTab && validTabs.has(requestedTab) ? requestedTab : "summary";
  const days = [7, 30, 90].includes(Number(params.get("days"))) ? Number(params.get("days")) : 30;
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null);
  const [users, setUsers] = useState<AdminUsersResponse | null>(null);
  const [ai, setAi] = useState<AIUsageResponse | null>(null);
  const [content, setContent] = useState<ContentSummary | null>(null);
  const [audit, setAudit] = useState<{ items: AuditEntry[]; total: number } | null>(null);
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [system, setSystem] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState<AdminUserDetail | null>(null);
  const [selectedLoading, setSelectedLoading] = useState(false);

  const setView = (next: Partial<{ tab: AdminTab; days: number }>) => {
    const value = new URLSearchParams(params); if (next.tab) value.set("tab", next.tab); if (next.days) value.set("days", String(next.days)); setParams(value);
  };

  const load = useCallback(async () => {
    if (currentUser.role !== "admin") return;
    setLoading(true); setError("");
    try {
      const headers = authHeaders();
      if (tab === "summary") setDashboard(await apiRequest<AdminDashboard>(`/admin/dashboard?days=${days}`, { headers }));
      if (tab === "users") {
        const query = new URLSearchParams({ limit: "200", sort: "newest" });
        if (search.trim()) query.set("search", search.trim()); if (role) query.set("role", role); if (statusFilter) query.set("active", statusFilter);
        setUsers(await apiRequest<AdminUsersResponse>(`/admin/users?${query}`, { headers }));
      }
      if (tab === "ai") setAi(await apiRequest<AIUsageResponse>(`/admin/ai-usage/events?days=${days}&limit=300`, { headers }));
      if (tab === "content") setContent(await apiRequest<ContentSummary>(`/admin/content?days=${days}`, { headers }));
      if (tab === "audit") setAudit(await apiRequest<{ items: AuditEntry[]; total: number }>("/admin/audit?limit=300", { headers }));
      if (tab === "settings") {
        const [nextSettings, nextSystem] = await Promise.all([apiRequest<PlatformSettings>("/admin/settings", { headers }), apiRequest<SystemStatus>("/admin/system/status", { headers })]);
        setSettings(nextSettings); setSystem(nextSystem);
      }
    } catch (requestError) { setError(explainError(requestError)); } finally { setLoading(false); }
  }, [currentUser.role, days, role, search, statusFilter, tab]);

  useEffect(() => { const timer = window.setTimeout(load, search ? 280 : 0); return () => window.clearTimeout(timer); }, [load, search]);
  if (currentUser.role !== "admin") return <Navigate to="/dashboard" replace/>;

  async function openUser(id: string) {
    setSelectedLoading(true); setError("");
    try { setSelected(await apiRequest<AdminUserDetail>(`/admin/users/${id}`, { headers: authHeaders() })); } catch (requestError) { setError(explainError(requestError)); } finally { setSelectedLoading(false); }
  }
  async function changeAccount(patch: { role?: "teacher" | "admin"; is_active?: boolean }, reason: string) {
    if (!selected) return;
    await apiRequest(`/admin/users/${selected.id}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ ...patch, reason }) });
    setNotice("La cuenta se actualizó y quedó registrada en la auditoría."); await openUser(selected.id); await load();
  }
  async function adjustCredits(amount: number, reason: string) {
    if (!selected) return;
    await apiRequest(`/admin/ai-usage/accounts/${selected.id}`, { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ amount, reason }) });
    setNotice("El saldo se ajustó correctamente y quedó auditado."); await openUser(selected.id); await load();
  }

  return <main className="admin-page"><div className="admin-shell">
    <header className="admin-hero"><div><span className="admin-eyebrow"><ShieldCheck/> Centro de control</span><h1>Administración de Avendia</h1><p>Usuarios, actividad, contenido e inteligencia artificial en un solo lugar.</p></div><div className="admin-hero-actions"><label>Periodo<select value={days} onChange={(event) => setView({ days: Number(event.target.value) })}><option value="7">7 días</option><option value="30">30 días</option><option value="90">90 días</option></select></label><button className="admin-button admin-button--secondary" onClick={load} disabled={loading}><RefreshCw className={loading ? "is-spinning" : ""}/> Actualizar</button></div></header>
    {notice ? <div className="admin-notice"><CheckCircle2/>{notice}<button onClick={() => setNotice("")} aria-label="Cerrar aviso"><X/></button></div> : null}
    {error && !loading ? <ErrorPanel message={error} retry={load}/> : null}
    {loading ? <LoadingPanel/> : null}
    {!loading && !error && tab === "summary" && dashboard ? <SummaryView data={dashboard} onNavigate={(next) => setView({ tab: next })}/> : null}
    {!loading && !error && tab === "users" && users ? <UsersView data={users} search={search} onSearch={setSearch} role={role} onRole={setRole} status={statusFilter} onStatus={setStatusFilter} onOpen={openUser} opening={selectedLoading}/> : null}
    {!loading && !error && tab === "ai" && ai ? <AIView data={ai}/> : null}
    {!loading && !error && tab === "content" && content ? <ContentView data={content}/> : null}
    {!loading && !error && tab === "audit" && audit ? <AuditView data={audit}/> : null}
    {!loading && !error && tab === "settings" && settings && system ? <SettingsView settings={settings} system={system} onSaved={(value) => { setSettings(value); setNotice("La configuración quedó guardada y auditada."); }}/> : null}
  </div>{selected ? <UserDrawer user={selected} onClose={() => setSelected(null)} onChange={changeAccount} onCredits={adjustCredits}/> : null}</main>;
}

function SummaryView({ data, onNavigate }: { data: AdminDashboard; onNavigate: (tab: AdminTab) => void }) {
  const k = data.kpis;
  const cards = [
    { label: "Usuarios activos", value: k.users_active, note: `${k.users_created_period} nuevos en el periodo`, icon: UsersRound, color: "blue" },
    { label: "Generaciones IA", value: k.generations_period, note: `${formatNumber.format(k.generations_total)} históricas`, icon: Sparkles, color: "violet" },
    { label: "Documentos", value: k.documents_total, note: `${k.documents_period} creados en el periodo`, icon: FileText, color: "teal" },
    { label: "Próximos eventos", value: k.calendar_events_upcoming, note: `${k.calendar_events_completed} completados`, icon: CalendarDays, color: "amber" },
    { label: "Créditos disponibles", value: k.credits_available, note: `${k.low_credit_accounts} cuentas con saldo bajo`, icon: Coins, color: "coral" },
  ];
  return <div className="admin-view">
    <section className="admin-kpis">{cards.map(({ label, value, note, icon: Icon, color }) => <article key={label}><span className={`admin-kpi-icon admin-kpi-icon--${color}`}><Icon/></span><div><small>{label}</small><strong>{formatNumber.format(value)}</strong><p>{note}</p></div></article>)}</section>
    {data.alerts.length ? <section className="admin-alerts"><header><h2>Atención requerida</h2><p>Señales calculadas con la configuración y los datos actuales.</p></header><div>{data.alerts.map((alert) => <button key={alert.id} className={`admin-alert admin-alert--${alert.severity}`} onClick={() => onNavigate(alert.tab)}><AlertTriangle/><span><strong>{alert.title}</strong><small>{alert.detail}</small></span><b>{alert.count}</b><ChevronRight/></button>)}</div></section> : null}
    <section className="admin-grid admin-grid--wide"><article className="admin-panel admin-panel--activity"><header><div><h2>Actividad de la plataforma</h2><p>Altas y producción registrada durante los últimos {data.period_days} días.</p></div><Activity/></header><ActivityChart data={data.activity}/></article><article className="admin-panel"><header><div><h2>Estado de cuentas</h2><p>{k.users_total} cuentas registradas</p></div></header><SegmentDonut data={data.users_by_status} label="estado"/></article></section>
    <section className="admin-grid"><article className="admin-panel"><header><div><h2>Consumo por herramienta</h2><p>Créditos de las generaciones rastreadas.</p></div></header><RankingChart data={data.ai_by_tool}/>{!data.usage_tracking_started_at ? <p className="admin-data-note">El historial detallado comienza con la próxima generación; los totales históricos se conservan.</p> : null}</article><article className="admin-panel"><header><div><h2>Modalidades educativas</h2><p>Distribución de las cuentas docentes.</p></div></header><SegmentDonut data={data.users_by_modality} label="modalidad"/></article></section>
    <section className="admin-panel admin-audit-preview"><header><div><h2>Últimas acciones administrativas</h2><p>Rastro verificable de cambios sensibles.</p></div><button onClick={() => onNavigate("audit")}>Ver auditoría <ChevronRight/></button></header><AuditRows items={data.recent_audit}/></section>
  </div>;
}

function UsersView({ data, search, onSearch, role, onRole, status, onStatus, onOpen, opening }: { data: AdminUsersResponse; search: string; onSearch: (v: string) => void; role: string; onRole: (v: string) => void; status: string; onStatus: (v: string) => void; onOpen: (id: string) => void; opening: boolean }) {
  return <div className="admin-view"><section className="admin-panel"><header className="admin-table-header"><div><h2>Gestión de usuarios</h2><p>{formatNumber.format(data.total)} cuentas coinciden con los filtros. No se exponen contraseñas ni datos sensibles.</p></div><CsvButton users={data.items}/></header><div className="admin-filters"><label className="admin-search"><Search/><input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Buscar nombre, correo o institución"/></label><select value={role} onChange={(event) => onRole(event.target.value)} aria-label="Filtrar por rol"><option value="">Todos los roles</option><option value="teacher">Docentes</option><option value="admin">Administradores</option></select><select value={status} onChange={(event) => onStatus(event.target.value)} aria-label="Filtrar por estado"><option value="">Todos los estados</option><option value="true">Activas</option><option value="false">Inactivas</option></select></div><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Cuenta</th><th>Perfil educativo</th><th>Actividad</th><th>IA</th><th>Estado</th><th/></tr></thead><tbody>{data.items.map((user) => <tr key={user.id}><td><span className="admin-user-cell"><i>{user.full_name.split(" ").slice(0, 2).map((name) => name[0]).join("")}</i><span><strong>{user.full_name}</strong><small>{user.email}</small><small>{user.school_name}</small></span></span></td><td><strong>{user.education_modality} · {user.education_level}</strong><small>{user.grade}</small></td><td><strong>{user.documents_count} documentos</strong><small>{user.events_count} eventos</small></td><td><strong>{formatNumber.format(user.ai_credits_balance)} créditos</strong><small>{user.ai_generations} generaciones</small></td><td><span className={`admin-pill ${user.is_active ? "admin-pill--success" : "admin-pill--muted"}`}>{user.is_active ? "Activa" : "Inactiva"}</span><small>{user.role === "admin" ? "Administrador" : "Docente"}</small></td><td><button className="admin-row-action" onClick={() => onOpen(user.id)} disabled={opening}>Gestionar <ChevronRight/></button></td></tr>)}</tbody></table>{!data.items.length ? <div className="admin-empty">No hay cuentas que coincidan con estos filtros.</div> : null}</div></section></div>;
}

function AIView({ data }: { data: AIUsageResponse }) {
  const quality = data.quality;
  return <div className="admin-view">
    {quality ? <section className="admin-kpis admin-kpis--quality" aria-label="Calidad de las generaciones">
      <article><span className="admin-kpi-icon admin-kpi-icon--blue"><Bot/></span><div><small>Intentos validados</small><strong>{formatNumber.format(quality.attempts)}</strong><p>Todos pasan controles pedagógicos.</p></div></article>
      <article><span className="admin-kpi-icon admin-kpi-icon--teal"><CheckCircle2/></span><div><small>Aprobados directos</small><strong>{formatNumber.format(quality.completed)}</strong><p>Superaron las reglas al primer intento.</p></div></article>
      <article><span className="admin-kpi-icon admin-kpi-icon--violet"><Sparkles/></span><div><small>Reparados</small><strong>{formatNumber.format(quality.repaired)}</strong><p>Corregidos y validados automáticamente.</p></div></article>
      <article><span className="admin-kpi-icon admin-kpi-icon--coral"><AlertTriangle/></span><div><small>Rechazados sin cobro</small><strong>{formatNumber.format(quality.rejected_without_charge)}</strong><p>No descontaron créditos al docente.</p></div></article>
    </section> : null}
    <section className="admin-panel"><header><div><h2>Historial detallado de IA</h2><p>{formatNumber.format(data.total)} generaciones rastreadas en el periodo. Cada registro corresponde a una respuesta completada.</p></div></header><div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Fecha</th><th>Usuario</th><th>Herramienta</th><th>Módulo</th><th>Modelo</th><th>Consumo</th></tr></thead><tbody>{data.items.map((item) => <tr key={item.id}><td>{formatDate.format(new Date(item.created_at))}</td><td><strong>{item.user_name}</strong></td><td>{item.tool_id.replaceAll("-", " ")}</td><td>{item.module}</td><td><code>{item.model}</code></td><td><strong>{formatNumber.format(item.credit_cost)} créditos</strong><small>≈ {formatNumber.format(item.estimated_tokens)} tokens</small></td></tr>)}</tbody></table>{!data.items.length ? <div className="admin-empty"><Bot/>El seguimiento por herramienta comenzará cuando se complete la próxima generación con IA.</div> : null}</div></section>
  </div>;
}

function ContentView({ data }: { data: ContentSummary }) { return <div className="admin-view"><section className="admin-kpis admin-kpis--content"><article><span className="admin-kpi-icon admin-kpi-icon--blue"><FileText/></span><div><small>Documentos</small><strong>{formatNumber.format(data.documents_total)}</strong><p>{data.documents_period} en el periodo</p></div></article><article><span className="admin-kpi-icon admin-kpi-icon--teal"><CalendarDays/></span><div><small>Eventos</small><strong>{formatNumber.format(data.events_total)}</strong><p>{data.upcoming_events} próximos</p></div></article><article><span className="admin-kpi-icon admin-kpi-icon--violet"><CheckCircle2/></span><div><small>Eventos completados</small><strong>{formatNumber.format(data.completed_events)}</strong><p>Estado actual</p></div></article></section><section className="admin-grid"><article className="admin-panel"><header><div><h2>Documentos por tipo</h2><p>Producción almacenada por todas las cuentas.</p></div></header><SegmentDonut data={data.documents_by_type} label="tipo de documento"/></article><article className="admin-panel"><header><div><h2>Eventos por tipo</h2><p>Clasificación del calendario institucional.</p></div></header><SegmentDonut data={data.events_by_type} label="tipo de evento"/></article></section><section className="admin-grid"><RecentList title="Documentos recientes" items={data.recent_documents} dateKey="updated_at"/><RecentList title="Eventos recientes" items={data.recent_events} dateKey="updated_at"/></section></div>; }

function RecentList({ title, items, dateKey }: { title: string; items: Array<Record<string, string | boolean>>; dateKey: string }) { return <article className="admin-panel"><header><div><h2>{title}</h2><p>Últimas actualizaciones registradas.</p></div></header><div className="admin-compact-list">{items.map((item) => <div key={String(item.id)}><span><strong>{String(item.title)}</strong><small>{String(item.owner_name)} · {String(item.document_type ?? item.event_type ?? "")}</small></span><time>{formatDate.format(new Date(String(item[dateKey])))}</time></div>)}{!items.length ? <p className="admin-empty">Todavía no hay contenido.</p> : null}</div></article>; }
function AuditRows({ items }: { items: AuditEntry[] }) { return <div className="admin-audit-list">{items.map((item) => <article key={item.id}><span className="admin-audit-icon"><ShieldCheck/></span><div><strong>{niceAction(item.action)}</strong><p>{item.reason}</p><small>{item.actor_name} · {formatDate.format(new Date(item.created_at))}</small></div><span className="admin-pill">{item.target_type}</span></article>)}{!items.length ? <div className="admin-empty">No hay acciones administrativas registradas todavía.</div> : null}</div>; }
function AuditView({ data }: { data: { items: AuditEntry[]; total: number } }) { return <div className="admin-view"><section className="admin-panel"><header><div><h2>Auditoría administrativa</h2><p>{formatNumber.format(data.total)} acciones sensibles registradas con responsable, motivo y fecha.</p></div></header><AuditRows items={data.items}/></section></div>; }

function SettingsView({ settings, system, onSaved }: { settings: PlatformSettings; system: SystemStatus; onSaved: (value: PlatformSettings) => void }) {
  const [form, setForm] = useState(settings); const [reason, setReason] = useState(""); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  async function save(event: React.FormEvent) { event.preventDefault(); setSaving(true); setError(""); try { onSaved(await apiRequest<PlatformSettings>("/admin/settings", { method: "PATCH", headers: authHeaders(), body: JSON.stringify({ registration_open: form.registration_open, default_ai_credits: form.default_ai_credits, low_credit_threshold: form.low_credit_threshold, reason }) })); setReason(""); } catch (requestError) { setError(explainError(requestError)); } finally { setSaving(false); } }
  return <div className="admin-view admin-grid"><form className="admin-panel admin-settings-form" onSubmit={save}><header><div><h2>Reglas de la plataforma</h2><p>Estos cambios afectan al registro y a las nuevas cuentas.</p></div></header><label className="admin-switch"><span><strong>Registro público</strong><small>Permite o bloquea la creación de cuentas nuevas.</small></span><input type="checkbox" checked={form.registration_open} onChange={(e) => setForm({ ...form, registration_open: e.target.checked })}/><i/></label><label><span>Créditos iniciales por cuenta</span><input type="number" min="0" max="1000000" value={form.default_ai_credits} onChange={(e) => setForm({ ...form, default_ai_credits: Number(e.target.value) })}/></label><label><span>Umbral de saldo bajo</span><input type="number" min="0" max="1000000" value={form.low_credit_threshold} onChange={(e) => setForm({ ...form, low_credit_threshold: Number(e.target.value) })}/><small>Las cuentas iguales o inferiores a este valor aparecerán como alerta.</small></label><label><span>Motivo del cambio</span><textarea value={reason} onChange={(e) => setReason(e.target.value)} minLength={3} maxLength={240} required placeholder="Ej. Política institucional para el nuevo bimestre"/></label>{error ? <p className="admin-inline-error">{error}</p> : null}<button className="admin-button admin-button--primary" disabled={saving}>{saving ? <LoaderCircle className="is-spinning"/> : <Settings2/>} Guardar configuración</button></form><section className="admin-panel"><header><div><h2>Estado del sistema</h2><p>Comprobación segura; nunca se muestran claves ni contraseñas.</p></div></header><div className="admin-system-list"><StatusRow label="API de Avendia" ok={system.api === "ok"} detail="Servidor disponible"/><StatusRow label="Base de datos" ok={system.database === "ok"} detail="Conexión operativa"/><StatusRow label="Gemini" ok={system.gemini_configured} detail={system.gemini_configured ? `Configurado · ${system.gemini_model}` : "Falta configurar la clave"}/><StatusRow label="Entorno" ok detail={system.environment}/></div><p className="admin-data-note">Última comprobación: {formatDate.format(new Date(system.checked_at))}</p></section></div>;
}
function StatusRow({ label, ok, detail }: { label: string; ok: boolean; detail: string }) { return <div><span className={ok ? "is-ok" : "is-error"}>{ok ? <CheckCircle2/> : <AlertTriangle/>}</span><span><strong>{label}</strong><small>{detail}</small></span><b>{ok ? "Operativo" : "Revisar"}</b></div>; }

function UserDrawer({ user, onClose, onChange, onCredits }: { user: AdminUserDetail; onClose: () => void; onChange: (patch: { role?: "teacher" | "admin"; is_active?: boolean }, reason: string) => Promise<void>; onCredits: (amount: number, reason: string) => Promise<void> }) {
  const [mode, setMode] = useState<"profile" | "credits">("profile"); const [role, setRole] = useState(user.role); const [active, setActive] = useState(user.is_active); const [amount, setAmount] = useState(1000); const [reason, setReason] = useState(""); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  async function submit(event: React.FormEvent) { event.preventDefault(); setSaving(true); setError(""); try { if (mode === "profile") await onChange({ role, is_active: active }, reason); else await onCredits(amount, reason); setReason(""); } catch (requestError) { setError(explainError(requestError)); } finally { setSaving(false); } }
  return <div className="admin-drawer-layer" role="dialog" aria-modal="true" aria-label={`Gestionar ${user.full_name}`}><button className="admin-drawer-backdrop" onClick={onClose} aria-label="Cerrar"/><aside className="admin-drawer"><header><div><span className="admin-user-avatar">{user.full_name.split(" ").slice(0, 2).map((name) => name[0]).join("")}</span><span><h2>{user.full_name}</h2><p>{user.email}</p></span></div><button onClick={onClose} aria-label="Cerrar"><X/></button></header><div className="admin-drawer-body"><section className="admin-profile-summary"><div><small>Institución</small><strong>{user.school_name}</strong></div><div><small>Perfil</small><strong>{user.education_modality} · {user.education_level} · {user.grade}</strong></div><div><small>DRE / UGEL</small><strong>{user.dre} · {user.ugel}</strong></div><div><small>Actividad</small><strong>{user.documents_count} documentos · {user.events_count} eventos · {user.ai_generations} generaciones IA</strong></div></section><div className="admin-drawer-modes"><button className={mode === "profile" ? "is-active" : ""} onClick={() => setMode("profile")}><UserCog/> Acceso y rol</button><button className={mode === "credits" ? "is-active" : ""} onClick={() => setMode("credits")}><Coins/> Créditos IA</button></div><form onSubmit={submit} className="admin-drawer-form">{mode === "profile" ? <><label><span>Rol de la cuenta</span><select value={role} onChange={(e) => setRole(e.target.value as "teacher" | "admin")}><option value="teacher">Docente</option><option value="admin">Administrador</option></select></label><label className="admin-switch"><span><strong>Cuenta activa</strong><small>Una cuenta inactiva no puede iniciar sesión.</small></span><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)}/><i/></label></> : <><div className="admin-credit-balance"><Coins/><span><small>Saldo actual</small><strong>{formatNumber.format(user.ai_credits_balance)}</strong></span></div><label><span>Ajuste de créditos</span><input type="number" min="-100000" max="100000" value={amount} onChange={(e) => setAmount(Number(e.target.value))}/><small>Usa un valor positivo para recargar o negativo para descontar. El saldo nunca puede quedar bajo cero.</small></label></>}<label><span>Motivo obligatorio</span><textarea value={reason} onChange={(e) => setReason(e.target.value)} minLength={3} maxLength={240} required placeholder="Describe quién autorizó el cambio y por qué"/></label>{error ? <p className="admin-inline-error">{error}</p> : null}<button className="admin-button admin-button--primary" disabled={saving}>{saving ? <LoaderCircle className="is-spinning"/> : <ShieldCheck/>} Confirmar y auditar</button></form></div></aside></div>;
}

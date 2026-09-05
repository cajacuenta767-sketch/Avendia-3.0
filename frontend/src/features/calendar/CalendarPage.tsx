import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock3,
  ListFilter,
  Pencil,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { apiRequest } from "../../lib/api";
import { useWorkspacePreferences } from "../../context/WorkspacePreferencesContext";
import {
  AcademicBlock,
  CalendarEvent,
  defaultBlocks,
  EventType,
  eventTypes,
  referenceDates,
  referenceEventsForYear,
} from "./calendarData";

type ApiCalendarEvent = {
  id: string;
  title: string;
  event_date: string;
  event_time: string | null;
  event_type: EventType;
  notes: string | null;
  completed: boolean;
};

const months = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const shortMonths = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
const week = ["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"];
const EVENTS_KEY = "avendia.calendar.events";
const REFERENCES_KEY = "avendia.calendar.references";
const BLOCKS_KEY = "avendia.calendar.blocks";

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function dateFromKey(value: string) {
  return new Date(`${value}T12:00:00`);
}

function safeJson<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch {
    return fallback;
  }
}

function loadEvents(): CalendarEvent[] {
  return safeJson<CalendarEvent[]>(EVENTS_KEY, []).map((event) => ({ ...event, source: "usuario" as const }));
}

function loadReferences() {
  return safeJson<string[]>(REFERENCES_KEY, referenceDates.map((item) => item.id));
}

function loadBlocks(year: number) {
  const stored = safeJson<Record<string, AcademicBlock[]>>(BLOCKS_KEY, {});
  return stored[String(year)] ?? defaultBlocks(year);
}

function apiToEvent(event: ApiCalendarEvent): CalendarEvent {
  return {
    id: event.id,
    title: event.title,
    date: event.event_date,
    time: event.event_time?.slice(0, 5) ?? "",
    type: event.event_type,
    notes: event.notes ?? "",
    completed: event.completed,
    source: "usuario",
  };
}

function isWithin(date: string, block: AcademicBlock) {
  return date >= block.startDate && date <= block.endDate;
}

export function CalendarPage() {
  const today = new Date();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialYear = Number(searchParams.get("year")) || today.getFullYear();
  const initialMonth = Math.min(11, Math.max(0, (Number(searchParams.get("month")) || today.getMonth() + 1) - 1));
  const [cursor, setCursor] = useState(() => new Date(initialYear, initialMonth, 1));
  const [view, setView] = useState<"month" | "year">("month");
  const [filter, setFilter] = useState<EventType | "all">("all");
  const [events, setEvents] = useState<CalendarEvent[]>(loadEvents);
  const { preferences: workspacePreferences, updatePreferences: updateWorkspacePreferences } = useWorkspacePreferences();
  const enabledReferences = workspacePreferences.migrated_from_local
    ? workspacePreferences.calendar_reference_ids
    : loadReferences();
  const storedBlocks = workspacePreferences.calendar_blocks[String(cursor.getFullYear())] ?? [];
  const blocks = storedBlocks.length ? storedBlocks.map((block) => ({
    id: block.id,
    name: block.label,
    kind: block.color === "gestion" ? "gestion" as const : "lectivo" as const,
    startDate: block.start_date,
    endDate: block.end_date,
  })) : loadBlocks(cursor.getFullYear());
  const [sideTab, setSideTab] = useState<"blocks" | "contests">("blocks");
  const [modalDate, setModalDate] = useState<string | null>(searchParams.get("date"));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [referenceDialog, setReferenceDialog] = useState(false);
  const [blocksDialog, setBlocksDialog] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");

  const persistEvents = (next: CalendarEvent[]) => {
    setEvents(next);
    localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
  };

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    next.set("month", String(cursor.getMonth() + 1));
    next.set("year", String(cursor.getFullYear()));
    next.delete("date");
    setSearchParams(next, { replace: true });
    // searchParams is intentionally not a dependency: cursor is the source of navigation truth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, setSearchParams]);

  useEffect(() => {
    void apiRequest<ApiCalendarEvent[]>("/calendar/events")
      .then((items) => {
        const merged = new Map(events.map((event) => [event.id, event]));
        items.map(apiToEvent).forEach((event) => merged.set(event.id, event));
        persistEvents([...merged.values()]);
      })
      .catch(() => setSyncMessage("El calendario funciona en este dispositivo, pero no pudo sincronizarse con la cuenta."));
    // Initial synchronization only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const referenceEvents = useMemo(
    () => referenceEventsForYear(cursor.getFullYear(), enabledReferences),
    [cursor, enabledReferences],
  );
  const allEvents = useMemo(() => [...events, ...referenceEvents], [events, referenceEvents]);
  const focusedEventId = searchParams.get("event");
  const activeEvent = selectedEvent ?? (focusedEventId ? allEvents.find((item) => item.id === focusedEventId) ?? null : null);
  const visibleEvents = useMemo(
    () => filter === "all" ? allEvents : allEvents.filter((event) => event.type === filter),
    [allEvents, filter],
  );
  const monthEvents = visibleEvents.filter((event) => {
    const date = dateFromKey(event.date);
    return date.getFullYear() === cursor.getFullYear() && date.getMonth() === cursor.getMonth();
  });
  const currentBlock = blocks.find((block) => isWithin(dateKey(today), block));

  const saveEvent = (event: CalendarEvent) => {
    const editing = events.some((item) => item.id === event.id);
    const optimistic = editing ? events.map((item) => item.id === event.id ? event : item) : [...events, event];
    persistEvents(optimistic);
    setModalDate(null);
    setSelectedEvent(null);
    setSyncMessage("Fecha guardada correctamente.");

    const payload = {
      title: event.title,
      event_date: event.date,
      event_time: event.time || null,
      event_type: event.type,
      notes: event.notes || null,
      ...(editing ? { completed: event.completed } : {}),
    };
    const path = editing ? `/calendar/events/${event.id}` : "/calendar/events";
    void apiRequest<ApiCalendarEvent>(path, {
      method: editing ? "PATCH" : "POST",
      body: JSON.stringify(payload),
    }).then((saved) => {
      const synced = apiToEvent(saved);
      setEvents((current) => {
        const next = current.map((item) => item.id === event.id ? synced : item);
        localStorage.setItem(EVENTS_KEY, JSON.stringify(next));
        return next;
      });
    }).catch(() => setSyncMessage("La fecha quedó guardada en este dispositivo; la sincronización está pendiente."));
  };

  const toggleCompleted = (event: CalendarEvent) => {
    if (event.source === "referencia") return;
    const updated = { ...event, completed: !event.completed };
    persistEvents(events.map((item) => item.id === event.id ? updated : item));
    setSelectedEvent(updated);
    void apiRequest<ApiCalendarEvent>(`/calendar/events/${event.id}`, {
      method: "PATCH",
      body: JSON.stringify({ completed: updated.completed }),
    }).catch(() => setSyncMessage("El cambio quedó guardado localmente; la sincronización está pendiente."));
  };

  const deleteEvent = (event: CalendarEvent) => {
    if (!window.confirm(`¿Eliminar “${event.title}”? Esta acción no se puede deshacer.`)) return;
    persistEvents(events.filter((item) => item.id !== event.id));
    setSelectedEvent(null);
    setSyncMessage("Fecha eliminada.");
    void apiRequest<void>(`/calendar/events/${event.id}`, {
      method: "DELETE",
    }).catch(() => setSyncMessage("La fecha se eliminó de este dispositivo; la sincronización está pendiente."));
  };

  const saveReferences = (ids: string[]) => {
    localStorage.setItem(REFERENCES_KEY, JSON.stringify(ids));
    void updateWorkspacePreferences({ calendar_reference_ids: ids });
    setReferenceDialog(false);
    setSyncMessage(`${ids.length} fechas referenciales activas.`);
  };

  const saveBlocks = (nextBlocks: AcademicBlock[]) => {
    const stored = safeJson<Record<string, AcademicBlock[]>>(BLOCKS_KEY, {});
    stored[String(cursor.getFullYear())] = nextBlocks;
    localStorage.setItem(BLOCKS_KEY, JSON.stringify(stored));
    const calendarBlocks = {
      ...workspacePreferences.calendar_blocks,
      [String(cursor.getFullYear())]: nextBlocks.map((block) => ({
        id: block.id,
        label: block.name,
        start_date: block.startDate,
        end_date: block.endDate,
        color: block.kind,
      })),
    };
    void updateWorkspacePreferences({ calendar_blocks: calendarBlocks });
    setBlocksDialog(false);
    setSyncMessage("Bloques del año escolar actualizados.");
  };

  const navigateTo = (next: Date) => {
    setCursor(next);
  };
  const moveMonth = (amount: number) => navigateTo(new Date(cursor.getFullYear(), cursor.getMonth() + amount, 1));
  const createOn = (date: string) => { setSelectedEvent(null); setModalDate(date); };
  const closeEventDetail = () => {
    setSelectedEvent(null);
    if (!focusedEventId) return;
    const next = new URLSearchParams(searchParams);
    next.delete("event");
    setSearchParams(next, { replace: true });
  };

  return (
    <main className="calendar-page">
      <div className="calendar-shell">
        <header className="calendar-heading">
          <div>
            <span className="calendar-eyebrow"><CalendarDays /> Calendario escolar e institucional</span>
            <h1>Calendario académico {cursor.getFullYear()}</h1>
            <p>Organiza fechas, concursos, sesiones y bloques del año escolar en un solo lugar.</p>
          </div>
          <div className="calendar-heading__actions">
            <button className="secondary-button" onClick={() => setReferenceDialog(true)}><Sparkles /> Fechas y concursos</button>
            <button className="primary-button" onClick={() => createOn(dateKey(today))}><Plus /> Nueva fecha</button>
          </div>
        </header>

        <section className="calendar-summary" aria-label="Resumen del calendario">
          <article><span><CalendarDays /></span><div><strong>{monthEvents.length}</strong><small>eventos este mes</small></div></article>
          <article><span><Sparkles /></span><div><strong>{enabledReferences.length}</strong><small>fechas referenciales activas</small></div></article>
          <article><span><Clock3 /></span><div><strong>{currentBlock?.name ?? "Fuera de bloques"}</strong><small>periodo actual</small></div></article>
        </section>

        {syncMessage ? <div className="calendar-notice" role="status"><CircleAlert /><span>{syncMessage}</span><button onClick={() => setSyncMessage("")} aria-label="Cerrar aviso"><X /></button></div> : null}

        <section className="calendar-toolbar">
          <div className="calendar-navigation">
            <button className="icon-button" onClick={() => view === "year" ? navigateTo(new Date(cursor.getFullYear() - 1, cursor.getMonth(), 1)) : moveMonth(-1)} aria-label={view === "year" ? "Año anterior" : "Mes anterior"}><ChevronLeft /></button>
            <button className="today-button" onClick={() => navigateTo(new Date(today.getFullYear(), today.getMonth(), 1))}>Hoy</button>
            <button className="icon-button" onClick={() => view === "year" ? navigateTo(new Date(cursor.getFullYear() + 1, cursor.getMonth(), 1)) : moveMonth(1)} aria-label={view === "year" ? "Año siguiente" : "Mes siguiente"}><ChevronRight /></button>
            <h2>{view === "year" ? cursor.getFullYear() : `${months[cursor.getMonth()]} ${cursor.getFullYear()}`}</h2>
          </div>
          <div className="calendar-actions">
            <div className="segmented" aria-label="Vista del calendario">
              <button className={view === "month" ? "active" : ""} onClick={() => setView("month")}>Mes</button>
              <button className={view === "year" ? "active" : ""} onClick={() => setView("year")}>Año</button>
            </div>
            <label className="filter-select"><ListFilter /><span className="sr-only">Filtrar eventos</span><select value={filter} onChange={(event) => setFilter(event.target.value as EventType | "all")}><option value="all">Todos los eventos</option>{eventTypes.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}</select><ChevronDown /></label>
          </div>
        </section>

        <div className="calendar-layout">
          <div className="calendar-layout__main">
            {view === "month" ? <p className="calendar-scroll-hint" aria-hidden="true">← Desliza para ver todos los días →</p> : null}
            {view === "month"
              ? <MonthGrid cursor={cursor} today={today} events={visibleEvents} blocks={blocks} onCreate={createOn} onOpen={setSelectedEvent} />
              : <YearGrid year={cursor.getFullYear()} events={visibleEvents} blocks={blocks} onSelect={(month) => { navigateTo(new Date(cursor.getFullYear(), month, 1)); setView("month"); }} />}
            <section className="calendar-legend">{eventTypes.map((type) => <span key={type.id}><i className={`event-dot event-dot--${type.id}`} />{type.label}</span>)}</section>
          </div>

          <aside className="calendar-side-panel">
            <header><div className="segmented"><button className={sideTab === "blocks" ? "active" : ""} onClick={() => setSideTab("blocks")}>Año escolar</button><button className={sideTab === "contests" ? "active" : ""} onClick={() => setSideTab("contests")}>Concursos</button></div><button className="icon-button" onClick={() => setBlocksDialog(true)} aria-label="Configurar bloques"><Settings2 /></button></header>
            {sideTab === "blocks" ? <BlockList blocks={blocks} today={today} /> : <ContestList year={cursor.getFullYear()} enabledIds={enabledReferences} onConfigure={() => setReferenceDialog(true)} />}
          </aside>
        </div>
      </div>

      {modalDate ? <EventDialog date={modalDate} event={activeEvent?.source === "usuario" ? activeEvent : null} onClose={() => { setModalDate(null); closeEventDetail(); }} onSave={saveEvent} /> : null}
      {activeEvent && !modalDate ? <EventDetail event={activeEvent} onClose={closeEventDetail} onEdit={() => setModalDate(activeEvent.date)} onToggle={() => toggleCompleted(activeEvent)} onDelete={() => deleteEvent(activeEvent)} onHideReference={() => saveReferences(enabledReferences.filter((id) => !activeEvent.id.endsWith(`-${id}`)))} /> : null}
      {referenceDialog ? <ReferenceDialog selectedIds={enabledReferences} year={cursor.getFullYear()} onClose={() => setReferenceDialog(false)} onSave={saveReferences} /> : null}
      {blocksDialog ? <BlocksDialog year={cursor.getFullYear()} blocks={blocks} onClose={() => setBlocksDialog(false)} onSave={saveBlocks} /> : null}
    </main>
  );
}

function MonthGrid({ cursor, today, events, blocks, onCreate, onOpen }: { cursor: Date; today: Date; events: CalendarEvent[]; blocks: AcademicBlock[]; onCreate: (date: string) => void; onOpen: (event: CalendarEvent) => void }) {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = new Date(cursor.getFullYear(), cursor.getMonth(), 1 - mondayOffset);
  const days = Array.from({ length: 42 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
  return <section className="month-grid" aria-label={`Calendario de ${months[cursor.getMonth()]}`}><div className="calendar-weekdays">{week.map((day) => <strong key={day}>{day}</strong>)}</div><div className="calendar-cells">{days.map((day) => {
    const key = dateKey(day);
    const dayEvents = events.filter((event) => event.date === key);
    const block = blocks.find((item) => isWithin(key, item));
    return <div className={`calendar-cell ${day.getMonth() !== cursor.getMonth() ? "calendar-cell--muted" : ""} ${key === dateKey(today) ? "calendar-cell--today" : ""} ${block ? `calendar-cell--${block.kind}` : ""}`} key={key}>
      <button className="calendar-cell__date" onDoubleClick={() => onCreate(key)} aria-label={`Agregar evento el ${day.toLocaleDateString("es-PE")}`} title="Haz doble clic para abrir una nueva fecha">{day.getDate()}</button>
      {block ? <span className={`calendar-block-mark calendar-block-mark--${block.kind}`} title={block.name}>{block.kind === "gestion" ? "Gestión" : "Lectivo"}</span> : null}
      <div className="calendar-cell__events">{dayEvents.slice(0, 3).map((event) => <button className={`calendar-event calendar-event--${event.type} ${event.completed ? "calendar-event--completed" : ""}`} key={event.id} onClick={() => onOpen(event)} title={event.title}><span>{event.time}</span>{event.title}</button>)}{dayEvents.length > 3 ? <small>+{dayEvents.length - 3} más</small> : null}</div>
    </div>;
  })}</div></section>;
}

function YearGrid({ year, events, blocks, onSelect }: { year: number; events: CalendarEvent[]; blocks: AcademicBlock[]; onSelect: (month: number) => void }) {
  return <section className="year-grid">{months.map((name, month) => {
    const first = new Date(year, month, 1);
    const offset = (first.getDay() + 6) % 7;
    const count = new Date(year, month + 1, 0).getDate();
    const cells = [...Array.from({ length: offset }, () => null), ...Array.from({ length: count }, (_, index) => index + 1)];
    return <button key={name} onClick={() => onSelect(month)} aria-label={`Abrir ${name} ${year}`}><header><strong>{name}</strong><span>{events.filter((event) => event.date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`)).length} eventos</span></header><div className="year-mini-week">{week.map((day) => <small key={day}>{day.slice(0, 1)}</small>)}</div><div className="year-mini-grid">{cells.map((day, index) => {
      if (!day) return <i key={`blank-${index}`} />;
      const key = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const hasEvent = events.some((event) => event.date === key);
      const block = blocks.find((item) => isWithin(key, item));
      return <i key={key} className={`${hasEvent ? "has-event" : ""} ${block ? `is-${block.kind}` : ""}`}>{day}</i>;
    })}</div></button>;
  })}</section>;
}

function BlockList({ blocks, today }: { blocks: AcademicBlock[]; today: Date }) {
  const todayKey = dateKey(today);
  return <div className="calendar-side-list">{blocks.map((block) => <article className={isWithin(todayKey, block) ? "is-current" : ""} key={block.id}><i className={`block-kind block-kind--${block.kind}`} /><div><strong>{block.name}</strong><span>{dateFromKey(block.startDate).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })} — {dateFromKey(block.endDate).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}</span></div>{isWithin(todayKey, block) ? <small>Actual</small> : null}</article>)}</div>;
}

function ContestList({ year, enabledIds, onConfigure }: { year: number; enabledIds: string[]; onConfigure: () => void }) {
  const contests = referenceDates.filter((item) => item.type === "concurso" && (item.year === undefined || item.year === year));
  return <div className="contest-list"><p>Hitos referenciales del proyecto anterior. Confirma las fechas con tu UGEL.</p>{contests.map((item) => <article key={item.id}><span>{String(item.day).padStart(2, "0")}<small>{shortMonths[item.month - 1]}</small></span><div><strong>{item.title}</strong><small>{enabledIds.includes(item.id) ? "Visible en el calendario" : "Oculto"}</small></div></article>)}<button className="secondary-button" onClick={onConfigure}>Configurar concursos</button></div>;
}

function EventDialog({ date, event, onClose, onSave }: { date: string; event: CalendarEvent | null; onClose: () => void; onSave: (event: CalendarEvent) => void }) {
  function submit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    const form = new FormData(submitEvent.currentTarget);
    onSave({ id: event?.id ?? crypto.randomUUID(), title: String(form.get("title")).trim(), date: String(form.get("date")), time: String(form.get("time")), type: form.get("type") as EventType, notes: String(form.get("notes")).trim(), completed: event?.completed ?? false, source: "usuario" });
  }
  return <div className="dialog-backdrop"><form className="event-dialog" onSubmit={submit} role="dialog" aria-modal="true" aria-label={event ? "Editar fecha" : "Nueva fecha"}><header><div><span className="dialog-kicker">Calendario institucional</span><h2>{event ? "Editar fecha" : "Nueva fecha"}</h2><p>{event ? "Actualiza los datos de la actividad." : "Añade una actividad, recordatorio o feriado."}</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar"><X /></button></header><label>Título<input name="title" required minLength={3} autoFocus defaultValue={event?.title} placeholder="Ej. Reunión de área" /></label><div className="form-row"><label>Fecha<input name="date" type="date" required defaultValue={event?.date ?? date} /></label><label>Hora<input name="time" type="time" defaultValue={event?.time ?? "08:00"} /></label></div><label>Tipo<select name="type" defaultValue={event?.type ?? "planificacion"}>{eventTypes.map((type) => <option key={type.id} value={type.id}>{type.label}</option>)}</select></label><label>Notas<textarea name="notes" rows={3} defaultValue={event?.notes} placeholder="Información adicional…" /></label><footer><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button">{event ? "Guardar cambios" : "Guardar fecha"}</button></footer></form></div>;
}

function EventDetail({ event, onClose, onEdit, onToggle, onDelete, onHideReference }: { event: CalendarEvent; onClose: () => void; onEdit: () => void; onToggle: () => void; onDelete: () => void; onHideReference: () => void }) {
  return <div className="dialog-backdrop"><section className="event-dialog event-detail" role="dialog" aria-modal="true" aria-label="Detalle de fecha"><header><div><span className={`event-type-pill event-type-pill--${event.type}`}>{eventTypes.find((type) => type.id === event.type)?.label}</span><h2>{event.title}</h2><p>{dateFromKey(event.date).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}{event.time ? ` · ${event.time}` : ""}</p></div><button className="icon-button" onClick={onClose} aria-label="Cerrar"><X /></button></header>{event.notes ? <p className="event-detail__notes">{event.notes}</p> : null}<footer>{event.source === "referencia" ? <><button className="secondary-button" onClick={onHideReference}>Ocultar esta fecha</button><button className="primary-button" onClick={onClose}>Entendido</button></> : <><button className="danger-button" onClick={onDelete}><Trash2 /> Eliminar</button><button className="secondary-button" onClick={onToggle}><Check /> {event.completed ? "Marcar pendiente" : "Completar"}</button><button className="primary-button" onClick={onEdit}><Pencil /> Editar</button></>}</footer></section></div>;
}

function ReferenceDialog({ selectedIds, year, onClose, onSave }: { selectedIds: string[]; year: number; onClose: () => void; onSave: (ids: string[]) => void }) {
  const [selected, setSelected] = useState(selectedIds);
  const [query, setQuery] = useState("");
  const visible = referenceDates.filter((item) => (item.year === undefined || item.year === year) && item.title.toLowerCase().includes(query.toLowerCase()));
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  return <div className="dialog-backdrop"><section className="calendar-manager-dialog" role="dialog" aria-modal="true" aria-label="Fechas y concursos"><header><div><span className="calendar-manager-dialog__icon"><Sparkles /></span><div><h2>Fechas y concursos</h2><p>Elige qué referencias se muestran y se usan al preparar tus planificaciones.</p></div></div><button className="icon-button" onClick={onClose} aria-label="Cerrar"><X /></button></header><div className="reference-warning"><CircleAlert /><span>Las fechas cívicas son una base de trabajo. Los concursos 2026 provienen del proyecto anterior: confirma cada convocatoria con tu UGEL.</span></div><div className="reference-toolbar"><label><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar fecha o concurso" /></label><div><button onClick={() => setSelected([...new Set([...selected, ...visible.map((item) => item.id)])])}>Todas</button><button onClick={() => setSelected(selected.filter((id) => !visible.some((item) => item.id === id)))}>Ninguna</button><strong>{selected.length} activas</strong></div></div><div className="reference-list">{visible.map((item) => <label key={item.id} className={selected.includes(item.id) ? "is-selected" : ""}><input type="checkbox" checked={selected.includes(item.id)} onChange={() => toggle(item.id)} /><span className="reference-date"><strong>{String(item.day).padStart(2, "0")}</strong><small>{shortMonths[item.month - 1]}</small></span><span><strong>{item.title}</strong><small>{item.type === "concurso" ? "Concurso" : item.type === "feriado" ? "Feriado" : "Fecha cívica"}</small></span></label>)}</div><footer><span>Los cambios se guardan para este dispositivo.</span><div><button className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" onClick={() => onSave(selected)}>Guardar selección</button></div></footer></section></div>;
}

function BlocksDialog({ year, blocks, onClose, onSave }: { year: number; blocks: AcademicBlock[]; onClose: () => void; onSave: (blocks: AcademicBlock[]) => void }) {
  const [local, setLocal] = useState(blocks);
  const update = (id: string, field: "startDate" | "endDate", value: string) => setLocal((current) => current.map((block) => block.id === id ? { ...block, [field]: value } : block));
  return <div className="dialog-backdrop"><section className="calendar-manager-dialog blocks-dialog" role="dialog" aria-modal="true" aria-label="Configurar año escolar"><header><div><span className="calendar-manager-dialog__icon"><Settings2 /></span><div><h2>Bloques del año escolar {year}</h2><p>Ajusta semanas lectivas y semanas de gestión.</p></div></div><button className="icon-button" onClick={onClose} aria-label="Cerrar"><X /></button></header><div className="blocks-table"><div className="blocks-table__heading"><span>Bloque</span><span>Inicio</span><span>Fin</span></div>{local.map((block) => <div className={`blocks-table__row blocks-table__row--${block.kind}`} key={block.id}><span><i className={`block-kind block-kind--${block.kind}`} /><strong>{block.name}</strong><small>{block.kind === "gestion" ? "Gestión" : "Lectivo"}</small></span><label><span className="sr-only">Inicio de {block.name}</span><input type="date" value={block.startDate} onChange={(event) => update(block.id, "startDate", event.target.value)} /></label><label><span className="sr-only">Fin de {block.name}</span><input type="date" value={block.endDate} onChange={(event) => update(block.id, "endDate", event.target.value)} /></label></div>)}</div><footer><button className="secondary-button" onClick={() => setLocal(defaultBlocks(year))}>Restablecer referencia</button><div><button className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" onClick={() => onSave(local)}>Guardar bloques</button></div></footer></section></div>;
}

import { CalendarDays, CheckCircle2, ChevronRight, Clock3, FileText, Flag, PanelRightClose } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { type CalendarEvent, referenceDates } from "../features/calendar/calendarData";

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];

function toIso(year: number, monthIndex: number, day: number) {
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function readCalendarEvents(year: number): CalendarEvent[] {
  let saved: CalendarEvent[] = [];
  try { saved = JSON.parse(localStorage.getItem("avendia.calendar.events") ?? "[]") as CalendarEvent[]; }
  catch { saved = []; }
  const references = referenceDates
    .filter((item) => item.year === undefined || item.year === year)
    .map((item) => ({
      id: `context-${year}-${item.id}`,
      title: item.title,
      date: toIso(year, item.month - 1, item.day),
      time: "",
      type: item.type,
      notes: "Fecha referencial del calendario escolar.",
      completed: false,
      source: "referencia" as const,
    }));
  const byId = new Map([...references, ...saved].map((item) => [item.id, item]));
  return [...byId.values()];
}

export function ContextPanel({ pathname, onClose }: { pathname: string; onClose: () => void }) {
  const navigate = useNavigate();
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const year = today.getFullYear();
  const monthIndex = today.getMonth();
  const context = pathname.includes("/tutoria/") ? "Tutoría" : pathname.includes("/planificamos/") ? "Planificación" : "Actividad docente";
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const mondayOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const [events] = useState(() => readCalendarEvents(year));
  const monthEvents = events.filter((item) => item.date.startsWith(`${year}-${String(monthIndex + 1).padStart(2, "0")}`));
  const selectedIso = toIso(year, monthIndex, selectedDay);
  const selectedEvents = monthEvents.filter((item) => item.date === selectedIso);
  const cells = [...Array.from({ length: mondayOffset }, () => null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];

  return (
    <aside className="context-panel" aria-label="Panel contextual">
      <header className="context-panel__header">
        <div><small>Panel lateral</small><strong>{context}</strong></div>
        <button className="icon-button" onClick={onClose} aria-label="Ocultar panel contextual"><PanelRightClose /></button>
      </header>
      <section className="context-calendar">
        <div className="context-calendar__title">
          <span><CalendarDays /><strong>{MONTHS[monthIndex]} {year}</strong></span>
          <Link to="/dashboard/calendario" aria-label="Abrir calendario completo"><ChevronRight /></Link>
        </div>
        <div className="context-calendar__weekdays">{WEEKDAYS.map((day, index) => <small key={`${day}-${index}`}>{day}</small>)}</div>
        <div className="context-calendar__grid">
          {cells.map((day, index) => day === null ? <span key={`blank-${index}`} /> : (
            <button
              className={`${selectedDay === day ? "is-selected" : ""} ${day === today.getDate() ? "is-today" : ""}`}
              key={day}
              onClick={() => setSelectedDay(day)}
              onDoubleClick={() => navigate(`/dashboard/calendario?month=${monthIndex + 1}&year=${year}&date=${toIso(year, monthIndex, day)}`)}
              aria-label={`${day} de ${MONTHS[monthIndex]}`}
              title="Haz doble clic para agregar una fecha"
            >
              {day}{monthEvents.some((item) => item.date === toIso(year, monthIndex, day)) ? <i /> : null}
            </button>
          ))}
        </div>
        <div className="context-calendar__events">
          <strong>Actividades del {selectedDay}</strong>
          {selectedEvents.length ? selectedEvents.slice(0, 4).map((event) => (
            <button type="button" key={event.id} onClick={() => navigate(`/dashboard/calendario?month=${monthIndex + 1}&year=${year}&event=${encodeURIComponent(event.id)}`)} title={`Abrir ${event.title}`}>
              {event.type === "feriado" ? <Flag /> : event.completed ? <CheckCircle2 /> : <Clock3 />}
              <span><strong>{event.title}</strong><small>{event.time || "Todo el día"}</small></span>
            </button>
          )) : <p>Sin actividades programadas para este día.</p>}
        </div>
        <Link className="context-panel__link" to="/dashboard/calendario">Ver calendario completo <ChevronRight /></Link>
      </section>
      <section className="context-history">
        <div><FileText /><span><strong>Historial de creación</strong><small>Tus borradores se guardan automáticamente.</small></span></div>
        <Link className="context-panel__link" to="/dashboard/historial">Ver historial <ChevronRight /></Link>
      </section>
    </aside>
  );
}

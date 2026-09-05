import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const labels = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

export function WeeklyAgenda() {
  const navigate = useNavigate();
  const today = new Date();
  const monday = new Date(today); monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, index) => { const day = new Date(monday); day.setDate(monday.getDate() + index); return [labels[day.getDay()], String(day.getDate()), day.toDateString() === today.toDateString() ? "active" : ""] as const; });
  const events = (JSON.parse(localStorage.getItem("avendia.calendar.events") ?? "[]") as { id: string; title: string; date: string; time: string; type: string }[]).filter((event) => { const date = new Date(`${event.date}T12:00:00`); const last = new Date(monday); last.setDate(monday.getDate() + 7); return date >= monday && date < last; }).slice(0, 3);
  return (
    <aside className="agenda" aria-labelledby="agenda-title">
      <h2 id="agenda-title">Esta semana</h2>
      <div className="agenda__days" aria-label="Esta semana">
        {days.map(([label, number, active], index) => (
          <span className={active ? "agenda__day--active" : ""} key={`${number}-${index}`}>
            <small>{label}</small><strong>{number}</strong>
          </span>
        ))}
      </div>
      <div className="agenda__events">
        {events.length ? events.map((event) => <AgendaEvent key={event.id} time={event.time || "Todo el día"} title={event.title} detail={event.type} tone={event.type === "tutoria" ? "teal" : "blue"} />) : <p className="agenda__empty">No tienes actividades esta semana.</p>}
      </div>
      <button className="agenda__link" onClick={() => navigate("/dashboard/calendario")}>Ver agenda completa <ArrowRight aria-hidden="true" /></button>
    </aside>
  );
}

function AgendaEvent({
  time, title, detail, tone,
}: {
  time: string; title: string; detail: string; tone: "blue" | "teal";
}) {
  return (
    <button className="agenda-event">
      <strong className={`agenda-event__time agenda-event__time--${tone}`}>{time}</strong>
      <span className={`agenda-event__dot agenda-event__dot--${tone}`} />
      <span><strong>{title}</strong><small>{detail}</small></span>
      <ArrowRight aria-hidden="true" />
    </button>
  );
}

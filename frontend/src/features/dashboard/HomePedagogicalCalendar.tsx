import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type CalendarMode = "MENSUAL" | "BIMESTRAL" | "TRIMESTRAL";

const SCHOOL_YEAR = 2026;
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre",
];

const PERIODS: Record<Exclude<CalendarMode, "MENSUAL">, Array<{
  title: string;
  detail: string;
  start: string;
  end: string;
  tone: "management" | "green" | "cyan" | "amber" | "indigo";
  duration?: string;
}>> = {
  BIMESTRAL: [
    { title: "S. Gestión 1", detail: "02 Mar → 13 Mar (2 sem)", start: "2026-03-02", end: "2026-03-13", tone: "management" },
    { title: "I Bimestre Lectivo", detail: "16 Mar → 15 May · Unidades 1 y 2", start: "2026-03-16", end: "2026-05-15", tone: "green", duration: "9 semanas" },
    { title: "S. Gestión 2", detail: "18 May → 22 May (1 sem)", start: "2026-05-18", end: "2026-05-22", tone: "management" },
    { title: "II Bimestre Lectivo", detail: "25 May → 24 Jul · Unidades 3 y 4", start: "2026-05-25", end: "2026-07-24", tone: "cyan", duration: "9 semanas" },
    { title: "S. Gestión 3 · Vacaciones", detail: "27 Jul → 07 Ago (2 sem)", start: "2026-07-27", end: "2026-08-07", tone: "management" },
    { title: "III Bimestre Lectivo", detail: "10 Ago → 09 Oct · Unidades 5 y 6", start: "2026-08-10", end: "2026-10-09", tone: "amber", duration: "9 semanas" },
    { title: "S. Gestión 4", detail: "12 Oct → 16 Oct (1 sem)", start: "2026-10-12", end: "2026-10-16", tone: "management" },
    { title: "IV Bimestre Lectivo", detail: "19 Oct → 18 Dic · Unidades 7 y 8", start: "2026-10-19", end: "2026-12-18", tone: "indigo", duration: "9 semanas" },
  ],
  TRIMESTRAL: [
    { title: "S. Gestión 1", detail: "02 Mar → 13 Mar (2 sem)", start: "2026-03-02", end: "2026-03-13", tone: "management" },
    { title: "I Trimestre Lectivo", detail: "16 Mar → 05 Jun", start: "2026-03-16", end: "2026-06-05", tone: "green", duration: "12 semanas" },
    { title: "S. Gestión 2", detail: "08 Jun → 12 Jun (1 sem)", start: "2026-06-08", end: "2026-06-12", tone: "management" },
    { title: "II Trimestre Lectivo", detail: "15 Jun → 18 Set", start: "2026-06-15", end: "2026-09-18", tone: "cyan", duration: "13 semanas" },
    { title: "S. Gestión 3 y 4", detail: "21 Set → 02 Oct (2 sem)", start: "2026-09-21", end: "2026-10-02", tone: "management" },
    { title: "III Trimestre Lectivo", detail: "05 Oct → 18 Dic", start: "2026-10-05", end: "2026-12-18", tone: "indigo", duration: "11 semanas" },
  ],
};

export function HomePedagogicalCalendar() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<CalendarMode>("BIMESTRAL");
  const [monthIndex, setMonthIndex] = useState(7);

  const calendarCells = useMemo(() => {
    const firstDay = new Date(SCHOOL_YEAR, monthIndex, 1).getDay();
    const mondayOffset = firstDay === 0 ? 6 : firstDay - 1;
    const days = new Date(SCHOOL_YEAR, monthIndex + 1, 0).getDate();
    return [...Array<null>(mondayOffset).fill(null), ...Array.from({ length: days }, (_, index) => index + 1)];
  }, [monthIndex]);

  const openPeriod = (start: string, end: string) => {
    const startDate = new Date(`${start}T12:00:00`);
    navigate(`/dashboard/calendario?month=${startDate.getMonth() + 1}&year=${SCHOOL_YEAR}&from=${start}&to=${end}`);
  };

  const openDay = (day: number) => {
    const month = String(monthIndex + 1).padStart(2, "0");
    const date = `${SCHOOL_YEAR}-${month}-${String(day).padStart(2, "0")}`;
    navigate(`/dashboard/calendario?month=${monthIndex + 1}&year=${SCHOOL_YEAR}&date=${date}`);
  };

  return (
    <section className="home-school-calendar" aria-labelledby="home-school-calendar-title">
      <header>
        <span><CalendarDays aria-hidden="true" /><h2 id="home-school-calendar-title">Calendario escolar {SCHOOL_YEAR}</h2></span>
        <button type="button" onClick={() => navigate(`/dashboard/calendario?year=${SCHOOL_YEAR}`)} aria-label="Abrir calendario completo"><ChevronRight aria-hidden="true" /></button>
      </header>

      <div className="home-school-calendar__tabs" role="group" aria-label="Vista del calendario">
        {(["MENSUAL", "BIMESTRAL", "TRIMESTRAL"] as CalendarMode[]).map((item) => (
          <button key={item} type="button" aria-pressed={mode === item} onClick={() => setMode(item)}>{item}</button>
        ))}
      </div>

      <div className="home-school-calendar__content">
        {mode === "MENSUAL" ? (
          <div className="home-school-calendar__month">
            <div className="home-school-calendar__month-nav">
              <button type="button" onClick={() => setMonthIndex((value) => (value + 11) % 12)} aria-label="Mes anterior"><ChevronLeft aria-hidden="true" /></button>
              <strong>{MONTH_NAMES[monthIndex]} {SCHOOL_YEAR}</strong>
              <button type="button" onClick={() => setMonthIndex((value) => (value + 1) % 12)} aria-label="Mes siguiente"><ChevronRight aria-hidden="true" /></button>
            </div>
            <div className="home-school-calendar__weekdays" aria-hidden="true">{["L", "M", "M", "J", "V", "S", "D"].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
            <div className="home-school-calendar__days">
              {calendarCells.map((day, index) => day ? (
                <button key={`${day}-${index}`} type="button" className={day === 6 || day === 28 || day === 29 ? "holiday" : day <= 2 || day >= 27 ? "management" : "school"} onClick={() => openDay(day)}>{day}</button>
              ) : <span key={`empty-${index}`} />)}
            </div>
          </div>
        ) : (
          <div className="home-school-calendar__periods">
            {PERIODS[mode].map((period) => (
              <button key={`${mode}-${period.start}`} type="button" className={`home-school-period home-school-period--${period.tone}`} onClick={() => openPeriod(period.start, period.end)}>
                <span><strong>{period.title}</strong>{period.duration ? <small>{period.duration}</small> : null}</span>
                <p>{period.detail}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <footer aria-label="Leyenda del calendario">
        <span><i className="school" /> Lectivo</span><span><i className="management" /> Gestión</span><span><i className="holiday" /> Feriado</span>
      </footer>
    </section>
  );
}

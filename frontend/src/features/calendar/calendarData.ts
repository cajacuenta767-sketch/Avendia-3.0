export type EventType =
  | "planificacion"
  | "tutoria"
  | "feriado"
  | "minedu"
  | "civica"
  | "concurso"
  | "gestion"
  | "general";

export type CalendarEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: EventType;
  notes: string;
  completed: boolean;
  source?: "usuario" | "referencia";
};

export type AcademicBlock = {
  id: string;
  name: string;
  kind: "lectivo" | "gestion";
  startDate: string;
  endDate: string;
};

export type ReferenceDate = {
  id: string;
  month: number;
  day: number;
  title: string;
  type: "civica" | "concurso" | "feriado";
  year?: number;
};

export const eventTypes: { id: EventType; label: string }[] = [
  { id: "planificacion", label: "Planificación" },
  { id: "tutoria", label: "Tutoría" },
  { id: "feriado", label: "Feriado" },
  { id: "minedu", label: "MINEDU" },
  { id: "civica", label: "Fecha cívica" },
  { id: "concurso", label: "Concurso" },
  { id: "gestion", label: "Semana de gestión" },
  { id: "general", label: "General" },
];

export const referenceDates: ReferenceDate[] = [
  { id: "mujer", month: 3, day: 8, title: "Día Internacional de la Mujer", type: "civica" },
  { id: "matematica", month: 3, day: 14, title: "Día Internacional de las Matemáticas", type: "civica" },
  { id: "agua", month: 3, day: 22, title: "Día Mundial del Agua", type: "civica" },
  { id: "salud", month: 4, day: 7, title: "Día Mundial de la Salud", type: "civica" },
  { id: "tierra", month: 4, day: 22, title: "Día de la Madre Tierra", type: "civica" },
  { id: "libro", month: 4, day: 23, title: "Día del Idioma y del Libro", type: "civica" },
  { id: "trabajo", month: 5, day: 1, title: "Día del Trabajo", type: "feriado" },
  { id: "ambiente", month: 6, day: 5, title: "Día Mundial del Medio Ambiente", type: "civica" },
  { id: "bandera", month: 6, day: 7, title: "Día de la Bandera", type: "civica" },
  { id: "maestro", month: 7, day: 6, title: "Día del Maestro", type: "civica" },
  { id: "fuerza-aerea", month: 7, day: 23, title: "Día de la Fuerza Aérea del Perú", type: "civica" },
  { id: "independencia", month: 7, day: 28, title: "Fiestas Patrias — Independencia del Perú", type: "feriado" },
  { id: "fiestas-patrias-2", month: 7, day: 29, title: "Fiestas Patrias", type: "feriado" },
  { id: "junin", month: 8, day: 6, title: "Batalla de Junín", type: "civica" },
  { id: "santa-rosa", month: 8, day: 30, title: "Santa Rosa de Lima", type: "feriado" },
  { id: "alfabetizacion", month: 9, day: 8, title: "Día Internacional de la Alfabetización", type: "civica" },
  { id: "primavera", month: 9, day: 23, title: "Día de la Primavera y de la Juventud", type: "civica" },
  { id: "angamos", month: 10, day: 8, title: "Combate de Angamos", type: "feriado" },
  { id: "discapacidad", month: 10, day: 16, title: "Día Nacional de la Persona con Discapacidad", type: "civica" },
  { id: "derechos-nino", month: 11, day: 20, title: "Día de los Derechos del Niño y del Adolescente", type: "civica" },
  { id: "ayacucho", month: 12, day: 9, title: "Batalla de Ayacucho", type: "feriado" },
  { id: "onem-ie-2026", month: 6, day: 15, title: "ONEM 2026 — etapa I.E.", type: "concurso", year: 2026 },
  { id: "onem-ugel-2026", month: 8, day: 14, title: "ONEM 2026 — etapa UGEL", type: "concurso", year: 2026 },
  { id: "florales-ugel-2026", month: 8, day: 20, title: "Juegos Florales 2026 — etapa UGEL", type: "concurso", year: 2026 },
  { id: "eureka-ie-2026", month: 8, day: 28, title: "Eureka 2026 — etapa I.E.", type: "concurso", year: 2026 },
  { id: "emprende-ugel-2026", month: 9, day: 15, title: "Crea y Emprende 2026 — etapa UGEL", type: "concurso", year: 2026 },
];

function iso(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function referenceEventsForYear(year: number, enabledIds: string[]): CalendarEvent[] {
  const enabled = new Set(enabledIds);
  return referenceDates
    .filter((item) => enabled.has(item.id) && (item.year === undefined || item.year === year))
    .map((item) => ({
      id: `reference-${year}-${item.id}`,
      title: item.title,
      date: iso(year, item.month, item.day),
      time: "",
      type: item.type,
      notes: item.type === "concurso"
        ? "Fecha referencial heredada del proyecto anterior. Confirma la convocatoria vigente con tu UGEL."
        : "Fecha referencial editable desde Fechas y concursos.",
      completed: false,
      source: "referencia",
    }));
}

export function defaultBlocks(year: number): AcademicBlock[] {
  return [
    { id: "g1", name: "Primer bloque de gestión", kind: "gestion", startDate: iso(year, 3, 2), endDate: iso(year, 3, 13) },
    { id: "b1", name: "Primer bloque lectivo", kind: "lectivo", startDate: iso(year, 3, 16), endDate: iso(year, 5, 15) },
    { id: "g2", name: "Segundo bloque de gestión", kind: "gestion", startDate: iso(year, 5, 18), endDate: iso(year, 5, 22) },
    { id: "b2", name: "Segundo bloque lectivo", kind: "lectivo", startDate: iso(year, 5, 25), endDate: iso(year, 7, 24) },
    { id: "g3", name: "Tercer bloque de gestión", kind: "gestion", startDate: iso(year, 7, 27), endDate: iso(year, 8, 7) },
    { id: "b3", name: "Tercer bloque lectivo", kind: "lectivo", startDate: iso(year, 8, 10), endDate: iso(year, 10, 9) },
    { id: "g4", name: "Cuarto bloque de gestión", kind: "gestion", startDate: iso(year, 10, 12), endDate: iso(year, 10, 16) },
    { id: "b4", name: "Cuarto bloque lectivo", kind: "lectivo", startDate: iso(year, 10, 19), endDate: iso(year, 12, 18) },
    { id: "g5", name: "Quinto bloque de gestión", kind: "gestion", startDate: iso(year, 12, 21), endDate: iso(year, 12, 31) },
  ];
}

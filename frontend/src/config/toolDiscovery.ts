import { modules, tools, type ToolDefinition } from "./tools";

export type ToolRecommendation = ToolDefinition & {
  reason: string;
  score: number;
};

const INTENT_TERMS: Record<string, string[]> = {
  "plan-curricular-anual": ["plan anual", "planificar el año", "pca", "programacion anual"],
  "unidad-aprendizaje": ["unidad", "unidad de aprendizaje", "varias sesiones"],
  "sesion-aprendizaje": ["sesion", "sesión", "clase", "preparar una clase"],
  examen: ["examen", "prueba", "evaluacion", "evaluación", "preguntas", "evaluar"],
  "lista-cotejo": ["lista de cotejo", "si o no", "sí o no", "comprobar indicadores"],
  "rubrica-evaluacion": ["rubrica", "rúbrica", "niveles de logro", "criterios"],
  "ficha-aprendizaje": ["ficha", "ficha de trabajo", "practica guiada", "práctica guiada"],
  "preguntas-texto": ["preguntas de un texto", "comprension lectora", "comprensión lectora"],
  "tarea-extension-hogar": ["tarea", "tarea para casa", "actividad para el hogar"],
  "correo-familias": ["correo", "mensaje a familia", "comunicar a una familia", "padres"],
  "presentaciones-didacticas": ["diapositivas", "presentacion", "presentación", "exponer"],
  "sopas-letras": ["sopa de letras", "buscar palabras"],
  crucigramas: ["crucigrama", "pistas y palabras"],
  "adaptacion-nee-dua": ["adaptar", "inclusion", "inclusión", "nee", "dua", "barreras"],
  "plan-refuerzo": ["refuerzo", "recuperar aprendizaje", "plan de apoyo"],
  "monitorea-avances": ["progreso", "avances", "bimestre", "seguimiento"],
  "plan-tutoria": ["tutoria", "tutoría", "plan tutorial"],
};

const AREA_TERMS: Record<string, string[]> = {
  "Matemática": ["matematica", "matemática", "aritmetica", "aritmética", "ecuacion", "ecuación", "fraccion", "fracción"],
  "Comunicación": ["comunicacion", "comunicación", "lectura", "texto", "escritura"],
  "Ciencia y Tecnología": ["ciencia", "tecnologia", "tecnología", "experimento"],
  "Personal Social": ["personal social", "convivencia", "ciudadania", "ciudadanía"],
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-PE").trim();
}

function includesPhrase(query: string, phrase: string) {
  return query.includes(normalize(phrase));
}

export function detectCurricularArea(query: string): string | undefined {
  const normalized = normalize(query);
  return Object.entries(AREA_TERMS).find(([, terms]) => terms.some((term) => includesPhrase(normalized, term)))?.[0];
}

export function recommendTools(query: string, limit = 6): ToolRecommendation[] {
  const normalized = normalize(query);
  if (!normalized) return [];
  const tokens = normalized.split(/\s+/).filter((token) => token.length > 2);

  return tools
    .map((candidate) => {
      const module = modules.find((item) => item.id === candidate.module);
      const searchable = normalize([
        candidate.title,
        candidate.description,
        candidate.module,
        module?.title,
        ...candidate.keywords,
      ].filter(Boolean).join(" "));
      const phrases = INTENT_TERMS[candidate.id] ?? [];
      const directMatches = phrases.filter((phrase) => includesPhrase(normalized, phrase));
      const tokenMatches = tokens.filter((token) => searchable.includes(token));
      const exactTitle = normalized.includes(normalize(candidate.title));
      const score = directMatches.length * 12 + tokenMatches.length * 2 + (exactTitle ? 20 : 0);
      const matchedIntent = directMatches[0];
      const reason = matchedIntent
        ? `Te permite ${candidate.description.charAt(0).toLocaleLowerCase("es-PE")}${candidate.description.slice(1)}`
        : `Coincide con ${tokenMatches.slice(0, 3).join(", ") || "lo que necesitas"}.`;
      return { ...candidate, score, reason };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, "es"))
    .slice(0, limit);
}

export function searchNavigation(query: string) {
  const recommendations = recommendTools(query, 14);
  if (recommendations.length) return recommendations;
  const normalized = normalize(query);
  if (!normalized) return [];
  return tools
    .filter((candidate) => normalize(`${candidate.title} ${candidate.description}`).includes(normalized))
    .slice(0, 14)
    .map((candidate) => ({ ...candidate, score: 1, reason: candidate.description }));
}

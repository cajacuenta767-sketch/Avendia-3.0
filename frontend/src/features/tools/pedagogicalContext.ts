import type { WorkflowField } from "../../config/workflows";

export type FieldValueLike = string | string[] | undefined;
export type AssistanceMode = "quick" | "complete" | "guided";
export type ContextStatus = "incomplete" | "coherent" | "review";

export type PedagogicalContext = {
  modality: string;
  level: string;
  grade: string;
  area: string;
  topic: string;
  competency: string;
  purpose: string;
  evidence: string;
  institution: string;
  fingerprint: string;
  status: ContextStatus;
  summary: string[];
  missing: string[];
};

const aliases: Record<keyof Omit<PedagogicalContext, "fingerprint" | "status" | "summary" | "missing">, string[]> = {
  modality: ["modality", "modalidad"],
  level: ["level", "nivel"],
  grade: ["grade", "grado", "cycle", "ciclo"],
  area: ["curricular_area", "area", "área"],
  // Las herramientas no siempre llaman al foco "topic". Por ejemplo, el
  // Examen usa "topics" y varias planificaciones usan contenido o asunto.
  // Mantener estos alias aquí evita que la IA vuelva a una sugerencia genérica
  // cuando el docente ya escribió el tema real.
  topic: ["topic", "topics", "theme", "themes", "subject", "content", "content_focus", "learning_topic", "session_topic", "task_title", "unit_title", "session_title", "tema", "temas", "contenido", "asunto", "titulo"],
  competency: ["competenc", "capacity", "performance", "competencia", "capacidad", "desempeño"],
  purpose: ["purpose", "objective", "goal", "propósito", "objetivo", "meta"],
  evidence: ["evidence", "product", "criterion", "evidencia", "producto", "criterio"],
  institution: ["institution", "school", "institución", "colegio"],
};

const hierarchy = ["modality", "level", "grade", "curricular_area", "topic", "competencies", "purpose", "evidence"];

function asText(value: FieldValueLike) {
  return Array.isArray(value) ? value.filter(Boolean).join(", ") : String(value ?? "").trim();
}

function findValue(values: Record<string, FieldValueLike>, keys: string[]) {
  const entries = Object.entries(values);
  for (const key of keys) {
    const exact = entries.find(([id]) => id.toLocaleLowerCase() === key);
    if (exact && asText(exact[1])) return asText(exact[1]);
  }
  for (const key of keys) {
    const partial = entries.find(([id, value]) => id.toLocaleLowerCase().includes(key) && asText(value));
    if (partial) return asText(partial[1]);
  }
  return "";
}

export function contextFingerprint(input: Record<string, string>) {
  const source = Object.entries(input).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}:${value}`).join("|");
  let hash = 2166136261;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `ctx-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function derivePedagogicalContext(values: Record<string, FieldValueLike>): PedagogicalContext {
  const extracted = Object.fromEntries(Object.entries(aliases).map(([key, keys]) => [key, findValue(values, keys)])) as Omit<PedagogicalContext, "fingerprint" | "status" | "summary" | "missing">;
  const labels: Array<[keyof typeof extracted, string]> = [
    ["modality", "Modalidad"], ["level", "Nivel"], ["grade", "Grado/ciclo"], ["area", "Área"],
    ["topic", "Tema"], ["competency", "Competencia"], ["purpose", "Propósito"], ["evidence", "Evidencia"],
  ];
  const summary = labels.filter(([key]) => extracted[key]).map(([key, label]) => `${label}: ${extracted[key]}`).slice(0, 7);
  const missing = labels.slice(0, 5).filter(([key]) => !extracted[key]).map(([, label]) => label);
  return {
    ...extracted,
    fingerprint: contextFingerprint(extracted),
    status: missing.length >= 3 ? "incomplete" : "coherent",
    summary,
    missing,
  };
}

const areaIdeas: Record<string, string[]> = {
  matemat: ["Situación de reparto o medida", "Representación concreta y gráfica", "Procedimiento explicado", "Comprobación del resultado", "Problema de la vida cotidiana"],
  comunic: ["Texto o situación comunicativa", "Idea principal e inferencias", "Opinión con evidencias", "Producción oral o escrita", "Revisión con criterios claros"],
  ciencia: ["Fenómeno observable", "Pregunta e hipótesis", "Experiencia segura", "Registro de evidencias", "Explicación basada en resultados"],
  personal: ["Situación de la comunidad", "Toma de decisiones", "Convivencia y participación", "Identidad y bienestar", "Compromiso observable"],
  tutor: ["Situación segura y cercana", "Reflexión sin juicios", "Acuerdo personal", "Ruta de apoyo", "Seguimiento respetuoso"],
};

const topicIdeas: Array<[RegExp, string[]]> = [
  [/aritm|matem|fracci|n[uú]mer|operaci[oó]n|c[aá]lcul|medida|proporci[oó]n|geometr/i, ["Problema matemático cotidiano", "Representación concreta o gráfica", "Procedimiento explicado", "Comprobación del resultado", "Reto con dificultad gradual"]],
  [/comunic|lect|texto|escrit|oral|argument|narraci[oó]n|gram[aá]tic/i, ["Texto cercano al contexto", "Idea principal e inferencias", "Opinión sustentada", "Producción oral o escrita", "Revisión con criterios"]],
  [/ciencia|experimento|hip[oó]tesis|indaga|ecosistema|materia|energ[ií]a/i, ["Fenómeno observable", "Pregunta e hipótesis", "Experiencia segura", "Registro de evidencias", "Explicación basada en resultados"]],
  [/historia|geograf[ií]a|ciudadan|convivencia|identidad|personal social/i, ["Situación de la comunidad", "Decisión fundamentada", "Perspectivas diversas", "Evidencia histórica o social", "Compromiso observable"]],
];

function contextualBase(context: PedagogicalContext) {
  const topicKey = `${context.topic} ${context.competency}`.toLocaleLowerCase();
  const topicMatch = topicIdeas.find(([pattern]) => pattern.test(topicKey));
  if (topicMatch) return topicMatch[1];
  const areaKey = Object.keys(areaIdeas).find((key) => context.area.toLocaleLowerCase().includes(key));
  return areaKey ? areaIdeas[areaKey] : [];
}

export function contextualSuggestions(
  base: string[],
  field: WorkflowField,
  context: PedagogicalContext,
): string[] {
  const id = `${field.id} ${field.label}`.toLocaleLowerCase();
  let semantic: string[] = [];
  if (/criter|indicador|rubric|evalu/.test(id)) semantic = ["Conducta observable", "Evidencia verificable", "Nivel de logro progresivo", "Un criterio por enunciado", "Retroalimentación accionable"];
  else if (/actividad|desarrollo|tarea|consigna|ejercicio/.test(id)) semantic = ["Consigna que puede resolverse", "Material disponible", "Pasos claros y breves", "Producto o respuesta concreta", "Alternativa accesible"];
  else if (/justifica|necesidad|diagn[oó]st/.test(id)) semantic = ["Necesidad sustentada", "Brecha observable", "Contexto del grupo", "Logro esperado", "Decisión pedagógica"];
  else if (/prop[oó]sito|objetivo|meta/.test(id)) semantic = ["Verbo observable", "Aprendizaje central", "Condición de realización", "Evidencia esperada", "Pertinencia para el grupo"];
  else if (/tema|contenido|pregunta/.test(id)) semantic = contextualBase(context);

  const topicSuffix = context.topic ? `: ${context.topic.slice(0, 48)}` : "";
  const contextual = (semantic.length ? semantic : contextualBase(context)).map((item, index) => index < 2 && topicSuffix ? `${item}${topicSuffix}` : item);
  return [...contextual, ...base].map((item) => item.trim()).filter((item, index, all) => item && all.indexOf(item) === index).slice(0, 5);
}

export function contextualPlaceholder(field: WorkflowField, context: PedagogicalContext) {
  if (!context.topic && !context.area) return field.placeholder;
  const focus = context.topic || context.area;
  if (field.type === "textarea") return `Ej. Desarrolla ${field.label.toLocaleLowerCase()} para “${focus}”, adecuado a ${context.grade || context.level || "tu grupo"}.`;
  if (field.type === "text" && !/nombre|instituci|dre|ugel|secci[oó]n/.test(`${field.id} ${field.label}`.toLocaleLowerCase())) return `Ej. ${focus}`;
  return field.placeholder;
}

export function impactedFields(fields: WorkflowField[], changedId: string, values: Record<string, FieldValueLike>) {
  const impacted = new Set<string>();
  const changedIndex = hierarchy.findIndex((key) => changedId.toLocaleLowerCase().includes(key));
  const walk = (parentId: string) => {
    fields.filter((field) => field.dependsOn === parentId).forEach((field) => {
      if (asText(values[field.id])) impacted.add(field.id);
      walk(field.id);
    });
  };
  walk(changedId);
  if (changedIndex >= 0) {
    fields.forEach((field) => {
      const index = hierarchy.findIndex((key) => `${field.id} ${field.label}`.toLocaleLowerCase().includes(key));
      if (index > changedIndex && asText(values[field.id])) impacted.add(field.id);
    });
  }
  return [...impacted];
}

export function contextStatus(context: PedagogicalContext, reviewCount: number): { status: ContextStatus; label: string; detail: string } {
  if (reviewCount) return { status: "review", label: "Requiere revisión", detail: `${reviewCount} ${reviewCount === 1 ? "campo depende" : "campos dependen"} de un dato que cambió.` };
  if (context.missing.length) return { status: "incomplete", label: "Contexto en construcción", detail: `Aún falta: ${context.missing.join(", ")}.` };
  return { status: "coherent", label: "Contexto coherente", detail: "Modalidad, nivel, grado, área y tema están conectados." };
}

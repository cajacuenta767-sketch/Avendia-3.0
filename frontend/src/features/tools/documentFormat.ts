/**
 * Reglas de formato compartidas por la vista previa HTML y el Word exportado.
 * No depende de React ni de la librería docx para que ambos puedan importarla.
 */
import type { WorkflowArtifact, WorkflowArtifactTable } from "./exportWorkflowDocx";

const INLINE_BULLET = /\s+[•◦▪‣●■➢➤►]\s+/;
const LINE_BULLET = /^\s*(?:[•◦▪‣●■➢➤►]|[-–—*])\s+/;
const LABEL_PATTERN = /^([A-ZÁÉÍÓÚÑ][^:]{1,40}?):\s+(\S.*)$/s;
const TITLE_STOPWORDS = new Set([
  "para", "sobre", "como", "desde", "hasta", "entre", "según", "segun", "los", "las", "del", "con", "una", "uno", "por", "sin", "que",
]);

export type NarrativeBlock = { text: string; bullet: boolean };

/** Un dato es marcador cuando el docente no lo aportó. */
export function isPlaceholder(value: unknown): boolean {
  const text = String(value ?? "").trim();
  return !text || /^no registrado$/i.test(text) || /^(n\/a|por definir|pendiente)$/i.test(text);
}

/** Quita la numeración inicial ("I.", "1.", "1)", "A.") para que el documento numere una sola vez. */
export function stripNumbering(title: string): string {
  return String(title ?? "").replace(/^\s*(?:[IVXLC]+|\d+|[A-Z])\s*[.)\-:]\s+/, "").trim() || String(title ?? "").trim();
}

export function toRoman(value: number): string {
  const numerals: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let remaining = Math.max(1, Math.floor(value));
  let result = "";
  for (const [amount, numeral] of numerals) {
    while (remaining >= amount) {
      result += numeral;
      remaining -= amount;
    }
  }
  return result;
}

/** Divide un texto en párrafos y viñetas reales aunque llegue con viñetas incrustadas. */
export function splitNarrative(text: string): NarrativeBlock[] {
  const clean = String(text ?? "").replace(/\r/g, "").trim();
  if (!clean) return [];
  const lines = clean.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const blocks: NarrativeBlock[] = [];
  for (const line of lines) {
    if (LINE_BULLET.test(line)) {
      blocks.push({ text: line.replace(LINE_BULLET, ""), bullet: true });
      continue;
    }
    const parts = line.split(INLINE_BULLET).map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 3) {
      blocks.push({ text: parts[0], bullet: false });
      parts.slice(1).forEach((part) => blocks.push({ text: part, bullet: true }));
    } else {
      blocks.push({ text: line, bullet: false });
    }
  }
  return blocks;
}

/** Separa "Etiqueta: contenido" cuando la etiqueta tiene de una a cuatro palabras. */
export function splitLabel(text: string): { label: string | null; body: string } {
  const match = String(text ?? "").trim().match(LABEL_PATTERN);
  if (match && match[1].split(/\s+/).length <= 4) return { label: match[1], body: match[2] };
  return { label: null, body: String(text ?? "").trim() };
}

export function titleTokens(value: string): Set<string> {
  return new Set(
    String(value ?? "")
      .toLocaleLowerCase("es")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .split(/[^a-z0-9ñ]+/)
      .filter((token) => token.length >= 4 && !TITLE_STOPWORDS.has(token))
  );
}

export function sameTitle(left: string, right: string): boolean {
  const a = titleTokens(left);
  const b = titleTokens(right);
  return a.size > 0 && a.size === b.size && [...a].every((token) => b.has(token));
}

/**
 * Asocia cada tabla a la sección cuyo título comparte la mayoría de sus palabras,
 * para mostrarla justo después de ese apartado. Las demás forman el bloque de matrices.
 */
export function attachTablesToSections(artifact: Pick<WorkflowArtifact, "sections" | "tables">): {
  bySection: Map<number, WorkflowArtifactTable[]>;
  remaining: WorkflowArtifactTable[];
} {
  const bySection = new Map<number, WorkflowArtifactTable[]>();
  const remaining: WorkflowArtifactTable[] = [];
  const sectionTokens = artifact.sections.map((section) => titleTokens(section.title));
  (artifact.tables ?? []).forEach((table) => {
    const tokens = titleTokens(table.title);
    let best = -1;
    let bestScore = 0;
    sectionTokens.forEach((candidate, index) => {
      if (!tokens.size) return;
      const shared = [...tokens].filter((token) => candidate.has(token)).length;
      const score = shared / tokens.size;
      if (score > bestScore) {
        bestScore = score;
        best = index;
      }
    });
    if (best >= 0 && bestScore >= 0.5) bySection.set(best, [...(bySection.get(best) ?? []), table]);
    else remaining.push(table);
  });
  return { bySection, remaining };
}

// ==========================================================================
// Reactivos tipados (examen y preguntas de texto)
// ==========================================================================
export type QuestionFormat =
  | "opcion_multiple"
  | "respuesta_corta"
  | "relacionar"
  | "verdadero_falso"
  | "desarrollo"
  | "texto_breve"
  | "tabla"
  | "dibujo"
  | "operacion"
  | "generica";

export type DocumentQuestion = {
  number: number;
  format: QuestionFormat;
  prompt: string;
  options: string[];
  left_column: string[];
  right_column: string[];
  answer: string;
  justification: string;
  cognitive_level: string;
  points: number | null;
};

const QUESTION_FORMATS: Array<[string, QuestionFormat]> = [
  ["opción múltiple", "opcion_multiple"],
  ["opcion multiple", "opcion_multiple"],
  ["respuesta corta", "respuesta_corta"],
  ["relacionar", "relacionar"],
  ["verdadero", "verdadero_falso"],
  ["desarrollo", "desarrollo"],
  ["texto breve", "texto_breve"],
  ["tabla", "tabla"],
  ["dibujo", "dibujo"],
  ["resolución matemática", "operacion"],
  ["resolucion matematica", "operacion"],
  ["operación", "operacion"],
];

export const QUESTION_FORMAT_LABELS: Record<QuestionFormat, string> = {
  opcion_multiple: "OPCIÓN MÚLTIPLE",
  respuesta_corta: "RESPUESTA CORTA",
  relacionar: "RELACIONAR",
  verdadero_falso: "VERDADERO / FALSO",
  desarrollo: "DESARROLLO",
  texto_breve: "TEXTO BREVE",
  tabla: "COMPLETA LA TABLA",
  dibujo: "DIBUJO O ESQUEMA",
  operacion: "RESOLUCIÓN",
  generica: "RESPUESTA",
};

const LEADING_QUESTION_NUMBER = /^\s*(?:\d+|[a-z])[.)]\s+/i;

/** Interpreta un reactivo escrito con prefijo de formato y separadores "|". */
export function parseQuestionText(raw: string, number: number): DocumentQuestion {
  const text = String(raw ?? "").trim();
  const prefix = text.match(/^\[([^\]]+)\]\s*/);
  const declared = (prefix?.[1] ?? "").toLocaleLowerCase("es");
  const format = QUESTION_FORMATS.find(([needle]) => declared.includes(needle))?.[1] ?? "generica";
  let body = text.slice(prefix?.[0].length ?? 0).trim().replace(LEADING_QUESTION_NUMBER, "");
  let options: string[] = [];
  let left_column: string[] = [];
  let right_column: string[] = [];
  let prompt = body;
  const relation = body.match(/^(.*?)\s*\|?\s*Columna A:\s*(.*?)\s*\|\s*Columna B:\s*(.*)$/is);
  const splitItems = (value: string) => value.split(/\s*;\s*/).map((item) => item.trim()).filter(Boolean);
  if (format === "relacionar" && relation) {
    prompt = relation[1].trim().replace(/\|\s*$/, "").trim() || body;
    left_column = splitItems(relation[2]);
    right_column = splitItems(relation[3]);
  } else if (format === "opcion_multiple") {
    const found = [...body.matchAll(/(?:^|\||\n)\s*([A-Da-d])[.)]\s*([^|\n]+)/g)];
    if (found.length) {
      options = found.map((match) => `${match[1].toUpperCase()}) ${match[2].trim()}`);
      prompt = body.slice(0, found[0].index ?? 0).replace(/\|\s*$/, "").trim() || body;
    }
  }
  body = prompt;
  return { number, format, prompt: body, options, left_column, right_column, answer: "", justification: "", cognitive_level: "", points: null };
}

type QuestionSource = {
  sections: Array<{ title: string; key_points: string[] }>;
  questions?: DocumentQuestion[] | null;
};

const LEVEL_LABELS: Array<[string, string]> = [["literal", "Literal"], ["inferencial", "Inferencial"], ["crítico", "Crítico"], ["critico", "Crítico"]];

/**
 * Devuelve los reactivos tipados del artefacto. Usa los que calculó el servidor y,
 * si un documento antiguo no los trae, los deriva de las secciones "Preguntas".
 */
export function resolveQuestions(artifact: QuestionSource): DocumentQuestion[] {
  if (artifact.questions?.length) return artifact.questions;
  const questionSections = artifact.sections.filter((section) => /^preguntas/i.test(section.title.trim()));
  if (!questionSections.length) return [];
  const keySection = artifact.sections.find((section) => /clave/i.test(section.title));
  const answers = (keySection?.key_points ?? []).map((item) => item.trim().replace(LEADING_QUESTION_NUMBER, ""));
  let number = 0;
  return questionSections.flatMap((section) => {
    const lowered = section.title.toLocaleLowerCase("es");
    const level = LEVEL_LABELS.find(([needle]) => lowered.includes(needle))?.[1] ?? "";
    return section.key_points.map((point) => {
      number += 1;
      return { ...parseQuestionText(point, number), cognitive_level: level, answer: answers[number - 1] ?? "" };
    });
  });
}

export function formatPoints(points: number | null | undefined): string {
  if (points == null) return "";
  const rounded = Math.round(points * 100) / 100;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)} ${rounded === 1 ? "pto" : "pts"}`;
}

// ==========================================================================
// Nivel de riesgo en informes de analítica
// ==========================================================================
export type RiskLevel = "danger" | "warning" | "success";
export type RiskAssessment = { level: RiskLevel; label: string };

const RISK_RULES: Array<[RegExp, RiskLevel, string]> = [
  [/\b(cr[ií]tic|alerta|urgente|grave|alto riesgo|riesgo alto|prioridad alta|deserci[oó]n|desaprob)/i, "danger", "Crítico (Alerta)"],
  [/\b(en proceso|moderad|atenci[oó]n|riesgo medio|prioridad media|seguimiento|brecha)/i, "warning", "En proceso"],
  [/\b(logrado|estable|satisfactori|sin riesgo|prioridad baja|monitoreo|consolid)/i, "success", "Monitoreo"],
];

/** Clasifica una sección por los datos de sus tablas o por su propio texto, nunca por posición. */
export function riskLevelFor(
  section: { title: string; narrative: string; key_points: string[] },
  tables: Array<{ columns: string[]; rows: string[][] }> = [],
): RiskAssessment {
  const sectionTokens = titleTokens(section.title);
  for (const table of tables) {
    const levelIndex = table.columns.findIndex((column) => /nivel|prioridad|riesgo|atenci[oó]n|estado/i.test(column));
    if (levelIndex < 0) continue;
    for (const row of table.rows) {
      const rowTokens = titleTokens(row[0] ?? "");
      const shared = [...rowTokens].filter((token) => sectionTokens.has(token)).length;
      if (rowTokens.size && shared / rowTokens.size >= 0.5) {
        const assessment = classifyRisk(row[levelIndex] ?? "");
        if (assessment) return assessment;
      }
    }
  }
  const text = `${section.title} ${section.narrative} ${section.key_points.join(" ")}`;
  return classifyRisk(text) ?? { level: "warning", label: "En proceso" };
}

function classifyRisk(text: string): RiskAssessment | null {
  for (const [pattern, level, label] of RISK_RULES) {
    if (pattern.test(text)) return { level, label };
  }
  return null;
}

// ==========================================================================
// Puntaje de rúbricas y escalas
// ==========================================================================
export type RubricScoring = {
  criteria: string[];
  levels: string[];
  pointsPerLevel: number[];
  maxPerCriterion: number;
  total: number;
};

/**
 * Deriva la puntuación de una matriz analítica: la primera columna es el criterio,
 * la última se ignora si es una recomendación o evidencia, y cada nivel intermedio
 * vale de 1 a n puntos en orden ascendente.
 */
export function rubricScoring(table: { columns: string[]; rows: string[][] } | undefined): RubricScoring | null {
  if (!table || table.columns.length < 3 || !table.rows.length) return null;
  const trailingNote = /recomend|evidencia|comentario|observaci|retroaliment/i.test(table.columns[table.columns.length - 1]);
  const levels = table.columns.slice(1, trailingNote ? -1 : undefined);
  if (levels.length < 2) return null;
  const criteria = table.rows.map((row) => row[0]).filter(Boolean);
  const pointsPerLevel = levels.map((_, index) => index + 1);
  const maxPerCriterion = levels.length;
  return { criteria, levels, pointsPerLevel, maxPerCriterion, total: maxPerCriterion * criteria.length };
}

export function scoreToVigesimal(points: number, total: number): number {
  if (!total) return 0;
  return Math.round((points / total) * 20 * 10) / 10;
}

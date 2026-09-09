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

/** Datos reutilizables del documento que originó una continuación de clase. */
import { apiRequest } from "../../lib/api";
import { readAccessToken } from "../../lib/session";

export type SessionContext = {
  title: string;
  teacherName: string;
  directorName: string;
  institution: string;
  modality: "EBR" | "EBA" | "EBE";
  level: string;
  grade: string;
  section: string;
  area: string;
  topic: string;
};

type CompatibleDocument = {
  id: string;
  title: string;
  metadata_json?: { fields?: Record<string, unknown> };
};

function text(fields: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const raw = fields[key];
    const value = (Array.isArray(raw) ? raw.filter(Boolean).join(", ") : String(raw ?? "")).trim();
    if (value && !/^(no registrado|n\/a|por definir|pendiente)$/i.test(value)) return value;
  }
  return "";
}

function modalityOf(value: string): SessionContext["modality"] {
  const code = value.trim().slice(0, 3).toUpperCase();
  return code === "EBA" || code === "EBE" ? code : "EBR";
}

/**
 * Lee del servidor los campos del documento de origen y los devuelve normalizados.
 * Devuelve null cuando no hay sesión activa o el documento ya no está disponible.
 */
export async function readSessionContext(
  documentId: string,
  targetType: string,
  signal?: AbortSignal,
): Promise<SessionContext | null> {
  const token = readAccessToken();
  if (!token) return null;
  const documents = await apiRequest<CompatibleDocument[]>(`/documents/compatible/${targetType}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  const source = documents.find((document) => document.id === documentId);
  if (!source) return null;
  const fields = source.metadata_json?.fields ?? {};
  return {
    title: source.title,
    teacherName: text(fields, "teacher_name"),
    directorName: text(fields, "director_name"),
    institution: text(fields, "institution"),
    modality: modalityOf(text(fields, "modality")),
    level: text(fields, "level"),
    grade: text(fields, "grade"),
    section: text(fields, "section", "sections"),
    area: text(fields, "curricular_area", "curricular_areas", "area"),
    topic: text(fields, "topic", "session_topic", "session_title", "theme", "unit_title", "task_title"),
  };
}

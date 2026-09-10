/** Reglas para reutilizar datos de un documento anterior en otra herramienta. */
type FieldValue = string | string[];

export type CompatibleDocument = {
  id: string;
  revision: number;
  title: string;
  document_type: string;
  updated_at: string;
  metadata_json: { fields?: Record<string, FieldValue> };
  compatibility_status: "compatible" | "review" | "not_recommended";
  compatibility_reasons: string[];
};

export const blockedField = (id: string) => /student|estudiante|score|nota|grade_value|diagnosis|diagn[oó]stico|password|correo|phone|famil/.test(id.toLocaleLowerCase());

const reusableGroups = [
  ["topic", "theme", "unit_title", "session_title", "session_topic", "task_title", "central_question"],
  ["curricular_area", "area"],
  ["competencies", "competency", "capacities", "capacity", "performance"],
  ["purpose", "learning_purpose", "objective", "goal"],
  ["evidence", "product", "criteria", "criterion"],
  ["institution", "school_name"],
];

export function sourceValueFor(fieldId: string, sourceFields: Record<string, FieldValue>) {
  if (sourceFields[fieldId] !== undefined && String(sourceFields[fieldId] ?? "").trim()) return sourceFields[fieldId];
  const group = reusableGroups.find((items) => items.some((item) => fieldId.toLocaleLowerCase().includes(item)));
  const key = group?.find((item) => sourceFields[item] !== undefined && String(sourceFields[item] ?? "").trim());
  return key ? sourceFields[key] : undefined;
}

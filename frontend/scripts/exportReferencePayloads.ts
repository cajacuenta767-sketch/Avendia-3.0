/**
 * Genera docs/reference-bank/payloads.json con una petición de ejemplo por
 * herramienta, a partir de las definiciones reales de src/config/workflows.ts.
 *
 *   cd frontend && npx vite-node scripts/exportReferencePayloads.ts
 *
 * El backend consume ese archivo con scripts/reference_bank.py para generar el
 * banco de referencia con Gemini y comparar cambios de prompt.
 */
import * as fs from "node:fs";
import * as path from "node:path";

import { workflowDefinitions, type WorkflowField } from "../src/config/workflows";
import { getDynamicEducationOptions, getEducationLevels } from "../src/config/education";

const PROFILE: Record<string, string> = {
  dre: "DRE San Martín",
  ugel: "UGEL Lamas",
  institution: "I.E. 0001 República del Perú",
  teacher_name: "Prof. Manuel Cárdenas Vega",
  director_name: "Lic. Rosa Alvarado Torres",
  subdirector_name: "Mg. Carlos Mendoza Paredes",
  level: "Primaria",
  grade: "4° de Primaria",
  section: "A",
  sections: "A y B",
  curricular_area: "Comunicación",
  school_year: "2026",
  student_name: "Lucía Pérez Quispe",
  student_count: "28",
  guardian_name: "Sra. Carmen Quispe",
  topic: "Hábitos de alimentación saludable e higiene cotidiana",
  theme: "Convivencia democrática en el aula",
  unit_title: "Cuidamos nuestra salud y la de nuestra comunidad",
  session_title: "Explicamos hábitos para una vida saludable",
  session_topic: "Alimentación saludable e higiene cotidiana",
  reading_title: "El agua de nuestra comunidad",
  source_text: "En la comunidad de Lamas el agua llega por un canal que cruza tres caseríos. Cuando llueve poco, las familias organizan turnos para regar y beber. Los niños aprenden que cuidar el canal es cuidar la vida de todos.",
};

function exampleFor(field: WorkflowField, values: Record<string, string>): string {
  if (PROFILE[field.id]) return PROFILE[field.id];
  if (field.dynamicOptions) {
    const parent = field.dependsOn ? values[field.dependsOn] ?? "" : "";
    const options = getDynamicEducationOptions(field.dynamicOptions, parent);
    return options[0] ?? "";
  }
  switch (field.type) {
    case "select":
      return field.options?.[0] ?? "";
    case "multiselect":
      return (field.options ?? []).slice(0, 2).join(", ");
    case "number":
      return String(field.min ?? 1);
    case "date":
      return "2026-06-15";
    case "repeater":
      return Array.from({ length: field.minItems ?? 1 }, (_, index) => `${field.itemPlaceholder || field.label} ${index + 1}`).join("\n");
    case "textarea":
      return `${field.label} para 4° de Primaria en Comunicación: ${PROFILE.topic}, con ejemplos del contexto de Lamas.`;
    default:
      return (field.placeholder || field.label).replace(/^Ej\.\s*/, "");
  }
}

const payloads = workflowDefinitions.map((workflow) => {
  const values: Record<string, string> = {};
  for (const step of workflow.steps) {
    for (const field of step.fields) values[field.id] = exampleFor(field, values);
  }
  if (values.modality && values.level && !getEducationLevels(values.modality).includes(values.level)) {
    values.level = getEducationLevels(values.modality)[0] ?? values.level;
  }
  return {
    tool_id: workflow.toolId,
    module: workflow.module,
    tool_title: workflow.key,
    artifact_type: workflow.artifactType,
    fields: values,
    requested_sections: workflow.outputSections,
  };
});

const target = path.resolve(process.cwd(), "..", "docs", "reference-bank", "payloads.json");
fs.mkdirSync(path.dirname(target), { recursive: true });
fs.writeFileSync(target, `${JSON.stringify(payloads, null, 2)}\n`);
console.log(`payloads: ${payloads.length} -> ${target}`);

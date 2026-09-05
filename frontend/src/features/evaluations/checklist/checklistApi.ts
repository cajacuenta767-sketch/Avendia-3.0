import { apiBlob, apiRequest, downloadApiBlob } from "../../../lib/api";
import type { ChecklistInstrumentPayload, EvaluationInstrumentDetail } from "./checklistTypes";

const ENDPOINT = "/evaluation-instruments";

export async function getChecklistInstrument(instrumentId: string, signal?: AbortSignal): Promise<EvaluationInstrumentDetail> {
  return apiRequest<EvaluationInstrumentDetail>(`${ENDPOINT}/${instrumentId}/draft`, {
    signal,
  });
}

/**
 * Contract implemented by the Evaluamos API:
 * POST /evaluation-instruments creates the atomic instrument graph and
 * PUT /evaluation-instruments/{id}/draft replaces its draft using a revision.
 */
export async function saveChecklistInstrument(
  payload: ChecklistInstrumentPayload,
  current?: Pick<EvaluationInstrumentDetail, "id" | "revision"> | null,
): Promise<EvaluationInstrumentDetail> {
  if (!current) {
    return apiRequest<EvaluationInstrumentDetail>(ENDPOINT, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  return apiRequest<EvaluationInstrumentDetail>(`${ENDPOINT}/${current.id}/draft`, {
    method: "PUT",
    body: JSON.stringify({ ...payload, expected_revision: current.revision }),
  });
}

export async function downloadChecklistWorkbook(instrumentId: string): Promise<void> {
  const file = await apiBlob(`${ENDPOINT}/${instrumentId}/exports/checklist.xlsx`);
  downloadApiBlob(file);
}

export type ChecklistCriteriaPrompt = {
  activity: string;
  learningEvidence: string;
  emphasis: string;
  modality: string;
  level: string;
  grade: string;
  area: string;
};

/** IA limitada al trabajo pedagógico: no incluye docente, institución ni datos administrativos. */
export async function suggestChecklistCriteria(prompt: ChecklistCriteriaPrompt): Promise<string> {
  const response = await apiRequest<{ reply: string }>("/ai/tools/field-assist", {
    method: "POST",
    body: JSON.stringify({
      tool_id: "lista-cotejo",
      tool_title: "Lista de cotejo",
      module: "evaluamos",
      field_id: "criteria",
      field_label: "Criterios observables de evaluación",
      question1: "¿Qué actividad o producto se evaluará?",
      answer1: prompt.learningEvidence || prompt.activity,
      question2: "¿Qué aprendizaje debe observarse?",
      answer2: prompt.emphasis,
      selected_suggestions: [prompt.area, prompt.level, prompt.grade].filter(Boolean),
      custom_detail: "Propón entre 3 y 5 criterios breves, observables y verificables. Devuelve un criterio por línea, sin numeración, sin asteriscos y sin decidir una calificación.",
      current_value: "",
      form_values: {
        modality: prompt.modality,
        level: prompt.level,
        grade: prompt.grade,
        curricular_area: prompt.area,
        activity: prompt.activity,
      },
    }),
  });
  return response.reply;
}

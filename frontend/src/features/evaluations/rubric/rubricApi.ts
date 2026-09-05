import { apiRequest } from "../../../lib/api";
import type { RubricInstrumentDetail, RubricInstrumentPayload } from "./rubricTypes";

const ENDPOINT = "/evaluation-instruments";

function authHeaders(): HeadersInit {
  const token = sessionStorage.getItem("avendia.accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getRubricInstrument(instrumentId: string, signal?: AbortSignal): Promise<RubricInstrumentDetail> {
  return apiRequest<RubricInstrumentDetail>(`${ENDPOINT}/${instrumentId}/draft`, {
    headers: authHeaders(),
    signal,
  });
}

export async function saveRubricInstrument(
  payload: RubricInstrumentPayload,
  current?: Pick<RubricInstrumentDetail, "id" | "revision"> | null,
): Promise<RubricInstrumentDetail> {
  if (!current) {
    return apiRequest<RubricInstrumentDetail>(ENDPOINT, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  }
  return apiRequest<RubricInstrumentDetail>(`${ENDPOINT}/${current.id}/draft`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ ...payload, expected_revision: current.revision }),
  });
}

export type RubricFeedbackPrompt = {
  studentContext: string;
  criterionTitle: string;
  levelLabel: string;
  evidence: string;
  strength: string;
  improvement: string;
  currentRecommendation: string;
  modality: string;
  level: string;
  grade: string;
  area: string;
};

/** Uses the existing contextual field assistant; administrative names are omitted. */
export async function suggestRubricFeedback(prompt: RubricFeedbackPrompt): Promise<string> {
  const response = await apiRequest<{ reply: string }>("/ai/tools/field-assist", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      tool_id: "calificador-rubrica",
      tool_title: "Calificador de rúbrica",
      module: "evaluamos",
      field_id: "recommendation",
      field_label: "Recomendación para escalar el aprendizaje",
      question1: "¿Qué evidencia concreta mostró el estudiante?",
      answer1: [prompt.evidence, prompt.strength].filter(Boolean).join(" "),
      question2: "¿Cuál es el siguiente aprendizaje que debe alcanzar?",
      answer2: prompt.improvement,
      selected_suggestions: [prompt.criterionTitle, prompt.levelLabel].filter(Boolean),
      custom_detail: "Redacta una recomendación breve, accionable, respetuosa y observable. No decidas la calificación final.",
      current_value: prompt.currentRecommendation,
      form_values: {
        modality: prompt.modality,
        level: prompt.level,
        grade: prompt.grade,
        curricular_area: prompt.area,
        student_context: prompt.studentContext,
      },
    }),
  });
  return response.reply;
}

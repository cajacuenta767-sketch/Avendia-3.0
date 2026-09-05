import { afterEach, describe, expect, it, vi } from "vitest";

import { suggestRubricFeedback } from "./rubricApi";

describe("suggestRubricFeedback", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    sessionStorage.clear();
  });

  it("sends pedagogical context without teacher or institution identity", async () => {
    sessionStorage.setItem("avendia.accessToken", "test-token");
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      void input;
      void init;
      return new Response(JSON.stringify({ reply: "Siguiente paso" }), { status: 200, headers: { "Content-Type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);
    await suggestRubricFeedback({
      studentContext: "Aula rural multigrado",
      criterionTitle: "Uso de evidencias",
      levelLabel: "En proceso",
      evidence: "Incluyó un dato",
      strength: "Organiza sus ideas",
      improvement: "Justificar la conclusión",
      currentRecommendation: "",
      modality: "EBR",
      level: "Primaria",
      grade: "4° de Primaria",
      area: "Matemática",
    });
    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body.tool_id).toBe("calificador-rubrica");
    expect(body.field_id).toBe("recommendation");
    expect(body.form_values).not.toHaveProperty("teacher_name");
    expect(body.form_values).not.toHaveProperty("institution");
    expect(body.form_values.student_context).toBe("Aula rural multigrado");
  });
});

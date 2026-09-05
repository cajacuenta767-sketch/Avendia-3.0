import { describe, expect, it } from "vitest";

import { detectCurricularArea, recommendTools } from "./toolDiscovery";

describe("tool discovery", () => {
  it("recommends an exam for an arithmetic test instead of unrelated content", () => {
    const [first] = recommendTools("Quiero una prueba de aritmética para cuarto de primaria");
    expect(first.id).toBe("examen");
    expect(detectCurricularArea("prueba de aritmética")).toBe("Matemática");
  });

  it("recognizes a presentation request in natural language", () => {
    const recommendations = recommendTools("Necesito diapositivas para exponer ciencia");
    expect(recommendations[0].id).toBe("presentaciones-didacticas");
  });

  it("distinguishes a checklist from a rubric", () => {
    const recommendations = recommendTools("Quiero marcar sí o no por estudiante en una lista de cotejo");
    expect(recommendations[0].id).toBe("lista-cotejo");
  });
});

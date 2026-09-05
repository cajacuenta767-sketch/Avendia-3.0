import { describe, expect, it } from "vitest";

import type { WorkflowField } from "../../config/workflows";
import { contextualSuggestions, derivePedagogicalContext, impactedFields } from "./pedagogicalContext";

describe("pedagogicalContext", () => {
  it("derives a stable shared context from workflow values", () => {
    const context = derivePedagogicalContext({
      modality: "EBR — Educación Básica Regular",
      level: "Primaria",
      grade: "4.º",
      curricular_area: "Matemática",
      topic: "Fracciones en situaciones de reparto",
    });

    expect(context.status).toBe("coherent");
    expect(context.area).toBe("Matemática");
    expect(context.summary).toContain("Tema: Fracciones en situaciones de reparto");
    expect(context.fingerprint).toMatch(/^ctx-/);
  });

  it("changes suggestions according to the active field and area", () => {
    const context = derivePedagogicalContext({ curricular_area: "Comunicación", topic: "Leyendas locales" });
    const field: WorkflowField = { id: "criteria", label: "Criterios de evaluación", type: "textarea" };
    const suggestions = contextualSuggestions(["Genérica"], field, context);

    expect(suggestions[0]).toContain("Conducta observable");
    expect(suggestions).not.toContain("Genérica");
  });

  it("uses the plural exam topics field as the dominant topic", () => {
    const context = derivePedagogicalContext({
      curricular_area: "Matemática",
      topics: "Aritmética: operaciones con fracciones",
    });
    const field: WorkflowField = { id: "criteria", label: "Criterios de evaluación", type: "textarea" };

    expect(context.topic).toBe("Aritmética: operaciones con fracciones");
    expect(contextualSuggestions([], field, context)).toContain("Conducta observable: Aritmética: operaciones con fracciones");
  });

  it("preserves dependent content and reports what requires review", () => {
    const fields: WorkflowField[] = [
      { id: "level", label: "Nivel", type: "select" },
      { id: "grade", label: "Grado", type: "select", dependsOn: "level" },
      { id: "topic", label: "Tema", type: "text" },
      { id: "purpose", label: "Propósito", type: "textarea" },
    ];
    const values = { level: "Primaria", grade: "4.º", topic: "Fracciones", purpose: "Resolver repartos" };

    expect(impactedFields(fields, "level", values)).toEqual(expect.arrayContaining(["grade", "topic", "purpose"]));
    expect(values.purpose).toBe("Resolver repartos");
  });
});

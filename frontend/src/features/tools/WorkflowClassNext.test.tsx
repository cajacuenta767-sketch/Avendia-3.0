import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WorkflowTool } from "./WorkflowTool";

const mocks = vi.hoisted(() => ({ apiRequest: vi.fn() }));

vi.mock("../../lib/api", () => ({ apiRequest: (...args: unknown[]) => mocks.apiRequest(...args) }));
vi.mock("./templateApi", () => ({
  listInstitutionalTemplates: vi.fn().mockResolvedValue([]),
  renderInstitutionalTemplate: vi.fn(),
}));

function artefacto(titulo: string) {
  return {
    document_title: titulo,
    executive_summary: "Resumen de la clase.",
    sections: [{ title: "Secuencia", narrative: "Inicio, desarrollo y cierre.", key_points: [] }],
    teacher_recommendations: [],
    tables: [],
    model: "prueba",
  };
}

function sembrar(clave: string, paso: number, titulo: string) {
  localStorage.setItem(clave, JSON.stringify({
    version: 2,
    currentStep: paso,
    updatedAt: new Date().toISOString(),
    values: { topic: "Argumentos en textos" },
    artifact: artefacto(titulo),
  }));
}

describe("Continúa tu clase", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem("avendia.accessToken", "token-de-prueba");
    mocks.apiRequest.mockReset();
    mocks.apiRequest.mockResolvedValue([]);
  });

  afterEach(cleanup);

  it("ofrece los recursos que continúan una sesión de aprendizaje", () => {
    sembrar("avendia.draft.workflow.planificamos/sesion-aprendizaje.v2.anonymous", 5, "Sesión de prueba");
    render(
      <MemoryRouter initialEntries={["/dashboard/planificamos/sesion-aprendizaje"]}>
        <WorkflowTool />
      </MemoryRouter>,
    );

    expect(screen.getByText("Continúa tu clase")).toBeInTheDocument();
    expect(screen.getByText("Evaluación escrita")).toBeInTheDocument();
    expect(screen.getByText("Tarea para casa")).toBeInTheDocument();
    expect(screen.getByText("Presentación")).toBeInTheDocument();
    expect(screen.getByText("Recurso interactivo")).toBeInTheDocument();
  });

  it("no aparece en herramientas que no son una sesión de clase", () => {
    sembrar("avendia.draft.workflow.planificamos/plan-curricular-anual.v2.anonymous", 0, "Plan de prueba");
    render(
      <MemoryRouter initialEntries={["/dashboard/planificamos/plan-curricular-anual"]}>
        <WorkflowTool />
      </MemoryRouter>,
    );

    expect(screen.queryByText("Continúa tu clase")).not.toBeInTheDocument();
  });
});

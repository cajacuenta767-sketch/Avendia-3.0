import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { WorkflowTool } from "./WorkflowTool";

const mocks = vi.hoisted(() => ({ apiRequest: vi.fn() }));

vi.mock("../../lib/api", () => ({
  apiRequest: (...args: unknown[]) => mocks.apiRequest(...args),
}));

vi.mock("./templateApi", () => ({
  listInstitutionalTemplates: vi.fn().mockResolvedValue([]),
  renderInstitutionalTemplate: vi.fn(),
}));

const RUTA = "/dashboard/planificamos/plan-curricular-anual";

function claveDeBorrador() {
  return Object.keys(localStorage).find((key) => key.includes("draft.workflow")) ?? "";
}

function sembrarBorrador() {
  // sessionDraftScope() usa el id del usuario en sesión; sin usuario devuelve "anonymous".
  const key = "avendia.draft.workflow.planificamos/plan-curricular-anual.v2.anonymous";
  localStorage.setItem(key, JSON.stringify({
    version: 2,
    currentStep: 0,
    updatedAt: new Date().toISOString(),
    values: { institution: "I.E. del borrador" },
    artifact: {
      document_title: "Documento del borrador",
      executive_summary: "Resumen guardado antes.",
      sections: [{ title: "Sección", narrative: "Texto", key_points: [] }],
      teacher_recommendations: [],
      tables: [],
      model: "prueba",
    },
  }));
  return key;
}

function abrir() {
  return render(
    <MemoryRouter initialEntries={[RUTA]}>
      <WorkflowTool />
    </MemoryRouter>,
  );
}

describe("WorkflowTool: empezar desde cero o continuar el borrador", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem("avendia.accessToken", "token-de-prueba");
    mocks.apiRequest.mockReset();
    mocks.apiRequest.mockResolvedValue([]);
  });

  afterEach(cleanup);

  it("ofrece las dos opciones cuando hay un borrador guardado", () => {
    sembrarBorrador();
    abrir();

    expect(screen.getByText(/Tienes un borrador guardado/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continuar borrador/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Empezar desde cero/ })).toBeInTheDocument();
    expect(screen.getAllByText("Documento del borrador").length).toBeGreaterThan(0);
  });

  it("no muestra el aviso cuando no hay nada guardado", () => {
    abrir();

    expect(screen.queryByText(/Tienes un borrador guardado/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Empezar desde cero/ })).toBeInTheDocument();
  });

  it("continuar borrador conserva el documento y oculta el aviso", () => {
    sembrarBorrador();
    abrir();

    fireEvent.click(screen.getByRole("button", { name: /Continuar borrador/ }));

    expect(screen.queryByText(/Tienes un borrador guardado/)).not.toBeInTheDocument();
    expect(screen.getAllByText("Documento del borrador").length).toBeGreaterThan(0);
  });

  it("empezar desde cero descarta el documento y borra lo guardado", async () => {
    sembrarBorrador();
    abrir();

    fireEvent.click(screen.getByRole("button", { name: /Empezar desde cero/ }));

    expect(screen.queryAllByText("Documento del borrador")).toHaveLength(0);
    expect(screen.getByText(/Empezaste un documento nuevo/)).toBeInTheDocument();
    await waitFor(() => {
      const guardado = JSON.parse(localStorage.getItem(claveDeBorrador()) ?? "null");
      expect(guardado?.artifact ?? null).toBeNull();
      expect(guardado?.values?.institution ?? "").not.toBe("I.E. del borrador");
    });
  });
});

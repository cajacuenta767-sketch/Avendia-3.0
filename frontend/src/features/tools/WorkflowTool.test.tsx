import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { WorkflowTool } from "./WorkflowTool";

describe("WorkflowTool validation", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("lists missing fields and focuses the first invalid control", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/planificamos/plan-curricular-anual"]}>
        <WorkflowTool />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /siguiente/i }));

    const alert = await screen.findByRole("alert");
    expect(within(alert).getByText(/faltan completar/i)).toBeInTheDocument();
    expect(within(alert).getByRole("button", { name: /DRE/i })).toBeInTheDocument();

    const firstInvalid = screen.getByPlaceholderText(/Dirección Regional de Educación/i);
    await waitFor(() => expect(firstInvalid).toHaveFocus());
    expect(firstInvalid).toHaveAttribute("aria-invalid", "true");
    expect(firstInvalid.getAttribute("aria-describedby")).toContain("workflow-error-dre");
  });

  it("offers contextual AI help for the qualitative fields of an exam", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/evaluamos/examen"]}>
        <WorkflowTool />
      </MemoryRouter>,
    );

    expect(screen.getAllByText(/Sugerir con IA/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Temas específicos a evaluar")).toBeInTheDocument();
  });

  it("shows the generation contract, quality checks and the next connected tool", () => {
    localStorage.setItem("avendia.draft.workflow.planificamos/tarea-extension-hogar.v2.anonymous", JSON.stringify({
      version: 2,
      values: { modality: "EBR — Educación Básica Regular", level: "Primaria", grade: "4°" },
      currentStep: 4,
      updatedAt: "2026-09-04T10:00:00Z",
      artifact: {
        document_title: "Investigamos el consumo responsable en casa",
        executive_summary: "Tarea breve y realizable en el hogar con una evidencia concreta.",
        sections: [{ title: "Propósito", narrative: "Reconocer acciones de consumo responsable.", key_points: ["Registrar tres ejemplos del hogar."] }],
        teacher_recommendations: ["Revisar la evidencia sin calificar el apoyo familiar.", "Permitir una alternativa oral."],
        activity: {
          mode: "ficha_hogar",
          title: "Mi hogar responsable",
          instructions: "Completa cada actividad con tus propias palabras.",
          items: [
            { id: "item-1", prompt: "Observa tres productos del hogar y anota sus envases.", answer: "Registro de tres productos observados.", hint: "Puedes dibujar.", options: ["Cuaderno"] },
            { id: "item-2", prompt: "Compara los envases y explica cuál genera menos residuos.", answer: "Comparación explicada con una razón.", hint: "Mira el material y el tamaño.", options: ["Lápiz"] },
            { id: "item-3", prompt: "Propón una acción familiar para reducir un residuo observado.", answer: "Compromiso posible escrito por el estudiante.", hint: "Elige una acción pequeña.", options: ["Hoja"] },
          ],
          word_bank: [],
        },
        tables: [{
          title: "Ruta de trabajo en casa",
          columns: ["Paso", "Consigna", "Evidencia"],
          rows: [["1", "Observa tres productos del hogar.", "Registro con dibujo o texto."]],
          note: "La familia acompaña sin resolver la actividad.",
        }],
        model: "gemini-test",
        contract_version: "2026.09",
        generation_brief: "Crear Ficha de Tarea de Extensión y Hogar para estudiante y familia.",
        quality_checks: [{ code: "structure", label: "Estructura completa", passed: true, detail: "Se recibió la estructura esperada." }],
        quality_status: "ready",
        warnings: [],
        suggested_next_tools: ["lista-cotejo"],
        repair_attempted: true,
        repair_succeeded: true,
        repair_notes: ["La primera propuesta no tenía actividades suficientes."],
      },
    }));

    render(
      <MemoryRouter initialEntries={["/dashboard/planificamos/tarea-extension-hogar"]}>
        <WorkflowTool />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Control de calidad de la generación" })).toBeInTheDocument();
    expect(screen.getByText("Corrección automática aplicada")).toBeInTheDocument();
    expect(screen.getByText("1/1")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /ahora resuelve/i })).toBeInTheDocument();
    expect(screen.getAllByText(/mi respuesta o evidencia/i)).toHaveLength(3);
    expect(screen.getByRole("link", { name: /Lista de cotejo/i })).toHaveAttribute("href", "/dashboard/evaluamos/lista-cotejo");
    fireEvent.click(screen.getByRole("button", { name: "Editar resultado" }));
    expect(screen.getByRole("button", { name: /Regenerar solo esta sección/i })).toBeInTheDocument();
  });
});

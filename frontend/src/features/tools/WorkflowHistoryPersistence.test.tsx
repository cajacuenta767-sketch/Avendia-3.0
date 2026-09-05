import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";

import { WorkflowTool } from "./WorkflowTool";

const mocks = vi.hoisted(() => ({ apiRequest: vi.fn() }));

vi.mock("../../lib/api", () => ({
  apiRequest: (...args: unknown[]) => mocks.apiRequest(...args),
}));

vi.mock("./templateApi", () => ({
  listInstitutionalTemplates: vi.fn().mockResolvedValue([]),
  renderInstitutionalTemplate: vi.fn(),
}));

describe("WorkflowTool server history", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem("avendia.accessToken", "token-de-prueba");
    mocks.apiRequest.mockReset();
    mocks.apiRequest.mockResolvedValue({
      id: "document-1",
      metadata_json: {
        version: 7,
        current_step: 2,
        fields: {
          modality: "EBR — Educación Básica Regular",
          level: "Secundaria",
          grade: "3° de Secundaria",
          curricular_area: "Comunicación",
          question_count: "5",
          total_score: "20",
        },
        artifact: {
          document_title: "Examen recuperado desde el servidor",
          executive_summary: "Versión persistida que no depende de datos guardados en este navegador.",
          sections: [
            { title: "Instrucciones", narrative: "Lee y responde.", key_points: ["Revisa antes de entregar."] },
            { title: "Preguntas", narrative: "Resuelve.", key_points: ["¿Qué aprendiste?"] },
          ],
          teacher_recommendations: ["Revisar la evidencia.", "Retroalimentar el razonamiento."],
          tables: [],
          activity: null,
          model: "gemini-test",
          quality_status: "ready",
        },
      },
    });
  });

  afterEach(cleanup);

  it("reabre campos y artefacto desde backend aunque localStorage esté vacío", async () => {
    render(
      <MemoryRouter initialEntries={["/dashboard/evaluamos/examen?document=document-1"]}>
        <WorkflowTool />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Documento recuperado desde tu historial.")).toBeInTheDocument();
    expect(screen.getAllByText("Examen recuperado desde el servidor").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Datos & competencias/i }));
    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
    expect(screen.getByDisplayValue("20")).toBeInTheDocument();
    await waitFor(() => expect(mocks.apiRequest).toHaveBeenCalledWith(
      "/documents/document-1",
      expect.objectContaining({ headers: { Authorization: "Bearer token-de-prueba" } }),
    ));
  });

  it("reabre una tarea para hogar completa desde backend sin usar localStorage", async () => {
    mocks.apiRequest.mockResolvedValueOnce({
      id: "homework-document-1",
      metadata_json: {
        version: 4,
        current_step: 4,
        fields: {
          modality: "EBA — Educación Básica Alternativa",
          level: "Avanzado",
          grade: "2° ciclo avanzado",
          task_title: "Cuidamos el agua en nuestra comunidad",
          learning_purpose: "Registrar y explicar una acción de cuidado del agua.",
        },
        artifact: {
          document_title: "Tarea comunitaria sobre el cuidado del agua",
          executive_summary: "Ficha recuperada desde la revisión persistida del servidor.",
          sections: [
            { title: "Propósito", narrative: "Reconocer usos responsables.", key_points: ["Observa y registra."] },
            { title: "Consigna paso a paso", narrative: "Realiza las acciones.", key_points: ["Completa la ficha."] },
            { title: "Materiales", narrative: "Usa recursos disponibles.", key_points: ["Cuaderno y lápiz."] },
            { title: "Participación de la familia", narrative: "El apoyo es opcional.", key_points: ["Conversar sin resolver."] },
            { title: "Ajustes DUA", narrative: "Admite explicación oral.", key_points: ["Elegir cómo responder."] },
            { title: "Evidencia", narrative: "Registro propio.", key_points: ["Presenta una evidencia."] },
            { title: "Criterios", narrative: "Explica con claridad.", key_points: ["Describe y propone."] },
            { title: "Autoevaluación", narrative: "Revisa el trabajo.", key_points: ["Marca tus avances."] },
          ],
          teacher_recommendations: ["Aceptar evidencia oral.", "Retroalimentar la propuesta."],
          tables: [],
          activity: {
            mode: "ficha_hogar",
            title: "Mi registro del agua",
            instructions: "Realiza cada acción y presenta tu propia evidencia.",
            items: [
              { id: "item-1", prompt: "Observa un uso cotidiano del agua.", answer: "Registro de observación.", hint: "Elige un lugar seguro.", options: [], response_type: "tabla" },
              { id: "item-2", prompt: "Compara dos formas de usar el agua.", answer: "Comparación explicada.", hint: "Anota diferencias.", options: [], response_type: "texto_breve" },
              { id: "item-3", prompt: "Propón una mejora para tu comunidad.", answer: "Propuesta concreta.", hint: "Debe ser posible.", options: [], response_type: "desarrollo" },
            ],
            word_bank: [],
          },
          model: "gemini-test",
          quality_status: "ready",
        },
      },
    });

    render(
      <MemoryRouter initialEntries={[
        "/dashboard/planificamos/tarea-extension-hogar?document=homework-document-1",
      ]}>
        <WorkflowTool />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Documento recuperado desde tu historial.")).toBeInTheDocument();
    expect(screen.getByText("Tarea comunitaria sobre el cuidado del agua")).toBeInTheDocument();
    expect(screen.getByText("Observa un uso cotidiano del agua.")).toBeInTheDocument();
    await waitFor(() => expect(mocks.apiRequest).toHaveBeenCalledWith(
      "/documents/homework-document-1",
      expect.objectContaining({ headers: { Authorization: "Bearer token-de-prueba" } }),
    ));
  });
});

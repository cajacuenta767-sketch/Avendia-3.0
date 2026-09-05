import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SourceDocumentTool } from "./SourceDocumentTool";

const createInstrument = vi.fn();
const getDraft = vi.fn();
const saveDraft = vi.fn();
const generate = vi.fn();
const exportWord = vi.fn();

vi.mock("./evaluationApi", () => ({
  createEvaluationInstrument: (...args: unknown[]) => createInstrument(...args),
  getEvaluationDraft: (...args: unknown[]) => getDraft(...args),
  saveEvaluationDraft: (...args: unknown[]) => saveDraft(...args),
  uploadEvaluationSource: vi.fn(),
  deleteEvaluationSource: vi.fn(),
}));

vi.mock("../../../lib/api", () => ({
  apiRequest: (...args: unknown[]) => generate(...args),
}));

vi.mock("./exportSourceDocumentDocx", () => ({
  exportSourceDocumentDocx: (...args: unknown[]) => exportWord(...args),
}));

describe("SourceDocumentTool", () => {
  afterEach(cleanup);

  beforeEach(() => {
    createInstrument.mockReset();
    getDraft.mockReset();
    saveDraft.mockReset();
    generate.mockReset();
    exportWord.mockReset();
    createInstrument.mockResolvedValue({ id: "instrument-1", revision: 1 });
    exportWord.mockResolvedValue(undefined);
    generate.mockResolvedValue({
      document_title: "Preguntas listas",
      executive_summary: "Lee y responde.",
      sections: [
        { title: "Lectura o síntesis", narrative: "El agua se evapora y luego se condensa.", key_points: [] },
        { title: "Preguntas literales", narrative: "Responde con evidencia.", key_points: ["¿Qué se evapora?", "¿Qué ocurre después?", "¿Qué proceso se menciona?"] },
        { title: "Preguntas inferenciales", narrative: "Relaciona las ideas.", key_points: ["¿Por qué cambia el agua?", "¿Qué ocurriría sin condensación?"] },
        { title: "Preguntas crítico-reflexivas", narrative: "Explica tu posición.", key_points: ["¿Cómo cuidarías el agua?"] },
        { title: "Respuestas esperadas", narrative: "Guía docente.", key_points: ["Agua", "Condensación", "Evaporación", "Por el calor", "No regresaría", "Respuesta argumentada"] },
        { title: "Justificación de respuestas", narrative: "Contrasta con el texto.", key_points: ["Evidencia del texto"] },
        { title: "Criterios", narrative: "Comprensión y argumentación.", key_points: ["Usa evidencia"] },
        { title: "Retroalimentación", narrative: "Orienta el siguiente paso.", key_points: ["Releer y justificar"] },
      ],
      teacher_recommendations: [],
      activity: null,
      model: "gemini",
      quality_status: "ready",
    });
  });

  it("reabre desde Historial la fuente, su edición y el resultado persistido", async () => {
    getDraft.mockResolvedValue({
      id: "instrument-history",
      revision: 7,
      kind: "text_questions",
      status: "generated",
      title: "Preguntas sobre el agua",
      general_data: {
        frame: {
          teacher_name: "María Docente",
          institution_name: "I.E. Historial",
          modality: "EBR",
          education_level: "Primaria",
          grade_or_cycle: "4.º",
          section: "A",
          curricular_area: "Comunicación",
        },
        title: "El ciclo del agua",
        text_type: "Expositivo",
        source: {
          pasted_text: "Introducción conservada.",
          reading_text_size: "large",
          question_text_size: "small",
          sources: [{ source_id: "source-1", edited_text: "Texto editado persistido." }],
        },
      },
      settings: {
        literal_count: 5,
        inferential_count: 3,
        critical_count: 2,
        cneb_capacities: "Infiere e interpreta información.",
        question_format: "Mixtas",
        dua_adjustments: "Segmentar las consignas.",
        criteria: "Sustenta con evidencia.",
        feedback_guidance: "Pedir que ubique el párrafo.",
        generated_artifact: {
          document_title: "Preguntas listas desde Historial",
          executive_summary: "Versión revisada y guardada.",
          sections: [{ title: "Preguntas literales", narrative: "Responde con el texto.", key_points: ["¿Qué ocurre con el agua?"] }],
          tables: [],
          teacher_recommendations: [],
          quality_status: "ready",
          quality_checks: [],
        },
      },
      sources: [{
        id: "source-1",
        filename: "lectura-agua.pdf",
        media_type: "application/pdf",
        extension: ".pdf",
        byte_size: 2048,
        sha256: "abc123",
        extracted_text: "Texto extraído original.",
        extraction_status: "completed",
        created_at: "2026-08-31T10:00:00Z",
        instrument_revision: 7,
      }],
    });

    render(<SourceDocumentTool kind="text_questions" instrumentId="instrument-history" />);

    expect(await screen.findByDisplayValue("Preguntas listas desde Historial")).toBeInTheDocument();
    expect(screen.getByText((_, element) => element?.textContent === "Introducción conservada.\n\nTexto editado persistido.")).toBeInTheDocument();
    expect(screen.getByText(/5 literales · 3 inferenciales · 2 crítico-reflexivas/)).toBeInTheDocument();
    expect(getDraft).toHaveBeenCalledWith("instrument-history", expect.any(AbortSignal));

    fireEvent.click(screen.getByRole("button", { name: /Encuadre y texto/ }));
    expect(screen.getByDisplayValue("El ciclo del agua")).toBeInTheDocument();
    expect(screen.getByText("lectura-agua.pdf")).toBeInTheDocument();
    expect(screen.getByLabelText("Vista previa editable de lectura-agua.pdf")).toHaveValue("Texto editado persistido.");
    expect(screen.getByLabelText("Lectura")).toHaveValue("large");
    expect(screen.getByLabelText("Preguntas")).toHaveValue("small");
  });

  it("genera preguntas y respuestas usando solo campos pedagógicos, deja editar y persiste", async () => {
    render(<SourceDocumentTool kind="text_questions" />);
    fireEvent.change(screen.getByLabelText("Nombre del docente"), { target: { value: "María Docente" } });
    fireEvent.change(screen.getByLabelText("Institución educativa"), { target: { value: "I.E. Prueba" } });
    fireEvent.change(screen.getByLabelText("Título de la lectura o tema"), { target: { value: "El ciclo del agua" } });
    fireEvent.change(screen.getByLabelText("Escribir o pegar texto"), { target: { value: "El agua se evapora y luego se condensa." } });
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));

    fireEvent.change(screen.getByLabelText("Capacidades CNEB a movilizar"), { target: { value: "Infiere e interpreta" } });
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    fireEvent.click(screen.getByRole("button", { name: "Generar con IA" }));

    await screen.findByDisplayValue("Preguntas listas");
    const request = JSON.parse(generate.mock.calls[0][1].body as string) as { fields: Record<string, string>; requested_sections: string[] };
    expect(request.fields.source_text).toContain("evapora");
    expect(request.fields).not.toHaveProperty("teacher_name");
    expect(request.fields).not.toHaveProperty("institution_name");
    expect(request.requested_sections).toContain("Respuestas esperadas");
    expect(request.requested_sections).toContain("Justificación de respuestas");

    fireEvent.change(screen.getAllByLabelText("Desarrollo")[0], { target: { value: "Desarrollo revisado por la docente." } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar instrumento" }));
    await waitFor(() => expect(createInstrument).toHaveBeenCalled());
    const payload = createInstrument.mock.calls[0][0] as { status: string; settings: { generated_artifact: { sections: Array<{ narrative: string }> } } };
    expect(payload.status).toBe("generated");
    expect(payload.settings.generated_artifact.sections[0].narrative).toBe("Desarrollo revisado por la docente.");
  });

  it("guarda la revisión exacta antes de descargar Word", async () => {
    render(<SourceDocumentTool kind="text_questions" />);
    fireEvent.change(screen.getByLabelText("Nombre del docente"), { target: { value: "María Docente" } });
    fireEvent.change(screen.getByLabelText("Institución educativa"), { target: { value: "I.E. Prueba" } });
    fireEvent.change(screen.getByLabelText("Título de la lectura o tema"), { target: { value: "El ciclo del agua" } });
    fireEvent.change(screen.getByLabelText("Escribir o pegar texto"), { target: { value: "El agua se evapora y luego se condensa." } });
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    fireEvent.change(screen.getByLabelText("Capacidades CNEB a movilizar"), { target: { value: "Infiere e interpreta" } });
    for (let step = 0; step < 3; step += 1) fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    fireEvent.click(screen.getByRole("button", { name: "Generar con IA" }));
    await screen.findByDisplayValue("Preguntas listas");

    fireEvent.click(screen.getByRole("button", { name: "Descargar Word" }));
    await waitFor(() => expect(exportWord).toHaveBeenCalledTimes(1));
    expect(createInstrument).toHaveBeenCalledTimes(1);
    expect(createInstrument.mock.calls[0][0].status).toBe("generated");
    expect(createInstrument.mock.invocationCallOrder[0]).toBeLessThan(exportWord.mock.invocationCallOrder[0]);
  });
});

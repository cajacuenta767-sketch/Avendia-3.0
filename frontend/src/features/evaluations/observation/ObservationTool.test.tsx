import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ObservationTool } from "./ObservationTool";

const createInstrument = vi.fn();
const getDraft = vi.fn();

vi.mock("../source-documents/evaluationApi", () => ({
  createEvaluationInstrument: (...args: unknown[]) => createInstrument(...args),
  getEvaluationDraft: (...args: unknown[]) => getDraft(...args),
  saveEvaluationDraft: vi.fn(),
  listEvaluationInstruments: vi.fn().mockResolvedValue([]),
}));

vi.mock("../source-documents/useSelectedStudentNames", () => ({
  useSelectedStudentNames: () => ({
    students: [{ id: "student-1", full_name: "Ana Torres" }, { id: "student-2", full_name: "Luis Rojas" }],
    allStudents: [], loading: false, error: "",
  }),
}));

vi.mock("../../../components/students/StudentSelector", () => ({
  StudentSelector: ({ mode, onChange }: { mode: string; onChange: (value: unknown) => void }) => <div><span>Modo: {mode}</span><button type="button" onClick={() => onChange({ mode, rosterId: "roster-1", studentIds: mode === "single" ? ["student-1"] : ["student-1", "student-2"], groupName: mode === "group" ? "Equipo Azul" : undefined })}>Seleccionar estudiantes de prueba</button></div>,
}));

describe("ObservationTool", () => {
  beforeEach(() => {
    createInstrument.mockReset();
    getDraft.mockReset();
    createInstrument.mockResolvedValue({ id: "observation-1", revision: 1 });
  });

  it("reopens a generated observation with students, facts and follow-up", async () => {
    getDraft.mockResolvedValue({
      id: "observation-history",
      revision: 3,
      kind: "observation",
      status: "generated",
      general_data: {
        frame: { teacher_name: "María", institution_name: "I.E. Prueba", modality: "EBR", education_level: "Primaria", grade_or_cycle: "4.º", section: "A", curricular_area: "Comunicación" },
        mode: "multiple",
        selection: { mode: "multiple", rosterId: "roster-1", studentIds: ["student-1", "student-2"] },
        observed_date: "2026-08-31", observed_time: "09:30", situation: "Debate en equipos", focus: "Sustenta sus ideas",
        scale_type: "Descriptiva",
        criteria: [{ client_key: "criterion-1", title: "Presenta evidencia verificable" }],
        common_notes: "Ambos estudiantes contrastaron sus fuentes.",
        individual_notes: { "student-1": "Citó dos evidencias.", "student-2": "Reformuló su argumento." },
        context_factors: "Usaron una ficha de apoyo.", interpretation: "La pauta favoreció el contraste.",
        conclusion: "Avanzan en argumentación.", commitments: "Retirar una pregunta guía en la siguiente sesión.",
      },
      participants: [{ student_id: "student-1", role: "student", sort_order: 0 }, { student_id: "student-2", role: "student", sort_order: 1 }],
    });

    render(<ObservationTool instrumentId="observation-history" />);

    expect(await screen.findByRole("heading", { name: "Vista e historial" })).toBeInTheDocument();
    expect(screen.getByText(/Ambos estudiantes contrastaron sus fuentes/)).toBeInTheDocument();
    expect(screen.getByText(/Retirar una pregunta guía en la siguiente sesión/)).toBeInTheDocument();
    expect(getDraft).toHaveBeenCalledWith("observation-history", expect.any(AbortSignal));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("vincula equipo, notas comunes e individuales a IDs estables", async () => {
    render(<ObservationTool />);
    fireEvent.change(screen.getByLabelText("Modo de observación"), { target: { value: "team" } });
    expect(screen.getByText("Modo: group")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Seleccionar estudiantes de prueba" }));
    fireEvent.change(screen.getByLabelText("Situación observada"), { target: { value: "Reto cooperativo" } });
    fireEvent.change(screen.getByLabelText("Foco de observación"), { target: { value: "Explica y acuerda" } });
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    fireEvent.change(screen.getByPlaceholderText(/Sustenta su propuesta/), { target: { value: "Explica su estrategia con evidencias" } });
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    fireEvent.change(screen.getByLabelText("Hechos objetivos comunes"), { target: { value: "Compararon dos estrategias." } });
    fireEvent.change(screen.getByLabelText("Ana Torres"), { target: { value: "Explicó el primer procedimiento." } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar borrador" }));

    await waitFor(() => expect(createInstrument).toHaveBeenCalled());
    const payload = createInstrument.mock.calls[0][0] as { participants: Array<Record<string, unknown>>; observations: Array<Record<string, unknown>> };
    expect(payload.participants).toEqual(expect.arrayContaining([expect.objectContaining({ student_id: "student-1", role: "team_member", team_name: "Equipo Azul" })]));
    expect(payload.observations).toEqual(expect.arrayContaining([expect.objectContaining({ student_id: null, common_to_group: true }), expect.objectContaining({ student_id: "student-1", common_to_group: false })]));
  });

  it("solo marca la ficha como generada cuando incluye análisis y seguimiento", async () => {
    render(<ObservationTool />);
    fireEvent.click(screen.getByRole("button", { name: "Seleccionar estudiantes de prueba" }));
    fireEvent.change(screen.getByLabelText("Situación observada"), { target: { value: "Resolución de un reto" } });
    fireEvent.change(screen.getByLabelText("Foco de observación"), { target: { value: "Justifica su estrategia con evidencias" } });
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    fireEvent.change(screen.getByPlaceholderText(/Sustenta su propuesta/), { target: { value: "Explica cada decisión con un dato observable" } });
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    fireEvent.change(screen.getByLabelText("Ana Torres"), { target: { value: "Explicó dos pasos y verificó el resultado final." } });
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));

    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("interpretación pedagógica");

    fireEvent.change(screen.getByLabelText("Interpretación pedagógica"), { target: { value: "Organiza el procedimiento, pero necesita justificar la elección de datos." } });
    fireEvent.change(screen.getByLabelText("Conclusión"), { target: { value: "Avanza en la explicación y requiere fortalecer la argumentación." } });
    fireEvent.change(screen.getByLabelText("Compromisos y siguientes acciones"), { target: { value: "Usará una pregunta guía y revisará otra evidencia en la próxima sesión." } });
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    expect(await screen.findByRole("heading", { name: "Vista e historial" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Guardar instrumento" }));

    await waitFor(() => expect(createInstrument).toHaveBeenCalledOnce());
    expect(createInstrument.mock.calls[0][0]).toEqual(expect.objectContaining({ status: "generated" }));
  });
});

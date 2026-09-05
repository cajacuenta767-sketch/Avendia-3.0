import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RecoveryFolderTool } from "./RecoveryFolderTool";

const createInstrument = vi.fn();
vi.mock("../source-documents/evaluationApi", () => ({ createEvaluationInstrument: (...args: unknown[]) => createInstrument(...args), getEvaluationDraft: vi.fn(), saveEvaluationDraft: vi.fn() }));
vi.mock("../source-documents/useSelectedStudentNames", () => ({ useSelectedStudentNames: () => ({ students: [{ id: "student-1", full_name: "Ana Torres" }, { id: "student-2", full_name: "Luis Rojas" }], allStudents: [], loading: false, error: "" }) }));
vi.mock("../../../components/students/StudentSelector", () => ({ StudentSelector: ({ mode, onChange }: { mode: string; onChange: (value: unknown) => void }) => <button type="button" onClick={() => onChange({ mode, rosterId: "roster-1", studentIds: ["student-1", "student-2"] })}>Seleccionar recuperación</button> }));

describe("RecoveryFolderTool", () => {
  beforeEach(() => { createInstrument.mockReset(); createInstrument.mockResolvedValue({ id: "recovery-1", revision: 1 }); });
  it("guarda una ruta de recuperación para varios estudiantes con seguimiento individual", async () => {
    render(<RecoveryFolderTool />);
    fireEvent.click(screen.getByRole("button", { name: "Seleccionar recuperación" }));
    fireEvent.change(screen.getByLabelText("Diagnóstico de necesidades"), { target: { value: "Necesitan justificar inferencias." } });
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    fireEvent.change(screen.getByLabelText("Competencias priorizadas"), { target: { value: "Lee textos" } });
    fireEvent.change(screen.getByLabelText("Criterios de evaluación"), { target: { value: "Justifica con pistas" } });
    fireEvent.change(screen.getByLabelText("Evidencias esperadas"), { target: { value: "Organizador y explicación" } });
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    fireEvent.change(screen.getByLabelText("Ruta de actividades"), { target: { value: "Modelado, práctica y aplicación" } });
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    fireEvent.change(screen.getByLabelText("Cronograma"), { target: { value: "Tres semanas" } });
    fireEvent.change(screen.getByLabelText("Ana Torres"), { target: { value: "Retirar una pregunta guía cada semana." } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar borrador" }));
    await waitFor(() => expect(createInstrument).toHaveBeenCalled());
    const payload = createInstrument.mock.calls[0][0] as { roster_id: string; participants: Array<Record<string, unknown>> };
    expect(payload.roster_id).toBe("roster-1");
    expect(payload.participants).toHaveLength(2);
    expect(payload.participants[0]).toEqual(expect.objectContaining({ student_id: "student-1", individual_notes: "Retirar una pregunta guía cada semana." }));
  });
});

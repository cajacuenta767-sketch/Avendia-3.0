import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AuxiliaryRegisterTool } from "./AuxiliaryRegisterTool";

const createInstrument = vi.fn();
vi.mock("../source-documents/evaluationApi", () => ({ createEvaluationInstrument: (...args: unknown[]) => createInstrument(...args), getEvaluationDraft: vi.fn(), saveEvaluationDraft: vi.fn() }));
vi.mock("../source-documents/useSelectedStudentNames", () => ({ useSelectedStudentNames: () => ({ students: [{ id: "student-1", full_name: "Ana Torres" }, { id: "student-2", full_name: "Luis Rojas" }], allStudents: [], loading: false, error: "" }) }));
vi.mock("../../../components/students/StudentSelector", () => ({ StudentSelector: ({ mode, onChange }: { mode: string; onChange: (value: unknown) => void }) => <button type="button" onClick={() => onChange({ mode, rosterId: "roster-1", studentIds: ["student-1", "student-2"] })}>Cargar aula completa</button> }));

describe("AuxiliaryRegisterTool", () => {
  beforeEach(() => { createInstrument.mockReset(); createInstrument.mockResolvedValue({ id: "register-1", revision: 1 }); });
  it("construye asistencia por filas desde la nómina, sin lista manual", async () => {
    render(<AuxiliaryRegisterTool />);
    fireEvent.change(screen.getByLabelText("Competencias CNEB"), { target: { value: "Lee textos" } });
    fireEvent.click(screen.getByRole("button", { name: "Cargar aula completa" }));
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    fireEvent.change(screen.getByLabelText("Criterios, uno por línea"), { target: { value: "Ubica información\nJustifica inferencias" } });
    fireEvent.change(screen.getByLabelText("Evidencias de aprendizaje"), { target: { value: "Ficha resuelta" } });
    fireEvent.click(screen.getByRole("button", { name: /Continuar/ }));
    fireEvent.change(screen.getByLabelText("Asistencia de Ana Torres"), { target: { value: "A" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar borrador" }));
    await waitFor(() => expect(createInstrument).toHaveBeenCalled());
    const payload = createInstrument.mock.calls[0][0] as { participants: unknown[]; criteria: unknown[]; records?: unknown[]; general_data: { attendance: Record<string, string> } };
    expect(payload.participants).toHaveLength(2);
    expect(payload.criteria).toHaveLength(2);
    expect(payload.records).toBeUndefined();
    expect(payload.general_data.attendance["student-1"]).toBe("A");
    expect(screen.queryByLabelText(/lista de estudiantes/i)).not.toBeInTheDocument();
  });
});

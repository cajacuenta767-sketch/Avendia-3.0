import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { StudentSelection } from "../../../components/students/StudentSelector";
import { ApiError } from "../../../lib/api";
import type { Student } from "../../rosters/rosterTypes";
import { ChecklistTool } from "./ChecklistTool";

const students: Student[] = [
  { id: "student-1", roster_id: "roster-1", full_name: "Ana Quispe Ramos", internal_code: "EST-01", sort_order: 0, active: true },
  { id: "student-2", roster_id: "roster-1", full_name: "Bruno Flores Soto", internal_code: "EST-02", sort_order: 1, active: true },
];

const saveMock = vi.fn();
const downloadMock = vi.fn();
const suggestMock = vi.fn();
const listStudentsMock = vi.fn();
const getChecklistMock = vi.fn();

vi.mock("../../../components/students/StudentSelector", () => ({
  StudentSelector: ({ onChange, label }: { onChange: (selection: StudentSelection) => void; label: string }) => (
    <section aria-label={label}>
      <button type="button" onClick={() => onChange({ mode: "multiple", rosterId: "roster-1", studentIds: ["student-1", "student-2"] })}>Seleccionar aula de prueba</button>
    </section>
  ),
}));

vi.mock("../../rosters/rosterApi", () => ({ listStudents: (...args: unknown[]) => listStudentsMock(...args) }));
vi.mock("./checklistApi", () => ({
  getChecklistInstrument: (...args: unknown[]) => getChecklistMock(...args),
  saveChecklistInstrument: (...args: unknown[]) => saveMock(...args),
  downloadChecklistWorkbook: (...args: unknown[]) => downloadMock(...args),
  suggestChecklistCriteria: (...args: unknown[]) => suggestMock(...args),
}));

function prepareProfile() {
  sessionStorage.setItem("avendia.user", JSON.stringify({
    id: "teacher-1",
    full_name: "María Gómez",
    school_name: "I.E. República del Perú",
    director_name: "Carlos Rojas",
    education_modality: "EBR",
    education_level: "Primaria",
    grade: "4° de Primaria",
    curricular_area: "Matemática",
  }));
}

async function completeFirstStep() {
  fireEvent.change(screen.getByPlaceholderText(/Explicación de una estrategia/i), { target: { value: "Resolución explicada de un problema" } });
  fireEvent.change(screen.getByLabelText("Periodo"), { target: { value: "I bimestre" } });
  fireEvent.click(screen.getByRole("button", { name: "Seleccionar aula de prueba" }));
  await waitFor(() => expect(listStudentsMock).toHaveBeenCalledWith("roster-1", expect.objectContaining({ signal: expect.any(AbortSignal) })));
  fireEvent.click(screen.getByRole("button", { name: /Siguiente/i }));
  expect(await screen.findByRole("heading", { name: "Criterios de evaluación", level: 3 })).toBeInTheDocument();
}

describe("ChecklistTool", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    prepareProfile();
    listStudentsMock.mockResolvedValue(students);
    getChecklistMock.mockReset();
    saveMock.mockResolvedValue({ id: "instrument-1", revision: 1, status: "draft" });
    downloadMock.mockResolvedValue(undefined);
    suggestMock.mockResolvedValue("- Reconoce los datos relevantes.\n- Explica por qué su estrategia es pertinente.");
  });

  it("reopens a generated checklist from backend with its exact matrix and roster", async () => {
    getChecklistMock.mockResolvedValue({
      id: "checklist-history",
      revision: 6,
      kind: "checklist",
      status: "generated",
      roster_id: "roster-1",
      general_data: {
        teacher_name: "María Gómez", director_name: "Carlos Rojas", institution_name: "I.E. República del Perú",
        modality: "EBR", education_level: "Primaria", grade: "4° de Primaria", curricular_area: "Matemática",
        activity: "Resolución restaurada", date: "2026-08-31", period: "II bimestre",
      },
      settings: { response_scale: "yes_no_progress" },
      general_observation: "Revisión guardada en el servidor.",
      participants: [{ student_id: "student-1", sort_order: 0, individual_notes: "Necesita justificar el último paso." }],
      criteria: [{ client_key: "criterion-1", code: "C1", title: "C1", description: "Explica la estrategia elegida.", sort_order: 0 }],
      records: [{ student_id: "student-1", criterion_key: "criterion-1", value: "in_progress", observation: "Necesita justificar el último paso." }],
    });

    render(<ChecklistTool instrumentId="checklist-history" />);

    expect(await screen.findByRole("heading", { name: "Resolución restaurada" })).toBeInTheDocument();
    const matrix = await screen.findByRole("region", { name: "Matriz de lista de cotejo" });
    expect(within(matrix).getByRole("cell", { name: "En proceso" })).toBeInTheDocument();
    expect(within(matrix).getByRole("cell", { name: "Necesita justificar el último paso." })).toBeInTheDocument();
    expect(screen.getByText("Revisión guardada en el servidor.")).toBeInTheDocument();
    expect(getChecklistMock).toHaveBeenCalledWith("checklist-history", expect.any(AbortSignal));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("builds a real student matrix, saves stable IDs and downloads its workbook", async () => {
    saveMock
      .mockResolvedValueOnce({ id: "instrument-1", revision: 1, status: "draft" })
      .mockResolvedValueOnce({ id: "instrument-1", revision: 2, status: "draft" });
    render(<ChecklistTool />);
    expect(screen.queryByRole("button", { name: /Sugerir criterios con IA/i })).not.toBeInTheDocument();
    await completeFirstStep();

    fireEvent.click(screen.getByRole("button", { name: /Siguiente/i }));
    expect(await screen.findByRole("region", { name: "Matriz de lista de cotejo" })).toBeInTheDocument();

    for (const student of students) {
      for (const code of ["C1", "C2", "C3"]) {
        const group = screen.getByRole("radiogroup", { name: `${student.full_name}, ${code}` });
        fireEvent.click(within(group).getByRole("radio", { name: "Sí" }));
      }
    }
    fireEvent.change(screen.getByLabelText("Observación de Ana Quispe Ramos"), { target: { value: "Explica con claridad." } });
    fireEvent.click(screen.getByRole("button", { name: /Siguiente/i }));

    expect(await screen.findByRole("heading", { name: "Resolución explicada de un problema" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Guardar borrador" }));
    await waitFor(() => expect(saveMock).toHaveBeenCalledOnce());
    const payload = saveMock.mock.calls[0][0];
    expect(payload.roster_id).toBe("roster-1");
    expect(payload.participants.map((item: { student_id: string }) => item.student_id)).toEqual(["student-1", "student-2"]);
    expect(payload.records).toHaveLength(6);
    expect(payload.records.every((record: { value: string }) => record.value === "yes")).toBe(true);
    expect(payload.general_data).toEqual(expect.objectContaining({
      teacher_name: "María Gómez",
      director_name: "Carlos Rojas",
      institution_name: "I.E. República del Perú",
      education_level: "Primaria",
      curricular_area: "Matemática",
    }));

    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
    fireEvent.change(screen.getByLabelText("Observación de Ana Quispe Ramos"), { target: { value: "Versión exacta antes de descargar." } });
    fireEvent.click(screen.getByRole("button", { name: /Siguiente/i }));
    fireEvent.click(screen.getByRole("button", { name: "Descargar XLSX" }));
    await waitFor(() => expect(saveMock).toHaveBeenCalledTimes(2));
    const exportedPayload = saveMock.mock.calls[1][0];
    expect(saveMock.mock.calls[1][1]).toEqual(expect.objectContaining({ id: "instrument-1", revision: 1 }));
    expect(exportedPayload.records.filter((record: { student_id: string }) => record.student_id === "student-1").every((record: { observation: string }) => record.observation === "Versión exacta antes de descargar.")).toBe(true);
    await waitFor(() => expect(downloadMock).toHaveBeenCalledWith("instrument-1"));
  });

  it("blocks the download and explains an optimistic concurrency conflict", async () => {
    saveMock.mockRejectedValueOnce(new ApiError("La versión cambió", 409));
    render(<ChecklistTool />);
    await completeFirstStep();
    fireEvent.click(screen.getByRole("button", { name: /Siguiente/i }));

    for (const student of students) {
      for (const code of ["C1", "C2", "C3"]) {
        fireEvent.click(within(screen.getByRole("radiogroup", { name: `${student.full_name}, ${code}` })).getByRole("radio", { name: "Sí" }));
      }
    }
    fireEvent.click(screen.getByRole("button", { name: /Siguiente/i }));
    fireEvent.click(screen.getByRole("button", { name: "Descargar XLSX" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("cambió en otra sesión");
    expect(screen.getByRole("alert")).toHaveTextContent("No se descargó una versión desactualizada");
    expect(downloadMock).not.toHaveBeenCalled();
  });

  it("announces missing data and focuses the corresponding input", async () => {
    render(<ChecklistTool />);
    fireEvent.change(screen.getByLabelText("Periodo"), { target: { value: "I bimestre" } });
    fireEvent.click(screen.getByRole("button", { name: "Seleccionar aula de prueba" }));
    fireEvent.click(screen.getByRole("button", { name: /Siguiente/i }));
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Actividad o evidencia");
    await waitFor(() => expect(screen.getByPlaceholderText(/Explicación de una estrategia/i)).toHaveFocus());
  });

  it("opens contextual AI only in criteria, lets the teacher review and incorporates the result", async () => {
    render(<ChecklistTool />);
    await completeFirstStep();
    const opener = screen.getByRole("button", { name: "Sugerir criterios con IA" });
    opener.focus();
    fireEvent.click(opener);
    const dialog = screen.getByRole("dialog", { name: "Propongamos criterios observables" });
    fireEvent.change(within(dialog).getByPlaceholderText(/Que seleccione datos/i), { target: { value: "Justificar la estrategia con datos" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Generar criterios" }));
    expect(await within(dialog).findByDisplayValue("Reconoce los datos relevantes.")).toBeInTheDocument();
    fireEvent.change(within(dialog).getByDisplayValue("Reconoce los datos relevantes."), { target: { value: "Identifica los datos relevantes y explica su uso." } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Incorporar criterios" }));
    expect(screen.getByDisplayValue("Identifica los datos relevantes y explica su uso.")).toBeInTheDocument();
    expect(suggestMock.mock.calls[0][0]).toEqual(expect.objectContaining({ modality: "EBR", area: "Matemática" }));
    await waitFor(() => expect(opener).toHaveFocus());
  });
});

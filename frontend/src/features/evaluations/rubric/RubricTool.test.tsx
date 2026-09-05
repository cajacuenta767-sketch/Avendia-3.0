import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { StudentSelection } from "../../../components/students/StudentSelector";
import { ApiError } from "../../../lib/api";
import type { Student } from "../../rosters/rosterTypes";
import { RubricTool } from "./RubricTool";

const students: Student[] = [
  { id: "student-1", roster_id: "roster-1", full_name: "Ana Quispe Ramos", sort_order: 0, active: true },
  { id: "student-2", roster_id: "roster-1", full_name: "Bruno Flores Soto", sort_order: 1, active: true },
];
const listStudentsMock = vi.fn();
const getRubricMock = vi.fn();
const saveMock = vi.fn();
const suggestMock = vi.fn();
const exportWordMock = vi.fn();

vi.mock("../../../components/students/StudentSelector", () => ({
  StudentSelector: ({ onChange, label }: { onChange: (selection: StudentSelection) => void; label: string }) => <section aria-label={label}><button type="button" onClick={() => onChange({ mode: "multiple", rosterId: "roster-1", studentIds: ["student-1", "student-2"] })}>Seleccionar estudiantes de prueba</button></section>,
}));
vi.mock("../../rosters/rosterApi", () => ({ listStudents: (...args: unknown[]) => listStudentsMock(...args) }));
vi.mock("./rubricApi", () => ({
  getRubricInstrument: (...args: unknown[]) => getRubricMock(...args),
  saveRubricInstrument: (...args: unknown[]) => saveMock(...args),
  suggestRubricFeedback: (...args: unknown[]) => suggestMock(...args),
}));
vi.mock("./exportRubricDocx", () => ({ exportRubricDocx: (...args: unknown[]) => exportWordMock(...args) }));

function profile() {
  sessionStorage.setItem("avendia.user", JSON.stringify({
    id: "teacher-1",
    full_name: "María Gómez",
    school_name: "I.E. República del Perú",
    education_modality: "EBR",
    education_level: "Primaria",
    grade: "4° de Primaria",
    curricular_area: "Matemática",
  }));
}

async function reachAssessment() {
  fireEvent.change(screen.getByLabelText("Competencia (CNEB)"), { target: { value: "Resuelve problemas de cantidad" } });
  fireEvent.change(screen.getByPlaceholderText(/Sustenta conclusiones/i), { target: { value: "Sustenta conclusiones con datos y explica el procedimiento." } });
  fireEvent.change(screen.getByPlaceholderText(/Informe y exposición/i), { target: { value: "Informe de resolución de problemas" } });
  fireEvent.click(screen.getByRole("button", { name: "Seleccionar estudiantes de prueba" }));
  await waitFor(() => expect(listStudentsMock).toHaveBeenCalled());
  fireEvent.click(screen.getByRole("button", { name: /Siguiente/i }));
  expect(await screen.findByRole("heading", { name: "Niveles de logro" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /Siguiente/i }));
  expect(await screen.findByRole("heading", { name: "Ana Quispe Ramos" })).toBeInTheDocument();
}

describe("RubricTool", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    profile();
    listStudentsMock.mockResolvedValue(students);
    getRubricMock.mockReset();
    saveMock.mockResolvedValue({ id: "rubric-1", revision: 1, status: "draft" });
    suggestMock.mockResolvedValue("En tu próxima respuesta, vincula cada conclusión con un dato y explica la relación en una oración completa.");
    exportWordMock.mockResolvedValue(undefined);
  });

  it("reopens a generated rubric from backend with its roster, ratings and feedback", async () => {
    getRubricMock.mockResolvedValue({
      id: "rubric-history",
      revision: 4,
      kind: "rubric",
      status: "generated",
      roster_id: "roster-1",
      general_data: {
        teacherName: "María Gómez", institution: "I.E. República del Perú", modality: "EBR",
        level: "Primaria", grade: "4° de Primaria", area: "Matemática",
        competence: "Resuelve problemas de cantidad", performance: "Explica usando evidencias.",
        evidenceTitle: "Producto restaurado", date: "2026-08-31",
      },
      settings: { rubric_type: "analytic", weighted: false },
      participants: [{ student_id: "student-1", sort_order: 0 }],
      criteria: [{
        client_key: "criterion-1", code: "C1", title: "Argumentación", description: "Sustenta una conclusión.", sort_order: 0,
        levels: [{ client_key: "level-a", code: "A", label: "Logro esperado", description: "Sustenta con evidencia pertinente.", score: 3, sort_order: 0 }],
      }],
      records: [{
        student_id: "student-1", criterion_key: "criterion-1", level_key: "level-a",
        evidence: "Explicó con dos datos.", strength: "Selecciona evidencia.",
        improvement: "Relacionar los datos.", recommendation: "Explica cómo cada dato sustenta tu conclusión.",
        teacher_decision: "Practicar con un caso nuevo.",
      }],
    });

    render(<RubricTool instrumentId="rubric-history" />);

    expect(await screen.findByRole("heading", { name: "Producto restaurado" })).toBeInTheDocument();
    expect(await screen.findByText("Explicó con dos datos.")).toBeInTheDocument();
    expect(screen.getByText("Explica cómo cada dato sustenta tu conclusión.")).toBeInTheDocument();
    expect(getRubricMock).toHaveBeenCalledWith("rubric-history", expect.any(AbortSignal));
    expect(listStudentsMock).toHaveBeenCalledWith("roster-1", expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("grades every criterion, generates editable pedagogical feedback and saves stable student IDs", async () => {
    render(<RubricTool variant="grader" />);
    expect(screen.getByRole("heading", { name: "Calificador de rúbrica" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Sugerir con IA/i })).not.toBeInTheDocument();
    await reachAssessment();

    fireEvent.change(screen.getByPlaceholderText(/En su exposición explicó/i), { target: { value: "Explicó el procedimiento con dos datos." } });
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(3);
    articles.forEach((article, index) => {
      fireEvent.change(within(article).getByRole("combobox", { name: "Nivel alcanzado" }), { target: { value: within(article).getByRole("option", { name: /AD · Logro destacado/ }).getAttribute("value") } });
      fireEvent.change(within(article).getByPlaceholderText(/Organiza los datos/i), { target: { value: `Fortaleza ${index + 1}` } });
      fireEvent.change(within(article).getByPlaceholderText(/Explicar por qué/i), { target: { value: `Mejora ${index + 1}` } });
      if (index > 0) fireEvent.change(within(article).getByPlaceholderText(/En tu próxima respuesta/i), { target: { value: `Recomendación ${index + 1}` } });
    });

    const aiButton = within(articles[0]).getByRole("button", { name: "Sugerir con IA para C1" });
    aiButton.focus();
    fireEvent.click(aiButton);
    const dialog = screen.getByRole("dialog", { name: /Retroalimentación para Ana Quispe Ramos/i });
    expect(within(dialog).getByDisplayValue("Explicó el procedimiento con dos datos.")).toHaveFocus();
    fireEvent.click(within(dialog).getByRole("button", { name: "Generar sugerencia" }));
    const proposal = await within(dialog).findByDisplayValue(/vincula cada conclusión/i);
    fireEvent.change(proposal, { target: { value: "Usa un dato, explica su relación y verifica tu conclusión." } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Aplicar recomendación" }));
    expect(within(articles[0]).getByDisplayValue("Usa un dato, explica su relación y verifica tu conclusión.")).toBeInTheDocument();
    await waitFor(() => expect(aiButton).toHaveFocus());

    fireEvent.click(screen.getByRole("button", { name: /Bruno Flores Soto/ }));
    fireEvent.change(screen.getByPlaceholderText(/En su exposición explicó/i), { target: { value: "Presentó una estrategia con apoyo." } });
    screen.getAllByRole("article").forEach((article, index) => {
      fireEvent.change(within(article).getByRole("combobox", { name: "Nivel alcanzado" }), { target: { value: within(article).getByRole("option", { name: /A · Logro esperado/ }).getAttribute("value") } });
      fireEvent.change(within(article).getByPlaceholderText(/Organiza los datos/i), { target: { value: `Fortaleza Bruno ${index + 1}` } });
      fireEvent.change(within(article).getByPlaceholderText(/Explicar por qué/i), { target: { value: `Mejora Bruno ${index + 1}` } });
      fireEvent.change(within(article).getByPlaceholderText(/En tu próxima respuesta/i), { target: { value: `Recomendación Bruno ${index + 1}` } });
    });

    fireEvent.click(screen.getByRole("button", { name: /Siguiente/i }));
    expect(await screen.findByRole("heading", { name: "Informe de resolución de problemas" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Guardar borrador" }));
    await waitFor(() => expect(saveMock).toHaveBeenCalledOnce());
    const payload = saveMock.mock.calls[0][0];
    expect(payload.participants.map((item: { student_id: string }) => item.student_id)).toEqual(["student-1", "student-2"]);
    expect(payload.records).toHaveLength(6);
    expect(payload.records[0]).toEqual(expect.objectContaining({ student_id: "student-1", recommendation: "Usa un dato, explica su relación y verifica tu conclusión." }));

    fireEvent.click(screen.getByRole("button", { name: "Guardar y descargar Word" }));
    await waitFor(() => expect(saveMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(exportWordMock).toHaveBeenCalledWith(expect.objectContaining({ currentStep: 3 }), students));
  });

  it("keeps the criteria and level limits enforceable", async () => {
    render(<RubricTool />);
    await reachAssessment();
    fireEvent.click(screen.getByRole("button", { name: "Anterior" }));
    const addCriterion = screen.getByRole("button", { name: "Añadir criterio" });
    fireEvent.click(addCriterion);
    fireEvent.click(addCriterion);
    fireEvent.click(addCriterion);
    expect(addCriterion).toBeDisabled();
    expect(screen.getByText("6 criterios · 4 niveles")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Añadir nivel" })).toBeDisabled();
  });

  it("blocks the Word export and explains a concurrent revision conflict", async () => {
    getRubricMock.mockResolvedValue({
      id: "rubric-history", revision: 4, kind: "rubric", status: "generated", roster_id: "roster-1",
      general_data: { teacherName: "María", institution: "I.E.", modality: "EBR", level: "Primaria", grade: "4° de Primaria", area: "Matemática", competence: "Resuelve problemas de cantidad", performance: "Explica.", evidenceTitle: "Producto", date: "2026-08-31" },
      settings: { rubric_type: "analytic", weighted: false }, participants: [], criteria: [], records: [],
    });
    saveMock.mockRejectedValueOnce(new ApiError("La versión cambió", 409));
    render(<RubricTool instrumentId="rubric-history" />);
    await screen.findByRole("heading", { name: "Producto" });

    fireEvent.click(screen.getByRole("button", { name: "Guardar y descargar Word" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("cambió en otra sesión");
    expect(screen.getByRole("alert")).toHaveTextContent("No se guardó ni exportó una versión desactualizada");
    expect(exportWordMock).not.toHaveBeenCalled();
  });
});

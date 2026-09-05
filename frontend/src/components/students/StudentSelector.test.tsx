import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { listRosters, listStudents } from "../../features/rosters/rosterApi";
import type { Roster, Student } from "../../features/rosters/rosterTypes";
import { StudentSelector } from "./StudentSelector";

vi.mock("../../features/rosters/rosterApi", () => ({
  listRosters: vi.fn(),
  listStudents: vi.fn(),
}));

const roster: Roster = {
  id: "roster-2026-3a",
  school_year: 2026,
  institution_name: "I.E. República del Perú",
  modality: "EBR",
  education_level: "Primaria",
  grade: "3.er grado",
  section: "A",
  name: "Tercero A",
  active: true,
  student_count: 3,
};

const students: Student[] = [
  { id: "student-ana", roster_id: roster.id, full_name: "Ana Álvarez", internal_code: "A-01", sort_order: 1, active: true },
  { id: "student-bruno", roster_id: roster.id, full_name: "Bruno Rojas", internal_code: "B-02", sort_order: 2, active: true },
  { id: "student-camila", roster_id: roster.id, full_name: "Camila Torres", sort_order: 3, active: true },
];

beforeEach(() => {
  vi.mocked(listRosters).mockReset().mockResolvedValue([roster]);
  vi.mocked(listStudents).mockReset().mockResolvedValue(students);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("StudentSelector", () => {
  it("loads rosters and students, searches, and selects all visible students in multiple mode", async () => {
    const onChange = vi.fn();
    render(<StudentSelector mode="multiple" onChange={onChange} label="Estudiantes evaluados" required />);

    expect(screen.getByText("Cargando tus aulas…")).toBeInTheDocument();
    expect(await screen.findByRole("option", { name: /Ana Álvarez/ })).toBeInTheDocument();
    expect(listRosters).toHaveBeenCalledTimes(1);
    expect(listStudents).toHaveBeenCalledWith(roster.id);

    const listbox = screen.getByRole("listbox", { name: /Estudiantes de Tercero A/ });
    expect(listbox).toHaveAttribute("aria-multiselectable", "true");
    const firstOption = screen.getByRole("option", { name: /Ana Álvarez/ });
    firstOption.focus();
    fireEvent.keyDown(firstOption, { key: "ArrowDown" });
    expect(screen.getByRole("option", { name: /Bruno Rojas/ })).toHaveFocus();
    fireEvent.change(screen.getByRole("searchbox", { name: "Buscar estudiantes" }), { target: { value: "bruno" } });
    expect(screen.queryByRole("option", { name: /Ana Álvarez/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Seleccionar visibles" }));

    expect(onChange).toHaveBeenLastCalledWith({
      mode: "multiple",
      rosterId: roster.id,
      studentIds: ["student-bruno"],
    });
    expect(screen.getByText("1 estudiante seleccionado")).toBeInTheDocument();
  });

  it("keeps only one stable student ID in single mode", async () => {
    const onChange = vi.fn();
    render(<StudentSelector mode="single" onChange={onChange} />);

    fireEvent.click(await screen.findByRole("option", { name: /Ana Álvarez/ }));
    fireEvent.click(screen.getByRole("option", { name: /Bruno Rojas/ }));

    expect(onChange).toHaveBeenLastCalledWith({
      mode: "single",
      rosterId: roster.id,
      studentIds: ["student-bruno"],
    });
    expect(screen.getByRole("option", { name: /Ana Álvarez/ })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("option", { name: /Bruno Rojas/ })).toHaveAttribute("aria-selected", "true");
  });

  it("emits every active student ID automatically in classroom mode", async () => {
    const onChange = vi.fn();
    render(<StudentSelector mode="classroom" onChange={onChange} />);

    await screen.findByRole("option", { name: /Camila Torres/ });
    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith({
      mode: "classroom",
      rosterId: roster.id,
      studentIds: students.map((student) => student.id),
    }));
    const studentOptions = within(screen.getByRole("listbox")).getAllByRole("option");
    expect(studentOptions).toHaveLength(3);
    expect(studentOptions.every((option) => option.getAttribute("aria-selected") === "true")).toBe(true);
    expect(screen.queryByRole("button", { name: /Seleccionar todo/ })).not.toBeInTheDocument();
  });

  it("returns a group name and member IDs in group mode", async () => {
    const onChange = vi.fn();
    render(<StudentSelector mode="group" onChange={onChange} required />);

    await screen.findByRole("option", { name: /Ana Álvarez/ });
    fireEvent.change(screen.getByLabelText(/Nombre del grupo/), { target: { value: "Exploradores" } });
    fireEvent.click(screen.getByRole("button", { name: "Seleccionar todo" }));

    expect(onChange).toHaveBeenLastCalledWith({
      mode: "group",
      rosterId: roster.id,
      studentIds: students.map((student) => student.id),
      groupName: "Exploradores",
    });
    expect(screen.getByLabelText(/Nombre del grupo/)).toHaveAttribute("placeholder", "Ej. Equipo Exploradores");
  });

  it("shows a roster error and retries without losing accessibility semantics", async () => {
    vi.mocked(listRosters)
      .mockRejectedValueOnce(new Error("Servicio temporalmente no disponible"))
      .mockResolvedValueOnce([roster]);
    const onChange = vi.fn();
    render(<StudentSelector mode="multiple" onChange={onChange} />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Servicio temporalmente no disponible");
    fireEvent.click(screen.getByRole("button", { name: /Reintentar/ }));

    expect(await screen.findByRole("option", { name: /Ana Álvarez/ })).toBeInTheDocument();
    expect(listRosters).toHaveBeenCalledTimes(2);
  });

  it("covers empty roster, empty classroom, and no-search-result states", async () => {
    vi.mocked(listRosters).mockResolvedValueOnce([]);
    const firstRender = render(
      <StudentSelector mode="multiple" onChange={vi.fn()} manageStudentsHref="/dashboard/mis-estudiantes" />,
    );
    expect(await screen.findByText("Aún no tienes aulas activas")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir a Mis estudiantes" })).toHaveAttribute("href", "/dashboard/mis-estudiantes");
    firstRender.unmount();

    vi.mocked(listRosters).mockResolvedValueOnce([roster]);
    vi.mocked(listStudents).mockResolvedValueOnce([]);
    const secondRender = render(<StudentSelector mode="multiple" onChange={vi.fn()} />);
    expect(await screen.findByText("Esta aula aún no tiene estudiantes activos")).toBeInTheDocument();
    secondRender.unmount();

    vi.mocked(listRosters).mockResolvedValueOnce([roster]);
    vi.mocked(listStudents).mockResolvedValueOnce(students);
    render(<StudentSelector mode="multiple" onChange={vi.fn()} />);
    await screen.findByRole("option", { name: /Ana Álvarez/ });
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "nombre inexistente" } });
    expect(screen.getByText("No encontramos coincidencias")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));
    expect(screen.getByRole("option", { name: /Ana Álvarez/ })).toBeInTheDocument();
  });

  it("retries the selected classroom when loading its students fails", async () => {
    vi.mocked(listStudents)
      .mockRejectedValueOnce(new Error("No se pudo consultar el aula"))
      .mockResolvedValueOnce(students);
    render(<StudentSelector mode="single" onChange={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo consultar el aula");
    fireEvent.click(screen.getByRole("button", { name: /Reintentar/ }));
    expect(await screen.findByRole("option", { name: /Camila Torres/ })).toBeInTheDocument();
    expect(listStudents).toHaveBeenCalledTimes(2);
  });
});

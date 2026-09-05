import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { RosterPage } from "./RosterPage";
import type { Roster, Student } from "./rosterTypes";

const roster: Roster = {
  id: "roster-1",
  school_year: 2026,
  institution_name: "I.E. República del Perú",
  modality: "EBR",
  education_level: "Primaria",
  grade: "4.º de Primaria",
  section: "A",
  name: "4.º A",
  active: true,
  student_count: 2,
};

const students: Student[] = [
  { id: "student-1", roster_id: roster.id, full_name: "Ana Lucía Quispe Ramos", internal_code: "EST-01", document_number: "12345678", notes: "Prefiere ejemplos visuales", sort_order: 0, active: true },
  { id: "student-2", roster_id: roster.id, full_name: "Bruno Flores Soto", internal_code: "EST-02", document_number: null, notes: null, sort_order: 1, active: true },
];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });
}

function requestDetails(input: RequestInfo | URL, init?: RequestInit) {
  return { url: String(input), method: init?.method?.toUpperCase() ?? "GET", body: init?.body };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => { resolve = next; });
  return { promise, resolve };
}

describe("RosterPage", () => {
  beforeEach(() => {
    sessionStorage.setItem("avendia.accessToken", "test-token");
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it("loads an aula, searches students and exposes the active count", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const { url } = requestDetails(input, init);
      if (url.includes("/rosters?active=true")) return json({ items: [roster], total: 1, limit: 200, offset: 0 });
      if (url.includes("/rosters?active=false")) return json({ items: [], total: 0, limit: 200, offset: 0 });
      if (url.includes(`/rosters/${roster.id}/students?active=true`)) return json({ items: students, total: 2, limit: 5000, offset: 0 });
      if (url.includes(`/rosters/${roster.id}/students?active=false`)) return json({ items: [], total: 0, limit: 5000, offset: 0 });
      return json({}, 404);
    }));

    render(<RosterPage />);

    expect(await screen.findByRole("heading", { name: "4.º A" })).toBeInTheDocument();
    expect(await screen.findByText("Ana Lucía Quispe Ramos")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "4.º A" }).parentElement).toHaveTextContent("2 estudiantes activos");

    fireEvent.change(screen.getByPlaceholderText("Buscar por nombre, código o documento"), { target: { value: "lucia" } });
    expect(await screen.findByText("Ana Lucía Quispe Ramos")).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText("Buscar por nombre, código o documento"), { target: { value: "Bruno" } });
    expect(await screen.findByText("Bruno Flores Soto")).toBeInTheDocument();
    expect(screen.queryByText("Ana Lucía Quispe Ramos")).not.toBeInTheDocument();
  });

  it("ignores a late student response after switching classrooms", async () => {
    const secondRoster = { ...roster, id: "roster-2", name: "5.º B", grade: "5.º de Primaria", section: "B" };
    const firstResponse = deferred<Response>();
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/rosters?active=true")) return json({ items: [roster, secondRoster], total: 2, limit: 200, offset: 0 });
      if (url.includes("/rosters?active=false")) return json({ items: [], total: 0, limit: 200, offset: 0 });
      if (url.includes(`/rosters/${roster.id}/students?active=true`)) return firstResponse.promise;
      if (url.includes(`/rosters/${roster.id}/students?active=false`)) return json({ items: [], total: 0, limit: 5000, offset: 0 });
      if (url.includes(`/rosters/${secondRoster.id}/students?active=true`)) return json({ items: [{ ...students[1], id: "student-second", roster_id: secondRoster.id }], total: 1, limit: 5000, offset: 0 });
      if (url.includes(`/rosters/${secondRoster.id}/students?active=false`)) return json({ items: [], total: 0, limit: 5000, offset: 0 });
      return json({}, 404);
    }));
    render(<RosterPage />);

    await screen.findByRole("heading", { name: "4.º A" });
    fireEvent.click(screen.getByRole("button", { name: /5.º B/ }));
    expect(await screen.findByText("Bruno Flores Soto")).toBeInTheDocument();
    firstResponse.resolve(json({ items: [students[0]], total: 1, limit: 5000, offset: 0 }));
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.queryByText("Ana Lucía Quispe Ramos")).not.toBeInTheDocument();
  });

  it("reconciles the selected classroom when filtering by school year", async () => {
    const previousRoster = { ...roster, id: "roster-2025", school_year: 2025, name: "3.º C", grade: "3.º de Primaria", section: "C" };
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/rosters?active=true")) return json({ items: [roster, previousRoster], total: 2, limit: 200, offset: 0 });
      if (url.includes("/rosters?active=false")) return json({ items: [], total: 0, limit: 200, offset: 0 });
      if (url.includes("/students?active=")) return json({ items: [], total: 0, limit: 5000, offset: 0 });
      return json({}, 404);
    }));
    render(<RosterPage />);

    await screen.findByRole("heading", { name: "4.º A" });
    fireEvent.change(screen.getByLabelText("Año"), { target: { value: "2025" } });
    expect(await screen.findByRole("heading", { name: "3.º C" })).toBeInTheDocument();
  });

  it("adds a student manually and keeps the API payload free of sensitive extras", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const { url, method } = requestDetails(input, init);
      if (url.includes("/rosters?active=true") && method === "GET") return json([roster]);
      if (url.includes("/rosters?active=false") && method === "GET") return json([]);
      if (url.includes(`/rosters/${roster.id}/students?active=true`) && method === "GET") return json(students);
      if (url.includes(`/rosters/${roster.id}/students?active=false`) && method === "GET") return json([]);
      if (url.endsWith(`/rosters/${roster.id}/students`) && method === "POST") return json({ id: "student-3", roster_id: roster.id, full_name: "Carla Mendoza Paz", internal_code: "", document_number: "", notes: "", sort_order: 2, active: true }, 201);
      return json({}, 404);
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<RosterPage />);

    await screen.findByText("Ana Lucía Quispe Ramos");
    fireEvent.click(screen.getByRole("button", { name: /Agregar estudiante/i }));
    const dialog = screen.getByRole("dialog", { name: "Agregar estudiante" });
    fireEvent.change(within(dialog).getByLabelText("Nombre completo"), { target: { value: "Carla Mendoza Paz" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Agregar estudiante" }));

    expect(await screen.findByText("Carla Mendoza Paz")).toBeInTheDocument();
    const postCall = fetchMock.mock.calls.find(([, init]) => init?.method === "POST");
    expect(postCall).toBeDefined();
    expect(JSON.parse(String(postCall?.[1]?.body))).toEqual({ full_name: "Carla Mendoza Paz", internal_code: "", document_number: "", notes: "" });
  });

  it("previews an import, flags duplicates and confirms only valid rows", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const { url, method } = requestDetails(input, init);
      if (url.includes("/rosters?active=true") && method === "GET") return json([roster]);
      if (url.includes("/rosters?active=false") && method === "GET") return json([]);
      if (url.includes(`/rosters/${roster.id}/students?active=true`) && method === "GET") return json(students);
      if (url.includes(`/rosters/${roster.id}/students?active=false`) && method === "GET") return json([]);
      if (url.endsWith(`/rosters/${roster.id}/imports/preview`) && method === "POST") return json({
        preview_token: "preview-1",
        columns: ["Nombre completo", "DNI"],
        suggested_mapping: { full_name: "Nombre completo", document_number: "DNI" },
        rows: [
          { row_number: 2, values: { "Nombre completo": "Carla Mendoza Paz", DNI: "87654321" } },
          { row_number: 3, values: { "Nombre completo": "Ana Lucía Quispe Ramos", DNI: "12345678" } },
          { row_number: 4, values: { "Nombre completo": "Carla Mendoza Paz", DNI: "87654321" } },
          { row_number: 5, values: { "Nombre completo": "", DNI: "" } },
        ],
        total_rows: 4,
        warnings: ["Se omitió una fila de ejemplo."],
      });
      if (url.endsWith(`/rosters/${roster.id}/imports/confirm`) && method === "POST") return json({ created_count: 1, skipped_count: 2 });
      return json({}, 404);
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<RosterPage />);

    await screen.findByText("Ana Lucía Quispe Ramos");
    const importButton = screen.getByRole("button", { name: "Importar archivo" });
    importButton.focus();
    fireEvent.click(importButton);
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    expect(input).not.toBeNull();
    await waitFor(() => expect(input).toHaveFocus());
    const file = new File(["Nombre completo,DNI\nCarla Mendoza Paz,87654321"], "estudiantes.csv", { type: "text/csv" });
    fireEvent.change(input!, { target: { files: [file] } });

    expect(await screen.findByRole("heading", { name: "Vista previa" })).toBeInTheDocument();
    expect(screen.getByText("Se omitió una fila de ejemplo.")).toBeInTheDocument();
    const documentMapping = screen.getByLabelText("Columna para DNI o documento");
    expect(within(documentMapping).getByRole("option", { name: "Nombre completo" })).toBeDisabled();
    expect(screen.getByText("1 listas")).toBeInTheDocument();
    expect(screen.getByText("2 duplicadas")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Continuar/i }));
    expect(screen.getByRole("heading", { name: "Todo listo para importar" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Importar 1 estudiantes" }));

    expect(await screen.findByRole("heading", { name: "Importación completada" })).toBeInTheDocument();
    const confirmCall = fetchMock.mock.calls.find(([input, init]) => String(input).endsWith("/imports/confirm") && init?.method === "POST");
    const payload = JSON.parse(String(confirmCall?.[1]?.body));
    expect(payload.rows).toHaveLength(1);
    expect(payload.skip_duplicates).toBe(true);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(importButton).toHaveFocus();
  });

  it("reorders only active students and keeps retired students available", async () => {
    const retired: Student = {
      id: "student-retired",
      roster_id: roster.id,
      full_name: "Diego Torres León",
      sort_order: 2,
      active: false,
    };
    const reorderResponse = deferred<Response>();
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const { url, method } = requestDetails(input, init);
      if (url.includes("/rosters?active=true") && method === "GET") return json({ items: [roster], total: 1, limit: 200, offset: 0 });
      if (url.includes("/rosters?active=false") && method === "GET") return json({ items: [], total: 0, limit: 200, offset: 0 });
      if (url.includes(`/rosters/${roster.id}/students?active=true`) && method === "GET") return json({ items: students, total: 2, limit: 5000, offset: 0 });
      if (url.includes(`/rosters/${roster.id}/students?active=false`) && method === "GET") return json({ items: [retired], total: 1, limit: 5000, offset: 0 });
      if (url.endsWith(`/rosters/${roster.id}/students/reorder`) && method === "POST") {
        return reorderResponse.promise;
      }
      return json({}, 404);
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<RosterPage />);

    await screen.findByText("Ana Lucía Quispe Ramos");
    const moveButton = screen.getByRole("button", { name: "Bajar a Ana Lucía Quispe Ramos" });
    fireEvent.click(moveButton);
    fireEvent.click(moveButton);

    await waitFor(() => {
      const reorderCall = fetchMock.mock.calls.find(([input, init]) => String(input).endsWith("/students/reorder") && init?.method === "POST");
      expect(JSON.parse(String(reorderCall?.[1]?.body))).toEqual({ student_ids: ["student-2", "student-1"] });
      expect(fetchMock.mock.calls.filter(([input, init]) => String(input).endsWith("/students/reorder") && init?.method === "POST")).toHaveLength(1);
    });
    expect(moveButton).toBeDisabled();
    reorderResponse.resolve(json({ items: [{ ...students[1], sort_order: 0 }, { ...students[0], sort_order: 1 }], total: 2 }));
    fireEvent.change(screen.getByLabelText("Estado"), { target: { value: "inactive" } });
    expect(await screen.findByText("Diego Torres León")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Subir a Diego Torres León" })).toBeDisabled();
  });

  it("shows the student error without also rendering an empty state", async () => {
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/rosters?active=true")) return json({ items: [roster], total: 1, limit: 200, offset: 0 });
      if (url.includes("/rosters?active=false")) return json({ items: [], total: 0, limit: 200, offset: 0 });
      if (url.includes(`/rosters/${roster.id}/students?active=true`)) return json({ detail: "No se pudo leer la nómina." }, 500);
      if (url.includes(`/rosters/${roster.id}/students?active=false`)) return json({ items: [], total: 0, limit: 5000, offset: 0 });
      return json({}, 404);
    }));
    render(<RosterPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudo leer la nómina.");
    expect(screen.queryByText("Esta aula aún no tiene estudiantes")).not.toBeInTheDocument();
  });

  it("edits, archives and reactivates a classroom", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const { url, method } = requestDetails(input, init);
      if (url.includes("/rosters?active=true") && method === "GET") return json({ items: [roster], total: 1, limit: 200, offset: 0 });
      if (url.includes("/rosters?active=false") && method === "GET") return json({ items: [], total: 0, limit: 200, offset: 0 });
      if (url.includes("/students?active=") && method === "GET") return json({ items: [], total: 0, limit: 5000, offset: 0 });
      if (url.endsWith(`/rosters/${roster.id}`) && method === "DELETE") return new Response(null, { status: 204 });
      if (url.endsWith(`/rosters/${roster.id}`) && method === "PATCH") return json({ ...roster, active: true });
      return json({}, 404);
    });
    vi.stubGlobal("fetch", fetchMock);
    render(<RosterPage />);

    await screen.findByRole("heading", { name: "4.º A" });
    const editButton = screen.getByRole("button", { name: "Editar aula" });
    editButton.focus();
    fireEvent.click(editButton);
    expect(screen.getByRole("dialog", { name: "Editar aula" })).toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    await waitFor(() => expect(editButton).toHaveFocus());
    fireEvent.click(screen.getByRole("button", { name: "Archivar" }));
    fireEvent.click(within(screen.getByRole("dialog", { name: "Archivar aula" })).getByRole("button", { name: "Archivar aula" }));
    expect(await screen.findByRole("button", { name: "Reactivar" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Reactivar" }));
    await waitFor(() => expect(fetchMock.mock.calls.some(([input, init]) => String(input).endsWith(`/rosters/${roster.id}`) && init?.method === "PATCH")).toBe(true));
    expect(await screen.findByRole("button", { name: "Archivar" })).toBeInTheDocument();
  });

  it("disables the welcome download while pending and reports its failure", async () => {
    const templateResponse = deferred<Response>();
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/rosters?active=")) return json({ items: [], total: 0, limit: 200, offset: 0 });
      if (url.endsWith("/rosters/template")) return templateResponse.promise;
      return json({}, 404);
    }));
    render(<RosterPage />);

    const button = await screen.findByRole("button", { name: "Descargar plantilla" });
    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "Preparando plantilla…" })).toBeDisabled();
    templateResponse.resolve(json({ detail: "La plantilla no está disponible." }, 500));
    expect(await screen.findByRole("alert")).toHaveTextContent("La plantilla no está disponible.");
  });

  it("shows a recoverable error state when rosters cannot be loaded", async () => {
    const fetchMock = vi.fn(async () => json({ detail: "La sesión venció. Vuelve a ingresar." }, 401));
    vi.stubGlobal("fetch", fetchMock);
    render(<RosterPage />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("La sesión venció. Vuelve a ingresar.");
    fireEvent.click(within(alert).getByRole("button", { name: "Reintentar" }));
    await waitFor(() => expect(fetchMock.mock.calls.length).toBeGreaterThan(1));
  });
});

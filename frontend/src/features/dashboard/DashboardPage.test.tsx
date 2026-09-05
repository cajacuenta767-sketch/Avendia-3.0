import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DashboardPage } from "./DashboardPage";
import { invalidateDashboardActivity } from "./dashboardActivity";
import { WorkspacePreferencesProvider } from "../../context/WorkspacePreferencesContext";

function renderDashboard() {
  return render(<WorkspacePreferencesProvider><BrowserRouter><DashboardPage /></BrowserRouter></WorkspacePreferencesProvider>);
}

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  invalidateDashboardActivity();
  vi.unstubAllGlobals();
});

describe("DashboardPage", () => {
  it("recovers the complete home distribution", async () => {
    renderDashboard();

    expect(screen.getByRole("heading", { name: "¡Te damos la bienvenida, María!" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Recomendadas para empezar" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Explorar por módulos" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Calendario escolar 2026" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "BIMESTRAL" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("heading", { name: "Historial reciente" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Nueva creación/i })).toBeInTheDocument();
    expect(await screen.findByText("Aún no tienes documentos")).toBeInTheDocument();
    expect(screen.queryByText("Borrador de ejemplo")).not.toBeInTheDocument();

    const explorer = screen.getByRole("region", { name: "Explorar por módulos" });
    expect(within(explorer).getAllByRole("button", { name: /Empezar creación/i })).toHaveLength(58);

    fireEvent.click(screen.getByRole("button", { name: /Nueva creación/i }));
    expect(screen.getByRole("dialog", { name: "Nueva creación" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Planificación/i })).toBeInTheDocument();
  });

  it("uses real documents for history and most-used tools", async () => {
    sessionStorage.setItem("avendia.accessToken", "token");
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/dashboard/overview")) {
        return new Response(JSON.stringify({
          document_count: 1,
          recent_documents: [{
            id: "document-1",
            title: "Mi plan anual real",
            status: "draft",
            path: "/dashboard/planificamos/plan-curricular-anual",
            updated_at: new Date().toISOString(),
          }],
          most_used_tool_ids: ["plan-curricular-anual"],
          notifications: [],
          generated_at: new Date().toISOString(),
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } });
    }));

    renderDashboard();

    expect(await screen.findByText("Mi plan anual real")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Herramientas más utilizadas" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("1")).toBeInTheDocument());
  });

  it("updates the daily teaching preference", () => {
    renderDashboard();

    fireEvent.click(screen.getByRole("button", { name: "Cambiar preferencia" }));
    expect(screen.getByRole("dialog", { name: "¿En qué quieres enfocarte hoy?" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Crear recursos" }));
    expect(screen.getByText(/Tu prioridad de hoy es crear recursos/i)).toBeInTheDocument();
  });

  it("filters tools and keeps the academic level interactive", () => {
    renderDashboard();

    const level = screen.getByLabelText("Nivel");
    fireEvent.change(level, { target: { value: "Primaria" } });
    expect(level).toHaveValue("Primaria");
    expect(screen.getAllByText("Primaria").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Evaluamos" }));
    expect(screen.getByRole("button", { name: "Evaluamos" })).toHaveAttribute("aria-pressed", "true");
    const explorer = screen.getByRole("region", { name: "Explorar por módulos" });
    expect(within(explorer).getByText("Rúbrica de evaluación")).toBeInTheDocument();
    expect(within(explorer).queryByText("Plan Curricular Anual (PCA)")).not.toBeInTheDocument();
  });

  it("opens the professional plan summary", () => {
    renderDashboard();

    fireEvent.click(screen.getByRole("button", { name: "Ver plan profesional" }));
    expect(screen.getByRole("dialog", { name: "Docente profesional" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir mi perfil" })).toBeInTheDocument();
  });
});

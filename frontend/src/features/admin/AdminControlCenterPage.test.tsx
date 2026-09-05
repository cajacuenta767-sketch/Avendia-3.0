import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { apiRequest } from "../../lib/api";
import { AdminControlCenterPage } from "./AdminControlCenterPage";

vi.mock("../../lib/api", () => ({ apiRequest: vi.fn() }));
vi.mock("./AdminCharts", () => ({
  ActivityChart: () => <div>Gráfico de actividad</div>,
  SegmentDonut: () => <div>Gráfico de distribución</div>,
  RankingChart: () => <div>Gráfico de consumo</div>,
}));

const dashboard = {
  generated_at: "2026-08-31T12:00:00Z", period_days: 30, usage_tracking_started_at: null,
  kpis: {
    users_total: 5, users_active: 4, users_inactive: 1, teachers: 4, admins: 1, users_created_period: 2,
    credits_available: 42000, credits_assigned: 50000, tokens_consumed: 8000, generations_total: 24,
    generations_period: 0, documents_total: 12, documents_period: 4, calendar_events_total: 9,
    calendar_events_period: 3, calendar_events_upcoming: 4, calendar_events_completed: 5,
    low_credit_accounts: 1, average_credits_per_tracked_generation: null,
  },
  activity: [], users_by_role: [], users_by_status: [{ key: "active", label: "Activas", value: 4 }],
  users_by_modality: [], users_by_level: [], ai_by_tool: [], ai_by_user: [],
  alerts: [{ id: "low-credit", severity: "warning", title: "Cuentas con saldo bajo", detail: "Revisar saldos.", count: 1, tab: "users" }], recent_audit: [],
};

describe("AdminControlCenterPage", () => {
  beforeEach(() => {
    sessionStorage.setItem("avendia.user", JSON.stringify({ full_name: "Admin Avendia", role: "admin" }));
    sessionStorage.setItem("avendia.accessToken", "test-token");
    vi.mocked(apiRequest).mockResolvedValue(dashboard);
  });
  afterEach(() => { cleanup(); sessionStorage.clear(); vi.clearAllMocks(); });

  it("shows real administrative KPIs and period controls", async () => {
    render(<MemoryRouter initialEntries={["/admin"]}><AdminControlCenterPage /></MemoryRouter>);
    expect(await screen.findByRole("heading", { name: "Administración de Avendia" })).toBeInTheDocument();
    expect(await screen.findByText("42,000")).toBeInTheDocument();
    expect(screen.getByText("Cuentas con saldo bajo")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Periodo"), { target: { value: "90" } });
    expect(await screen.findByDisplayValue("90 días")).toBeInTheDocument();
  });

  it("shows repaired and rejected generations in the AI quality summary", async () => {
    vi.mocked(apiRequest).mockImplementation((path) => {
      if (String(path).includes("/admin/ai-usage/events")) {
        return Promise.resolve({
          items: [],
          total: 0,
          quality: {
            attempts: 12,
            completed: 8,
            repaired: 3,
            rejected_without_charge: 1,
            credits_charged: 3300,
          },
        });
      }
      return Promise.resolve(dashboard);
    });

    render(<MemoryRouter initialEntries={["/admin?tab=ai"]}><AdminControlCenterPage /></MemoryRouter>);

    expect(await screen.findByText("Intentos validados")).toBeInTheDocument();
    expect(screen.getByText("Reparados")).toBeInTheDocument();
    expect(screen.getByText("Rechazados sin cobro")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});

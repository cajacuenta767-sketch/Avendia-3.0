import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CalendarPage } from "./CalendarPage";

describe("CalendarPage", () => {
  afterEach(cleanup);

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("shows the inherited reference dates, contests and academic blocks", () => {
    render(<MemoryRouter initialEntries={["/dashboard/calendario?year=2026&month=8"]}><CalendarPage /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "Calendario académico 2026" })).toBeInTheDocument();
    expect(screen.getByText("Batalla de Junín")).toBeInTheDocument();
    expect(screen.getByText("ONEM 2026 — etapa UGEL")).toBeInTheDocument();
    expect(screen.getByText("Santa Rosa de Lima")).toBeInTheDocument();
    expect(screen.getAllByText("Tercer bloque lectivo").length).toBeGreaterThan(0);
  });

  it("opens the date dialog with a double click and then opens its details", () => {
    render(<MemoryRouter initialEntries={["/dashboard/calendario?year=2026&month=8"]}><CalendarPage /></MemoryRouter>);

    fireEvent.doubleClick(screen.getByRole("button", { name: "Agregar evento el 31/8/2026" }));
    const dialog = screen.getByRole("dialog", { name: "Nueva fecha" });
    fireEvent.change(within(dialog).getByLabelText("Título"), { target: { value: "Reunión con familias" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Guardar fecha" }));

    fireEvent.click(screen.getByRole("button", { name: /Reunión con familias/ }));
    expect(screen.getByRole("dialog", { name: "Detalle de fecha" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Completar" })).toBeInTheDocument();
  });

  it("lets the teacher configure which reference dates are active", () => {
    render(<MemoryRouter initialEntries={["/dashboard/calendario?year=2026&month=8"]}><CalendarPage /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: "Fechas y concursos" }));
    const dialog = screen.getByRole("dialog", { name: "Fechas y concursos" });
    expect(within(dialog).getByText("26 activas")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "Ninguna" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Guardar selección" }));

    expect(screen.queryByText("Batalla de Junín")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("0 fechas referenciales activas");
  });

  it("opens a calendar event sent by the compact calendar link", () => {
    localStorage.setItem("avendia.calendar.events", JSON.stringify([{
      id: "event-context-1",
      title: "Entrevista con familia",
      date: "2026-08-19",
      time: "15:30",
      type: "tutoria",
      notes: "Revisar acuerdos de seguimiento.",
      completed: false,
      source: "usuario",
    }]));

    render(<MemoryRouter initialEntries={["/dashboard/calendario?year=2026&month=8&event=event-context-1"]}><CalendarPage /></MemoryRouter>);

    expect(screen.getByRole("dialog", { name: "Detalle de fecha" })).toHaveTextContent("Entrevista con familia");
    expect(screen.getByText("Revisar acuerdos de seguimiento.")).toBeInTheDocument();
  });
});

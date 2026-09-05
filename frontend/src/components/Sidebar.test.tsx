import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Sidebar } from "./Sidebar";

describe("Sidebar", () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem("avendia.user", JSON.stringify({
      id: "sidebar-teacher",
      full_name: "Docente Demo",
      role: "teacher",
      ai_credits_balance: 10000,
    }));
  });

  it("keeps every module and utility inside the independent scroll area", () => {
    const { container } = render(
      <MemoryRouter>
        <Sidebar open collapsed={false} onClose={vi.fn()} onToggleCollapse={vi.fn()} />
      </MemoryRouter>,
    );

    const scrollArea = container.querySelector(".sidebar__scroll");
    expect(scrollArea).toHaveAttribute("aria-label", "Opciones de navegación desplazables");
    expect(screen.getByRole("link", { name: "Inicio" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Recursos" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Videos tutoriales" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Comunidad activa" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Mis estudiantes" })).toBeInTheDocument();
    expect(scrollArea).toContainElement(screen.getByRole("link", { name: "Mis estudiantes" }));
  });
});

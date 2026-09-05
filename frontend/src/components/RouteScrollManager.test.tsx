import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RouteScrollManager } from "./RouteScrollManager";

function Fixture() {
  const location = useLocation();
  const navigate = useNavigate();
  return <><RouteScrollManager /><span>{location.pathname}</span><button onClick={() => navigate("/second")}>Abrir</button><button onClick={() => navigate(-1)}>Atrás</button></>;
}

describe("RouteScrollManager", () => {
  beforeEach(() => {
    sessionStorage.clear();
    Object.defineProperty(window, "scrollY", { configurable: true, writable: true, value: 0 });
    Object.defineProperty(window, "scrollTo", {
      configurable: true,
      writable: true,
      value: vi.fn((options: ScrollToOptions | number = 0, y = 0) => {
        window.scrollY = typeof options === "object" ? Number(options.top ?? 0) : y;
      }),
    });
  });

  it("opens a new route at the top and restores the previous position on Back", async () => {
    render(<MemoryRouter initialEntries={["/dashboard"]}><Fixture /></MemoryRouter>);
    await waitFor(() => expect(window.scrollY).toBe(0));

    act(() => { window.scrollY = 640; });
    fireEvent.click(screen.getByRole("button", { name: "Abrir" }));
    await waitFor(() => expect(screen.getByText("/second")).toBeInTheDocument());
    await waitFor(() => expect(window.scrollY).toBe(0));

    act(() => { window.scrollY = 180; });
    fireEvent.click(screen.getByRole("button", { name: "Atrás" }));
    await waitFor(() => expect(screen.getByText("/dashboard")).toBeInTheDocument());
    await waitFor(() => expect(window.scrollY).toBe(640));
  });
});

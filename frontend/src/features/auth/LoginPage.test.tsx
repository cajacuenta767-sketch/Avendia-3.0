import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LoginPage } from "./LoginPage";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.unstubAllGlobals();
});

describe("LoginPage", () => {
  it("keeps the public theme controllable and persistent", async () => {
    localStorage.setItem("avendia.theme", "dark");
    render(<MemoryRouter><LoginPage /></MemoryRouter>);
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("dark"));
    fireEvent.click(screen.getByRole("button", { name: "Activar modo claro" }));
    await waitFor(() => expect(document.documentElement.dataset.theme).toBe("light"));
    expect(localStorage.getItem("avendia.theme")).toBe("light");
  });

  it("completes the password recovery flow", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Código solicitado", development_reset_code: "123456" }), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ message: "Tu contraseña fue actualizada. Ya puedes ingresar." }), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    render(<MemoryRouter><LoginPage /></MemoryRouter>);

    fireEvent.change(screen.getByRole("textbox", { name: "Correo electrónico" }), { target: { value: "maria@example.edu" } });
    fireEvent.click(screen.getByRole("button", { name: "¿Olvidaste tu contraseña?" }));
    fireEvent.click(screen.getByRole("button", { name: "Enviar código" }));

    expect(await screen.findByText("123456")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Nueva contraseña"), { target: { value: "second-secure-password" } });
    fireEvent.change(screen.getByLabelText("Repite la contraseña"), { target: { value: "second-secure-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Cambiar contraseña" }));

    expect(await screen.findByRole("heading", { name: "Contraseña actualizada" })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});

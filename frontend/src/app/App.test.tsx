import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";
import { FontSizeProvider } from "../context/FontSizeContext";

function renderApp(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <FontSizeProvider>
        <MemoryRouter initialEntries={[path]}><App /></MemoryRouter>
      </FontSizeProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

describe("App session protection", () => {
  it("redirects a direct dashboard visit to login without a session", async () => {
    renderApp("/dashboard");
    expect(await screen.findByRole("heading", { name: "¡Hola, profe!" })).toBeInTheDocument();
  });

  it("removes protected content when the API reports an expired session", async () => {
    sessionStorage.setItem("avendia.accessToken", "expired-token");
    sessionStorage.setItem("avendia.user", JSON.stringify({ full_name: "Docente QA", role: "teacher" }));
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => new Response(
      JSON.stringify(String(input).includes("/users/me")
        ? { full_name: "Docente QA", role: "teacher" }
        : []),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )));
    renderApp("/dashboard");
    expect(await screen.findByRole("heading", { name: "¡Te damos la bienvenida, Docente!" })).toBeInTheDocument();
    window.dispatchEvent(new Event("avendia-session-expired"));
    await waitFor(
      () => expect(screen.getByRole("heading", { name: "¡Hola, profe!" })).toBeInTheDocument(),
      { timeout: 10_000 },
    );
  });

  it("keeps the administration area restricted to administrators", async () => {
    sessionStorage.setItem("avendia.accessToken", "teacher-token");
    sessionStorage.setItem("avendia.user", JSON.stringify({ full_name: "Docente QA", role: "teacher" }));
    vi.stubGlobal("fetch", vi.fn(async (input: RequestInfo | URL) => new Response(
      JSON.stringify(String(input).includes("/users/me")
        ? { full_name: "Docente QA", role: "teacher" }
        : []),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )));
    renderApp("/admin");
    expect(await screen.findByRole("heading", { name: "¡Te damos la bienvenida, Docente!" })).toBeInTheDocument();
  });
});

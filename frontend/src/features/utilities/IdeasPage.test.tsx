import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { IdeasPage } from "./IdeasPage";

afterEach(() => { cleanup(); sessionStorage.clear(); vi.unstubAllGlobals(); });

it("retains input on network failure and shows only server-confirmed proposals", async () => {
  sessionStorage.setItem("avendia.accessToken", "test-token");
  const items: unknown[] = [];
  let fail = true;
  const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
    if (init?.method === "POST") {
      if (fail) throw new TypeError("network down");
      const payload = JSON.parse(String(init.body));
      items.push({ ...payload, id: "idea-1", status: "received", mine: true, votes: 0, voted: false, response: "" });
      return new Response(JSON.stringify(items[0]), { status: 201 });
    }
    return new Response(JSON.stringify({ items, total: items.length }), { status: 200 });
  });
  vi.stubGlobal("fetch", fetchMock);
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}><IdeasPage /></QueryClientProvider>);
  await screen.findByText(/No hay propuestas/);
  fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Conservar tablas al exportar" } });
  fireEvent.change(screen.getByLabelText("Descripción"), { target: { value: "Quiero conservar las columnas y los encabezados en Word." } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar propuesta" }));
  await screen.findByRole("alert");
  expect(screen.getByLabelText("Título")).toHaveValue("Conservar tablas al exportar");
  expect(items).toHaveLength(0);
  fail = false;
  fireEvent.click(screen.getByRole("button", { name: "Guardar propuesta" }));
  await screen.findByRole("heading", { name: "Conservar tablas al exportar" });
  await waitFor(() => expect(items).toHaveLength(1));
  const calls = fetchMock.mock.calls.filter(([,init]) => init?.method === "POST");
  expect(JSON.parse(String(calls[0][1]?.body)).request_id).toBe(JSON.parse(String(calls[1][1]?.body)).request_id);
});

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TemplateLibrary } from "./TemplateLibrary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

describe("TemplateLibrary", () => {
  it("uploads and shows a server-synchronized institutional template", async () => {
    sessionStorage.setItem("avendia.accessToken", "token");
    const template = {
      id: "template-1",
      name: "formato-colegio.docx",
      extension: ".docx",
      mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size_bytes: 2048,
      is_default: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify([]), { status: 200, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify(template), { status: 201, headers: { "Content-Type": "application/json" } }))
      .mockResolvedValueOnce(new Response(JSON.stringify([template]), { status: 200, headers: { "Content-Type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><TemplateLibrary /></QueryClientProvider>);
    await screen.findByText("Aún no guardaste formatos.");

    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    const file = new File([new Uint8Array([80, 75, 3, 4])], "formato-colegio.docx", { type: template.mime_type });
    fireEvent.change(input!, { target: { files: [file] } });

    expect(await screen.findByText("formato-colegio.docx")).toBeInTheDocument();
    expect(screen.getByText("Predeterminado")).toBeInTheDocument();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  });
});

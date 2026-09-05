import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, apiRequest } from "./api";

afterEach(() => {
  sessionStorage.clear();
  vi.unstubAllGlobals();
});

describe("apiRequest", () => {
  it("adds the stored access token from the central client", async () => {
    sessionStorage.setItem("avendia.accessToken", "central-token");
    const fetchMock = vi.fn(async (_input: RequestInfo | URL, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      expect(headers.get("Authorization")).toBe("Bearer central-token");
      expect(headers.get("X-Request-ID")).toBeTruthy();
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(apiRequest<{ ok: boolean }>("/users/me")).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("keeps structured error data for a recoverable response", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({
      detail: "Proveedor temporalmente no disponible",
      error: {
        code: "provider_unavailable",
        message: "La IA está tardando. Puedes reintentar.",
        retryable: true,
        request_id: "request-ai-1",
      },
    }), {
      status: 503,
      headers: { "Content-Type": "application/json", "Retry-After": "5" },
    })));

    const error = await apiRequest("/ai/tools/examen/generate", { method: "POST" })
      .catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      message: "La IA está tardando. Puedes reintentar.",
      code: "provider_unavailable",
      requestId: "request-ai-1",
      retryable: true,
      retryAfter: 5,
    });
  });

  it("clears an invalid protected session", async () => {
    sessionStorage.setItem("avendia.accessToken", "expired");
    sessionStorage.setItem("avendia.user", JSON.stringify({ full_name: "Docente" }));
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ detail: "Expired" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })));

    await expect(apiRequest("/users/me")).rejects.toBeInstanceOf(ApiError);
    expect(sessionStorage.getItem("avendia.accessToken")).toBeNull();
    expect(sessionStorage.getItem("avendia.user")).toBeNull();
  });
});

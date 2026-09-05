import { clearSession, readAccessToken } from "./session";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8001/api/v1";
const DEFAULT_TIMEOUT_MS = 30_000;

type ApiRequestInit = RequestInit & {
  timeoutMs?: number;
  idempotencyKey?: string;
  skipAuth?: boolean;
};

type ErrorEnvelope = {
  detail?: unknown;
  error?: {
    code?: string;
    message?: string;
    field?: string | null;
    retryable?: boolean;
    request_id?: string;
  };
};

export function resolveApiAssetUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("data:")) return path;
  const apiBase = new URL(API_URL, window.location.origin);
  if (path.startsWith("/api/v1/")) return `${apiBase.origin}${path}`;
  return `${API_URL.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

export async function apiAssetAsDataUrl(path: string): Promise<string> {
  const response = await fetch(resolveApiAssetUrl(path));
  if (!response.ok) throw new ApiError("No se pudo cargar una imagen de la presentación", response.status);
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("No se pudo preparar la imagen"));
    reader.readAsDataURL(blob);
  });
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code = "request_failed",
    readonly requestId?: string,
    readonly retryable = false,
    readonly field?: string,
    readonly retryAfter?: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function responseErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object") return fallback;
  const envelope = body as ErrorEnvelope;
  if (typeof envelope.error?.message === "string") return envelope.error.message;
  const detail = envelope.detail;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object" && "message" in detail) {
    const message = (detail as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

function prepareRequest(path: string, init?: ApiRequestInit): {
  requestInit: RequestInit;
  cancelTimeout: () => void;
} {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, idempotencyKey, skipAuth = false, ...requestInit } = init ?? {};
  const headers = new Headers(requestInit.headers);
  const hasFormData = typeof FormData !== "undefined" && requestInit.body instanceof FormData;
  if (!hasFormData && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const token = readAccessToken();
  if (!skipAuth && token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
  if (idempotencyKey && !headers.has("Idempotency-Key")) headers.set("Idempotency-Key", idempotencyKey);
  if (!headers.has("X-Request-ID") && typeof crypto?.randomUUID === "function") {
    headers.set("X-Request-ID", crypto.randomUUID());
  }

  const timeoutController = new AbortController();
  const timeout = window.setTimeout(() => timeoutController.abort("timeout"), timeoutMs);
  const sourceSignal = requestInit.signal;
  const abortFromSource = () => timeoutController.abort(sourceSignal?.reason);
  sourceSignal?.addEventListener("abort", abortFromSource, { once: true });

  return {
    requestInit: { ...requestInit, headers, signal: timeoutController.signal },
    cancelTimeout: () => {
      window.clearTimeout(timeout);
      sourceSignal?.removeEventListener("abort", abortFromSource);
    },
  };
}

async function parseApiError(response: Response, fallback: string): Promise<ApiError> {
  const body = await response.json().catch(() => null) as ErrorEnvelope | null;
  const requestId = body?.error?.request_id ?? response.headers.get("X-Request-ID") ?? undefined;
  const retryAfterHeader = response.headers.get("Retry-After");
  const retryAfter = retryAfterHeader ? Number.parseInt(retryAfterHeader, 10) : undefined;
  return new ApiError(
    responseErrorMessage(body, fallback),
    response.status,
    body?.error?.code ?? `http_${response.status}`,
    requestId,
    body?.error?.retryable ?? response.status >= 500,
    body?.error?.field ?? undefined,
    Number.isFinite(retryAfter) ? retryAfter : undefined,
  );
}

function expireSession(path: string, status: number): void {
  if (status !== 401 || path.startsWith("/auth/")) return;
  clearSession();
  window.dispatchEvent(new Event("avendia-session-expired"));
}

export async function apiRequest<T>(path: string, init?: ApiRequestInit): Promise<T> {
  let response: Response;
  const prepared = prepareRequest(path, init);

  try {
    response = await fetch(`${API_URL}${path}`, prepared.requestInit);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError" && init?.signal?.aborted) throw error;
    const timedOut = prepared.requestInit.signal?.aborted;
    throw new ApiError(
      timedOut
        ? "Avendia tardó demasiado en responder. Inténtalo nuevamente."
        : "No pudimos conectar con Avendia. Espera un momento e inténtalo nuevamente.",
      0,
      timedOut ? "request_timeout" : "network_unavailable",
      undefined,
      true,
    );
  } finally {
    prepared.cancelTimeout();
  }

  if (!response.ok) {
    expireSession(path, response.status);
    throw await parseApiError(response, "No se pudo completar la solicitud");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const data = await response.json() as T;
  if (path.startsWith("/ai/tools/") && init?.method?.toUpperCase() === "POST") {
    window.dispatchEvent(new Event("avendia-credits-updated"));
  }
  const method = init?.method?.toUpperCase();
  if (method && ["POST", "PATCH", "DELETE"].includes(method) && (path.startsWith("/documents") || path.startsWith("/calendar/events"))) {
    window.dispatchEvent(new Event("avendia-activity-updated"));
  }
  return data;
}

export async function apiBlob(path: string, init?: ApiRequestInit): Promise<{ blob: Blob; filename: string }> {
  let response: Response;
  const prepared = prepareRequest(path, init);
  try {
    response = await fetch(`${API_URL}${path}`, prepared.requestInit);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError" && init?.signal?.aborted) throw error;
    const timedOut = prepared.requestInit.signal?.aborted;
    throw new ApiError(
      timedOut ? "La preparación del archivo tardó demasiado." : "No pudimos conectar con Avendia. Espera un momento e inténtalo nuevamente.",
      0,
      timedOut ? "request_timeout" : "network_unavailable",
      undefined,
      true,
    );
  } finally {
    prepared.cancelTimeout();
  }
  if (!response.ok) {
    expireSession(path, response.status);
    throw await parseApiError(response, "No se pudo preparar el archivo");
  }
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const encodedName = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  const plainName = disposition.match(/filename="?([^";]+)"?/i)?.[1];
  return {
    blob: await response.blob(),
    filename: encodedName ? decodeURIComponent(encodedName) : plainName ?? "documento-avendia",
  };
}

export function downloadApiBlob(file: { blob: Blob; filename: string }) {
  const url = URL.createObjectURL(file.blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = file.filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

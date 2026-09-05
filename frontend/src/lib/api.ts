const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8001/api/v1";

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
  ) {
    super(message);
  }
}

function responseErrorMessage(body: unknown, fallback: string): string {
  if (!body || typeof body !== "object" || !("detail" in body)) return fallback;
  const detail = (body as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (detail && typeof detail === "object" && "message" in detail) {
    const message = (detail as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return fallback;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;

  try {
    const hasFormData = typeof FormData !== "undefined" && init?.body instanceof FormData;
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: hasFormData ? { ...init?.headers } : { "Content-Type": "application/json", ...init?.headers },
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new ApiError("No pudimos conectar con Avendia. Espera un momento e inténtalo nuevamente.", 0);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null) as unknown;
    if (response.status === 401 && !path.startsWith("/auth/")) {
      sessionStorage.removeItem("avendia.accessToken");
      sessionStorage.removeItem("avendia.user");
      window.dispatchEvent(new Event("avendia-session-expired"));
    }
    throw new ApiError(responseErrorMessage(body, "No se pudo completar la solicitud"), response.status);
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

export async function apiBlob(path: string, init?: RequestInit): Promise<{ blob: Blob; filename: string }> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("No pudimos conectar con Avendia. Espera un momento e inténtalo nuevamente.", 0);
  }
  if (!response.ok) {
    const body = await response.json().catch(() => null) as unknown;
    if (response.status === 401 && !path.startsWith("/auth/")) {
      sessionStorage.removeItem("avendia.accessToken");
      sessionStorage.removeItem("avendia.user");
      window.dispatchEvent(new Event("avendia-session-expired"));
    }
    throw new ApiError(responseErrorMessage(body, "No se pudo preparar el archivo"), response.status);
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

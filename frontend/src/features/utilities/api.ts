import { apiRequest } from "../../lib/api";
import { sessionDraftScope } from "../../lib/session";

export const utilityKey = (name: string, ...parts: unknown[]) => ["utilities", sessionDraftScope(), name, ...parts];
export function utilityApi<T>(path: string, method = "GET", data?: unknown, signal?: AbortSignal) {
  return apiRequest<T>(path, { method, signal,
    headers: { Authorization: `Bearer ${sessionStorage.getItem("avendia.accessToken") ?? ""}` },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
}
export type Page<T> = { items: T[]; total: number };
export const errorText = (error: unknown) => error instanceof Error ? error.message : "No se pudo completar la operación.";

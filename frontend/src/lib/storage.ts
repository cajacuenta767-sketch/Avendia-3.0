/**
 * Lee un valor JSON de `localStorage` o `sessionStorage` sin romper la vista
 * cuando el contenido falta, está truncado o fue manipulado.
 */
export function readStoredJson<T>(storage: Storage, key: string, fallback: T): T {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw) as T | null;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

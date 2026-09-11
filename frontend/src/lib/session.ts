export type SessionUser = {
  id?: string;
  email?: string;
  full_name: string;
  school_name?: string;
  dre?: string;
  ugel?: string;
  director_name?: string;
  education_modality?: string;
  education_level?: string;
  grade?: string;
  curricular_area?: string;
  section?: string;
  school_year?: number;
  role?: string;
  ai_credits_balance?: number;
  ai_credits_total?: number;
  ai_tokens_consumed?: number;
  ai_generations?: number;
};

// Solo se usa mientras no hay sesión verificada; nunca representa una cuenta real.
const fallbackUser: SessionUser = {
  full_name: "Docente",
  role: "teacher",
  ai_credits_balance: 0,
};

const ACCESS_TOKEN_KEY = "avendia.accessToken";
const USER_KEY = "avendia.user";

export function readAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function readStoredSessionUser(): SessionUser | null {
  try {
    const saved = JSON.parse(sessionStorage.getItem(USER_KEY) ?? "null") as SessionUser | null;
    return saved?.full_name ? saved : null;
  } catch {
    return null;
  }
}

export function saveSession(accessToken: string, user: SessionUser): void {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("avendia-session-changed"));
}

export function updateStoredSessionUser(user: SessionUser): void {
  sessionStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event("avendia-session-changed"));
}

// Prefijos de los borradores guardados en este dispositivo; pueden contener datos de estudiantes.
const DEVICE_DRAFT_PREFIXES = ["avendia.draft.", "avendia.evaluations.", "avendia.workflow."];

/** Borra los borradores locales del usuario en sesión (nombres de estudiantes, evidencias, retroalimentación). */
export function clearDeviceDrafts(scope = sessionDraftScope()): void {
  const suffix = `.${scope}`;
  const keys: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key && key.endsWith(suffix) && DEVICE_DRAFT_PREFIXES.some((prefix) => key.startsWith(prefix))) keys.push(key);
  }
  keys.forEach((key) => localStorage.removeItem(key));
}

/** Cierre de sesión explícito: elimina los borradores del dispositivo y luego la sesión. */
export function endSession(): void {
  clearDeviceDrafts();
  clearSession();
}

export function readSessionUser(): SessionUser {
  return readStoredSessionUser() ?? fallbackUser;
}

export function sessionUserInitials(user: SessionUser): string {
  const initials = user.full_name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "AV";
}

export function sessionUserFirstName(user: SessionUser): string {
  return user.full_name.trim().split(/\s+/)[0] || "profe";
}

export function sessionDraftScope(): string {
  const user = readSessionUser();
  return String(user.id ?? user.email ?? "anonymous").replace(/[^a-zA-Z0-9@._-]/g, "-");
}

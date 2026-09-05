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

const fallbackUser: SessionUser = {
  full_name: "María Gómez",
  role: "teacher",
  ai_credits_balance: 10_000,
};

export function readSessionUser(): SessionUser {
  try {
    const saved = JSON.parse(sessionStorage.getItem("avendia.user") ?? "null") as SessionUser | null;
    return saved?.full_name ? saved : fallbackUser;
  } catch {
    return fallbackUser;
  }
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

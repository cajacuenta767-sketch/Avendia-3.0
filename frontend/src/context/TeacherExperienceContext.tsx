import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";

import { apiRequest } from "../lib/api";
import { readAccessToken } from "../lib/session";

export type TeacherExperiencePreferences = {
  guided_mode: boolean;
  comfortable_spacing: boolean;
  always_show_help: boolean;
  read_aloud: boolean;
  reduced_motion: boolean;
  remember_recent_context: boolean;
  last_context: Record<string, string>;
};

type TeacherExperienceContextValue = {
  preferences: TeacherExperiencePreferences;
  loading: boolean;
  refresh: () => Promise<void>;
  updatePreferences: (changes: Partial<TeacherExperiencePreferences>) => Promise<void>;
};

const STORAGE_KEY = "avendia.teacherExperience.v1";
const DEFAULT_PREFERENCES: TeacherExperiencePreferences = {
  guided_mode: true,
  comfortable_spacing: true,
  always_show_help: true,
  read_aloud: false,
  reduced_motion: false,
  remember_recent_context: true,
  last_context: {},
};

const TeacherExperienceContext = createContext<TeacherExperienceContextValue | null>(null);

function readLocalPreferences(): TeacherExperiencePreferences {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<TeacherExperiencePreferences> | null;
    return stored ? { ...DEFAULT_PREFERENCES, ...stored } : DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

function applyPreferences(preferences: TeacherExperiencePreferences) {
  document.documentElement.dataset.guidance = preferences.guided_mode ? "guided" : "compact";
  document.documentElement.dataset.comfortable = preferences.comfortable_spacing ? "true" : "false";
  document.documentElement.dataset.help = preferences.always_show_help ? "visible" : "compact";
  document.documentElement.dataset.reducedMotion = preferences.reduced_motion ? "true" : "false";
  localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
}

export function TeacherExperienceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<TeacherExperiencePreferences>(readLocalPreferences);
  const [loading, setLoading] = useState(false);

  useEffect(() => applyPreferences(preferences), [preferences]);

  const refresh = useCallback(async () => {
    if (!readAccessToken()) return;
    setLoading(true);
    try {
      const stored = await apiRequest<TeacherExperiencePreferences>("/users/me/experience-preferences");
      setPreferences({ ...DEFAULT_PREFERENCES, ...stored });
    } catch {
      // La copia local mantiene una experiencia utilizable si no hay conexión.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const synchronize = () => { void refresh(); };
    synchronize();
    window.addEventListener("avendia-session-changed", synchronize);
    return () => window.removeEventListener("avendia-session-changed", synchronize);
  }, [refresh]);

  const updatePreferences = useCallback(async (changes: Partial<TeacherExperiencePreferences>) => {
    const next = { ...preferences, ...changes };
    setPreferences(next);
    if (!readAccessToken()) return;
    try {
      await apiRequest<TeacherExperiencePreferences>("/users/me/experience-preferences", {
        method: "PATCH",
        body: JSON.stringify(next),
      });
    } catch {
      // Se conserva localmente y podrá volver a guardarse en el próximo cambio.
    }
  }, [preferences]);

  return (
    <TeacherExperienceContext.Provider value={{ preferences, loading, refresh, updatePreferences }}>
      {children}
    </TeacherExperienceContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTeacherExperience() {
  const value = useContext(TeacherExperienceContext);
  return value ?? {
    preferences: DEFAULT_PREFERENCES,
    loading: false,
    refresh: async () => undefined,
    updatePreferences: async () => undefined,
  };
}

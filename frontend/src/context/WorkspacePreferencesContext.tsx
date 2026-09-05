import { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";

import { apiRequest } from "../lib/api";
import { readAccessToken } from "../lib/session";
import { referenceDates, type AcademicBlock } from "../features/calendar/calendarData";

export type WorkspacePreferences = {
  schema_version: 1;
  migrated_from_local: boolean;
  theme: "light" | "dark";
  font_scale: 87.5 | 100 | 112.5;
  sidebar_collapsed: boolean;
  context_panel_open: boolean;
  favorite_tools: string[];
  recent_tools: string[];
  home_academic_level: string;
  daily_phrase: string;
  calendar_reference_ids: string[];
  calendar_blocks: Record<string, Array<{
    id: string;
    label: string;
    start_date: string;
    end_date: string;
    color: string;
  }>>;
};

type WorkspacePreferencesContextValue = {
  preferences: WorkspacePreferences;
  loading: boolean;
  updatePreferences: (changes: Partial<WorkspacePreferences>) => Promise<void>;
  refresh: () => Promise<void>;
};

const CACHE_KEY = "avendia.workspacePreferences.v1";
const DEFAULT_DAILY_PHRASE = "Hoy es un buen día para convertir tus ideas en experiencias de aprendizaje.";

const DEFAULT_PREFERENCES: WorkspacePreferences = {
  schema_version: 1,
  migrated_from_local: false,
  theme: "light",
  font_scale: 100,
  sidebar_collapsed: false,
  context_panel_open: true,
  favorite_tools: [],
  recent_tools: [],
  home_academic_level: "",
  daily_phrase: DEFAULT_DAILY_PHRASE,
  calendar_reference_ids: [],
  calendar_blocks: {},
};

const WorkspacePreferencesContext = createContext<WorkspacePreferencesContextValue | null>(null);
const FALLBACK_CONTEXT: WorkspacePreferencesContextValue = {
  preferences: DEFAULT_PREFERENCES,
  loading: false,
  updatePreferences: async () => undefined,
  refresh: async () => undefined,
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch {
    return fallback;
  }
}

function readLocalPreferences(): WorkspacePreferences {
  const cached = readJson<Partial<WorkspacePreferences> | null>(CACHE_KEY, null);
  const legacyScale = Number(localStorage.getItem("avendia.fontScale"));
  const fontScale = [87.5, 100, 112.5].includes(legacyScale) ? legacyScale as WorkspacePreferences["font_scale"] : 100;
  const legacyReferences = readJson<string[]>(
    "avendia.calendar.references",
    referenceDates.map((item) => item.id),
  );
  const legacyBlocks = readJson<Record<string, AcademicBlock[]>>("avendia.calendar.blocks", {});
  const calendarBlocks = Object.fromEntries(Object.entries(legacyBlocks).map(([year, blocks]) => [
    year,
    blocks.map((block) => ({
      id: block.id,
      label: block.name,
      start_date: block.startDate,
      end_date: block.endDate,
      color: block.kind,
    })),
  ]));
  return {
    ...DEFAULT_PREFERENCES,
    ...cached,
    theme: localStorage.getItem("avendia.theme") === "dark" ? "dark" : cached?.theme ?? "light",
    font_scale: cached?.font_scale ?? fontScale,
    sidebar_collapsed: cached?.sidebar_collapsed ?? localStorage.getItem("avendia.sidebar") === "collapsed",
    context_panel_open: cached?.context_panel_open ?? localStorage.getItem("avendia.contextPanel") !== "closed",
    daily_phrase: cached?.daily_phrase ?? localStorage.getItem("avendia.home.dailyPhrase") ?? DEFAULT_DAILY_PHRASE,
    calendar_reference_ids: cached?.calendar_reference_ids ?? legacyReferences,
    calendar_blocks: cached?.calendar_blocks ?? calendarBlocks,
  };
}

function applyLocalPreferences(preferences: WorkspacePreferences): void {
  localStorage.setItem(CACHE_KEY, JSON.stringify(preferences));
  localStorage.setItem("avendia.theme", preferences.theme);
  localStorage.setItem("avendia.fontScale", String(preferences.font_scale));
  localStorage.setItem("avendia.sidebar", preferences.sidebar_collapsed ? "collapsed" : "expanded");
  localStorage.setItem("avendia.contextPanel", preferences.context_panel_open ? "open" : "closed");
  localStorage.setItem("avendia.home.dailyPhrase", preferences.daily_phrase);
  document.documentElement.dataset.theme = preferences.theme;
  document.documentElement.style.colorScheme = preferences.theme;
}

export function WorkspacePreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<WorkspacePreferences>(readLocalPreferences);
  const latest = useRef(preferences);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    latest.current = preferences;
    applyLocalPreferences(preferences);
  }, [preferences]);

  const persist = useCallback(async (next: WorkspacePreferences) => {
    if (!readAccessToken()) return;
    await apiRequest<WorkspacePreferences>("/users/me/workspace-preferences", {
      method: "PATCH",
      body: JSON.stringify(next),
    });
  }, []);

  const refresh = useCallback(async () => {
    if (!readAccessToken()) return;
    setLoading(true);
    try {
      const stored = await apiRequest<WorkspacePreferences>("/users/me/workspace-preferences");
      if (!stored.migrated_from_local) {
        const migrated = { ...stored, ...latest.current, schema_version: 1 as const, migrated_from_local: true };
        setPreferences(migrated);
        await persist(migrated);
      } else {
        setPreferences({ ...DEFAULT_PREFERENCES, ...stored });
      }
    } finally {
      setLoading(false);
    }
  }, [persist]);

  useEffect(() => {
    const synchronize = () => { void refresh().catch(() => undefined); };
    synchronize();
    window.addEventListener("avendia-session-changed", synchronize);
    return () => window.removeEventListener("avendia-session-changed", synchronize);
  }, [refresh]);

  const updatePreferences = useCallback(async (changes: Partial<WorkspacePreferences>) => {
    const next = { ...latest.current, ...changes, schema_version: 1 as const, migrated_from_local: true };
    latest.current = next;
    setPreferences(next);
    try {
      await persist(next);
    } catch {
      // The versioned local cache remains available and will be retried on the next change/session.
    }
  }, [persist]);

  return (
    <WorkspacePreferencesContext.Provider value={{ preferences, loading, updatePreferences, refresh }}>
      {children}
    </WorkspacePreferencesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useWorkspacePreferences(): WorkspacePreferencesContextValue {
  const value = useContext(WorkspacePreferencesContext);
  return value ?? FALLBACK_CONTEXT;
}

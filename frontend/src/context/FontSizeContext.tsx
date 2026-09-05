import { createContext, type ReactNode, useCallback, useContext, useEffect } from "react";

import { useWorkspacePreferences } from "./WorkspacePreferencesContext";

type FontScale = 87.5 | 100 | 112.5;

type FontSizeContextValue = {
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
};

const FontSizeContext = createContext<FontSizeContextValue | null>(null);

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const { preferences, updatePreferences } = useWorkspacePreferences();
  const fontScale = preferences.font_scale;

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`;
    document.documentElement.dataset.fontScale = String(fontScale);
  }, [fontScale]);

  const setFontScale = useCallback((scale: FontScale) => {
    void updatePreferences({ font_scale: scale });
  }, [updatePreferences]);

  return <FontSizeContext.Provider value={{ fontScale, setFontScale }}>{children}</FontSizeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFontSize() {
  const value = useContext(FontSizeContext);
  if (!value) throw new Error("useFontSize debe usarse dentro de FontSizeProvider");
  return value;
}

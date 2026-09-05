import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";

type FontScale = 87.5 | 100 | 112.5;

type FontSizeContextValue = {
  fontScale: FontScale;
  setFontScale: (scale: FontScale) => void;
};

const STORAGE_KEY = "avendia.fontScale";
const DEFAULT_SCALE: FontScale = 100;
const ALLOWED_SCALES: FontScale[] = [87.5, 100, 112.5];

const FontSizeContext = createContext<FontSizeContextValue | null>(null);

function readSavedScale(): FontScale {
  const saved = Number(localStorage.getItem(STORAGE_KEY));
  return ALLOWED_SCALES.includes(saved as FontScale) ? saved as FontScale : DEFAULT_SCALE;
}

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [fontScale, setFontScaleState] = useState<FontScale>(readSavedScale);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`;
    document.documentElement.dataset.fontScale = String(fontScale);
    localStorage.setItem(STORAGE_KEY, String(fontScale));
  }, [fontScale]);

  const setFontScale = useCallback((scale: FontScale) => {
    setFontScaleState(scale);
  }, []);

  return <FontSizeContext.Provider value={{ fontScale, setFontScale }}>{children}</FontSizeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFontSize() {
  const value = useContext(FontSizeContext);
  if (!value) throw new Error("useFontSize debe usarse dentro de FontSizeProvider");
  return value;
}

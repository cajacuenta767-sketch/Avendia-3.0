import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function AuthThemeToggle() {
  const [dark, setDark] = useState(() => localStorage.getItem("avendia.theme") === "dark");

  useEffect(() => {
    const theme = dark ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("avendia.theme", theme);
  }, [dark]);

  return (
    <button className="auth-theme-toggle" type="button" onClick={() => setDark((value) => !value)} aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}>
      {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </button>
  );
}

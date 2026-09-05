import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import { App } from "./app/App";
import { FontSizeProvider } from "./context/FontSizeContext";
import { TeacherExperienceProvider } from "./context/TeacherExperienceContext";
import { WorkspacePreferencesProvider } from "./context/WorkspacePreferencesContext";
import "./styles/global.css";
import "./styles/interactive.css";
import "./styles/calendar.css";
import "./styles/theme.css";
import "./styles/assistant.css";
import "./styles/admin.css";
import "./styles/presentation.css";
import "./styles/history.css";
import "./styles/structured-preview.css";
import "./styles/profile.css";
import "./styles/templates.css";
import "./styles/rosters.css";
import "./styles/responsive.css";

const initialTheme = localStorage.getItem("avendia.theme") === "dark" ? "dark" : "light";
document.documentElement.dataset.theme = initialTheme;
document.documentElement.style.colorScheme = initialTheme;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <WorkspacePreferencesProvider>
        <FontSizeProvider>
          <TeacherExperienceProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </TeacherExperienceProvider>
        </FontSizeProvider>
      </WorkspacePreferencesProvider>
    </QueryClientProvider>
  </StrictMode>,
);

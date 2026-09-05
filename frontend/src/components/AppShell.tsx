import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";

import { CommandPalette } from "./CommandPalette";
import { ContextPanel } from "./ContextPanel";
import { GeminiAssistant } from "./GeminiAssistant";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useTeacherExperience } from "../context/TeacherExperienceContext";
import { useWorkspacePreferences } from "../context/WorkspacePreferencesContext";
import { ToolEntryGuidance } from "../features/tools/ToolEntryGuidance";

export function AppShell() {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { preferences: workspacePreferences, updatePreferences: updateWorkspacePreferences } = useWorkspacePreferences();
  const collapsed = workspacePreferences.sidebar_collapsed;
  const [searchOpen, setSearchOpen] = useState(false);
  const { refresh: refreshTeacherExperience } = useTeacherExperience();
  const contextAvailable = /^\/dashboard\/(planificamos|tutoria)\/.+/.test(pathname);
  const [compactLayout, setCompactLayout] = useState(() => window.innerWidth < 1450);
  const contextOpen = !compactLayout && workspacePreferences.context_panel_open;
  useEffect(() => {
    void refreshTeacherExperience();
  }, [refreshTeacherExperience]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); } };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    const compact = window.matchMedia("(max-width: 1449px)");
    const syncLayout = (event: MediaQueryListEvent) => {
      setCompactLayout(event.matches || window.innerWidth < 1450);
    };
    compact.addEventListener("change", syncLayout);
    return () => compact.removeEventListener("change", syncLayout);
  }, []);
  useEffect(() => {
    if (!sidebarOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = previous; };
  }, [sidebarOpen]);
  const toggleCollapsed = () => { void updateWorkspacePreferences({ sidebar_collapsed: !collapsed }); };
  const toggleContext = () => { void updateWorkspacePreferences({ context_panel_open: !contextOpen }); };
  return (
    <div className={`app-shell ${collapsed ? "app-shell--collapsed" : ""} ${contextAvailable && contextOpen ? "app-shell--context-open" : ""}`}>
      <Sidebar open={sidebarOpen} collapsed={collapsed} onClose={() => setSidebarOpen(false)} onToggleCollapse={toggleCollapsed} />
      {sidebarOpen ? <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú" /> : null}
      <Topbar onOpenMenu={() => setSidebarOpen(true)} onOpenSearch={() => setSearchOpen(true)} contextAvailable={contextAvailable} contextOpen={contextOpen} onToggleContext={toggleContext} />
      <div className="page-frame"><ToolEntryGuidance pathname={pathname} /><Outlet /></div>
      {contextAvailable && contextOpen ? <ContextPanel pathname={pathname} onClose={toggleContext} /> : null}
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <GeminiAssistant />
    </div>
  );
}

import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";

import { CommandPalette } from "./CommandPalette";
import { ContextPanel } from "./ContextPanel";
import { GeminiAssistant } from "./GeminiAssistant";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell() {
  const { pathname } = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("avendia.sidebar") === "collapsed");
  const [searchOpen, setSearchOpen] = useState(false);
  const contextAvailable = /^\/dashboard\/(planificamos|tutoria)\/.+/.test(pathname);
  const [contextOpen, setContextOpen] = useState(() => window.innerWidth >= 1450 && localStorage.getItem("avendia.contextPanel") !== "closed");
  useEffect(() => {
    const handler = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); } };
    window.addEventListener("keydown", handler); return () => window.removeEventListener("keydown", handler);
  }, []);
  useEffect(() => {
    const compact = window.matchMedia("(max-width: 860px)");
    const syncLayout = (event: MediaQueryListEvent) => {
      if (event.matches) setContextOpen(false);
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
  const toggleCollapsed = () => setCollapsed((value) => { localStorage.setItem("avendia.sidebar", value ? "expanded" : "collapsed"); return !value; });
  const toggleContext = () => setContextOpen((value) => { localStorage.setItem("avendia.contextPanel", value ? "closed" : "open"); return !value; });
  return (
    <div className={`app-shell ${collapsed ? "app-shell--collapsed" : ""} ${contextAvailable && contextOpen ? "app-shell--context-open" : ""}`}>
      <Sidebar open={sidebarOpen} collapsed={collapsed} onClose={() => setSidebarOpen(false)} onToggleCollapse={toggleCollapsed} />
      {sidebarOpen ? <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú" /> : null}
      <Topbar onOpenMenu={() => setSidebarOpen(true)} onOpenSearch={() => setSearchOpen(true)} contextAvailable={contextAvailable} contextOpen={contextOpen} onToggleContext={toggleContext} />
      <div className="page-frame"><Outlet /></div>
      {contextAvailable && contextOpen ? <ContextPanel pathname={pathname} onClose={toggleContext} /> : null}
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <GeminiAssistant />
    </div>
  );
}

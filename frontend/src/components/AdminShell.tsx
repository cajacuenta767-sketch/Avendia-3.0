import {
  Bot,
  CircleGauge,
  FileText,
  GraduationCap,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Settings2,
  ShieldCheck,
  Sun,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { clearSession, readSessionUser, sessionUserInitials } from "../lib/session";
import { useWorkspacePreferences } from "../context/WorkspacePreferencesContext";
import { Brand } from "./Brand";

const adminNavItems = [
  { id: "summary", label: "Resumen", icon: CircleGauge },
  { id: "users", label: "Usuarios", icon: UsersRound },
  { id: "ai", label: "IA y créditos", icon: Bot },
  { id: "content", label: "Contenido", icon: FileText },
  { id: "audit", label: "Auditoría", icon: ShieldCheck },
  { id: "settings", label: "Configuración", icon: Settings2 },
];

export function AdminShell() {
  const [user, setUser] = useState(readSessionUser);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const currentTab = routerLocation.pathname === "/admin/utilidades" ? "utilities" : searchParams.get("tab") || "summary";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { preferences: workspacePreferences, updatePreferences: updateWorkspacePreferences } = useWorkspacePreferences();
  const collapsed = workspacePreferences.sidebar_collapsed;
  const dark = workspacePreferences.theme === "dark";

  useEffect(() => {
    const refresh = () => setUser(readSessionUser());
    window.addEventListener("avendia-user-updated", refresh);
    window.addEventListener("avendia-credits-updated", refresh);
    return () => {
      window.removeEventListener("avendia-user-updated", refresh);
      window.removeEventListener("avendia-credits-updated", refresh);
    };
  }, []);

  const toggleCollapsed = () => {
    void updateWorkspacePreferences({ sidebar_collapsed: !collapsed });
  };

  const handleSelectTab = (id: string) => {
    const next = new URLSearchParams(searchParams);
    if (id === "summary") {
      next.delete("tab");
    } else {
      next.set("tab", id);
    }
    navigate({ pathname: "/admin", search: next.toString() });
    setSidebarOpen(false);
  };

  const activeItem = currentTab === "utilities" ? { label: "Utilidades y comunidad", icon: FileText } : adminNavItems.find((item) => item.id === currentTab) ?? adminNavItems[0];

  return (
    <div className={`app-shell ${collapsed ? "app-shell--collapsed" : ""}`}>
      <aside className={`sidebar ${sidebarOpen ? "sidebar--open" : ""} ${collapsed ? "sidebar--collapsed" : ""}`} aria-label="Navegación administrativa">
        <div className="sidebar__header">
          <Brand />
          <button className="icon-button sidebar__mobile-close" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú">
            <PanelLeftClose />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Secciones de administración">
          {adminNavItems.map(({ id, label, icon: Icon }) => {
            const isActive = currentTab === id;
            return (
              <button
                key={id}
                type="button"
                className={`nav-item ${isActive ? "nav-item--active" : ""}`}
                onClick={() => handleSelectTab(id)}
                title={collapsed ? label : undefined}
              >
                <Icon aria-hidden="true" />
                <span>{label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar__separator" />

        <nav className="sidebar__nav sidebar__nav--utility" aria-label="Cambio de espacio">
          <Link to="/admin/utilidades" className="nav-item" title="Utilidades y comunidad"><FileText aria-hidden="true" /><span>Utilidades y comunidad</span></Link>
          <Link
            to="/dashboard"
            className="nav-item"
            title={collapsed ? "Volver al Espacio Docente" : undefined}
          >
            <GraduationCap aria-hidden="true" />
            <span>Espacio Docente</span>
          </Link>
        </nav>

        <div className="sidebar__account">
          <div className="sidebar-profile" title={collapsed ? "Administrador" : undefined}>
            <span className="profile-button__avatar">{sessionUserInitials(user)}</span>
            <span>
              <strong>{user.full_name}</strong>
              <small>Administrador</small>
            </span>
          </div>
          <div className="sidebar__account-actions">
            <button
              className="icon-button"
              aria-label="Cerrar sesión"
              onClick={() => {
                clearSession();
                location.assign("/login");
              }}
            >
              <LogOut />
            </button>
          </div>
        </div>

        <button className="sidebar__collapse" onClick={toggleCollapsed} aria-label={collapsed ? "Expandir menú" : "Contraer menú"}>
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          <span>{collapsed ? "" : "Contraer menú"}</span>
        </button>
      </aside>

      {sidebarOpen ? <button className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú" /> : null}

      <header className="topbar">
        <button className="icon-button topbar__menu" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
          <Menu />
        </button>
        <div className="topbar__identity">
          <div className="topbar__title">
            <small>Panel de Administración</small>
            <strong>{activeItem.label}</strong>
          </div>
        </div>
        <div className="topbar__actions">
          <button
            className="icon-button topbar-theme-toggle"
            onClick={() => void updateWorkspacePreferences({ theme: dark ? "light" : "dark" })}
            aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}
          >
            {dark ? <Sun /> : <Moon />}
          </button>
          <button
            className="admin-button admin-button--secondary"
            onClick={() => navigate("/dashboard")}
            style={{ minHeight: "36px", height: "36px", gap: "6px" }}
          >
            <GraduationCap style={{ width: 16 }} />
            <span>Volver a Espacio Docente</span>
          </button>
        </div>
      </header>

      <div className="page-frame">
        <Outlet />
      </div>
    </div>
  );
}

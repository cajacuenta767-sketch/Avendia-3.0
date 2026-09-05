import { Coins, LogOut, PanelLeftClose, PanelLeftOpen, Settings, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import { primaryNavigation, utilityNavigation } from "../config/tools";
import { apiRequest } from "../lib/api";
import { readSessionUser, sessionUserInitials, type SessionUser } from "../lib/session";
import { Brand } from "./Brand";

type SidebarProps = { open: boolean; collapsed: boolean; onClose: () => void; onToggleCollapse: () => void };

export function Sidebar({ open, collapsed, onClose, onToggleCollapse }: SidebarProps) {
  const [user, setUser] = useState(readSessionUser);

  useEffect(() => {
    const token = sessionStorage.getItem("avendia.accessToken");
    if (!token) return;
    const refreshUser = async () => {
      try {
        const nextUser = await apiRequest<SessionUser>("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        sessionStorage.setItem("avendia.user", JSON.stringify(nextUser));
        setUser(nextUser);
      } catch {
        // Mantiene la última sesión válida si la API está reiniciándose.
      }
    };
    refreshUser();
    window.addEventListener("avendia-credits-updated", refreshUser);
    window.addEventListener("avendia-user-updated", refreshUser);
    return () => {
      window.removeEventListener("avendia-credits-updated", refreshUser);
      window.removeEventListener("avendia-user-updated", refreshUser);
    };
  }, []);
  return (
    <aside className={`sidebar ${open ? "sidebar--open" : ""} ${collapsed ? "sidebar--collapsed" : ""}`} aria-label="Navegación principal">
      <div className="sidebar__header">
        <Brand />
        <button className="icon-button sidebar__mobile-close" onClick={onClose} aria-label="Cerrar menú"><PanelLeftClose /></button>
      </div>
      <div className="sidebar__scroll" tabIndex={0} aria-label="Opciones de navegación desplazables">
        <nav className="sidebar__nav" aria-label="Módulos">
          {primaryNavigation.map(({ title, path, icon: Icon }) => (
            <NavLink className={({ isActive }) => `nav-item ${isActive ? "nav-item--active" : ""}`} to={path} key={path} onClick={onClose} title={collapsed ? title : undefined} end={path === "/dashboard"}>
              <Icon aria-hidden="true" /><span>{title}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar__separator" />
        <nav className="sidebar__nav sidebar__nav--utility" aria-label="Utilidades">
          {utilityNavigation.map(({ title, path, icon: Icon }) => (
            <NavLink className={({ isActive }) => `nav-item ${isActive ? "nav-item--active" : ""}`} to={path} key={path} onClick={onClose} title={collapsed ? title : undefined}>
              <Icon aria-hidden="true" /><span>{title}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="sidebar__account">
        <NavLink to="/dashboard/perfil" className="sidebar-profile" title={collapsed ? "Perfil" : undefined}>
          <span className="profile-button__avatar">{sessionUserInitials(user)}</span><span><strong>{user.full_name}</strong><small>{user.role === "admin" ? "Administrador · Control total" : "Docente · Profesional"}</small></span>
        </NavLink>
        <div className="sidebar__account-actions">
          <NavLink to="/dashboard/configuracion" className="icon-button" aria-label="Configuración"><Settings /></NavLink>
          <button className="icon-button" aria-label="Cerrar sesión" onClick={() => { sessionStorage.removeItem("avendia.accessToken"); location.assign("/login"); }}><LogOut /></button>
        </div>
      </div>
      {!collapsed ? <div className="sidebar-credits"><Coins /><span><small>Créditos IA</small><strong>{(user.ai_credits_balance ?? 0).toLocaleString("es-PE")}</strong></span>{user.role === "admin" ? <NavLink to="/admin" title="Abrir centro de administración"><ShieldCheck /></NavLink> : null}</div> : null}
      <button className="sidebar__collapse" onClick={onToggleCollapse} aria-label={collapsed ? "Expandir menú" : "Contraer menú"}>
        {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}<span>{collapsed ? "" : "Contraer menú"}</span>
      </button>
    </aside>
  );
}

import { Accessibility, ArrowLeft, Bell, Menu, Moon, PanelRightClose, PanelRightOpen, Search, ShieldCheck, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getToolByPath, modules, primaryNavigation, utilityNavigation } from "../config/tools";
import { useFontSize } from "../context/FontSizeContext";
import { readSessionUser, sessionUserInitials } from "../lib/session";
import { useDashboardActivity } from "../features/dashboard/dashboardActivity";
import { NotificationFeed } from "../features/utilities/NotificationFeed";
import { useQuery } from "@tanstack/react-query";
import { utilityApi, utilityKey } from "../features/utilities/api";
import { useTeacherExperience } from "../context/TeacherExperienceContext";
import { useWorkspacePreferences } from "../context/WorkspacePreferencesContext";

function pageTitle(path: string) {
  return getToolByPath(path)?.title
    ?? [...primaryNavigation, ...utilityNavigation].find((item) => item.path === path)?.title
    ?? modules.find((item) => path.startsWith(item.path))?.title
    ?? (path.endsWith("perfil") ? "Perfil" : path.endsWith("configuracion") ? "Configuración" : "Avendia");
}

type TopbarProps = {
  onOpenMenu: () => void;
  onOpenSearch: () => void;
  contextAvailable?: boolean;
  contextOpen?: boolean;
  onToggleContext?: () => void;
};

export function Topbar({ onOpenMenu, onOpenSearch, contextAvailable = false, contextOpen = false, onToggleContext }: TopbarProps) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(readSessionUser);
  const { fontScale, setFontScale } = useFontSize();
  const { preferences, updatePreferences } = useTeacherExperience();
  const { preferences: workspacePreferences, updatePreferences: updateWorkspacePreferences } = useWorkspacePreferences();
  const dark = workspacePreferences.theme === "dark";
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { activity } = useDashboardActivity();
  const accountNotifications = useQuery({ queryKey: utilityKey("notifications", 1), queryFn: ({ signal }) => utilityApi<{ unread: number }>("/notifications?page=1", "GET", undefined, signal), refetchInterval: 60000 });
  const notificationCount = activity.notifications.length + (accountNotifications.data?.unread ?? 0);
  useEffect(() => {
    const refresh = () => setUser(readSessionUser());
    window.addEventListener("avendia-user-updated", refresh);
    window.addEventListener("avendia-credits-updated", refresh);
    return () => {
      window.removeEventListener("avendia-user-updated", refresh);
      window.removeEventListener("avendia-credits-updated", refresh);
    };
  }, []);
  return (
    <header className="topbar">
      <button className="icon-button topbar__menu" onClick={onOpenMenu} aria-label="Abrir menú"><Menu /></button>
      <div className="topbar__identity">
        {pathname !== "/dashboard" ? <button className="icon-button topbar__back" onClick={() => navigate(-1)} aria-label="Volver a la página anterior" title="Volver"><ArrowLeft /></button> : null}
        <div className="topbar__title"><small>Espacio docente</small><strong>{pageTitle(pathname)}</strong></div>
      </div>
      <div className="topbar__actions">
        {user.role === "admin" ? (
          <button
            className="search-trigger topbar-admin-link"
            onClick={() => navigate("/admin")}
            title="Abrir panel de administración"
          >
            <ShieldCheck />
            <span>Panel Admin</span>
          </button>
        ) : null}
        <button className="search-trigger" onClick={onOpenSearch}><Search /><span>Buscar herramientas</span><kbd>Ctrl K</kbd></button>
        <div className="font-size-control" role="group" aria-label="Tamaño del texto">
          <button className={fontScale === 87.5 ? "is-active" : ""} onClick={() => setFontScale(87.5)} title="Texto más pequeño" aria-pressed={fontScale === 87.5}>A−</button>
          <button className={fontScale === 100 ? "is-active" : ""} onClick={() => setFontScale(100)} title="Texto normal" aria-pressed={fontScale === 100}>A</button>
          <button className={fontScale === 112.5 ? "is-active" : ""} onClick={() => setFontScale(112.5)} title="Texto más grande" aria-pressed={fontScale === 112.5}>A+</button>
        </div>
        <button
          className={`icon-button topbar-comfort-toggle ${preferences.comfortable_spacing ? "is-active" : ""}`}
          onClick={() => void updatePreferences({ comfortable_spacing: !preferences.comfortable_spacing })}
          aria-label={preferences.comfortable_spacing ? "Desactivar modo cómodo" : "Activar modo cómodo"}
          aria-pressed={preferences.comfortable_spacing}
          title="Modo cómodo: controles y espacios más grandes"
        ><Accessibility /></button>
        {contextAvailable ? <button className={`icon-button topbar-context-toggle ${contextOpen ? "is-active" : ""}`} onClick={onToggleContext} aria-label={contextOpen ? "Ocultar panel contextual" : "Mostrar panel contextual"} title="Panel de calendario y actividad">{contextOpen ? <PanelRightClose /> : <PanelRightOpen />}</button> : null}
        <button className="icon-button topbar-theme-toggle" onClick={() => void updateWorkspacePreferences({ theme: dark ? "light" : "dark" })} aria-label={dark ? "Activar modo claro" : "Activar modo oscuro"}>{dark ? <Sun /> : <Moon />}</button>
        <button className="icon-button notification-button" aria-label="Notificaciones" onClick={() => setNotificationsOpen((value) => !value)}><Bell />{notificationCount ? <span>{notificationCount}</span> : null}</button>
        <button className="topbar-avatar" onClick={() => navigate("/dashboard/perfil")} title={user.full_name} aria-label="Abrir perfil">{sessionUserInitials(user)}</button>
      </div>
      {notificationsOpen ? <section className="notifications-panel" style={{ maxHeight: "70dvh", overflowY: "auto" }}><strong>Notificaciones</strong><NotificationFeed close={() => setNotificationsOpen(false)} />{activity.notifications.length ? <><strong>Recordatorios de trabajo</strong>{activity.notifications.map((notification) => <button type="button" key={notification.id} onClick={() => { setNotificationsOpen(false); navigate(notification.path); }}>{notification.message}</button>)}</> : null}</section> : null}
    </header>
  );
}

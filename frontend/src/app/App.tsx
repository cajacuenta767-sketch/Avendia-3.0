import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AdminShell } from "../components/AdminShell";
import { AppShell } from "../components/AppShell";
import { RouteScrollManager } from "../components/RouteScrollManager";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { LoginPage } from "../features/auth/LoginPage";
import { ModulePage } from "../features/tools/ModulePage";
import { apiRequest } from "../lib/api";
import { readAccessToken, readStoredSessionUser, updateStoredSessionUser, type SessionUser } from "../lib/session";

const CalendarPage = lazy(() => import("../features/calendar/CalendarPage").then((module) => ({ default: module.CalendarPage })));
const RegisterPage = lazy(() => import("../features/auth/RegisterPage").then((module) => ({ default: module.RegisterPage })));
const ToolWorkspace = lazy(() => import("../features/tools/ToolWorkspace").then((module) => ({ default: module.ToolWorkspace })));
const UtilityPage = lazy(() => import("../features/tools/UtilityPage").then((module) => ({ default: module.UtilityPage })));
const HistoryPage = lazy(() => import("../features/tools/HistoryPage").then((module) => ({ default: module.HistoryPage })));
const ProfilePage = lazy(() => import("../features/tools/ProfilePage").then((module) => ({ default: module.ProfilePage })));
const WordGroupingTool = lazy(() => import("../features/tools/WordGroupingTool").then((module) => ({ default: module.WordGroupingTool })));
const SequenceOrderingTool = lazy(() => import("../features/tools/SequenceOrderingTool").then((module) => ({ default: module.SequenceOrderingTool })));
const IdeasPage = lazy(() => import("../features/utilities/IdeasPage").then((module) => ({ default: module.IdeasPage })));
const TutorialsPage = lazy(() => import("../features/utilities/TutorialsPage").then((module) => ({ default: module.TutorialsPage })));
const ReferralsPage = lazy(() => import("../features/utilities/ReferralsPage").then((module) => ({ default: module.ReferralsPage })));
const CommunityPage = lazy(() => import("../features/utilities/CommunityPage").then((module) => ({ default: module.CommunityPage })));
const UtilitiesAdminPage = lazy(() => import("../features/utilities/UtilitiesAdminPage").then((module) => ({ default: module.UtilitiesAdminPage })));
const AdminControlCenterPage = lazy(() => import("../features/admin/AdminControlCenterPage").then((module) => ({ default: module.AdminControlCenterPage })));
const PresentationTool = lazy(() => import("../features/tools/PresentationTool").then((module) => ({ default: module.PresentationTool })));
const RosterPage = lazy(() => import("../features/rosters/RosterPage").then((module) => ({ default: module.RosterPage })));

function RequireSession({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const [session, setSession] = useState<"checking" | "authenticated" | "anonymous">(() => readAccessToken() ? "checking" : "anonymous");
  const [user, setUser] = useState<SessionUser | null>(() => readStoredSessionUser());

  useEffect(() => {
    const expire = () => {
      setUser(null);
      setSession("anonymous");
    };
    window.addEventListener("avendia-session-expired", expire);
    return () => window.removeEventListener("avendia-session-expired", expire);
  }, []);

  useEffect(() => {
    if (session !== "checking") return;
    const controller = new AbortController();
    void apiRequest<SessionUser>("/users/me", { signal: controller.signal })
      .then((verifiedUser) => {
        updateStoredSessionUser(verifiedUser);
        setUser(verifiedUser);
        setSession("authenticated");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setSession("anonymous");
      });
    return () => controller.abort();
  }, [session]);

  if (session === "checking") return <div className="admin-state" role="status">Verificando tu sesión…</div>;
  if (session === "anonymous") return <Navigate to="/login" replace />;
  if (admin && user?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

export function App() {
  return (
    <><RouteScrollManager /><Suspense fallback={<div className="admin-state" role="status">Cargando…</div>}><Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route path="/dashboard" element={<RequireSession><AppShell /></RequireSession>}>
        <Route index element={<DashboardPage />} />
        <Route path="calendario" element={<CalendarPage />} />
        <Route path="mis-estudiantes" element={<Suspense fallback={<div className="roster-load-state">Cargando tus estudiantes…</div>}><RosterPage /></Suspense>} />
        <Route path="recursos/presentaciones-didacticas" element={<Suspense fallback={<div className="admin-state">Cargando editor de presentaciones…</div>}><PresentationTool /></Suspense>} />
        <Route path="recursos/agrupar-palabras" element={<WordGroupingTool />} />
        <Route path="recursos/ordenar-bloques" element={<SequenceOrderingTool />} />
        <Route path=":moduleId" element={<ModulePage />} />
        <Route path=":moduleId/:toolId" element={<ToolWorkspace />} />
        <Route path="videos-tutorial" element={<TutorialsPage />} />
        <Route path="historial" element={<HistoryPage />} />
        <Route path="ideas" element={<IdeasPage />} />
        <Route path="sube-tu-formato" element={<UtilityPage />} />
        <Route path="referidos" element={<ReferralsPage />} />
        <Route path="comunidad-activa" element={<CommunityPage />} />
        <Route path="perfil" element={<ProfilePage />} />
        <Route path="configuracion" element={<UtilityPage />} />
      </Route>
      <Route path="/admin" element={<RequireSession admin><AdminShell /></RequireSession>}>
        <Route path="utilidades" element={<UtilitiesAdminPage />} />
        <Route index element={<Suspense fallback={<div className="admin-state">Cargando centro de control…</div>}><AdminControlCenterPage /></Suspense>} />
        <Route path="tokens" element={<Navigate to="/admin" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes></Suspense></>
  );
}

import { lazy, Suspense, useEffect, useState, type ReactNode } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AdminShell } from "../components/AdminShell";
import { AppShell } from "../components/AppShell";
import { RouteScrollManager } from "../components/RouteScrollManager";
import { CalendarPage } from "../features/calendar/CalendarPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import { LoginPage } from "../features/auth/LoginPage";
import { RegisterPage } from "../features/auth/RegisterPage";
import { ModulePage } from "../features/tools/ModulePage";
import { ToolWorkspace } from "../features/tools/ToolWorkspace";
import { UtilityPage } from "../features/tools/UtilityPage";
import { HistoryPage } from "../features/tools/HistoryPage";
import { ProfilePage } from "../features/tools/ProfilePage";
import { WordGroupingTool } from "../features/tools/WordGroupingTool";
import { SequenceOrderingTool } from "../features/tools/SequenceOrderingTool";
import { apiRequest } from "../lib/api";
import { readAccessToken, readStoredSessionUser, updateStoredSessionUser, type SessionUser } from "../lib/session";
import { IdeasPage } from "../features/utilities/IdeasPage";
import { TutorialsPage } from "../features/utilities/TutorialsPage";
import { ReferralsPage } from "../features/utilities/ReferralsPage";
import { CommunityPage } from "../features/utilities/CommunityPage";
import { UtilitiesAdminPage } from "../features/utilities/UtilitiesAdminPage";

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
    <><RouteScrollManager /><Routes>
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
    </Routes></>
  );
}

import { Bot, Coins, LoaderCircle, RefreshCw, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { apiRequest } from "../../lib/api";
import { readSessionUser } from "../../lib/session";

type Summary = { users_total: number; credits_available: number; credits_assigned: number; tokens_consumed: number; generations: number };
type Account = { id: string; full_name: string; email: string; role: string; is_active: boolean; ai_credits_balance: number; ai_credits_total: number; ai_tokens_consumed: number; ai_generations: number; created_at: string };

export function AdminTokensPage() {
  const user = readSessionUser();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    const token = sessionStorage.getItem("avendia.accessToken");
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const [nextSummary, nextAccounts] = await Promise.all([
        apiRequest<Summary>("/admin/ai-usage/summary", { headers }),
        apiRequest<Account[]>("/admin/ai-usage/accounts", { headers }),
      ]);
      setSummary(nextSummary); setAccounts(nextAccounts);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo cargar el panel.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (user.role !== "admin") return;
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, [load, user.role]);

  if (user.role !== "admin") return <Navigate to="/dashboard" replace />;

  async function adjust(account: Account, amount: number) {
    const token = sessionStorage.getItem("avendia.accessToken");
    setUpdating(account.id); setError("");
    try {
      await apiRequest(`/admin/ai-usage/accounts/${account.id}`, { method: "PATCH", headers: token ? { Authorization: `Bearer ${token}` } : undefined, body: JSON.stringify({ amount, reason: "Ajuste manual desde el panel de administración" }) });
      await load();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo ajustar el saldo.");
    } finally { setUpdating(""); }
  }

  return <main className="admin-usage-page"><div className="admin-usage-shell">
    <header className="admin-usage-header"><div><span><ShieldCheck /> Administración</span><h1>Créditos y consumo de Gemini</h1><p>Supervisa el saldo, las generaciones y el consumo aproximado de cada cuenta.</p></div><button className="secondary-button" onClick={load} disabled={loading}><RefreshCw className={loading ? "is-spinning" : ""} /> Actualizar</button></header>
    {error ? <p className="admin-usage-error">{error}</p> : null}
    <section className="admin-usage-kpis">
      <article><UsersRound /><span><small>Usuarios</small><strong>{summary?.users_total ?? "—"}</strong></span></article>
      <article><Coins /><span><small>Créditos disponibles</small><strong>{summary?.credits_available.toLocaleString("es-PE") ?? "—"}</strong></span></article>
      <article><Bot /><span><small>Tokens consumidos</small><strong>{summary?.tokens_consumed.toLocaleString("es-PE") ?? "—"}</strong></span></article>
      <article><Sparkles /><span><small>Generaciones</small><strong>{summary?.generations.toLocaleString("es-PE") ?? "—"}</strong></span></article>
    </section>
    <section className="admin-usage-table"><header><div><h2>Cuentas docentes</h2><p>Los ajustes positivos suman al total asignado; nunca se permite un saldo negativo.</p></div></header>{loading ? <div className="admin-usage-loading"><LoaderCircle /> Cargando cuentas…</div> : <div className="admin-usage-scroll"><table><thead><tr><th>Cuenta</th><th>Rol</th><th>Saldo</th><th>Total asignado</th><th>Tokens</th><th>Generaciones</th><th>Ajustar</th></tr></thead><tbody>{accounts.map((account) => <tr key={account.id}><td><strong>{account.full_name}</strong><small>{account.email}</small></td><td><span className={`role-pill role-pill--${account.role}`}>{account.role === "admin" ? "Administrador" : "Docente"}</span></td><td><strong>{account.ai_credits_balance.toLocaleString("es-PE")}</strong></td><td>{account.ai_credits_total.toLocaleString("es-PE")}</td><td>{account.ai_tokens_consumed.toLocaleString("es-PE")}</td><td>{account.ai_generations}</td><td><div className="credit-actions"><button disabled={updating === account.id} onClick={() => adjust(account, -500)}>−500</button><button disabled={updating === account.id} onClick={() => adjust(account, 500)}>+500</button><button disabled={updating === account.id} onClick={() => adjust(account, 1000)}>+1.000</button></div></td></tr>)}</tbody></table></div>}</section>
  </div></main>;
}

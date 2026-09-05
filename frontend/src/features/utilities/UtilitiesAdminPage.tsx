import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { errorText, utilityApi, utilityKey } from "./api";
import "./utilities.css";

const modules = [
  { key: "documents", name: "Historial", path: "/dashboard/historial", detail: "Documentos registrados; el contenido privado sigue limitado a su propietario." },
  { key: "templates", name: "Sube tu formato", path: "/dashboard/sube-tu-formato", detail: "Formatos almacenados; abre tu biblioteca privada para clasificarlos." },
  { key: "tutorials", name: "Videos tutoriales", path: "/dashboard/videos-tutorial", detail: "Gestiona el catálogo y publica o retira videos." },
  { key: "ideas", name: "Ideas y mejoras", path: "/dashboard/ideas", detail: "Responde propuestas y actualiza su estado." },
  { key: "referrals", name: "Referidos", path: "/dashboard/referidos", detail: "Configura las reglas y revisa invitaciones pendientes." },
  { key: "community", name: "Comunidad activa", path: "/dashboard/comunidad-activa", detail: "Revisa publicaciones y registra decisiones de moderación." },
];

export function UtilitiesAdminPage() {
  const query = useQuery({ queryKey: utilityKey("overview"), queryFn: ({ signal }) => utilityApi<Record<string, number>>("/admin/utilities/overview", "GET", undefined, signal) });
  const max = Math.max(1, ...modules.map(m => query.data?.[m.key] ?? 0));
  return <main className="content-page utilities-page"><header className="simple-heading"><h1>Utilidades y comunidad</h1><p>Indicadores agregados de las seis herramientas y acceso a su gestión.</p></header>{query.isPending ? <p>Cargando indicadores…</p> : query.isError ? <p role="alert">{errorText(query.error)} <button onClick={() => void query.refetch()}>Reintentar</button></p> : <><section className="utility-panel"><h2>Pendientes y resultados</h2><p>{query.data.ideas_waiting} propuestas recibidas · {query.data.referrals_waiting} invitaciones por revisar</p><p>{query.data.tutorials_completed} tutoriales completados · {query.data.referral_credits} créditos concedidos por referidos</p><p>{(query.data.template_bytes/1024/1024).toFixed(2)} MB de formatos almacenados</p></section><section className="utilities-grid">{modules.map(m => <article className="utility-panel" key={m.key}><h2>{m.name}</h2><p><strong>{query.data[m.key]}</strong> registros totales</p><meter aria-label={`Registros de ${m.name}`} min={0} max={max} value={query.data[m.key]} style={{width:"100%"}} /><p>{m.detail}</p><Link className="secondary-button" to={m.path}>Abrir {m.name}</Link></article>)}</section></>}</main>;
}

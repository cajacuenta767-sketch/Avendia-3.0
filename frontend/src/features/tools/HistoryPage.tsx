import {
  CalendarClock,
  Cloud,
  Copy,
  Download,
  ExternalLink,
  FileText,
  HardDrive,
  LoaderCircle,
  Link2,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { tools } from "../../config/tools";
import { ApiError, apiRequest } from "../../lib/api";
import {
  archiveEvaluationInstrument,
  restoreEvaluationInstrument,
} from "../evaluations/source-documents/evaluationApi";
import type { EvaluationInstrument } from "../evaluations/source-documents/evaluationContracts";
import { DocumentControls, DocumentTrash } from "../utilities/DocumentControls";
import { UtilityHero } from "../utilities/UtilityHero";
import { useUtilitySummary } from "../utilities/useUtilitySummary";
import { sessionDraftScope } from "../../lib/session";
import "../utilities/utilities.css";
type EvaluationSummary = Pick<EvaluationInstrument, "id" | "title" | "kind" | "status" | "created_at" | "updated_at">;

type ServerDocument = {
  revision: number;
  favorite: boolean;
  id: string;
  title: string;
  document_type: string;
  status: string;
  content: string | null;
  metadata_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type HistoryItem = {
  id: string;
  title: string;
  type: string;
  status: string;
  updatedAt: string;
  route: string;
  content: string;
  source: "cloud" | "device";
  storageKey?: string;
  server?: ServerDocument;
  evaluation?: EvaluationSummary;
  reference?: { title: string; documentId: string; fields: string[] };
};

const evaluationRoutes: Record<string, string> = {
  checklist: "/dashboard/evaluamos/lista-cotejo",
  rubric: "/dashboard/evaluamos/rubrica-evaluacion",
  observation: "/dashboard/evaluamos/ficha-observacion",
  recovery: "/dashboard/evaluamos/carpetas-recuperacion",
  auxiliary_record: "/dashboard/evaluamos/registros-auxiliares",
  learning_sheet: "/dashboard/evaluamos/ficha-aprendizaje",
  text_questions: "/dashboard/evaluamos/preguntas-texto",
};

function toolFor(documentType: string, route = "") {
  return tools.find((tool) => `${tool.module}/${tool.id}` === documentType || tool.id === documentType || tool.path === route);
}

function localDrafts(): HistoryItem[] {
  const items: HistoryItem[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const storageKey = localStorage.key(index);
    if (!storageKey?.startsWith("avendia.draft.")) continue;
    if (!storageKey.endsWith(`.${sessionDraftScope()}`)) continue;
    try {
      const draft = JSON.parse(localStorage.getItem(storageKey) ?? "{}") as Record<string, unknown>;
      if (typeof draft.documentId === "string" && draft.documentId) continue;
      const workflowMatch = storageKey.match(/^avendia\.draft\.workflow\.(.+?)\.v2\./);
      let workflowKey = workflowMatch?.[1] ?? "";
      if (!workflowKey) {
        if (storageKey.includes("presentaciones-didacticas")) workflowKey = "recursos/presentaciones-didacticas";
        else if (storageKey.includes("agrupar-palabras")) workflowKey = "recursos/agrupar-palabras";
        else if (storageKey.includes("ordenar-bloques")) workflowKey = "recursos/ordenar-bloques";
      }
      const artifact = draft.artifact && typeof draft.artifact === "object" ? draft.artifact as Record<string, unknown> : null;
      const result = draft.result && typeof draft.result === "object" ? draft.result as Record<string, unknown> : null;
      const matchedTool = toolFor(workflowKey);
      const title = String(artifact?.document_title ?? result?.presentation_title ?? result?.activity_title ?? matchedTool?.title ?? "Borrador docente");
      const content = artifact || result ? JSON.stringify(artifact ?? result, null, 2) : "Borrador en preparación";
      items.push({
        id: storageKey,
        title,
        type: matchedTool?.title ?? (workflowKey.replace("/", " · ") || "Documento docente"),
        status: artifact || result ? "Generado" : "En preparación",
        updatedAt: String(draft.updatedAt ?? ""),
        route: matchedTool?.path ?? "",
        content,
        source: "device",
        storageKey,
      });
    } catch {
      // Un borrador dañado no debe bloquear el historial completo.
    }
  }
  return items;
}

function asItem(document: ServerDocument): HistoryItem {
  const sourceRoute = typeof document.metadata_json.source_route === "string" ? document.metadata_json.source_route : "";
  const matchedTool = toolFor(document.document_type, sourceRoute);
  return {
    id: document.id,
    title: document.title,
    type: matchedTool?.title ?? document.document_type.replace("/", " · "),
    status: document.status === "completed" ? "Completado" : document.status === "archived" ? "Archivado" : "Borrador",
    updatedAt: document.updated_at,
    route: matchedTool?.path || sourceRoute || "",
    content: document.content ?? "",
    source: "cloud",
    server: document,
    reference: document.metadata_json.reference && typeof document.metadata_json.reference === "object"
      ? document.metadata_json.reference as HistoryItem["reference"]
      : undefined,
  };
}

function asEvaluationItem(instrument: EvaluationSummary): HistoryItem {
  const route = evaluationRoutes[instrument.kind] ?? "";
  return {
    id: instrument.id,
    title: instrument.title,
    type: toolFor(`evaluamos/${instrument.kind}`)?.title ?? "Evaluamos · instrumento docente",
    status: instrument.status === "generated" ? "Generado" : instrument.status === "archived" ? "Archivado" : "Borrador",
    updatedAt: instrument.updated_at ?? instrument.created_at ?? "",
    route,
    content: instrument.title,
    source: "cloud",
    evaluation: instrument,
  };
}

function downloadText(item: HistoryItem) {
  const blob = new Blob([item.content || item.title], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${item.title.replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ -]/g, "").trim() || "documento-avendia"}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function HistoryPage() {
  const summary = useUtilitySummary();
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [serverItems, setServerItems] = useState<HistoryItem[]>([]);
  const [deviceItems, setDeviceItems] = useState<HistoryItem[]>(localDrafts);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState<"all" | "cloud" | "device">("all");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [pendingDelete, setPendingDelete] = useState<HistoryItem | null>(null);
  const [message, setMessage] = useState("");

  const refreshServer = useCallback(async (signal?: AbortSignal) => {
    const token = sessionStorage.getItem("avendia.accessToken");
    if (!token) return;
    setLoading(true);
    try {
      const result = await apiRequest<{ total: number; documents: ServerDocument[]; instruments: EvaluationSummary[] }>(`/history/feed?page=${page}&q=${encodeURIComponent(query)}&state=${encodeURIComponent(status)}&favorite=${favoritesOnly}`, { headers: { Authorization: `Bearer ${token}` }, signal });
      if (!signal?.aborted) { setServerItems([...result.documents.map(asItem), ...result.instruments.map(asEvaluationItem)]); setTotal(result.total); }
    } catch (error) {
      if (signal?.aborted) return;
      setMessage(error instanceof ApiError ? error.message : "No se pudo sincronizar el historial.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, query, status, favoritesOnly]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => { void refreshServer(controller.signal); }, 250);
    return () => { controller.abort(); window.clearTimeout(timeout); };
  }, [refreshServer]);

  const items = useMemo(() => [...serverItems, ...(favoritesOnly ? [] : deviceItems)]
    .filter((item) => source === "all" || item.source === source)
    .filter((item) => status === "all" || item.status === status)
    .filter((item) => `${item.title} ${item.type}`.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((left, right) => (right.updatedAt || "").localeCompare(left.updatedAt || "")), [deviceItems, query, serverItems, source, status, favoritesOnly]);

  const duplicate = async (item: HistoryItem) => {
    const token = sessionStorage.getItem("avendia.accessToken");
    if (!token || !item.server) return;
    setWorkingId(item.id);
    try {
      await apiRequest("/documents", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: `Copia de ${item.server.title}`.slice(0, 240),
          document_type: item.server.document_type,
          content: item.server.content,
          metadata: { ...item.server.metadata_json, version: 1, duplicated_from: item.server.id },
        }),
      });
      await refreshServer();
      setMessage("Copia creada en tu historial.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "No se pudo duplicar el documento.");
    } finally {
      setWorkingId("");
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    const item = pendingDelete;
    setPendingDelete(null);
    setWorkingId(item.id);
    try {
      if (item.source === "device" && item.storageKey) {
        localStorage.removeItem(item.storageKey);
        setDeviceItems(localDrafts());
      } else if (item.evaluation) {
        await archiveEvaluationInstrument(item.id);
        await refreshServer();
        setMessage("Instrumento archivado. Puedes restaurarlo cuando lo necesites.");
      } else {
        const token = sessionStorage.getItem("avendia.accessToken");
        if (!token) throw new Error("Sesión no disponible");
        await apiRequest(`/documents/${item.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
        setServerItems((current) => current.filter((entry) => entry.id !== item.id));
      }
      setMessage(item.server ? "Documento movido a la papelera; puedes recuperarlo." : "Cambio guardado en el historial.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "No se pudo eliminar el documento.");
    } finally {
      setWorkingId("");
    }
  };

  const restore = async (item: HistoryItem) => {
    if (!item.evaluation) return;
    setWorkingId(item.id);
    try {
      await restoreEvaluationInstrument(item.id);
      await refreshServer();
      setMessage("Instrumento restaurado en tu historial.");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "No se pudo restaurar el instrumento.");
    } finally {
      setWorkingId("");
    }
  };

  return <main className="history-page">
    <div className="utilities-actions"><button className="secondary-button" aria-pressed={favoritesOnly} onClick={() => { setFavoritesOnly(!favoritesOnly); setPage(1); }}>{favoritesOnly ? "Ver todos" : "Mis documentos favoritos"}</button>{source !== "device" ? <><span>{total} documentos sincronizados · página {page}</span><button className="secondary-button" disabled={page === 1 || loading} onClick={() => setPage(p => p-1)}>Anterior</button><button className="secondary-button" disabled={page*20 >= total || loading} onClick={() => setPage(p => p+1)}>Siguiente</button></> : null}</div>
    <button className="secondary-button" onClick={() => setShowTrash(!showTrash)} aria-expanded={showTrash}>{showTrash ? "Cerrar papelera" : "Abrir papelera"}</button>
    {showTrash ? <DocumentTrash refresh={refreshServer} /> : null}
    <UtilityHero eyebrow="BIBLIOTECA DOCENTE" title="Historial y borradores" description="Retoma, organiza, duplica y descarga todo lo que creaste con Avendia." metrics={[
      { label: "documentos sincronizados", value: summary.data?.history?.documents ?? "—" },
      { label: "documentos visibles", value: items.length },
    ]}><p className="utility-hero__hint">Usa filtros para encontrar tu trabajo. Los borradores de este dispositivo se distinguen de los documentos sincronizados.</p></UtilityHero>
    <section className="history-toolbar"><label><Search /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Buscar por título o herramienta" /></label><select value={source} onChange={(event) => setSource(event.target.value as typeof source)} aria-label="Filtrar por ubicación"><option value="all">Todas las ubicaciones</option><option value="cloud">Sincronizados</option><option value="device">Este dispositivo</option></select><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label="Filtrar por estado"><option value="all">Todos los estados</option>{["Borrador", "Completado", "Generado", "Archivado", "En preparación"].map((itemStatus) => <option key={itemStatus}>{itemStatus}</option>)}</select></section>
    {message ? <div className="history-notice" role="status"><span>{message}</span><button onClick={() => setMessage("")} aria-label="Cerrar"><X /></button></div> : null}
    {loading && !items.length ? <div className="history-loading"><LoaderCircle className="is-spinning" /> Sincronizando historial…</div> : null}
    <section className="history-list">{items.map((item) => <article className="history-card" key={`${item.source}-${item.id}`}><span className="history-card__icon"><FileText /></span><div className="history-card__main"><div className="history-card__meta"><span className={`history-source history-source--${item.source}`}>{item.source === "cloud" ? <Cloud /> : <HardDrive />}{item.source === "cloud" ? "Sincronizado" : "Este dispositivo"}</span><span>{item.status}</span></div><h2>{item.title}</h2><p>{item.type}</p>{item.reference ? <span className="history-card__reference"><Link2 /> Derivado de «{item.reference.title}» · {item.reference.fields.length} campos</span> : null}<small><CalendarClock /> {item.updatedAt ? new Date(item.updatedAt).toLocaleString("es-PE") : "Sin fecha de actualización"}</small></div><div className="history-card__actions">{item.server ? <DocumentControls document={item.server} refresh={refreshServer} /> : null}{item.route && item.status !== "Archivado" ? <Link className="primary-button" to={`${item.route}${item.source === "cloud" ? `?document=${item.id}` : ""}`}><ExternalLink /> Abrir</Link> : null}{!item.evaluation ? <button className="secondary-button" onClick={() => downloadText(item)}><Download /> Descargar</button> : null}{item.source === "cloud" && !item.evaluation ? <button className="secondary-button" onClick={() => duplicate(item)} disabled={workingId === item.id}>{workingId === item.id ? <LoaderCircle className="is-spinning" /> : <Copy />} Duplicar</button> : null}{item.evaluation && item.status === "Archivado" ? <button className="secondary-button" onClick={() => void restore(item)} disabled={workingId === item.id}>{workingId === item.id ? <LoaderCircle className="is-spinning" /> : <RotateCcw />} Restaurar</button> : null}{item.status !== "Archivado" ? <button className="history-delete" onClick={() => setPendingDelete(item)} disabled={workingId === item.id}><Trash2 /> {item.evaluation ? "Archivar" : "Eliminar"}</button> : null}</div></article>)}{!loading && !items.length ? <div className="history-empty"><FileText /><h2>No encontramos documentos</h2><p>Cambia los filtros o crea una herramienta nueva. Los borradores aparecerán aquí automáticamente.</p><Link className="primary-button" to="/dashboard">Ir al inicio</Link></div> : null}</section>
    {pendingDelete ? <div className="dialog-backdrop"><section className="history-confirm" role="dialog" aria-modal="true" aria-label="Confirmar eliminación"><span><Trash2 /></span><h2>¿{pendingDelete.evaluation ? "Archivar" : "Eliminar"} «{pendingDelete.title}»?</h2><p>{pendingDelete.evaluation ? "El instrumento se conservará y podrás restaurarlo después." : `Esta acción quitará el documento de ${pendingDelete.source === "cloud" ? "tu cuenta" : "este dispositivo"}.`}</p><footer><button className="secondary-button" onClick={() => setPendingDelete(null)}>Cancelar</button><button className="danger-button" onClick={() => void remove()}><Trash2 /> {pendingDelete.evaluation ? "Archivar" : "Eliminar"}</button></footer></section></div> : null}
  </main>;
}

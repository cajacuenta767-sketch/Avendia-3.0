import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { errorText, utilityApi, utilityKey, type Page } from "./api";

type Document = { id: string; title: string; revision: number; favorite: boolean };
type Version = { id: string; revision: number; title: string; content: string | null; created_at: string };

export function DocumentControls({ document, refresh }: { document: Document; refresh: () => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const [title, setTitle] = useState(document.title);
  const [restore, setRestore] = useState<Version | null>(null);
  const client = useQueryClient();
  const query = useQuery({ queryKey: utilityKey("versions", document.id), enabled: expanded, queryFn: ({ signal }) => utilityApi<Version[]>(`/documents/${document.id}/versions`, "GET", undefined, signal) });
  const mutation = useMutation({ mutationFn: ({ suffix = "", body }: { suffix?: string; body?: unknown }) => utilityApi(`/documents/${document.id}${suffix}`, suffix ? "POST" : "PATCH", body), onSuccess: async () => { await refresh(); await client.invalidateQueries({ queryKey: utilityKey("versions", document.id) }); setRestore(null); } });
  return <div style={{ width: "100%" }}><button className="secondary-button" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>Organizar · versión {document.revision}</button>{expanded ? <div className="utilities-form"><form onSubmit={e => { e.preventDefault(); mutation.mutate({ body: { title, expected_revision: document.revision } }); }}><label>Nombre del documento<input value={title} onChange={e => setTitle(e.target.value)} required minLength={3} maxLength={240} /></label><button className="secondary-button" disabled={mutation.isPending}>Renombrar</button></form><button className="secondary-button" disabled={mutation.isPending} aria-pressed={document.favorite} onClick={() => mutation.mutate({ body: { favorite: !document.favorite, expected_revision: document.revision } })}>{document.favorite ? "Quitar favorito" : "Guardar favorito"}</button><h3>Versiones anteriores</h3>{query.isPending ? <p>Cargando versiones…</p> : query.isError ? <p role="alert">{errorText(query.error)}</p> : query.data?.length ? query.data.map(v => <details key={v.id}><summary>Versión {v.revision} · {v.title}</summary><pre style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere", maxHeight: 240, overflow: "auto" }}>{v.content ?? "Sin contenido"}</pre><button className="secondary-button" onClick={() => setRestore(v)}>Restaurar como nueva versión</button></details>) : <p>Las versiones aparecerán después de guardar cambios.</p>}{restore ? <div role="alert"><p>¿Restaurar la versión {restore.revision}? Se conservará la versión actual.</p><button className="secondary-button" disabled={mutation.isPending} onClick={() => mutation.mutate({ suffix: `/versions/${restore.id}/restore` })}>Confirmar restauración</button><button className="secondary-button" onClick={() => setRestore(null)}>Cancelar</button></div> : null}</div> : null}{mutation.isError ? <p role="alert">{errorText(mutation.error)}</p> : null}</div>;
}

export function DocumentTrash({ refresh }: { refresh: () => Promise<void> }) {
  const [page, setPage] = useState(1);
  const client = useQueryClient();
  const query = useQuery({ queryKey: utilityKey("trash", page), queryFn: ({ signal }) => utilityApi<Page<Document>>(`/history?trashed=true&page=${page}`, "GET", undefined, signal) });
  const mutation = useMutation({ mutationFn: (id: string) => utilityApi(`/documents/${id}/recover`, "POST"), onSuccess: async () => { await client.invalidateQueries({ queryKey: utilityKey("trash") }); await refresh(); } });
  return <section className="utility-panel utilities-page"><h2>Papelera de documentos</h2>{query.isPending ? <p>Cargando…</p> : query.isError ? <p role="alert">{errorText(query.error)}</p> : <>{query.data.total === 0 ? <p>No hay documentos en la papelera.</p> : query.data.items.map(d => <div className="utilities-actions" key={d.id}><span>{d.title}</span><button className="secondary-button" disabled={mutation.isPending} onClick={() => mutation.mutate(d.id)}>Recuperar</button></div>)}<div className="utilities-actions"><button disabled={page === 1} onClick={() => setPage(p => p-1)}>Anterior</button><button disabled={page*20 >= query.data.total} onClick={() => setPage(p => p+1)}>Siguiente</button></div></>}{mutation.isError ? <p role="alert">{errorText(mutation.error)}</p> : null}</section>;
}

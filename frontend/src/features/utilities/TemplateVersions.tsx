import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { apiBlob, apiRequest, downloadApiBlob } from "../../lib/api";
import { errorText, utilityApi, utilityKey } from "./api";

type Version = { id: string; revision: number; name: string };
export function TemplateVersions({ id, revision, refresh }: { id: string; revision: number; refresh: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [chosen, setChosen] = useState<File | null>(null);
  const [restore, setRestore] = useState<Version | null>(null);
  const [downloadError, setDownloadError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const client = useQueryClient();
  const query = useQuery({ queryKey: utilityKey("template-versions", id), enabled: open, queryFn: ({ signal }) => utilityApi<Version[]>(`/templates/${id}/versions`, "GET", undefined, signal) });
  const mutation = useMutation({ mutationFn: async () => {
    if (restore) return utilityApi(`/templates/${id}/versions/${restore.id}/restore`, "POST");
    if (!chosen) throw new Error("Selecciona un archivo");
    const form = new FormData(); form.set("file", chosen); form.set("expected_revision", String(revision));
    return apiRequest(`/templates/${id}/replace`, { method: "POST", headers: { Authorization: `Bearer ${sessionStorage.getItem("avendia.accessToken")}` }, body: form });
  }, onSuccess: async () => { setChosen(null); setRestore(null); await client.invalidateQueries({ queryKey: utilityKey("template-versions", id) }); await refresh(); } });
  return <div style={{gridColumn:"1 / -1",width:"100%"}}><button className="secondary-button" aria-expanded={open} onClick={() => setOpen(!open)}>Reemplazar y ver versiones · v{revision}</button>{open ? <div className="utilities-form"><p>El archivo actual se conservará. Al reemplazarlo deberás volver a analizar su compatibilidad.</p><input type="file" ref={input} accept=".docx,.pdf,.xlsx,.pptx" aria-label="Nueva versión del formato" onChange={e => { setChosen(e.target.files?.[0] ?? null); setRestore(null); }} />{chosen ? <p>Seleccionado: {chosen.name}</p> : null}{query.isPending ? <p>Cargando versiones…</p> : query.isError ? <p role="alert">{errorText(query.error)}</p> : query.data?.length ? query.data.map(v => <div key={v.id} className="utilities-actions"><span>Versión {v.revision} · {v.name}</span><button className="secondary-button" onClick={async () => { try { const file = await apiBlob(`/templates/${id}/versions/${v.id}/download`, { headers: { Authorization: `Bearer ${sessionStorage.getItem("avendia.accessToken")}` } }); downloadApiBlob(file); setDownloadError(""); } catch(e) { setDownloadError(errorText(e)); } }}>Descargar original</button><button className="secondary-button" onClick={() => { setRestore(v); setChosen(null); if(input.current) input.current.value=""; }}>Elegir para restaurar</button></div>) : <p>Las versiones anteriores aparecerán después de reemplazar el archivo.</p>}{restore ? <p>Restaurarás «{restore.name}» como una nueva versión, conservando la actual.</p> : null}{chosen || restore ? <button className="primary-button" disabled={mutation.isPending} onClick={() => mutation.mutate()}>{mutation.isPending ? "Guardando…" : "Confirmar nueva versión"}</button> : null}{mutation.isError || downloadError ? <p role="alert">{downloadError || errorText(mutation.error)}</p> : null}</div> : null}</div>;
}

export function TemplateTrash({ refresh }: { refresh: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const query = useQuery({ queryKey: utilityKey("template-trash"), enabled: open, queryFn: ({ signal }) => utilityApi<{id:string;name:string}[]>("/templates?trashed=true", "GET", undefined, signal) });
  const mutation = useMutation({ mutationFn: (id: string) => utilityApi(`/templates/${id}/recover`, "POST"), onSuccess: async () => { await query.refetch(); await refresh(); } });
  return <section><button className="secondary-button" aria-expanded={open} onClick={() => { setOpen(!open); if(!open) void query.refetch(); }}>Papelera de formatos</button>{open ? <div className="utility-panel utilities-page">{query.isPending ? <p>Cargando…</p> : query.isError ? <p role="alert">{errorText(query.error)}</p> : query.data?.length ? query.data.map(t => <div key={t.id} className="utilities-actions"><span>{t.name}</span><button className="secondary-button" disabled={mutation.isPending} onClick={() => mutation.mutate(t.id)}>Recuperar formato</button></div>) : <p>No hay formatos en la papelera.</p>}{mutation.isError ? <p role="alert">{errorText(mutation.error)}</p> : null}</div> : null}</section>;
}

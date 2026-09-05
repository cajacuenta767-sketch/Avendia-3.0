import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { readSessionUser } from "../../lib/session";
import { errorText, utilityApi, utilityKey, type Page } from "./api";
import { UtilityHero } from "./UtilityHero";
import { useUtilitySummary } from "./useUtilitySummary";
import "./utilities.css";

type Idea = { id: string; title: string; description: string; category: string; tool: string;
  status: string; response: string; mine: boolean; voted: boolean; votes: number };
const states: Record<string, string> = { received: "Recibida", review: "En revisión", planned: "Planificada", development: "En desarrollo", published: "Publicada", resolved: "Resuelta", declined: "No priorizada", hidden: "Oculta" };
const categories: Record<string, string> = { flujo: "Mejora de flujo", error: "Error técnico", pedagogia: "Contenido pedagógico", accesibilidad: "Accesibilidad", exportacion: "Exportación", otra: "Otra propuesta" };

export function IdeasPage() {
  const client = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [mine, setMine] = useState(false);
  const [state, setState] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [editing, setEditing] = useState<Idea | null>(null);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const summary = useUtilitySummary();
  const query = useQuery({ queryKey: utilityKey("ideas", search, mine, state, page), queryFn: ({ signal }) => utilityApi<Page<Idea>>(`/ideas?q=${encodeURIComponent(search)}&mine=${mine}&state=${state}&page=${page}`, "GET", undefined, signal) });
  const mutation = useMutation({ mutationFn: ({ path, method, body }: { path: string; method: string; body?: unknown }) => utilityApi(path, method, body), onSuccess: () => client.invalidateQueries({ queryKey: utilityKey("ideas") }) });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    try {
      await mutation.mutateAsync({ path: editing ? `/ideas/${editing.id}` : "/ideas", method: editing ? "PATCH" : "POST", body: editing ? { title: values.title, description: values.description } : { ...values, request_id: requestId } });
      setRequestId(crypto.randomUUID()); setEditing(null); form.reset();
    } catch { /* The persistent error is rendered below; input is retained. */ }
  }
  return <main className="content-page utilities-page"><UtilityHero eyebrow="CO-CREACIÓN DE AVENDIA" title="Ideas y mejoras" description="Comparte una propuesta, sigue su avance y conversa con el equipo." metrics={[
    { label: "ideas propuestas", value: summary.data?.ideas?.mine ?? "—" },
    { label: "votos emitidos", value: summary.data?.ideas?.votes ?? "—" },
  ]}><p className="utility-hero__hint">Cada propuesta tiene un estado real, conversación y respuesta de administración cuando corresponde.</p></UtilityHero>
    <form className="utility-panel utilities-form" key={editing?.id ?? "new"} onSubmit={submit}>
      <h2>{editing ? "Editar mi propuesta" : "¿Qué podemos mejorar?"}</h2>
      <label>Título<input name="title" required minLength={4} maxLength={180} defaultValue={editing?.title} placeholder="Ej. Conservar el ancho de las tablas al descargar Word" /></label>
      <label>Descripción<textarea name="description" required minLength={12} maxLength={6000} rows={4} defaultValue={editing?.description} placeholder="Cuenta qué necesitas, qué ocurrió y qué resultado esperabas. Evita datos personales de estudiantes." /></label>
      {!editing ? <div className="utilities-grid"><label>Tipo<select name="category">{Object.entries(categories).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><label>Herramienta relacionada<input name="tool" maxLength={180} placeholder="Ej. Plan Curricular Anual" /></label></div> : null}
      <div className="utilities-actions"><button className="primary-button" disabled={mutation.isPending}>{mutation.isPending ? "Guardando…" : "Guardar propuesta"}</button>{editing ? <button type="button" className="secondary-button" onClick={() => setEditing(null)}>Cancelar edición</button> : null}</div>
    </form>
    {mutation.isError ? <p role="alert">{errorText(mutation.error)}</p> : null}
    <section className="utility-panel"><div className="utilities-filters"><label>Buscar<input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Título o descripción" /></label><label>Estado<select value={state} onChange={e => { setState(e.target.value); setPage(1); }}><option value="">Todos</option>{Object.entries(states).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><label className="utilities-check"><input type="checkbox" checked={mine} onChange={e => { setMine(e.target.checked); setPage(1); }} />Solo mis propuestas</label></div>
      {query.isPending ? <p role="status">Cargando propuestas…</p> : query.isError ? <p role="alert">{errorText(query.error)} <button onClick={() => void query.refetch()}>Reintentar</button></p> : <>
        <p>{query.data.total} propuestas</p>{!query.data.items.length ? <p>No hay propuestas con estos filtros. Puedes compartir la primera.</p> : query.data.items.map(idea => <article className="utilities-card" key={idea.id}>
          <small>{states[idea.status]} · {categories[idea.category] ?? idea.category}</small><h2>{idea.title}</h2><p className="utilities-prose">{idea.description}</p>{idea.tool ? <p>Herramienta: {idea.tool}</p> : null}
          {idea.response ? <blockquote><strong>Respuesta del equipo</strong><p>{idea.response}</p></blockquote> : null}
          <div className="utilities-actions"><button className="secondary-button" aria-pressed={idea.voted} disabled={mutation.isPending} onClick={() => mutation.mutate({ path: `/ideas/${idea.id}/vote?enabled=${!idea.voted}`, method: "PUT" })}>{idea.voted ? "Retirar voto" : "Apoyar"} · {idea.votes}</button><button className="secondary-button" aria-expanded={selected === idea.id} onClick={() => setSelected(selected === idea.id ? null : idea.id)}>Conversación</button>{idea.mine && idea.status === "received" ? <button className="secondary-button" onClick={() => { setEditing(idea); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Editar</button> : null}</div>
          {readSessionUser().role === "admin" ? <form className="utilities-form" onSubmit={e => { e.preventDefault(); const data = Object.fromEntries(new FormData(e.currentTarget)); mutation.mutate({ path: `/admin/ideas/${idea.id}`, method: "PATCH", body: data }); }}><label>Estado administrativo<select name="status" defaultValue={idea.status}>{Object.entries(states).map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label><label>Respuesta y motivo<textarea name="response" required minLength={4} maxLength={4000} defaultValue={idea.response} /></label><button className="secondary-button" disabled={mutation.isPending}>Actualizar y notificar al autor</button></form> : null}
          {selected === idea.id ? <IdeaComments id={idea.id} /> : null}
        </article>)}<div className="utilities-actions"><button className="secondary-button" disabled={page === 1} onClick={() => setPage(p => p-1)}>Anterior</button><span>Página {page}</span><button className="secondary-button" disabled={page*12 >= query.data.total} onClick={() => setPage(p => p+1)}>Siguiente</button></div>
      </>}
    </section>
  </main>;
}

function IdeaComments({ id }: { id: string }) {
  const [page, setPage] = useState(1);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const query = useQuery({ queryKey: utilityKey("comments", id, page), queryFn: ({ signal }) => utilityApi<Page<{ id: string; content: string; author: string }>>(`/ideas/${id}/comments?page=${page}`, "GET", undefined, signal) });
  const client = useQueryClient();
  const mutation = useMutation({ mutationFn: (content: string) => utilityApi(`/ideas/${id}/comments`, "POST", { content, request_id: requestId }), onSuccess: () => client.invalidateQueries({ queryKey: utilityKey("comments", id) }) });
  return <div className="utilities-comments">{query.isPending ? <p>Cargando conversación…</p> : query.isError ? <p role="alert">{errorText(query.error)}</p> : <>{query.data.items.map(c => <blockquote key={c.id}><strong>{c.author}</strong><p className="utilities-prose">{c.content}</p></blockquote>)}{query.data.total === 0 ? <p>Aún no hay comentarios.</p> : null}<div className="utilities-actions"><button disabled={page === 1} onClick={() => setPage(p => p-1)}>Anterior</button><button disabled={page*20 >= query.data.total} onClick={() => setPage(p => p+1)}>Más comentarios</button></div></>}
    <form className="utilities-form" onSubmit={async e => { e.preventDefault(); const form = e.currentTarget; try { await mutation.mutateAsync(String(new FormData(form).get("content"))); form.reset(); setRequestId(crypto.randomUUID()); } catch { /* Keep input for retry. */ } }}><label>Tu comentario<textarea name="content" minLength={2} maxLength={3000} required placeholder="Añade información que ayude a resolver esta propuesta." /></label><button className="secondary-button" disabled={mutation.isPending}>Enviar comentario</button></form>{mutation.isError ? <p role="alert">{errorText(mutation.error)}</p> : null}
  </div>;
}

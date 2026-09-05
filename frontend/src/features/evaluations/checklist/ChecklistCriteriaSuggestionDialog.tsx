import { Check, LoaderCircle, Sparkles, Trash2, X } from "lucide-react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";

import { suggestChecklistCriteria } from "./checklistApi";

type Props = {
  context: {
    activity: string;
    modality: string;
    level: string;
    grade: string;
    area: string;
  };
  onApply: (criteria: string[]) => void;
  onClose: () => void;
};

function parseCriteria(reply: string) {
  return reply
    .split(/\n+/)
    .map((line) => line.replace(/^\s*(?:[-•*]|\d+[.)])\s*/, "").replace(/\*+/g, "").trim())
    .filter(Boolean)
    .slice(0, 5);
}

export function ChecklistCriteriaSuggestionDialog({ context, onApply, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(document.activeElement as HTMLElement | null);
  const [evidence, setEvidence] = useState(context.activity);
  const [emphasis, setEmphasis] = useState("");
  const [criteria, setCriteria] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    const restoreFocus = previousFocus.current;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("textarea")?.focus();
    return () => {
      document.body.style.overflow = oldOverflow;
      restoreFocus?.focus();
    };
  }, []);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && !loading) { event.preventDefault(); onClose(); return; }
    if (event.key !== "Tab") return;
    const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled)') ?? [])];
    if (!focusable.length) return;
    if (event.shiftKey && document.activeElement === focusable[0]) { event.preventDefault(); focusable.at(-1)?.focus(); }
    else if (!event.shiftKey && document.activeElement === focusable.at(-1)) { event.preventDefault(); focusable[0].focus(); }
  }

  async function generate() {
    setLoading(true);
    setError("");
    try {
      const reply = await suggestChecklistCriteria({ ...context, learningEvidence: evidence, emphasis });
      const parsed = parseCriteria(reply);
      if (!parsed.length) throw new Error("La IA no devolvió criterios utilizables. Añade más contexto e inténtalo nuevamente.");
      setCriteria(parsed);
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "No pudimos preparar los criterios.");
    } finally {
      setLoading(false);
    }
  }

  return <div className="criteria-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !loading) onClose(); }}>
    <div className="criteria-dialog" role="dialog" aria-modal="true" aria-labelledby="criteria-dialog-title" ref={dialogRef} onKeyDown={onKeyDown}>
      <header><div><span>Sugerencia contextual · Lista de cotejo</span><h2 id="criteria-dialog-title">Propongamos criterios observables</h2><p>{context.area || "Área pendiente"} · {context.grade || context.level || "Grado pendiente"}</p></div><button type="button" onClick={onClose} disabled={loading} aria-label="Cerrar sugerencia"><X /></button></header>
      <div className="criteria-dialog__body">
        <p>Avendia usará únicamente el contexto pedagógico. Revisa y edita cada criterio antes de incorporarlo.</p>
        <label><span>Actividad o evidencia</span><textarea rows={3} value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder="Ej. Exposición donde explica una estrategia de solución." /></label>
        <label><span>Aprendizaje que deseas observar</span><textarea rows={3} value={emphasis} onChange={(event) => setEmphasis(event.target.value)} placeholder="Ej. Que seleccione datos, justifique su estrategia y comunique la conclusión." /></label>
        {criteria.length ? <section className="criteria-dialog__results"><strong>Criterios listos para revisar</strong>{criteria.map((criterion, index) => <div key={`${index}-${criterion.slice(0, 12)}`}><label><span>C{index + 1}</span><textarea rows={2} value={criterion} onChange={(event) => setCriteria((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} /></label><button type="button" onClick={() => setCriteria((current) => current.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Quitar criterio ${index + 1}`}><Trash2 /></button></div>)}</section> : null}
        {error ? <div className="evaluation-message evaluation-message--error" role="alert">{error}</div> : null}
      </div>
      <footer><button type="button" className="evaluation-secondary" onClick={onClose} disabled={loading}>Cancelar</button>{criteria.length ? <><button type="button" className="criteria-dialog__regenerate" onClick={() => void generate()} disabled={loading}><Sparkles /> Regenerar</button><button type="button" className="evaluation-primary" onClick={() => onApply(criteria.filter((criterion) => criterion.trim()))} disabled={!criteria.some((criterion) => criterion.trim())}><Check /> Incorporar criterios</button></> : <button type="button" className="evaluation-primary" onClick={() => void generate()} disabled={loading || (!evidence.trim() && !emphasis.trim())}>{loading ? <LoaderCircle className="is-spinning" /> : <Sparkles />}{loading ? "Preparando…" : "Generar criterios"}</button>}</footer>
    </div>
  </div>;
}

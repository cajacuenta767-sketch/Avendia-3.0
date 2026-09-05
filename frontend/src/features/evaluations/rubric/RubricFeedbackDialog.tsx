import { Check, LoaderCircle, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { suggestRubricFeedback, type RubricFeedbackPrompt } from "./rubricApi";

type Props = {
  studentName: string;
  prompt: RubricFeedbackPrompt;
  onApply: (recommendation: string) => void;
  onClose: () => void;
};

export function RubricFeedbackDialog({ studentName, prompt, onApply, onClose }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(document.activeElement as HTMLElement | null);
  const [evidence, setEvidence] = useState(prompt.evidence);
  const [strength, setStrength] = useState(prompt.strength);
  const [improvement, setImprovement] = useState(prompt.improvement);
  const [proposal, setProposal] = useState(prompt.currentRecommendation);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    const bodyOverflow = document.body.style.overflow;
    const restoreFocus = previousFocus.current;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>(".rubric-feedback-dialog__body textarea")?.focus();
    return () => {
      document.body.style.overflow = bodyOverflow;
      restoreFocus?.focus();
    };
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && status !== "loading") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = [...(dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), [href]') ?? [])];
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }

  async function generate() {
    setStatus("loading");
    setError("");
    try {
      const response = await suggestRubricFeedback({ ...prompt, evidence, strength, improvement, currentRecommendation: proposal });
      setProposal(response);
      setStatus("idle");
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : "No pudimos crear la sugerencia.");
      setStatus("error");
    }
  }

  return (
    <div className="rubric-dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && status !== "loading") onClose(); }}>
      <div ref={dialogRef} className="rubric-feedback-dialog" role="dialog" aria-modal="true" aria-labelledby="rubric-feedback-title" onKeyDown={handleKeyDown}>
        <header><div><span>Sugerencia pedagógica contextual</span><h2 id="rubric-feedback-title">Retroalimentación para {studentName}</h2><p>{prompt.criterionTitle} · {prompt.levelLabel || "Nivel aún no elegido"}</p></div><button type="button" onClick={onClose} disabled={status === "loading"} aria-label="Cerrar sugerencia"><X /></button></header>
        <div className="rubric-feedback-dialog__body">
          <p>La IA solo redactará una recomendación a partir de la evidencia que tú confirmes. La calificación final seguirá bajo tu control.</p>
          <label><span>Evidencia observada</span><textarea rows={3} value={evidence} onChange={(event) => setEvidence(event.target.value)} placeholder="Ej. Explicó la estrategia, pero no justificó por qué eligió esos datos." /></label>
          <label><span>Fortaleza demostrada</span><textarea rows={2} value={strength} onChange={(event) => setStrength(event.target.value)} placeholder="Ej. Organiza el procedimiento de forma comprensible." /></label>
          <label><span>Aspecto que debe mejorar</span><textarea rows={2} value={improvement} onChange={(event) => setImprovement(event.target.value)} placeholder="Ej. Relacionar cada conclusión con una evidencia concreta." /></label>
          {proposal ? <label className="rubric-feedback-dialog__proposal"><span>Propuesta editable</span><textarea rows={5} value={proposal} onChange={(event) => setProposal(event.target.value)} /></label> : null}
          {error ? <div className="evaluation-message evaluation-message--error" role="alert">{error}</div> : null}
        </div>
        <footer><button type="button" className="evaluation-secondary" onClick={onClose} disabled={status === "loading"}>Cancelar</button><button type="button" className="evaluation-primary" onClick={proposal ? () => onApply(proposal) : () => void generate()} disabled={status === "loading" || (!evidence.trim() && !strength.trim() && !improvement.trim())}>{status === "loading" ? <LoaderCircle className="is-spinning" /> : proposal ? <Check /> : <Sparkles />}{status === "loading" ? "Preparando…" : proposal ? "Aplicar recomendación" : "Generar sugerencia"}</button>{proposal ? <button type="button" className="rubric-regenerate" onClick={() => void generate()} disabled={status === "loading"}><Sparkles /> Volver a generar</button> : null}</footer>
      </div>
    </div>
  );
}

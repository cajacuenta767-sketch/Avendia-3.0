import { Check, CircleAlert, Lightbulb, ListChecks, LoaderCircle, Sparkles, Target, X } from "lucide-react";
import { useEffect, useMemo } from "react";

import type { WorkflowField, WorkflowFieldGuide } from "../../config/workflows";
import type { AssistanceMode } from "./pedagogicalContext";

type ApplyMode = "replace" | "append";

type ContextualAIGuideDialogProps = {
  toolTitle: string;
  field: WorkflowField;
  guide: WorkflowFieldGuide;
  hasExistingContent: boolean;
  currentValue?: string;
  contextSummary?: string[];
  contextFingerprint?: string;
  contextWarnings?: string[];
  assistanceMode?: AssistanceMode;
  rememberAssistance?: boolean;
  answer1: string;
  answer2: string;
  customDetail: string;
  selectedSuggestions: string[];
  reply: string;
  error?: string;
  loading: boolean;
  applyMode: ApplyMode;
  onAnswer1Change: (value: string) => void;
  onAnswer2Change: (value: string) => void;
  onCustomDetailChange: (value: string) => void;
  onToggleSuggestion: (value: string) => void;
  onReplyChange: (value: string) => void;
  onApplyModeChange: (value: ApplyMode) => void;
  onAssistanceModeChange?: (value: AssistanceMode) => void;
  onRememberAssistanceChange?: (value: boolean) => void;
  onUseWithoutAI?: () => void;
  onFeedback?: (value: "useful" | "incorrect" | "repetitive" | "too_long") => void;
  onGenerate: () => void;
  onApply: () => void;
  onClose: () => void;
};

export function ContextualAIGuideDialog({
  toolTitle,
  field,
  guide,
  hasExistingContent,
  currentValue = "",
  contextSummary = [],
  contextFingerprint = "",
  contextWarnings = [],
  assistanceMode = "complete",
  rememberAssistance = false,
  answer1,
  answer2,
  customDetail,
  selectedSuggestions,
  reply,
  error = "",
  loading,
  applyMode,
  onAnswer1Change,
  onAnswer2Change,
  onCustomDetailChange,
  onToggleSuggestion,
  onReplyChange,
  onApplyModeChange,
  onAssistanceModeChange,
  onRememberAssistanceChange,
  onUseWithoutAI,
  onFeedback,
  onGenerate,
  onApply,
  onClose,
}: ContextualAIGuideDialogProps) {
  const hasPrompt = [answer1, answer2, customDetail, ...selectedSuggestions].some((value) => value.trim());
  const liveSuggestions = useMemo(() => {
    const input = `${answer1} ${answer2} ${customDetail}`.toLocaleLowerCase();
    if (/aritm|matem|fracci|número|operaci[oó]n/.test(input)) return ["Problema matemático cotidiano", "Material concreto o representación", "Procedimiento observable", "Comprobación del resultado", "Reto con dificultad gradual"];
    if (/comunic|lect|texto|escrit|oral|argument/.test(input)) return ["Texto cercano al contexto", "Idea principal e inferencias", "Opinión sustentada", "Producción oral o escrita", "Revisión con criterios"];
    if (/ciencia|experimento|hip[oó]tesis|indaga/.test(input)) return ["Fenómeno observable", "Pregunta e hipótesis", "Experiencia segura", "Registro de evidencias", "Explicación de resultados"];
    return guide.suggestions ?? [];
  }, [answer1, answer2, customDetail, guide.suggestions]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [loading, onClose]);

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !loading) onClose();
    }}>
      <section className="generation-guide generation-guide--field" role="dialog" aria-modal="true" aria-labelledby="guide-title">
        <header>
          <span>
            <Target />
            <span>
              <small>Sugerencia contextual · {toolTitle}</small>
              <h2 id="guide-title">{guide.title}</h2>
            </span>
          </span>
          <button className="icon-button" type="button" onClick={onClose} disabled={loading} aria-label="Cerrar sugerencia"><X /></button>
        </header>

        <div className="generation-guide__body">
          <div className="generation-guide__field-context">
            <span>Campo seleccionado</span>
            <strong>{field.label}</strong>
            <small>{hasExistingContent
              ? "La propuesta podrá añadirse al contenido actual o reemplazarlo después de revisarla."
              : "La respuesta se preparará exclusivamente para este cuadro y podrá revisarse antes de aplicarla."}</small>
          </div>

          <div className="generation-guide__context" aria-label="Contexto usado por la ayuda">
            <div><ListChecks /><strong>Contexto usado</strong>{contextFingerprint ? <small>{contextFingerprint}</small> : null}</div>
            {contextSummary.length ? <ul>{contextSummary.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Completa modalidad, nivel, grado, área o tema para obtener sugerencias más precisas.</p>}
            {contextWarnings.map((warning) => <p className="is-warning" key={warning}><CircleAlert />{warning}</p>)}
          </div>

          <fieldset className="generation-guide__assistance">
            <legend>Nivel de ayuda</legend>
            <div>
              {([
                ["quick", "Idea rápida"],
                ["complete", "Propuesta completa"],
                ["guided", "Guía paso a paso"],
              ] as const).map(([value, label]) => <button type="button" key={value} className={assistanceMode === value ? "is-selected" : ""} aria-pressed={assistanceMode === value} onClick={() => onAssistanceModeChange?.(value)}>{label}</button>)}
            </div>
            <label><input type="checkbox" checked={rememberAssistance} onChange={(event) => onRememberAssistanceChange?.(event.target.checked)} /> Recordar esta preferencia en mi cuenta</label>
          </fieldset>

          <p>Responde brevemente o elige sugerencias rápidas. La IA combinará estas indicaciones con la modalidad, el nivel, el grado y los demás datos del formulario.</p>

          <label>
            <span>{guide.question1}</span>
            <input type="text" autoFocus value={answer1} onChange={(event) => onAnswer1Change(event.target.value)} placeholder={guide.placeholder1} />
          </label>
          <label>
            <span>{guide.question2}</span>
            <input type="text" value={answer2} onChange={(event) => onAnswer2Change(event.target.value)} placeholder={guide.placeholder2} />
          </label>

          {liveSuggestions.length ? (
            <div className="generation-guide__suggestions">
              <strong><Lightbulb /> Sugerencias de un solo clic</strong>
              <div>
                {liveSuggestions.map((suggestion) => {
                  const selected = selectedSuggestions.includes(suggestion);
                  return (
                    <button type="button" className={selected ? "is-selected" : ""} key={suggestion} onClick={() => onToggleSuggestion(suggestion)} aria-pressed={selected}>
                      <span className="generation-guide__suggestion-icon" aria-hidden="true">{selected ? <Check /> : <Lightbulb />}</span><span>{suggestion}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <label>
            <span>Otro detalle que debe considerar la IA <em>Opcional</em></span>
            <textarea rows={3} value={customDetail} onChange={(event) => onCustomDetailChange(event.target.value)} placeholder={`Añade una condición, ejemplo o instrucción especial para ${field.label.toLowerCase()}.`} />
          </label>

          {error ? <div className="generation-guide__error" role="alert">
            <CircleAlert />
            <div><strong>No se pudo preparar la sugerencia</strong><p>{error}</p><small>Revisa tu conexión e inténtalo nuevamente. Tus respuestas se conservarán.</small></div>
          </div> : null}

          {reply ? (
            <div className="generation-guide__reply">
              <strong>Compara antes de aplicar</strong>
              {hasExistingContent ? <div className="generation-guide__before"><small>Contenido actual</small><p>{currentValue}</p></div> : null}
              <small>Propuesta editable</small>
              <textarea rows={8} value={reply} onChange={(event) => onReplyChange(event.target.value)} />
              {onFeedback ? <div className="generation-guide__feedback"><span>¿Cómo resultó?</span>{([["useful", "Útil"], ["incorrect", "Incorrecta"], ["repetitive", "Repetitiva"], ["too_long", "Muy extensa"]] as const).map(([value, label]) => <button type="button" key={value} onClick={() => onFeedback(value)}>{label}</button>)}</div> : null}
              <div className="generation-guide__apply-mode" role="radiogroup" aria-label="Forma de aplicar la propuesta">
                <label><input type="radio" checked={applyMode === "replace"} onChange={() => onApplyModeChange("replace")} /> Reemplazar el contenido</label>
                <label><input type="radio" checked={applyMode === "append"} onChange={() => onApplyModeChange("append")} /> Añadir al contenido actual</label>
              </div>
            </div>
          ) : null}
        </div>

        <footer>
          <button className="secondary-button" type="button" onClick={onClose} disabled={loading}>Cancelar</button>
          {reply ? (
            <button className="workflow-primary" type="button" onClick={onApply}><Check /> Aplicar a “{field.label}”</button>
          ) : (
            <>
              {onUseWithoutAI ? <button className="secondary-button" type="button" disabled={loading || !hasPrompt} onClick={onUseWithoutAI}>Usar sin IA</button> : null}
              <button className="workflow-primary" type="button" disabled={loading || !hasPrompt} onClick={onGenerate}>
                {loading ? <LoaderCircle className="is-spinning" /> : <Sparkles />}{loading ? "Generando…" : error ? "Reintentar generación" : "Generar para este campo"}
              </button>
            </>
          )}
        </footer>
      </section>
    </div>
  );
}

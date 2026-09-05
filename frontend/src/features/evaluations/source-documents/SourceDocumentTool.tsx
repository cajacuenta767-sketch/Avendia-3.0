import { Download, Sparkles } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

import { GenerationProgressOverlay } from "../../../components/GenerationProgressOverlay";
import type { WorkflowArtifact } from "../../tools/exportWorkflowDocx";
import { apiRequest } from "../../../lib/api";
import { EducationFrameFields } from "./EducationFrameFields";
import { educationFrameFromProfile } from "./educationFrameProfile";
import { EvaluationPreviewSection, EvaluationWizard, type EvaluationWizardStep } from "./EvaluationWizard";
import { EMPTY_SOURCE_DOCUMENT, type EvaluationDraftPayload, type EvaluationInstrument, type EvaluationSourceDocument, type SourceDocumentValue } from "./evaluationContracts";
import { SourceDocumentInput } from "./SourceDocumentInput";
import { useEvaluationInstrument } from "./useEvaluationInstrument";
import "./evaluationWizard.css";
import "./SourceDocumentInput.css";

export type SourceDocumentToolKind = "learning_sheet" | "text_questions";

type SourceToolState = {
  frame: ReturnType<typeof educationFrameFromProfile>;
  title: string;
  text_type: string;
  source: SourceDocumentValue;
  literal_count: number;
  inferential_count: number;
  critical_count: number;
  cneb_capacities: string;
  question_format: string;
  dua_adjustments: string;
  criteria: string;
  feedback_guidance: string;
  worksheet_type: string;
  activity_count: number;
  difficulty: string;
  purpose: string;
  instructions: string;
  artifact: WorkflowArtifact | null;
};

const QUESTION_STEPS: EvaluationWizardStep[] = [
  { id: "frame", label: "Encuadre y texto", description: "Identifica el contexto y prepara la lectura que será evaluada." },
  { id: "levels", label: "Niveles y capacidades", description: "Distribuye preguntas literales, inferenciales y crítico-reflexivas." },
  { id: "format", label: "Formato y DUA", description: "Define la forma de respuesta, legibilidad y apoyos de acceso." },
  { id: "criteria", label: "Criterios", description: "Aclara qué se evaluará y cómo se retroalimentará." },
  { id: "preview", label: "Vista previa", description: "Revisa la configuración y el texto antes de generar." },
];

const WORKSHEET_STEPS: EvaluationWizardStep[] = [
  { id: "frame", label: "Encuadre", description: "Completa los datos que contextualizan la ficha." },
  { id: "content", label: "Contenido fuente", description: "Pega o sube el contenido sobre el cual se construirá la ficha." },
  { id: "activities", label: "Actividades", description: "Define propósito, extensión y dificultad de la práctica." },
  { id: "accessibility", label: "Apoyos y criterios", description: "Incluye instrucciones, ajustes DUA y evidencia esperada." },
  { id: "preview", label: "Vista previa", description: "Comprueba todos los datos antes de generar la ficha." },
];

function initialState(): SourceToolState {
  return {
    frame: educationFrameFromProfile(),
    title: "",
    text_type: "Narrativo",
    source: { ...EMPTY_SOURCE_DOCUMENT },
    literal_count: 3,
    inferential_count: 2,
    critical_count: 1,
    cneb_capacities: "",
    question_format: "Mixtas",
    dua_adjustments: "",
    criteria: "",
    feedback_guidance: "",
    worksheet_type: "Práctica guiada",
    activity_count: 6,
    difficulty: "Intermedia",
    purpose: "",
    instructions: "",
    artifact: null,
  };
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function sourceFrom(value: unknown, storedSources: EvaluationSourceDocument[] = []): SourceDocumentValue {
  const source = asObject(value);
  const rawReferences = Array.isArray(source.sources) ? source.sources : [];
  const references = rawReferences
    .map((item) => asObject(item))
    .filter((item) => item.source_id);
  if (source.source_id) {
    references.push({ source_id: source.source_id, edited_text: source.edited_text });
  }
  const referenceById = new Map(references.map((item) => [String(item.source_id), item]));
  return {
    ...EMPTY_SOURCE_DOCUMENT,
    pasted_text: String(source.pasted_text ?? ""),
    sources: storedSources.map((stored) => {
      const reference = referenceById.get(stored.id);
      return {
        source_id: stored.id,
        filename: stored.filename,
        extracted_text: stored.extracted_text,
        edited_text: typeof reference?.edited_text === "string" ? reference.edited_text : stored.extracted_text,
        extension: stored.extension,
        byte_size: stored.byte_size,
      };
    }),
    reading_text_size: source.reading_text_size === "small" || source.reading_text_size === "large" ? source.reading_text_size : "medium",
    question_text_size: source.question_text_size === "small" || source.question_text_size === "large" ? source.question_text_size : "medium",
  };
}

function artifactFrom(value: unknown): WorkflowArtifact | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<WorkflowArtifact>;
  if (!Array.isArray(candidate.sections) || typeof candidate.document_title !== "string") return null;
  return candidate as WorkflowArtifact;
}

function draftFromInstrument(instrument: EvaluationInstrument): SourceToolState {
  const data = asObject(instrument.general_data);
  const settings = asObject(instrument.settings);
  const frame = asObject(data.frame);
  const fallback = initialState();
  return {
    ...fallback,
    frame: { ...fallback.frame, ...Object.fromEntries(Object.entries(frame).map(([key, value]) => [key, String(value ?? "")])) },
    title: String(data.title ?? ""),
    text_type: String(data.text_type ?? fallback.text_type),
    source: sourceFrom(data.source, instrument.sources ?? []),
    literal_count: Number(settings.literal_count ?? fallback.literal_count),
    inferential_count: Number(settings.inferential_count ?? fallback.inferential_count),
    critical_count: Number(settings.critical_count ?? fallback.critical_count),
    cneb_capacities: String(settings.cneb_capacities ?? ""),
    question_format: String(settings.question_format ?? fallback.question_format),
    dua_adjustments: String(settings.dua_adjustments ?? ""),
    criteria: String(settings.criteria ?? ""),
    feedback_guidance: String(settings.feedback_guidance ?? ""),
    worksheet_type: String(settings.worksheet_type ?? fallback.worksheet_type),
    activity_count: Number(settings.activity_count ?? fallback.activity_count),
    difficulty: String(settings.difficulty ?? fallback.difficulty),
    purpose: String(settings.purpose ?? ""),
    instructions: String(settings.instructions ?? ""),
    artifact: artifactFrom(settings.generated_artifact),
  };
}

export function SourceDocumentTool({
  kind,
  instrumentId,
  onInstrumentIdChange,
}: {
  kind: SourceDocumentToolKind;
  instrumentId?: string;
  onInstrumentIdChange?: (instrumentId: string) => void;
}) {
  const [state, setState] = useState<SourceToolState>(initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const [exporting, setExporting] = useState(false);
  const onLoaded = useCallback((instrument: EvaluationInstrument) => {
    const restored = draftFromInstrument(instrument);
    setState(restored);
    if (restored.artifact) setCurrentStep(4);
  }, []);
  const draft = useEvaluationInstrument({ instrumentId, onLoaded, onInstrumentIdChange });
  const isQuestions = kind === "text_questions";
  const steps = isQuestions ? QUESTION_STEPS : WORKSHEET_STEPS;
  const combinedText = useMemo(
    () => [state.source.pasted_text, ...state.source.sources.map((source) => source.edited_text)]
      .filter((item) => item.trim())
      .join("\n\n"),
    [state.source],
  );

  const sourceForDraft = useMemo(() => ({
    pasted_text: state.source.pasted_text,
    reading_text_size: state.source.reading_text_size,
    question_text_size: state.source.question_text_size,
    sources: state.source.sources.map((source) => ({
      source_id: source.source_id,
      filename: source.filename,
      ...(source.edited_text !== source.extracted_text ? { edited_text: source.edited_text } : {}),
    })),
  }), [state.source]);

  function update<Key extends keyof SourceToolState>(key: Key, value: SourceToolState[Key]) {
    setState((current) => ({ ...current, [key]: value }));
    setValidationError("");
  }

  const buildPayload = useCallback((status: "draft" | "generated" = "draft"): EvaluationDraftPayload => ({
    kind,
    title: state.title.trim() || (isQuestions ? "Preguntas sobre texto" : "Ficha de aprendizaje"),
    status,
    general_data: {
      frame: state.frame,
      title: state.title,
      text_type: state.text_type,
      source: sourceForDraft,
    },
    settings: {
      literal_count: state.literal_count,
      inferential_count: state.inferential_count,
      critical_count: state.critical_count,
      cneb_capacities: state.cneb_capacities,
      question_format: state.question_format,
      dua_adjustments: state.dua_adjustments,
      criteria: state.criteria,
      feedback_guidance: state.feedback_guidance,
      worksheet_type: state.worksheet_type,
      activity_count: state.activity_count,
      difficulty: state.difficulty,
      purpose: state.purpose,
      instructions: state.instructions,
      generated_artifact: state.artifact,
      reading_text_size: state.source.reading_text_size,
      question_text_size: state.source.question_text_size,
    },
  }), [isQuestions, kind, sourceForDraft, state]);

  function missingAt(index: number): string {
    if (index === 0 && (!state.frame.teacher_name.trim() || !state.frame.institution_name.trim())) {
      return "Completa el nombre del docente y la institución para continuar.";
    }
    const contentStep = isQuestions ? 0 : 1;
    if (index === contentStep && (!state.title.trim() || !combinedText.trim())) {
      return "Añade un título y pega o sube el contenido fuente antes de continuar.";
    }
    if (isQuestions && index === 1 && !state.cneb_capacities.trim()) return "Escribe las capacidades CNEB que movilizarán las preguntas.";
    if (!isQuestions && index === 2 && !state.purpose.trim()) return "Explica el propósito de aprendizaje de la ficha.";
    return "";
  }

  function goToStep(next: number) {
    if (next > currentStep) {
      const invalid = Array.from({ length: next }, (_, index) => index).find((index) => missingAt(index));
      if (invalid !== undefined) {
        setCurrentStep(invalid);
        setValidationError(missingAt(invalid));
        return;
      }
    }
    setValidationError("");
    setCurrentStep(Math.max(0, Math.min(steps.length - 1, next)));
  }

  async function save(finalize = false) {
    if (finalize) {
      const requiredStep = [0, ...(isQuestions ? [1] : [1, 2])].find((index) => missingAt(index));
      if (requiredStep !== undefined) {
        setCurrentStep(requiredStep);
        setValidationError(missingAt(requiredStep));
        return;
      }
      if (!state.artifact) {
        setCurrentStep(steps.length - 1);
        setValidationError("Genera y revisa el contenido pedagógico antes de finalizar el instrumento.");
        return;
      }
      if (state.artifact.quality_status === "blocked") {
        setCurrentStep(steps.length - 1);
        setValidationError("El contenido no supera la validación pedagógica. Corrige los apartados señalados o vuelve a generarlo.");
        return;
      }
    }
    try {
      await draft.persist(buildPayload(finalize ? "generated" : "draft"));
    } catch {
      // El hook expone el error asociado en el aviso del formulario.
    }
  }

  async function generateWithAI() {
    const requiredStep = [0, ...(isQuestions ? [1] : [1, 2])].find((index) => missingAt(index));
    if (requiredStep !== undefined) {
      setCurrentStep(requiredStep);
      setValidationError(missingAt(requiredStep));
      return;
    }
    setGenerating(true);
    setGenerationError("");
    try {
      const token = sessionStorage.getItem("avendia.accessToken");
      const artifact = await apiRequest<WorkflowArtifact>("/ai/tools/workflow/generate", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: JSON.stringify({
          tool_id: isQuestions ? "preguntas-texto" : "ficha-aprendizaje",
          module: "evaluamos",
          tool_title: isQuestions ? "Preguntas sobre texto" : "Ficha de aprendizaje",
          artifact_type: isQuestions ? "instrumento" : "recurso",
          fields: isQuestions ? {
            modality: state.frame.modality,
            level: state.frame.education_level,
            grade: state.frame.grade_or_cycle,
            curricular_area: state.frame.curricular_area,
            reading_title: state.title,
            text_type: state.text_type,
            source_text: combinedText,
            literal_count: String(state.literal_count),
            inferential_count: String(state.inferential_count),
            critical_count: String(state.critical_count),
            cneb_capacities: state.cneb_capacities,
            question_format: state.question_format,
            dua_adjustments: state.dua_adjustments,
            criteria: state.criteria,
            feedback_guidance: state.feedback_guidance,
          } : {
            modality: state.frame.modality,
            level: state.frame.education_level,
            grade: state.frame.grade_or_cycle,
            curricular_area: state.frame.curricular_area,
            topic: state.title,
            source_content: combinedText,
            worksheet_type: state.worksheet_type,
            activity_count: String(state.activity_count),
            difficulty: state.difficulty,
            purpose: state.purpose,
            instructions: state.instructions,
            criteria: state.criteria,
            dua_supports: state.dua_adjustments,
          },
          requested_sections: isQuestions
            ? ["Lectura o síntesis", "Preguntas literales", "Preguntas inferenciales", "Preguntas crítico-reflexivas", "Respuestas esperadas", "Justificación de respuestas", "Criterios", "Retroalimentación"]
            : ["Propósito e instrucciones", "Activación", "Práctica guiada", "Aplicación", "Reto", "Metacognición", "Clave de respuestas"],
        }),
      });
      update("artifact", artifact);
    } catch (reason) {
      setGenerationError(reason instanceof Error ? reason.message : "No se pudo generar el contenido pedagógico.");
    } finally {
      setGenerating(false);
    }
  }

  function updateArtifactSection(index: number, field: "narrative" | "key_points", value: string) {
    if (!state.artifact) return;
    update("artifact", {
      ...state.artifact,
      sections: state.artifact.sections.map((section, sectionIndex) => sectionIndex === index
        ? { ...section, [field]: field === "key_points" ? value.split(/\r?\n/).filter(Boolean) : value }
        : section),
    });
  }

  function updateArtifactTableCell(tableIndex: number, rowIndex: number, cellIndex: number, value: string) {
    if (!state.artifact) return;
    update("artifact", {
      ...state.artifact,
      tables: (state.artifact.tables ?? []).map((table, currentTableIndex) => currentTableIndex === tableIndex ? {
        ...table,
        rows: table.rows.map((row, currentRowIndex) => currentRowIndex === rowIndex
          ? row.map((cell, currentCellIndex) => currentCellIndex === cellIndex ? value : cell)
          : row),
      } : table),
    });
  }

  async function downloadWord() {
    if (!state.artifact) return;
    setExporting(true);
    setGenerationError("");
    try {
      await draft.persist(buildPayload("generated"));
      const { exportSourceDocumentDocx } = await import("./exportSourceDocumentDocx");
      await exportSourceDocumentDocx(state.artifact, combinedText, state.source.reading_text_size, state.source.question_text_size);
    } catch (reason) {
      setGenerationError(reason instanceof Error ? reason.message : "No se pudo preparar el documento Word.");
    } finally {
      setExporting(false);
    }
  }

  const sourceInput = (
    <SourceDocumentInput
      value={state.source}
      onChange={(value) => update("source", value)}
      instrumentId={draft.instrumentId}
      prepareInstrument={async () => (await draft.persist(buildPayload("draft"))).id}
      onSourcesMutated={async (activeInstrumentId) => { await draft.refresh(activeInstrumentId); }}
      showTextSize={isQuestions}
      disabled={draft.loading}
    />
  );

  return (
    <>
    <EvaluationWizard
      eyebrow="Evaluamos · Documento pedagógico"
      title={isQuestions ? "Preguntas sobre texto" : "Ficha de aprendizaje"}
      description={isQuestions
        ? "Crea preguntas literales, inferenciales y crítico-reflexivas a partir de una fuente revisable."
        : "Diseña una ficha con práctica guiada, apoyos DUA y respuestas esperadas."}
      steps={steps}
      currentStep={currentStep}
      onStepChange={goToStep}
      onSave={save}
      saving={draft.saving}
      message={draft.message}
      error={validationError || draft.error}
    >
      {currentStep === 0 ? (
        <div className="evaluation-stack">
          <EducationFrameFields value={state.frame} onChange={(value) => update("frame", value)} />
          {isQuestions ? (
            <>
              <div className="evaluation-form-grid">
                <label>
                  <span>Título de la lectura o tema</span>
                  <input value={state.title} onChange={(event) => update("title", event.target.value)} placeholder="Ej. El agua y la vida en nuestra comunidad" />
                </label>
                <label>
                  <span>Tipo textual</span>
                  <select value={state.text_type} onChange={(event) => update("text_type", event.target.value)}>
                    {['Narrativo', 'Expositivo', 'Argumentativo', 'Instructivo', 'Poético', 'Discontinuo'].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
              </div>
              {sourceInput}
            </>
          ) : null}
        </div>
      ) : null}

      {!isQuestions && currentStep === 1 ? (
        <div className="evaluation-stack">
          <div className="evaluation-form-grid">
            <label>
              <span>Tema o título de la ficha</span>
              <input value={state.title} onChange={(event) => update("title", event.target.value)} placeholder="Ej. Reconocemos hábitos de alimentación saludable" />
            </label>
            <label>
              <span>Tipo de contenido</span>
              <select value={state.text_type} onChange={(event) => update("text_type", event.target.value)}>
                {['Lectura', 'Caso', 'Explicación', 'Situación problema', 'Fuente mixta'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
          </div>
          {sourceInput}
        </div>
      ) : null}

      {isQuestions && currentStep === 1 ? (
        <div className="evaluation-form-grid">
          {([['literal_count', 'Preguntas literales'], ['inferential_count', 'Preguntas inferenciales'], ['critical_count', 'Preguntas crítico-reflexivas']] as const).map(([key, label]) => (
            <label key={key}>
              <span>{label}</span>
              <input type="number" min="0" max="10" value={state[key]} onChange={(event) => update(key, Math.max(0, Math.min(10, Number(event.target.value))))} />
            </label>
          ))}
          <label className="evaluation-field--wide">
            <span>Capacidades CNEB a movilizar</span>
            <textarea value={state.cneb_capacities} onChange={(event) => update("cneb_capacities", event.target.value)} placeholder="Ej. Obtiene información del texto; infiere e interpreta; reflexiona y evalúa la forma, el contenido y el contexto." />
          </label>
        </div>
      ) : null}

      {!isQuestions && currentStep === 2 ? (
        <div className="evaluation-form-grid">
          <label>
            <span>Tipo de ficha</span>
            <select value={state.worksheet_type} onChange={(event) => update("worksheet_type", event.target.value)}>
              {['Práctica guiada', 'Aplicación', 'Refuerzo', 'Metacognición'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Cantidad de actividades</span>
            <input type="number" min="2" max="12" value={state.activity_count} onChange={(event) => update("activity_count", Math.max(2, Math.min(12, Number(event.target.value))))} />
          </label>
          <label>
            <span>Dificultad</span>
            <select value={state.difficulty} onChange={(event) => update("difficulty", event.target.value)}>
              {['Inicial', 'Intermedia', 'Desafiante'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="evaluation-field--wide">
            <span>Propósito de aprendizaje</span>
            <textarea value={state.purpose} onChange={(event) => update("purpose", event.target.value)} placeholder="Ej. Explicar relaciones de causa y efecto en el texto y justificar una recomendación para la vida cotidiana." />
          </label>
        </div>
      ) : null}

      {isQuestions && currentStep === 2 ? (
        <div className="evaluation-form-grid">
          <label>
            <span>Formato de preguntas</span>
            <select value={state.question_format} onChange={(event) => update("question_format", event.target.value)}>
              {['Abiertas', 'Opción múltiple', 'Mixtas'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="evaluation-field--wide">
            <span>Ajustes DUA</span>
            <textarea value={state.dua_adjustments} onChange={(event) => update("dua_adjustments", event.target.value)} placeholder="Ej. Instrucciones segmentadas, palabras clave destacadas y opción de responder mediante organizador gráfico." />
          </label>
        </div>
      ) : null}

      {currentStep === 3 ? (
        <div className="evaluation-form-grid">
          {!isQuestions ? (
            <label className="evaluation-field--wide">
              <span>Instrucciones para el estudiante</span>
              <textarea value={state.instructions} onChange={(event) => update("instructions", event.target.value)} placeholder="Ej. Lee cada consigna, resuelve primero con apoyo del ejemplo y explica cómo llegaste a tu respuesta." />
            </label>
          ) : null}
          <label className="evaluation-field--wide">
            <span>Criterios de evaluación</span>
            <textarea value={state.criteria} onChange={(event) => update("criteria", event.target.value)} placeholder="Ej. Ubica información explícita relevante; deduce relaciones; sustenta una opinión con evidencia del texto." />
          </label>
          <label className="evaluation-field--wide">
            <span>{isQuestions ? "Orientaciones de retroalimentación" : "Apoyos y ajustes DUA"}</span>
            <textarea value={isQuestions ? state.feedback_guidance : state.dua_adjustments} onChange={(event) => update(isQuestions ? "feedback_guidance" : "dua_adjustments", event.target.value)} placeholder="Ej. Ofrece una pregunta de apoyo y permite volver al párrafo antes de mostrar la respuesta esperada." />
          </label>
        </div>
      ) : null}

      {currentStep === 4 ? (
        <div className="evaluation-preview">
          <EvaluationPreviewSection title={state.title || (isQuestions ? "Preguntas sobre texto" : "Ficha de aprendizaje")}>
            <dl className="evaluation-preview__meta">
              <div><dt>Docente</dt><dd>{state.frame.teacher_name || "Pendiente"}</dd></div>
              <div><dt>Institución</dt><dd>{state.frame.institution_name || "Pendiente"}</dd></div>
              <div><dt>Modalidad y nivel</dt><dd>{state.frame.modality} · {state.frame.education_level || "Pendiente"}</dd></div>
              <div><dt>Grado / área</dt><dd>{state.frame.grade_or_cycle || "Pendiente"} · {state.frame.curricular_area || "Pendiente"}</dd></div>
            </dl>
          </EvaluationPreviewSection>
          <EvaluationPreviewSection title="Contenido fuente">
            <p className={`source-document__text--${state.source.reading_text_size}`}>{combinedText || "Todavía no se ha añadido contenido."}</p>
          </EvaluationPreviewSection>
          <EvaluationPreviewSection title={isQuestions ? "Diseño de preguntas" : "Diseño de actividades"}>
            <p className={isQuestions ? `source-document__text--${state.source.question_text_size}` : undefined}>
              {isQuestions
                ? `${state.literal_count} literales · ${state.inferential_count} inferenciales · ${state.critical_count} crítico-reflexivas · Formato ${state.question_format}. Se generarán respuestas esperadas y justificación.`
                : `${state.activity_count} actividades de tipo ${state.worksheet_type}, dificultad ${state.difficulty}. Se incluirán ejemplos, práctica guiada y clave de respuestas.`}
            </p>
          </EvaluationPreviewSection>
          <EvaluationPreviewSection title="Criterios y accesibilidad">
            <p>{state.criteria || "Añade criterios observables."}{state.dua_adjustments ? `\n\nApoyos DUA: ${state.dua_adjustments}` : ""}</p>
          </EvaluationPreviewSection>
          <section className="source-generation">
            <div>
              <h3>Contenido pedagógico generado</h3>
              <p>La IA recibe únicamente el contenido pedagógico de esta ficha. Revisa y edita todo antes de guardarlo.</p>
            </div>
            <button className="evaluation-button" type="button" onClick={() => void generateWithAI()} disabled={generating}>
              <Sparkles aria-hidden="true" /> {generating ? "Generando…" : state.artifact ? "Volver a generar con IA" : "Generar con IA"}
            </button>
          </section>
          {generationError ? <div className="evaluation-notice evaluation-notice--error" role="alert">{generationError}</div> : null}
          {state.artifact ? (
            <section className="source-artifact-editor" aria-label="Resultado editable generado con IA">
              <div className="source-artifact-editor__actions"><button className="evaluation-button evaluation-button--secondary" type="button" onClick={() => void downloadWord()} disabled={exporting}><Download aria-hidden="true" /> {exporting ? "Preparando Word…" : "Descargar Word"}</button></div>
              <label><span>Título del documento</span><input value={state.artifact.document_title} onChange={(event) => update("artifact", { ...state.artifact!, document_title: event.target.value })} /></label>
              <label><span>Resumen e indicaciones generales</span><textarea value={state.artifact.executive_summary} onChange={(event) => update("artifact", { ...state.artifact!, executive_summary: event.target.value })} /></label>
              {state.artifact.sections.map((section, index) => (
                <article key={`${section.title}-${index}`}>
                  <h3>{section.title}</h3>
                  <label><span>Desarrollo</span><textarea value={section.narrative} onChange={(event) => updateArtifactSection(index, "narrative", event.target.value)} /></label>
                  <label><span>{isQuestions ? "Preguntas, respuestas o pautas (una por línea)" : "Actividades o puntos clave (uno por línea)"}</span><textarea value={section.key_points.join("\n")} onChange={(event) => updateArtifactSection(index, "key_points", event.target.value)} /></label>
                </article>
              ))}
              {(state.artifact.tables ?? []).map((table, tableIndex) => (
                <article key={`${table.title}-${tableIndex}`}>
                  <h3>{table.title}</h3>
                  <div className="word-table-responsive">
                    <table className="word-table">
                      <thead><tr>{table.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
                      <tbody>{table.rows.map((row, rowIndex) => <tr key={`${table.title}-${rowIndex}`}>{table.columns.map((column, cellIndex) => <td key={`${column}-${cellIndex}`}><textarea aria-label={`${table.title}, fila ${rowIndex + 1}, ${column}`} value={row[cellIndex] ?? ""} onChange={(event) => updateArtifactTableCell(tableIndex, rowIndex, cellIndex, event.target.value)} /></td>)}</tr>)}</tbody>
                    </table>
                  </div>
                  {table.note ? <p>{table.note}</p> : null}
                </article>
              ))}
            </section>
          ) : null}
        </div>
      ) : null}
    </EvaluationWizard>
    <GenerationProgressOverlay
      open={generating}
      toolTitle={isQuestions ? "Preguntas sobre texto" : "Ficha de aprendizaje"}
      family="evaluamos"
    />
    </>
  );
}

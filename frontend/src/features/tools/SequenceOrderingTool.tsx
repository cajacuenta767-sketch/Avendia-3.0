import {
  ArrowDown,
  ArrowUp,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  GripVertical,
  Lightbulb,
  LoaderCircle,
  Save,
  School,
  Shuffle,
  Sparkles,
  Trophy,
  UserRound,
  WandSparkles,
  XCircle,
} from "lucide-react";
import { type DragEvent, type FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  areasByLevel,
  educationModalities,
  getEducationLevels,
  gradesByLevel,
  type EducationLevel,
} from "../../config/education";
import { ApiError, apiRequest } from "../../lib/api";
import { sessionDraftScope } from "../../lib/session";
import { FormValidationSummary, type FormValidationItem } from "./FormValidationSummary";

type EducationModality = (typeof educationModalities)[number]["value"];

const sequenceTypes = [
  "Proceso científico o natural",
  "Secuencia cronológica o histórica",
  "Algoritmo o procedimiento",
  "Secuencia narrativa",
] as const;

type SequenceType = (typeof sequenceTypes)[number];

export type SequenceOrderingForm = {
  teacherName: string;
  institution: string;
  modality: EducationModality;
  level: EducationLevel | "";
  grade: string;
  curricularArea: string;
  sequenceType: SequenceType;
  topic: string;
  stepCount: number;
};

export type SequenceOrderingBlock = {
  id: string;
  correct_order: number;
  text: string;
  hint: string;
};

export type SequenceOrderingResult = {
  activity_title: string;
  instructions: string;
  pedagogical_rationale: string;
  blocks: SequenceOrderingBlock[];
  model: string;
};

type StoredDraft = {
  version: 1;
  documentId?: string;
  serverVersion?: number;
  updatedAt?: string;
  form: SequenceOrderingForm;
  result: SequenceOrderingResult | null;
};

type Feedback = { correct: number; total: number } | null;

const STEP_LABELS = [
  { number: 1, title: "Datos", detail: "Tipo y contexto" },
  { number: 2, title: "Revisar", detail: "Secuencia creada por IA" },
  { number: 3, title: "Ordenar", detail: "Actividad interactiva" },
] as const;

function readProfile(): Partial<SequenceOrderingForm> {
  try {
    const profile = JSON.parse(sessionStorage.getItem("avendia.user") ?? "{}") as Record<
      string,
      unknown
    >;
    return {
      teacherName: String(profile.full_name ?? ""),
      institution: String(profile.school_name ?? ""),
      modality: (String(profile.education_modality ?? "EBR") || "EBR") as EducationModality,
      level: String(profile.education_level ?? "") as EducationLevel | "",
      grade: String(profile.grade ?? ""),
      curricularArea: String(profile.curricular_area ?? ""),
    };
  } catch {
    return {};
  }
}

function defaultForm(): SequenceOrderingForm {
  const profile = readProfile();
  const modality = profile.modality ?? "EBR";
  const level = profile.level && getEducationLevels(modality).some((item) => item === profile.level) ? profile.level : "";
  return {
    teacherName: profile.teacherName ?? "",
    institution: profile.institution ?? "",
    sequenceType: "Proceso científico o natural",
    topic: "",
    stepCount: 5,
    modality,
    level,
    grade: level && gradesByLevel[level]?.includes(profile.grade ?? "") ? profile.grade ?? "" : "",
    curricularArea: level && areasByLevel[level]?.includes(profile.curricularArea ?? "") ? profile.curricularArea ?? "" : "",
  };
}

function loadDraft(storageKey: string): StoredDraft {
  const fallback: StoredDraft = { version: 1, form: defaultForm(), result: null };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as StoredDraft | null;
    if (!saved || saved.version !== 1) return fallback;
    return {
      ...fallback,
      ...saved,
      form: {
        ...fallback.form,
        ...saved.form,
        teacherName: saved.form.teacherName || fallback.form.teacherName,
        institution: saved.form.institution || fallback.form.institution,
        modality: saved.form.modality || fallback.form.modality,
        level: saved.form.level || fallback.form.level,
        grade: saved.form.grade || fallback.form.grade,
        curricularArea: saved.form.curricularArea || fallback.form.curricularArea,
      },
    };
  } catch {
    return fallback;
  }
}

function shuffledBlockIds(blocks: SequenceOrderingBlock[]): string[] {
  const ids = blocks.map((block) => block.id);
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [ids[index], ids[randomIndex]] = [ids[randomIndex], ids[index]];
  }
  const remainedOrdered = ids.every((id, index) => id === blocks[index]?.id);
  return remainedOrdered ? ids.reverse() : ids;
}

function safeMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "No pudimos completar esta acción. Inténtalo nuevamente.";
}

export function SequenceOrderingTool() {
  const [searchParams] = useSearchParams();
  const [storageKey] = useState(
    () => `avendia.draft.ordenar-bloques.v1.${sessionDraftScope()}`,
  );
  const [initialDraft] = useState(() => loadDraft(storageKey));
  const [form, setForm] = useState<SequenceOrderingForm>(initialDraft.form);
  const [result, setResult] = useState<SequenceOrderingResult | null>(initialDraft.result);
  const [activeStep, setActiveStep] = useState(initialDraft.result ? 2 : 1);
  const [orderedIds, setOrderedIds] = useState<string[]>(() =>
    initialDraft.result ? shuffledBlockIds(initialDraft.result.blocks) : [],
  );
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
  const [visibleHints, setVisibleHints] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");
  const [validationItems, setValidationItems] = useState<FormValidationItem[]>([]);
  const [documentId, setDocumentId] = useState(initialDraft.documentId ?? "");
  const [serverVersion, setServerVersion] = useState(initialDraft.serverVersion ?? 0);
  const documentIdFromUrl = searchParams.get("document");

  useEffect(() => {
    const draft: StoredDraft = { version: 1, documentId: documentId || undefined, serverVersion, updatedAt: new Date().toISOString(), form, result };
    localStorage.setItem(storageKey, JSON.stringify(draft));
  }, [documentId, form, result, serverVersion, storageKey]);

  useEffect(() => {
    if (!documentIdFromUrl || documentId === documentIdFromUrl) return;
    const token = sessionStorage.getItem("avendia.accessToken");
    if (!token) return;
    type StoredDocument = { id: string; content: string | null; metadata_json: Record<string, unknown> };
    void apiRequest<StoredDocument>(`/documents/${documentIdFromUrl}`, { headers: { Authorization: `Bearer ${token}` } }).then((document) => {
      const metadata = document.metadata_json ?? {};
      const nextForm = metadata.form && typeof metadata.form === "object" ? metadata.form as SequenceOrderingForm : form;
      let nextResult = metadata.result && typeof metadata.result === "object" ? metadata.result as SequenceOrderingResult : null;
      if (!nextResult && document.content) {
        try { nextResult = JSON.parse(document.content) as SequenceOrderingResult; } catch { nextResult = null; }
      }
      setForm(nextForm);
      if (nextResult) {
        setResult(nextResult);
        setOrderedIds(shuffledBlockIds(nextResult.blocks));
        setActiveStep(2);
      }
      setDocumentId(document.id);
      setServerVersion(Number(metadata.version ?? 1));
      setSaved(true);
    }).catch((requestError) => setError(safeMessage(requestError)));
  }, [documentId, documentIdFromUrl, form]);

  const gradeOptions = form.level ? gradesByLevel[form.level] ?? [] : [];
  const areaOptions = form.level ? areasByLevel[form.level] ?? [] : [];
  const educationLevels = getEducationLevels(form.modality);
  const formIsValid = Boolean(
    form.teacherName.trim() &&
      form.institution.trim() &&
      form.modality &&
      form.level &&
      form.grade &&
      form.curricularArea &&
      form.sequenceType &&
      form.topic.trim().length >= 3,
  );
  const missingFormItems: FormValidationItem[] = [
    !form.teacherName.trim() ? { id: "sequence-teacher", label: "Nombre del docente" } : null,
    !form.institution.trim() ? { id: "sequence-institution", label: "Institución educativa" } : null,
    !form.modality ? { id: "sequence-modality", label: "Modalidad educativa" } : null,
    !form.level ? { id: "sequence-level", label: "Nivel educativo" } : null,
    !form.grade ? { id: "sequence-grade", label: "Grado o aula" } : null,
    !form.curricularArea ? { id: "sequence-area", label: "Área curricular CNEB" } : null,
    !form.sequenceType ? { id: "sequence-type", label: "Tipo de secuencia" } : null,
    form.topic.trim().length < 3 ? { id: "sequence-topic", label: "Tema o proceso central", message: "Escribe un tema concreto de al menos 3 caracteres." } : null,
  ].filter((item): item is FormValidationItem => Boolean(item));
  const resultIsValid = Boolean(
    result?.activity_title?.trim() &&
      result.instructions?.trim() &&
      String(result.pedagogical_rationale ?? "").trim() &&
      result.blocks?.length === form.stepCount &&
      result.blocks.every((block) => Boolean(block.text?.trim())),
  );

  function updateForm<K extends keyof SequenceOrderingForm>(
    field: K,
    value: SequenceOrderingForm[K],
  ) {
    setForm((current) => field === "modality"
      ? { ...current, [field]: value, level: "", grade: "", curricularArea: "" }
      : { ...current, [field]: value });
    setSaved(false);
    setError("");
    setValidationItems([]);
  }

  function changeLevel(level: EducationLevel | "") {
    setForm((current) => ({
      ...current,
      level,
      grade: gradesByLevel[level]?.includes(current.grade) ? current.grade : "",
      curricularArea: areasByLevel[level]?.includes(current.curricularArea)
        ? current.curricularArea
        : "",
    }));
    setSaved(false);
    setValidationItems([]);
  }

  async function generateActivity(event?: FormEvent) {
    event?.preventDefault();
    if (!formIsValid) {
      setError("");
      setValidationItems(missingFormItems);
      return;
    }
    setValidationItems([]);
    const token = sessionStorage.getItem("avendia.accessToken");
    if (!token) {
      setError("Tu sesión no está activa. Vuelve a ingresar para utilizar Avend IA.");
      return;
    }

    setLoading(true);
    setError("");
    setSaved(false);
    try {
      const generated = await apiRequest<SequenceOrderingResult>(
        "/ai/tools/ordenar-bloques/generate",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            modality: form.modality,
            level: form.level,
            grade: form.grade,
            curricular_area: form.curricularArea,
            sequence_type: form.sequenceType,
            topic: form.topic,
            step_count: form.stepCount,
          }),
        },
      );
      setResult(generated);
      setOrderedIds(shuffledBlockIds(generated.blocks));
      setVisibleHints({});
      setFeedback(null);
      setActiveStep(2);
    } catch (requestError) {
      setError(safeMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  function updateResultField(
    field: "activity_title" | "instructions" | "pedagogical_rationale",
    value: string,
  ) {
    setResult((current) => (current ? { ...current, [field]: value } : current));
    setSaved(false);
  }

  function updateBlock(blockId: string, field: "text" | "hint", value: string) {
    setResult((current) =>
      current
        ? {
            ...current,
            blocks: current.blocks.map((block) =>
              block.id === blockId ? { ...block, [field]: value } : block,
            ),
          }
        : current,
    );
    setSaved(false);
  }

  function startPractice() {
    if (!result || !resultIsValid) return;
    setOrderedIds(shuffledBlockIds(result.blocks));
    setVisibleHints({});
    setFeedback(null);
    setActiveStep(3);
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setOrderedIds((current) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
    setFeedback(null);
  }

  function dropBlock(event: DragEvent<HTMLElement>, targetId: string) {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData("text/plain") || draggedBlockId;
    if (!sourceId || sourceId === targetId) return;
    setOrderedIds((current) => {
      const next = current.filter((id) => id !== sourceId);
      const targetIndex = next.indexOf(targetId);
      next.splice(targetIndex, 0, sourceId);
      return next;
    });
    setDraggedBlockId(null);
    setFeedback(null);
  }

  function mixBlocks() {
    if (!result) return;
    setOrderedIds(shuffledBlockIds(result.blocks));
    setVisibleHints({});
    setFeedback(null);
  }

  function verifyOrder() {
    if (!result) return;
    const byId = new Map(result.blocks.map((block) => [block.id, block]));
    const correct = orderedIds.reduce(
      (score, id, index) => score + Number(byId.get(id)?.correct_order === index + 1),
      0,
    );
    setFeedback({ correct, total: result.blocks.length });
  }

  function revealSolution() {
    if (!result) return;
    setOrderedIds(
      [...result.blocks]
        .sort((left, right) => left.correct_order - right.correct_order)
        .map((block) => block.id),
    );
    setFeedback({ correct: result.blocks.length, total: result.blocks.length });
  }

  async function saveDraft() {
    if (!result) return;
    const token = sessionStorage.getItem("avendia.accessToken");
    if (!token) {
      setError("Tu sesión no está activa. Vuelve a ingresar para guardar el borrador.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      type StoredDocument = { id: string };
      const nextVersion = serverVersion + 1;
      const stored = await apiRequest<StoredDocument>(documentId ? `/documents/${documentId}` : "/documents", {
        method: documentId ? "PATCH" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: result.activity_title,
          document_type: "ordenar-bloques",
          content: JSON.stringify(result),
          metadata: {
            teacher_name: form.teacherName,
            institution: form.institution,
            modality: form.modality,
            level: form.level,
            grade: form.grade,
            curricular_area: form.curricularArea,
            sequence_type: form.sequenceType,
            topic: form.topic,
            step_count: form.stepCount,
            version: nextVersion,
            source_route: "/dashboard/recursos/ordenar-bloques",
            form,
            result,
          },
        }),
      });
      setDocumentId(stored.id);
      setServerVersion(nextVersion);
      setSaved(true);
    } catch (requestError) {
      setError(safeMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function downloadDocument() {
    if (!result) return;
    setExporting(true);
    setError("");
    try {
      const { exportSequenceOrderingDocx } = await import("./exportSequenceOrderingDocx");
      await exportSequenceOrderingDocx(form, result);
    } catch {
      setError("No se pudo preparar el documento Word.");
    } finally {
      setExporting(false);
    }
  }

  const blocksById = new Map((result?.blocks ?? []).map((block) => [block.id, block]));

  return (
    <main className="word-grouping-page sequence-ordering-page">
      <div className="word-grouping-shell">
        <header className="word-grouping-header">
          <div className="word-grouping-heading">
            <span>Recursos didácticos</span>
            <h1>Ordenar bloques y secuencias</h1>
            <p>Crea con IA una secuencia real, revísala y conviértela en un reto interactivo.</p>
          </div>
          {result ? (
            <button
              className="secondary-button word-grouping-save"
              type="button"
              onClick={saveDraft}
              disabled={saving}
            >
              {saved ? <Check /> : <Save />}
              {saving ? "Guardando…" : saved ? "Guardado" : "Guardar borrador"}
            </button>
          ) : null}
        </header>

        <nav className="tool-stepper" aria-label="Progreso de la herramienta">
          <ol>
            {STEP_LABELS.map((step) => {
              const isActive = activeStep === step.number;
              const isCompleted = activeStep > step.number;
              const isAvailable = step.number === 1 || Boolean(result);
              return (
                <li
                  key={step.number}
                  className={`${isActive ? "is-active" : ""} ${isCompleted ? "is-completed" : ""}`}
                >
                  <button
                    type="button"
                    disabled={!isAvailable}
                    onClick={() => isAvailable && setActiveStep(step.number)}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <span className="tool-stepper__number">{isCompleted ? <Check /> : step.number}</span>
                    <span className="tool-stepper__copy">
                      <small>Paso {step.number}</small>
                      <strong>{step.title}</strong>
                      <em>{step.detail}</em>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {error ? (
          <div className="tool-alert tool-alert--error" role="alert">
            <XCircle />
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} aria-label="Cerrar mensaje">×</button>
          </div>
        ) : null}
        <FormValidationSummary items={validationItems} />

        {activeStep === 1 ? (
          <form className="word-grouping-panel" noValidate onSubmit={generateActivity}>
            <div className="word-grouping-panel__intro">
              <span>Paso 1 de 3</span>
              <h2>Datos generales y tipo de secuencia</h2>
              <p>Indica qué aprenderá el grupo y Avend IA construirá un orden lógico verificable.</p>
            </div>

            <div className="word-grouping-form-grid">
              <label>
                <span><UserRound /> Nombre del docente <b>Obligatorio</b></span>
                <input
                  id="sequence-teacher"
                  value={form.teacherName}
                  onChange={(event) => updateForm("teacherName", event.target.value)}
                  placeholder="Ej. Prof. María Gómez"
                  required
                />
              </label>
              <label>
                <span><Building2 /> Institución educativa <b>Obligatorio</b></span>
                <input
                  id="sequence-institution"
                  value={form.institution}
                  onChange={(event) => updateForm("institution", event.target.value)}
                  placeholder="Ej. I.E. José María Arguedas"
                  required
                />
              </label>
              <label className="word-grouping-field--wide">
                <span><School /> Modalidad educativa <b>Obligatorio</b></span>
                <select
                  id="sequence-modality"
                  value={form.modality}
                  onChange={(event) => updateForm("modality", event.target.value as EducationModality)}
                  required
                >
                  {educationModalities.map((modality) => (
                    <option key={modality.value} value={modality.value}>{modality.label}</option>
                  ))}
                </select>
                <small>Selecciona EBR, EBA o EBE según el servicio educativo.</small>
              </label>
              <label>
                <span>Nivel educativo <b>Obligatorio</b></span>
                <select
                  id="sequence-level"
                  value={form.level}
                  onChange={(event) => changeLevel(event.target.value as EducationLevel)}
                  required
                >
                  <option value="">Selecciona el nivel</option>
                  {educationLevels.map((level) => <option key={level}>{level}</option>)}
                </select>
              </label>
              <label>
                <span>Grado o aula <b>Obligatorio</b></span>
                <select
                  id="sequence-grade"
                  value={form.grade}
                  onChange={(event) => updateForm("grade", event.target.value)}
                  disabled={!form.level}
                  required
                >
                  <option value="">{form.level ? "Selecciona el grado" : "Primero selecciona el nivel"}</option>
                  {gradeOptions.map((grade) => <option key={grade}>{grade}</option>)}
                </select>
              </label>
              <label>
                <span>Área curricular CNEB <b>Obligatorio</b></span>
                <select
                  id="sequence-area"
                  value={form.curricularArea}
                  onChange={(event) => updateForm("curricularArea", event.target.value)}
                  disabled={!form.level}
                  required
                >
                  <option value="">{form.level ? "Selecciona el área" : "Primero selecciona el nivel"}</option>
                  {areaOptions.map((area) => <option key={area}>{area}</option>)}
                </select>
              </label>
              <label>
                <span>Tipo de secuencia <b>Obligatorio</b></span>
                <select
                  id="sequence-type"
                  value={form.sequenceType}
                  onChange={(event) => updateForm("sequenceType", event.target.value as SequenceType)}
                >
                  {sequenceTypes.map((sequenceType) => <option key={sequenceType}>{sequenceType}</option>)}
                </select>
              </label>
              <label>
                <span>Cantidad de bloques</span>
                <select
                  value={form.stepCount}
                  onChange={(event) => updateForm("stepCount", Number(event.target.value))}
                >
                  <option value={4}>4 bloques · Inicio o primaria baja</option>
                  <option value={5}>5 bloques · Recomendado</option>
                  <option value={6}>6 bloques · Proceso detallado</option>
                  <option value={7}>7 bloques · Nivel avanzado</option>
                  <option value={8}>8 bloques · Secuencia extensa</option>
                </select>
              </label>
              <label className="word-grouping-field--wide">
                <span>Tema o proceso central <b>Obligatorio</b></span>
                <textarea
                  id="sequence-topic"
                  rows={3}
                  value={form.topic}
                  onChange={(event) => updateForm("topic", event.target.value)}
                  placeholder="Ej. Etapas del ciclo del agua y sus transformaciones"
                  minLength={3}
                  required
                />
                <small>Escribe un proceso concreto; la IA evitará bloques genéricos o intercambiables.</small>
              </label>
            </div>

            <footer className="word-grouping-actions word-grouping-actions--end">
              <button className="word-grouping-primary" type="submit" disabled={loading}>
                {loading ? <LoaderCircle className="is-spinning" /> : <WandSparkles />}
                {loading ? "Construyendo el orden lógico…" : "Generar secuencia con Avend IA"}
                {!loading ? <ChevronRight /> : null}
              </button>
            </footer>
          </form>
        ) : null}

        {activeStep === 2 && result ? (
          <section className="word-grouping-panel">
            <div className="word-grouping-panel__intro word-grouping-panel__intro--row">
              <div>
                <span>Paso 2 de 3</span>
                <h2>Revisa el orden y las pistas</h2>
                <p>La propuesta aparece en su orden correcto. Edita cualquier contenido antes de publicarla.</p>
              </div>
              <button type="button" className="secondary-button" onClick={() => generateActivity()} disabled={loading}>
                <Sparkles /> {loading ? "Regenerando…" : "Regenerar"}
              </button>
            </div>

            <div className="word-grouping-result-meta sequence-result-meta">
              <label>
                <span>Título de la actividad</span>
                <input
                  value={result.activity_title}
                  onChange={(event) => updateResultField("activity_title", event.target.value)}
                />
              </label>
              <label>
                <span>Instrucciones para el estudiante</span>
                <textarea
                  rows={2}
                  value={result.instructions}
                  onChange={(event) => updateResultField("instructions", event.target.value)}
                />
              </label>
              <label className="sequence-rationale-field">
                <span>Fundamento y lógica para el docente</span>
                <textarea
                  rows={3}
                  value={result.pedagogical_rationale ?? ""}
                  onChange={(event) => updateResultField("pedagogical_rationale", event.target.value)}
                />
              </label>
            </div>

            <ol className="sequence-editor-list">
              {[...result.blocks]
                .sort((left, right) => left.correct_order - right.correct_order)
                .map((block) => (
                  <li key={block.id}>
                    <span className="sequence-editor-order">{block.correct_order}</span>
                    <div>
                      <label>
                        <span>Contenido del bloque</span>
                        <textarea
                          rows={2}
                          value={block.text}
                          onChange={(event) => updateBlock(block.id, "text", event.target.value)}
                        />
                      </label>
                      <label>
                        <span>Pista sin revelar la respuesta</span>
                        <input
                          value={block.hint}
                          onChange={(event) => updateBlock(block.id, "hint", event.target.value)}
                        />
                      </label>
                    </div>
                  </li>
                ))}
            </ol>

            {!resultIsValid ? (
              <p className="word-grouping-validation">Completa el título, las instrucciones, la explicación y todos los bloques.</p>
            ) : null}

            <footer className="word-grouping-actions">
              <button type="button" className="secondary-button" onClick={() => setActiveStep(1)}>
                <ChevronLeft /> Volver a los datos
              </button>
              <button type="button" className="word-grouping-primary" onClick={startPractice} disabled={!resultIsValid}>
                Preparar reto interactivo <ChevronRight />
              </button>
            </footer>
          </section>
        ) : null}

        {activeStep === 3 && result ? (
          <section className="word-grouping-panel">
            <div className="word-grouping-panel__intro word-grouping-panel__intro--row">
              <div>
                <span>Paso 3 de 3</span>
                <h2>{result.activity_title}</h2>
                <p>{result.instructions}</p>
              </div>
              <div className="word-grouping-board-tools">
                <button type="button" onClick={mixBlocks}><Shuffle /> Mezclar</button>
                <button type="button" onClick={revealSolution}><Eye /> Ver solución</button>
              </div>
            </div>

            {feedback ? (
              <div className={`score-banner ${feedback.correct === feedback.total ? "score-banner--perfect" : ""}`} role="status">
                <Trophy />
                <span>
                  <strong>{feedback.correct === feedback.total ? "¡Secuencia completa!" : "Resultado del ordenamiento"}</strong>
                  {feedback.correct} de {feedback.total} bloques están en la posición correcta.
                </span>
              </div>
            ) : null}

            <div className="sequence-board-note">
              <GripVertical />
              <span>Arrastra los bloques o usa las flechas. Las pistas orientan sin mostrar el número correcto.</span>
            </div>

            <ol className="sequence-board-list">
              {orderedIds.map((blockId, index) => {
                const block = blocksById.get(blockId);
                if (!block) return null;
                const isCorrect = feedback ? block.correct_order === index + 1 : null;
                return (
                  <li
                    key={block.id}
                    draggable
                    className={feedback ? (isCorrect ? "is-correct" : "is-incorrect") : ""}
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", block.id);
                      event.dataTransfer.effectAllowed = "move";
                      setDraggedBlockId(block.id);
                    }}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => dropBlock(event, block.id)}
                    onDragEnd={() => setDraggedBlockId(null)}
                  >
                    <span className="sequence-board-position">{index + 1}</span>
                    <GripVertical className="sequence-board-grip" />
                    <div className="sequence-board-content">
                      <p>{block.text}</p>
                      {visibleHints[block.id] ? <small><Lightbulb /> {block.hint}</small> : null}
                    </div>
                    <div className="sequence-board-controls">
                      <button
                        type="button"
                        onClick={() => setVisibleHints((current) => ({ ...current, [block.id]: !current[block.id] }))}
                        aria-label={`${visibleHints[block.id] ? "Ocultar" : "Ver"} pista del bloque ${index + 1}`}
                      >
                        <Lightbulb />
                      </button>
                      <button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0} aria-label={`Subir bloque ${index + 1}`}>
                        <ArrowUp />
                      </button>
                      <button type="button" onClick={() => moveBlock(index, 1)} disabled={index === orderedIds.length - 1} aria-label={`Bajar bloque ${index + 1}`}>
                        <ArrowDown />
                      </button>
                    </div>
                    {feedback ? (isCorrect ? <CheckCircle2 className="sequence-board-status" /> : <XCircle className="sequence-board-status" />) : null}
                  </li>
                );
              })}
            </ol>

            <footer className="word-grouping-actions word-grouping-actions--board sequence-actions-board">
              <button type="button" className="secondary-button" onClick={() => setActiveStep(2)}>
                <ChevronLeft /> Editar contenido
              </button>
              <button type="button" className="word-grouping-verify" onClick={verifyOrder}>
                <CheckCircle2 /> Verificar orden
              </button>
              <button type="button" className="word-grouping-download" onClick={downloadDocument} disabled={exporting}>
                <Download /> {exporting ? "Preparando Word…" : "Descargar actividad y solucionario"}
              </button>
            </footer>
          </section>
        ) : null}
      </div>
    </main>
  );
}

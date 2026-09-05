import {
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  GripVertical,
  LoaderCircle,
  Plus,
  RotateCcw,
  Save,
  School,
  Shuffle,
  Sparkles,
  Trash2,
  Trophy,
  UserRound,
  WandSparkles,
  XCircle,
} from "lucide-react";
import { DragEvent, FormEvent, useEffect, useMemo, useState } from "react";
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

type WordGroupingForm = {
  teacherName: string;
  institution: string;
  modality: EducationModality;
  level: EducationLevel | "";
  grade: string;
  curricularArea: string;
  topic: string;
  categoryCount: number;
};

export type WordGroupingCategory = {
  id: string;
  name: string;
  explanation: string;
};

export type WordGroupingWord = {
  id: string;
  word: string;
  correct_category_id: string;
};

export type WordGroupingResult = {
  activity_title: string;
  instructions: string;
  categories: WordGroupingCategory[];
  words: WordGroupingWord[];
  model: string;
};

type StoredDraft = {
  version: 1;
  documentId?: string;
  serverVersion?: number;
  updatedAt?: string;
  form: WordGroupingForm;
  result: WordGroupingResult | null;
};

type Feedback = { correct: number; total: number } | null;

const STEP_LABELS = [
  { number: 1, title: "Datos", detail: "Contexto curricular" },
  { number: 2, title: "Configurar", detail: "Propuesta de IA" },
  { number: 3, title: "Practicar", detail: "Tablero interactivo" },
] as const;

function readProfile(): Partial<WordGroupingForm> {
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

function defaultForm(): WordGroupingForm {
  const profile = readProfile();
  const modality = profile.modality ?? "EBR";
  const level = profile.level && getEducationLevels(modality).some((item) => item === profile.level) ? profile.level : "";
  return {
    teacherName: profile.teacherName ?? "",
    institution: profile.institution ?? "",
    topic: "",
    categoryCount: 3,
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

function shuffledIds(words: WordGroupingWord[]): string[] {
  const ids = words.map((word) => word.id);
  for (let index = ids.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [ids[index], ids[randomIndex]] = [ids[randomIndex], ids[index]];
  }
  return ids;
}

function emptyPlacements(words: WordGroupingWord[]): Record<string, string | null> {
  return Object.fromEntries(words.map((word) => [word.id, null]));
}

function safeMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "No pudimos completar esta acción. Inténtalo nuevamente.";
}

export function WordGroupingTool() {
  const [searchParams] = useSearchParams();
  const [storageKey] = useState(() => `avendia.draft.agrupar-palabras.v1.${sessionDraftScope()}`);
  const [initialDraft] = useState(() => loadDraft(storageKey));
  const [form, setForm] = useState<WordGroupingForm>(initialDraft.form);
  const [result, setResult] = useState<WordGroupingResult | null>(initialDraft.result);
  const [activeStep, setActiveStep] = useState(initialDraft.result ? 2 : 1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [validationItems, setValidationItems] = useState<FormValidationItem[]>([]);
  const [documentId, setDocumentId] = useState(initialDraft.documentId ?? "");
  const [serverVersion, setServerVersion] = useState(initialDraft.serverVersion ?? 0);
  const documentIdFromUrl = searchParams.get("document");
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [wordOrder, setWordOrder] = useState<string[]>(() =>
    initialDraft.result ? shuffledIds(initialDraft.result.words) : [],
  );
  const [placements, setPlacements] = useState<Record<string, string | null>>(() =>
    initialDraft.result ? emptyPlacements(initialDraft.result.words) : {},
  );
  const [feedback, setFeedback] = useState<Feedback>(null);

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
      const nextForm = metadata.form && typeof metadata.form === "object" ? metadata.form as WordGroupingForm : form;
      let nextResult = metadata.result && typeof metadata.result === "object" ? metadata.result as WordGroupingResult : null;
      if (!nextResult && document.content) {
        try { nextResult = JSON.parse(document.content) as WordGroupingResult; } catch { nextResult = null; }
      }
      setForm(nextForm);
      if (nextResult) {
        setResult(nextResult);
        setWordOrder(shuffledIds(nextResult.words));
        setPlacements(emptyPlacements(nextResult.words));
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
      form.topic.trim().length >= 3,
  );
  const missingFormItems: FormValidationItem[] = [
    !form.teacherName.trim() ? { id: "word-grouping-teacher", label: "Nombre del docente" } : null,
    !form.institution.trim() ? { id: "word-grouping-institution", label: "Institución educativa" } : null,
    !form.modality ? { id: "word-grouping-modality", label: "Modalidad educativa" } : null,
    !form.level ? { id: "word-grouping-level", label: "Nivel educativo" } : null,
    !form.grade ? { id: "word-grouping-grade", label: "Grado o aula" } : null,
    !form.curricularArea ? { id: "word-grouping-area", label: "Área curricular CNEB" } : null,
    form.topic.trim().length < 3 ? { id: "word-grouping-topic", label: "Tema o criterio taxonómico", message: "Escribe un tema concreto de al menos 3 caracteres." } : null,
  ].filter((item): item is FormValidationItem => Boolean(item));
  const resultIsValid = Boolean(
    result?.activity_title.trim() &&
      result.instructions.trim() &&
      result.categories.length >= 2 &&
      result.categories.every(
        (category) =>
          category.name.trim() &&
          result.words.filter((word) => word.correct_category_id === category.id).length >= 2,
      ) &&
      result.words.every((word) => word.word.trim()),
  );
  const allPlaced = Boolean(
    result?.words.length && result.words.every((word) => placements[word.id]),
  );

  const wordsById = useMemo(
    () => new Map((result?.words ?? []).map((word) => [word.id, word])),
    [result?.words],
  );

  function updateForm<K extends keyof WordGroupingForm>(field: K, value: WordGroupingForm[K]) {
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
      const generated = await apiRequest<WordGroupingResult>(
        "/ai/tools/agrupar-palabras/generate",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            modality: form.modality,
            level: form.level,
            grade: form.grade,
            curricular_area: form.curricularArea,
            topic: form.topic,
            category_count: form.categoryCount,
          }),
        },
      );
      setResult(generated);
      setWordOrder(shuffledIds(generated.words));
      setPlacements(emptyPlacements(generated.words));
      setSelectedWordId(null);
      setFeedback(null);
      setActiveStep(2);
    } catch (requestError) {
      setError(safeMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  function updateCategory(categoryId: string, field: "name" | "explanation", value: string) {
    setResult((current) =>
      current
        ? {
            ...current,
            categories: current.categories.map((category) =>
              category.id === categoryId ? { ...category, [field]: value } : category,
            ),
          }
        : current,
    );
    setSaved(false);
  }

  function updateWord(wordId: string, value: string) {
    setResult((current) =>
      current
        ? {
            ...current,
            words: current.words.map((word) =>
              word.id === wordId ? { ...word, word: value } : word,
            ),
          }
        : current,
    );
    setSaved(false);
  }

  function removeWord(wordId: string) {
    setResult((current) =>
      current ? { ...current, words: current.words.filter((word) => word.id !== wordId) } : current,
    );
    setSaved(false);
  }

  function addWord(categoryId: string) {
    setResult((current) => {
      if (!current) return current;
      const newWord: WordGroupingWord = {
        id: `word-custom-${crypto.randomUUID()}`,
        word: "",
        correct_category_id: categoryId,
      };
      return { ...current, words: [...current.words, newWord] };
    });
    setSaved(false);
  }

  function startPractice() {
    if (!result || !resultIsValid) return;
    setWordOrder(shuffledIds(result.words));
    setPlacements(emptyPlacements(result.words));
    setSelectedWordId(null);
    setFeedback(null);
    setActiveStep(3);
  }

  function placeWord(wordId: string, categoryId: string) {
    setPlacements((current) => ({ ...current, [wordId]: categoryId }));
    setSelectedWordId(null);
    setFeedback(null);
  }

  function dropWord(event: DragEvent<HTMLElement>, categoryId: string) {
    event.preventDefault();
    const wordId = event.dataTransfer.getData("text/plain");
    if (wordId) placeWord(wordId, categoryId);
  }

  function resetBoard(shuffle = false) {
    if (!result) return;
    setPlacements(emptyPlacements(result.words));
    setSelectedWordId(null);
    setFeedback(null);
    if (shuffle) setWordOrder(shuffledIds(result.words));
  }

  function verifyAnswers() {
    if (!result || !allPlaced) return;
    const correct = result.words.reduce(
      (score, word) => score + Number(placements[word.id] === word.correct_category_id),
      0,
    );
    setFeedback({ correct, total: result.words.length });
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
          document_type: "agrupar-palabras",
          content: JSON.stringify(result),
          metadata: {
            teacher_name: form.teacherName,
            institution: form.institution,
            modality: form.modality,
            level: form.level,
            grade: form.grade,
            curricular_area: form.curricularArea,
            topic: form.topic,
            category_count: form.categoryCount,
            version: nextVersion,
            source_route: "/dashboard/recursos/agrupar-palabras",
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
      const { exportWordGroupingDocx } = await import("./exportWordGroupingDocx");
      await exportWordGroupingDocx(form, result);
    } catch {
      setError("No se pudo preparar el documento Word.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <main className="word-grouping-page">
      <div className="word-grouping-shell">
        <header className="word-grouping-header">
          <div className="word-grouping-heading">
            <span>Recursos didácticos</span>
            <h1>Agrupar palabras y taxonomías</h1>
            <p>Genera categorías con IA, revísalas y conviértelas en una actividad interactiva.</p>
          </div>
          {result ? (
            <button className="secondary-button word-grouping-save" type="button" onClick={saveDraft} disabled={saving}>
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
                <li key={step.number} className={isActive ? "is-active" : isCompleted ? "is-completed" : ""}>
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
              <h2>Datos generales y ámbito curricular</h2>
              <p>Completa el contexto para que Avend IA cree una clasificación adecuada al grupo.</p>
            </div>

            <div className="word-grouping-form-grid">
              <label>
                <span><UserRound /> Nombre del docente <b>Obligatorio</b></span>
                <input
                  id="word-grouping-teacher"
                  value={form.teacherName}
                  onChange={(event) => updateForm("teacherName", event.target.value)}
                  placeholder="Ej. Prof. María Gómez"
                  required
                />
              </label>
              <label>
                <span><Building2 /> Institución educativa <b>Obligatorio</b></span>
                <input
                  id="word-grouping-institution"
                  value={form.institution}
                  onChange={(event) => updateForm("institution", event.target.value)}
                  placeholder="Ej. I.E. José María Arguedas"
                  required
                />
              </label>
              <label className="word-grouping-field--wide">
                <span><School /> Modalidad educativa <b>Obligatorio</b></span>
                <select
                  id="word-grouping-modality"
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
                  id="word-grouping-level"
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
                  id="word-grouping-grade"
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
                  id="word-grouping-area"
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
                <span>Número de categorías</span>
                <select
                  value={form.categoryCount}
                  onChange={(event) => updateForm("categoryCount", Number(event.target.value))}
                >
                  <option value={2}>2 categorías · Comparación</option>
                  <option value={3}>3 categorías · Recomendado</option>
                  <option value={4}>4 categorías · Avanzado</option>
                </select>
              </label>
              <label className="word-grouping-field--wide">
                <span>Tema o criterio taxonómico <b>Obligatorio</b></span>
                <textarea
                  id="word-grouping-topic"
                  rows={3}
                  value={form.topic}
                  onChange={(event) => updateForm("topic", event.target.value)}
                  placeholder="Ej. Clasificación de los animales según su alimentación"
                  minLength={3}
                  required
                />
                <small>Describe un tema concreto; la IA no utilizará categorías genéricas.</small>
              </label>
            </div>

            <footer className="word-grouping-actions word-grouping-actions--end">
              <button className="word-grouping-primary" type="submit" disabled={loading}>
                {loading ? <LoaderCircle className="is-spinning" /> : <WandSparkles />}
                {loading ? "Creando categorías reales…" : "Generar con Avend IA"}
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
                <h2>Revisa la propuesta de la IA</h2>
                <p>Edita nombres, criterios o palabras antes de preparar la actividad.</p>
              </div>
              <button type="button" className="secondary-button" onClick={() => generateActivity()} disabled={loading}>
                <Sparkles /> {loading ? "Regenerando…" : "Regenerar"}
              </button>
            </div>

            <div className="word-grouping-result-meta">
              <label>
                <span>Título de la actividad</span>
                <input
                  value={result.activity_title}
                  onChange={(event) => setResult({ ...result, activity_title: event.target.value })}
                />
              </label>
              <label>
                <span>Instrucciones para el estudiante</span>
                <textarea
                  rows={2}
                  value={result.instructions}
                  onChange={(event) => setResult({ ...result, instructions: event.target.value })}
                />
              </label>
            </div>

            <div className="taxonomy-editor-grid">
              {result.categories.map((category, categoryIndex) => {
                const categoryWords = result.words.filter(
                  (word) => word.correct_category_id === category.id,
                );
                return (
                  <article className={`taxonomy-editor-card taxonomy-editor-card--${categoryIndex % 4}`} key={category.id}>
                    <label>
                      <span>Categoría {categoryIndex + 1}</span>
                      <input
                        value={category.name}
                        onChange={(event) => updateCategory(category.id, "name", event.target.value)}
                      />
                    </label>
                    <label>
                      <span>Criterio de clasificación</span>
                      <textarea
                        rows={3}
                        value={category.explanation}
                        onChange={(event) => updateCategory(category.id, "explanation", event.target.value)}
                      />
                    </label>
                    <div className="taxonomy-word-editor">
                      <strong>Palabras de esta categoría</strong>
                      {categoryWords.map((word) => (
                        <div key={word.id}>
                          <input value={word.word} onChange={(event) => updateWord(word.id, event.target.value)} />
                          <button type="button" onClick={() => removeWord(word.id)} aria-label={`Eliminar ${word.word || "palabra"}`}>
                            <Trash2 />
                          </button>
                        </div>
                      ))}
                      <button type="button" className="taxonomy-add-word" onClick={() => addWord(category.id)}>
                        <Plus /> Añadir palabra
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {!resultIsValid ? (
              <p className="word-grouping-validation">Cada categoría necesita un nombre, un criterio y al menos dos palabras completas.</p>
            ) : null}

            <footer className="word-grouping-actions">
              <button type="button" className="secondary-button" onClick={() => setActiveStep(1)}>
                <ChevronLeft /> Volver a los datos
              </button>
              <button type="button" className="word-grouping-primary" onClick={startPractice} disabled={!resultIsValid}>
                Preparar actividad <ChevronRight />
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
                <button type="button" onClick={() => resetBoard(false)}><RotateCcw /> Reiniciar</button>
                <button type="button" onClick={() => resetBoard(true)}><Shuffle /> Mezclar</button>
              </div>
            </div>

            {feedback ? (
              <div className={`score-banner ${feedback.correct === feedback.total ? "score-banner--perfect" : ""}`} role="status">
                <Trophy />
                <span>
                  <strong>{feedback.correct === feedback.total ? "¡Clasificación perfecta!" : "Resultado de la actividad"}</strong>
                  {feedback.correct} de {feedback.total} respuestas correctas.
                </span>
              </div>
            ) : null}

            <div className="word-bank">
              <div className="word-bank__header">
                <strong>Banco de palabras</strong>
                <span>{result.words.filter((word) => !placements[word.id]).length} pendientes</span>
              </div>
              <div className="word-bank__items">
                {wordOrder.map((wordId) => wordsById.get(wordId)).filter((word): word is WordGroupingWord => Boolean(word)).map((word) =>
                  placements[word.id] ? null : (
                    <button
                      type="button"
                      draggable
                      key={word.id}
                      className={selectedWordId === word.id ? "is-selected" : ""}
                      onClick={() => setSelectedWordId((current) => current === word.id ? null : word.id)}
                      onDragStart={(event) => {
                        event.dataTransfer.setData("text/plain", word.id);
                        event.dataTransfer.effectAllowed = "move";
                      }}
                    >
                      <GripVertical /> {word.word}
                    </button>
                  ),
                )}
                {result.words.every((word) => placements[word.id]) ? <p>Ya ubicaste todas las palabras. Ahora verifica tus respuestas.</p> : null}
              </div>
            </div>

            <div className="taxonomy-board-grid">
              {result.categories.map((category, categoryIndex) => {
                const assignedWords = result.words.filter(
                  (word) => placements[word.id] === category.id,
                );
                return (
                  <article
                    className={`taxonomy-bucket taxonomy-bucket--${categoryIndex % 4}`}
                    key={category.id}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => dropWord(event, category.id)}
                  >
                    <header>
                      <strong>{category.name}</strong>
                      <span>{assignedWords.length}</span>
                    </header>
                    <p>{category.explanation}</p>
                    <button
                      type="button"
                      className="taxonomy-bucket__drop"
                      onClick={() => selectedWordId && placeWord(selectedWordId, category.id)}
                      disabled={!selectedWordId}
                      aria-label={`Colocar palabra seleccionada en ${category.name}`}
                    >
                      {selectedWordId ? "Colocar aquí" : "Arrastra o selecciona una palabra"}
                    </button>
                    <div className="taxonomy-bucket__words">
                      {assignedWords.map((word) => {
                        const isCorrect = placements[word.id] === word.correct_category_id;
                        const statusClass = feedback ? (isCorrect ? "is-correct" : "is-incorrect") : "";
                        return (
                          <button
                            type="button"
                            key={word.id}
                            className={statusClass}
                            onClick={() => {
                              setPlacements((current) => ({ ...current, [word.id]: null }));
                              setFeedback(null);
                            }}
                            title="Devolver al banco"
                          >
                            {feedback ? (isCorrect ? <CheckCircle2 /> : <XCircle />) : null}
                            {word.word}
                          </button>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>

            <footer className="word-grouping-actions word-grouping-actions--board">
              <button type="button" className="secondary-button" onClick={() => setActiveStep(2)}>
                <ChevronLeft /> Editar contenido
              </button>
              <button type="button" className="word-grouping-verify" onClick={verifyAnswers} disabled={!allPlaced}>
                <CheckCircle2 /> {allPlaced ? "Verificar respuestas" : "Ubica todas las palabras"}
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

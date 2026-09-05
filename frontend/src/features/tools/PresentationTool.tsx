import {
  Accessibility,
  ArrowDown,
  ArrowUp,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Download,
  Expand,
  FileText,
  Gamepad2,
  LayoutGrid,
  LoaderCircle,
  Maximize2,
  Newspaper,
  Palette,
  PanelsTopLeft,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Workflow,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

import {
  areasByLevel,
  competenciesByArea,
  educationModalities,
  getEducationLevels,
  gradesByLevel,
  type EducationLevel,
} from "../../config/education";
import { detectCurricularArea } from "../../config/toolDiscovery";
import { ApiError, apiBlob, apiRequest, downloadApiBlob, resolveApiAssetUrl } from "../../lib/api";
import { readSessionUser, sessionDraftScope } from "../../lib/session";
import { GenerationProgressOverlay } from "../../components/GenerationProgressOverlay";
import { FormValidationSummary, type FormValidationItem } from "./FormValidationSummary";

type EducationModality = (typeof educationModalities)[number]["value"];
type SlideCount = 3 | 5 | 8;
type VisualStyle = "infografico" | "bento_pastel" | "ilustrado" | "minimalista" | "esquema" | "alto_contraste" | "editorial" | "gamificado";

export type PresentationForm = {
  teacherName: string;
  institution: string;
  modality: EducationModality;
  level: EducationLevel | "";
  grade: string;
  curricularArea: string;
  slideCount: SlideCount;
  slidesCount?: SlideCount;
  visualStyle: VisualStyle | "";
  topic: string;
  competencies: string[];
  didacticPurpose: string;
  interactions: string[];
};

export type PresentationSlide = {
  order: number;
  type: "portada" | "contenido" | "desarrollo" | "frase_destacada" | "cierre";
  title: string;
  subtitle: string;
  key_points: string[];
  highlighted_quote: string;
  interactive_activity: string;
  speaker_notes: string;
  visual_prompt: string;
  image_search_query?: string;
  image_url?: string;
  image_alt?: string;
  image_attribution?: string;
  image_source_url?: string;
  image_license?: string;
  image_width?: number;
  image_height?: number;
};

export type PresentationResult = {
  presentation_title: string;
  learning_objective: string;
  slides: PresentationSlide[];
  model: string;
};

type StoredDraft = {
  version: 1;
  documentId?: string;
  serverVersion?: number;
  form: PresentationForm;
  result: PresentationResult | null;
  activeStep: number;
  updatedAt: string;
};

const STEP_LABELS = [
  { title: "Datos", detail: "Contexto y tema" },
  { title: "Estructura", detail: "Enfoque pedagógico" },
  { title: "Vista previa", detail: "Editar y presentar" },
  { title: "Descarga", detail: "Guardar y exportar" },
] as const;

const PURPOSES = [
  "Introducción a un nuevo tema / Motivación inicial",
  "Explicación teórica profunda y conceptualización",
  "Repaso para evaluación sumativa o formativa",
  "Taller práctico / Análisis de caso vivencial",
];

const INTERACTIONS = [
  "Preguntas de saberes previos y metacognición",
  "Preguntas de reflexión y debate",
  "Dinámica rápida / Pausa activa escolar",
  "Resumen / Autoevaluación final interactiva",
];

const STYLE_OPTIONS: Array<{ value: VisualStyle; label: string; description: string; icon: typeof Palette }> = [
  { value: "infografico", label: "Infográfico / Visual HD", description: "Datos, conceptos e imágenes protagonistas.", icon: PanelsTopLeft },
  { value: "bento_pastel", label: "Bento Grid Pastel", description: "Bloques organizados y lectura rápida.", icon: LayoutGrid },
  { value: "ilustrado", label: "Ilustrado / Infantil", description: "Cercano, expresivo y apropiado para niñas y niños.", icon: Palette },
  { value: "minimalista", label: "Minimalista tipográfico", description: "Contenido limpio con máximo contraste textual.", icon: BookOpen },
  { value: "esquema", label: "Esquema / Diagrama", description: "Procesos, relaciones y secuencias visibles.", icon: Workflow },
  { value: "alto_contraste", label: "Alto contraste y DUA", description: "Accesibilidad, foco y lectura reforzada.", icon: Accessibility },
  { value: "editorial", label: "Editorial / Revista", description: "Jerarquía narrativa y composición pedagógica.", icon: Newspaper },
  { value: "gamificado", label: "Gamificado / Desafío", description: "Retos, logros e interacción en el aula.", icon: Gamepad2 },
];

function PresentationVisual({ slide }: { slide: PresentationSlide }) {
  const [failedUrl, setFailedUrl] = useState("");
  const hasImage = Boolean(slide.image_url) && failedUrl !== slide.image_url;

  return (
    <figure className={`presentation-canvas__visual ${hasImage ? "has-image" : "is-fallback"}`}>
      {hasImage ? (
        <img
          src={resolveApiAssetUrl(slide.image_url ?? "")}
          alt={slide.image_alt || slide.title}
          onError={() => setFailedUrl(slide.image_url ?? "")}
        />
      ) : (
        <div className="presentation-canvas__visual-fallback" aria-label={slide.image_alt || slide.visual_prompt}>
          <span>{String(slide.order).padStart(2, "0")}</span>
          <p>{slide.title}</p>
        </div>
      )}
      {hasImage && slide.image_attribution ? (
        <figcaption>
          {slide.image_source_url ? (
            <a href={slide.image_source_url} target="_blank" rel="noreferrer">{slide.image_attribution}</a>
          ) : slide.image_attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}

function defaultForm(): PresentationForm {
  const user = readSessionUser();
  const modality = educationModalities.some((item) => item.value === user.education_modality) ? user.education_modality as EducationModality : "EBR";
  const level = getEducationLevels(modality).some((item) => item === user.education_level) ? user.education_level as EducationLevel : "";
  return {
    teacherName: user.full_name ?? "",
    institution: user.school_name ?? "",
    modality,
    level,
    grade: level && gradesByLevel[level]?.includes(user.grade ?? "") ? user.grade ?? "" : "",
    curricularArea: level && areasByLevel[level]?.includes(user.curricular_area ?? "") ? user.curricular_area ?? "" : "",
    slideCount: 8,
    visualStyle: "",
    topic: "",
    competencies: [],
    didacticPurpose: PURPOSES[0],
    interactions: [INTERACTIONS[0]],
  };
}

function loadDraft(storageKey: string): StoredDraft {
  const fallback: StoredDraft = { version: 1, form: defaultForm(), result: null, activeStep: 1, updatedAt: "" };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as StoredDraft | null;
    if (!saved || saved.version !== 1) return fallback;
    return { ...fallback, ...saved, form: { ...fallback.form, ...saved.form } };
  } catch {
    return fallback;
  }
}

function safeMessage(error: unknown) {
  if (error instanceof ApiError) return error.message;
  return error instanceof Error ? error.message : "No pudimos completar esta acción. Inténtalo nuevamente.";
}

function resequence(slides: PresentationSlide[]) {
  return slides.map((slide, index) => ({ ...slide, order: index + 1 }));
}

export function PresentationTool() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [storageKey] = useState(() => `avendia.draft.presentaciones-didacticas.v1.${sessionDraftScope()}`);
  const [initialDraft] = useState(() => loadDraft(storageKey));
  const [form, setForm] = useState<PresentationForm>(initialDraft.form);
  const [result, setResult] = useState<PresentationResult | null>(initialDraft.result);
  const [activeStep, setActiveStep] = useState(initialDraft.result ? Math.max(3, initialDraft.activeStep) : initialDraft.activeStep);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<"pptx" | "docx" | "">("");
  const [error, setError] = useState("");
  const [validationItems, setValidationItems] = useState<FormValidationItem[]>([]);
  const [saved, setSaved] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [regeneratingSlide, setRegeneratingSlide] = useState(false);
  const [documentId, setDocumentId] = useState(initialDraft.documentId ?? "");
  const [serverVersion, setServerVersion] = useState(initialDraft.serverVersion ?? 0);
  const [teacherNeedApplied, setTeacherNeedApplied] = useState(false);
  const documentIdFromUrl = searchParams.get("document");

  const gradeOptions = form.level ? gradesByLevel[form.level] ?? [] : [];
  const areaOptions = useMemo(() => form.level ? areasByLevel[form.level] ?? [] : [], [form.level]);
  const educationLevels = getEducationLevels(form.modality);
  const competencyOptions = form.curricularArea ? competenciesByArea[form.curricularArea] ?? [] : [];
  const activeSlide = result?.slides[selectedSlideIndex] ?? null;
  const step1Valid = Boolean(form.teacherName.trim() && form.institution.trim() && form.modality && form.level && form.grade && form.curricularArea && form.visualStyle && form.topic.trim());
  const step2Valid = form.competencies.length > 0 && Boolean(form.didacticPurpose) && form.interactions.length > 0;
  const step1Missing: FormValidationItem[] = [
    !form.teacherName.trim() ? { id: "presentation-teacher", label: "Nombre del docente" } : null,
    !form.institution.trim() ? { id: "presentation-institution", label: "Institución educativa" } : null,
    !form.modality ? { id: "presentation-modality", label: "Modalidad educativa" } : null,
    !form.level ? { id: "presentation-level", label: "Nivel educativo" } : null,
    !form.grade ? { id: "presentation-grade", label: "Grado / aula" } : null,
    !form.curricularArea ? { id: "presentation-area", label: "Área curricular (CNEB)" } : null,
    !form.visualStyle ? { id: "presentation-style", label: "Estilo visual" } : null,
    !form.topic.trim() ? { id: "presentation-topic", label: "Tema / título de la sesión" } : null,
  ].filter((item): item is FormValidationItem => Boolean(item));
  const step2Missing: FormValidationItem[] = [
    !form.competencies.length ? { id: "presentation-competencies", label: "Competencias del área" } : null,
    !form.didacticPurpose ? { id: "presentation-purpose", label: "Propósito didáctico" } : null,
    !form.interactions.length ? { id: "presentation-interactions", label: "Diapositivas e interacciones" } : null,
  ].filter((item): item is FormValidationItem => Boolean(item));

  useEffect(() => {
    const teacherNeed = (location.state as { teacherNeed?: string } | null)?.teacherNeed?.trim();
    if (!teacherNeed || teacherNeedApplied) return;
    const detectedArea = detectCurricularArea(teacherNeed);
    const timeout = window.setTimeout(() => {
      setForm((current) => ({
        ...current,
        topic: current.topic.trim() ? current.topic : teacherNeed,
        curricularArea: detectedArea && areaOptions.includes(detectedArea)
          ? detectedArea
          : current.curricularArea,
      }));
      setTeacherNeedApplied(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [areaOptions, location.state, teacherNeedApplied]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const draft: StoredDraft = { version: 1, documentId: documentId || undefined, serverVersion, form, result, activeStep, updatedAt: new Date().toISOString() };
      localStorage.setItem(storageKey, JSON.stringify(draft));
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [activeStep, documentId, form, result, serverVersion, storageKey]);

  useEffect(() => {
    if (!documentIdFromUrl || documentId === documentIdFromUrl) return;
    const token = sessionStorage.getItem("avendia.accessToken");
    if (!token) return;
    type StoredDocument = { id: string; metadata_json: Record<string, unknown> };
    void apiRequest<StoredDocument>(`/documents/${documentIdFromUrl}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((document) => {
      const metadata = document.metadata_json ?? {};
      if (metadata.form && typeof metadata.form === "object") setForm((current) => ({ ...current, ...metadata.form as Partial<PresentationForm> }));
      if (metadata.result && typeof metadata.result === "object") {
        setResult(metadata.result as PresentationResult);
        setActiveStep(Math.max(3, Number(metadata.current_step ?? 3)));
      }
      setDocumentId(document.id);
      setServerVersion(Number(metadata.version ?? 1));
      setSaved(true);
    }).catch((requestError) => setError(safeMessage(requestError)));
  }, [documentId, documentIdFromUrl]);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("avendia-ai-context", {
      detail: {
        toolTitle: "Presentaciones didácticas",
        module: "recursos",
        values: form,
        fields: [
          { id: "topic", label: "Tema / título", type: "text" },
          { id: "didacticPurpose", label: "Propósito didáctico", type: "text" },
        ],
      },
    }));
  }, [form]);

  const updateForm = <K extends keyof PresentationForm>(key: K, value: PresentationForm[K]) => {
    setForm((current) => key === "modality"
      ? { ...current, [key]: value, level: "", grade: "", curricularArea: "", competencies: [] }
      : { ...current, [key]: value });
    setSaved(false);
    setError("");
    setValidationItems([]);
  };

  const changeLevel = (level: EducationLevel | "") => {
    setForm((current) => ({ ...current, level, grade: "", curricularArea: "", competencies: [] }));
    setValidationItems([]);
  };

  const changeArea = (curricularArea: string) => {
    setForm((current) => ({ ...current, curricularArea, competencies: [] }));
    setValidationItems([]);
  };

  const toggleCompetency = (competency: string) => {
    updateForm("competencies", form.competencies.includes(competency) ? form.competencies.filter((item) => item !== competency) : [...form.competencies, competency]);
  };

  const toggleInteraction = (interaction: string) => {
    updateForm("interactions", form.interactions.includes(interaction) ? form.interactions.filter((item) => item !== interaction) : [...form.interactions, interaction]);
  };

  const generatePresentation = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!step1Valid || !step2Valid) {
      const nextStep = step1Valid ? 2 : 1;
      setError("");
      setValidationItems(nextStep === 1 ? step1Missing : step2Missing);
      setActiveStep(nextStep);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const token = sessionStorage.getItem("avendia.accessToken");
      const generated = await apiRequest<PresentationResult>("/ai/tools/presentaciones-didacticas/generate", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: JSON.stringify({
          teacher_name: form.teacherName,
          institution: form.institution,
          modality: form.modality,
          level: form.level,
          grade: form.grade,
          curricular_area: form.curricularArea,
          slide_count: form.slideCount,
          visual_style: form.visualStyle,
          topic: form.topic,
          competencies: form.competencies,
          didactic_purpose: form.didacticPurpose,
          interactions: form.interactions,
        }),
      });
      setResult(generated);
      setSelectedSlideIndex(0);
      setActiveStep(3);
    } catch (requestError) {
      setError(safeMessage(requestError));
    } finally {
      setLoading(false);
    }
  };

  const updateSlide = (key: keyof PresentationSlide, value: string | string[]) => {
    if (!result) return;
    setResult({
      ...result,
      slides: result.slides.map((slide, index) => index === selectedSlideIndex ? { ...slide, [key]: value } : slide),
    });
    setSaved(false);
  };

  const moveSlide = (direction: -1 | 1) => {
    if (!result) return;
    const target = selectedSlideIndex + direction;
    if (target < 0 || target >= result.slides.length) return;
    const slides = [...result.slides];
    [slides[selectedSlideIndex], slides[target]] = [slides[target], slides[selectedSlideIndex]];
    setResult({ ...result, slides: resequence(slides) });
    setSelectedSlideIndex(target);
  };

  const duplicateSlide = () => {
    if (!result || !activeSlide || result.slides.length >= 8) return;
    const slides = [...result.slides];
    slides.splice(selectedSlideIndex + 1, 0, { ...activeSlide, title: `${activeSlide.title} · copia` });
    setResult({ ...result, slides: resequence(slides) });
    setSelectedSlideIndex(selectedSlideIndex + 1);
  };

  const deleteSlide = () => {
    if (!result || result.slides.length <= 3) return;
    const slides = resequence(result.slides.filter((_, index) => index !== selectedSlideIndex));
    setResult({ ...result, slides });
    setSelectedSlideIndex(Math.min(selectedSlideIndex, slides.length - 1));
  };

  const addSlide = () => {
    if (!result || result.slides.length >= 8) return;
    const slides = resequence([...result.slides, {
      order: result.slides.length + 1,
      type: "contenido",
      title: "Nueva diapositiva",
      subtitle: "",
      key_points: ["Añade aquí una idea clave"],
      highlighted_quote: "",
      interactive_activity: "",
      speaker_notes: "Escribe las orientaciones que utilizará el docente.",
      visual_prompt: "Describe la imagen educativa horizontal que acompañará esta diapositiva.",
      image_search_query: "",
      image_url: "",
    }]);
    setResult({ ...result, slides });
    setSelectedSlideIndex(slides.length - 1);
  };

  const regenerateCurrentSlide = async () => {
    if (!result || !activeSlide) return;
    setRegeneratingSlide(true);
    setError("");
    try {
      const token = sessionStorage.getItem("avendia.accessToken");
      const response = await apiRequest<{ reply: string }>("/ai/tools/copilot", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: JSON.stringify({
          message: `Mejora la diapositiva ${activeSlide.order} titulada «${activeSlide.title}». Devuelve entre 3 y 5 puntos clave separados por líneas, concretos y adecuados a ${form.level}, ${form.grade}. No incluyas encabezados ni numeración.`,
          tool_title: "Presentaciones didácticas",
          module: "recursos",
          form_values: { topic: form.topic, area: form.curricularArea, competencies: form.competencies.join(", "), purpose: form.didacticPurpose },
        }),
      });
      const points = response.reply.split(/\r?\n/).map((line) => line.replace(/^[-•\d.)\s]+/, "").trim()).filter(Boolean).slice(0, 5);
      updateSlide("key_points", points.length ? points : [response.reply]);
    } catch (requestError) {
      setError(safeMessage(requestError));
    } finally {
      setRegeneratingSlide(false);
    }
  };

  const savePresentation = async () => {
    if (!result) return;
    setSaving(true);
    setError("");
    const nextVersion = serverVersion + 1;
    const draft: StoredDraft = { version: 1, documentId: documentId || undefined, serverVersion, form, result, activeStep, updatedAt: new Date().toISOString() };
    localStorage.setItem(storageKey, JSON.stringify(draft));
    try {
      const token = sessionStorage.getItem("avendia.accessToken");
      if (token) {
        type StoredDocument = { id: string };
        const stored = await apiRequest<StoredDocument>(documentId ? `/documents/${documentId}` : "/documents", {
          method: documentId ? "PATCH" : "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ title: result.presentation_title, document_type: "recursos/presentaciones-didacticas", content: result.learning_objective, metadata: { version: nextVersion, form, result, current_step: activeStep, source_route: "/dashboard/recursos/presentaciones-didacticas" } }),
        });
        setDocumentId(stored.id);
        setServerVersion(nextVersion);
        localStorage.setItem(storageKey, JSON.stringify({ ...draft, documentId: stored.id, serverVersion: nextVersion }));
      }
      setSaved(true);
    } catch (requestError) {
      setError(`${safeMessage(requestError)} El borrador sí quedó guardado en este dispositivo.`);
    } finally {
      setSaving(false);
    }
  };

  const exportFile = async (type: "pptx" | "docx") => {
    if (!result) return;
    setExporting(type);
    setError("");
    try {
      if (type === "pptx") {
        const token = sessionStorage.getItem("avendia.accessToken");
        const presentation = {
          presentation_title: result.presentation_title,
          learning_objective: result.learning_objective,
          slides: result.slides,
        };
        const file = await apiBlob("/ai/tools/presentaciones-didacticas/export/pptx", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: JSON.stringify({
            teacher_name: form.teacherName,
            institution: form.institution,
            curricular_area: form.curricularArea,
            grade: form.grade,
            visual_style: form.visualStyle,
            presentation,
          }),
        });
        downloadApiBlob(file);
      } else {
        const exporter = await import("./exportPresentation");
        await exporter.exportPresentationDocx(form, result);
      }
    } catch (exportError) {
      setError(safeMessage(exportError));
    } finally {
      setExporting("");
    }
  };

  const slideCanvas = (slide: PresentationSlide, isFullscreen = false) => {
    const isCover = slide.type === "portada";
    const isQuoteSlide = slide.type === "frase_destacada";
    // La portada establece el tema; el detalle vive en las diapositivas posteriores.
    // Esto evita que título, metadatos, actividad y puntos compitan por el mismo espacio.
    const showPoints = !isCover && !isQuoteSlide && slide.key_points.length > 0;
    const showQuote = !isCover && Boolean(slide.highlighted_quote);
    const showActivity = !isCover && !isQuoteSlide && Boolean(slide.interactive_activity);
    const visualTextLength = [slide.title, slide.subtitle, ...slide.key_points, slide.highlighted_quote, slide.interactive_activity]
      .filter(Boolean)
      .join(" ").length;
    const density = visualTextLength > 420 || slide.title.length > 72 ? "dense" : visualTextLength > 260 || slide.title.length > 48 ? "compact" : "standard";

    return (
      <div className={`presentation-canvas presentation-canvas--${form.visualStyle || "infografico"} presentation-canvas--type-${slide.type} presentation-canvas--density-${density} ${slide.image_url ? "has-image" : "no-image"} ${showActivity ? "has-activity" : ""} ${showQuote ? "has-quote" : ""} ${isFullscreen ? "is-fullscreen" : ""}`}>
        <PresentationVisual slide={slide} />
        <div className="presentation-canvas__veil" />
        <div className="presentation-canvas__copy">
          <span>{isCover ? "Presentación didáctica" : `${form.curricularArea} · ${form.grade}`}</span>
          <h2>{slide.title}</h2>
          {slide.subtitle ? <p>{slide.subtitle}</p> : null}
          {showPoints ? <ul>{slide.key_points.map((point, index) => <li key={`${point}-${index}`}>{point}</li>)}</ul> : null}
          {showQuote ? <blockquote>{slide.highlighted_quote}</blockquote> : null}
        </div>
        {showActivity ? <div className="presentation-canvas__activity"><Sparkles /><span><strong>Interacción en aula</strong><small>{slide.interactive_activity}</small></span></div> : null}
        <footer><span>{form.teacherName} · {form.institution}</span><b>{slide.order}/{result?.slides.length ?? form.slideCount}</b></footer>
      </div>
    );
  };

  const editor = result && activeSlide ? (
    <div className="presentation-editor">
      <div className="presentation-editor__stage">
        <div className="presentation-stage-toolbar"><span>Diapositiva {activeSlide.order} de {result.slides.length}</span><div><button type="button" onClick={() => moveSlide(-1)} disabled={selectedSlideIndex === 0} aria-label="Mover diapositiva arriba"><ArrowUp /></button><button type="button" onClick={() => moveSlide(1)} disabled={selectedSlideIndex === result.slides.length - 1} aria-label="Mover diapositiva abajo"><ArrowDown /></button><button type="button" onClick={duplicateSlide} disabled={result.slides.length >= 8}><Plus /> Duplicar</button><button type="button" onClick={deleteSlide} disabled={result.slides.length <= 3}><Trash2 /> Eliminar</button><button type="button" onClick={() => setFullscreen(true)}><Maximize2 /> Presentar</button></div></div>
        {slideCanvas(activeSlide)}
        <div className="presentation-stage-nav"><button type="button" disabled={selectedSlideIndex === 0} onClick={() => setSelectedSlideIndex((index) => Math.max(0, index - 1))}><ChevronLeft /> Anterior</button><button type="button" disabled={selectedSlideIndex === result.slides.length - 1} onClick={() => setSelectedSlideIndex((index) => Math.min(result.slides.length - 1, index + 1))}>Siguiente <ChevronRight /></button></div>
      </div>
      <aside className="presentation-inspector">
        <header><div><small>Editor</small><h3>Contenido y guion</h3></div><button type="button" onClick={regenerateCurrentSlide} disabled={regeneratingSlide}>{regeneratingSlide ? <LoaderCircle className="is-spinning" /> : <RefreshCw />} Regenerar</button></header>
        <label><span>Tipo de diapositiva</span><select value={activeSlide.type} onChange={(event) => updateSlide("type", event.target.value)}><option value="portada">Portada</option><option value="contenido">Contenido</option><option value="frase_destacada">Frase destacada</option><option value="cierre">Cierre</option></select></label>
        <label><span>Título</span><input value={activeSlide.title} onChange={(event) => updateSlide("title", event.target.value)} /></label>
        <label><span>Subtítulo</span><input value={activeSlide.subtitle} onChange={(event) => updateSlide("subtitle", event.target.value)} /></label>
        <label><span>Puntos clave <small>Uno por línea</small></span><textarea rows={6} value={activeSlide.key_points.join("\n")} onChange={(event) => updateSlide("key_points", event.target.value.split(/\r?\n/))} /></label>
        <label><span>Frase destacada</span><textarea rows={3} value={activeSlide.highlighted_quote} onChange={(event) => updateSlide("highlighted_quote", event.target.value)} /></label>
        <label><span>Interacción</span><textarea rows={4} value={activeSlide.interactive_activity} onChange={(event) => updateSlide("interactive_activity", event.target.value)} /></label>
        <label><span>Dirección visual <small>Describe la escena que debe apoyar el aprendizaje. Avendia busca y conserva una imagen reutilizable automáticamente.</small></span><textarea rows={4} value={activeSlide.visual_prompt} onChange={(event) => updateSlide("visual_prompt", event.target.value)} /></label>
        {activeSlide.image_attribution ? <p className="presentation-inspector__source"><strong>Imagen:</strong> {activeSlide.image_attribution}{activeSlide.image_source_url ? <a href={activeSlide.image_source_url} target="_blank" rel="noreferrer"> Ver fuente</a> : null}</p> : null}
        <label><span>Guion del docente</span><textarea rows={6} value={activeSlide.speaker_notes} onChange={(event) => updateSlide("speaker_notes", event.target.value)} /></label>
      </aside>
    </div>
  ) : null;

  return (
    <main className="presentation-page"><div className="presentation-shell">
      <header className="presentation-header"><div><span>Recursos didácticos</span><h1>Presentaciones didácticas</h1><p>Crea una secuencia visual con IA, edítala diapositiva por diapositiva y expórtala.</p></div>{result ? <button className="secondary-button" type="button" onClick={savePresentation} disabled={saving}>{saved ? <Check /> : <Save />}{saving ? "Guardando…" : saved ? "Guardado" : "Guardar borrador"}</button> : null}</header>
      <ol className="presentation-stepper">{STEP_LABELS.map((step, index) => { const number = index + 1; const available = number <= 2 || Boolean(result); return <li className={activeStep === number ? "is-active" : activeStep > number ? "is-complete" : ""} key={step.title}><button type="button" disabled={!available} onClick={() => available && setActiveStep(number)}><span>{activeStep > number ? <Check /> : number}</span><strong>{step.title}</strong><small>{step.detail}</small></button></li>; })}</ol>
      {error ? <div className="presentation-alert" role="alert"><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="Cerrar"><X /></button></div> : null}
      <FormValidationSummary items={validationItems} />

      {activeStep === 1 ? <form className="presentation-panel" noValidate onSubmit={(event) => { event.preventDefault(); if (step1Valid) { setValidationItems([]); setActiveStep(2); } else { setError(""); setValidationItems(step1Missing); } }}><div className="presentation-panel__intro"><small>Paso 1 de 4</small><h2>Datos generales y modalidad educativa</h2><p>Completa el contexto curricular y el tema central de la presentación.</p></div><div className="presentation-form-grid"><label><span>Nombre del docente <b>Obligatorio</b></span><input id="presentation-teacher" value={form.teacherName} onChange={(event) => updateForm("teacherName", event.target.value)} placeholder="Ej. Prof. María Gómez" required /></label><label><span>Nombre de la institución educativa <b>Obligatorio</b></span><input id="presentation-institution" value={form.institution} onChange={(event) => updateForm("institution", event.target.value)} placeholder="Ej. I.E. N.° 5143 República del Perú" required /></label><label><span>Modalidad educativa <b>Obligatorio</b></span><select id="presentation-modality" value={form.modality} onChange={(event) => updateForm("modality", event.target.value as EducationModality)}>{educationModalities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><small>Selecciona EBR, EBA o EBE según el servicio educativo.</small></label><label><span>Nivel educativo <b>Obligatorio</b></span><select id="presentation-level" value={form.level} onChange={(event) => changeLevel(event.target.value as EducationLevel)}><option value="">Selecciona el nivel</option>{educationLevels.map((level) => <option key={level}>{level}</option>)}</select></label><label><span>Grado / aula <b>Obligatorio</b></span><select id="presentation-grade" value={form.grade} disabled={!form.level} onChange={(event) => updateForm("grade", event.target.value)}><option value="">{form.level ? "Selecciona el grado" : "Primero selecciona el nivel"}</option>{gradeOptions.map((grade) => <option key={grade}>{grade}</option>)}</select></label><label><span>Área curricular (CNEB) <b>Obligatorio</b></span><select id="presentation-area" value={form.curricularArea} disabled={!form.level} onChange={(event) => changeArea(event.target.value)}><option value="">{form.level ? "Selecciona el área" : "Primero selecciona el nivel"}</option>{areaOptions.map((area) => <option key={area}>{area}</option>)}</select></label><label><span>Cantidad de diapositivas <b>Máximo 8</b></span><select value={form.slideCount} onChange={(event) => updateForm("slideCount", Number(event.target.value) as SlideCount)}><option value={3}>3 diapositivas · Síntesis</option><option value={5}>5 diapositivas · Recomendado</option><option value={8}>8 diapositivas · Secuencia completa</option></select></label><label><span>Estilo visual <b>Obligatorio</b></span><select id="presentation-style" value={form.visualStyle} onChange={(event) => updateForm("visualStyle", event.target.value as VisualStyle)}><option value="">Selecciona el estilo visual</option>{STYLE_OPTIONS.map((style) => <option key={style.value} value={style.value}>{style.label}</option>)}</select></label><label className="presentation-field--wide"><span>Tema / título de la sesión <b>Obligatorio</b></span><input id="presentation-topic" value={form.topic} onChange={(event) => updateForm("topic", event.target.value)} placeholder="Ej. Hábitos de alimentación saludable e higiene en la vida cotidiana" required /><small>Escribe un tema concreto para evitar contenido genérico.</small></label></div><footer><span></span><button className="workflow-primary" type="submit">Siguiente paso <ChevronRight /></button></footer></form> : null}

      {activeStep === 2 ? <form className="presentation-panel" onSubmit={generatePresentation}><div className="presentation-panel__intro"><small>Paso 2 de 4</small><h2>Estructura y enfoque pedagógico</h2><p>Selecciona competencias CNEB, propósito didáctico, interacciones y estilo visual.</p></div><section className="presentation-choice-section" id="presentation-competencies" tabIndex={-1}><header><span>1</span><div><h3>Competencias del área: {form.curricularArea || "pendiente"}</h3><p>Marca al menos una competencia pedagógica.</p></div></header><div className="presentation-choice-grid">{competencyOptions.map((competency) => <button type="button" className={form.competencies.includes(competency) ? "is-selected" : ""} key={competency} onClick={() => toggleCompetency(competency)}><span>{competency}</span><i>{form.competencies.includes(competency) ? <Check /> : null}</i></button>)}</div></section><section className="presentation-choice-section" id="presentation-purpose" tabIndex={-1}><header><span>2</span><div><h3>Propósito didáctico</h3><p>Selecciona una intención principal para organizar la secuencia.</p></div></header><div className="presentation-choice-grid">{PURPOSES.map((purpose) => <button type="button" className={form.didacticPurpose === purpose ? "is-selected" : ""} key={purpose} onClick={() => updateForm("didacticPurpose", purpose)}><span>{purpose}</span><i>{form.didacticPurpose === purpose ? <Check /> : null}</i></button>)}</div></section><section className="presentation-choice-section" id="presentation-interactions" tabIndex={-1}><header><span>3</span><div><h3>Diapositivas e interacciones</h3><p>Puedes seleccionar varias; Gemini las distribuirá en la secuencia.</p></div></header><div className="presentation-choice-grid">{INTERACTIONS.map((interaction) => <button type="button" className={form.interactions.includes(interaction) ? "is-selected" : ""} key={interaction} onClick={() => toggleInteraction(interaction)}><span>{interaction}</span><i>{form.interactions.includes(interaction) ? <Check /> : null}</i></button>)}</div></section><section className="presentation-style-review"><h3>Dirección visual seleccionada</h3><div className="presentation-style-grid">{STYLE_OPTIONS.map((style) => { const Icon = style.icon; return <button type="button" className={form.visualStyle === style.value ? "is-selected" : ""} key={style.value} onClick={() => updateForm("visualStyle", style.value)}><Icon /><span><strong>{style.label}</strong><small>{style.description}</small></span><i>{form.visualStyle === style.value ? <Check /> : null}</i></button>; })}</div></section><footer><button type="button" className="secondary-button" onClick={() => setActiveStep(1)}><ChevronLeft /> Volver</button><button className="workflow-primary" type="submit" disabled={loading}>{loading ? <LoaderCircle className="is-spinning" /> : <Sparkles />}{loading ? "Diseñando presentación…" : `Generar ${form.slideCount} diapositivas con IA`}</button></footer></form> : null}

      {activeStep === 3 && result ? <section className="presentation-panel presentation-panel--editor"><div className="presentation-panel__intro presentation-panel__intro--row"><div><small>Paso 3 de 4</small><h2>Vista previa y edición</h2><p>Reordena, duplica, elimina o edita cada diapositiva antes de descargar.</p></div><button className="secondary-button" type="button" onClick={addSlide} disabled={result.slides.length >= 8}><Plus /> Añadir diapositiva</button></div><div className="presentation-thumbnails">{result.slides.map((slide, index) => <button type="button" className={selectedSlideIndex === index ? "is-active" : ""} key={`${slide.order}-${index}`} onClick={() => setSelectedSlideIndex(index)}><b>{slide.order}</b><span>{slide.title}</span></button>)}</div>{editor}<footer><button type="button" className="secondary-button" onClick={() => setActiveStep(2)}><ChevronLeft /> Volver a estructura</button><button className="workflow-primary" type="button" onClick={() => setActiveStep(4)}>Revisar descargas <ChevronRight /></button></footer></section> : null}

      {activeStep === 4 && result ? <section className="presentation-panel presentation-download"><div className="presentation-panel__intro"><small>Paso 4 de 4</small><h2>Guarda y descarga tu presentación</h2><p>La versión exportada conserva el diseño, las imágenes con su fuente, el contenido y el guion docente.</p></div><div className="presentation-download__summary"><div><span>{result.slides.length}</span><small>Diapositivas</small></div><div><span>{result.slides.filter((slide) => slide.image_url).length}</span><small>Imágenes reales</small></div><div><span>{form.interactions.length}</span><small>Interacciones</small></div></div><div className="presentation-download__actions"><button type="button" onClick={() => exportFile("pptx")} disabled={Boolean(exporting)}><Expand /> <span><strong>PowerPoint editable</strong><small>Diseño 16:9, imágenes y notas del orador</small></span>{exporting === "pptx" ? <LoaderCircle className="is-spinning" /> : <Download />}</button><button type="button" onClick={() => window.print()}><FileText /> <span><strong>Guardar como PDF</strong><small>Usa el diálogo de impresión del navegador</small></span><Download /></button><button type="button" onClick={() => exportFile("docx")} disabled={Boolean(exporting)}><BookOpen /> <span><strong>Guion en Word</strong><small>Contenido, actividades y notas docentes</small></span>{exporting === "docx" ? <LoaderCircle className="is-spinning" /> : <Download />}</button><button type="button" onClick={() => navigator.clipboard.writeText(result.slides.map((slide) => `${slide.order}. ${slide.title}\n${slide.key_points.join("\n")}\nNotas: ${slide.speaker_notes}`).join("\n\n"))}><Clipboard /> <span><strong>Copiar contenido</strong><small>Texto completo de la presentación</small></span><Check /></button></div><footer><button type="button" className="secondary-button" onClick={() => setActiveStep(3)}><ChevronLeft /> Volver al editor</button><button className="workflow-primary" type="button" onClick={savePresentation} disabled={saving}>{saving ? <LoaderCircle className="is-spinning" /> : <Save />}{saving ? "Guardando…" : "Guardar en historial"}</button></footer></section> : null}
      {result ? <section className="presentation-print-deck" aria-hidden="true">{result.slides.map((slide) => <article key={`print-${slide.order}`}>{slideCanvas(slide)}</article>)}</section> : null}
    </div>
    {fullscreen && activeSlide && result ? <div className="presentation-fullscreen" role="dialog" aria-modal="true"><button type="button" onClick={() => setFullscreen(false)} aria-label="Cerrar presentación"><X /></button><div>{slideCanvas(activeSlide, true)}<nav><button type="button" disabled={selectedSlideIndex === 0} onClick={() => setSelectedSlideIndex((index) => Math.max(0, index - 1))}><ChevronLeft /></button><span>{selectedSlideIndex + 1} / {result.slides.length}</span><button type="button" disabled={selectedSlideIndex === result.slides.length - 1} onClick={() => setSelectedSlideIndex((index) => Math.min(result.slides.length - 1, index + 1))}><ChevronRight /></button></nav></div></div> : null}
    <GenerationProgressOverlay open={loading} toolTitle="Presentaciones didácticas" family="presentacion" />
    </main>
  );
}

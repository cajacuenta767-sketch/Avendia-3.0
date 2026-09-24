import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clipboard,
  Clock3,
  Download,
  FileArchive,
  ListChecks,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";

import { getWorkflowFieldGuide } from "../../config/aiGuides";
import { getToolByPath, tools as toolCatalog } from "../../config/tools";
import { detectCurricularArea } from "../../config/toolDiscovery";
import { StudentSelector, type StudentSelection } from "../../components/students/StudentSelector";
import { GenerationProgressOverlay } from "../../components/GenerationProgressOverlay";
import { listStudents } from "../rosters/rosterApi";
import {
  getInitialWorkflowValues,
  getWorkflow,
  type WorkflowField,
  type WorkflowFieldGuide,
  type WorkflowStep,
} from "../../config/workflows";
import { ApiError, apiBlob } from "../../lib/api";
import { sessionDraftScope, readAccessToken } from "../../lib/session";
import { useTeacherExperience } from "../../context/TeacherExperienceContext";
import type { WorkflowArtifact } from "./exportWorkflowDocx";
import { ContextualAIGuideDialog } from "./ContextualAIGuideDialog";
import { DocumentReferencePanel, type DocumentReferenceSelection } from "./DocumentReferencePanel";
import { CurricularReferencePicker } from "../../components/CurricularReferencePicker";
import {
  type CurricularReference,
  type ReferenceSelection,
} from "../../lib/curricularReference";
import { blockedField, sourceValueFor } from "./documentReference";
import { InteractiveArtifact } from "./InteractiveArtifact";
import {
  contextStatus,
  contextualPlaceholder,
  contextualSuggestions,
  derivePedagogicalContext,
  impactedFields,
  type AssistanceMode,
} from "./pedagogicalContext";
import { StructuredArtifactPreview } from "./StructuredArtifactPreview";
import { localDraftStorage } from "./workflow/adapters/localDraftStorage";
import { httpWorkflowGateway } from "./workflow/adapters/httpWorkflowGateway";
import { httpAssistanceGateway } from "./workflow/adapters/httpAssistanceGateway";
import { DRAFT_VERSION, emptyDraft, type Draft } from "./workflow/domain/draft";
import { displayValue, type FieldValue } from "./workflow/domain/fieldValue";
import { fieldError, resolvedFieldOptions } from "./workflow/domain/validation";
import {
  effectiveOrigin,
  inheritedValues,
  originDocumentId,
  originSource,
  releasedFields,
} from "./workflow/domain/curricularOrigin";
import { applyInstitutionalTemplate, listInstitutionalTemplates, renderInstitutionalTemplate, type InstitutionalTemplate } from "./templateApi";

type SaveStatus = "idle" | "saving" | "saved" | "generating" | "error";

function artifactAsText(artifact: WorkflowArtifact) {
  const activity = artifact.activity?.items.flatMap((item, index) => [
    `${index + 1}. ${item.prompt}`,
    `Respuesta: ${item.answer}`,
    item.hint,
    ...(item.options ?? []),
  ]) ?? [];
  return [
    artifact.document_title,
    artifact.executive_summary,
    artifact.activity?.title,
    artifact.activity?.instructions,
    ...activity,
    ...artifact.sections.flatMap((section) => [section.title, section.narrative, ...section.key_points]),
    "Recomendaciones",
    ...artifact.teacher_recommendations,
    ...(artifact.tables ?? []).flatMap((table) => [
      table.title,
      ...table.columns,
      ...table.rows.flat(),
      table.note,
    ]),
  ].filter(Boolean).join("\n\n");
}

type DraftPrompt = { mode: "restored"; updatedAt: string; hasArtifact: boolean } | { mode: "confirm" } | null;

/** Recursos que continúan una sesión de aprendizaje reutilizando lo ya llenado en ella. */
const CLASS_CONTINUATIONS: { path: string; label: string; hint: string }[] = [
  { path: "/dashboard/evaluamos/lista-cotejo", label: "Instrumento", hint: "Lista de cotejo con el encuadre de la sesión." },
  { path: "/dashboard/evaluamos/ficha-aprendizaje", label: "Ficha", hint: "Práctica imprimible sobre el mismo tema." },
  { path: "/dashboard/recursos/presentaciones-didacticas", label: "Presentación", hint: "Diapositivas para proyectar la clase." },
  { path: "/dashboard/recursos/crucigramas", label: "Recurso interactivo", hint: "Juego de repaso con el vocabulario del tema." },
];

export function WorkflowTool() {
  const location = useLocation();
  const { pathname } = location;
  const [searchParams] = useSearchParams();
  const tool = getToolByPath(pathname);
  const workflow = getWorkflow(tool);
  const draftScope = sessionDraftScope();
  const storageKey = `avendia.draft.workflow.${workflow?.key ?? "unknown"}.v2.${draftScope}`;
  const legacyStorageKey = `avendia.workflow.${workflow?.key ?? "unknown"}.${draftScope}`;
  // El componente depende de los puertos, no de `localStorage` ni de `apiRequest`.
  const drafts = useMemo(() => localDraftStorage(storageKey, legacyStorageKey), [storageKey, legacyStorageKey]);
  const gateway = useMemo(() => httpWorkflowGateway(), []);
  const assistance = useMemo(() => httpAssistanceGateway(), []);
  const [draft, setDraft] = useState<Draft>(() => workflow
    ? drafts.read(getInitialWorkflowValues(workflow))
    : { version: DRAFT_VERSION, values: {}, currentStep: 0, artifact: null, updatedAt: "" });
  const [draftPrompt, setDraftPrompt] = useState<DraftPrompt>(() => {
    if (!workflow) return null;
    const meta = drafts.meta(getInitialWorkflowValues(workflow));
    return meta ? { mode: "restored", updatedAt: meta.updatedAt, hasArtifact: meta.hasArtifact } : null;
  });
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(() => new Set());
  const { preferences, updatePreferences } = useTeacherExperience();
  const [orientationOpen, setOrientationOpen] = useState(preferences.always_show_help);
  const [pendingFocusFieldId, setPendingFocusFieldId] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideFieldId, setGuideFieldId] = useState("");
  const [guideAnswer1, setGuideAnswer1] = useState("");
  const [guideAnswer2, setGuideAnswer2] = useState("");
  const [guideCustom, setGuideCustom] = useState("");
  const [guideSuggestions, setGuideSuggestions] = useState<string[]>([]);
  const [guideReply, setGuideReply] = useState("");
  const [guideError, setGuideError] = useState("");
  const [guideLoading, setGuideLoading] = useState(false);
  const [guideApplyMode, setGuideApplyMode] = useState<"replace" | "append">("replace");
  const [assistanceMode, setAssistanceMode] = useState<AssistanceMode>("complete");
  const [rememberAssistance, setRememberAssistance] = useState(false);
  const [fieldsToReview, setFieldsToReview] = useState<string[]>([]);
  const [curricularReferences, setCurricularReferences] = useState<CurricularReference[] | null>(null);
  // Confirmaciones explícitas: el docente decide si continúa pese a un cambio de contexto o a un resultado con errores obligatorios.
  const [pendingConfirm, setPendingConfirm] = useState<null | { kind: "context"; targetStep?: number } | { kind: "blocked-export" }>(null);
  const skipContextReviewRef = useRef(false);
  const allowBlockedExportRef = useRef(false);
  const [lastAppliedGuide, setLastAppliedGuide] = useState<{ fieldId: string; previous: FieldValue } | null>(null);
  const [editingResult, setEditingResult] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<number | null>(null);
  const [exportingWord, setExportingWord] = useState(false);
  const [templates, setTemplates] = useState<InstitutionalTemplate[]>([]);
  const [rosterSelections, setRosterSelections] = useState<Record<string, StudentSelection | null>>({});
  const guideRequest = useRef<AbortController | null>(null);
  const teacherNeedApplied = useRef(false);
  const recentContextApplied = useRef(false);
  const documentIdFromUrl = searchParams.get("document");
  const continuedFromDocumentId = searchParams.get("desde");
  const navigate = useNavigate();
  const continuationApplied = useRef("");
  const selectedTemplate = templates.find((template) => template.id === draft.templateId);

  const isClassSession = Boolean(workflow?.key.includes("sesion-aprendizaje"));
  const currentStep = workflow?.steps[draft.currentStep];
  // Formulario corto: sin bloques técnicos ni ayudas por campo (ver WorkflowDefinition.simple).
  const simple = Boolean(workflow?.simple);
  const allFields = workflow?.steps.flatMap((item) => item.fields) ?? [];
  /**
   * Origen efectivo. Si el borrador guarda un plan o una unidad que el docente ya
   * borró, se ignora: de lo contrario el servidor respondería 404 a cada intento
   * de generar y el selector se oculta cuando no queda ningún documento, así que
   * no habría forma de corregirlo desde la pantalla.
   */
  const curricularSelection = useMemo(
    () => effectiveOrigin(draft.curricular, curricularReferences),
    [curricularReferences, draft.curricular],
  );

  /** Documento del que cuelga esta herramienta: la unidad si se eligió, si no el plan anual. */
  const curricularSourceId = originDocumentId(curricularSelection);
  const currentErrors = useMemo(
    () => currentStep?.fields.filter((field) => fieldError(field, draft.values[field.id], resolvedFieldOptions(field, draft.values))) ?? [],
    [currentStep, draft.values],
  );
  const guideField = allFields.find((field) => field.id === guideFieldId);
  const pedagogicalContext = useMemo(() => derivePedagogicalContext(draft.values), [draft.values]);
  const baseGuideConfig: WorkflowFieldGuide | null = tool && guideField
    ? getWorkflowFieldGuide(tool.id, guideField)
    : null;
  const guideConfig: WorkflowFieldGuide | null = baseGuideConfig && guideField
    ? { ...baseGuideConfig, suggestions: contextualSuggestions(baseGuideConfig.suggestions ?? [], guideField, pedagogicalContext) }
    : null;
  const liveContextStatus = contextStatus(pedagogicalContext, fieldsToReview.length);
  const generationContextIds = ["modality", "level", "grade", "curricular_area", "topic", "session_topic", "task_title", "unit_title", "duration_minutes"];
  const generationContext = generationContextIds
    .map((id) => displayValue(draft.values[id]).trim())
    .filter(Boolean)
    .slice(0, 6);
  const generationBrief = `Avendia creará ${tool?.title ?? "este recurso"}${generationContext.length ? ` con este contexto: ${generationContext.join(" · ")}` : " con los datos confirmados en los pasos anteriores"}.`;
  const requiredFields = allFields.filter((field) => field.required);
  const completedRequired = requiredFields.filter((field) => !fieldError(field, draft.values[field.id], resolvedFieldOptions(field, draft.values))).length;
  const completionPercent = requiredFields.length ? Math.round((completedRequired / requiredFields.length) * 100) : 100;
  const remainingRequired = Math.max(0, requiredFields.length - completedRequired);
  const estimatedMinutes = Math.max(2, Math.ceil(requiredFields.length * 0.32 + (workflow?.steps.length ?? 0) * 0.55));
  const preparationLabels = requiredFields.slice(0, 4).map((field) => field.label);

  useEffect(() => {
    const teacherNeed = (location.state as { teacherNeed?: string } | null)?.teacherNeed?.trim();
    if (!teacherNeed || teacherNeedApplied.current || !workflow) return;
    teacherNeedApplied.current = true;
    const workflowFields = workflow.steps.flatMap((item) => item.fields);
    const topicField = workflowFields.find((field) => [
      "topic", "session_topic", "task_title", "unit_title", "specific_topics",
    ].includes(field.id));
    const areaField = workflowFields.find((field) => field.id === "curricular_area");
    const detectedArea = detectCurricularArea(teacherNeed);
    setDraft((current) => {
      const values = { ...current.values };
      const fieldSources = { ...current.fieldSources };
      if (topicField && !displayValue(values[topicField.id]).trim()) {
        values[topicField.id] = teacherNeed;
        fieldSources[topicField.id] = "teacher";
      }
      if (areaField && detectedArea && !displayValue(values[areaField.id]).trim()) {
        values[areaField.id] = detectedArea;
        fieldSources[areaField.id] = "teacher";
      }
      return { ...current, values, fieldSources };
    });
    setMessage("Usamos tu pedido como punto de partida. Revisa los datos antes de crear.");
  }, [location.state, workflow]);

  useEffect(() => {
    if (!workflow || recentContextApplied.current || !preferences.remember_recent_context) return;
    if (!Object.keys(preferences.last_context).length) return;
    recentContextApplied.current = true;
    const compatibleIds = new Set(workflow.steps.flatMap((item) => item.fields).map((field) => field.id));
    const timeout = window.setTimeout(() => {
      setDraft((current) => {
        const values = { ...current.values };
        const fieldSources = { ...current.fieldSources };
        for (const [fieldId, value] of Object.entries(preferences.last_context)) {
          if (!compatibleIds.has(fieldId) || displayValue(values[fieldId]).trim()) continue;
          values[fieldId] = value;
          fieldSources[fieldId] = "profile";
        }
        return { ...current, values, fieldSources };
      });
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [preferences.last_context, preferences.remember_recent_context, workflow]);

  useEffect(() => {
    if (!workflow || !preferences.remember_recent_context) return;
    const rememberedIds = [
      "modality", "level", "grade", "section", "curricular_area", "duration_minutes",
      "school_year", "period",
    ];
    const nextContext = Object.fromEntries(
      rememberedIds
        .map((fieldId) => [fieldId, displayValue(draft.values[fieldId]).trim()] as const)
        .filter(([, value]) => value),
    );
    if (!Object.keys(nextContext).length) return;
    if (JSON.stringify(nextContext) === JSON.stringify(preferences.last_context)) return;
    const timeout = window.setTimeout(() => {
      void updatePreferences({ last_context: nextContext });
    }, 1000);
    return () => window.clearTimeout(timeout);
  }, [draft.values, preferences.last_context, preferences.remember_recent_context, updatePreferences, workflow]);

  // Planes anuales y unidades guardados: alimentan el selector en cascada.
  useEffect(() => {
    const controller = new AbortController();
    void gateway.listCurricularReferences(controller.signal)
      .then(setCurricularReferences)
      .catch(() => undefined);
    return () => controller.abort();
  }, [gateway]);

  const stepStatus = (stepItem: WorkflowStep, index: number) => {
    if (stepItem.kind && stepItem.kind !== "form") return draft.artifact ? "Listo" : index === draft.currentStep ? "Ahora" : "Pendiente";
    const relevant = stepItem.fields.filter((field) => field.required);
    const invalid = relevant.filter((field) => fieldError(field, draft.values[field.id], resolvedFieldOptions(field, draft.values)));
    if (!relevant.length || !invalid.length) return "Listo";
    if (invalid.length === relevant.length) return index === draft.currentStep ? "Ahora" : "Sin comenzar";
    return "Incompleto";
  };

  useEffect(() => {
    if (!pendingFocusFieldId) return;
    const timeout = window.setTimeout(() => {
      const container = document.querySelector<HTMLElement>(`[data-workflow-field="${pendingFocusFieldId}"]`);
      if (!container) return;
      container.scrollIntoView?.({ behavior: "smooth", block: "center" });
      const control = container.querySelector<HTMLElement>("input:not([type='hidden']), select, textarea")
        ?? container.querySelector<HTMLElement>("button");
      control?.focus({ preventScroll: true });
      setPendingFocusFieldId("");
    }, 60);
    return () => window.clearTimeout(timeout);
  }, [draft.currentStep, pendingFocusFieldId]);

  useEffect(() => {
    if (!tool || !workflow) return;
    const fields = workflow.steps
      .flatMap((item) => item.fields)
      .map(({ id, label, type }) => ({ id, label, type }));
    const emitContext = () => window.dispatchEvent(new CustomEvent("avendia-ai-context", {
      detail: { toolTitle: tool.title, module: tool.module, values: draft.values, fields },
    }));
    emitContext();
    const insert = (event: Event) => {
      const detail = (event as CustomEvent<{ fieldId: string; text: string }>).detail;
      if (!detail?.fieldId) return;
      setDraft((current) => ({ ...current, values: { ...current.values, [detail.fieldId]: detail.text } }));
    };
    window.addEventListener("avendia-ai-insert", insert);
    window.addEventListener("avendia-ai-context-request", emitContext);
    return () => {
      window.removeEventListener("avendia-ai-insert", insert);
      window.removeEventListener("avendia-ai-context-request", emitContext);
    };
  }, [draft.values, tool, workflow]);

  useEffect(() => {
    if (!workflow) return;
    const timeout = window.setTimeout(() => {
      drafts.write(draft);
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [draft, drafts, storageKey, workflow]);

  useEffect(() => {
    if (!workflow || !documentIdFromUrl || draft.documentId === documentIdFromUrl) return;
    void gateway.readDocument(documentIdFromUrl).then((document) => {
      if (!document) return;
      const metadata = document.metadata_json ?? {};
      const fields = metadata.fields && typeof metadata.fields === "object" ? metadata.fields as Record<string, FieldValue> : {};
      setDraft(() => ({
        version: 2,
        documentId: document.id,
        serverVersion: Number(metadata.version ?? 1),
        values: { ...getInitialWorkflowValues(workflow), ...fields },
        artifact: metadata.artifact && typeof metadata.artifact === "object" ? metadata.artifact as WorkflowArtifact : null,
        currentStep: Math.min(workflow.steps.length - 1, Math.max(0, Number(metadata.current_step ?? 0))),
        templateId: typeof metadata.template_id === "string" ? metadata.template_id : undefined,
        templateName: typeof metadata.template_name === "string" ? metadata.template_name : undefined,
        reference: metadata.reference && typeof metadata.reference === "object" ? metadata.reference as DocumentReferenceSelection : undefined,
        curricular: metadata.curricular_reference && typeof metadata.curricular_reference === "object" ? metadata.curricular_reference as ReferenceSelection : undefined,
        updatedAt: new Date().toISOString(),
      }));
      setMessage("Documento recuperado desde tu historial.");
    }).catch(() => setMessage("No se pudo recuperar este documento del historial."));
  }, [documentIdFromUrl, draft.documentId, gateway, workflow]);

  useEffect(() => {
    const token = readAccessToken();
    if (!token) return;
    void listInstitutionalTemplates().then((items) => {
      setTemplates(items);
      setDraft((current) => {
        if (current.templateId && items.some((item) => item.id === current.templateId)) return current;
        const defaultTemplate = items.find((item) => item.is_default);
        return defaultTemplate ? { ...current, templateId: defaultTemplate.id, templateName: defaultTemplate.name } : { ...current, templateId: undefined, templateName: undefined };
      });
    }).catch(() => setTemplates([]));
  }, []);

  useEffect(() => () => guideRequest.current?.abort(), []);

  useEffect(() => {
    if (!preferences.always_show_help) return;
    const timeout = window.setTimeout(() => setOrientationOpen(true), 0);
    return () => window.clearTimeout(timeout);
  }, [preferences.always_show_help, workflow?.key]);

  useEffect(() => {
    void assistance.readPreferences().then((preferences) => {
      if (!preferences) return;
      setRememberAssistance(preferences.consent);
      if (preferences.consent && preferences.assistance_mode) setAssistanceMode(preferences.assistance_mode);
    });
  }, [assistance]);

  const exactPreviewWorkflowKey = workflow?.key ?? "";
  const exactPreviewTemplate = templates.find((template) => template.id === draft.templateId);
  const exactPreviewToolTitle = tool?.title ?? "";
  const prepareExactPreview = useCallback(async () => {
    if (!draft.artifact || !exactPreviewWorkflowKey || !exactPreviewToolTitle) {
      throw new Error("No hay documento para previsualizar.");
    }
    const { buildWorkflowDocxBlob } = await import("./exportWorkflowDocx");
    const generated = await buildWorkflowDocxBlob(draft.artifact, {
      workflowKey: exactPreviewWorkflowKey,
      values: draft.values,
      toolTitle: exactPreviewToolTitle,
    });
    const fileName = generated.fileName;
    // La vista exacta muestra el documento tal como se descargará, con el formato institucional si hay uno.
    const blob = exactPreviewTemplate && exactPreviewTemplate.extension === ".docx"
      ? (await applyInstitutionalTemplate(exactPreviewTemplate.id, generated.blob, fileName)).blob
      : generated.blob;
    const form = new FormData();
    form.set("file", new File([blob], fileName, {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    }));
    const preview = await apiBlob("/documents/preview-pdf", {
      method: "POST",
      body: form,
      timeoutMs: 55_000,
    });
    return preview.blob;
  }, [draft.artifact, draft.values, exactPreviewTemplate, exactPreviewToolTitle, exactPreviewWorkflowKey]);

  // Al llegar desde otra herramienta con "?desde=", se copian sus datos compatibles.
  useEffect(() => {
    if (!workflow || !tool || !continuedFromDocumentId) return;
    if (continuationApplied.current === continuedFromDocumentId) return;
    continuationApplied.current = continuedFromDocumentId;
    const targetType = workflow.key.split("/").at(-1) ?? tool.id;
    const campos = workflow.steps.flatMap((step) => step.fields);
    void gateway.listCompatibleDocuments(targetType)
      .then((documents) => {
        if (!documents) return;
        const source = documents.find((document) => document.id === continuedFromDocumentId);
        if (!source) {
          setMessage("El documento de origen ya no está disponible. Completa los datos manualmente.");
          return;
        }
        const sourceFields = source.metadata_json?.fields ?? {};
        const ids = campos
          .filter((field) => !blockedField(field.id) && sourceValueFor(field.id, sourceFields) !== undefined)
          .map((field) => field.id);
        if (!ids.length) {
          setMessage(`No hay datos reutilizables de «${source.title}». Completa los campos de esta herramienta.`);
          return;
        }
        const values = Object.fromEntries(ids.map((id) => [id, sourceValueFor(id, sourceFields) ?? ""]));
        setDraft((current) => ({
          ...current,
          artifact: null,
          reference: {
            documentId: source.id,
            revision: source.revision,
            title: source.title,
            fields: ids,
            compatibilityStatus: source.compatibility_status,
          },
          values: { ...current.values, ...values },
          fieldSources: { ...current.fieldSources, ...Object.fromEntries(ids.map((id) => [id, "reference" as const])) },
        }));
        setFieldsToReview(source.compatibility_status === "compatible" ? [] : ids);
        setMessage(`Se copiaron ${ids.length} datos de «${source.title}». Revísalos y genera el recurso.`);
      })
      .catch(() => setMessage("No se pudieron copiar los datos del documento de origen."));
  }, [continuedFromDocumentId, gateway, tool, workflow]);

  if (!tool || !workflow || !currentStep) return <Navigate to="/dashboard" replace />;

  const optionsFor = (field: WorkflowField) => {
    return resolvedFieldOptions(field, draft.values);
  };

  const setValue = (fieldId: string, value: FieldValue) => {
    const affected = impactedFields(allFields, fieldId, draft.values);
    setFieldsToReview((existing) => [...new Set([...existing.filter((id) => id !== fieldId), ...affected])]);
    if (affected.length) {
      setMessage(`${affected.length === 1 ? "Un campo depende" : `${affected.length} campos dependen`} de «${allFields.find((field) => field.id === fieldId)?.label ?? fieldId}». Conservamos su contenido para que puedas revisarlo.`);
    } else {
      setMessage("");
    }
    setDraft((current) => {
      const nextValues = { ...current.values, [fieldId]: value };
      return { ...current, values: nextValues, artifact: null, fieldSources: { ...current.fieldSources, [fieldId]: "teacher" } };
    });
    setStatus("idle");
  };

  const markTouched = (fieldId: string) => {
    setTouchedFields((current) => {
      if (current.has(fieldId)) return current;
      const next = new Set(current);
      next.add(fieldId);
      return next;
    });
  };

  const setRosterStudent = async (fieldId: string, selection: StudentSelection | null) => {
    setRosterSelections((current) => ({ ...current, [fieldId]: selection }));
    if (!selection?.studentIds[0]) return;

    try {
      const students = await listStudents(selection.rosterId);
      const selectedStudents = selection.studentIds
        .map((studentId) => students.find((item) => item.id === studentId))
        .filter((student): student is (typeof students)[number] => Boolean(student));
      if (!selectedStudents.length) {
        setMessage("Los estudiantes seleccionados ya no están disponibles en esta nómina.");
        return;
      }
      const selectedNames = selectedStudents.map((student) => student.full_name);
      setDraft((current) => ({
        ...current,
        values: {
          ...current.values,
          [fieldId]: selectedNames.join(", "),
          [`${fieldId}_student_id`]: selectedStudents.map((student) => student.id).join(","),
          [`${fieldId}_roster_id`]: selection.rosterId,
        },
        artifact: null,
      }));
      setStatus("idle");
      setMessage(selectedNames.length === 1
        ? `${selectedNames[0]} quedó vinculado a este documento.`
        : `${selectedNames.length} estudiantes quedaron vinculados a este documento.`);
    } catch {
      setMessage("No se pudo leer el estudiante seleccionado. Reintenta desde la nómina.");
    }
  };

  const revealInvalidField = (field: WorkflowField) => {
    const targetStep = workflow.steps.findIndex((item) => item.fields.some((candidate) => candidate.id === field.id));
    if (targetStep >= 0 && targetStep !== draft.currentStep) {
      setDraft((current) => ({ ...current, currentStep: targetStep, artifact: null }));
    }
    setShowErrors(true);
    setPendingFocusFieldId(field.id);
  };

  const saveLocal = (nextDraft = draft) => {
    const saved = drafts.write(nextDraft);
    setDraft(saved);
    return saved;
  };

  const saveDocument = async (nextDraft = draft) => {
    setStatus("saving");
    const saved = saveLocal(nextDraft);
    try {
      const nextServerVersion = (saved.serverVersion ?? 0) + 1;
      const context = derivePedagogicalContext(saved.values);
      const document = await gateway.saveDocument({
        documentId: saved.documentId,
        serverVersion: nextServerVersion,
        title: saved.artifact?.document_title ?? tool.title,
        documentType: workflow.key,
        content: saved.artifact ? artifactAsText(saved.artifact) : "Borrador en preparación",
        metadata: {
          fields: saved.values,
          artifact: saved.artifact,
          source_route: tool.path,
          current_step: saved.currentStep,
          template_id: saved.templateId,
          template_name: saved.templateName,
          reference: saved.reference,
          curricular_reference: saved.curricular,
          field_sources: saved.fieldSources,
          pedagogical_context: context,
        },
      });
      if (document) {
        if (curricularSourceId) {
          // La procedencia es orientativa: si el vínculo falla, el documento ya
          // está guardado y no tiene sentido dar el guardado por fallido.
          await gateway.linkDocument({
            parentDocumentId: curricularSourceId,
            childDocumentId: document.id,
            relationType: "continuation",
            inheritedFields: ["unit_title", "unit_purpose", "curricular_area", "grade", "level"],
            context,
            compatibilityStatus: "compatible",
          }).catch(() => undefined);
        }
        if (saved.reference) {
          await gateway.linkDocument({
            parentDocumentId: saved.reference.documentId,
            childDocumentId: document.id,
            relationType: "reference",
            inheritedFields: saved.reference.fields,
            context,
            compatibilityStatus: saved.reference.compatibilityStatus === "compatible" ? "compatible" : "review",
          });
        }
        setDraft(drafts.write({ ...saved, documentId: document.id, serverVersion: document.serverVersion }));
      }
      setStatus("saved");
      setMessage("Borrador guardado correctamente.");
      return true;
    } catch {
      setStatus("error");
      setMessage("El borrador quedó guardado en este dispositivo, pero no se pudo sincronizar con el servidor.");
      return false;
    }
  };

  /** Guarda el documento y devuelve su identificador en el servidor, si lo hay. */
  const saveAndGetDocumentId = async (): Promise<string | null> => {
    const ok = await saveDocument();
    if (!ok) return null;
    return drafts.read({}).documentId ?? null;
  };

  /** Abre la herramienta siguiente de la clase copiando lo llenado en esta sesión. */
  const continueClass = async (path: string) => {
    const documentId = await saveAndGetDocumentId();
    if (!documentId) {
      setStatus("error");
      setMessage("Guarda la sesión antes de continuar: no se pudo sincronizar con el servidor.");
      return;
    }
    navigate(`${path}?desde=${documentId}`);
  };

  const downloadWord = async () => {
    if (!draft.artifact) return;
    if (draft.artifact.quality_status === "blocked" && !allowBlockedExportRef.current) {
      setPendingConfirm({ kind: "blocked-export" });
      return;
    }
    allowBlockedExportRef.current = false;
    setExportingWord(true);
    try {
      const persisted = await saveDocument(draft);
      if (!persisted) return;
      if (selectedTemplate && selectedTemplate.extension === ".docx") {
        // El Word completo de Avendia recibe la cabecera, el pie y el logo del formato de la escuela.
        const { buildWorkflowDocxBlob } = await import("./exportWorkflowDocx");
        const generated = await buildWorkflowDocxBlob(draft.artifact, { workflowKey: workflow.key, values: draft.values, toolTitle: tool.title });
        const branded = await applyInstitutionalTemplate(selectedTemplate.id, generated.blob, generated.fileName);
        const { downloadApiBlob } = await import("../../lib/api");
        downloadApiBlob({ blob: branded.blob, filename: generated.fileName });
        setMessage(`Documento descargado con el formato ${selectedTemplate.name}.`);
      } else if (selectedTemplate) {
        await renderInstitutionalTemplate(selectedTemplate.id, draft.artifact, workflow.key);
        setMessage(`Documento descargado con ${selectedTemplate.name}.`);
      } else {
        const { exportWorkflowDocx } = await import("./exportWorkflowDocx");
        await exportWorkflowDocx(draft.artifact, {
          workflowKey: workflow.key,
          values: draft.values,
          toolTitle: tool.title,
        });
      }
    } catch {
      setStatus("error");
      setMessage("No se pudo preparar el documento Word.");
    } finally {
      setExportingWord(false);
    }
  };

  const copyArtifact = async () => {
    if (!draft.artifact) return;
    try {
      await navigator.clipboard.writeText(artifactAsText(draft.artifact));
      setStatus("saved");
      setMessage(workflow.artifactType === "comunicacion" ? "Correo copiado. Revísalo antes de enviarlo." : "Contenido copiado al portapapeles.");
    } catch {
      setStatus("error");
      setMessage("No se pudo copiar el contenido. Selecciónalo manualmente para copiarlo.");
    }
  };

  const goNext = () => {
    if (currentErrors.length) {
      setShowErrors(true);
      setMessage(`Completa ${currentErrors.length === 1 ? "el campo obligatorio" : "los campos obligatorios"} antes de continuar.`);
      revealInvalidField(currentErrors[0]);
      return;
    }
    setShowErrors(false);
    setMessage("");
    setDraft((current) => ({ ...current, currentStep: Math.min(current.currentStep + 1, workflow.steps.length - 1) }));
  };

  const generate = async (event?: FormEvent, targetStep?: number) => {
    event?.preventDefault();
    if (fieldsToReview.length && !skipContextReviewRef.current) {
      setPendingConfirm({ kind: "context", targetStep });
      return;
    }
    skipContextReviewRef.current = false;
    const allMissing = allFields.filter((field) => fieldError(field, draft.values[field.id], resolvedFieldOptions(field, draft.values)));
    if (allMissing.length) {
      setMessage(`Faltan ${allMissing.length} campos obligatorios o válidos para generar un resultado confiable.`);
      revealInvalidField(allMissing[0]);
      return;
    }
    setStatus("generating");
    setMessage("");
    try {
      const requestGeneration = () => gateway.generate({
        requestId: crypto.randomUUID(),
        toolId: tool.id,
        module: tool.module,
        toolTitle: tool.title,
        artifactType: workflow.artifactType,
        fields: Object.fromEntries(Object.entries(draft.values).map(([key, value]) => [key, displayValue(value)])),
        requestedSections: workflow.outputSections,
        ...(curricularSourceId ? { sourceDocumentId: curricularSourceId } : {}),
      });
      let artifact: WorkflowArtifact;
      try {
        artifact = await requestGeneration();
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 0) throw error;
        await new Promise((resolve) => window.setTimeout(resolve, 700));
        artifact = await requestGeneration();
      }
      const generated: Draft = {
        ...draft,
        version: 2,
        artifact,
        currentStep: targetStep ?? draft.currentStep,
        updatedAt: new Date().toISOString(),
      };
      setDraft(generated);
      drafts.write(generated);
      await saveDocument(generated);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No se pudo generar el recurso con IA.");
    }
  };

  const openGuide = (fieldId?: string) => {
    const candidate = allFields.find((field) => field.id === fieldId)
      ?? currentStep.fields.find((field) => field.guide !== false && (field.type === "textarea" || field.type === "text"))
      ?? allFields.find((field) => field.guide !== false && (field.type === "textarea" || field.type === "text"));
    setGuideFieldId(candidate?.id ?? "");
    setGuideAnswer1("");
    setGuideAnswer2("");
    setGuideCustom("");
    setGuideSuggestions([]);
    setGuideReply("");
    setGuideError("");
    setGuideApplyMode(displayValue(draft.values[candidate?.id ?? ""]).trim() ? "append" : "replace");
    setGuideOpen(true);
  };

  const toggleGuideSuggestion = (suggestion: string) => {
    setGuideSuggestions((current) => current.includes(suggestion)
      ? current.filter((item) => item !== suggestion)
      : [...current, suggestion]);
  };

  const askGuide = async () => {
    if (!guideField || !guideConfig) return;
    const details = [guideAnswer1, guideAnswer2, ...guideSuggestions, guideCustom].filter((value) => value.trim());
    if (!details.length) return;
    setGuideLoading(true);
    setGuideReply("");
    setGuideError("");
    guideRequest.current?.abort();
    const controller = new AbortController();
    guideRequest.current = controller;
    try {
      const requestPayload = JSON.stringify({
          tool_id: tool.id,
          tool_title: tool.title,
          module: tool.module,
          field_id: guideField.id,
          field_label: guideField.label,
          question1: guideConfig.question1,
          answer1: guideAnswer1,
          question2: guideConfig.question2,
          answer2: guideAnswer2,
          selected_suggestions: guideSuggestions,
          custom_detail: guideCustom,
          current_value: displayValue(draft.values[guideField.id]),
          form_values: Object.fromEntries(Object.entries(draft.values).map(([key, value]) => [key, displayValue(value)])),
          pedagogical_context: pedagogicalContext,
          context_fingerprint: pedagogicalContext.fingerprint,
          assistance_mode: assistanceMode,
      });
      const requestSuggestion = () => assistance.suggestField({ payload: requestPayload, signal: controller.signal });
      let response: { reply: string };
      try {
        response = await requestSuggestion();
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 0 || controller.signal.aborted) throw error;
        await new Promise((resolve) => window.setTimeout(resolve, 650));
        if (controller.signal.aborted) return;
        response = await requestSuggestion();
      }
      if (!controller.signal.aborted) setGuideReply(response.reply);
    } catch (error) {
      if (!controller.signal.aborted) setGuideError(error instanceof Error ? error.message : "No se pudo preparar la sugerencia.");
    } finally {
      if (!controller.signal.aborted) setGuideLoading(false);
    }
  };

  const invalidateGuideRequest = () => {
    guideRequest.current?.abort();
    guideRequest.current = null;
    setGuideLoading(false);
    setGuideReply("");
    setGuideError("");
  };

  const useGuideWithoutAI = () => {
    if (!guideField) return;
    const parts = [...guideSuggestions, guideAnswer1, guideAnswer2, guideCustom].map((value) => value.trim()).filter(Boolean);
    setGuideError("");
    setGuideReply(parts.join(assistanceMode === "quick" ? ". " : "\n\n"));
  };

  const saveGuideFeedback = (outcome: "useful" | "edited" | "incorrect" | "repetitive" | "too_long" | "discarded") => {
    if (!guideField) return;
    void assistance.recordFeedback({
      tool_id: tool.id,
      field_id: guideField.id,
      outcome,
      assistance_mode: assistanceMode,
      context_fingerprint: pedagogicalContext.fingerprint,
      edited: outcome === "edited",
    });
  };

  const changeAssistanceMode = (value: AssistanceMode) => {
    setAssistanceMode(value);
    if (!rememberAssistance) return;
    void assistance.savePreferences({ consent: true, assistanceMode: value });
  };

  const changeRememberAssistance = (value: boolean) => {
    setRememberAssistance(value);
    void assistance.savePreferences({ consent: value, assistanceMode });
  };

  const applyGuide = () => {
    if (!guideFieldId || !guideReply.trim()) return;
    const currentValue = displayValue(draft.values[guideFieldId]).trim();
    const nextValue = guideApplyMode === "append" && currentValue
      ? `${currentValue}\n\n${guideReply.trim()}`
      : guideReply.trim();
    setLastAppliedGuide({ fieldId: guideFieldId, previous: draft.values[guideFieldId] ?? "" });
    setDraft((current) => ({
      ...current,
      artifact: null,
      values: { ...current.values, [guideFieldId]: nextValue },
      fieldSources: { ...current.fieldSources, [guideFieldId]: "ai" },
    }));
    setFieldsToReview((current) => current.filter((id) => id !== guideFieldId));
    const targetStep = workflow.steps.findIndex((item) => item.fields.some((field) => field.id === guideFieldId));
    if (targetStep >= 0) setDraft((current) => ({ ...current, currentStep: targetStep, values: { ...current.values, [guideFieldId]: nextValue } }));
    setGuideOpen(false);
    saveGuideFeedback("useful");
    setMessage(`Sugerencia aplicada en «${guideField?.label ?? guideFieldId}». Puedes deshacerla antes de continuar.`);
  };

  const undoGuide = () => {
    if (!lastAppliedGuide) return;
    setDraft((current) => ({
      ...current,
      artifact: null,
      values: { ...current.values, [lastAppliedGuide.fieldId]: lastAppliedGuide.previous },
      fieldSources: { ...current.fieldSources, [lastAppliedGuide.fieldId]: "teacher" },
    }));
    setLastAppliedGuide(null);
    setMessage("Se restauró el contenido anterior del campo.");
  };

  /**
   * Origen curricular elegido en cascada (plan anual → unidad). Hereda solo los
   * campos que esta herramienta declara, para no inventar datos que no pide.
   */
  const pickCurricular = (selection: ReferenceSelection) => {
    const source = originSource(selection, curricularReferences);
    const inherited = inheritedValues(source, new Set(allFields.map((field) => field.id)));

    // Heredar nivel, grado o área equivale a cambiarlos a mano: hay que marcar
    // para revisión los campos que dependen de ellos e invalidar el resultado
    // ya generado, que se redactó con el contexto anterior.
    const affected = [...new Set(
      Object.keys(inherited).flatMap((fieldId) => impactedFields(allFields, fieldId, draft.values)),
    )].filter((fieldId) => !(fieldId in inherited));
    if (affected.length) {
      setFieldsToReview((existing) => [...new Set([...existing, ...affected])]);
      setMessage(`${affected.length === 1 ? "Un campo depende" : `${affected.length} campos dependen`} del documento de origen. Conservamos su contenido para que puedas revisarlo.`);
    }

    setDraft((current) => {
      const released = Object.fromEntries(
        releasedFields(current.curricularFields ?? [], inherited, current.fieldSources).map((id) => [id, ""] as const),
      );
      return {
        ...current,
        artifact: null,
        curricular: selection,
        curricularFields: Object.keys(inherited),
        values: { ...current.values, ...released, ...inherited },
        fieldSources: { ...current.fieldSources, ...Object.fromEntries(Object.keys(inherited).map((id) => [id, "reference" as const])) },
      };
    });
    setStatus("idle");
  };

  /** Descarta el borrador guardado y deja la herramienta como recién abierta. */
  const startFromScratch = () => {
    if (!workflow) return;
    const values = getInitialWorkflowValues(workflow);
    drafts.clear();
    setDraft(emptyDraft(values));
    setDraftPrompt(null);
    setFieldsToReview([]);
    setTouchedFields(new Set());
    setShowErrors(false);
    setEditingResult(false);
    setStatus("idle");
    setMessage("Empezaste un documento nuevo. Se conservan los datos de tu perfil.");
  };

  /** Quita la referencia y devuelve a su valor original los campos que copió. */
  const clearReference = () => {
    setDraft((current) => {
      const imported = current.reference?.fields ?? [];
      if (!imported.length) return { ...current, reference: undefined };
      const initial = workflow ? getInitialWorkflowValues(workflow) : {};
      const values = { ...current.values };
      const fieldSources = { ...(current.fieldSources ?? {}) };
      imported.forEach((id) => {
        if (fieldSources[id] !== "reference") return;
        const original = initial[id] ?? "";
        values[id] = original;
        if (displayValue(original).trim()) fieldSources[id] = "profile";
        else delete fieldSources[id];
      });
      return { ...current, reference: undefined, values, fieldSources };
    });
    setFieldsToReview([]);
    setMessage("Se quitaron los datos copiados del documento de referencia.");
  };

  const importReference = (reference: DocumentReferenceSelection, values: Record<string, FieldValue>) => {
    setDraft((current) => ({
      ...current,
      artifact: null,
      reference,
      values: { ...current.values, ...values },
      fieldSources: { ...current.fieldSources, ...Object.fromEntries(reference.fields.map((id) => [id, "reference" as const])) },
    }));
    setFieldsToReview(reference.compatibilityStatus === "compatible" ? [] : reference.fields);
    setMessage(`Se importaron ${reference.fields.length} campos de «${reference.title}». Revísalos antes de generar.`);
  };

  const updateArtifactSection = (index: number, key: "title" | "narrative", value: string) => {
    setDraft((current) => current.artifact ? {
      ...current,
      artifact: {
        ...current.artifact,
        sections: current.artifact.sections.map((section, sectionIndex) => sectionIndex === index ? { ...section, [key]: value } : section),
      },
    } : current);
  };

  const updateArtifactTableCell = (
    tableIndex: number,
    rowIndex: number,
    cellIndex: number,
    value: string,
  ) => {
    setDraft((current) => current.artifact ? {
      ...current,
      artifact: {
        ...current.artifact,
        tables: (current.artifact.tables ?? []).map((table, currentTableIndex) =>
          currentTableIndex === tableIndex ? {
            ...table,
            rows: table.rows.map((row, currentRowIndex) =>
              currentRowIndex === rowIndex
                ? row.map((cell, currentCellIndex) => currentCellIndex === cellIndex ? value : cell)
                : row,
            ),
          } : table,
        ),
      },
    } : current);
  };

  const regenerateArtifactSection = async (index: number) => {
    const section = draft.artifact?.sections[index];
    if (!section) return;
    setRegeneratingSection(index);
    try {
      const response = await assistance.rewriteSection({
        message: `Regenera únicamente la sección «${section.title}». Entrega texto listo para reemplazar la narrativa actual, sin encabezado ni explicaciones. Mantén coherencia con todos los datos del formulario.`,
        tool_title: tool.title,
        module: tool.module,
        form_values: Object.fromEntries(Object.entries(draft.values).map(([key, value]) => [key, displayValue(value)])),
      });
      updateArtifactSection(index, "narrative", response.reply);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo regenerar esta sección.");
      setStatus("error");
    } finally {
      setRegeneratingSection(null);
    }
  };

  const fieldLabel = (field: WorkflowField, value: FieldValue, canGuide: boolean) => (
    <span className="workflow-field__label">
      <span>{field.label}</span>
      {field.required ? <b aria-label="Obligatorio">*</b> : simple ? null : <em>Opcional</em>}
      {!simple && displayValue(value).trim() && draft.fieldSources?.[field.id] ? (
        <small className={`workflow-field__source is-${draft.fieldSources[field.id]}`}>
          {draft.fieldSources[field.id] === "profile" ? "De tu perfil" : draft.fieldSources[field.id] === "reference" ? "Del documento anterior" : draft.fieldSources[field.id] === "ai" ? "Propuesto por Avendia" : "Escrito por ti"}
        </small>
      ) : null}
      {canGuide ? (
        <button className="workflow-field__ai" type="button" onClick={(event) => { event.preventDefault(); openGuide(field.id); }}>
          <WandSparkles /> {displayValue(value).trim() ? "Pulir con IA" : "Sugerir con IA"}
        </button>
      ) : null}
      {fieldsToReview.includes(field.id) ? <small className="workflow-field__review"><AlertTriangle /> Revisar por cambio de contexto</small> : null}
    </span>
  );

  const renderField = (field: WorkflowField) => {
    const value = draft.values[field.id] ?? (field.type === "multiselect" ? [] : "");
    const options = optionsFor(field);
    const error = showErrors || touchedFields.has(field.id) ? fieldError(field, value, options) : "";
    const dependencyReady = !field.dependsOn || Boolean(displayValue(draft.values[field.dependsOn]).trim());
    const canGuide = !simple && field.guide !== false && (field.type === "textarea" || field.type === "text");
    const label = fieldLabel(field, value, canGuide);
    const helpId = `workflow-help-${field.id}`;
    const errorId = `workflow-error-${field.id}`;
    const describedBy = [field.help ? helpId : "", error ? errorId : ""].filter(Boolean).join(" ") || undefined;

    if (field.type === "repeater") {
      const items = Array.isArray(value) ? value : [];
      const minimum = field.minItems ?? (field.required ? 1 : 0);
      const maximum = field.maxItems ?? 20;
      return (
        <fieldset className={`workflow-field workflow-field--wide workflow-repeater ${error ? "is-invalid" : ""}`} data-workflow-field={field.id} aria-invalid={Boolean(error)} aria-describedby={describedBy} key={field.id}>
          <legend>{label}</legend>
          <div className="workflow-repeater__rows">
            {items.map((item, index) => (
              <div key={`${field.id}-${index}`}>
                <span>{index + 1}</span>
                <input value={item} placeholder={field.itemPlaceholder} aria-label={`${field.label} ${index + 1}`} aria-invalid={Boolean(error)} aria-describedby={describedBy} onBlur={() => markTouched(field.id)} onChange={(event) => setValue(field.id, items.map((current, itemIndex) => itemIndex === index ? event.target.value : current))} />
                <button type="button" onClick={() => setValue(field.id, items.filter((_, itemIndex) => itemIndex !== index))} disabled={items.length <= minimum} aria-label={`Eliminar fila ${index + 1}`}><Trash2 /></button>
              </div>
            ))}
            {!items.length ? <p>Aún no agregaste elementos.</p> : null}
          </div>
          <button className="workflow-repeater__add" type="button" disabled={items.length >= maximum} onClick={() => setValue(field.id, [...items, ""])}><Plus /> Añadir elemento</button>
          {field.help ? <small id={helpId}>{field.help}</small> : null}
          {error ? <small className="workflow-field__error" id={errorId}>{error}</small> : null}
        </fieldset>
      );
    }

    if (field.type === "multiselect") {
      const selected = Array.isArray(value) ? value : [];
      if (!dependencyReady) {
        return <fieldset className={`workflow-field workflow-field--wide workflow-multiselect ${error ? "is-invalid" : ""}`} data-workflow-field={field.id} aria-invalid={Boolean(error)} aria-describedby={describedBy} key={field.id}><legend>{label}</legend><div className="workflow-dependent-empty">{field.disabledPlaceholder ?? "Completa primero el campo anterior para ver las opciones."}</div>{field.help ? <small id={helpId}>{field.help}</small> : null}{error ? <small className="workflow-field__error" id={errorId}>{error}</small> : null}</fieldset>;
      }
      return (
        <fieldset className={`workflow-field workflow-field--wide workflow-multiselect workflow-multiselect--${field.variant ?? "default"} ${error ? "is-invalid" : ""}`} data-workflow-field={field.id} aria-invalid={Boolean(error)} aria-describedby={describedBy} key={field.id}>
          <legend>{label}</legend>
          <div>
            {options.map((option) => (
              <label key={option} className={selected.includes(option) ? "is-selected" : ""}>
                <input type="checkbox" checked={selected.includes(option)} aria-invalid={Boolean(error)} aria-describedby={describedBy} onChange={() => { markTouched(field.id); setValue(field.id, selected.includes(option) ? selected.filter((item) => item !== option) : field.maxItems && selected.length >= field.maxItems ? [...selected.slice(1), option] : [...selected, option]); }} />
                <span>{option}</span><i aria-hidden="true">{selected.includes(option) ? <Check /> : null}</i>
              </label>
            ))}
          </div>
          {field.help ? <small id={helpId}>{field.help}</small> : null}
          {error ? <small className="workflow-field__error" id={errorId}>{error}</small> : null}
        </fieldset>
      );
    }

    if (field.type === "select" && field.variant === "cards") {
      return (
        <fieldset className={`workflow-field ${field.wide ? "workflow-field--wide" : ""} workflow-choice-cards ${error ? "is-invalid" : ""}`} data-workflow-field={field.id} aria-invalid={Boolean(error)} aria-describedby={describedBy} key={field.id}>
          <legend>{label}</legend>
          <div role="radiogroup" aria-label={field.label}>
            {options.map((option) => (
              <button type="button" role="radio" aria-checked={value === option} aria-describedby={describedBy} className={value === option ? "is-selected" : ""} key={option} onClick={() => { markTouched(field.id); setValue(field.id, option); }}>
                <span>{option}</span><i>{value === option ? <Check /> : null}</i>
              </button>
            ))}
          </div>
          {field.help ? <small id={helpId}>{field.help}</small> : null}
          {error ? <small className="workflow-field__error" id={errorId}>{error}</small> : null}
        </fieldset>
      );
    }

    if (field.type === "select" && field.variant === "radio") {
      return (
        <fieldset className={`workflow-field workflow-radio-group ${error ? "is-invalid" : ""}`} data-workflow-field={field.id} aria-invalid={Boolean(error)} aria-describedby={describedBy} key={field.id}>
          <legend>{label}</legend>
          <div role="radiogroup" aria-label={field.label}>
            {options.map((option) => (
              <label key={option}>
                <input type="radio" name={field.id} value={option} checked={value === option} aria-invalid={Boolean(error)} aria-describedby={describedBy} onChange={() => { markTouched(field.id); setValue(field.id, option); }} />
                <span>{option}</span>
              </label>
            ))}
          </div>
          {field.help ? <small id={helpId}>{field.help}</small> : null}
          {error ? <small className="workflow-field__error" id={errorId}>{error}</small> : null}
        </fieldset>
      );
    }

    if (field.selectionFromRoster) {
      const persistedRosterId = displayValue(draft.values[`${field.id}_roster_id`]);
      const persistedStudentIds = displayValue(draft.values[`${field.id}_student_id`]).split(",").map((item) => item.trim()).filter(Boolean);
      const rosterMode = field.rosterMode ?? "single";
      const selection = rosterSelections[field.id]
        ?? (persistedRosterId && persistedStudentIds.length ? {
          mode: rosterMode,
          rosterId: persistedRosterId,
          studentIds: persistedStudentIds,
        } : null);
      return (
        <fieldset className={`workflow-field workflow-field--wide workflow-student-source ${error ? "is-invalid" : ""}`} data-workflow-field={field.id} aria-invalid={Boolean(error)} aria-describedby={describedBy} key={field.id}>
          <legend>{label}</legend>
          <StudentSelector
            mode={rosterMode}
            value={selection}
            onChange={(nextSelection) => { void setRosterStudent(field.id, nextSelection); }}
            label={rosterMode === "single" ? "Seleccionar desde Mis estudiantes" : "Seleccionar desde la nómina central"}
            description="El nombre se conservará en el documento y quedará vinculado a la nómina elegida."
            required={field.required}
            manageStudentsHref="/dashboard/mis-estudiantes"
            id={`workflow-${field.id}`}
          />
          {displayValue(value).trim() ? <p className="workflow-student-source__selected"><Check /> Vinculado{rosterMode === "single" ? "" : "s"}: <strong>{displayValue(value)}</strong></p> : null}
          {field.help ? <small id={helpId}>{field.help}</small> : null}
          {error ? <small className="workflow-field__error" id={errorId}>{error}</small> : null}
        </fieldset>
      );
    }

    return (
      <label className={`workflow-field ${field.wide || field.type === "textarea" ? "workflow-field--wide" : ""} ${error ? "is-invalid" : ""}`} data-workflow-field={field.id} key={field.id}>
        {label}
        {field.type === "textarea" ? (
          <textarea rows={5} value={String(value)} placeholder={contextualPlaceholder(field, pedagogicalContext)} aria-invalid={Boolean(error)} aria-describedby={describedBy} onBlur={() => markTouched(field.id)} onChange={(event) => setValue(field.id, event.target.value)} />
        ) : field.type === "select" ? (
          <select value={String(value)} disabled={!dependencyReady} aria-invalid={Boolean(error)} aria-describedby={describedBy} onChange={(event) => { markTouched(field.id); setValue(field.id, event.target.value); }}>
            <option value="">{dependencyReady ? "Selecciona una opción" : field.disabledPlaceholder ?? "Completa primero el campo anterior"}</option>
            {options.map((option) => <option value={option} key={option}>{option}</option>)}
          </select>
        ) : (
          <input type={field.type} min={field.min} max={field.max} value={String(value)} placeholder={contextualPlaceholder(field, pedagogicalContext)} aria-invalid={Boolean(error)} aria-describedby={describedBy} onBlur={() => markTouched(field.id)} onChange={(event) => setValue(field.id, event.target.value)} />
        )}
        {field.help ? <small id={helpId}>{field.help}</small> : null}
        {error ? <small className="workflow-field__error" id={errorId}>{error}</small> : null}
      </label>
    );
  };

  const renderValidationSummary = () => {
    if (!showErrors || !currentErrors.length) return null;
    return (
      <section className="workflow-validation-summary" role="alert" aria-live="assertive" aria-atomic="true">
        <AlertTriangle aria-hidden="true" />
        <div>
          <h3>{currentErrors.length === 1 ? "Falta completar 1 campo" : `Faltan completar ${currentErrors.length} campos`}</h3>
          <p>Selecciona un campo para revisarlo. Avendia llevará el foco al cuadro correspondiente.</p>
          <ul>
            {currentErrors.map((field) => (
              <li key={field.id}>
                <button type="button" onClick={() => revealInvalidField(field)}>
                  <strong>{field.label}</strong>
                  <span>{fieldError(field, draft.values[field.id], resolvedFieldOptions(field, draft.values))}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  };

  const renderQualityPanel = () => {
    if (!draft.artifact) return null;
    const checks = draft.artifact.quality_checks ?? [];
    const warnings = draft.artifact.warnings ?? [];
    const nextTools = (draft.artifact.suggested_next_tools ?? [])
      .map((toolId) => toolCatalog.find((candidate) => candidate.id === toolId))
      .filter((candidate): candidate is (typeof toolCatalog)[number] => Boolean(candidate));
    if (!checks.length && !draft.artifact.generation_brief) return null;
    const passed = checks.filter((check) => check.passed).length;
    const qualityStatus = draft.artifact.quality_status ?? (warnings.length ? "review" : "ready");
    const qualityLabel = qualityStatus === "ready"
      ? "Listo para usar"
      : qualityStatus === "blocked"
        ? "Generación bloqueada"
        : "Requiere revisión docente";
    return (
      <section className={`generation-quality is-${qualityStatus} ${warnings.length ? "has-warnings" : ""}`} aria-labelledby="generation-quality-title">
        <header>
          <span>{warnings.length ? <AlertTriangle aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}</span>
          <div>
            <small>Contrato {draft.artifact.contract_version ?? "actual"}</small>
            <h2 id="generation-quality-title">Control de calidad de la generación</h2>
            <p><strong>{qualityLabel}.</strong> {draft.artifact.generation_brief}</p>
          </div>
          {checks.length ? <strong>{passed}/{checks.length}</strong> : null}
        </header>
        {draft.artifact.repair_attempted && draft.artifact.repair_succeeded ? (
          <aside className="generation-quality__repair" role="status">
            <Sparkles aria-hidden="true" />
            <span>
              <strong>Corrección automática aplicada</strong>
              <small>La primera propuesta no superó todas las reglas obligatorias. Avendia reparó únicamente los apartados observados y volvió a validar el documento completo antes de mostrarlo.</small>
            </span>
          </aside>
        ) : null}
        {checks.length ? <ul>{checks.map((check) => (
          <li className={check.passed ? "is-passed" : "needs-review"} key={check.code}>
            {check.passed ? <CheckCircle2 aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}
            <span><strong>{check.label}{check.severity ? ` · ${check.severity}` : ""}</strong><small>{check.detail}</small></span>
          </li>
        ))}</ul> : null}
        {nextTools.length ? <footer><span>Puede continuar con:</span>{nextTools.map((nextTool) => <Link key={nextTool.path} to={nextTool.path}>{nextTool.title}<ArrowRight aria-hidden="true" /></Link>)}</footer> : null}
      </section>
    );
  };

  /** Aviso breve para el docente cuando el resultado necesita revisión; el detalle técnico queda en administración. */
  const renderSimpleQualityNotice = () => {
    if (!draft.artifact || (draft.artifact.quality_status ?? "ready") === "ready") return null;
    const warning = draft.artifact.warnings?.[0];
    return <div className="workflow-message" role="status"><AlertTriangle aria-hidden="true" /> Revisa el documento antes de usarlo{warning ? `: ${warning}` : "."}</div>;
  };

  const renderCurrentFields = () => {
    if (currentStep.kind && currentStep.kind !== "form") {
      if (!draft.artifact) {
        const copy = currentStep.kind === "generate"
          ? generationBrief
          : "Genera el resultado para abrir esta etapa de revisión.";
        return <div className="workflow-ready"><CheckCircle2 /><div><h3>Confirma el encargo</h3><p>{copy}</p></div></div>;
      }
      return renderEmbeddedArtifact(currentStep.kind);
    }
    if (!currentStep.fields.length) {
      return <div className="workflow-ready"><CheckCircle2 /><div><h3>Todo listo para generar</h3><p>Avendia usará los datos de los pasos anteriores para crear un resultado estructurado, editable y descargable.</p></div></div>;
    }
    if (!currentStep.groups?.length) {
      return <div className={`workflow-grid workflow-grid--${currentStep.columns ?? 2}`}>{currentStep.fields.map(renderField)}</div>;
    }
    const groupedIds = new Set(currentStep.groups.flatMap((group) => group.fieldIds));
    const remainingFields = currentStep.fields.filter((field) => !groupedIds.has(field.id));
    return <div className="workflow-groups">
      {currentStep.groups.map((group) => {
        const groupFields = group.fieldIds
          .map((fieldId) => currentStep.fields.find((field) => field.id === fieldId))
          .filter((field): field is WorkflowField => Boolean(field));
        if (group.collapsed) {
          return <details className="workflow-group workflow-group--collapsed" key={group.id}>
            <summary><h3>{group.title}</h3>{group.description ? <p>{group.description}</p> : null}</summary>
            <div className={`workflow-grid workflow-grid--${group.columns ?? currentStep.columns ?? 2}`}>{groupFields.map(renderField)}</div>
          </details>;
        }
        return <section className="workflow-group" key={group.id}>
          <header><h3>{group.title}</h3>{group.description ? <p>{group.description}</p> : null}</header>
          <div className={`workflow-grid workflow-grid--${group.columns ?? currentStep.columns ?? 2}`}>{groupFields.map(renderField)}</div>
        </section>;
      })}
      {remainingFields.length ? <section className="workflow-group"><div className={`workflow-grid workflow-grid--${currentStep.columns ?? 2}`}>{remainingFields.map(renderField)}</div></section> : null}
    </div>;
  };

  /** Recursos que continúan la clase, disponibles junto al resultado de la sesión. */
  function renderClassNext() {
    if (!isClassSession) return null;
    return (
      <section className="workflow-class-next" aria-label="Continúa tu clase">
        <div className="workflow-class-next__intro">
          <strong>Continúa tu clase</strong>
          <small>Cada recurso se crea con los datos que ya llenaste en esta sesión.</small>
        </div>
        <div className="workflow-class-next__cards">
          {CLASS_CONTINUATIONS.map((item) => (
            <button
              key={item.path}
              type="button"
              className="workflow-class-next__card"
              disabled={status === "saving"}
              onClick={() => void continueClass(item.path)}
            >
              <span>{item.label}</span>
              <small>{item.hint}</small>
            </button>
          ))}
        </div>
      </section>
    );
  }

  const renderEmbeddedArtifact = (kind: NonNullable<WorkflowStep["kind"]> = "preview") => {
    if (!draft.artifact) return null;
    const showInteractive = kind === "interactive";
    const showDownload = kind === "download" || kind === "preview" || kind === "interactive";
    return <div className="workflow-embedded-result">
      {showDownload ? <section className="workflow-result-actions workflow-result-actions--embedded">
        <button type="button" className="secondary-button" onClick={() => setEditingResult((current) => !current)}><Pencil /> {editingResult ? "Cerrar edición" : "Editar resultado"}</button>
        <button type="button" className="secondary-button" onClick={() => generate(undefined, draft.currentStep)} disabled={status === "generating"}><RefreshCw /> Regenerar todo</button>
        <button type="button" className="secondary-button" onClick={() => void copyArtifact()}><Clipboard /> {workflow.artifactType === "comunicacion" ? "Copiar correo" : "Copiar"}</button>
        {renderTemplateExport()}
      </section> : null}
      {showInteractive && tool.id !== "tarea-extension-hogar" && draft.artifact.activity?.items.length ? <InteractiveArtifact activity={draft.artifact.activity} toolId={tool.id} values={draft.values} /> : null}
      {simple ? renderSimpleQualityNotice() : renderQualityPanel()}
      {renderClassNext()}
      <StructuredArtifactPreview artifact={draft.artifact} artifactType={workflow.artifactType} toolId={tool.id} values={draft.values} workflowKey={workflow.key} onDownloadWord={downloadWord} editingResult={editingResult} onUpdateSection={updateArtifactSection} onUpdateTableCell={updateArtifactTableCell} onRegenerateSection={regenerateArtifactSection} regeneratingSection={regeneratingSection} onPrepareExactPreview={prepareExactPreview} />
    </div>;
  };

  function selectTemplate(templateId: string) {
    const template = templates.find((item) => item.id === templateId);
    setDraft((current) => ({ ...current, templateId: template?.id, templateName: template?.name }));
  }

  function renderTemplateExport() {
    return <div className="workflow-template-export">
      <label><FileArchive aria-hidden="true" /><span>Formato de salida</span><select value={draft.templateId ?? ""} onChange={(event) => selectTemplate(event.target.value)} aria-label="Formato de salida"><option value="">Diseño estándar de Avendia (DOCX)</option>{templates.map((template) => <option key={template.id} value={template.id}>{template.name} · {template.extension.slice(1).toUpperCase()}</option>)}</select></label>
      <button type="button" className="workflow-primary" onClick={downloadWord} disabled={exportingWord}>{exportingWord ? <LoaderCircle className="is-spinning" /> : <Download />}{exportingWord ? "Preparando…" : selectedTemplate ? `Descargar ${selectedTemplate.extension.slice(1).toUpperCase()}` : "Descargar Word"}</button>
    </div>;
  }

  const draftSavedAt = draftPrompt?.mode === "restored" && draftPrompt.updatedAt
    ? new Date(draftPrompt.updatedAt).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" })
    : "";
  const draftPromptBanner = draftPrompt ? (
    <section className="workflow-draft-choice" role="status" aria-label="Borrador guardado">
      <div className="workflow-draft-choice__text">
        <strong>
          {draftPrompt.mode === "confirm"
            ? "¿Empezar desde cero?"
            : `Tienes un borrador guardado${draftSavedAt ? ` del ${draftSavedAt}` : ""}`}
        </strong>
        <small>
          {draftPrompt.mode === "confirm"
            ? "Se descartará lo que ves en pantalla. Los datos de tu perfil se conservan."
            : draftPrompt.hasArtifact
              ? "Incluye el documento que ya habías generado."
              : "Incluye los datos que ya habías completado."}
        </small>
      </div>
      <div className="workflow-draft-choice__actions">
        {draftPrompt.mode === "confirm" ? (
          <>
            <button type="button" className="secondary-button" onClick={() => setDraftPrompt(null)}>Cancelar</button>
            <button type="button" className="workflow-primary" onClick={startFromScratch}><RotateCcw /> Sí, empezar desde cero</button>
          </>
        ) : (
          <>
            <button type="button" className="workflow-primary" onClick={() => setDraftPrompt(null)}>Continuar borrador</button>
            <button type="button" className="secondary-button" onClick={startFromScratch}><RotateCcw /> Empezar desde cero</button>
          </>
        )}
      </div>
    </section>
  ) : null;
  // Mientras el aviso está en pantalla el botón sobra: el aviso ya ofrece las dos opciones.
  const startOverButton = draftPrompt ? null : (
    <button type="button" className="secondary-button" onClick={() => setDraftPrompt({ mode: "confirm" })}>
      <RotateCcw /> Empezar desde cero
    </button>
  );

  if (draft.artifact && !workflow.embeddedResult) {
    return (
      <main className="workflow-page"><div className="workflow-shell">
        <header className="workflow-header"><div><span>{tool.module} · resultado generado</span><h1>{draft.artifact.document_title}</h1><p>{draft.artifact.executive_summary}</p></div><button type="button" className="secondary-button" onClick={() => saveDocument()}><Save /> Guardar</button></header>
        {draftPromptBanner}
        <section className="workflow-result-actions">{startOverButton}<button type="button" className="secondary-button" onClick={() => setDraft((current) => ({ ...current, artifact: null, currentStep: workflow.steps.length - 1 }))}><ChevronLeft /> Editar datos</button><button type="button" className="secondary-button" onClick={() => setEditingResult((current) => !current)}><Pencil /> {editingResult ? "Cerrar edición" : "Editar resultado"}</button><button type="button" className="secondary-button" onClick={() => generate()} disabled={status === "generating"}><RefreshCw /> Regenerar todo</button><button type="button" className="secondary-button" onClick={() => void copyArtifact()}><Clipboard /> {workflow.artifactType === "comunicacion" ? "Copiar correo" : "Copiar"}</button>{renderTemplateExport()}</section>
        {message ? <div className={`workflow-message ${status === "error" ? "workflow-message--error" : ""}`}>{message}</div> : null}
        {draft.artifact.activity?.items.length ? <InteractiveArtifact activity={draft.artifact.activity} toolId={tool.id} values={draft.values} /> : null}
        {simple ? renderSimpleQualityNotice() : <details className="generation-quality-details">
          <summary>Detalle técnico de la generación</summary>
          {renderQualityPanel()}
        </details>}
        {renderClassNext()}
        <StructuredArtifactPreview artifact={draft.artifact} artifactType={workflow.artifactType} toolId={tool.id} values={draft.values} workflowKey={workflow.key} onDownloadWord={downloadWord} editingResult={editingResult} onUpdateSection={updateArtifactSection} onUpdateTableCell={updateArtifactTableCell} onRegenerateSection={regenerateArtifactSection} regeneratingSection={regeneratingSection} onPrepareExactPreview={prepareExactPreview} />
        {pendingConfirm ? <div className="dialog-backdrop"><section className="workflow-confirm" role="dialog" aria-modal="true" aria-labelledby="workflow-confirm-title"><span><AlertTriangle /></span>
          {pendingConfirm.kind === "context" ? <>
            <h2 id="workflow-confirm-title">¿Generar con el contexto actual?</h2>
            <p>{fieldsToReview.length === 1 ? "Un campo depende" : `${fieldsToReview.length} campos dependen`} de un dato que cambiaste: {fieldsToReview.map((id) => allFields.find((field) => field.id === id)?.label ?? id).join(", ")}. Puedes revisarlos o continuar tal como están.</p>
            <div className="workflow-confirm__actions">
              <button type="button" className="secondary-button" onClick={() => { const field = allFields.find((candidate) => candidate.id === fieldsToReview[0]); setPendingConfirm(null); if (field) revealInvalidField(field); }}>Revisar campos</button>
              <button type="button" className="primary-button" onClick={() => { const target = pendingConfirm.targetStep; setPendingConfirm(null); setFieldsToReview([]); skipContextReviewRef.current = true; void generate(undefined, target); }}>Sí, continuar</button>
            </div>
          </> : <>
            <h2 id="workflow-confirm-title">¿Descargar de todos modos?</h2>
            <p>Este resultado no superó algunos controles obligatorios (los ves marcados en el control de calidad). Puedes regenerarlo o corregirlo, o descargarlo bajo tu revisión.</p>
            <div className="workflow-confirm__actions">
              <button type="button" className="secondary-button" onClick={() => setPendingConfirm(null)}>Volver a revisar</button>
              <button type="button" className="primary-button" onClick={() => { setPendingConfirm(null); allowBlockedExportRef.current = true; void downloadWord(); }}>Sí, descargar</button>
            </div>
          </>}
        </section></div> : null}
        <GenerationProgressOverlay open={status === "generating"} toolTitle={tool.title} family={tool.module} toolId={tool.id} />
      </div></main>
    );
  }

  return (
    <main className="workflow-page"><div className="workflow-shell">
      <header className="workflow-header"><div><span>{simple ? tool.module : `${tool.module} · complejidad ${workflow.complexity}`}</span><h1>{tool.title}</h1><p>{tool.description}</p></div><div className="workflow-header__actions">{startOverButton}<button type="button" className="secondary-button" onClick={() => saveDocument()} disabled={status === "saving"}>{status === "saving" ? <LoaderCircle className="is-spinning" /> : status === "saved" ? <Check /> : <Save />}{status === "saved" ? "Guardado" : "Guardar borrador"}</button></div></header>
      {simple ? null : <section className={`workflow-orientation ${orientationOpen ? "is-open" : ""}`} aria-labelledby="workflow-orientation-title">
        <button className="workflow-orientation__toggle" type="button" aria-expanded={orientationOpen} onClick={() => setOrientationOpen((value) => !value)}>
          <span><CircleHelp aria-hidden="true" /><strong id="workflow-orientation-title">Antes de comenzar</strong></span>
          <small>{orientationOpen ? "Ocultar orientación" : "Ver qué necesitas y qué creará Avendia"}</small>
        </button>
        {orientationOpen ? <div className="workflow-orientation__content">
          <article><ListChecks aria-hidden="true" /><div><strong>Lo que necesitas</strong><p>{preparationLabels.length ? preparationLabels.join(", ") : "Confirmar el encargo"}.</p></div></article>
          <article><Sparkles aria-hidden="true" /><div><strong>Lo que vas a crear</strong><p>{tool.description}</p></div></article>
          <article><Clock3 aria-hidden="true" /><div><strong>Tiempo aproximado</strong><p>{estimatedMinutes} minutos en modo guiado.</p></div></article>
        </div> : null}
      </section>}
      {draftPromptBanner}
      <CurricularReferencePicker
        references={curricularReferences ?? []}
        selection={curricularSelection}
        onChange={pickCurricular}
        help="La herramienta se genera alineada a ese documento y queda vinculada a él en el historial."
      />
      {simple ? null : <DocumentReferencePanel targetType={workflow.key.split("/").at(-1) ?? tool.id} fields={allFields} selection={draft.reference} onImport={importReference} onClear={clearReference} />}
      <ol className="workflow-stepper" aria-label="Pasos de la herramienta">{workflow.steps.map((item, index) => {
        const state = stepStatus(item, index);
        return <li className={index === draft.currentStep ? "is-active" : state === "Listo" ? "is-completed" : ""} key={item.id}><button type="button" aria-current={index === draft.currentStep ? "step" : undefined} aria-label={`${item.shortTitle}: ${state}`} onClick={() => setDraft((current) => ({ ...current, currentStep: index }))}><span>{state === "Listo" && index !== draft.currentStep ? <Check /> : index + 1}</span><strong>{item.shortTitle}</strong><small>{state}</small></button></li>;
      })}</ol>
      <form className="workflow-card" onSubmit={(event) => {
        event.preventDefault();
        const kind = currentStep.kind ?? "form";
        const nextIndex = Math.min(workflow.steps.length - 1, draft.currentStep + 1);
        const nextKind = workflow.steps[nextIndex]?.kind ?? "form";
        if (kind === "generate") {
          void generate(event, nextIndex);
          return;
        }
        if (kind !== "form") {
          if (!draft.artifact) void generate(event, draft.currentStep);
          else if (draft.currentStep < workflow.steps.length - 1) setDraft((current) => ({ ...current, currentStep: nextIndex }));
          return;
        }
        if (draft.currentStep === workflow.steps.length - 1) {
          void generate(event, draft.currentStep);
          return;
        }
        if (nextKind === "preview" || nextKind === "interactive" || nextKind === "download") {
          void generate(event, nextIndex);
          return;
        }
        goNext();
      }}><div className="workflow-card__intro"><small>Paso {draft.currentStep + 1} de {workflow.steps.length} · {stepStatus(currentStep, draft.currentStep)}</small><h2>{currentStep.title}</h2><p>{currentStep.description}</p>{simple ? null : <div className="workflow-completion" aria-label={`${completionPercent}% de información necesaria completada`}><span><strong>{remainingRequired ? `${remainingRequired} ${remainingRequired === 1 ? "dato necesario pendiente" : "datos necesarios pendientes"}` : "Información necesaria completa"}</strong><small>{completionPercent}%</small></span><progress max="100" value={completionPercent}>{completionPercent}%</progress></div>}</div>
      {simple ? null : <section className={`workflow-context-status is-${liveContextStatus.status}`} aria-live="polite">
        <span>{liveContextStatus.status === "coherent" ? <CheckCircle2 /> : <AlertTriangle />}</span>
        <div><strong>{liveContextStatus.label}</strong><small>{liveContextStatus.detail}</small>{pedagogicalContext.summary.length ? <p>{pedagogicalContext.summary.join(" · ")}</p> : null}</div>
        {fieldsToReview.length ? <button type="button" onClick={() => { const field = allFields.find((candidate) => candidate.id === fieldsToReview[0]); if (field) revealInvalidField(field); }}>Revisar ahora</button> : null}
      </section>}
      {renderValidationSummary()}{renderCurrentFields()}{message ? <div className={`workflow-message ${status === "error" ? "workflow-message--error" : ""}`}>{message}{lastAppliedGuide ? <button type="button" onClick={undoGuide}>Deshacer sugerencia</button> : null}</div> : null}<footer className="workflow-actions"><button type="button" className="secondary-button" disabled={draft.currentStep === 0 || status === "generating"} onClick={() => setDraft((current) => ({ ...current, currentStep: Math.max(0, current.currentStep - 1) }))}><ChevronLeft /> Anterior</button>{draft.currentStep < workflow.steps.length - 1 ? <button type="submit" className="workflow-primary" disabled={status === "generating"}>{status === "generating" ? <LoaderCircle className="is-spinning" /> : currentStep.kind === "generate" ? <Sparkles /> : null}{status === "generating" ? "Creando con IA…" : currentStep.kind === "generate" ? "Generar con IA" : "Siguiente"}{currentStep.kind === "generate" ? null : <ChevronRight />}</button> : draft.artifact ? <button type="button" className="workflow-primary" onClick={downloadWord} disabled={exportingWord}>{exportingWord ? <LoaderCircle className="is-spinning" /> : <Download />}{exportingWord ? "Preparando…" : "Descargar Word"}</button> : <button type="submit" className="workflow-primary" disabled={status === "generating"}>{status === "generating" ? <LoaderCircle className="is-spinning" /> : <Sparkles />}{status === "generating" ? "Creando con IA…" : "Generar con IA"}</button>}</footer></form>
      {guideOpen && guideField && guideConfig ? <ContextualAIGuideDialog
        toolTitle={tool.title}
        field={guideField}
        guide={guideConfig}
        hasExistingContent={Boolean(displayValue(draft.values[guideField.id]).trim())}
        currentValue={displayValue(draft.values[guideField.id])}
        contextSummary={pedagogicalContext.summary}
        contextFingerprint={pedagogicalContext.fingerprint}
        contextWarnings={fieldsToReview.includes(guideField.id) ? ["Este campo depende de un dato que cambió y necesita revisión."] : []}
        assistanceMode={assistanceMode}
        answer1={guideAnswer1}
        answer2={guideAnswer2}
        customDetail={guideCustom}
        selectedSuggestions={guideSuggestions}
        reply={guideReply}
        error={guideError}
        loading={guideLoading}
        applyMode={guideApplyMode}
        onAnswer1Change={(value) => { invalidateGuideRequest(); setGuideAnswer1(value); }}
        onAnswer2Change={(value) => { invalidateGuideRequest(); setGuideAnswer2(value); }}
        onCustomDetailChange={(value) => { invalidateGuideRequest(); setGuideCustom(value); }}
        onToggleSuggestion={toggleGuideSuggestion}
        onReplyChange={setGuideReply}
        onApplyModeChange={setGuideApplyMode}
        onAssistanceModeChange={changeAssistanceMode}
        rememberAssistance={rememberAssistance}
        onRememberAssistanceChange={changeRememberAssistance}
        onUseWithoutAI={useGuideWithoutAI}
        onFeedback={saveGuideFeedback}
        onGenerate={() => void askGuide()}
        onApply={applyGuide}
        onClose={() => { guideRequest.current?.abort(); setGuideOpen(false); }}
      /> : null}
      {pendingConfirm ? <div className="dialog-backdrop"><section className="workflow-confirm" role="dialog" aria-modal="true" aria-labelledby="workflow-confirm-title"><span><AlertTriangle /></span>
          {pendingConfirm.kind === "context" ? <>
            <h2 id="workflow-confirm-title">¿Generar con el contexto actual?</h2>
            <p>{fieldsToReview.length === 1 ? "Un campo depende" : `${fieldsToReview.length} campos dependen`} de un dato que cambiaste: {fieldsToReview.map((id) => allFields.find((field) => field.id === id)?.label ?? id).join(", ")}. Puedes revisarlos o continuar tal como están.</p>
            <div className="workflow-confirm__actions">
              <button type="button" className="secondary-button" onClick={() => { const field = allFields.find((candidate) => candidate.id === fieldsToReview[0]); setPendingConfirm(null); if (field) revealInvalidField(field); }}>Revisar campos</button>
              <button type="button" className="primary-button" onClick={() => { const target = pendingConfirm.targetStep; setPendingConfirm(null); setFieldsToReview([]); skipContextReviewRef.current = true; void generate(undefined, target); }}>Sí, continuar</button>
            </div>
          </> : <>
            <h2 id="workflow-confirm-title">¿Descargar de todos modos?</h2>
            <p>Este resultado no superó algunos controles obligatorios (los ves marcados en el control de calidad). Puedes regenerarlo o corregirlo, o descargarlo bajo tu revisión.</p>
            <div className="workflow-confirm__actions">
              <button type="button" className="secondary-button" onClick={() => setPendingConfirm(null)}>Volver a revisar</button>
              <button type="button" className="primary-button" onClick={() => { setPendingConfirm(null); allowBlockedExportRef.current = true; void downloadWord(); }}>Sí, descargar</button>
            </div>
          </>}
        </section></div> : null}
        <GenerationProgressOverlay open={status === "generating"} toolTitle={tool.title} family={tool.module} toolId={tool.id} />
    </div></main>
  );
}

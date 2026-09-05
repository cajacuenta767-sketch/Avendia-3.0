import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  Download,
  FileArchive,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useSearchParams } from "react-router-dom";

import { getWorkflowFieldGuide } from "../../config/aiGuides";
import { getDynamicEducationOptions } from "../../config/education";
import { getToolByPath, tools as toolCatalog } from "../../config/tools";
import { StudentSelector, type StudentSelection } from "../../components/students/StudentSelector";
import { GenerationProgressOverlay } from "../../components/GenerationProgressOverlay";
import { listStudents } from "../rosters/rosterApi";
import {
  getInitialWorkflowValues,
  getWorkflow,
  type WorkflowField,
  type WorkflowFieldGuide,
  type WorkflowStep,
  workflowModalities,
} from "../../config/workflows";
import { ApiError, apiRequest } from "../../lib/api";
import { sessionDraftScope } from "../../lib/session";
import type { WorkflowArtifact } from "./exportWorkflowDocx";
import { ContextualAIGuideDialog } from "./ContextualAIGuideDialog";
import { DocumentReferencePanel, type DocumentReferenceSelection } from "./DocumentReferencePanel";
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
import { listInstitutionalTemplates, renderInstitutionalTemplate, type InstitutionalTemplate } from "./templateApi";

type FieldValue = string | string[];
type Draft = {
  version: 2;
  documentId?: string;
  serverVersion?: number;
  values: Record<string, FieldValue>;
  currentStep: number;
  artifact: WorkflowArtifact | null;
  templateId?: string;
  templateName?: string;
  fieldSources?: Record<string, "teacher" | "ai" | "reference">;
  reference?: DocumentReferenceSelection;
  updatedAt: string;
};

type SaveStatus = "idle" | "saving" | "saved" | "generating" | "error";

function displayValue(value: FieldValue | undefined) {
  return Array.isArray(value) ? value.join(", ") : String(value ?? "");
}

function requiredIsMissing(field: WorkflowField, value: FieldValue | undefined) {
  if (!field.required) return false;
  if (Array.isArray(value)) return !value.some((item) => item.trim());
  return !String(value ?? "").trim();
}

function resolvedFieldOptions(field: WorkflowField, values: Record<string, FieldValue>) {
  if (!field.dynamicOptions) return field.options ?? [];
  return getDynamicEducationOptions(field.dynamicOptions, displayValue(values[field.dependsOn ?? ""]));
}

function fieldError(field: WorkflowField, value: FieldValue | undefined, options: string[] = []) {
  if (requiredIsMissing(field, value)) return "Completa este campo para continuar.";
  if (field.type === "repeater" && field.minItems) {
    const completedItems = Array.isArray(value) ? value.filter((item) => item.trim()).length : 0;
    if (completedItems < field.minItems) return `Añade al menos ${field.minItems} ${field.minItems === 1 ? "elemento" : "elementos"}.`;
  }
  if (field.type === "select" && String(value ?? "").trim() && options.length && !options.includes(String(value))) {
    return "Selecciona una opción válida para el contexto elegido.";
  }
  if (field.type === "multiselect" && Array.isArray(value) && options.length && value.some((item) => !options.includes(item))) {
    return "Revisa las opciones: alguna ya no corresponde al contexto elegido.";
  }
  if (field.type === "number" && String(value ?? "").trim()) {
    const numericValue = Number(value);
    if (field.min !== undefined && numericValue < field.min) return `El valor mínimo es ${field.min}.`;
    if (field.max !== undefined && numericValue > field.max) return `El valor máximo es ${field.max}.`;
  }
  return "";
}

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

function readDraft(storageKey: string, legacyStorageKey: string, initialValues: Record<string, FieldValue>): Draft {
  const fallback: Draft = { version: 2, values: initialValues, currentStep: 0, artifact: null, updatedAt: "" };
  for (const key of [storageKey, legacyStorageKey]) {
    try {
      const saved = JSON.parse(localStorage.getItem(key) ?? "null") as Partial<Draft> | null;
      if (!saved) continue;
      const values = { ...initialValues, ...saved.values };
      const savedModality = values.modality;
      if (typeof savedModality === "string") {
        values.modality = workflowModalities.find((option) => option.startsWith(savedModality.slice(0, 3))) ?? savedModality;
      }
      return {
        ...fallback,
        ...saved,
        version: 2,
        values,
        currentStep: Number(saved.currentStep ?? 0),
        artifact: saved.artifact ?? null,
      };
    } catch {
      // Usa el siguiente borrador disponible o comienza con uno limpio.
    }
  }
  return fallback;
}

export function WorkflowTool() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const tool = getToolByPath(pathname);
  const workflow = getWorkflow(tool);
  const draftScope = sessionDraftScope();
  const storageKey = `avendia.draft.workflow.${workflow?.key ?? "unknown"}.v2.${draftScope}`;
  const legacyStorageKey = `avendia.workflow.${workflow?.key ?? "unknown"}.${draftScope}`;
  const [draft, setDraft] = useState<Draft>(() => workflow
    ? readDraft(storageKey, legacyStorageKey, getInitialWorkflowValues(workflow))
    : { version: 2, values: {}, currentStep: 0, artifact: null, updatedAt: "" });
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [message, setMessage] = useState("");
  const [showErrors, setShowErrors] = useState(false);
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
  const [lastAppliedGuide, setLastAppliedGuide] = useState<{ fieldId: string; previous: FieldValue } | null>(null);
  const [editingResult, setEditingResult] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<number | null>(null);
  const [exportingWord, setExportingWord] = useState(false);
  const [templates, setTemplates] = useState<InstitutionalTemplate[]>([]);
  const [rosterSelections, setRosterSelections] = useState<Record<string, StudentSelection | null>>({});
  const guideRequest = useRef<AbortController | null>(null);
  const documentIdFromUrl = searchParams.get("document");
  const selectedTemplate = templates.find((template) => template.id === draft.templateId);

  const currentStep = workflow?.steps[draft.currentStep];
  const allFields = workflow?.steps.flatMap((item) => item.fields) ?? [];
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
      const saved = { ...draft, version: 2 as const, updatedAt: new Date().toISOString() };
      localStorage.setItem(storageKey, JSON.stringify(saved));
    }, 450);
    return () => window.clearTimeout(timeout);
  }, [draft, storageKey, workflow]);

  useEffect(() => {
    if (!workflow || !documentIdFromUrl || draft.documentId === documentIdFromUrl) return;
    const token = sessionStorage.getItem("avendia.accessToken");
    if (!token) return;
    type StoredDocument = { id: string; metadata_json: Record<string, unknown> };
    void apiRequest<StoredDocument>(`/documents/${documentIdFromUrl}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((document) => {
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
        updatedAt: new Date().toISOString(),
      }));
      setMessage("Documento recuperado desde tu historial.");
    }).catch(() => setMessage("No se pudo recuperar este documento del historial."));
  }, [documentIdFromUrl, draft.documentId, workflow]);

  useEffect(() => {
    const token = sessionStorage.getItem("avendia.accessToken");
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
    const token = sessionStorage.getItem("avendia.accessToken");
    if (!token) return;
    type Preferences = { consent: boolean; assistance_mode: AssistanceMode };
    void apiRequest<Preferences>("/ai/tools/field-assist/preferences", { headers: { Authorization: `Bearer ${token}` } })
      .then((preferences) => {
        setRememberAssistance(preferences.consent);
        if (preferences.consent) setAssistanceMode(preferences.assistance_mode);
      }).catch(() => undefined);
  }, []);

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
    const saved: Draft = { ...nextDraft, version: 2, updatedAt: new Date().toISOString() };
    localStorage.setItem(storageKey, JSON.stringify(saved));
    setDraft(saved);
    return saved;
  };

  const saveDocument = async (nextDraft = draft) => {
    setStatus("saving");
    const saved = saveLocal(nextDraft);
    try {
      const token = sessionStorage.getItem("avendia.accessToken");
      if (token) {
        type StoredDocument = { id: string; metadata_json: Record<string, unknown> };
        const nextServerVersion = (saved.serverVersion ?? 0) + 1;
        const document = await apiRequest<StoredDocument>(saved.documentId ? `/documents/${saved.documentId}` : "/documents", {
          method: saved.documentId ? "PATCH" : "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            title: saved.artifact?.document_title ?? tool.title,
            document_type: workflow.key,
            content: saved.artifact ? artifactAsText(saved.artifact) : "Borrador en preparación",
            metadata: {
              version: nextServerVersion,
              fields: saved.values,
              artifact: saved.artifact,
              source_route: tool.path,
              current_step: saved.currentStep,
              template_id: saved.templateId,
              template_name: saved.templateName,
              reference: saved.reference,
              field_sources: saved.fieldSources,
              pedagogical_context: derivePedagogicalContext(saved.values),
            },
          }),
        });
        if (saved.reference) {
          await apiRequest("/documents/relations", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              parent_document_id: saved.reference.documentId,
              child_document_id: document.id,
              relation_type: "reference",
              inherited_fields: saved.reference.fields,
              context: derivePedagogicalContext(saved.values),
              compatibility_status: saved.reference.compatibilityStatus === "compatible" ? "compatible" : "review",
              consent: true,
            }),
          });
        }
        const synced = { ...saved, documentId: document.id, serverVersion: nextServerVersion, updatedAt: new Date().toISOString() };
        localStorage.setItem(storageKey, JSON.stringify(synced));
        setDraft(synced);
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

  const downloadWord = async () => {
    if (!draft.artifact) return;
    if (draft.artifact.quality_status === "blocked") {
      setStatus("error");
      setMessage("Este resultado tiene errores obligatorios. Regénéralo o corrígelo antes de exportar.");
      return;
    }
    setExportingWord(true);
    try {
      const persisted = await saveDocument(draft);
      if (!persisted) return;
      if (selectedTemplate) {
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
    if (fieldsToReview.length) {
      const field = allFields.find((candidate) => candidate.id === fieldsToReview[0]);
      setMessage("Revisa los campos afectados por el cambio de contexto antes de generar.");
      if (field) revealInvalidField(field);
      return;
    }
    const allMissing = allFields.filter((field) => fieldError(field, draft.values[field.id], resolvedFieldOptions(field, draft.values)));
    if (allMissing.length) {
      setMessage(`Faltan ${allMissing.length} campos obligatorios o válidos para generar un resultado confiable.`);
      revealInvalidField(allMissing[0]);
      return;
    }
    setStatus("generating");
    setMessage("");
    try {
      const token = sessionStorage.getItem("avendia.accessToken");
      const artifact = await apiRequest<WorkflowArtifact>("/ai/tools/workflow/generate", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: JSON.stringify({
          tool_id: tool.id,
          module: tool.module,
          tool_title: tool.title,
          artifact_type: workflow.artifactType,
          fields: Object.fromEntries(Object.entries(draft.values).map(([key, value]) => [key, displayValue(value)])),
          requested_sections: workflow.outputSections,
        }),
      });
      const generated: Draft = {
        ...draft,
        version: 2,
        artifact,
        currentStep: targetStep ?? draft.currentStep,
        updatedAt: new Date().toISOString(),
      };
      setDraft(generated);
      localStorage.setItem(storageKey, JSON.stringify(generated));
      setStatus("saved");
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
      const token = sessionStorage.getItem("avendia.accessToken");
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
      const requestSuggestion = () => apiRequest<{ reply: string }>("/ai/tools/field-assist", {
          method: "POST",
          signal: controller.signal,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: requestPayload,
      });
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
    const token = sessionStorage.getItem("avendia.accessToken");
    if (!token) return;
    void apiRequest("/ai/tools/field-assist/feedback", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ tool_id: tool.id, field_id: guideField.id, outcome, assistance_mode: assistanceMode, context_fingerprint: pedagogicalContext.fingerprint, edited: outcome === "edited" }),
    }).catch(() => undefined);
  };

  const changeAssistanceMode = (value: AssistanceMode) => {
    setAssistanceMode(value);
    if (!rememberAssistance) return;
    const token = sessionStorage.getItem("avendia.accessToken");
    if (!token) return;
    void apiRequest("/ai/tools/field-assist/preferences", { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ consent: true, assistance_mode: value, preferred_length: "balanced" }) }).catch(() => undefined);
  };

  const changeRememberAssistance = (value: boolean) => {
    setRememberAssistance(value);
    const token = sessionStorage.getItem("avendia.accessToken");
    if (!token) return;
    void apiRequest("/ai/tools/field-assist/preferences", { method: "PATCH", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ consent: value, assistance_mode: assistanceMode, preferred_length: "balanced" }) }).catch(() => undefined);
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
      const token = sessionStorage.getItem("avendia.accessToken");
      const response = await apiRequest<{ reply: string }>("/ai/tools/copilot", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: JSON.stringify({
          message: `Regenera únicamente la sección «${section.title}». Entrega texto listo para reemplazar la narrativa actual, sin encabezado ni explicaciones. Mantén coherencia con todos los datos del formulario.`,
          tool_title: tool.title,
          module: tool.module,
          form_values: Object.fromEntries(Object.entries(draft.values).map(([key, value]) => [key, displayValue(value)])),
        }),
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
      {field.required ? <b>Obligatorio</b> : <em>Opcional</em>}
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
    const error = showErrors ? fieldError(field, value, options) : "";
    const dependencyReady = !field.dependsOn || Boolean(displayValue(draft.values[field.dependsOn]).trim());
    const canGuide = field.guide !== false && (field.type === "textarea" || field.type === "text");
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
                <input value={item} placeholder={field.itemPlaceholder} aria-label={`${field.label} ${index + 1}`} aria-invalid={Boolean(error)} aria-describedby={describedBy} onChange={(event) => setValue(field.id, items.map((current, itemIndex) => itemIndex === index ? event.target.value : current))} />
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
                <input type="checkbox" checked={selected.includes(option)} aria-invalid={Boolean(error)} aria-describedby={describedBy} onChange={() => setValue(field.id, selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option])} />
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
              <button type="button" role="radio" aria-checked={value === option} aria-describedby={describedBy} className={value === option ? "is-selected" : ""} key={option} onClick={() => setValue(field.id, option)}>
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
                <input type="radio" name={field.id} value={option} checked={value === option} aria-invalid={Boolean(error)} aria-describedby={describedBy} onChange={() => setValue(field.id, option)} />
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
          <textarea rows={5} value={String(value)} placeholder={contextualPlaceholder(field, pedagogicalContext)} aria-invalid={Boolean(error)} aria-describedby={describedBy} onChange={(event) => setValue(field.id, event.target.value)} />
        ) : field.type === "select" ? (
          <select value={String(value)} disabled={!dependencyReady} aria-invalid={Boolean(error)} aria-describedby={describedBy} onChange={(event) => setValue(field.id, event.target.value)}>
            <option value="">{dependencyReady ? "Selecciona una opción" : field.disabledPlaceholder ?? "Completa primero el campo anterior"}</option>
            {options.map((option) => <option value={option} key={option}>{option}</option>)}
          </select>
        ) : (
          <input type={field.type} min={field.min} max={field.max} value={String(value)} placeholder={contextualPlaceholder(field, pedagogicalContext)} aria-invalid={Boolean(error)} aria-describedby={describedBy} onChange={(event) => setValue(field.id, event.target.value)} />
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
        return <section className="workflow-group" key={group.id}>
          <header><h3>{group.title}</h3>{group.description ? <p>{group.description}</p> : null}</header>
          <div className={`workflow-grid workflow-grid--${group.columns ?? currentStep.columns ?? 2}`}>{groupFields.map(renderField)}</div>
        </section>;
      })}
      {remainingFields.length ? <section className="workflow-group"><div className={`workflow-grid workflow-grid--${currentStep.columns ?? 2}`}>{remainingFields.map(renderField)}</div></section> : null}
    </div>;
  };

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
      {renderQualityPanel()}
      <StructuredArtifactPreview artifact={draft.artifact} artifactType={workflow.artifactType} toolId={tool.id} values={draft.values} workflowKey={workflow.key} onDownloadWord={downloadWord} editingResult={editingResult} onUpdateSection={updateArtifactSection} onUpdateTableCell={updateArtifactTableCell} onRegenerateSection={regenerateArtifactSection} regeneratingSection={regeneratingSection} />
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

  if (draft.artifact && !workflow.embeddedResult) {
    return (
      <main className="workflow-page"><div className="workflow-shell">
        <header className="workflow-header"><div><span>{tool.module} · resultado generado</span><h1>{draft.artifact.document_title}</h1><p>{draft.artifact.executive_summary}</p></div><button type="button" className="secondary-button" onClick={() => saveDocument()}><Save /> Guardar</button></header>
        <section className="workflow-result-actions"><button type="button" className="secondary-button" onClick={() => setDraft((current) => ({ ...current, artifact: null, currentStep: workflow.steps.length - 1 }))}><ChevronLeft /> Editar datos</button><button type="button" className="secondary-button" onClick={() => setEditingResult((current) => !current)}><Pencil /> {editingResult ? "Cerrar edición" : "Editar resultado"}</button><button type="button" className="secondary-button" onClick={() => generate()} disabled={status === "generating"}><RefreshCw /> Regenerar todo</button><button type="button" className="secondary-button" onClick={() => void copyArtifact()}><Clipboard /> {workflow.artifactType === "comunicacion" ? "Copiar correo" : "Copiar"}</button>{renderTemplateExport()}</section>
        {message ? <div className={`workflow-message ${status === "error" ? "workflow-message--error" : ""}`}>{message}</div> : null}
        {draft.artifact.activity?.items.length ? <InteractiveArtifact activity={draft.artifact.activity} toolId={tool.id} values={draft.values} /> : null}
        {renderQualityPanel()}
        <StructuredArtifactPreview artifact={draft.artifact} artifactType={workflow.artifactType} toolId={tool.id} values={draft.values} workflowKey={workflow.key} onDownloadWord={downloadWord} editingResult={editingResult} onUpdateSection={updateArtifactSection} onUpdateTableCell={updateArtifactTableCell} onRegenerateSection={regenerateArtifactSection} regeneratingSection={regeneratingSection} />
        <GenerationProgressOverlay open={status === "generating"} toolTitle={tool.title} family={tool.module} />
      </div></main>
    );
  }

  return (
    <main className="workflow-page"><div className="workflow-shell">
      <header className="workflow-header"><div><span>{tool.module} · complejidad {workflow.complexity}</span><h1>{tool.title}</h1><p>{tool.description}</p></div><div className="workflow-header__actions"><button type="button" className="secondary-button" onClick={() => saveDocument()} disabled={status === "saving"}>{status === "saving" ? <LoaderCircle className="is-spinning" /> : status === "saved" ? <Check /> : <Save />}{status === "saved" ? "Guardado" : "Guardar borrador"}</button></div></header>
      <DocumentReferencePanel targetType={workflow.key.split("/").at(-1) ?? tool.id} fields={allFields} selection={draft.reference} onImport={importReference} onClear={() => setDraft((current) => ({ ...current, reference: undefined }))} />
      <ol className="workflow-stepper" aria-label="Pasos de la herramienta">{workflow.steps.map((item, index) => <li className={index === draft.currentStep ? "is-active" : index < draft.currentStep ? "is-completed" : ""} key={item.id}><button type="button" aria-current={index === draft.currentStep ? "step" : undefined} onClick={() => setDraft((current) => ({ ...current, currentStep: index }))}><span>{index < draft.currentStep ? <Check /> : index + 1}</span><strong>{item.shortTitle}</strong></button></li>)}</ol>
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
      }}><div className="workflow-card__intro"><small>Paso {draft.currentStep + 1} de {workflow.steps.length}</small><h2>{currentStep.title}</h2><p>{currentStep.description}</p></div>
      <section className={`workflow-context-status is-${liveContextStatus.status}`} aria-live="polite">
        <span>{liveContextStatus.status === "coherent" ? <CheckCircle2 /> : <AlertTriangle />}</span>
        <div><strong>{liveContextStatus.label}</strong><small>{liveContextStatus.detail}</small>{pedagogicalContext.summary.length ? <p>{pedagogicalContext.summary.join(" · ")}</p> : null}</div>
        {fieldsToReview.length ? <button type="button" onClick={() => { const field = allFields.find((candidate) => candidate.id === fieldsToReview[0]); if (field) revealInvalidField(field); }}>Revisar ahora</button> : null}
      </section>
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
      <GenerationProgressOverlay open={status === "generating"} toolTitle={tool.title} family={tool.module} />
    </div></main>
  );
}

import {
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  FilePlus2,
  LoaderCircle,
  Save,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { StudentSelector, type StudentSelection } from "../../../components/students/StudentSelector";
import {
  areasByLevel,
  educationModalities,
  getEducationLevels,
  gradesByLevel,
  type EducationModality,
} from "../../../config/education";
import { ApiError } from "../../../lib/api";
import { readSessionUser, sessionDraftScope } from "../../../lib/session";
import { listStudents } from "../../rosters/rosterApi";
import type { Student } from "../../rosters/rosterTypes";
import { downloadChecklistWorkbook, getChecklistInstrument, saveChecklistInstrument } from "./checklistApi";
import { ChecklistCriteriaEditor } from "./ChecklistCriteriaEditor";
import { ChecklistCriteriaSuggestionDialog } from "./ChecklistCriteriaSuggestionDialog";
import { ChecklistMatrix } from "./ChecklistMatrix";
import { reconcileChecklistRecords } from "./checklistState";
import type {
  ChecklistCriterion,
  ChecklistDraft,
  ChecklistGeneralData,
  ChecklistInstrumentPayload,
  ChecklistResponseScale,
  EvaluationInstrumentDetail,
} from "./checklistTypes";
import "./checklist.css";

const STEPS = [
  { title: "Datos generales", short: "Datos" },
  { title: "Criterios de evaluación", short: "Criterios" },
  { title: "Registro por estudiante", short: "Registro" },
  { title: "Vista previa y descarga", short: "Vista previa" },
] as const;

const PERIODS = ["Diagnóstico", "I bimestre", "II bimestre", "III bimestre", "IV bimestre", "Trimestre", "Semestre", "Cierre anual"];

function newCriterion(index: number, description = ""): ChecklistCriterion {
  return { id: `criterion-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`, code: `C${index + 1}`, description };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeModality(value?: string): EducationModality {
  return educationModalities.find((modality) => value?.startsWith(modality.value))?.value ?? "EBR";
}

function initialDraft(): ChecklistDraft {
  const user = readSessionUser();
  const modality = normalizeModality(user.education_modality);
  const levels = getEducationLevels(modality);
  const level = levels.includes(user.education_level as never) ? String(user.education_level) : "";
  const grade = gradesByLevel[level]?.includes(user.grade ?? "") ? String(user.grade) : "";
  const area = areasByLevel[level]?.includes(user.curricular_area ?? "") ? String(user.curricular_area) : "";
  return {
    version: 1,
    general: {
      teacherName: user.full_name ?? "",
      directorName: user.director_name ?? "",
      institution: user.school_name ?? "",
      modality,
      level,
      grade,
      area,
      activity: "",
      date: today(),
      period: "",
    },
    selection: null,
    responseScale: "yes_no",
    criteria: [
      newCriterion(0, "Identifica la información relevante para resolver la actividad."),
      newCriterion(1, "Aplica una estrategia pertinente y explica el procedimiento seguido."),
      newCriterion(2, "Comunica su respuesta con claridad usando vocabulario del área."),
    ],
    records: [],
    generalObservation: "",
    currentStep: 0,
    updatedAt: "",
  };
}

function readDraft(storageKey: string): ChecklistDraft {
  const fallback = initialDraft();
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as Partial<ChecklistDraft> | null;
    if (!saved || saved.version !== 1) return fallback;
    return {
      ...fallback,
      ...saved,
      general: { ...fallback.general, ...saved.general },
      criteria: saved.criteria?.length ? saved.criteria : fallback.criteria,
      records: saved.records ?? [],
      selection: saved.selection ?? null,
      currentStep: Math.min(3, Math.max(0, Number(saved.currentStep ?? 0))),
    };
  } catch {
    return fallback;
  }
}

function generalErrors(general: ChecklistGeneralData, selection: StudentSelection | null) {
  const labels: Array<[keyof ChecklistGeneralData, string]> = [
    ["teacherName", "Nombre del docente"],
    ["institution", "Institución educativa"],
    ["modality", "Modalidad educativa"],
    ["level", "Nivel educativo"],
    ["grade", "Grado o ciclo"],
    ["area", "Área curricular"],
    ["activity", "Actividad o evidencia"],
    ["date", "Fecha"],
    ["period", "Periodo"],
  ];
  const errors = labels.filter(([key]) => !String(general[key] ?? "").trim()).map(([key, label]) => ({ id: String(key), label }));
  if (!selection?.rosterId || selection.studentIds.length === 0) errors.push({ id: "students", label: "Estudiantes" });
  return errors;
}

function payloadFromDraft(draft: ChecklistDraft, students: Student[]): ChecklistInstrumentPayload {
  const records = reconcileChecklistRecords(students, draft.criteria, draft.records);
  return {
    kind: "checklist",
    status: draft.currentStep === 3 ? "generated" : "draft",
    title: `Lista de cotejo · ${draft.general.activity || draft.general.area || "Borrador"}`,
    roster_id: draft.selection?.rosterId,
    general_data: {
      teacher_name: draft.general.teacherName,
      director_name: draft.general.directorName,
      institution_name: draft.general.institution,
      modality: draft.general.modality,
      education_level: draft.general.level,
      grade: draft.general.grade,
      curricular_area: draft.general.area,
      activity: draft.general.activity,
      date: draft.general.date,
      period: draft.general.period,
    },
    settings: { response_scale: draft.responseScale },
    general_observation: draft.generalObservation || null,
    participants: students.map((student, index) => ({
      student_id: student.id,
      role: "student",
      sort_order: index,
      individual_notes: records.find((record) => record.studentId === student.id)?.observation || null,
    })),
    criteria: draft.criteria.map((criterion, index) => ({
      client_key: criterion.id,
      code: criterion.code,
      title: criterion.description,
      description: criterion.description,
      sort_order: index,
    })),
    records: records.flatMap((record) => draft.criteria.map((criterion) => ({
      student_id: record.studentId,
      criterion_key: criterion.id,
      value: record.responses[criterion.id] || null,
      observation: record.observation || null,
    }))),
  };
}

function generalDataText(data: Record<string, unknown>, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = data[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value);
  }
  return fallback;
}

function checklistDraftFromInstrument(instrument: EvaluationInstrumentDetail): ChecklistDraft {
  if (instrument.kind && instrument.kind !== "checklist") throw new Error("El documento seleccionado no es una lista de cotejo.");
  const fallback = initialDraft();
  const data = instrument.general_data ?? {};
  const settings = instrument.settings ?? {};
  const participants = [...(instrument.participants ?? [])].sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0));
  const criteria = [...(instrument.criteria ?? [])]
    .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
    .map((criterion) => ({
      id: criterion.client_key,
      code: criterion.code,
      description: criterion.description?.trim() || criterion.title,
    }));
  const responseScale: ChecklistResponseScale = settings.response_scale === "yes_no_progress" ? "yes_no_progress" : "yes_no";
  const responseValues = new Set(["yes", "no", "in_progress"]);
  const records = participants.map((participant) => {
    const participantRecords = (instrument.records ?? []).filter((record) => record.student_id === participant.student_id);
    return {
      studentId: participant.student_id,
      responses: Object.fromEntries(participantRecords.map((record) => [
        record.criterion_key,
        responseValues.has(record.value ?? "") ? record.value : "",
      ])) as ChecklistDraft["records"][number]["responses"],
      observation: participant.individual_notes?.trim() || participantRecords.find((record) => record.observation?.trim())?.observation || "",
    };
  });
  return {
    ...fallback,
    general: {
      ...fallback.general,
      teacherName: generalDataText(data, ["teacher_name", "teacherName"], fallback.general.teacherName),
      directorName: generalDataText(data, ["director_name", "directorName"], fallback.general.directorName),
      institution: generalDataText(data, ["institution_name", "institutionName", "institution"], fallback.general.institution),
      modality: normalizeModality(generalDataText(data, ["modality"], fallback.general.modality)),
      level: generalDataText(data, ["education_level", "educationLevel", "level"]),
      grade: generalDataText(data, ["grade"]),
      area: generalDataText(data, ["curricular_area", "curricularArea", "area"]),
      activity: generalDataText(data, ["activity"]),
      date: generalDataText(data, ["date"], fallback.general.date),
      period: generalDataText(data, ["period"]),
    },
    selection: instrument.roster_id ? {
      mode: "multiple",
      rosterId: instrument.roster_id,
      studentIds: participants.map((participant) => participant.student_id),
    } : null,
    responseScale,
    criteria: criteria.length ? criteria : fallback.criteria,
    records,
    generalObservation: instrument.general_observation ?? "",
    currentStep: instrument.status === "generated" ? 3 : 0,
    updatedAt: instrument.updated_at ?? "",
  };
}

export type ChecklistToolProps = {
  instrumentId?: string;
  onInstrumentIdChange?: (instrumentId: string) => void;
};

export function ChecklistTool({ instrumentId, onInstrumentIdChange }: ChecklistToolProps = {}) {
  const storageKey = `avendia.evaluations.checklist.v1.${sessionDraftScope()}`;
  const [draft, setDraft] = useState<ChecklistDraft>(() => readDraft(storageKey));
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(() => Boolean(draft.selection?.rosterId));
  const [studentsError, setStudentsError] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "exporting" | "error">("idle");
  const [resolvedInstrumentId, setResolvedInstrumentId] = useState<string>();
  const [criteriaDialogOpen, setCriteriaDialogOpen] = useState(false);
  const [serverInstrument, setServerInstrument] = useState<EvaluationInstrumentDetail | null>(null);
  const instrumentLoading = Boolean(instrumentId && resolvedInstrumentId !== instrumentId);

  const modalityLevels = useMemo(() => [...getEducationLevels(draft.general.modality)], [draft.general.modality]);
  const grades = gradesByLevel[draft.general.level] ?? [];
  const areas = areasByLevel[draft.general.level] ?? [];
  const selectedStudents = useMemo(() => {
    const byId = new Map(students.map((student) => [student.id, student]));
    return (draft.selection?.studentIds ?? []).map((id) => byId.get(id)).filter((student): student is Student => Boolean(student));
  }, [draft.selection?.studentIds, students]);
  const stepErrors = useMemo(() => {
    if (draft.currentStep === 0) return generalErrors(draft.general, draft.selection);
    if (draft.currentStep === 1) return draft.criteria.filter((criterion) => !criterion.description.trim()).map((criterion) => ({ id: criterion.id, label: criterion.code }));
    if (draft.currentStep === 2) {
      const rows = reconcileChecklistRecords(selectedStudents, draft.criteria, draft.records);
      const missing = rows.some((record) => draft.criteria.some((criterion) => !record.responses[criterion.id]));
      return missing ? [{ id: "matrix", label: "Marcas de la matriz" }] : [];
    }
    return [];
  }, [draft, selectedStudents]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }));
  }, [draft, storageKey]);

  useEffect(() => {
    if (!instrumentId) return;
    const controller = new AbortController();
    void getChecklistInstrument(instrumentId, controller.signal)
      .then((instrument) => {
        setDraft(checklistDraftFromInstrument(instrument));
        setServerInstrument(instrument);
        setStatus("idle");
        setMessage(instrument.status === "archived" ? "Esta lista está archivada. Restáurala desde Historial para volver a editarla." : "");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "No pudimos abrir esta lista de cotejo.");
      })
      .finally(() => { if (!controller.signal.aborted) setResolvedInstrumentId(instrumentId); });
    return () => controller.abort();
  }, [instrumentId]);

  useEffect(() => {
    const rosterId = draft.selection?.rosterId;
    if (!rosterId) return;
    const controller = new AbortController();
    void listStudents(rosterId, { signal: controller.signal })
      .then(setStudents)
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStudentsError(error instanceof Error ? error.message : "No pudimos leer los estudiantes seleccionados.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setStudentsLoading(false);
      });
    return () => controller.abort();
  }, [draft.selection?.rosterId]);

  function updateGeneral<Key extends keyof ChecklistGeneralData>(key: Key, value: ChecklistGeneralData[Key]) {
    setDraft((current) => {
      const general = { ...current.general, [key]: value };
      if (key === "modality") {
        general.level = "";
        general.grade = "";
        general.area = "";
      }
      if (key === "level") {
        general.grade = "";
        general.area = "";
      }
      return { ...current, general };
    });
    setShowErrors(false);
  }

  function updateSelection(selection: StudentSelection | null) {
    setStudents([]);
    setStudentsError("");
    setStudentsLoading(Boolean(selection?.rosterId));
    setDraft((current) => ({ ...current, selection, records: selection ? current.records.filter((record) => selection.studentIds.includes(record.studentId)) : [] }));
    setShowErrors(false);
  }

  function updateScale(responseScale: ChecklistResponseScale) {
    setDraft((current) => ({
      ...current,
      responseScale,
      records: current.records.map((record) => ({
        ...record,
        responses: Object.fromEntries(Object.entries(record.responses).map(([key, value]) => [key, responseScale === "yes_no" && value === "in_progress" ? "" : value])),
      })),
    }));
  }

  function focusError(id: string) {
    const field = document.querySelector<HTMLElement>(`[data-checklist-field="${id}"]`);
    field?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    (field?.querySelector<HTMLElement>("input, select, textarea, button") ?? field)?.focus({ preventScroll: true });
  }

  function next() {
    if (stepErrors.length) {
      setShowErrors(true);
      window.setTimeout(() => focusError(stepErrors[0].id), 0);
      return;
    }
    setShowErrors(false);
    setDraft((current) => ({ ...current, currentStep: Math.min(3, current.currentStep + 1) }));
  }

  async function persistDraft(options: { forExport?: boolean } = {}) {
    setStatus(options.forExport ? "exporting" : "saving");
    setMessage("");
    try {
      const saved = await saveChecklistInstrument(payloadFromDraft(draft, selectedStudents), serverInstrument);
      setServerInstrument(saved);
      if (saved.id !== instrumentId) onInstrumentIdChange?.(saved.id);
      if (!options.forExport) {
        setStatus("saved");
        setMessage("Borrador guardado. Puedes continuar editándolo sin perder tus marcas.");
      }
      return saved;
    } catch (error) {
      setStatus("error");
      if (error instanceof ApiError && error.status === 409) {
        setMessage("Este borrador cambió en otra sesión. No se descargó una versión desactualizada; recarga la herramienta y revisa los cambios antes de intentarlo nuevamente.");
      } else {
        setMessage(error instanceof Error ? error.message : "No pudimos guardar el borrador.");
      }
      return null;
    }
  }

  function startNewInstrument() {
    setDraft(initialDraft());
    setServerInstrument(null);
    setStatus("idle");
    setMessage("Nueva lista preparada. El documento anterior permanece guardado en Historial.");
    onInstrumentIdChange?.("");
  }

  async function exportWorkbook() {
    // Export only after the exact state visible in the matrix has been saved.
    // The returned revision is the one used for the subsequent download.
    const instrument = await persistDraft({ forExport: true });
    if (!instrument) return;
    try {
      await downloadChecklistWorkbook(instrument.id);
      setStatus("saved");
      setMessage("Archivo XLSX preparado con la matriz y la hoja de criterios.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No pudimos preparar el archivo XLSX.");
    }
  }

  function renderGeneral() {
    return (
      <div className="evaluation-form-grid">
        <label data-checklist-field="teacherName"><span>Nombre del docente</span><input value={draft.general.teacherName} onChange={(event) => updateGeneral("teacherName", event.target.value)} placeholder="Ej. Prof. María Gómez" /></label>
        <label><span>Director(a) <em>Opcional</em></span><input value={draft.general.directorName} onChange={(event) => updateGeneral("directorName", event.target.value)} placeholder="Ej. Lic. Carlos Rojas" /></label>
        <label data-checklist-field="institution"><span>Institución educativa</span><input value={draft.general.institution} onChange={(event) => updateGeneral("institution", event.target.value)} placeholder="Ej. I.E. N.° 5143 República del Perú" /></label>
        <label data-checklist-field="modality"><span>Modalidad educativa</span><select value={draft.general.modality} onChange={(event) => updateGeneral("modality", event.target.value as EducationModality)}>{educationModalities.map((modality) => <option value={modality.value} key={modality.value}>{modality.label}</option>)}</select></label>
        <label data-checklist-field="level"><span>Nivel educativo</span><select value={draft.general.level} onChange={(event) => updateGeneral("level", event.target.value)}><option value="">Selecciona el nivel</option>{modalityLevels.map((level) => <option key={level}>{level}</option>)}</select></label>
        <label data-checklist-field="grade"><span>Grado o ciclo</span><select value={draft.general.grade} onChange={(event) => updateGeneral("grade", event.target.value)} disabled={!draft.general.level}><option value="">{draft.general.level ? "Selecciona el grado" : "Primero selecciona el nivel"}</option>{grades.map((grade) => <option key={grade}>{grade}</option>)}</select></label>
        <label data-checklist-field="area"><span>Área curricular</span><select value={draft.general.area} onChange={(event) => updateGeneral("area", event.target.value)} disabled={!draft.general.level}><option value="">{draft.general.level ? "Selecciona el área" : "Primero selecciona el nivel"}</option>{areas.map((area) => <option key={area}>{area}</option>)}</select></label>
        <label data-checklist-field="period"><span>Periodo</span><select value={draft.general.period} onChange={(event) => updateGeneral("period", event.target.value)}><option value="">Selecciona el periodo</option>{PERIODS.map((period) => <option key={period}>{period}</option>)}</select></label>
        <label className="evaluation-field--wide" data-checklist-field="activity"><span>Actividad o evidencia evaluada</span><textarea rows={2} value={draft.general.activity} onChange={(event) => updateGeneral("activity", event.target.value)} placeholder="Ej. Explicación de una estrategia para resolver problemas de cantidad." /></label>
        <label data-checklist-field="date"><span>Fecha de aplicación</span><input type="date" value={draft.general.date} onChange={(event) => updateGeneral("date", event.target.value)} /></label>
        <fieldset className="evaluation-choice" data-checklist-field="scale">
          <legend>Opciones de respuesta</legend>
          <label><input type="radio" checked={draft.responseScale === "yes_no"} onChange={() => updateScale("yes_no")} /><span>Sí / No</span></label>
          <label><input type="radio" checked={draft.responseScale === "yes_no_progress"} onChange={() => updateScale("yes_no_progress")} /><span>Sí / No / En proceso</span></label>
        </fieldset>
        <div className="evaluation-field--wide" data-checklist-field="students">
          <StudentSelector
            mode="multiple"
            value={draft.selection}
            onChange={updateSelection}
            label="Estudiantes que se evaluarán"
            description="Selecciona el aula y las filas que aparecerán en la lista de cotejo."
            required
            manageStudentsHref="/dashboard/mis-estudiantes"
          />
        </div>
      </div>
    );
  }

  function renderStep() {
    if (draft.currentStep === 0) return renderGeneral();
    if (draft.currentStep === 1) return <div data-checklist-field={stepErrors[0]?.id}><ChecklistCriteriaEditor criteria={draft.criteria} onChange={(criteria) => setDraft((current) => ({ ...current, criteria }))} onSuggest={() => setCriteriaDialogOpen(true)} /></div>;
    if (draft.currentStep === 2) return (
      <div className="evaluation-register" data-checklist-field="matrix">
        <div className="evaluation-register__summary"><strong>{selectedStudents.length} estudiantes · {draft.criteria.length} criterios</strong><span>{studentsLoading ? "Cargando nómina…" : "Marca cada celda y agrega observaciones cuando aporten evidencia."}</span></div>
        {studentsError ? <div className="evaluation-message evaluation-message--error" role="alert">{studentsError}</div> : null}
        <ChecklistMatrix students={selectedStudents} criteria={draft.criteria} records={draft.records} responseScale={draft.responseScale} onChange={(records) => setDraft((current) => ({ ...current, records }))} />
        <label className="evaluation-long-field"><span>Observación general <em>Opcional</em></span><textarea rows={4} value={draft.generalObservation} onChange={(event) => setDraft((current) => ({ ...current, generalObservation: event.target.value }))} placeholder="Ej. El grupo comprende el propósito; conviene reforzar la explicación de estrategias con ejemplos concretos." /></label>
      </div>
    );
    return (
      <div className="checklist-preview">
        <header><span>Lista de cotejo</span><h3>{draft.general.activity}</h3><p>{draft.general.institution} · {draft.general.grade} · {draft.general.area}</p></header>
        <dl><div><dt>Docente</dt><dd>{draft.general.teacherName}</dd></div><div><dt>Fecha</dt><dd>{draft.general.date}</dd></div><div><dt>Periodo</dt><dd>{draft.general.period}</dd></div><div><dt>Escala</dt><dd>{draft.responseScale === "yes_no" ? "Sí / No" : "Sí / No / En proceso"}</dd></div></dl>
        <ChecklistMatrix students={selectedStudents} criteria={draft.criteria} records={draft.records} responseScale={draft.responseScale} onChange={() => undefined} readonly />
        {draft.generalObservation ? <aside><strong>Observación general</strong><p>{draft.generalObservation}</p></aside> : null}
        <section className="checklist-preview__criteria"><h4>Definición de criterios</h4><ol>{draft.criteria.map((criterion) => <li key={criterion.id}><strong>{criterion.code}</strong><span>{criterion.description}</span></li>)}</ol></section>
      </div>
    );
  }

  return (
    <main className="evaluation-tool checklist-tool">
      <div className="evaluation-shell">
        <header className="evaluation-header">
          <div><span>Evaluamos · instrumento aplicable</span><h1>Lista de cotejo</h1><p>Registra criterios observables por estudiante y descarga una matriz lista para trabajar.</p></div>
          <div className="evaluation-header__actions">
            {serverInstrument || instrumentId ? <button type="button" className="evaluation-secondary" onClick={startNewInstrument}><FilePlus2 /> Nueva lista</button> : null}
            <button type="button" className="evaluation-secondary" onClick={() => void persistDraft()} disabled={instrumentLoading || (Boolean(instrumentId) && !serverInstrument) || serverInstrument?.status === "archived" || status === "saving" || status === "exporting"}>{instrumentLoading ? <LoaderCircle className="is-spinning" /> : status === "saving" ? <LoaderCircle className="is-spinning" /> : status === "saved" ? <Check /> : <Save />}{instrumentLoading ? "Abriendo…" : status === "saving" ? "Guardando…" : status === "saved" ? "Guardado" : "Guardar borrador"}</button>
          </div>
        </header>

        <ol className="evaluation-stepper" aria-label="Pasos de la lista de cotejo">
          {STEPS.map((step, index) => <li className={index === draft.currentStep ? "is-active" : index < draft.currentStep ? "is-completed" : ""} key={step.short}><button type="button" disabled={index > draft.currentStep} aria-current={index === draft.currentStep ? "step" : undefined} onClick={() => setDraft((current) => ({ ...current, currentStep: index }))}><span>{index < draft.currentStep ? <Check /> : index + 1}</span><strong>{step.short}</strong></button></li>)}
        </ol>

        <section className="evaluation-card">
          <div className="evaluation-card__intro"><small>Paso {draft.currentStep + 1} de {STEPS.length}</small><h2>{STEPS[draft.currentStep].title}</h2><p>{draft.currentStep === 0 ? "Completa el contexto y selecciona estudiantes de tu nómina central." : draft.currentStep === 1 ? "Define qué evidencias observarás; puedes añadir y reordenar criterios." : draft.currentStep === 2 ? "Registra Sí, No o En proceso y escribe observaciones concretas." : "Revisa el instrumento antes de guardar o descargar el XLSX."}</p></div>
          {showErrors && stepErrors.length ? <div className="evaluation-validation" role="alert"><AlertTriangle aria-hidden="true" /><div><h3>{stepErrors.length === 1 ? "Falta completar 1 elemento" : `Faltan completar ${stepErrors.length} elementos`}</h3><ul>{stepErrors.map((error) => <li key={error.id}><button type="button" onClick={() => focusError(error.id)}>{error.label}</button></li>)}</ul></div></div> : null}
          {renderStep()}
          {message ? <div className={`evaluation-message${status === "error" ? " evaluation-message--error" : ""}`} role={status === "error" ? "alert" : "status"}>{message}</div> : null}
          <footer className="evaluation-actions">
            <button type="button" className="evaluation-secondary" onClick={() => setDraft((current) => ({ ...current, currentStep: Math.max(0, current.currentStep - 1) }))} disabled={draft.currentStep === 0}><ChevronLeft /> Anterior</button>
            {draft.currentStep < 3 ? <button type="button" className="evaluation-primary" onClick={next}>Siguiente <ChevronRight /></button> : <button type="button" className="evaluation-primary" onClick={() => void exportWorkbook()} disabled={instrumentLoading || (Boolean(instrumentId) && !serverInstrument) || serverInstrument?.status === "archived" || status === "saving" || status === "exporting"}>{status === "exporting" ? <LoaderCircle className="is-spinning" /> : <Download />}{status === "exporting" ? "Preparando XLSX…" : "Descargar XLSX"}</button>}
          </footer>
        </section>
        {criteriaDialogOpen ? <ChecklistCriteriaSuggestionDialog
          context={{
            activity: draft.general.activity,
            modality: draft.general.modality,
            level: draft.general.level,
            grade: draft.general.grade,
            area: draft.general.area,
          }}
          onApply={(suggestions) => {
            setDraft((current) => {
              const available = Math.max(0, 12 - current.criteria.length);
              const added = suggestions.slice(0, available).map((description, index) => newCriterion(current.criteria.length + index, description));
              return { ...current, criteria: [...current.criteria, ...added] };
            });
            setCriteriaDialogOpen(false);
          }}
          onClose={() => setCriteriaDialogOpen(false)}
        /> : null}
      </div>
    </main>
  );
}

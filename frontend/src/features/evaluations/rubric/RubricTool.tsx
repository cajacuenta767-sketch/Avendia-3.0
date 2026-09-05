import { AlertTriangle, Check, ChevronLeft, ChevronRight, Download, FilePlus2, LoaderCircle, Printer, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { StudentSelector, type StudentSelection } from "../../../components/students/StudentSelector";
import {
  areasByLevel,
  competenciesByArea,
  educationModalities,
  getEducationLevels,
  gradesByLevel,
  type EducationModality,
} from "../../../config/education";
import { readSessionUser, sessionDraftScope } from "../../../lib/session";
import { ApiError } from "../../../lib/api";
import { listStudents } from "../../rosters/rosterApi";
import type { Student } from "../../rosters/rosterTypes";
import { RubricAssessment } from "./RubricAssessment";
import { exportRubricDocx } from "./exportRubricDocx";
import { reconcileRubricAssessments } from "./rubricState";
import { getRubricInstrument, saveRubricInstrument, type RubricFeedbackPrompt } from "./rubricApi";
import { RubricBuilder } from "./RubricBuilder";
import { RubricFeedbackDialog } from "./RubricFeedbackDialog";
import type {
  RubricCriterion,
  RubricCriterionRating,
  RubricDraft,
  RubricGeneralData,
  RubricInstrumentDetail,
  RubricInstrumentPayload,
  RubricLevel,
  RubricType,
} from "./rubricTypes";
import "../checklist/checklist.css";
import "./rubric.css";

export type RubricToolProps = {
  variant?: "builder" | "grader";
  instrumentId?: string;
  onInstrumentIdChange?: (instrumentId: string) => void;
};

const STEPS = [
  { title: "Datos y estudiantes", short: "Datos" },
  { title: "Diseño de la rúbrica", short: "Diseño" },
  { title: "Calificación y feedback", short: "Calificación" },
  { title: "Vista previa", short: "Vista previa" },
] as const;

function uid(prefix: string, index: number) {
  return `${prefix}-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`;
}

function normalizeModality(value?: string): EducationModality {
  return educationModalities.find((modality) => value?.startsWith(modality.value))?.value ?? "EBR";
}

function buildInitialLevels(): RubricLevel[] {
  return [
    { id: uid("level", 0), code: "AD", label: "Logro destacado", score: 4 },
    { id: uid("level", 1), code: "A", label: "Logro esperado", score: 3 },
    { id: uid("level", 2), code: "B", label: "En proceso", score: 2 },
    { id: uid("level", 3), code: "C", label: "En inicio", score: 1 },
  ];
}

function descriptorExamples(levels: RubricLevel[], examples: string[]) {
  return Object.fromEntries(levels.map((level, index) => [level.id, examples[index] ?? ""]));
}

function initialDraft(): RubricDraft {
  const user = readSessionUser();
  const modality = normalizeModality(user.education_modality);
  const level = getEducationLevels(modality).some((option) => option === user.education_level) ? String(user.education_level) : "";
  const grade = gradesByLevel[level]?.includes(user.grade ?? "") ? String(user.grade) : "";
  const area = areasByLevel[level]?.includes(user.curricular_area ?? "") ? String(user.curricular_area) : "";
  const levels = buildInitialLevels();
  const examples = [
    ["Sustenta con varias evidencias pertinentes y explica sus relaciones.", "Sustenta con una evidencia pertinente y una explicación clara.", "Usa evidencia parcial; la explicación necesita conexiones más precisas.", "Menciona datos sin explicar cómo sustentan la respuesta."],
    ["Organiza una estrategia eficiente, la verifica y propone una alternativa.", "Aplica una estrategia pertinente y verifica el resultado.", "Aplica parcialmente la estrategia con apoyo.", "Requiere guía para elegir y aplicar una estrategia."],
    ["Comunica con precisión, integra vocabulario del área y responde preguntas.", "Comunica el procedimiento con orden y vocabulario adecuado.", "Comunica ideas principales con algunas omisiones.", "La explicación es fragmentada y necesita una secuencia guiada."],
  ];
  const criteria: RubricCriterion[] = ["Uso de evidencias", "Estrategia y procedimiento", "Comunicación del aprendizaje"].map((title, index) => ({
    id: uid("criterion", index),
    code: `C${index + 1}`,
    title,
    description: index === 0 ? "Selecciona y relaciona evidencias para sustentar una conclusión." : index === 1 ? "Elige, aplica y verifica una estrategia pertinente." : "Explica el proceso y la conclusión con claridad.",
    weight: null,
    descriptors: descriptorExamples(levels, examples[index]),
  }));
  return {
    version: 1,
    rubricType: "analytic",
    weighted: false,
    general: {
      teacherName: user.full_name ?? "",
      institution: user.school_name ?? "",
      modality,
      level,
      grade,
      area,
      competence: "",
      performance: "",
      context: "",
      evidenceTitle: "",
      date: new Date().toISOString().slice(0, 10),
    },
    selection: null,
    criteria,
    levels,
    assessments: [],
    currentStep: 0,
    activeStudentId: "",
    updatedAt: "",
  };
}

function readDraft(storageKey: string): RubricDraft {
  const fallback = initialDraft();
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as Partial<RubricDraft> | null;
    if (!saved || saved.version !== 1) return fallback;
    return {
      ...fallback,
      ...saved,
      general: { ...fallback.general, ...saved.general },
      levels: saved.levels?.length ? saved.levels : fallback.levels,
      criteria: saved.criteria?.length ? saved.criteria : fallback.criteria,
      assessments: saved.assessments ?? [],
      selection: saved.selection ?? null,
      currentStep: Math.min(3, Math.max(0, Number(saved.currentStep ?? 0))),
    };
  } catch {
    return fallback;
  }
}

function payloadFromDraft(draft: RubricDraft, students: Student[]): RubricInstrumentPayload {
  const assessments = reconcileRubricAssessments(students, draft.criteria, draft.assessments);
  return {
    kind: "rubric",
    status: draft.currentStep === 3 ? "generated" : "draft",
    title: `Rúbrica · ${draft.general.evidenceTitle || draft.general.competence || "Borrador"}`,
    roster_id: draft.selection?.rosterId,
    general_data: { ...draft.general },
    settings: { rubric_type: draft.rubricType, weighted: draft.weighted },
    participants: students.map((student, index) => ({ student_id: student.id, role: "student", sort_order: index })),
    criteria: draft.criteria.map((criterion, criterionIndex) => ({
      client_key: criterion.id,
      code: criterion.code,
      title: criterion.title,
      description: criterion.description || null,
      weight: draft.weighted ? criterion.weight : null,
      sort_order: criterionIndex,
      levels: draft.levels.map((level, levelIndex) => ({
        client_key: level.id,
        code: level.code,
        label: level.label,
        description: criterion.descriptors[level.id] || null,
        score: level.score,
        sort_order: levelIndex,
      })),
    })),
    records: assessments.flatMap((assessment) => draft.criteria.map((criterion) => {
      const rating = assessment.ratings[criterion.id];
      return {
        student_id: assessment.studentId,
        criterion_key: criterion.id,
        level_key: rating.levelId || null,
        evidence: assessment.evidence || null,
        strength: rating.strength || null,
        improvement: rating.improvement || null,
        recommendation: rating.recommendation || null,
        teacher_decision: assessment.teacherDecision || null,
      };
    })),
  };
}

function rubricDraftFromInstrument(instrument: RubricInstrumentDetail): RubricDraft {
  if (instrument.kind && instrument.kind !== "rubric") throw new Error("El documento seleccionado no es una rúbrica.");
  const fallback = initialDraft();
  const data = instrument.general_data ?? {};
  const settings = instrument.settings ?? {};
  const participants = [...(instrument.participants ?? [])].sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0));
  const serverCriteria = [...(instrument.criteria ?? [])].sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0));
  const firstLevels = [...(serverCriteria[0]?.levels ?? [])].sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0));
  const levels: RubricLevel[] = firstLevels.length ? firstLevels.map((level, index) => ({
    id: level.client_key,
    code: level.code,
    label: level.label,
    score: typeof level.score === "number" ? level.score : Math.max(1, firstLevels.length - index),
  })) : fallback.levels;
  const criteria: RubricCriterion[] = serverCriteria.length ? serverCriteria.map((criterion) => ({
    id: criterion.client_key,
    code: criterion.code,
    title: criterion.title,
    description: criterion.description ?? "",
    weight: typeof criterion.weight === "number" ? criterion.weight : null,
    descriptors: Object.fromEntries((criterion.levels ?? []).map((level) => [level.client_key, level.description ?? ""])),
  })) : fallback.criteria;
  const assessments = participants.map((participant) => {
    const participantRecords = (instrument.records ?? []).filter((record) => record.student_id === participant.student_id);
    return {
      studentId: participant.student_id,
      evidence: participantRecords.find((record) => record.evidence?.trim())?.evidence ?? "",
      ratings: Object.fromEntries(criteria.map((criterion) => {
        const record = participantRecords.find((item) => item.criterion_key === criterion.id);
        return [criterion.id, {
          levelId: record?.level_key ?? "",
          strength: record?.strength ?? "",
          improvement: record?.improvement ?? "",
          recommendation: record?.recommendation ?? "",
        }];
      })),
      teacherDecision: participantRecords.find((record) => record.teacher_decision?.trim())?.teacher_decision ?? "",
    };
  });
  const selectedStudentIds = participants.map((participant) => participant.student_id);
  return {
    ...fallback,
    rubricType: settings.rubric_type === "holistic" ? "holistic" : "analytic",
    weighted: settings.weighted === true,
    general: {
      ...fallback.general,
      teacherName: String(data.teacherName ?? fallback.general.teacherName),
      institution: String(data.institution ?? fallback.general.institution),
      modality: normalizeModality(String(data.modality ?? fallback.general.modality)),
      level: String(data.level ?? ""),
      grade: String(data.grade ?? ""),
      area: String(data.area ?? ""),
      competence: String(data.competence ?? ""),
      performance: String(data.performance ?? ""),
      context: String(data.context ?? ""),
      evidenceTitle: String(data.evidenceTitle ?? ""),
      date: String(data.date ?? fallback.general.date),
    },
    selection: instrument.roster_id ? {
      mode: "multiple",
      rosterId: instrument.roster_id,
      studentIds: selectedStudentIds,
    } : null,
    criteria,
    levels,
    assessments,
    currentStep: instrument.status === "generated" ? 3 : 0,
    activeStudentId: selectedStudentIds[0] ?? "",
    updatedAt: instrument.updated_at ?? "",
  };
}

export function RubricTool({ variant = "builder", instrumentId, onInstrumentIdChange }: RubricToolProps) {
  const storageKey = `avendia.evaluations.rubric.v1.${sessionDraftScope()}`;
  const [draft, setDraft] = useState<RubricDraft>(() => readDraft(storageKey));
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(() => Boolean(draft.selection?.rosterId));
  const [studentsError, setStudentsError] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [resolvedInstrumentId, setResolvedInstrumentId] = useState<string>();
  const [message, setMessage] = useState("");
  const [feedbackTarget, setFeedbackTarget] = useState<{ student: Student; criterion: RubricCriterion; rating: RubricCriterionRating; evidence: string } | null>(null);
  const [serverInstrument, setServerInstrument] = useState<RubricInstrumentDetail | null>(null);
  const instrumentLoading = Boolean(instrumentId && resolvedInstrumentId !== instrumentId);

  const selectedStudents = useMemo(() => {
    const byId = new Map(students.map((student) => [student.id, student]));
    return (draft.selection?.studentIds ?? []).map((id) => byId.get(id)).filter((student): student is Student => Boolean(student));
  }, [draft.selection?.studentIds, students]);
  const levels = useMemo(() => [...getEducationLevels(draft.general.modality)], [draft.general.modality]);
  const grades = gradesByLevel[draft.general.level] ?? [];
  const areas = areasByLevel[draft.general.level] ?? [];
  const competencies = competenciesByArea[draft.general.area] ?? [];

  const stepErrors = useMemo(() => {
    if (draft.currentStep === 0) {
      const fields: Array<[keyof RubricGeneralData, string]> = [["teacherName", "Docente"], ["institution", "Institución"], ["level", "Nivel"], ["grade", "Grado"], ["area", "Área"], ["competence", "Competencia"], ["performance", "Desempeño"], ["evidenceTitle", "Evidencia"], ["date", "Fecha"]];
      const errors = fields.filter(([key]) => !String(draft.general[key] ?? "").trim()).map(([key, label]) => ({ id: String(key), label }));
      if (!draft.selection?.studentIds.length) errors.push({ id: "students", label: "Estudiantes" });
      return errors;
    }
    if (draft.currentStep === 1) {
      const errors: Array<{ id: string; label: string }> = [];
      draft.criteria.forEach((criterion) => {
        if (!criterion.title.trim() || !criterion.description.trim() || draft.levels.some((level) => !criterion.descriptors[level.id]?.trim())) errors.push({ id: criterion.id, label: criterion.code });
      });
      if (draft.weighted && draft.criteria.reduce((sum, criterion) => sum + (criterion.weight ?? 0), 0) !== 100) errors.push({ id: "weights", label: "Ponderaciones (deben sumar 100%)" });
      return errors;
    }
    if (draft.currentStep === 2) {
      const assessments = reconcileRubricAssessments(selectedStudents, draft.criteria, draft.assessments);
      const missing = assessments.some((assessment) => !assessment.evidence.trim() || draft.criteria.some((criterion) => {
        const rating = assessment.ratings[criterion.id];
        return !rating.levelId || !rating.strength.trim() || !rating.improvement.trim() || !rating.recommendation.trim();
      }));
      return missing ? [{ id: "assessment", label: "Calificaciones y retroalimentación" }] : [];
    }
    return [];
  }, [draft, selectedStudents]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify({ ...draft, updatedAt: new Date().toISOString() }));
  }, [draft, storageKey]);

  useEffect(() => {
    if (!instrumentId) return;
    const controller = new AbortController();
    void getRubricInstrument(instrumentId, controller.signal)
      .then((instrument) => {
        setDraft(rubricDraftFromInstrument(instrument));
        setServerInstrument(instrument);
        setStatus("idle");
        if (instrument.status === "archived") setMessage("Esta rúbrica está archivada. Restáurala desde Historial para volver a editarla.");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "No pudimos abrir esta rúbrica.");
      })
      .finally(() => { if (!controller.signal.aborted) setResolvedInstrumentId(instrumentId); });
    return () => controller.abort();
  }, [instrumentId]);

  useEffect(() => {
    const rosterId = draft.selection?.rosterId;
    if (!rosterId) return;
    const controller = new AbortController();
    void listStudents(rosterId, { signal: controller.signal }).then(setStudents).catch((error: unknown) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStudentsError(error instanceof Error ? error.message : "No pudimos leer los estudiantes.");
    }).finally(() => { if (!controller.signal.aborted) setStudentsLoading(false); });
    return () => controller.abort();
  }, [draft.selection?.rosterId]);

  function updateGeneral<Key extends keyof RubricGeneralData>(key: Key, value: RubricGeneralData[Key]) {
    setDraft((current) => {
      const general = { ...current.general, [key]: value };
      if (key === "modality") { general.level = ""; general.grade = ""; general.area = ""; general.competence = ""; }
      if (key === "level") { general.grade = ""; general.area = ""; general.competence = ""; }
      if (key === "area") general.competence = "";
      return { ...current, general };
    });
    setShowErrors(false);
  }

  function updateSelection(selection: StudentSelection | null) {
    setStudents([]);
    setStudentsError("");
    setStudentsLoading(Boolean(selection?.rosterId));
    setDraft((current) => ({
      ...current,
      selection,
      activeStudentId: selection?.studentIds.includes(current.activeStudentId) ? current.activeStudentId : selection?.studentIds[0] ?? "",
      assessments: selection ? current.assessments.filter((assessment) => selection.studentIds.includes(assessment.studentId)) : [],
    }));
  }

  function updateWeighted(weighted: boolean) {
    setDraft((current) => ({ ...current, weighted, criteria: current.criteria.map((criterion) => ({ ...criterion, weight: weighted ? criterion.weight ?? 0 : null })) }));
  }

  function focusError(id: string) {
    const field = document.querySelector<HTMLElement>(`[data-rubric-field="${id}"]`);
    field?.scrollIntoView?.({ block: "center", behavior: "smooth" });
    (field?.querySelector<HTMLElement>("input, select, textarea, button") ?? field)?.focus({ preventScroll: true });
  }

  function next() {
    if (stepErrors.length) { setShowErrors(true); window.setTimeout(() => focusError(stepErrors[0].id), 0); return; }
    setShowErrors(false);
    setDraft((current) => ({ ...current, currentStep: Math.min(3, current.currentStep + 1) }));
  }

  async function persistDraft() {
    setStatus("saving");
    setMessage("");
    try {
      const saved = await saveRubricInstrument(payloadFromDraft(draft, selectedStudents), serverInstrument);
      setServerInstrument(saved);
      setResolvedInstrumentId(saved.id);
      if (saved.id !== instrumentId) onInstrumentIdChange?.(saved.id);
      setStatus("saved");
      setMessage("Rúbrica guardada con estudiantes, niveles y retroalimentaciones.");
      return saved;
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof ApiError && error.status === 409
        ? "Esta rúbrica cambió en otra sesión. No se guardó ni exportó una versión desactualizada; recarga la herramienta y revisa los cambios antes de intentarlo nuevamente."
        : error instanceof Error ? error.message : "No pudimos guardar la rúbrica.");
      return null;
    }
  }

  async function persistAndExportWord() {
    const saved = await persistDraft();
    if (!saved) return;
    try {
      await exportRubricDocx(draft, selectedStudents);
      setMessage("Rúbrica guardada y exportada con su matriz y retroalimentación individual.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "No pudimos preparar el archivo Word.");
    }
  }

  async function persistAndPrint() {
    const saved = await persistDraft();
    if (saved) window.print();
  }

  function startNewInstrument() {
    setDraft(initialDraft());
    setServerInstrument(null);
    setResolvedInstrumentId(undefined);
    setStatus("idle");
    setMessage("Nueva rúbrica preparada. La anterior permanece guardada en Historial.");
    onInstrumentIdChange?.("");
  }

  function applySuggestion(recommendation: string) {
    if (!feedbackTarget) return;
    setDraft((current) => ({ ...current, assessments: reconcileRubricAssessments(selectedStudents, current.criteria, current.assessments).map((assessment) => assessment.studentId === feedbackTarget.student.id ? { ...assessment, ratings: { ...assessment.ratings, [feedbackTarget.criterion.id]: { ...assessment.ratings[feedbackTarget.criterion.id], recommendation } } } : assessment) }));
    setFeedbackTarget(null);
  }

  function renderGeneral() {
    return <div className="evaluation-form-grid rubric-general">
      <label data-rubric-field="teacherName"><span>Nombre del docente</span><input value={draft.general.teacherName} onChange={(event) => updateGeneral("teacherName", event.target.value)} placeholder="Ej. Prof. María Gómez" /></label>
      <label data-rubric-field="institution"><span>Institución educativa</span><input value={draft.general.institution} onChange={(event) => updateGeneral("institution", event.target.value)} placeholder="Ej. I.E. N.° 5143 República del Perú" /></label>
      <label><span>Tipo de rúbrica</span><select value={draft.rubricType} onChange={(event) => setDraft((current) => ({ ...current, rubricType: event.target.value as RubricType }))}><option value="analytic">Analítica · un nivel por criterio</option><option value="holistic">Holística · valoración integral</option></select></label>
      <fieldset className="evaluation-choice"><legend>Ponderación</legend><label><input type="radio" checked={!draft.weighted} onChange={() => updateWeighted(false)} /><span>Sin ponderación</span></label><label><input type="radio" checked={draft.weighted} onChange={() => updateWeighted(true)} /><span>Usar porcentajes</span></label></fieldset>
      <label><span>Modalidad educativa</span><select value={draft.general.modality} onChange={(event) => updateGeneral("modality", event.target.value as EducationModality)}>{educationModalities.map((modality) => <option value={modality.value} key={modality.value}>{modality.label}</option>)}</select></label>
      <label data-rubric-field="level"><span>Nivel educativo</span><select value={draft.general.level} onChange={(event) => updateGeneral("level", event.target.value)}><option value="">Selecciona el nivel</option>{levels.map((level) => <option key={level}>{level}</option>)}</select></label>
      <label data-rubric-field="grade"><span>Grado o ciclo</span><select value={draft.general.grade} onChange={(event) => updateGeneral("grade", event.target.value)} disabled={!draft.general.level}><option value="">{draft.general.level ? "Selecciona el grado" : "Primero selecciona el nivel"}</option>{grades.map((grade) => <option key={grade}>{grade}</option>)}</select></label>
      <label data-rubric-field="area"><span>Área curricular</span><select value={draft.general.area} onChange={(event) => updateGeneral("area", event.target.value)} disabled={!draft.general.level}><option value="">{draft.general.level ? "Selecciona el área" : "Primero selecciona el nivel"}</option>{areas.map((area) => <option key={area}>{area}</option>)}</select></label>
      <label className="evaluation-field--wide" data-rubric-field="competence"><span>Competencia (CNEB)</span><select value={draft.general.competence} onChange={(event) => updateGeneral("competence", event.target.value)} disabled={!draft.general.area}><option value="">{draft.general.area ? "Selecciona la competencia" : "Primero selecciona el área"}</option>{competencies.map((competence) => <option key={competence}>{competence}</option>)}</select></label>
      <label className="evaluation-field--wide" data-rubric-field="performance"><span>Desempeño o aprendizaje esperado</span><textarea rows={3} value={draft.general.performance} onChange={(event) => updateGeneral("performance", event.target.value)} placeholder="Ej. Sustenta conclusiones con datos obtenidos y explica la relación entre evidencia y resultado." /></label>
      <label className="evaluation-field--wide"><span>Contexto de aplicación <em>Opcional</em></span><textarea rows={3} value={draft.general.context} onChange={(event) => updateGeneral("context", event.target.value)} placeholder="Ej. Exposición grupal sobre el cuidado del agua en la comunidad." /></label>
      <label className="evaluation-field--wide" data-rubric-field="evidenceTitle"><span>Evidencia o producto</span><textarea rows={2} value={draft.general.evidenceTitle} onChange={(event) => updateGeneral("evidenceTitle", event.target.value)} placeholder="Ej. Informe y exposición de indagación" /></label>
      <label data-rubric-field="date"><span>Fecha</span><input type="date" value={draft.general.date} onChange={(event) => updateGeneral("date", event.target.value)} /></label>
      <div className="evaluation-field--wide" data-rubric-field="students"><StudentSelector mode="multiple" value={draft.selection} onChange={updateSelection} label="Estudiantes que se calificarán" description="Elige filas de tu nómina. Cada estudiante conservará evidencia y feedback propios." required manageStudentsHref="/dashboard/mis-estudiantes" /></div>
    </div>;
  }

  function renderPreview() {
    const assessments = reconcileRubricAssessments(selectedStudents, draft.criteria, draft.assessments);
    return <div className="rubric-preview">
      <header><span>{draft.rubricType === "analytic" ? "Rúbrica analítica" : "Rúbrica holística"}</span><h3>{draft.general.evidenceTitle}</h3><p>{draft.general.competence}</p></header>
      <div className="rubric-preview__table-scroll" tabIndex={0} role="region" aria-label="Tabla de la rúbrica"><table><thead><tr><th>Criterio</th>{draft.levels.map((level) => <th key={level.id}>{level.code}<small>{level.label}</small></th>)}</tr></thead><tbody>{draft.criteria.map((criterion) => <tr key={criterion.id}><th><strong>{criterion.code} · {criterion.title}</strong><small>{criterion.description}</small></th>{draft.levels.map((level) => <td key={level.id}>{criterion.descriptors[level.id]}</td>)}</tr>)}</tbody></table></div>
      <section className="rubric-preview__students"><h4>Resultados y recomendaciones</h4>{selectedStudents.map((student) => { const assessment = assessments.find((item) => item.studentId === student.id)!; return <article key={student.id}><header><h5>{student.full_name}</h5><p>{assessment.evidence}</p></header>{draft.criteria.map((criterion) => { const rating = assessment.ratings[criterion.id]; const level = draft.levels.find((item) => item.id === rating.levelId); return <div key={criterion.id}><strong>{criterion.code} · {level ? `${level.code} ${level.label}` : "Sin nivel"}</strong><p><b>Fortaleza:</b> {rating.strength}</p><p><b>Por mejorar:</b> {rating.improvement}</p><p><b>Recomendación:</b> {rating.recommendation}</p></div>; })}<footer><strong>Decisión docente</strong><p>{assessment.teacherDecision || "Pendiente de registrar."}</p></footer></article>; })}</section>
    </div>;
  }

  function renderStep() {
    if (draft.currentStep === 0) return renderGeneral();
    if (draft.currentStep === 1) return <div data-rubric-field={stepErrors[0]?.id}><RubricBuilder criteria={draft.criteria} levels={draft.levels} weighted={draft.weighted} onCriteriaChange={(criteria) => setDraft((current) => ({ ...current, criteria }))} onLevelsChange={(rubricLevels) => setDraft((current) => ({ ...current, levels: rubricLevels }))} /></div>;
    if (draft.currentStep === 2) return <div data-rubric-field="assessment">{studentsError ? <div className="evaluation-message evaluation-message--error" role="alert">{studentsError}</div> : null}{studentsLoading ? <div className="evaluation-message" role="status">Cargando estudiantes…</div> : null}<RubricAssessment students={selectedStudents} criteria={draft.criteria} levels={draft.levels} assessments={draft.assessments} activeStudentId={draft.activeStudentId} onActiveStudentChange={(activeStudentId) => setDraft((current) => ({ ...current, activeStudentId }))} onChange={(assessments) => setDraft((current) => ({ ...current, assessments }))} onSuggest={(student, criterion, rating, evidence) => setFeedbackTarget({ student, criterion, rating, evidence })} /></div>;
    return renderPreview();
  }

  const pageTitle = variant === "grader" ? "Calificador de rúbrica" : "Rúbrica de evaluación";
  return <main className="evaluation-tool rubric-tool"><div className="evaluation-shell">
    <header className="evaluation-header"><div><span>Evaluamos · {variant === "grader" ? "retroalimentación por estudiante" : "constructor de instrumento"}</span><h1>{pageTitle}</h1><p>Diseña niveles observables, registra evidencias y entrega recomendaciones concretas sin ceder la decisión docente.</p></div><div className="evaluation-header__actions">{serverInstrument || instrumentId ? <button type="button" className="evaluation-secondary" onClick={startNewInstrument}><FilePlus2 /> Nueva rúbrica</button> : null}<button type="button" className="evaluation-secondary" onClick={() => void persistDraft()} disabled={instrumentLoading || (Boolean(instrumentId) && !serverInstrument) || serverInstrument?.status === "archived" || status === "saving"}>{instrumentLoading ? <LoaderCircle className="is-spinning" /> : status === "saving" ? <LoaderCircle className="is-spinning" /> : status === "saved" ? <Check /> : <Save />}{instrumentLoading ? "Abriendo…" : status === "saving" ? "Guardando…" : status === "saved" ? "Guardado" : "Guardar borrador"}</button></div></header>
    <ol className="evaluation-stepper" aria-label="Pasos de la rúbrica">{STEPS.map((step, index) => <li className={index === draft.currentStep ? "is-active" : index < draft.currentStep ? "is-completed" : ""} key={step.short}><button type="button" disabled={index > draft.currentStep} aria-current={index === draft.currentStep ? "step" : undefined} onClick={() => setDraft((current) => ({ ...current, currentStep: index }))}><span>{index < draft.currentStep ? <Check /> : index + 1}</span><strong>{step.short}</strong></button></li>)}</ol>
    <section className="evaluation-card"><div className="evaluation-card__intro"><small>Paso {draft.currentStep + 1} de {STEPS.length}</small><h2>{STEPS[draft.currentStep].title}</h2><p>{draft.currentStep === 0 ? "Define el contexto curricular y vincula estudiantes reales." : draft.currentStep === 1 ? "Configura criterios, niveles, descriptores y ponderaciones opcionales." : draft.currentStep === 2 ? "Califica por criterio y redacta feedback editable para cada estudiante." : "Revisa la tabla y los reportes individuales antes de imprimir o guardar."}</p></div>
      {showErrors && stepErrors.length ? <div className="evaluation-validation" role="alert"><AlertTriangle /><div><h3>Revisa los datos pendientes</h3><ul>{stepErrors.map((error) => <li key={error.id}><button type="button" onClick={() => focusError(error.id)}>{error.label}</button></li>)}</ul></div></div> : null}
      {renderStep()}
      {message ? <div className={`evaluation-message${status === "error" ? " evaluation-message--error" : ""}`} role={status === "error" ? "alert" : "status"}>{message}</div> : null}
      <footer className="evaluation-actions"><button type="button" className="evaluation-secondary" disabled={draft.currentStep === 0} onClick={() => setDraft((current) => ({ ...current, currentStep: Math.max(0, current.currentStep - 1) }))}><ChevronLeft /> Anterior</button>{draft.currentStep < 3 ? <button type="button" className="evaluation-primary" onClick={next}>Siguiente <ChevronRight /></button> : <div className="evaluation-actions__exports"><button type="button" className="evaluation-secondary" disabled={status === "saving"} onClick={() => void persistAndPrint()}><Printer /> Guardar e imprimir PDF</button><button type="button" className="evaluation-primary" disabled={status === "saving"} onClick={() => void persistAndExportWord()}><Download /> Guardar y descargar Word</button></div>}</footer>
    </section>
    {feedbackTarget ? <RubricFeedbackDialog studentName={feedbackTarget.student.full_name} prompt={{ studentContext: draft.general.context, criterionTitle: feedbackTarget.criterion.title, levelLabel: draft.levels.find((level) => level.id === feedbackTarget.rating.levelId)?.label ?? "", evidence: feedbackTarget.evidence, strength: feedbackTarget.rating.strength, improvement: feedbackTarget.rating.improvement, currentRecommendation: feedbackTarget.rating.recommendation, modality: draft.general.modality, level: draft.general.level, grade: draft.general.grade, area: draft.general.area } satisfies RubricFeedbackPrompt} onApply={applySuggestion} onClose={() => setFeedbackTarget(null)} /> : null}
  </div></main>;
}

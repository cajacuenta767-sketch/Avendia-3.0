import { useCallback, useMemo, useState } from "react";
import { Download, Sparkles } from "lucide-react";

import { GenerationProgressOverlay } from "../../../components/GenerationProgressOverlay";
import { StudentSelector, type StudentSelection } from "../../../components/students/StudentSelector";
import { EducationFrameFields } from "../source-documents/EducationFrameFields";
import { educationFrameFromProfile } from "../source-documents/educationFrameProfile";
import { EvaluationPreviewSection, EvaluationWizard, type EvaluationWizardStep } from "../source-documents/EvaluationWizard";
import type { EvaluationDraftPayload, EvaluationInstrument } from "../source-documents/evaluationContracts";
import { useEvaluationInstrument } from "../source-documents/useEvaluationInstrument";
import { useSelectedStudentNames } from "../source-documents/useSelectedStudentNames";
import type { RecoverySelectionMode, RecoveryToolState } from "./recoveryTypes";
import { apiRequest } from "../../../lib/api";
import type { WorkflowArtifact } from "../../tools/exportWorkflowDocx";
import "../source-documents/evaluationWizard.css";
import "../source-documents/SourceDocumentInput.css";
import "./RecoveryFolderTool.css";

const STEPS: EvaluationWizardStep[] = [
  { id: "diagnosis", label: "Diagnóstico y grupo", description: "Selecciona estudiantes y describe la necesidad concreta de recuperación." },
  { id: "competencies", label: "Competencias y criterios", description: "Prioriza aprendizajes y define evidencias verificables." },
  { id: "activities", label: "Experiencias y actividades", description: "Organiza una ruta diferenciada, recursos y oportunidades de práctica." },
  { id: "family", label: "Familia y cronograma", description: "Acuerda tiempos, orientaciones familiares y seguimiento individual." },
  { id: "preview", label: "Vista previa", description: "Revisa la carpeta completa antes de guardarla o generarla." },
];

function initialState(): RecoveryToolState {
  return {
    frame: educationFrameFromProfile(),
    selection_mode: "multiple",
    selection: null,
    application_period: "Bimestre 1",
    diagnosis: "",
    prioritized_competencies: "",
    criteria: "",
    expected_evidence: "",
    activity_route: "",
    resources: "",
    timeline: "",
    family_guidance: "",
    general_followup: "",
    individual_followup: {},
    artifact: null,
  };
}

export function RecoveryFolderTool({ instrumentId, onInstrumentIdChange }: { instrumentId?: string; onInstrumentIdChange?: (id: string) => void }) {
  const [state, setState] = useState<RecoveryToolState>(initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [generationError, setGenerationError] = useState("");
  const onLoaded = useCallback((instrument: EvaluationInstrument) => {
    const data = instrument.general_data as Partial<RecoveryToolState> | undefined;
    if (!data) return;
    const generated = (instrument.settings as { generated_artifact?: WorkflowArtifact } | undefined)?.generated_artifact ?? null;
    setState((current) => ({ ...current, ...data, artifact: data.artifact ?? generated, frame: { ...current.frame, ...(data.frame ?? {}) } }));
  }, []);
  const draft = useEvaluationInstrument({ instrumentId, onLoaded, onInstrumentIdChange });
  const selectedStudents = useSelectedStudentNames(state.selection);

  function update<Key extends keyof RecoveryToolState>(key: Key, value: RecoveryToolState[Key]) {
    setState((current) => ({ ...current, [key]: value }));
    setValidationError("");
  }

  function handleSelection(selection: StudentSelection | null) {
    setState((current) => ({ ...current, selection, individual_followup: selection
      ? Object.fromEntries(selection.studentIds.map((id) => [id, current.individual_followup[id] ?? ""]))
      : {} }));
  }

  const payload = useMemo<EvaluationDraftPayload>(() => ({
    kind: "recovery",
    title: `Carpeta de recuperación · ${state.application_period}`,
    roster_id: state.selection?.rosterId,
    general_data: state,
    settings: {
      application_period: state.application_period,
      diagnosis: state.diagnosis,
      prioritized_competencies: state.prioritized_competencies,
      criteria: state.criteria,
      expected_evidence: state.expected_evidence,
      activity_route: state.activity_route,
      resources: state.resources,
      timeline: state.timeline,
      family_guidance: state.family_guidance,
      general_followup: state.general_followup,
      generated_artifact: state.artifact,
    },
    general_observation: state.general_followup || null,
    participants: (state.selection?.studentIds ?? []).map((studentId, index) => ({
      student_id: studentId,
      role: "student",
      sort_order: index,
      individual_notes: state.individual_followup[studentId] || null,
    })),
  }), [state]);

  function missingAt(step: number) {
    if (step === 0 && (!state.selection?.studentIds.length || !state.diagnosis.trim())) return "Selecciona uno o más estudiantes y escribe el diagnóstico de necesidades.";
    if (step === 1 && (!state.prioritized_competencies.trim() || !state.criteria.trim() || !state.expected_evidence.trim())) return "Completa competencias, criterios y evidencias esperadas.";
    if (step === 2 && !state.activity_route.trim()) return "Explica la ruta de actividades de recuperación.";
    if (step === 3 && !state.timeline.trim()) return "Añade un cronograma aplicable al periodo elegido.";
    return "";
  }

  function goToStep(next: number) {
    if (next > currentStep) {
      const invalid = Array.from({ length: next }, (_, index) => index).find((index) => missingAt(index));
      if (invalid !== undefined) { setCurrentStep(invalid); setValidationError(missingAt(invalid)); return; }
    }
    setValidationError("");
    setCurrentStep(Math.max(0, Math.min(STEPS.length - 1, next)));
  }

  async function save() {
    const invalid = [0, 1, 2, 3].find((step) => missingAt(step));
    if (invalid !== undefined) { setCurrentStep(invalid); setValidationError(missingAt(invalid)); return; }
    try { await draft.persist(payload); } catch { /* El hook muestra el error. */ }
  }

  async function generateWithAI() {
    const invalid = [0, 1, 2, 3].find((step) => missingAt(step));
    if (invalid !== undefined) { setCurrentStep(invalid); setValidationError(missingAt(invalid)); return; }
    setGenerating(true);
    setGenerationError("");
    try {
      const token = sessionStorage.getItem("avendia.accessToken");
      const artifact = await apiRequest<WorkflowArtifact>("/ai/tools/workflow/generate", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: JSON.stringify({
          tool_id: "carpetas-recuperacion",
          module: "evaluamos",
          tool_title: "Carpetas de recuperación",
          artifact_type: "documento",
          fields: {
            teacher_name: state.frame.teacher_name,
            institution: state.frame.institution_name,
            modality: state.frame.modality,
            level: state.frame.education_level,
            grade: state.frame.grade_or_cycle,
            curricular_area: state.frame.curricular_area,
            application_period: state.application_period,
            selected_students: selectedStudents.students.map((student) => student.full_name).join("\n"),
            diagnosis: state.diagnosis,
            prioritized_competencies: state.prioritized_competencies,
            criteria: state.criteria,
            evidence: state.expected_evidence,
            activity_sequence: state.activity_route,
            resources: state.resources,
            timeline: state.timeline,
            family_guidance: state.family_guidance,
            feedback: state.general_followup,
            individual_followup: selectedStudents.students.map((student) => `${student.full_name}: ${state.individual_followup[student.id] || "Sin ajuste individual declarado"}`).join("\n"),
          },
          requested_sections: ["Diagnóstico", "Competencias priorizadas", "Criterios y evidencias", "Actividades de recuperación", "Cronograma", "Orientaciones familiares", "Seguimiento individual"],
        }),
      });
      update("artifact", artifact);
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "No se pudo generar la carpeta de recuperación.");
    } finally {
      setGenerating(false);
    }
  }

  async function downloadWord() {
    if (!state.artifact) return;
    setExporting(true);
    setGenerationError("");
    try {
      const { exportWorkflowDocx } = await import("../../tools/exportWorkflowDocx");
      await exportWorkflowDocx(state.artifact, {
        workflowKey: "evaluamos/carpetas-recuperacion",
        values: {
          ...state.frame,
          institution: state.frame.institution_name,
          level: state.frame.education_level,
          grade: state.frame.grade_or_cycle,
          curricular_area: state.frame.curricular_area,
          students: selectedStudents.students.map((student) => student.full_name).join(", "),
          application_period: state.application_period,
        },
      });
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "No se pudo preparar el documento Word.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
    <EvaluationWizard
      eyebrow="Evaluamos · Recuperación"
      title="Carpetas de recuperación"
      description="Planifica una ruta diferenciada para uno, varios o todos los estudiantes de un aula."
      steps={STEPS}
      currentStep={currentStep}
      onStepChange={goToStep}
      onSave={save}
      saving={draft.saving}
      message={draft.message}
      error={validationError || draft.error || selectedStudents.error}
    >
      {currentStep === 0 ? (
        <div className="evaluation-stack">
          <EducationFrameFields value={state.frame} onChange={(frame) => update("frame", frame)} />
          <div className="evaluation-form-grid">
            <label>
              <span>Alcance de la carpeta</span>
              <select value={state.selection_mode} onChange={(event) => { update("selection_mode", event.target.value as RecoverySelectionMode); handleSelection(null); }}>
                <option value="single">Un estudiante</option>
                <option value="multiple">Varios estudiantes</option>
                <option value="classroom">Toda el aula</option>
              </select>
            </label>
            <label>
              <span>Periodo de aplicación</span>
              <select value={state.application_period} onChange={(event) => update("application_period", event.target.value)}>
                {['Bimestre 1', 'Bimestre 2', 'Bimestre 3', 'Bimestre 4', 'Trimestre 1', 'Trimestre 2', 'Trimestre 3', 'Periodo personalizado'].map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            <label className="evaluation-field--wide">
              <span>Diagnóstico de necesidades</span>
              <textarea value={state.diagnosis} onChange={(event) => update("diagnosis", event.target.value)} placeholder="Ej. El grupo ubica datos explícitos, pero necesita apoyo para inferir causas y justificar una respuesta con evidencia del texto." />
            </label>
          </div>
          <StudentSelector key={state.selection_mode} mode={state.selection_mode} value={state.selection} onChange={handleSelection} manageStudentsHref="/dashboard/mis-estudiantes" label="Estudiantes que recibirán la carpeta" required />
        </div>
      ) : null}

      {currentStep === 1 ? (
        <div className="evaluation-form-grid">
          <label className="evaluation-field--wide"><span>Competencias priorizadas</span><textarea value={state.prioritized_competencies} onChange={(event) => update("prioritized_competencies", event.target.value)} placeholder="Ej. Lee diversos tipos de textos escritos en su lengua materna." /></label>
          <label className="evaluation-field--wide"><span>Criterios de evaluación</span><textarea value={state.criteria} onChange={(event) => update("criteria", event.target.value)} placeholder="Ej. Infiere una relación de causa y efecto y la sustenta con dos pistas del texto." /></label>
          <label className="evaluation-field--wide"><span>Evidencias esperadas</span><textarea value={state.expected_evidence} onChange={(event) => update("expected_evidence", event.target.value)} placeholder="Ej. Organizador causa-efecto y explicación oral breve con evidencia subrayada." /></label>
        </div>
      ) : null}

      {currentStep === 2 ? (
        <div className="evaluation-form-grid">
          <label className="evaluation-field--wide"><span>Ruta de actividades</span><textarea value={state.activity_route} onChange={(event) => update("activity_route", event.target.value)} placeholder="Ej. 1) Modelado con un párrafo breve. 2) Práctica con pistas. 3) Resolución autónoma. 4) Comparación y explicación." /></label>
          <label className="evaluation-field--wide"><span>Recursos y apoyos</span><textarea value={state.resources} onChange={(event) => update("resources", event.target.value)} placeholder="Ej. Texto graduado, resaltadores, tarjetas de conectores y organizador visual." /></label>
        </div>
      ) : null}

      {currentStep === 3 ? (
        <div className="evaluation-stack">
          <div className="evaluation-form-grid">
            <label className="evaluation-field--wide"><span>Cronograma</span><textarea value={state.timeline} onChange={(event) => update("timeline", event.target.value)} placeholder="Ej. Semana 1: modelado y práctica guiada. Semana 2: aplicación y retroalimentación. Semana 3: nueva evidencia y cierre." /></label>
            <label className="evaluation-field--wide"><span>Orientaciones para la familia</span><textarea value={state.family_guidance} onChange={(event) => update("family_guidance", event.target.value)} placeholder="Ej. Leer diez minutos, preguntar qué pista ayudó a responder y valorar la explicación antes de corregir." /></label>
            <label className="evaluation-field--wide"><span>Seguimiento general</span><textarea value={state.general_followup} onChange={(event) => update("general_followup", event.target.value)} placeholder="Ej. Revisar el avance con una evidencia breve al finalizar cada semana." /></label>
          </div>
          <section className="recovery-individual">
            <h3>Seguimiento individual</h3>
            <p>Agrega una necesidad, apoyo o meta específica para cada estudiante.</p>
            {selectedStudents.students.map((student) => (
              <label key={student.id}><span>{student.full_name}</span><textarea value={state.individual_followup[student.id] ?? ""} onChange={(event) => update("individual_followup", { ...state.individual_followup, [student.id]: event.target.value })} placeholder="Ej. Reducir gradualmente las preguntas guía y pedir una justificación autónoma al cierre." /></label>
            ))}
          </section>
        </div>
      ) : null}

      {currentStep === 4 ? (
        <div className="evaluation-preview">
          <EvaluationPreviewSection title={`Carpeta · ${state.application_period}`}><p>{state.diagnosis}</p></EvaluationPreviewSection>
          <EvaluationPreviewSection title="Estudiantes"><ul className="evaluation-chip-list">{selectedStudents.students.map((student) => <li key={student.id}>{student.full_name}</li>)}</ul></EvaluationPreviewSection>
          <EvaluationPreviewSection title="Aprendizajes priorizados"><p>{state.prioritized_competencies}\n\nCriterios: {state.criteria}\n\nEvidencias: {state.expected_evidence}</p></EvaluationPreviewSection>
          <EvaluationPreviewSection title="Ruta y cronograma"><p>{state.activity_route}\n\nRecursos: {state.resources}\n\nCronograma: {state.timeline}</p></EvaluationPreviewSection>
          <EvaluationPreviewSection title="Familia y seguimiento"><p>{state.family_guidance || "Pendiente"}\n\n{state.general_followup || "Pendiente"}</p></EvaluationPreviewSection>
          <section className="source-generation">
            <div><h3>Carpeta pedagógica personalizada</h3><p>Genera actividades, cronograma y seguimiento diferenciados para los estudiantes seleccionados.</p></div>
            <button className="evaluation-button" type="button" onClick={() => void generateWithAI()} disabled={generating}><Sparkles aria-hidden="true" /> {generating ? "Generando carpeta…" : state.artifact ? "Volver a generar con IA" : "Generar carpeta con IA"}</button>
          </section>
          {generationError ? <div className="evaluation-notice evaluation-notice--error" role="alert">{generationError}</div> : null}
          {state.artifact ? (
            <section className="source-artifact-editor" aria-label="Carpeta de recuperación generada">
              <div className="source-artifact-editor__actions"><button className="evaluation-button evaluation-button--secondary" type="button" onClick={() => void downloadWord()} disabled={exporting}><Download aria-hidden="true" /> {exporting ? "Preparando Word…" : "Descargar Word"}</button></div>
              <h2>{state.artifact.document_title}</h2>
              <p>{state.artifact.executive_summary}</p>
              {state.artifact.sections.map((section) => <article key={section.title}><h3>{section.title}</h3><p>{section.narrative}</p><ul>{section.key_points.map((point) => <li key={point}>{point}</li>)}</ul></article>)}
              {(state.artifact.tables ?? []).map((table) => <article key={table.title}><h3>{table.title}</h3><div className="word-table-responsive"><table className="word-table"><thead><tr>{table.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{table.rows.map((row, rowIndex) => <tr key={`${table.title}-${rowIndex}`}>{row.map((cell) => <td key={cell}>{cell}</td>)}</tr>)}</tbody></table></div></article>)}
            </section>
          ) : null}
        </div>
      ) : null}
    </EvaluationWizard>
    <GenerationProgressOverlay open={generating} toolTitle="Carpetas de recuperación" family="evaluamos" />
    </>
  );
}

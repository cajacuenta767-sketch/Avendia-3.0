import { useCallback, useMemo, useState } from "react";

import { StudentSelector, type StudentSelection } from "../../../components/students/StudentSelector";
import { EducationFrameFields } from "../source-documents/EducationFrameFields";
import { educationFrameFromProfile } from "../source-documents/educationFrameProfile";
import { EvaluationPreviewSection, EvaluationWizard, type EvaluationWizardStep } from "../source-documents/EvaluationWizard";
import type { EvaluationDraftPayload, EvaluationInstrument } from "../source-documents/evaluationContracts";
import { useEvaluationInstrument } from "../source-documents/useEvaluationInstrument";
import { useSelectedStudentNames } from "../source-documents/useSelectedStudentNames";
import type { AttendanceValue, AuxiliaryRegisterState } from "./registerTypes";
import "../source-documents/evaluationWizard.css";
import "./AuxiliaryRegisterTool.css";

const STEPS: EvaluationWizardStep[] = [
  { id: "frame", label: "Encuadre y competencias", description: "Elige el aula desde la nómina y define el periodo curricular." },
  { id: "criteria", label: "Criterios y evidencias", description: "Especifica lo que observarás y el producto que registrará el aprendizaje." },
  { id: "attendance", label: "Asistencia", description: "Registra asistencia en filas vinculadas a cada estudiante." },
  { id: "conclusions", label: "Conclusiones CNEB", description: "Redacta conclusiones descriptivas generales e individuales." },
  { id: "preview", label: "Vista previa", description: "Comprueba el registro antes de guardarlo." },
];

const ATTENDANCE_LABELS: Record<AttendanceValue, string> = { P: "Presente", T: "Tardanza", A: "Ausente", J: "Justificada" };

function initialState(): AuxiliaryRegisterState {
  return {
    frame: educationFrameFromProfile(),
    selection: null,
    period: "Bimestre 1",
    competencies: "",
    criteria: "",
    evidence: "",
    attendance_date: new Date().toISOString().slice(0, 10),
    attendance: {},
    attendance_observations: "",
    in_progress_conclusions: "",
    achieved_conclusions: "",
    individual_conclusions: {},
  };
}

function criterionLines(value: string) {
  return value.split(/\r?\n/).map((line) => line.replace(/^[-•\d.)\s]+/, "").trim()).filter(Boolean);
}

export function AuxiliaryRegisterTool({ instrumentId, onInstrumentIdChange }: { instrumentId?: string; onInstrumentIdChange?: (id: string) => void }) {
  const [state, setState] = useState<AuxiliaryRegisterState>(initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [validationError, setValidationError] = useState("");
  const onLoaded = useCallback((instrument: EvaluationInstrument) => {
    const data = instrument.general_data as Partial<AuxiliaryRegisterState> | undefined;
    if (!data) return;
    setState((current) => ({ ...current, ...data, frame: { ...current.frame, ...(data.frame ?? {}) } }));
  }, []);
  const draft = useEvaluationInstrument({ instrumentId, onLoaded, onInstrumentIdChange });
  const selectedStudents = useSelectedStudentNames(state.selection);

  function update<Key extends keyof AuxiliaryRegisterState>(key: Key, value: AuxiliaryRegisterState[Key]) {
    setState((current) => ({ ...current, [key]: value }));
    setValidationError("");
  }

  function handleSelection(selection: StudentSelection | null) {
    setState((current) => ({
      ...current,
      selection,
      attendance: selection ? Object.fromEntries(selection.studentIds.map((id) => [id, current.attendance[id] ?? "P"])) : {},
      individual_conclusions: selection ? Object.fromEntries(selection.studentIds.map((id) => [id, current.individual_conclusions[id] ?? ""])) : {},
    }));
  }

  const criteria = useMemo(() => criterionLines(state.criteria), [state.criteria]);
  const payload = useMemo<EvaluationDraftPayload>(() => ({
    kind: "auxiliary_record",
    title: `Registro auxiliar · ${state.period}`,
    roster_id: state.selection?.rosterId,
    general_data: state,
    settings: {
      period: state.period,
      competencies: state.competencies,
      evidence: state.evidence,
      attendance_date: state.attendance_date,
      attendance_observations: state.attendance_observations,
      in_progress_conclusions: state.in_progress_conclusions,
      achieved_conclusions: state.achieved_conclusions,
    },
    participants: (state.selection?.studentIds ?? []).map((studentId, index) => ({
      student_id: studentId,
      role: "student",
      sort_order: index,
      individual_notes: state.individual_conclusions[studentId] || null,
    })),
    criteria: criteria.map((title, index) => ({ client_key: `criterion-${index + 1}`, code: `C${index + 1}`, title, sort_order: index })),
  }), [criteria, state]);

  function missingAt(step: number) {
    if (step === 0 && (!state.selection?.studentIds.length || !state.competencies.trim())) return "Selecciona el aula o estudiantes y registra al menos una competencia.";
    if (step === 1 && (!criteria.length || !state.evidence.trim())) return "Escribe al menos un criterio en una línea y la evidencia esperada.";
    if (step === 2 && !state.attendance_date) return "Selecciona la fecha del registro de asistencia.";
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
    const invalid = [0, 1, 2].find((step) => missingAt(step));
    if (invalid !== undefined) { setCurrentStep(invalid); setValidationError(missingAt(invalid)); return; }
    try { await draft.persist(payload); } catch { /* El hook muestra el error. */ }
  }

  return (
    <EvaluationWizard
      eyebrow="Evaluamos · Registro"
      title="Registros auxiliares"
      description="Construye el registro desde tu nómina central y evita volver a escribir la lista de estudiantes."
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
          <label className="evaluation-field"><span>Periodo</span><select value={state.period} onChange={(event) => update("period", event.target.value)}>{['Bimestre 1', 'Bimestre 2', 'Bimestre 3', 'Bimestre 4', 'Trimestre 1', 'Trimestre 2', 'Trimestre 3'].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="evaluation-field"><span>Competencias CNEB</span><textarea value={state.competencies} onChange={(event) => update("competencies", event.target.value)} placeholder="Ej. Lee diversos tipos de textos escritos en su lengua materna." /></label>
          <StudentSelector mode="classroom" value={state.selection} onChange={handleSelection} manageStudentsHref="/dashboard/mis-estudiantes" label="Aula del registro" description="Se añadirán todos los estudiantes activos, en el mismo orden de la nómina." required />
        </div>
      ) : null}

      {currentStep === 1 ? (
        <div className="evaluation-form-grid">
          <label className="evaluation-field--wide"><span>Criterios, uno por línea</span><textarea aria-label="Criterios, uno por línea" value={state.criteria} onChange={(event) => update("criteria", event.target.value)} placeholder={'Identifica información explícita relevante.\nInfiere relaciones a partir de pistas.\nSustenta una opinión con evidencia.'} /><small>Se convertirán en C1, C2, C3… sin perder su descripción completa.</small></label>
          <label className="evaluation-field--wide"><span>Evidencias de aprendizaje</span><textarea value={state.evidence} onChange={(event) => update("evidence", event.target.value)} placeholder="Ej. Ficha resuelta, explicación oral y organizador causa-efecto." /></label>
        </div>
      ) : null}

      {currentStep === 2 ? (
        <div className="evaluation-stack">
          <div className="evaluation-form-grid">
            <label><span>Fecha del registro</span><input type="date" value={state.attendance_date} onChange={(event) => update("attendance_date", event.target.value)} /></label>
            <label className="evaluation-field--wide"><span>Observaciones generales de asistencia</span><textarea value={state.attendance_observations} onChange={(event) => update("attendance_observations", event.target.value)} placeholder="Ej. Dos estudiantes llegaron después de la actividad inicial; se les entregó la consigna resumida." /></label>
          </div>
          <div className="auxiliary-table-wrap" role="region" aria-label="Matriz de asistencia" tabIndex={0}>
            <table className="auxiliary-table">
              <thead><tr><th>Estudiante</th><th>Estado</th><th>Descripción</th></tr></thead>
              <tbody>{selectedStudents.students.map((student) => (
                <tr key={student.id}>
                  <th scope="row">{student.full_name}</th>
                  <td><select aria-label={`Asistencia de ${student.full_name}`} value={state.attendance[student.id] ?? "P"} onChange={(event) => update("attendance", { ...state.attendance, [student.id]: event.target.value as AttendanceValue })}>{(Object.keys(ATTENDANCE_LABELS) as AttendanceValue[]).map((value) => <option key={value} value={value}>{value} · {ATTENDANCE_LABELS[value]}</option>)}</select></td>
                  <td>{ATTENDANCE_LABELS[state.attendance[student.id] ?? "P"]}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      ) : null}

      {currentStep === 3 ? (
        <div className="evaluation-stack">
          <div className="evaluation-form-grid">
            <label className="evaluation-field--wide"><span>Conclusión para estudiantes en proceso</span><textarea value={state.in_progress_conclusions} onChange={(event) => update("in_progress_conclusions", event.target.value)} placeholder="Ej. Ubica información explícita y requiere comparar pistas para justificar inferencias con mayor autonomía." /></label>
            <label className="evaluation-field--wide"><span>Conclusión para logro esperado o destacado</span><textarea value={state.achieved_conclusions} onChange={(event) => update("achieved_conclusions", event.target.value)} placeholder="Ej. Interpreta relaciones y sustenta su opinión con evidencias pertinentes; puede asumir textos de mayor complejidad." /></label>
          </div>
          <section className="register-conclusions">
            <h3>Conclusión individual opcional</h3>
            {selectedStudents.students.map((student) => <label key={student.id}><span>{student.full_name}</span><textarea value={state.individual_conclusions[student.id] ?? ""} onChange={(event) => update("individual_conclusions", { ...state.individual_conclusions, [student.id]: event.target.value })} placeholder="Ej. Logro, dificultad específica y recomendación concreta para el siguiente periodo." /></label>)}
          </section>
        </div>
      ) : null}

      {currentStep === 4 ? (
        <div className="evaluation-preview">
          <EvaluationPreviewSection title={`Registro auxiliar · ${state.period}`}><p>{state.competencies}</p></EvaluationPreviewSection>
          <EvaluationPreviewSection title="Criterios"><p>{criteria.map((item, index) => `C${index + 1}. ${item}`).join("\n")}</p></EvaluationPreviewSection>
          <EvaluationPreviewSection title={`Asistencia · ${state.attendance_date}`}><p>Estudiantes: {selectedStudents.students.length}\n{Object.entries(state.attendance).map(([id, value]) => `${selectedStudents.students.find((student) => student.id === id)?.full_name ?? id}: ${ATTENDANCE_LABELS[value]}`).join("\n")}</p></EvaluationPreviewSection>
          <EvaluationPreviewSection title="Conclusiones CNEB"><p>En proceso: {state.in_progress_conclusions || "Pendiente"}\n\nLogro esperado o destacado: {state.achieved_conclusions || "Pendiente"}</p></EvaluationPreviewSection>
        </div>
      ) : null}
    </EvaluationWizard>
  );
}

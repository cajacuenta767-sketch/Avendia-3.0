import { History, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { StudentSelector, type StudentSelection, type StudentSelectorMode } from "../../../components/students/StudentSelector";
import { EducationFrameFields } from "../source-documents/EducationFrameFields";
import { educationFrameFromProfile } from "../source-documents/educationFrameProfile";
import { EvaluationPreviewSection, EvaluationWizard, type EvaluationWizardStep } from "../source-documents/EvaluationWizard";
import { getEvaluationDraft, listEvaluationInstruments } from "../source-documents/evaluationApi";
import type { EvaluationDraftPayload, EvaluationInstrument } from "../source-documents/evaluationContracts";
import { useEvaluationInstrument } from "../source-documents/useEvaluationInstrument";
import { useSelectedStudentNames } from "../source-documents/useSelectedStudentNames";
import type { ObservationMode, ObservationToolState } from "./observationTypes";
import "../source-documents/evaluationWizard.css";
import "./ObservationTool.css";

const STEPS: EvaluationWizardStep[] = [
  { id: "frame", label: "Encuadre y foco", description: "Elige a quién observarás y define cuándo, dónde y para qué." },
  { id: "criteria", label: "Criterios y escala", description: "Redacta conductas observables y la escala de registro." },
  { id: "records", label: "Registro anecdótico", description: "Distingue hechos comunes de las notas individuales." },
  { id: "analysis", label: "Interpretación y pautas", description: "Analiza el contexto y acuerda acciones de seguimiento." },
  { id: "preview", label: "Vista e historial", description: "Revisa el registro y consulta observaciones anteriores." },
];

const MODE_MAP: Record<ObservationMode, StudentSelectorMode> = {
  individual: "single",
  multiple: "multiple",
  team: "group",
  classroom: "classroom",
};

function today() {
  return new Date().toISOString().slice(0, 10);
}

function initialState(): ObservationToolState {
  return {
    frame: educationFrameFromProfile(),
    mode: "individual",
    selection: null,
    observed_date: today(),
    observed_time: "09:00",
    situation: "",
    focus: "",
    scale_type: "Descriptiva",
    criteria: [{ client_key: crypto.randomUUID(), title: "" }],
    common_notes: "",
    individual_notes: {},
    context_factors: "",
    interpretation: "",
    conclusion: "",
    commitments: "",
  };
}

function observedAt(state: ObservationToolState) {
  const timestamp = new Date(`${state.observed_date || today()}T${state.observed_time || "00:00"}:00`);
  return Number.isNaN(timestamp.getTime()) ? new Date().toISOString() : timestamp.toISOString();
}

export function ObservationTool({ instrumentId, onInstrumentIdChange }: { instrumentId?: string; onInstrumentIdChange?: (id: string) => void }) {
  const [state, setState] = useState<ObservationToolState>(initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [historyResult, setHistoryResult] = useState<{ rosterId: string; items: EvaluationInstrument[] }>({ rosterId: "", items: [] });
  const onLoaded = useCallback((instrument: EvaluationInstrument) => {
    const data = instrument.general_data as Partial<ObservationToolState> | undefined;
    if (!data) return;
    setState((current) => ({ ...current, ...data, frame: { ...current.frame, ...(data.frame ?? {}) } }));
    if (instrument.status === "generated") setCurrentStep(4);
  }, []);
  const draft = useEvaluationInstrument({ instrumentId, onLoaded, onInstrumentIdChange });
  const selectedStudents = useSelectedStudentNames(state.selection);
  const selectedIdsKey = state.selection?.studentIds.join("|") ?? "";
  const selectedRosterId = state.selection?.rosterId ?? "";

  useEffect(() => {
    if (!selectedRosterId) return;
    const controller = new AbortController();
    void listEvaluationInstruments("observation", { rosterId: selectedRosterId, signal: controller.signal })
      .then(async (items) => Promise.all(items.slice(0, 20).map(async (item) => {
        if (item.participants?.length) return item;
        try { return await getEvaluationDraft(item.id, controller.signal); }
        catch { return item; }
      })))
      .then((items) => {
        const selectedIds = new Set(selectedIdsKey.split("|").filter(Boolean));
        setHistoryResult({ rosterId: selectedRosterId, items: items.filter((item) => !selectedIds.size || (item.participants ?? []).some((participant) => selectedIds.has(participant.student_id))).slice(0, 5) });
      })
      .catch(() => setHistoryResult({ rosterId: selectedRosterId, items: [] }));
    return () => controller.abort();
  }, [selectedIdsKey, selectedRosterId]);

  const history = historyResult.rosterId === selectedRosterId ? historyResult.items : [];

  function update<Key extends keyof ObservationToolState>(key: Key, value: ObservationToolState[Key]) {
    setState((current) => ({ ...current, [key]: value }));
    setValidationError("");
  }

  function handleSelection(selection: StudentSelection | null) {
    setState((current) => ({ ...current, selection, individual_notes: selection
      ? Object.fromEntries(selection.studentIds.map((id) => [id, current.individual_notes[id] ?? ""]))
      : {} }));
  }

  const payload = useMemo<EvaluationDraftPayload>(() => ({
    kind: "observation",
    status: "draft",
    title: `Ficha de observación · ${state.focus.trim() || state.observed_date}`,
    roster_id: state.selection?.rosterId,
    general_data: state,
    settings: { mode: state.mode, scale_type: state.scale_type },
    participants: (state.selection?.studentIds ?? []).map((studentId, index) => ({
      student_id: studentId,
      role: state.mode === "team" ? "team_member" : "student",
      team_name: state.mode === "team" ? state.selection?.groupName ?? null : null,
      sort_order: index,
      common_notes: state.common_notes || null,
      individual_notes: state.individual_notes[studentId] || null,
    })),
    criteria: state.criteria.filter((item) => item.title.trim()).map((item, index) => ({
      client_key: item.client_key,
      code: `C${index + 1}`,
      title: item.title,
      sort_order: index,
    })),
    observations: [
      ...(state.common_notes.trim() ? [{
        student_id: null,
        observed_at: observedAt(state),
        situation: state.situation,
        focus: state.focus,
        objective_facts: state.common_notes,
        context_factors: state.context_factors || null,
        interpretation: state.interpretation || null,
        conclusion: state.conclusion || null,
        commitments: state.commitments || null,
        common_to_group: true,
      }] : []),
      ...(state.selection?.studentIds ?? []).filter((id) => state.individual_notes[id]?.trim()).map((studentId) => ({
        student_id: studentId,
        observed_at: observedAt(state),
        situation: state.situation,
        focus: state.focus,
        objective_facts: state.individual_notes[studentId],
        context_factors: state.context_factors || null,
        interpretation: state.interpretation || null,
        conclusion: state.conclusion || null,
        commitments: state.commitments || null,
        common_to_group: false,
      })),
    ],
  }), [state]);

  function missingAt(step: number) {
    if (step === 0 && (!state.selection?.studentIds.length || !state.situation.trim() || !state.focus.trim())) return "Selecciona estudiantes y completa la situación y el foco de observación.";
    if (step === 1 && !state.criteria.some((item) => item.title.trim())) return "Añade al menos un criterio observable.";
    if (step === 2 && !state.common_notes.trim() && !Object.values(state.individual_notes).some((item) => item.trim())) return "Registra al menos un hecho objetivo común o individual.";
    if (step === 3 && (!state.interpretation.trim() || !state.conclusion.trim() || !state.commitments.trim())) return "Completa la interpretación pedagógica, la conclusión y los compromisos de seguimiento.";
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

  async function save(finalize = false) {
    if (finalize) {
      const invalid = [0, 1, 2, 3].find((step) => missingAt(step));
      if (invalid !== undefined) { setCurrentStep(invalid); setValidationError(missingAt(invalid)); return; }
    }
    try { await draft.persist({ ...payload, status: finalize ? "generated" : "draft" }); } catch { /* El hook muestra el error. */ }
  }

  return (
    <EvaluationWizard
      eyebrow="Evaluamos · Evidencia de campo"
      title="Ficha de observación"
      description="Registra hechos objetivos de uno o varios estudiantes y conserva su historial de seguimiento."
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
              <span>Modo de observación</span>
              <select value={state.mode} onChange={(event) => { update("mode", event.target.value as ObservationMode); handleSelection(null); }}>
                <option value="individual">Individual</option>
                <option value="multiple">Varios estudiantes</option>
                <option value="team">Equipo</option>
                <option value="classroom">Aula completa</option>
              </select>
            </label>
            <label>
              <span>Fecha</span>
              <input type="date" value={state.observed_date} onChange={(event) => update("observed_date", event.target.value)} />
            </label>
            <label>
              <span>Hora</span>
              <input type="time" value={state.observed_time} onChange={(event) => update("observed_time", event.target.value)} />
            </label>
            <label>
              <span>Situación observada</span>
              <input value={state.situation} onChange={(event) => update("situation", event.target.value)} placeholder="Ej. Trabajo cooperativo durante la resolución de un reto" />
            </label>
            <label className="evaluation-field--wide">
              <span>Foco de observación</span>
              <textarea value={state.focus} onChange={(event) => update("focus", event.target.value)} placeholder="Ej. Explica su estrategia, escucha propuestas y justifica acuerdos con evidencias." />
            </label>
          </div>
          <StudentSelector
            key={state.mode}
            mode={MODE_MAP[state.mode]}
            value={state.selection}
            onChange={handleSelection}
            label={state.mode === "team" ? "Integrantes del equipo" : "Estudiantes observados"}
            description={state.mode === "team" ? "Nombra el equipo y selecciona todos sus integrantes en una sola acción." : undefined}
            manageStudentsHref="/dashboard/mis-estudiantes"
            required
          />
        </div>
      ) : null}

      {currentStep === 1 ? (
        <div className="evaluation-stack">
          <label className="evaluation-field">
            <span>Escala cualitativa</span>
            <select value={state.scale_type} onChange={(event) => update("scale_type", event.target.value as ObservationToolState["scale_type"])}>
              <option>Descriptiva</option><option>AD/A/B/C</option><option>Frecuencia</option>
            </select>
          </label>
          <section className="observation-criteria" aria-label="Criterios observables">
            {state.criteria.map((criterion, index) => (
              <div key={criterion.client_key}>
                <span>C{index + 1}</span>
                <input value={criterion.title} onChange={(event) => update("criteria", state.criteria.map((item) => item.client_key === criterion.client_key ? { ...item, title: event.target.value } : item))} placeholder="Ej. Sustenta su propuesta con una evidencia observable." />
                <button type="button" aria-label={`Eliminar criterio ${index + 1}`} onClick={() => update("criteria", state.criteria.filter((item) => item.client_key !== criterion.client_key))} disabled={state.criteria.length === 1}><Trash2 aria-hidden="true" /></button>
              </div>
            ))}
            <button className="evaluation-button evaluation-button--secondary" type="button" onClick={() => update("criteria", [...state.criteria, { client_key: crypto.randomUUID(), title: "" }])}><Plus aria-hidden="true" /> Añadir criterio</button>
          </section>
        </div>
      ) : null}

      {currentStep === 2 ? (
        <div className="evaluation-stack">
          <label className="evaluation-field">
            <span>Hechos objetivos comunes</span>
            <textarea aria-label="Hechos objetivos comunes" value={state.common_notes} onChange={(event) => update("common_notes", event.target.value)} placeholder="Ej. El equipo comparó dos estrategias, pidió turnos para intervenir y verificó el resultado antes de responder." />
            <small>Describe lo que viste u oíste, sin interpretar todavía.</small>
          </label>
          <section className="observation-individual">
            <h3>Registros individuales</h3>
            <p>Estas notas quedan vinculadas a cada estudiante además del registro común.</p>
            {selectedStudents.loading ? <p role="status">Cargando nombres…</p> : selectedStudents.students.map((student) => (
              <label key={student.id}>
                <span>{student.full_name}</span>
                <textarea value={state.individual_notes[student.id] ?? ""} onChange={(event) => update("individual_notes", { ...state.individual_notes, [student.id]: event.target.value })} placeholder="Ej. Explicó su procedimiento y reformuló la idea al recibir una pregunta de apoyo." />
              </label>
            ))}
          </section>
        </div>
      ) : null}

      {currentStep === 3 ? (
        <div className="evaluation-form-grid">
          <label className="evaluation-field--wide"><span>Factores de contexto</span><textarea value={state.context_factors} onChange={(event) => update("context_factors", event.target.value)} placeholder="Ej. El grupo ya había practicado roles y contó con material visual de apoyo." /></label>
          <label className="evaluation-field--wide"><span>Interpretación pedagógica</span><textarea value={state.interpretation} onChange={(event) => update("interpretation", event.target.value)} placeholder="Ej. La explicación mejora cuando dispone de una pauta para ordenar evidencias." /></label>
          <label className="evaluation-field--wide"><span>Conclusión</span><textarea value={state.conclusion} onChange={(event) => update("conclusion", event.target.value)} placeholder="Ej. Avanza en comunicación de estrategias y requiere afianzar la justificación." /></label>
          <label className="evaluation-field--wide"><span>Compromisos y siguientes acciones</span><textarea value={state.commitments} onChange={(event) => update("commitments", event.target.value)} placeholder="Ej. Usar una lista breve de preguntas guía y revisar el progreso en la próxima sesión." /></label>
        </div>
      ) : null}

      {currentStep === 4 ? (
        <div className="evaluation-preview observation-preview">
          <EvaluationPreviewSection title="Encuadre"><p>{state.observed_date} · {state.observed_time} · {state.situation}\n\nFoco: {state.focus}</p></EvaluationPreviewSection>
          <EvaluationPreviewSection title="Estudiantes y criterios">
            <ul className="evaluation-chip-list">{selectedStudents.students.map((student) => <li key={student.id}>{student.full_name}</li>)}</ul>
            <p>{state.criteria.filter((item) => item.title.trim()).map((item, index) => `C${index + 1}. ${item.title}`).join("\n")}</p>
          </EvaluationPreviewSection>
          <EvaluationPreviewSection title="Registro y seguimiento"><p>{state.common_notes}\n\nInterpretación: {state.interpretation || "Pendiente"}\nConclusión: {state.conclusion || "Pendiente"}\nCompromisos: {state.commitments || "Pendiente"}</p></EvaluationPreviewSection>
          <section className="observation-history">
            <h3><History aria-hidden="true" /> Historial del aula y estudiantes elegidos</h3>
            {history.length ? history.map((item) => <article key={item.id}><strong>{item.title}</strong><span>{item.updated_at ? new Date(item.updated_at).toLocaleDateString("es-PE") : "Sin fecha"} · {item.status ?? "borrador"}</span></article>) : <p>No hay observaciones anteriores para esta selección.</p>}
          </section>
        </div>
      ) : null}
    </EvaluationWizard>
  );
}

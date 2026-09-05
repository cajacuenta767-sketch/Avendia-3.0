import { Sparkles } from "lucide-react";

import type { Student } from "../../rosters/rosterTypes";
import type {
  RubricCriterion,
  RubricCriterionRating,
  RubricLevel,
  RubricStudentAssessment,
} from "./rubricTypes";
import { reconcileRubricAssessments } from "./rubricState";

type Props = {
  students: Student[];
  criteria: RubricCriterion[];
  levels: RubricLevel[];
  assessments: RubricStudentAssessment[];
  activeStudentId: string;
  onActiveStudentChange: (studentId: string) => void;
  onChange: (assessments: RubricStudentAssessment[]) => void;
  onSuggest: (student: Student, criterion: RubricCriterion, rating: RubricCriterionRating, evidence: string) => void;
};

export function RubricAssessment({ students, criteria, levels, assessments, activeStudentId, onActiveStudentChange, onChange, onSuggest }: Props) {
  const rows = reconcileRubricAssessments(students, criteria, assessments);
  const activeStudent = students.find((student) => student.id === activeStudentId) ?? students[0];
  const activeAssessment = rows.find((assessment) => assessment.studentId === activeStudent?.id);

  function updateAssessment(patch: Partial<RubricStudentAssessment>) {
    if (!activeAssessment) return;
    onChange(rows.map((assessment) => assessment.studentId === activeAssessment.studentId ? { ...assessment, ...patch } : assessment));
  }

  function updateRating(criterionId: string, patch: Partial<RubricCriterionRating>) {
    if (!activeAssessment) return;
    updateAssessment({ ratings: { ...activeAssessment.ratings, [criterionId]: { ...activeAssessment.ratings[criterionId], ...patch } } });
  }

  if (!activeStudent || !activeAssessment) return <div className="evaluation-empty">Selecciona estudiantes para registrar la rúbrica.</div>;

  return (
    <div className="rubric-assessment">
      <nav aria-label="Estudiante que se está calificando">
        {students.map((student) => <button type="button" className={student.id === activeStudent.id ? "is-active" : ""} aria-current={student.id === activeStudent.id ? "true" : undefined} onClick={() => onActiveStudentChange(student.id)} key={student.id}><span>{student.full_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("")}</span><strong>{student.full_name}</strong></button>)}
      </nav>
      <section className="rubric-assessment__student">
        <header><div><span>Evaluación individual</span><h3>{activeStudent.full_name}</h3></div><strong>{students.indexOf(activeStudent) + 1} de {students.length}</strong></header>
        <label className="rubric-evidence"><span>Evidencia o producción del estudiante</span><textarea rows={4} value={activeAssessment.evidence} onChange={(event) => updateAssessment({ evidence: event.target.value })} placeholder="Ej. En su exposición explicó el procedimiento y usó dos datos; todavía debe justificar la conclusión." /></label>
        <div className="rubric-assessment__criteria">
          {criteria.map((criterion) => {
            const rating = activeAssessment.ratings[criterion.id];
            return (
              <article key={criterion.id}>
                <header><span>{criterion.code}</span><div><h4>{criterion.title || "Criterio sin título"}</h4><p>{criterion.description}</p></div></header>
                <label><span>Nivel alcanzado</span><select value={rating.levelId} onChange={(event) => updateRating(criterion.id, { levelId: event.target.value })}><option value="">Selecciona el nivel</option>{levels.map((level) => <option value={level.id} key={level.id}>{level.code} · {level.label}</option>)}</select></label>
                <div className="rubric-assessment__feedback-grid">
                  <label><span>Fortaleza demostrada</span><textarea rows={3} value={rating.strength} onChange={(event) => updateRating(criterion.id, { strength: event.target.value })} placeholder="Ej. Organiza los datos antes de responder." /></label>
                  <label><span>Aspecto por mejorar</span><textarea rows={3} value={rating.improvement} onChange={(event) => updateRating(criterion.id, { improvement: event.target.value })} placeholder="Ej. Explicar por qué la evidencia respalda su conclusión." /></label>
                  <div className="rubric-recommendation">
                    <div><label htmlFor={`rubric-recommendation-${activeStudent.id}-${criterion.id}`}>Recomendación para escalar su aprendizaje</label><button type="button" aria-label={`Sugerir con IA para ${criterion.code}`} onClick={() => onSuggest(activeStudent, criterion, rating, activeAssessment.evidence)}><Sparkles /> Sugerir con IA</button></div>
                    <textarea id={`rubric-recommendation-${activeStudent.id}-${criterion.id}`} rows={4} value={rating.recommendation} onChange={(event) => updateRating(criterion.id, { recommendation: event.target.value })} placeholder="Ej. En tu próxima respuesta, subraya el dato clave y escribe una oración que explique cómo sustenta tu conclusión." />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
        <label className="rubric-teacher-decision"><span>Decisión final del docente</span><textarea rows={4} value={activeAssessment.teacherDecision} onChange={(event) => updateAssessment({ teacherDecision: event.target.value })} placeholder="Registra la decisión final, acuerdos o seguimiento. Esta decisión no la toma la IA." /></label>
      </section>
    </div>
  );
}

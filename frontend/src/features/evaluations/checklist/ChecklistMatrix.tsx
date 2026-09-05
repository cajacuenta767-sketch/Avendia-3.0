import type { Student } from "../../rosters/rosterTypes";
import type {
  ChecklistCriterion,
  ChecklistResponse,
  ChecklistResponseScale,
  ChecklistStudentRecord,
} from "./checklistTypes";
import { reconcileChecklistRecords } from "./checklistState";

type Props = {
  students: Student[];
  criteria: ChecklistCriterion[];
  records: ChecklistStudentRecord[];
  responseScale: ChecklistResponseScale;
  onChange: (records: ChecklistStudentRecord[]) => void;
  readonly?: boolean;
};

const RESPONSE_LABELS: Record<ChecklistResponse, string> = {
  yes: "Sí",
  no: "No",
  in_progress: "En proceso",
};

function options(scale: ChecklistResponseScale): ChecklistResponse[] {
  return scale === "yes_no_progress" ? ["yes", "no", "in_progress"] : ["yes", "no"];
}

export function ChecklistMatrix({ students, criteria, records, responseScale, onChange, readonly = false }: Props) {
  const rows = reconcileChecklistRecords(students, criteria, records);

  function updateResponse(studentId: string, criterionId: string, value: ChecklistResponse) {
    onChange(rows.map((record) => record.studentId === studentId
      ? { ...record, responses: { ...record.responses, [criterionId]: value } }
      : record));
  }

  function updateObservation(studentId: string, observation: string) {
    onChange(rows.map((record) => record.studentId === studentId ? { ...record, observation } : record));
  }

  if (!students.length) {
    return <div className="evaluation-empty">Selecciona al menos un estudiante para construir la matriz.</div>;
  }

  return (
    <div className="checklist-matrix-scroll" tabIndex={0} role="region" aria-label="Matriz de lista de cotejo">
      <table className="checklist-matrix">
        <caption className="sr-only">Registro de respuestas por estudiante y criterio</caption>
        <thead>
          <tr>
            <th scope="col">Estudiante</th>
            {criteria.map((criterion) => (
              <th scope="col" key={criterion.id} title={criterion.description}>
                <span>{criterion.code}</span>
                <small>{criterion.description || "Criterio pendiente"}</small>
              </th>
            ))}
            <th scope="col">Observación</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const record = rows.find((item) => item.studentId === student.id)!;
            return (
              <tr key={student.id}>
                <th scope="row"><strong>{student.full_name}</strong>{student.internal_code ? <small>{student.internal_code}</small> : null}</th>
                {criteria.map((criterion) => (
                  <td key={criterion.id}>
                    {readonly ? (
                      <strong className={`checklist-result checklist-result--${record.responses[criterion.id] || "empty"}`}>
                        {record.responses[criterion.id] ? RESPONSE_LABELS[record.responses[criterion.id] as ChecklistResponse] : "Sin marcar"}
                      </strong>
                    ) : (
                      <div className="checklist-response" role="radiogroup" aria-label={`${student.full_name}, ${criterion.code}`}>
                        {options(responseScale).map((option) => (
                          <label key={option}>
                            <input
                              type="radio"
                              name={`checklist-${student.id}-${criterion.id}`}
                              value={option}
                              checked={record.responses[criterion.id] === option}
                              onChange={() => updateResponse(student.id, criterion.id, option)}
                            />
                            <span>{RESPONSE_LABELS[option]}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </td>
                ))}
                <td>
                  {readonly ? <span>{record.observation || "Sin observación"}</span> : (
                    <textarea
                      rows={2}
                      value={record.observation}
                      onChange={(event) => updateObservation(student.id, event.target.value)}
                      aria-label={`Observación de ${student.full_name}`}
                      placeholder="Ej. Requiere apoyo para explicar su estrategia."
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

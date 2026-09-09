import type { ReactNode } from "react";

import { isPlaceholder, sameTitle, splitLabel, splitNarrative } from "./documentFormat";
import type { WorkflowArtifactTable } from "./exportWorkflowDocx";

/** Punto clave con la etiqueta "Etiqueta: contenido" resaltada. */
export function KeyPointText({ text }: { text: string }) {
  const { label, body } = splitLabel(text);
  if (!label) return <>{body}</>;
  return (
    <>
      <strong className="word-label">{label}:</strong> {body}
    </>
  );
}

export function KeyPointList({ items, className = "word-list" }: { items: string[]; className?: string }) {
  const visible = items.map((item) => String(item ?? "").trim()).filter(Boolean);
  if (!visible.length) return null;
  return (
    <ul className={className}>
      {visible.map((item, index) => (
        <li key={`${index}-${item.slice(0, 24)}`}>
          <KeyPointText text={item} />
        </li>
      ))}
    </ul>
  );
}

/** Párrafos reales y viñetas reales a partir de un texto narrativo. */
export function Narrative({ text, className = "word-paper-p" }: { text: string; className?: string }) {
  const blocks = splitNarrative(text);
  if (!blocks.length) return null;
  const output: ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      output.push(<KeyPointList key={`list-${output.length}`} items={bullets} />);
      bullets = [];
    }
  };
  blocks.forEach((block, index) => {
    if (block.bullet) {
      bullets.push(block.text);
      return;
    }
    flush();
    output.push(<p key={`p-${index}`} className={className}>{block.text}</p>);
  });
  flush();
  return <>{output}</>;
}

type PreviewTable = { table: WorkflowArtifactTable; index: number };

export function PreviewTables({
  tables,
  sectionTitle,
  editingResult = false,
  onUpdateTableCell,
}: {
  tables: PreviewTable[];
  sectionTitle?: string;
  editingResult?: boolean;
  onUpdateTableCell?: (tableIndex: number, rowIndex: number, cellIndex: number, value: string) => void;
}) {
  if (!tables.length) return null;
  return (
    <>
      {tables.map(({ table, index: tableIndex }) => (
        <div className="generated-artifact-table" key={`${table.title}-${tableIndex}`}>
          {sectionTitle && sameTitle(table.title, sectionTitle) ? null : (
            <h3 className="word-section-h2">{table.title}</h3>
          )}
          <div className="word-table-responsive">
            <table className="word-table word-table--generated">
              <thead>
                <tr>{table.columns.map((column) => <th key={column}>{column}</th>)}</tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIndex) => (
                  <tr key={`${table.title}-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${rowIndex}-${cellIndex}`} className={cellIndex === 0 && String(cell).length <= 40 ? "word-table-cell-bold" : undefined}>
                        {editingResult && onUpdateTableCell ? (
                          <textarea
                            aria-label={`${table.title}, fila ${rowIndex + 1}, ${table.columns[cellIndex]}`}
                            rows={3}
                            value={cell}
                            onChange={(event) => onUpdateTableCell(tableIndex, rowIndex, cellIndex, event.target.value)}
                          />
                        ) : cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {table.note ? <p className="generated-artifact-table__note">{table.note}</p> : null}
        </div>
      ))}
    </>
  );
}

/** Tabla de datos informativos que omite los campos no aportados. */
export function InfoTable({ rows, fallback }: { rows: Array<[string, string]>; fallback?: Array<[string, string]> }) {
  const provided = rows.filter(([, value]) => !isPlaceholder(value) && !/^_+$/.test(value.trim()) && !/no registrado/i.test(value));
  const visible = provided.length ? provided : (fallback ?? []);
  if (!visible.length) return null;
  return (
    <div className="word-table-responsive">
      <table className="word-table word-table--info">
        <tbody>
          {visible.map(([label, value]) => (
            <tr key={label}>
              <td className="word-table-cell-bold" style={{ width: "35%" }}>{label}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SignatureBox({ people }: { people: Array<{ name: string; role: string }> }) {
  return (
    <div className="word-signatures-box">
      {people.map((person, index) => (
        <div key={`${person.role}-${index}`}>
          <div className="word-signature-line">____________________________________________</div>
          <div className="word-signature-name">{isPlaceholder(person.name) || /^_+$/.test(person.name) ? " " : person.name}</div>
          <div className="word-signature-role">{person.role}</div>
        </div>
      ))}
    </div>
  );
}

// ==========================================================================
// Reactivos, puntaje y riesgo
// ==========================================================================
import { formatPoints, QUESTION_FORMAT_LABELS, scoreToVigesimal, type DocumentQuestion, type RiskAssessment, type RubricScoring } from "./documentFormat";

function AnswerLines({ count }: { count: number }) {
  return (
    <div className="word-answer-lines">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="word-answer-line">{index === 0 ? "Respuesta:" : ""}</div>
      ))}
    </div>
  );
}

function ResponseSpace({ format }: { format: DocumentQuestion["format"] }) {
  if (format === "desarrollo") return <AnswerLines count={5} />;
  if (format === "respuesta_corta" || format === "texto_breve" || format === "generica") return <AnswerLines count={2} />;
  if (format === "tabla") {
    return (
      <table className="word-table word-response-table">
        <tbody>
          {[0, 1, 2].map((row) => (
            <tr key={row}>{[0, 1, 2].map((cell) => <td key={cell}>&nbsp;</td>)}</tr>
          ))}
        </tbody>
      </table>
    );
  }
  if (format === "dibujo" || format === "operacion") {
    return <div className="word-response-box" aria-label={format === "dibujo" ? "Espacio para el dibujo" : "Espacio para la resolución"} />;
  }
  return null;
}

/** Reactivo listo para el estudiante: enunciado, formato y espacio de respuesta. */
export function QuestionBlock({ question, showLevel = false }: { question: DocumentQuestion; showLevel?: boolean }) {
  const points = formatPoints(question.points);
  return (
    <div className="word-question">
      <p className="word-question__prompt">
        <span className="word-question__number">{question.number}.</span> {question.prompt}
        <span className="word-question__format">{QUESTION_FORMAT_LABELS[question.format]}{showLevel && question.cognitive_level ? ` · ${question.cognitive_level}` : ""}{points ? ` · ${points}` : ""}</span>
      </p>
      {question.format === "opcion_multiple" && question.options.length ? (
        <div className="word-question__options">
          {question.options.map((option) => <div key={option}>[&nbsp;&nbsp;] {option}</div>)}
        </div>
      ) : null}
      {question.format === "verdadero_falso" ? (
        <div className="word-question__options word-question__options--vf">
          <div>[&nbsp;&nbsp;] Verdadero</div>
          <div>[&nbsp;&nbsp;] Falso</div>
        </div>
      ) : null}
      {question.format === "relacionar" && question.left_column.length ? (
        <table className="word-table">
          <thead>
            <tr><th>Columna A</th><th className="word-table-cell-center">Respuesta</th><th>Columna B</th></tr>
          </thead>
          <tbody>
            {Array.from({ length: Math.max(question.left_column.length, question.right_column.length) }, (_, index) => (
              <tr key={index}>
                <td>{question.left_column[index] ?? ""}</td>
                <td className="word-table-cell-center">____</td>
                <td>{question.right_column[index] ?? ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
      {question.format !== "opcion_multiple" && question.format !== "verdadero_falso" && question.format !== "relacionar" ? (
        <ResponseSpace format={question.format} />
      ) : null}
    </div>
  );
}

/** Clave docente en tabla: número, respuesta esperada y puntaje. */
export function AnswerKeyTable({ questions }: { questions: DocumentQuestion[] }) {
  const withAnswers = questions.filter((question) => question.answer || question.justification);
  if (!withAnswers.length) return null;
  const hasPoints = withAnswers.some((question) => question.points != null);
  const hasJustification = withAnswers.some((question) => question.justification);
  return (
    <div className="word-table-responsive">
      <table className="word-table word-table--generated">
        <thead>
          <tr>
            <th className="word-table-cell-center">N°</th>
            <th>Respuesta esperada</th>
            {hasJustification ? <th>Justificación</th> : null}
            {hasPoints ? <th className="word-table-cell-center">Puntaje</th> : null}
          </tr>
        </thead>
        <tbody>
          {withAnswers.map((question) => (
            <tr key={question.number}>
              <td className="word-table-cell-center word-table-cell-bold">{question.number}</td>
              <td>{question.answer}</td>
              {hasJustification ? <td>{question.justification}</td> : null}
              {hasPoints ? <td className="word-table-cell-center">{formatPoints(question.points)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Registro de puntaje derivado de la matriz de la rúbrica o escala. */
export function ScoringTable({ scoring }: { scoring: RubricScoring }) {
  return (
    <div className="word-scoring">
      <h3 className="word-section-h2">Registro de puntaje</h3>
      <p className="word-paper-p word-scoring__legend">
        {scoring.levels.map((level, index) => `${level} = ${scoring.pointsPerLevel[index]} ${scoring.pointsPerLevel[index] === 1 ? "punto" : "puntos"}`).join(" · ")}
      </p>
      <div className="word-table-responsive">
        <table className="word-table word-table--generated">
          <thead>
            <tr>
              <th>Criterio</th>
              <th className="word-table-cell-center">Nivel alcanzado</th>
              <th className="word-table-cell-center">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {scoring.criteria.map((criterion) => (
              <tr key={criterion}>
                <td className="word-table-cell-bold">{criterion}</td>
                <td className="word-table-cell-center">________</td>
                <td className="word-table-cell-center">____ / {scoring.maxPerCriterion}</td>
              </tr>
            ))}
            <tr>
              <td className="word-table-cell-bold">Total</td>
              <td className="word-table-cell-center">Nota vigesimal: ____ / 20</td>
              <td className="word-table-cell-center word-table-cell-bold">____ / {scoring.total}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="generated-artifact-table__note">
        Conversión: nota = puntos obtenidos × 20 ÷ {scoring.total}. Por ejemplo, {Math.ceil(scoring.total * 0.75)} puntos equivalen a {scoreToVigesimal(Math.ceil(scoring.total * 0.75), scoring.total)}.
      </p>
    </div>
  );
}

export function RiskBadge({ assessment }: { assessment: RiskAssessment }) {
  return <span className={`word-status-badge word-status-badge--${assessment.level}`}>{assessment.label}</span>;
}

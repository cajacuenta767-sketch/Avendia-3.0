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

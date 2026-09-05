import { useState } from "react";
import { Download, FileText, LayoutGrid, Printer } from "lucide-react";

import type { WorkflowArtifact } from "./exportWorkflowDocx";
import "../../styles/word-preview.css";

type Props = {
  artifact: WorkflowArtifact;
  values: Record<string, unknown>;
  onDownloadWord?: () => void;
  editingResult?: boolean;
  onUpdateSection?: (index: number, key: "title" | "narrative", value: string) => void;
  onUpdateTableCell?: (tableIndex: number, rowIndex: number, cellIndex: number, value: string) => void;
};

function display(value: unknown) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  return String(value ?? "").trim() || "No registrado";
}

export function PlanAnualDocumentPreview({
  artifact, values, onDownloadWord, editingResult = false, onUpdateSection, onUpdateTableCell,
}: Props) {
  const [viewMode, setViewMode] = useState<"word" | "grid">("word");
  const year = display(values.school_year);
  const institution = display(values.institution);
  const area = display(values.curricular_areas ?? values.curricular_area);
  const information: Array<[string, string]> = [
    ["DRE", display(values.dre)], ["UGEL", display(values.ugel)], ["Institución educativa", institution],
    ["Modelo de servicio educativo", display(values.service_model)], ["Modalidad", display(values.modality)],
    ["Nivel académico", display(values.level)], ["Planificación por", display(values.planning_scope)],
    ["Grado o ciclo", display(values.grade)], ["Secciones", display(values.sections ?? values.section)],
    ["Periodo de ejecución", display(values.execution_period)], ["Año lectivo", year], ["Áreas curriculares", area],
    ["Docente responsable", display(values.teacher_name)], ["Director(a)", display(values.director_name)],
    ["Subdirector(a)", display(values.subdirector_name)], ["Enfoque pedagógico", display(values.pedagogical_approach)],
    ["Tono de redacción", display(values.writing_tone)], ["Enfoque de evaluación", display(values.assessment_approach)],
  ];

  return (
    <div className="word-preview-wrapper">
      <div className="word-preview-toolbar">
        <div className="word-preview-toolbar__status"><FileText size={18} /><span>PCA generado · {artifact.tables?.length ?? 0} matrices verificables</span></div>
        <div className="word-preview-toolbar__actions">
          <button type="button" className={`word-preview-btn-toggle ${viewMode === "word" ? "is-active" : ""}`} onClick={() => setViewMode("word")}><FileText size={15} /><span>Documento</span></button>
          <button type="button" className={`word-preview-btn-toggle ${viewMode === "grid" ? "is-active" : ""}`} onClick={() => setViewMode("grid")}><LayoutGrid size={15} /><span>Secciones</span></button>
          {onDownloadWord ? <button type="button" className="word-preview-btn-toggle" onClick={onDownloadWord}><Download size={15} /><span>Descargar Word</span></button> : null}
          <button type="button" className="word-preview-btn-toggle" onClick={() => window.print()}><Printer size={15} /><span>Imprimir / PDF</span></button>
        </div>
      </div>

      {viewMode === "word" ? (
        <div className="word-preview-viewport">
          <article className="word-document-paper">
            <header className="word-paper-header">
              <h1 className="word-paper-title">{artifact.document_title}</h1>
              <p className="word-paper-subtitle">{institution} · {area} · Año lectivo {year}</p>
            </header>

            <section className="word-section">
              <h2 className="word-section-h1">I. DATOS INFORMATIVOS</h2>
              <div className="word-table-responsive"><table className="word-table"><tbody>{information.map(([label, content]) => <tr key={label}><th>{label}</th><td>{content}</td></tr>)}</tbody></table></div>
            </section>

            <section className="word-section">
              <h2 className="word-section-h1">II. SÍNTESIS DE LA PLANIFICACIÓN</h2>
              <p>{artifact.executive_summary}</p>
              {artifact.sections.map((section, index) => (
                <div key={`${section.title}-${index}`}>
                  {editingResult && onUpdateSection ? <input className="word-inline-title-input" aria-label={`Título de ${section.title}`} value={section.title} onChange={(event) => onUpdateSection(index, "title", event.target.value)} /> : <h3 className="word-section-h2">{index + 1}. {section.title}</h3>}
                  {editingResult && onUpdateSection ? <textarea className="word-inline-editor" rows={6} aria-label={`Contenido de ${section.title}`} value={section.narrative} onChange={(event) => onUpdateSection(index, "narrative", event.target.value)} /> : <p>{section.narrative}</p>}
                  {section.key_points.length ? <ul>{section.key_points.map((point) => <li key={point}>{point}</li>)}</ul> : null}
                </div>
              ))}
            </section>

            <section className="word-section">
              <h2 className="word-section-h1">III. MATRICES ANUALES</h2>
              {(artifact.tables ?? []).length ? artifact.tables?.map((table, tableIndex) => (
                <div className="generated-artifact-table" key={`${table.title}-${tableIndex}`}>
                  <h3 className="word-section-h2">{tableIndex + 1}. {table.title}</h3>
                  <div className="word-table-responsive"><table className="word-table"><thead><tr>{table.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead><tbody>{table.rows.map((row, rowIndex) => <tr key={`${table.title}-${rowIndex}`}>{table.columns.map((column, cellIndex) => <td key={`${column}-${cellIndex}`}>{editingResult && onUpdateTableCell ? <textarea aria-label={`${table.title}, fila ${rowIndex + 1}, ${column}`} value={row[cellIndex] ?? ""} onChange={(event) => onUpdateTableCell(tableIndex, rowIndex, cellIndex, event.target.value)} /> : row[cellIndex]}</td>)}</tr>)}</tbody></table></div>
                  {table.note ? <p className="generated-artifact-table__note">{table.note}</p> : null}
                </div>
              )) : <p>Regenera el PCA para construir sus 17 matrices con los datos actuales.</p>}
            </section>

            <section className="word-section">
              <h2 className="word-section-h1">IV. RECOMENDACIONES PARA LA IMPLEMENTACIÓN</h2>
              <ol>{artifact.teacher_recommendations.map((recommendation) => <li key={recommendation}>{recommendation}</li>)}</ol>
            </section>
          </article>
        </div>
      ) : (
        <div className={`workflow-artifact__grid ${editingResult ? "is-editing" : ""}`}>
          {artifact.sections.map((section, index) => <article key={`${section.title}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><h2>{section.title}</h2><p>{section.narrative}</p><ul>{section.key_points.map((point) => <li key={point}>{point}</li>)}</ul></article>)}
          {(artifact.tables ?? []).map((table, index) => <article key={`${table.title}-${index}`}><span>M{String(index + 1).padStart(2, "0")}</span><h2>{table.title}</h2><p>{table.rows.length} filas · {table.columns.length} columnas</p></article>)}
        </div>
      )}
    </div>
  );
}

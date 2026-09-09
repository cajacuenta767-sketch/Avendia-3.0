import { useState } from "react";
import { Download, FileText, LayoutGrid, Printer } from "lucide-react";

import { isPlaceholder, stripNumbering } from "./documentFormat";
import { DocumentCover, DocumentIndex, InfoTable, KeyPointList, Narrative, PreviewTables, SignatureBox, type IndexEntry } from "./DocumentText";
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

/** Mismo criterio que el exportador: texto limpio o cadena vacía (nunca "No registrado"). */
function value(values: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const raw = values[key];
    const text = (Array.isArray(raw) ? raw.filter(Boolean).join(", ") : String(raw ?? "")).replace(/\*+/g, "").trim();
    if (text && !isPlaceholder(text)) return text;
  }
  return "";
}

export function PlanAnualDocumentPreview({
  artifact, values, onDownloadWord, editingResult = false, onUpdateSection, onUpdateTableCell,
}: Props) {
  const [viewMode, setViewMode] = useState<"word" | "grid">("word");
  const year = value(values, "school_year");
  const institution = value(values, "institution");
  const area = value(values, "curricular_areas", "curricular_area");
  const teacher = value(values, "teacher_name");
  const director = value(values, "director_name");
  const tables = artifact.tables ?? [];

  // Mismo orden y mismas filas que el Word (exportPlanAnualDocx.ts).
  const information: Array<[string, string]> = [
    ["DRE", value(values, "dre")], ["UGEL", value(values, "ugel")], ["Institución educativa", institution],
    ["Modelo de servicio educativo", value(values, "service_model")], ["Modalidad", value(values, "modality")],
    ["Nivel académico", value(values, "level")], ["Planificación por", value(values, "planning_scope")],
    ["Grado o ciclo", value(values, "grade")], ["Secciones", value(values, "sections", "section")],
    ["Periodo de ejecución", value(values, "execution_period")], ["Año lectivo", year], ["Áreas curriculares", area],
    ["Docente responsable", teacher], ["Director(a)", director],
    ["Subdirector(a)", value(values, "subdirector_name")], ["Enfoque pedagógico", value(values, "pedagogical_approach")],
    ["Tono de redacción", value(values, "writing_tone")], ["Enfoque de evaluación", value(values, "assessment_approach")],
  ];
  const coverRows: Array<[string, string]> = [
    ["Institución educativa", institution],
    ["DRE / UGEL", [value(values, "dre"), value(values, "ugel")].filter(Boolean).join(" / ")],
    ["Nivel y grado", [value(values, "level"), value(values, "grade")].filter(Boolean).join(" · ")],
    ["Áreas curriculares", area],
    ["Docente responsable", teacher],
    ["Director(a)", director],
    ["Año lectivo", year],
  ];
  const signers = [
    { name: teacher, role: "Docente responsable" },
    { name: director, role: "Director(a)" },
  ].filter((person) => person.name);
  const indexEntries: IndexEntry[] = [
    { label: "I. DATOS INFORMATIVOS" },
    { label: "II. SÍNTESIS DE LA PLANIFICACIÓN" },
    ...artifact.sections.map((section, index) => ({ label: `${index + 1}. ${stripNumbering(section.title)}`, level: 2 as const })),
    { label: "III. MATRICES ANUALES" },
    ...tables.map((table, index) => ({ label: `${index + 1}. ${stripNumbering(table.title)}`, level: 2 as const })),
    { label: "IV. RECOMENDACIONES PARA LA IMPLEMENTACIÓN" },
    ...(signers.length ? [{ label: "V. VALIDACIÓN" }] : []),
  ];
  const headerLine = [institution, area, year ? `Año lectivo ${year}` : ""].filter(Boolean).join(" · ");

  return (
    <div className="word-preview-wrapper">
      <div className="word-preview-toolbar">
        <div className="word-preview-toolbar__status"><FileText size={18} /><span>PCA generado · {tables.length} matrices verificables · hoja horizontal</span></div>
        <div className="word-preview-toolbar__actions">
          <button type="button" className={`word-preview-btn-toggle ${viewMode === "word" ? "is-active" : ""}`} onClick={() => setViewMode("word")}><FileText size={15} /><span>Documento</span></button>
          <button type="button" className={`word-preview-btn-toggle ${viewMode === "grid" ? "is-active" : ""}`} onClick={() => setViewMode("grid")}><LayoutGrid size={15} /><span>Secciones</span></button>
          {onDownloadWord ? <button type="button" className="word-preview-btn-toggle" onClick={onDownloadWord}><Download size={15} /><span>Descargar Word</span></button> : null}
          <button type="button" className="word-preview-btn-toggle" onClick={() => window.print()}><Printer size={15} /><span>Imprimir / PDF</span></button>
        </div>
      </div>

      {viewMode === "word" ? (
        <div className="word-preview-viewport">
          <article className="word-document-paper word-document-paper--landscape">
            <DocumentCover
              institution={institution}
              kindLabel="Plan Curricular Anual"
              title={artifact.document_title}
              rows={coverRows}
              year={year}
            />

            <DocumentIndex entries={indexEntries} />

            <header className="word-paper-header">
              <h1 className="word-paper-title">{artifact.document_title}</h1>
              {headerLine ? <p className="word-paper-subtitle">{headerLine}</p> : null}
            </header>

            <section className="word-section">
              <h2 className="word-section-h1">I. DATOS INFORMATIVOS</h2>
              <InfoTable
                rows={information}
                fallback={[["Institución educativa", "________________"], ["Docente responsable", "________________"], ["Año lectivo", "________"]]}
              />
            </section>

            <section className="word-section">
              <h2 className="word-section-h1">II. SÍNTESIS DE LA PLANIFICACIÓN</h2>
              <Narrative text={artifact.executive_summary} />
              {artifact.sections.map((section, index) => (
                <div key={`${section.title}-${index}`}>
                  {editingResult && onUpdateSection ? <input className="word-inline-title-input" aria-label={`Título de ${section.title}`} value={section.title} onChange={(event) => onUpdateSection(index, "title", event.target.value)} /> : <h3 className="word-section-h2">{index + 1}. {stripNumbering(section.title)}</h3>}
                  {editingResult && onUpdateSection ? <textarea className="word-inline-editor" rows={6} aria-label={`Contenido de ${section.title}`} value={section.narrative} onChange={(event) => onUpdateSection(index, "narrative", event.target.value)} /> : <Narrative text={section.narrative} />}
                  <KeyPointList items={section.key_points} />
                </div>
              ))}
            </section>

            <section className="word-section">
              <h2 className="word-section-h1">III. MATRICES ANUALES</h2>
              {tables.length ? (
                <PreviewTables
                  tables={tables.map((table, index) => ({ table: { ...table, title: `${index + 1}. ${stripNumbering(table.title)}` }, index }))}
                  editingResult={editingResult}
                  onUpdateTableCell={onUpdateTableCell}
                />
              ) : <p className="word-paper-p">Las matrices deben regenerarse antes de descargar la versión final.</p>}
            </section>

            <section className="word-section">
              <h2 className="word-section-h1">IV. RECOMENDACIONES PARA LA IMPLEMENTACIÓN</h2>
              <ol className="word-list">{artifact.teacher_recommendations.map((recommendation, index) => <li key={`${index}-${recommendation.slice(0, 24)}`}>{recommendation}</li>)}</ol>
            </section>

            {signers.length ? (
              <section className="word-section">
                <h2 className="word-section-h1">V. VALIDACIÓN</h2>
                <SignatureBox people={signers} />
              </section>
            ) : null}
          </article>
        </div>
      ) : (
        <div className={`workflow-artifact__grid ${editingResult ? "is-editing" : ""}`}>
          {artifact.sections.map((section, index) => <article key={`${section.title}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><h2>{section.title}</h2><p>{section.narrative}</p><ul>{section.key_points.map((point) => <li key={point}>{point}</li>)}</ul></article>)}
          {tables.map((table, index) => <article key={`${table.title}-${index}`}><span>M{String(index + 1).padStart(2, "0")}</span><h2>{table.title}</h2><p>{table.rows.length} filas · {table.columns.length} columnas</p></article>)}
        </div>
      )}
    </div>
  );
}

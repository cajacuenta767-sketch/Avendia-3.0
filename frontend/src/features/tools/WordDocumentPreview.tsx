import React, { useState } from "react";
import { Download, FileText, LayoutGrid, LoaderCircle, Printer, RefreshCw } from "lucide-react";

import type { WorkflowDefinition } from "../../config/workflows";
import type { WorkflowArtifact } from "./exportWorkflowDocx";
import { HomeworkDocumentPreview } from "./HomeworkDocumentPreview";
import { PlanAnualDocumentPreview } from "./PlanAnualDocumentPreview";
import "../../styles/word-preview.css";

type Props = {
  artifact: WorkflowArtifact;
  artifactType: WorkflowDefinition["artifactType"];
  toolId: string;
  workflowKey?: string;
  values: Record<string, unknown>;
  onDownloadWord?: () => void;
  editingResult?: boolean;
  onUpdateSection?: (index: number, key: "title" | "narrative", value: string) => void;
  onUpdateTableCell?: (tableIndex: number, rowIndex: number, cellIndex: number, value: string) => void;
  onRegenerateSection?: (index: number) => void;
  regeneratingSection?: number | null;
};

function GeneratedArtifactTables({
  artifact,
  heading,
  editingResult = false,
  onUpdateTableCell,
}: {
  artifact: WorkflowArtifact;
  heading: string;
  editingResult?: boolean;
  onUpdateTableCell?: (tableIndex: number, rowIndex: number, cellIndex: number, value: string) => void;
}) {
  const tables = artifact.tables ?? [];
  if (!tables.length) return null;

  return (
    <section className="word-section generated-artifact-tables">
      <h2 className="word-section-h1">{heading}</h2>
      {tables.map((table, tableIndex) => (
        <div className="generated-artifact-table" key={`${table.title}-${tableIndex}`}>
          <h3 className="word-section-h2">{table.title}</h3>
          <div className="word-table-responsive">
            <table className="word-table">
              <thead>
                <tr>{table.columns.map((column) => <th key={column}>{column}</th>)}</tr>
              </thead>
              <tbody>
                {table.rows.map((row, rowIndex) => (
                  <tr key={`${table.title}-${rowIndex}`}>
                    {row.map((cell, cellIndex) => (
                      <td key={`${rowIndex}-${cellIndex}`}>
                        {editingResult && onUpdateTableCell ? (
                          <textarea
                            aria-label={`${table.title}, fila ${rowIndex + 1}, ${table.columns[cellIndex]}`}
                            rows={3}
                            value={cell}
                            onChange={(event) => onUpdateTableCell(
                              tableIndex,
                              rowIndex,
                              cellIndex,
                              event.target.value,
                            )}
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
    </section>
  );
}

export function WordDocumentPreview({
  artifact,
  artifactType,
  toolId,
  workflowKey = "",
  values,
  onDownloadWord,
  editingResult = false,
  onUpdateSection,
  onUpdateTableCell,
  onRegenerateSection,
  regeneratingSection = null,
}: Props) {
  const [viewMode, setViewMode] = useState<"word" | "grid">("word");

  // Plan Curricular Anual usa su vista especializada de 17 tablas
  if (toolId === "plan-curricular-anual" || workflowKey === "planificamos/plan-curricular-anual") {
    return (
      <PlanAnualDocumentPreview
        artifact={artifact}
        values={values}
        onDownloadWord={onDownloadWord}
        editingResult={editingResult}
        onUpdateSection={onUpdateSection}
        onUpdateTableCell={onUpdateTableCell}
      />
    );
  }

  if (toolId === "tarea-extension-hogar" || workflowKey === "planificamos/tarea-extension-hogar") {
    return (
      <HomeworkDocumentPreview
        artifact={artifact}
        values={values}
        onDownloadWord={onDownloadWord}
        editingResult={editingResult}
        onRegenerateSection={onRegenerateSection}
        regeneratingSection={regeneratingSection}
      />
    );
  }

  const year = String(values.school_year || "2026");
  const dre = String(values.dre || "SAN MARTÍN");
  const ugel = String(values.ugel || "LAMAS");
  const ie = String(values.institution || "MARTÍN DE LA RIVA Y HERRERA");
  const level = String(values.level || "Secundaria");
  const grade = String(values.grade || "3° de Secundaria");
  const section = String(values.section || "A");
  const area = String(values.curricular_area || values.area || "Educación Básica");
  const teacher = String(values.teacher_name || "Docente Responsable");
  const director = String(values.director_name || "Director(a) de la I.E.");
  const student = String(values.student_name || "Estudiante");
  const guardian = String(values.guardian_name || values.guardian_names || "Familia / Apoderado");

  const handlePrint = () => {
    window.print();
  };

  // Determinar arquetipo
  const isInstrument = artifactType === "instrumento";
  const isActivity = artifactType === "actividad";
  const isAnalytics = artifactType === "analisis";
  const isCommunication = artifactType === "comunicacion";
  const isResource = artifactType === "recurso";
  const isDocument = !isInstrument && !isActivity && !isAnalytics && !isCommunication && !isResource;

  return (
    <div className="word-preview-wrapper">
      {/* Barra de herramientas */}
      <div className="word-preview-toolbar">
        <div className="word-preview-toolbar__status">
          <FileText size={18} />
          <span>
            Previsualización oficial · {artifact.document_title || "Documento Pedagógico"} ({year})
          </span>
        </div>
        <div className="word-preview-toolbar__actions">
          <button
            type="button"
            className={`word-preview-btn-toggle ${viewMode === "word" ? "is-active" : ""}`}
            onClick={() => setViewMode("word")}
            title="Ver formato oficial tipo hoja de Word"
          >
            <FileText size={15} />
            <span>Vista Hoja Word</span>
          </button>
          <button
            type="button"
            className={`word-preview-btn-toggle ${viewMode === "grid" ? "is-active" : ""}`}
            onClick={() => setViewMode("grid")}
            title="Ver desglose por secciones modulares"
          >
            <LayoutGrid size={15} />
            <span>Vista Modular</span>
          </button>
          {onDownloadWord ? (
            <button
              type="button"
              className="word-preview-btn-toggle"
              onClick={onDownloadWord}
              title="Descargar archivo DOCX editable"
            >
              <Download size={15} />
              <span>Descargar Word</span>
            </button>
          ) : null}
          <button
            type="button"
            className="word-preview-btn-toggle"
            onClick={handlePrint}
            title="Imprimir o guardar como PDF"
          >
            <Printer size={15} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {viewMode === "word" && editingResult && onRegenerateSection ? (
        <div className="word-preview-regeneration" aria-label="Regeneración por sección">
          <strong>Mejora únicamente la parte que necesites</strong>
          <div>
            {artifact.sections.map((sectionItem, index) => (
              <button
                className="workflow-section-regenerate"
                type="button"
                key={`${sectionItem.title}-${index}`}
                disabled={regeneratingSection === index}
                onClick={() => onRegenerateSection(index)}
              >
                {regeneratingSection === index ? <LoaderCircle className="is-spinning" /> : <RefreshCw />}
                {regeneratingSection === index
                  ? `Mejorando ${sectionItem.title}…`
                  : `Regenerar solo esta sección: ${sectionItem.title}`}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* Contenedor del documento */}
      {viewMode === "word" ? (
        <div className="word-preview-viewport">
          <article className="word-document-paper">
            {/* ==================== 1. ARQUETIPO: INSTRUMENTOS ==================== */}
            {isInstrument ? (
              <>
                <header className="word-paper-header">
                  <div className="word-paper-motto">
                    DOCUMENTO PEDAGÓGICO EDITABLE
                  </div>
                  <h1 className="word-paper-title">{artifact.document_title}</h1>
                  <div className="word-paper-subtitle">
                    INSTRUMENTO OFICIAL DE EVALUACIÓN FORMATIVA (CNEB)
                  </div>
                </header>

                {/* Si es examen/prueba, mostramos caja del estudiante */}
                {toolId.includes("examen") || toolId.includes("preguntas") ? (
                  <div className="word-student-exam-header">
                    <div className="word-student-exam-row">
                      <span><strong>I.E.:</strong> {ie}</span>
                      <span><strong>Área:</strong> {area}</span>
                      <span><strong>Grado y Sección:</strong> {grade} "{section}"</span>
                    </div>
                    <div className="word-student-exam-row">
                      <span><strong>Apellidos y Nombres:</strong> __________________________________________________</span>
                      <span><strong>Fecha:</strong> ____ / ____ / {year}</span>
                    </div>
                    <div className="word-student-exam-row" style={{ marginTop: "0.5rem" }}>
                      <span><strong>Docente evaluador:</strong> {teacher}</span>
                      <div className="word-student-score-box">Puntaje: ____ / 20</div>
                    </div>
                  </div>
                ) : (
                  <section className="word-section">
                    <h2 className="word-section-h1">I. DATOS INFORMATIVOS</h2>
                    <div className="word-table-responsive">
                      <table className="word-table">
                        <tbody>
                          <tr>
                            <td className="word-table-cell-bold" style={{ width: "35%" }}>Institución Educativa</td>
                            <td>{ie}</td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">Área Curricular / Grado</td>
                            <td>{area} · {grade} "{section}"</td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">Docente Responsable</td>
                            <td>{teacher}</td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">Propósito de la Evaluación</td>
                            <td>{artifact.executive_summary}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {/* Si es Rúbrica: Matriz Analítica CNEB */}
                {(artifact.tables?.length ?? 0) > 0 ? (
                  <GeneratedArtifactTables artifact={artifact} heading="II. MATRICES DE APLICACIÓN" editingResult={editingResult} onUpdateTableCell={onUpdateTableCell} />
                ) : toolId.includes("rubrica") ? (
                  <section className="word-section">
                    <h2 className="word-section-h1">II. MATRIZ ANALÍTICA DE NIVELES DE LOGRO</h2>
                    <div className="word-table-responsive">
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "20%" }}>Criterio / Capacidad</th>
                            <th style={{ width: "20%" }}>Inicio (C)</th>
                            <th style={{ width: "20%" }}>En proceso (B)</th>
                            <th style={{ width: "20%" }}>Logro esperado (A)</th>
                            <th style={{ width: "20%" }}>Logro destacado (AD)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {artifact.sections.map((sec, idx) => (
                            <tr key={idx}>
                              <td className="word-table-cell-bold">{sec.title}</td>
                              <td>{sec.key_points[0] || "Presenta dificultades iniciales para demostrar la habilidad."}</td>
                              <td>{sec.key_points[1] || "Aplica con guía parcial y requiere andamiaje formativo."}</td>
                              <td>{sec.key_points[2] || sec.narrative || "Demuestra solvencia en todas las tareas propuestas del criterio."}</td>
                              <td>{sec.key_points[3] || "Supera el estándar esperado y transfiere a situaciones nuevas."}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ) : toolId.includes("lista-cotejo") ? (
                  /* Si es Lista de Cotejo: Criterios con Sí / No */
                  <section className="word-section">
                    <h2 className="word-section-h1">II. LISTA DE COTEJO Y DESEMPEÑOS OBSERVABLES</h2>
                    <div className="word-table-responsive">
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "6%" }} className="word-table-cell-center">N°</th>
                            <th style={{ width: "54%" }}>Criterio / Desempeño Observable</th>
                            <th style={{ width: "10%" }} className="word-table-cell-center">Sí</th>
                            <th style={{ width: "10%" }} className="word-table-cell-center">No</th>
                            <th style={{ width: "20%" }}>Observaciones / Pautas</th>
                          </tr>
                        </thead>
                        <tbody>
                          {artifact.sections.flatMap((sec) => sec.key_points).map((point, idx) => (
                            <tr key={idx}>
                              <td className="word-table-cell-center">{idx + 1}</td>
                              <td>{point}</td>
                              <td className="word-table-cell-center">[  ]</td>
                              <td className="word-table-cell-center">[  ]</td>
                              <td>Retroalimentación oportuna en el aula.</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ) : (
                  /* Exámenes u otros instrumentos */
                  <section className="word-section">
                    <h2 className="word-section-h1">II. REACTIVOS Y CONSIGNAS DE EVALUACIÓN</h2>
                    {artifact.sections.map((sec, idx) => (
                      <div key={idx} style={{ marginBottom: "1.5rem" }}>
                        <h3 className="word-section-h2">{idx + 1}. {sec.title}</h3>
                        <p className="word-paper-p">{sec.narrative}</p>
                        {sec.key_points.length > 0 ? (
                          <div style={{ marginLeft: "1rem" }}>
                            {sec.key_points.map((p, pIdx) => (
                              <p key={pIdx} className="word-paper-p" style={{ marginBottom: "0.4rem" }}>
                                [  ] {p}
                              </p>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </section>
                )}

                {/* Orientaciones para el docente y firmas */}
                {artifact.teacher_recommendations.length > 0 ? (
                  <section className="word-section">
                    <h2 className="word-section-h1">III. ORIENTACIONES PARA LA RETROALIMENTACIÓN DOCENTE</h2>
                    <ul>
                      {artifact.teacher_recommendations.map((r, idx) => (
                        <li key={idx} style={{ marginBottom: "0.4rem" }}>{r}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <div className="word-signatures-box">
                  <div>
                    <div className="word-signature-line">____________________________________________</div>
                    <div className="word-signature-name">{teacher}</div>
                    <div className="word-signature-role">Docente Evaluador(a)</div>
                  </div>
                  <div>
                    <div className="word-signature-line">____________________________________________</div>
                    <div className="word-signature-name">{director}</div>
                    <div className="word-signature-role">Dirección / Coordinación Pedagógica</div>
                  </div>
                </div>
              </>
            ) : null}

            {/* ==================== 2. ARQUETIPO: ACTIVIDADES Y JUEGOS ==================== */}
            {isActivity ? (
              <>
                <header className="word-paper-header">
                  <div className="word-paper-motto">
                    DOCUMENTO PEDAGÓGICO EDITABLE
                  </div>
                  <h1 className="word-paper-title">{artifact.document_title}</h1>
                  <div className="word-paper-subtitle">
                    FICHA DE TRABAJO Y APLICACIÓN ACTIVA · {area.toUpperCase()}
                  </div>
                </header>

                <div className="word-student-exam-header">
                  <div className="word-student-exam-row">
                    <span><strong>Estudiante:</strong> __________________________________________________</span>
                    <span><strong>Grado y Sección:</strong> {grade} "{section}"</span>
                  </div>
                  <div className="word-student-exam-row">
                    <span><strong>I.E.:</strong> {ie}</span>
                    <span><strong>Fecha:</strong> ____ / ____ / {year}</span>
                  </div>
                </div>

                <p className="word-paper-p">
                  <strong>Instrucciones:</strong> {artifact.executive_summary || "Lee atentamente cada indicación y desarrolla los retos propuestos aplicando tus conocimientos."}
                </p>

                <GeneratedArtifactTables artifact={artifact} heading="I. RUTA DE TRABAJO" editingResult={editingResult} onUpdateTableCell={onUpdateTableCell} />

                {/* Si es Sopa de Letras */}
                {toolId.includes("sopa") ? (
                  <section className="word-section">
                    <h2 className="word-section-h1">I. CUADRÍCULA DE BÚSQUEDA DE PALABRAS</h2>
                    <p className="word-paper-p" style={{ fontSize: "0.9rem", color: "inherit", marginBottom: "1.25rem" }}>
                      <strong>Instrucciones:</strong> Encuentra las palabras clave en la cuadrícula de letras (pueden estar en sentido horizontal, vertical o diagonal). Enciérralas con colores y escribe una oración para cada una en la tabla inferior.
                    </p>

                    <div className="word-letters-grid-wrapper">
                      <table className="word-letters-grid">
                        <tbody>
                          {((artifact.activity?.grid && artifact.activity.grid.length > 0)
                            ? artifact.activity.grid
                            : [
                                ["M", "E", "R", "C", "U", "R", "I", "O", "X", "L", "A", "P"],
                                ["Z", "K", "V", "E", "N", "U", "S", "W", "Q", "E", "D", "T"],
                                ["T", "I", "E", "R", "R", "A", "B", "C", "O", "R", "T", "Y"],
                                ["L", "O", "P", "R", "M", "A", "R", "T", "E", "S", "H", "U"],
                                ["B", "J", "U", "P", "I", "T", "E", "R", "K", "L", "M", "N"],
                                ["S", "A", "T", "U", "R", "N", "O", "F", "V", "B", "N", "Q"],
                                ["A", "C", "D", "U", "R", "A", "N", "O", "P", "R", "T", "Z"],
                                ["W", "N", "E", "P", "T", "U", "N", "O", "X", "Y", "Z", "A"],
                                ["S", "O", "L", "A", "R", "B", "I", "T", "A", "S", "D", "F"],
                                ["G", "A", "L", "A", "X", "I", "A", "S", "P", "L", "A", "N"],
                                ["C", "O", "M", "E", "T", "A", "S", "T", "R", "O", "E", "S"],
                                ["E", "S", "T", "R", "E", "L", "L", "A", "F", "U", "E", "G"],
                              ]
                          ).map((row, rIdx) => (
                            <tr key={rIdx}>
                              {row.map((ch, cIdx) => (
                                <td key={cIdx}>{ch}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <h2 className="word-section-h1" style={{ marginTop: "1.75rem" }}>II. PALABRAS A ENCONTRAR Y APLICACIÓN</h2>
                    <div className="word-table-responsive">
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "30%" }}>Palabra Clave</th>
                            <th style={{ width: "70%" }}>Oración o Aplicación Curricular del Estudiante</th>
                          </tr>
                        </thead>
                        <tbody>
                          {((artifact.activity?.word_bank && artifact.activity.word_bank.length > 0)
                            ? artifact.activity.word_bank
                            : (artifact.activity?.items && artifact.activity.items.length > 0)
                            ? artifact.activity.items.map((i) => i.answer)
                            : artifact.sections.flatMap((s) => s.key_points).slice(0, 8)
                          ).map((word, idx) => (
                            <tr key={idx}>
                              <td className="word-table-cell-bold">[ &nbsp;&nbsp; ] &nbsp;{word.toUpperCase()}</td>
                              <td style={{ color: "#94a3b8" }}>_______________________________________________________________</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Solucionario de Sopa de Letras */}
                    <div style={{ marginTop: "2.5rem", borderTop: "2px dashed #bdd7ee", paddingTop: "1.5rem" }}>
                      <h3 className="word-section-h2">SOLUCIONARIO Y GUÍA DE UBICACIÓN: SOPA DE LETRAS</h3>
                      <p style={{ fontSize: "0.85rem", color: "#64748b", fontStyle: "italic", marginBottom: "0.75rem" }}>
                        (USO EXCLUSIVO DEL DOCENTE - NO ENTREGAR AL ESTUDIANTE)
                      </p>
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "8%" }} className="word-table-cell-center">N°</th>
                            <th style={{ width: "22%" }}>Palabra Clave</th>
                            <th style={{ width: "20%" }} className="word-table-cell-center">Coordenadas</th>
                            <th style={{ width: "18%" }} className="word-table-cell-center">Sentido</th>
                            <th style={{ width: "32%" }}>Pauta Pedagógica / Datos Clave</th>
                          </tr>
                        </thead>
                        <tbody>
                          {((artifact.activity?.items && artifact.activity.items.length > 0)
                            ? artifact.activity.items
                            : ((artifact.activity?.word_bank && artifact.activity.word_bank.length > 0)
                                ? artifact.activity.word_bank
                                : artifact.sections.flatMap((s) => s.key_points).slice(0, 8)
                              ).map((w, idx) => ({
                                id: String(idx + 1),
                                prompt: `Planeta o cuerpo celeste: ${w}`,
                                answer: w,
                                hint: `Ubicado en la fila ${idx + 1}`,
                                options: [],
                              }))
                          ).map((item, idx) => (
                            <tr key={idx}>
                              <td className="word-table-cell-center" style={{ fontWeight: 700 }}>{idx + 1}</td>
                              <td className="word-table-cell-bold word-hangman-secret">{item.answer.toUpperCase()}</td>
                              <td className="word-table-cell-center">{`Fila ${idx + 1}, Col ${(idx * 2) % 6 + 1}`}</td>
                              <td className="word-table-cell-center">Horizontal ( → )</td>
                              <td style={{ fontStyle: "italic", fontSize: "0.85rem" }}>{item.hint || item.prompt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ) : toolId.includes("tarjeta") ? (
                  /* Si son Tarjetas de Estudio */
                  <section className="word-section">
                    <h2 className="word-section-h1">TARJETAS DIDÁCTICAS RECORTABLES (FRENTE Y REVERSO)</h2>
                    <p className="word-paper-p" style={{ fontSize: "0.88rem", color: "#475569", marginBottom: "1rem" }}>
                      <strong>Instrucciones de recorte y armado:</strong> Recorta cada tarjeta por la línea punteada (✂). Lee el concepto o pregunta del frente, formula tu respuesta y comprueba con el reverso.
                    </p>
                    <div className="word-flashcards-grid">
                      {(artifact.activity?.items && artifact.activity.items.length > 0
                        ? artifact.activity.items
                        : artifact.sections.flatMap((s) => s.key_points).map((point, i) => ({
                            id: String(i),
                            prompt: `Concepto #${i + 1}`,
                            answer: point,
                            hint: "",
                            options: [],
                          }))
                      ).map((card, idx) => (
                        <div key={card.id || idx} className="word-flashcard-item">
                          <span className="word-flashcard-cut-label">✂ Recortar</span>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                            <span style={{ fontWeight: 800, color: "#1f4d78", fontSize: "0.8rem", textTransform: "uppercase" }}>
                              Tarjeta N° {idx + 1}
                            </span>
                            <span style={{ fontSize: "0.7rem", background: "#e2e8f0", padding: "1px 5px", borderRadius: "3px", color: "#475569" }}>
                              Frente / Reverso
                            </span>
                          </div>
                          <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "1rem", marginBottom: "0.4rem", borderBottom: "1px dashed #cbd5e1", paddingBottom: "0.25rem" }}>
                            {card.prompt}
                          </div>
                          <div style={{ fontSize: "0.85rem", color: "#334155", lineHeight: 1.4 }}>
                            <strong>¿Qué significa?</strong> {card.answer}
                          </div>
                          {card.hint ? (
                            <div style={{ marginTop: "0.35rem", fontSize: "0.78rem", color: "#64748b", fontStyle: "italic" }}>
                              💡 Pista: {card.hint}
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>

                    {/* Solucionario para Tarjetas de Estudio */}
                    <div style={{ marginTop: "2.5rem", borderTop: "2px dashed #bdd7ee", paddingTop: "1.5rem" }}>
                      <h3 className="word-section-h2">SOLUCIONARIO Y PAUTA DOCENTE: TARJETAS DE ESTUDIO</h3>
                      <p style={{ fontSize: "0.85rem", color: "#64748b", fontStyle: "italic", marginBottom: "0.75rem" }}>
                        (USO EXCLUSIVO DEL DOCENTE - NO ENTREGAR AL ESTUDIANTE)
                      </p>
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "8%" }} className="word-table-cell-center">N°</th>
                            <th style={{ width: "32%" }}>Concepto / Pregunta (Frente)</th>
                            <th style={{ width: "40%" }}>Respuesta y Explicación (Dorso)</th>
                            <th style={{ width: "20%" }}>Pauta Pedagógica / Ejemplo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {((artifact.activity?.items && artifact.activity.items.length > 0)
                            ? artifact.activity.items
                            : artifact.sections.flatMap((s) => s.key_points).map((point, i) => ({
                                id: String(i + 1),
                                prompt: `Concepto #${i + 1}`,
                                answer: point,
                                hint: "Reforzar en clase",
                                options: [],
                              }))
                          ).map((card, idx) => (
                            <tr key={idx}>
                              <td className="word-table-cell-center" style={{ fontWeight: 700 }}>{idx + 1}</td>
                              <td className="word-table-cell-bold word-hangman-secret">{card.prompt}</td>
                              <td>{card.answer}</td>
                              <td style={{ fontStyle: "italic", fontSize: "0.85rem" }}>{card.hint || "Verificar comprensión activa."}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ) : toolId.includes("ahorcado") ? (
                  /* Si es Juego del Ahorcado */
                  <section className="word-section">
                    <h2 className="word-section-h1">I. RETOS DE VOCABULARIO Y ADIVINANZAS: JUEGO DEL AHORCADO</h2>
                    <p className="word-paper-p" style={{ fontSize: "0.9rem", color: "#475569", marginBottom: "1.25rem" }}>
                      <strong>Instrucciones:</strong> Lee con atención la pista o adivinanza de cada reto. Descubre la palabra secreta completando una letra en cada casilla cuadrada. Puedes tachar en el abecedario las letras que vayas probando. Tienes 4 vidas [♥] por palabra antes de equivocarte.
                    </p>

                    <div className="word-hangman-list" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                      {(artifact.activity?.items && artifact.activity.items.length > 0
                        ? artifact.activity.items
                        : artifact.sections.flatMap((s, sIdx) => s.key_points.map((kp, kpIdx) => ({
                            id: `h-${sIdx}-${kpIdx}`,
                            prompt: kp,
                            answer: kp.split(" ")[0] || "PALABRA",
                            hint: s.narrative,
                            options: [],
                          })))
                      ).map((item, idx) => {
                        const cleanAnswer = (item.answer || "").toUpperCase().replace(/[^A-ZÑÁÉÍÓÚ]/g, "");
                        const letters = cleanAnswer.length > 0 ? cleanAnswer.split("") : ["P", "A", "L", "A", "B", "R", "A"];
                        return (
                          <div key={idx} className="word-hangman-card">
                            <div className="word-hangman-card-title">
                              RETO N° {idx + 1}: <span className="word-hangman-prompt">«{item.prompt}»</span>
                            </div>

                            {/* Casillas de letras cuadradas */}
                            <div className="word-hangman-boxes">
                              {letters.map((_, lIdx) => (
                                <div key={lIdx} className="word-hangman-box" />
                              ))}
                            </div>

                            {/* Abecedario para tachar */}
                            <div className="word-hangman-abc">
                              <strong>Abecedario:</strong> A · B · C · D · E · F · G · H · I · J · K · L · M · N · Ñ · O · P · Q · R · S · T · U · V · W · X · Y · Z
                            </div>

                            {/* Vidas */}
                            <div className="word-hangman-lives">
                              <span>Vidas disponibles: [ ♥ ] [ ♥ ] [ ♥ ] [ ♥ ]</span>
                              <span className="word-hangman-attempts">Intentos usados: [ ____ ]</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Solucionario para Ahorcado */}
                    <div style={{ marginTop: "2.5rem", borderTop: "2px dashed #bdd7ee", paddingTop: "1.5rem" }}>
                      <h3 className="word-section-h2">SOLUCIONARIO Y PAUTA DOCENTE: JUEGO DEL AHORCADO</h3>
                      <p style={{ fontSize: "0.85rem", color: "#64748b", fontStyle: "italic", marginBottom: "0.75rem" }}>
                        (USO EXCLUSIVO DEL DOCENTE - NO ENTREGAR AL ESTUDIANTE)
                      </p>
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "10%" }} className="word-table-cell-center">Reto</th>
                            <th style={{ width: "45%" }}>Pista / Adivinanza</th>
                            <th style={{ width: "20%" }} className="word-table-cell-center">Palabra Secreta</th>
                            <th style={{ width: "25%" }}>Orientación Pedagógica</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(artifact.activity?.items && artifact.activity.items.length > 0
                            ? artifact.activity.items
                            : artifact.sections.flatMap((s, sIdx) => s.key_points.map((kp, kpIdx) => ({
                                id: `h-${sIdx}-${kpIdx}`,
                                prompt: kp,
                                answer: kp.split(" ")[0] || "PALABRA",
                                hint: s.narrative,
                                options: [],
                              })))
                          ).map((item, idx) => (
                            <tr key={idx}>
                              <td className="word-table-cell-center" style={{ fontWeight: 700 }}>{idx + 1}</td>
                              <td>{item.prompt}</td>
                              <td className="word-table-cell-center word-hangman-secret">{(item.answer || "").toUpperCase()}</td>
                              <td style={{ fontStyle: "italic", fontSize: "0.85rem" }}>{item.hint || "Reforzar en plenaria."}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ) : toolId.includes("completa") ? (
                  /* Si es Completa la Frase */
                  <section className="word-section">
                    <h2 className="word-section-h1">I. RETOS DE APLICACIÓN: COMPLETA LA FRASE</h2>
                    <p className="word-paper-p" style={{ fontSize: "0.9rem", color: "inherit", marginBottom: "1.25rem" }}>
                      <strong>Instrucciones:</strong> Lee con atención cada enunciado. Selecciona la palabra adecuada del Banco de Palabras y escríbela sobre la línea punteada para completar correctamente cada oración.
                    </p>

                    {/* Banco de palabras */}
                    <div className="word-completion-bank">
                      <div className="word-completion-bank-title">★ BANCO DE PALABRAS PARA COMPLETAR ★</div>
                      <div className="word-completion-bank-words">
                        {((artifact.activity?.word_bank && artifact.activity.word_bank.length > 0)
                          ? artifact.activity.word_bank
                          : (artifact.activity?.items || []).map((it) => it.answer.toUpperCase())
                        ).map((word, wIdx) => (
                          <span key={wIdx} className="word-completion-bank-tag">
                            [ {word.toUpperCase()} ]
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Lista de oraciones */}
                    <div className="word-completion-list">
                      {(artifact.activity?.items && artifact.activity.items.length > 0
                        ? artifact.activity.items
                        : artifact.sections.flatMap((s, sIdx) => s.key_points.map((kp, kpIdx) => ({
                            id: `c-${sIdx}-${kpIdx}`,
                            prompt: kp,
                            answer: kp.split(" ")[0] || "PALABRA",
                            hint: s.narrative,
                            options: [],
                          })))
                      ).map((item, idx) => {
                        let sentence = item.prompt;
                        const answer = item.answer || "";
                        if (answer && sentence.toLowerCase().includes(answer.toLowerCase())) {
                          const regex = new RegExp(answer, "gi");
                          sentence = sentence.replace(regex, "_________________________");
                        } else if (!sentence.includes("_____")) {
                          sentence = `${sentence}: _________________________`;
                        }

                        return (
                          <div key={idx} className="word-completion-item">
                            <span className="word-completion-number">{idx + 1}.</span>
                            <span className="word-completion-sentence">{sentence}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Solucionario para Completa la Frase */}
                    <div style={{ marginTop: "2.5rem", borderTop: "2px dashed #bdd7ee", paddingTop: "1.5rem" }}>
                      <h3 className="word-section-h2">SOLUCIONARIO Y PAUTA DOCENTE: COMPLETA LA FRASE</h3>
                      <p style={{ fontSize: "0.85rem", color: "#64748b", fontStyle: "italic", marginBottom: "0.75rem" }}>
                        (USO EXCLUSIVO DEL DOCENTE - NO ENTREGAR AL ESTUDIANTE)
                      </p>
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "8%" }} className="word-table-cell-center">N°</th>
                            <th style={{ width: "45%" }}>Enunciado Incompleto</th>
                            <th style={{ width: "22%" }} className="word-table-cell-center">Palabra Correcta</th>
                            <th style={{ width: "25%" }}>Explicación y Fundamento Pedagógico</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(artifact.activity?.items && artifact.activity.items.length > 0
                            ? artifact.activity.items
                            : artifact.sections.flatMap((s, sIdx) => s.key_points.map((kp, kpIdx) => ({
                                id: `c-${sIdx}-${kpIdx}`,
                                prompt: kp,
                                answer: kp.split(" ")[0] || "PALABRA",
                                hint: s.narrative,
                                options: [],
                              })))
                          ).map((item, idx) => (
                            <tr key={idx}>
                              <td className="word-table-cell-center" style={{ fontWeight: 700 }}>{idx + 1}</td>
                              <td>{item.prompt}</td>
                              <td className="word-table-cell-center word-hangman-secret">{(item.answer || "").toUpperCase()}</td>
                              <td style={{ fontStyle: "italic", fontSize: "0.85rem" }}>{item.hint || "Reforzar el concepto biológico en plenaria."}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ) : toolId.includes("emparejar") ? (
                  /* Si es Emparejar Palabras */
                  <section className="word-section">
                    <h2 className="word-section-h1">I. RETOS DE APLICACIÓN: EMPAREJAR CONCEPTOS</h2>
                    <p className="word-paper-p" style={{ fontSize: "0.9rem", color: "inherit", marginBottom: "1.25rem" }}>
                      <strong>Instrucciones:</strong> Lee con atención los conceptos de la Columna A y sus definiciones en la Columna B. Relaciona cada concepto escribiendo la letra mayúscula correspondiente dentro de los paréntesis vacíos (   ).
                    </p>

                    {/* Tabla de emparejar dos columnas */}
                    {(() => {
                      const matchingItems = (artifact.activity?.items && artifact.activity.items.length > 0)
                        ? artifact.activity.items
                        : artifact.sections.flatMap((s, sIdx) => s.key_points.map((kp, kpIdx) => ({
                            id: `m-${sIdx}-${kpIdx}`,
                            prompt: kp,
                            answer: s.title || `Concepto ${kpIdx + 1}`,
                            hint: s.narrative,
                            options: [],
                          })));
                      const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
                      const shuffledIndices = matchingItems.map((_, i) => (i * 3 + 2) % matchingItems.length);
                      const uniqueIndices = Array.from(new Set(shuffledIndices));
                      const finalOrder = uniqueIndices.length === matchingItems.length
                        ? shuffledIndices
                        : matchingItems.map((_, i) => (i + 1) % matchingItems.length);

                      return (
                        <div className="word-table-responsive">
                          <table className="word-table">
                            <thead>
                              <tr>
                                <th style={{ width: "42%" }}>COLUMNA A: CONCEPTO / TÉRMINO</th>
                                <th style={{ width: "58%" }}>COLUMNA B: DEFINICIÓN / CASO</th>
                              </tr>
                            </thead>
                            <tbody>
                              {matchingItems.map((item, idx) => {
                                const rightIdx = finalOrder[idx];
                                const rightItem = matchingItems[rightIdx];
                                const leftLetter = letters[idx] || String(idx + 1);

                                return (
                                  <tr key={idx}>
                                    <td style={{ fontWeight: 600 }}>
                                      <span className="word-completion-number">{leftLetter}. </span>
                                      <span>{item.answer || item.prompt}</span>
                                    </td>
                                    <td>
                                      <strong style={{ color: "#1f4d78", marginRight: "0.5rem" }} className="word-hangman-secret">( &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; )</strong>
                                      <span>{rightItem.prompt}</span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}

                    {/* Solucionario para Emparejar */}
                    <div style={{ marginTop: "2.5rem", borderTop: "2px dashed #bdd7ee", paddingTop: "1.5rem" }}>
                      <h3 className="word-section-h2">SOLUCIONARIO Y PAUTA DOCENTE: EMPAREJAR CONCEPTOS</h3>
                      <p style={{ fontSize: "0.85rem", color: "#64748b", fontStyle: "italic", marginBottom: "0.75rem" }}>
                        (USO EXCLUSIVO DEL DOCENTE - NO ENTREGAR AL ESTUDIANTE)
                      </p>
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "8%" }} className="word-table-cell-center">Letra</th>
                            <th style={{ width: "32%" }}>Concepto (Columna A)</th>
                            <th style={{ width: "14%" }} className="word-table-cell-center">Paréntesis</th>
                            <th style={{ width: "46%" }}>Definición Asociada (Columna B)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {((artifact.activity?.items && artifact.activity.items.length > 0)
                            ? artifact.activity.items
                            : artifact.sections.flatMap((s, sIdx) => s.key_points.map((kp, kpIdx) => ({
                                id: `m-${sIdx}-${kpIdx}`,
                                prompt: kp,
                                answer: s.title || `Concepto ${kpIdx + 1}`,
                                hint: s.narrative,
                                options: [],
                              })))
                          ).map((item, idx) => {
                            const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
                            const letter = letters[idx] || String(idx + 1);
                            return (
                              <tr key={idx}>
                                <td className="word-table-cell-center" style={{ fontWeight: 700 }}>{letter}</td>
                                <td style={{ fontWeight: 600 }}>{item.answer || item.prompt}</td>
                                <td className="word-table-cell-center word-hangman-secret" style={{ fontWeight: 700 }}>( &nbsp;{letter}&nbsp; )</td>
                                <td>{item.prompt}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ) : toolId.includes("crucigrama") ? (
                  /* Si es Crucigrama */
                  <section className="word-section">
                    <h2 className="word-section-h1">I. CUADRÍCULA Y RETOS DEL CRUCIGRAMA EDUCATIVO</h2>
                    <p className="word-paper-p" style={{ fontSize: "0.9rem", color: "inherit", marginBottom: "1.25rem" }}>
                      <strong>Instrucciones:</strong> Lee atentamente las pistas horizontales y verticales. Escribe una letra en cada casilla blanca según el número correspondiente. Las casillas sombreadas indican separación entre palabras.
                    </p>

                    {/* Cuadrícula del crucigrama */}
                    {(() => {
                      const crosswordGrid: string[][] = [
                        ["¹C", "O", "S", "T", "A", "█", "█", "█", "█", "█"],
                        ["█", "█", "█", "█", "█", "█", "²G", "█", "█", "█"],
                        ["³A", "N", "D", "E", "S", "█", "R", "█", "⁴C", "█"],
                        ["█", "█", "█", "█", "█", "█", "A", "█", "U", "█"],
                        ["⁵S", "E", "L", "V", "A", "█", "U", "█", "S", "█"],
                        ["█", "█", "█", "█", "█", "█", "█", "█", "C", "█"],
                        ["⁷T", "I", "T", "I", "C", "A", "C", "A", "O", "█"],
                        ["█", "█", "█", "█", "█", "█", "█", "█", "█", "█"],
                        ["⁶A", "M", "A", "Z", "O", "N", "A", "S", "█", "█"],
                        ["█", "█", "⁸C", "O", "L", "C", "A", "█", "█", "█"],
                      ];

                      return (
                        <div className="word-crossword-container">
                          <div className="word-crossword-grid">
                            {crosswordGrid.flatMap((row, rIdx) =>
                              row.map((cell, cIdx) => {
                                const isBlocked = cell === "█";
                                const num = isBlocked ? "" : cell.replace(/[^0-9¹²³⁴⁵⁶⁷⁸]/g, "");
                                return (
                                  <div
                                    key={`${rIdx}-${cIdx}`}
                                    className={`word-crossword-cell ${isBlocked ? "word-crossword-cell--blocked" : ""}`}
                                  >
                                    {num}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Pistas Horizontales y Verticales */}
                    <div style={{ marginTop: "1.5rem" }}>
                      <h3 className="word-section-h2">PISTAS PARA COMPLETAR EL CRUCIGRAMA</h3>
                      {(() => {
                        const crosswordItems = (artifact.activity?.items && artifact.activity.items.length > 0)
                          ? artifact.activity.items
                          : [
                              { id: "1", prompt: "Región costeña cálida y árida junto al océano Pacífico.", answer: "COSTA", hint: "Horizontal 1" },
                              { id: "2", prompt: "Mar territorial peruano rico en recursos ictiológicos.", answer: "GRAU", hint: "Vertical 2" },
                              { id: "3", prompt: "Cordillera montañosa de gran altitud y cumbres nevadas.", answer: "ANDES", hint: "Horizontal 3" },
                              { id: "4", prompt: "Capital histórica del Imperio de los Incas en la sierra.", answer: "CUSCO", hint: "Vertical 4" },
                              { id: "5", prompt: "Región de bosque tropical con inmensa biodiversidad.", answer: "SELVA", hint: "Horizontal 5" },
                              { id: "6", prompt: "Río más caudaloso del mundo que nace en el Perú.", answer: "AMAZONAS", hint: "Vertical 6" },
                              { id: "7", prompt: "Lago navegable más alto del mundo ubicado en el Altiplano.", answer: "TITICACA", hint: "Horizontal 7" },
                              { id: "8", prompt: "Cañón profundo y ave rapaz emblemática de Arequipa.", answer: "COLCA", hint: "Vertical 8" },
                            ];
                        const horizontales = crosswordItems.filter((_, idx) => idx % 2 === 0);
                        const verticales = crosswordItems.filter((_, idx) => idx % 2 === 1);
                        const maxClues = Math.max(horizontales.length, verticales.length);

                        return (
                          <div className="word-table-responsive">
                            <table className="word-table">
                              <thead>
                                <tr>
                                  <th style={{ width: "50%" }}>HORIZONTALES ( → )</th>
                                  <th style={{ width: "50%" }}>VERTICALES ( ↓ )</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Array.from({ length: maxClues }).map((_, i) => (
                                  <tr key={i}>
                                    <td>
                                      {horizontales[i] ? (
                                        <>
                                          <strong className="word-completion-number">{horizontales[i].id || i * 2 + 1}. </strong>
                                          <span>{horizontales[i].prompt}</span>
                                        </>
                                      ) : null}
                                    </td>
                                    <td>
                                      {verticales[i] ? (
                                        <>
                                          <strong className="word-completion-number">{verticales[i].id || i * 2 + 2}. </strong>
                                          <span>{verticales[i].prompt}</span>
                                        </>
                                      ) : null}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Solucionario para Crucigrama */}
                    <div style={{ marginTop: "2.5rem", borderTop: "2px dashed #bdd7ee", paddingTop: "1.5rem" }}>
                      <h3 className="word-section-h2">SOLUCIONARIO Y PAUTA DOCENTE: CRUCIGRAMA</h3>
                      <p style={{ fontSize: "0.85rem", color: "#64748b", fontStyle: "italic", marginBottom: "0.75rem" }}>
                        (USO EXCLUSIVO DEL DOCENTE - NO ENTREGAR AL ESTUDIANTE)
                      </p>
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "8%" }} className="word-table-cell-center">N°</th>
                            <th style={{ width: "15%" }} className="word-table-cell-center">Sentido</th>
                            <th style={{ width: "42%" }}>Pista Curricular</th>
                            <th style={{ width: "20%" }} className="word-table-cell-center">Palabra Resuelta</th>
                            <th style={{ width: "15%" }}>Orientación Pedagógica</th>
                          </tr>
                        </thead>
                        <tbody>
                          {((artifact.activity?.items && artifact.activity.items.length > 0)
                            ? artifact.activity.items
                            : [
                                { id: "1", prompt: "Región costeña cálida y árida junto al océano Pacífico.", answer: "COSTA", hint: "Horizontal 1" },
                                { id: "2", prompt: "Mar territorial peruano rico en recursos ictiológicos.", answer: "GRAU", hint: "Vertical 2" },
                                { id: "3", prompt: "Cordillera montañosa de gran altitud y cumbres nevadas.", answer: "ANDES", hint: "Horizontal 3" },
                                { id: "4", prompt: "Capital histórica del Imperio de los Incas en la sierra.", answer: "CUSCO", hint: "Vertical 4" },
                                { id: "5", prompt: "Región de bosque tropical con inmensa biodiversidad.", answer: "SELVA", hint: "Horizontal 5" },
                                { id: "6", prompt: "Río más caudaloso del mundo que nace en el Perú.", answer: "AMAZONAS", hint: "Vertical 6" },
                                { id: "7", prompt: "Lago navegable más alto del mundo ubicado en el Altiplano.", answer: "TITICACA", hint: "Horizontal 7" },
                                { id: "8", prompt: "Cañón profundo y ave rapaz emblemática de Arequipa.", answer: "COLCA", hint: "Vertical 8" },
                              ]
                          ).map((item, idx) => {
                            const isH = idx % 2 === 0;
                            return (
                              <tr key={idx}>
                                <td className="word-table-cell-center" style={{ fontWeight: 700 }}>{idx + 1}</td>
                                <td className="word-table-cell-center">{isH ? "Horizontal ( → )" : "Vertical ( ↓ )"}</td>
                                <td>{item.prompt}</td>
                                <td className="word-table-cell-center word-hangman-secret" style={{ fontWeight: 700 }}>{item.answer.toUpperCase()}</td>
                                <td style={{ fontStyle: "italic", fontSize: "0.85rem" }}>{item.hint || "Reforzar ubicación geográfica."}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ) : toolId.includes("agrupar") ? (
                  /* Si es Agrupar Palabras */
                  <section className="word-section">
                    <h2 className="word-section-h1">I. RETOS DE CLASIFICACIÓN Y CATEGORIZACIÓN</h2>
                    <p className="word-paper-p" style={{ fontSize: "0.9rem", color: "inherit", marginBottom: "1.25rem" }}>
                      <strong>Instrucciones:</strong> Observa con atención el Banco de Términos desordenados. Clasifica y escribe cada elemento en la columna correspondiente según el criterio pedagógico indicado.
                    </p>

                    {/* Banco de Palabras */}
                    <div className="word-completion-bank" style={{ marginBottom: "1.75rem" }}>
                      <div className="word-completion-bank-title">★ BANCO DE TÉRMINOS A CLASIFICAR ★</div>
                      <div className="word-completion-bank-words">
                        {((artifact.activity?.word_bank && artifact.activity.word_bank.length > 0)
                          ? artifact.activity.word_bank
                          : (artifact.activity?.items && artifact.activity.items.length > 0)
                          ? artifact.activity.items.map((i) => i.answer)
                          : [
                              "VACA", "LEÓN", "CERDO", "CONEJO", "TIGRE", "OSO",
                              "OVEJA", "ÁGUILA", "CHIMPANCÉ", "CABALLO", "TIBURÓN", "GALLINA"
                            ]
                        ).map((term, idx) => (
                          <span key={idx} className="word-completion-bank-tag">
                            {term.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Columnas de Categorización */}
                    {(() => {
                      const categories = artifact.sections && artifact.sections.length >= 3
                        ? artifact.sections.slice(0, 3).map((s) => s.title)
                        : ["HERBÍVOROS (Plantas)", "CARNÍVOROS (Carne)", "OMNÍVOROS (Plantas y Carne)"];

                      return (
                        <div className="word-table-responsive">
                          <table className="word-table">
                            <thead>
                              <tr>
                                {categories.map((cat, idx) => (
                                  <th key={idx} style={{ width: "33%", textAlign: "center" }}>
                                    {cat.toUpperCase()}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from({ length: 4 }).map((_, rIdx) => (
                                <tr key={rIdx}>
                                  <td style={{ color: "#94a3b8" }}>{rIdx + 1}. ___________________________</td>
                                  <td style={{ color: "#94a3b8" }}>{rIdx + 1}. ___________________________</td>
                                  <td style={{ color: "#94a3b8" }}>{rIdx + 1}. ___________________________</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}

                    {/* Solucionario para Agrupar Palabras */}
                    <div style={{ marginTop: "2.5rem", borderTop: "2px dashed #bdd7ee", paddingTop: "1.5rem" }}>
                      <h3 className="word-section-h2">SOLUCIONARIO Y PAUTA DOCENTE: AGRUPAR CONCEPTOS</h3>
                      <p style={{ fontSize: "0.85rem", color: "#64748b", fontStyle: "italic", marginBottom: "0.75rem" }}>
                        (USO EXCLUSIVO DEL DOCENTE - NO ENTREGAR AL ESTUDIANTE)
                      </p>
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "25%" }}>Categoría Curricular</th>
                            <th style={{ width: "30%" }}>Criterio y Definición Biológica</th>
                            <th style={{ width: "30%" }}>Elementos Correctos Agrupados</th>
                            <th style={{ width: "15%" }}>Orientación Pedagógica</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="word-table-cell-bold">HERBÍVOROS</td>
                            <td>Animales cuya dieta está compuesta exclusivamente de plantas, hierbas y pastos.</td>
                            <td className="word-table-cell-bold word-hangman-secret">VACA, CONEJO, OVEJA, CABALLO</td>
                            <td style={{ fontStyle: "italic", fontSize: "0.85rem" }}>Reforzar adaptaciones de dentadura plana y digestión.</td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">CARNÍVOROS</td>
                            <td>Animales que consumen primordialmente carne de otros animales mediante caza o carroña.</td>
                            <td className="word-table-cell-bold word-hangman-secret">LEÓN, TIGRE, ÁGUILA, TIBURÓN</td>
                            <td style={{ fontStyle: "italic", fontSize: "0.85rem" }}>Comprender su rol como depredadores en la cadena trófica.</td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">OMNÍVOROS</td>
                            <td>Animales con dieta mixta que se alimentan tanto de materia vegetal como animal.</td>
                            <td className="word-table-cell-bold word-hangman-secret">CERDO, OSO, CHIMPANCÉ, GALLINA</td>
                            <td style={{ fontStyle: "italic", fontSize: "0.85rem" }}>Analizar la ventaja adaptativa ante cambios del ecosistema.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                ) : toolId.includes("ordenar") ? (
                  /* Si es Ordenar Bloques */
                  <section className="word-section">
                    <h2 className="word-section-h1">I. RETOS DE SECUENCIA Y ORDEN LÓGICO</h2>
                    <p className="word-paper-p" style={{ fontSize: "0.9rem", color: "inherit", marginBottom: "1.25rem" }}>
                      <strong>Instrucciones:</strong> Lee con atención los bloques desordenados. Analiza la cronología o el procedimiento lógico y escribe el número de orden correspondiente en cada casilla.
                    </p>

                    {/* Tabla de Bloques Desordenados */}
                    {(() => {
                      const sequenceItems = (artifact.activity?.items && artifact.activity.items.length > 0)
                        ? artifact.activity.items
                        : artifact.sections.flatMap((s) => s.key_points).map((p, idx) => ({
                            id: String(idx + 1),
                            prompt: p,
                            answer: String(idx + 1),
                            hint: "Etapa o paso clave del proceso.",
                            options: [],
                          }));

                      const shuffled = [...sequenceItems].sort((a, b) =>
                        (Number(a.id) % 2) - (Number(b.id) % 2) || Number(a.id) - Number(b.id));

                      return (
                        <div className="word-table-responsive">
                          <table className="word-table">
                            <thead>
                              <tr>
                                <th style={{ width: "20%" }} className="word-table-cell-center">✂ Bloque / Paso</th>
                                <th style={{ width: "60%" }}>Descripción del Hecho o Procedimiento</th>
                                <th style={{ width: "20%" }} className="word-table-cell-center">{`Tu Orden (1 al ${sequenceItems.length})`}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {shuffled.map((item, idx) => (
                                <tr key={idx}>
                                  <td className="word-table-cell-center word-table-cell-bold">{`✂ Bloque #${idx + 1}`}</td>
                                  <td>
                                    <div>{item.prompt}</div>
                                    {item.hint ? (
                                      <div style={{ fontSize: "0.82rem", color: "#64748b", fontStyle: "italic", marginTop: "0.25rem" }}>
                                        💡 Pista formativa: {item.hint}
                                      </div>
                                    ) : null}
                                  </td>
                                  <td className="word-table-cell-center word-table-cell-bold" style={{ fontSize: "1.2rem", letterSpacing: "2px" }}>
                                    [ &nbsp;&nbsp;&nbsp; ]
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      );
                    })()}

                    {/* Solucionario para Ordenar Bloques */}
                    <div style={{ marginTop: "2.5rem", borderTop: "2px dashed #bdd7ee", paddingTop: "1.5rem" }}>
                      <h3 className="word-section-h2">SOLUCIONARIO Y PAUTA DOCENTE: ORDEN LÓGICO Y SECUENCIAS</h3>
                      <p style={{ fontSize: "0.85rem", color: "#64748b", fontStyle: "italic", marginBottom: "0.75rem" }}>
                        (USO EXCLUSIVO DEL DOCENTE - NO ENTREGAR AL ESTUDIANTE)
                      </p>
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "12%" }} className="word-table-cell-center">N° Orden</th>
                            <th style={{ width: "53%" }}>Acontecimiento / Bloque Oficial</th>
                            <th style={{ width: "35%" }}>Pauta Pedagógica / Criterio Temporal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {((artifact.activity?.items && artifact.activity.items.length > 0)
                            ? artifact.activity.items
                            : artifact.sections.flatMap((s) => s.key_points).map((p, idx) => ({
                                id: String(idx + 1),
                                prompt: p,
                                answer: String(idx + 1),
                                hint: "Etapa o paso clave del proceso.",
                                options: [],
                              }))
                          ).map((item, idx) => (
                            <tr key={idx}>
                              <td className="word-table-cell-center word-table-cell-bold">{`Paso ${idx + 1}`}</td>
                              <td className="word-table-cell-bold word-hangman-secret">{item.prompt}</td>
                              <td style={{ fontStyle: "italic", fontSize: "0.85rem" }}>{item.hint || "Verificar correlatividad histórica y procedimental."}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                ) : toolId.includes("debate") ? (
                  /* Si es Dinámica de Debate en Aula */
                  <section className="word-section">
                    <h2 className="word-section-h1">I. GUÍA Y ESTRUCTURA DE DINÁMICA DE DEBATE EN EL AULA</h2>
                    <div style={{ background: "rgba(31, 77, 120, 0.08)", borderLeft: "4px solid #1f4d78", padding: "0.85rem 1rem", borderRadius: "4px", marginBottom: "1.25rem" }}>
                      <strong style={{ color: "var(--word-primary, #1f4d78)", display: "block", marginBottom: "0.25rem", fontSize: "0.95rem" }}>
                        Moción o Tesis Central:
                      </strong>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "inherit" }}>
                        {artifact.document_title || "¿Se debe regular estrictamente el uso de dispositivos móviles en el entorno escolar?"}
                      </p>
                    </div>

                    <p className="word-paper-p" style={{ fontSize: "0.9rem", color: "inherit", marginBottom: "1.5rem" }}>
                      <strong>Instrucciones generales y acuerdos de convivencia:</strong> El debate es un ejercicio de argumentación rigurosa, escucha activa y respeto democrático. Cada equipo defenderá su postura basándose en evidencias, datos contrastables y razonamientos lógicos, sin descalificaciones personales.
                    </p>

                    {/* Fases y Tiempos */}
                    <h3 className="word-section-h2" style={{ marginBottom: "0.6rem" }}>ESTRUCTURA DE FASES Y TIEMPOS DEL DEBATE</h3>
                    <div className="word-table-responsive" style={{ marginBottom: "1.75rem" }}>
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "25%" }}>Fase del Debate</th>
                            <th style={{ width: "15%" }} className="word-table-cell-center">Tiempo</th>
                            <th style={{ width: "25%" }}>Rol Participante</th>
                            <th style={{ width: "35%" }}>Objetivo Pedagógico CNEB</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="word-table-cell-bold">1. Apertura e Introducción</td>
                            <td className="word-table-cell-center">3 min / equipo</td>
                            <td>Primer Orador (A favor / En contra)</td>
                            <td>Presentar la tesis del equipo y el marco contextual de su postura.</td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">2. Argumentación Principal</td>
                            <td className="word-table-cell-center">4 min / equipo</td>
                            <td>Segundo Orador (Evidencias)</td>
                            <td>Sustentar argumentos con estudios, estadísticas, leyes y ejemplos reales.</td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">3. Refutación y Preguntas</td>
                            <td className="word-table-cell-center">5 min cruzados</td>
                            <td>Tercer Orador / Preguntas Cruzadas</td>
                            <td>Detectar falacias, contraargumentar y responder cuestionamientos.</td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">4. Conclusiones y Cierre</td>
                            <td className="word-table-cell-center">2 min / equipo</td>
                            <td>Orador de Cierre</td>
                            <td>Sintetizar puntos fuertes del equipo y brindar mensaje final reflexivo.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Matriz de Posturas */}
                    <h3 className="word-section-h2" style={{ marginBottom: "0.6rem" }}>MATRIZ DE POSTURAS CONTRAPUESTAS Y ARGUMENTOS</h3>
                    <div className="word-table-responsive" style={{ marginBottom: "1.75rem" }}>
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "50%", textAlign: "center" }}>EQUIPO A: A FAVOR (Regulación / Restricción)</th>
                            <th style={{ width: "50%", textAlign: "center" }}>EQUIPO B: EN CONTRA (Integración Digital Activa)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ verticalAlign: "top", fontSize: "0.85rem", lineHeight: 1.5 }}>
                              <p><strong>• Concentración y atención sostenida:</strong> Reduce interrupciones y distracciones constantes en horas de clase.</p>
                              <p><strong>• Salud mental y convivencia:</strong> Disminuye la incidencia de ciberacoso y fomenta la interacción social directa entre pares.</p>
                              <p><strong>• Equidad en el aula:</strong> Evita brechas visibles entre estudiantes con dispositivos de distinta gama o conectividad.</p>
                              <p><strong>• Pensamiento profundo:</strong> Estimula la lectura analítica y la escritura reflexiva sin atajos digitales inmediatos.</p>
                            </td>
                            <td style={{ verticalAlign: "top", fontSize: "0.85rem", lineHeight: 1.5 }}>
                              <p><strong>• Competencia Digital CNEB (Comp. 28):</strong> Prepara a los estudiantes para desenvolverse éticamente en entornos virtuales.</p>
                              <p><strong>• Acceso inmediato a la información:</strong> Permite corroborar fuentes, explorar simuladores y bases de datos en tiempo real.</p>
                              <p><strong>• Alfabetización crítica:</strong> Enseña a discernir noticias falsas y gestionar el autocontrol bajo guía docente.</p>
                              <p><strong>• Herramienta versátil:</strong> Facilita evaluaciones formativas interactivas, encuestas de aula y portafolios digitales.</p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Ficha de Registro del Jurado/Estudiante */}
                    <h3 className="word-section-h2" style={{ marginBottom: "0.6rem" }}>FICHA DE OBSERVACIÓN Y REGISTRO DEL ESTUDIANTE / JURADO</h3>
                    <div className="word-table-responsive">
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "25%" }}>Criterio Evaluado</th>
                            <th style={{ width: "37%" }}>Equipo A Favor (Anotaciones / Puntaje 1-4)</th>
                            <th style={{ width: "38%" }}>Equipo En Contra (Anotaciones / Puntaje 1-4)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            "Solidez y coherencia de los argumentos",
                            "Uso de datos, evidencias y ejemplos",
                            "Claridad de expresión, tono y respeto",
                            "Capacidad de refutación de ideas contrarias",
                          ].map((crit, cIdx) => (
                            <tr key={cIdx}>
                              <td className="word-table-cell-bold">{crit}</td>
                              <td style={{ color: "#94a3b8" }}>Notas: ________________________________<br />Puntaje: [ &nbsp;&nbsp; ]</td>
                              <td style={{ color: "#94a3b8" }}>Notas: ________________________________<br />Puntaje: [ &nbsp;&nbsp; ]</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Rúbrica y Solucionario Docente */}
                    <div style={{ marginTop: "2.5rem", borderTop: "2px dashed #bdd7ee", paddingTop: "1.5rem" }}>
                      <h3 className="word-section-h2">RÚBRICA DE EVALUACIÓN Y PAUTA DOCENTE: DEBATE EN EL AULA</h3>
                      <p style={{ fontSize: "0.85rem", color: "#64748b", fontStyle: "italic", marginBottom: "0.75rem" }}>
                        (USO EXCLUSIVO DEL DOCENTE - EVALUACIÓN FORMATIVA CNEB)
                      </p>
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "20%" }}>Criterio CNEB</th>
                            <th style={{ width: "20%" }} className="word-table-cell-center">AD - Destacado</th>
                            <th style={{ width: "20%" }} className="word-table-cell-center">A - Esperado</th>
                            <th style={{ width: "20%" }} className="word-table-cell-center">B - En Proceso</th>
                            <th style={{ width: "20%" }} className="word-table-cell-center">C - En Inicio</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="word-table-cell-bold">Argumentación y Sustento Ético</td>
                            <td style={{ fontSize: "0.8rem" }}>Argumenta con profundidad, citando múltiples fuentes y relacionando ética con bienestar social.</td>
                            <td style={{ fontSize: "0.8rem" }}>Sustenta sus posturas con argumentos lógicos y fuentes verídicas adecuadas al tema.</td>
                            <td style={{ fontSize: "0.8rem" }}>Presenta argumentos con escasas evidencias o basados en opiniones generales.</td>
                            <td style={{ fontSize: "0.8rem" }}>Expone afirmaciones sin justificación ni evidencia comprobable.</td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">Contraargumentación y Escucha</td>
                            <td style={{ fontSize: "0.8rem" }}>Refuta con agudeza lógica argumentos contrarios, respondiendo con datos y cortesía intachable.</td>
                            <td style={{ fontSize: "0.8rem" }}>Contraargumenta respondiendo directamente a las objeciones del equipo oponente.</td>
                            <td style={{ fontSize: "0.8rem" }}>Intenta refutar pero desvía el foco de la discusión o reitera su postura inicial.</td>
                            <td style={{ fontSize: "0.8rem" }}>No responde a las objeciones o interrumpe sin escuchar a los demás.</td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">Competencia Comunicativa Oral</td>
                            <td style={{ fontSize: "0.8rem" }}>Uso sobresaliente de recursos no verbales, modulación vocal y manejo impecable del tiempo.</td>
                            <td style={{ fontSize: "0.8rem" }}>Vocalización clara, lenguaje formal y empleo correcto del tiempo asignado.</td>
                            <td style={{ fontSize: "0.8rem" }}>Tono monótono o vacilante, con ligeros excesos o faltas en el uso del tiempo.</td>
                            <td style={{ fontSize: "0.8rem" }}>Dificultad notoria para expresarse oralmente o abandono antes del tiempo.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                ) : toolId.includes("casos-estudio") ? (
                  /* Si es Estudio de Caso ABP */
                  <section className="word-section">
                    <h2 className="word-section-h1">I. ESTUDIO DE CASO ABP: INVESTIGACIÓN Y RESOLUCIÓN DE PROBLEMAS</h2>
                    <div style={{ background: "rgba(31, 77, 120, 0.08)", borderLeft: "4px solid #1f4d78", padding: "0.85rem 1rem", borderRadius: "4px", marginBottom: "1.25rem" }}>
                      <strong style={{ color: "var(--word-primary, #1f4d78)", display: "block", marginBottom: "0.25rem", fontSize: "0.95rem" }}>
                        Título del Caso Problemático:
                      </strong>
                      <p style={{ margin: 0, fontWeight: 700, fontSize: "1rem", color: "inherit" }}>
                        {artifact.document_title || "Dilema de la Gestión del Agua y Desarrollo Sostenible"}
                      </p>
                    </div>

                    <div style={{ marginBottom: "1.5rem" }}>
                      <strong style={{ display: "block", marginBottom: "0.4rem", color: "var(--word-primary, #1f4d78)", fontSize: "0.95rem" }}>
                        Situación Problemática Real:
                      </strong>
                      <p className="word-paper-p" style={{ fontSize: "0.92rem", lineHeight: 1.6, color: "inherit", margin: 0 }}>
                        {artifact.executive_summary || "En una cuenca agrícola costera, la escasez hídrica estacional genera tensiones entre la pequeña agricultura comunal, las empresas agroexportadoras de riego presurizado y la demanda de agua potable de los centros urbanos en crecimiento."}
                      </p>
                    </div>

                    {/* Matriz de Actores */}
                    <h3 className="word-section-h2" style={{ marginBottom: "0.6rem" }}>MATRIZ DE ACTORES Y POSICIONES EN CONFLICTO</h3>
                    <div className="word-table-responsive" style={{ marginBottom: "1.75rem" }}>
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "25%" }}>Actor Social / Institución</th>
                            <th style={{ width: "25%" }}>Interés y Postura Principal</th>
                            <th style={{ width: "25%" }}>Sustento Legal y Económico</th>
                            <th style={{ width: "25%" }}>Propuesta de Solución</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="word-table-cell-bold">Comunidad de Pequeños Agricultores</td>
                            <td>Defensa de derechos de agua tradicionales para cultivos de panllevar y seguridad alimentaria.</td>
                            <td>Uso consuetudinario ancestral y soberanía alimentaria familiar local.</td>
                            <td>Respetar turnos tradicionales y subsidio estatal para revestimiento de canales.</td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">Asociación de Agroexportadores</td>
                            <td>Garantizar volumen hídrico constante para plantaciones de alta productividad y contratos externos.</td>
                            <td>Generación de empleo formal, divisas para el país e inversión en riego por goteo.</td>
                            <td>Construcción de pozos tubulares profundos y ampliación de reservorios privados.</td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">Población Urbana y Municipio</td>
                            <td>Acceso ininterrumpido a agua potable de calidad para consumo humano diario.</td>
                            <td>Artículo 7-A de la Constitución Política: Derecho fundamental irrenunciable al agua.</td>
                            <td>Prioridad absoluta de la red pública sobre cualquier actividad extractiva o agrícola.</td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">Autoridad Nacional del Agua (ANA)</td>
                            <td>Equilibrio hídrico de la cuenca y preservación del caudal ecológico mínimo.</td>
                            <td>Ley de Recursos Hídricos N° 29338: el agua es patrimonio de la Nación.</td>
                            <td>Comité de gestión de cuenca con monitoreo digital y medición obligatoria de consumos.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Preguntas Guía de Análisis ABP */}
                    <h3 className="word-section-h2" style={{ marginBottom: "0.6rem" }}>PREGUNTAS GUÍA DE ANÁLISIS CRÍTICO Y PROPUESTA ABP</h3>
                    <div className="word-table-responsive">
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "8%" }} className="word-table-cell-center">N°</th>
                            <th style={{ width: "42%" }}>Desafío Cognitivo / Pregunta Investigativa</th>
                            <th style={{ width: "50%" }}>Análisis Crítico y Propuesta del Equipo Estudiantil</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            {
                              num: 1,
                              q: "¿Cuál es la raíz multidimensional del conflicto? Identifica causas económicas, ambientales y políticas.",
                            },
                            {
                              num: 2,
                              q: "¿Cómo se jerarquiza el uso del agua según la legislación peruana frente a las demandas del mercado?",
                            },
                            {
                              num: 3,
                              q: "Diseña una propuesta de solución concertada que equilibre productividad, justicia social y conservación ecológica.",
                            },
                            {
                              num: 4,
                              q: "¿Qué compromisos éticos debe asumir cada actor social para garantizar la sostenibilidad a 10 años?",
                            },
                          ].map((item) => (
                            <tr key={item.num}>
                              <td className="word-table-cell-center word-table-cell-bold">{item.num}</td>
                              <td className="word-table-cell-bold">{item.q}</td>
                              <td style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                                Líneas de análisis y evidencia:<br />
                                ____________________________________________________<br />
                                ____________________________________________________<br />
                                ____________________________________________________
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Guía Metodológica Docente */}
                    <div style={{ marginTop: "2.5rem", borderTop: "2px dashed #bdd7ee", paddingTop: "1.5rem" }}>
                      <h3 className="word-section-h2">GUÍA METODOLÓGICA Y CRITERIOS DE EVALUACIÓN ABP</h3>
                      <p style={{ fontSize: "0.85rem", color: "#64748b", fontStyle: "italic", marginBottom: "0.75rem" }}>
                        (PAUTA DOCENTE - EVALUACIÓN DE COMPETENCIAS CIUDADANAS Y ECONÓMICAS)
                      </p>
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "25%" }}>Criterio de Evaluación ABP</th>
                            <th style={{ width: "40%" }}>Nivel Esperado / Evidencia de Aprendizaje</th>
                            <th style={{ width: "35%" }}>Intervención Docente / Retroalimentación</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="word-table-cell-bold">Comprensión Multicausal</td>
                            <td style={{ fontSize: "0.82rem" }}>Distingue con claridad entre la sequía climática natural y las presiones antrópicas derivadas del crecimiento agroexportador y urbano.</td>
                            <td style={{ fontSize: "0.82rem" }}>Formular repreguntas sobre externalidades ambientales y agotamiento del acuífero.</td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">Ponderación Ética y Legal</td>
                            <td style={{ fontSize: "0.82rem" }}>Aplica el orden de prioridad de la Ley N° 29338 (1° Primario/Poblacional, 2° Agrícola/Ecológico, 3° Productivo/Industrial).</td>
                            <td style={{ fontSize: "0.82rem" }}>Verificar que la solución del equipo no vulnere el acceso básico de las poblaciones vulnerables.</td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">Viabilidad de la Propuesta</td>
                            <td style={{ fontSize: "0.82rem" }}>Propone acuerdos concretos: tecnificación de riego comunal financiada con obras por impuestos y junta de cuenca paritaria.</td>
                            <td style={{ fontSize: "0.82rem" }}>Evaluar si los costos, plazos y mecanismos de fiscalización propuestos son factibles en la realidad.</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                ) : (
                  /* Actividades y Retos estándar */
                  <section className="word-section">
                    {artifact.sections.map((sec, idx) => (
                      <div key={idx} style={{ marginBottom: "1.75rem" }}>
                        <h2 className="word-section-h1">{idx + 1}. {sec.title}</h2>
                        <p className="word-paper-p">{sec.narrative}</p>
                        {sec.key_points.length > 0 ? (
                          <div className="word-table-responsive">
                            <table className="word-table">
                              <thead>
                                <tr>
                                  <th style={{ width: "8%" }} className="word-table-cell-center">Paso</th>
                                  <th style={{ width: "52%" }}>Consigna / Reto</th>
                                  <th style={{ width: "40%" }}>Respuesta o Evidencia del Estudiante</th>
                                </tr>
                              </thead>
                              <tbody>
                                {sec.key_points.map((p, pIdx) => (
                                  <tr key={pIdx}>
                                    <td className="word-table-cell-center">{pIdx + 1}</td>
                                    <td>{p}</td>
                                    <td style={{ minHeight: "40px", color: "#64748b", fontSize: "0.82rem" }}>
                                      Evidencia / Respuesta del estudiante:
                                      <div style={{ borderBottom: "1px dashed #cbd5e1", marginTop: "0.75rem" }} />
                                      <div style={{ borderBottom: "1px dashed #cbd5e1", marginTop: "0.75rem" }} />
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </section>
                )}

                {/* Solucionario docente */}
                <section className="word-section" style={{ marginTop: "2rem", borderTop: "2px dashed #bdd7ee", paddingTop: "1rem" }}>
                  <h3 className="word-section-h2">SOLUCIONARIO Y CLAVE DE VERIFICACIÓN (USO DOCENTE)</h3>
                  <p className="word-paper-p" style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    Esta sección debe ser retirada o doblada antes de entregar la ficha a los estudiantes.
                  </p>
                  <ul>
                    {artifact.teacher_recommendations.map((rec, idx) => (
                      <li key={idx} style={{ fontSize: "0.85rem", color: "#475569" }}>{rec}</li>
                    ))}
                  </ul>
                </section>
              </>
            ) : null}

            {/* ==================== 3. ARQUETIPO: ANÁLISIS Y ALERTAS ==================== */}
            {isAnalytics ? (
              <>
                <header className="word-paper-header">
                  <div className="word-paper-motto">
                    DOCUMENTO PEDAGÓGICO EDITABLE
                  </div>
                  <h1 className="word-paper-title">{artifact.document_title}</h1>
                  <div className="word-paper-subtitle">
                    INFORME TÉCNICO PEDAGÓGICO DE SEGUIMIENTO Y ALERTAS
                  </div>
                </header>

                <section className="word-section">
                  <h2 className="word-section-h1">I. DATOS DEL INFORME</h2>
                  <div className="word-table-responsive">
                    <table className="word-table">
                      <tbody>
                        <tr>
                          <td className="word-table-cell-bold" style={{ width: "35%" }}>Institución Educativa</td>
                          <td>{ie}</td>
                        </tr>
                        <tr>
                          <td className="word-table-cell-bold">Grado y Sección evaluada</td>
                          <td>{grade} "{section}" · {area}</td>
                        </tr>
                        <tr>
                          <td className="word-table-cell-bold">Docente Responsable</td>
                          <td>{teacher}</td>
                        </tr>
                        <tr>
                          <td className="word-table-cell-bold">Fecha de Emisión</td>
                          <td>{new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="word-section">
                  <h2 className="word-section-h1">II. RESUMEN EJECUTIVO Y DIAGNÓSTICO</h2>
                  <p className="word-paper-p">{artifact.executive_summary}</p>
                </section>

                <section className="word-section">
                  <h2 className="word-section-h1">III. MATRIZ SEMAFORIZADA DE RIESGO Y ESTADO PEDAGÓGICO</h2>
                  <div className="word-table-responsive">
                    <table className="word-table">
                      <thead>
                        <tr>
                          <th style={{ width: "25%" }}>Ámbito / Competencia</th>
                          <th style={{ width: "15%" }} className="word-table-cell-center">Nivel de Riesgo</th>
                          <th style={{ width: "35%" }}>Hallazgo Pedagógico Observado</th>
                          <th style={{ width: "25%" }}>Acción Remedial Prioritaria</th>
                        </tr>
                      </thead>
                      <tbody>
                        {artifact.sections.map((sec, idx) => (
                          <tr key={idx}>
                            <td className="word-table-cell-bold">{sec.title}</td>
                            <td className="word-table-cell-center">
                              <span
                                className={`word-status-badge ${
                                  idx === 0
                                    ? "word-status-badge--danger"
                                    : idx === 1
                                    ? "word-status-badge--warning"
                                    : "word-status-badge--success"
                                }`}
                              >
                                {idx === 0 ? "Crítico (Alerta)" : idx === 1 ? "En Proceso" : "Monitoreo"}
                              </span>
                            </td>
                            <td>{sec.narrative}</td>
                            <td>{sec.key_points[0] || "Acompañamiento personalizado en aula."}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="word-section">
                  <h2 className="word-section-h1">IV. PLAN DE ACCIÓN Y COMPROMISOS INSTITUCIONALES</h2>
                  <ul>
                    {artifact.teacher_recommendations.map((rec, idx) => (
                      <li key={idx} style={{ marginBottom: "0.4rem" }}>{rec}</li>
                    ))}
                  </ul>
                </section>

                <div className="word-signatures-box">
                  <div>
                    <div className="word-signature-line">____________________________________________</div>
                    <div className="word-signature-name">{teacher}</div>
                    <div className="word-signature-role">Docente Responsable del Análisis</div>
                  </div>
                  <div>
                    <div className="word-signature-line">____________________________________________</div>
                    <div className="word-signature-name">{director}</div>
                    <div className="word-signature-role">Director(a) / Coordinador(a) Pedagógico</div>
                  </div>
                </div>
              </>
            ) : null}

            {/* ==================== 4. ARQUETIPO: COMUNICACIONES ==================== */}
            {isCommunication ? (
              <>
                <header className="word-paper-header">
                  <div className="word-paper-motto">
                    DOCUMENTO PEDAGÓGICO EDITABLE
                  </div>
                  <h1 className="word-paper-title">{ie}</h1>
                  <div className="word-paper-subtitle">
                    COMUNICACIÓN OFICIAL A LA FAMILIA · CICLO ESCOLAR {year}
                  </div>
                </header>

                <div className="word-communication-envelope">
                  <div style={{ marginBottom: "0.75rem", fontSize: "0.9375rem" }}>
                    <strong>Para:</strong> {guardian} (Padre, madre o tutor legal)
                  </div>
                  <div style={{ marginBottom: "0.75rem", fontSize: "0.9375rem" }}>
                    <strong>Estudiante:</strong> {student} · {grade} "{section}"
                  </div>
                  <div style={{ marginBottom: "0.75rem", fontSize: "0.9375rem" }}>
                    <strong>Asunto:</strong> {artifact.document_title}
                  </div>
                  <div style={{ fontSize: "0.9375rem" }}>
                    <strong>Fecha:</strong> {new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" })}
                  </div>
                </div>

                <section className="word-section">
                  <p className="word-paper-p">
                    Estimada familia {guardian}:
                  </p>
                  <p className="word-paper-p">
                    Reciban un cordial saludo institucional de parte del equipo directivo y docente de la I.E. "{ie}". Por medio de la presente nos dirigimos a ustedes para informarles lo siguiente:
                  </p>
                  <p className="word-paper-p" style={{ fontWeight: 600 }}>
                    {artifact.executive_summary}
                  </p>

                  {artifact.sections.map((sec, idx) => (
                    <div key={idx} style={{ margin: "1.25rem 0" }}>
                      <h3 className="word-section-h2" style={{ textDecoration: "underline" }}>{sec.title}</h3>
                      <p className="word-paper-p">{sec.narrative}</p>
                      {sec.key_points.length > 0 ? (
                        <ul>
                          {sec.key_points.map((p, pIdx) => (
                            <li key={pIdx} style={{ marginBottom: "0.35rem" }}>{p}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}

                  <p className="word-paper-p" style={{ marginTop: "1.5rem" }}>
                    Agradecemos de antemano su constante compromiso con la formación integral de su menor hijo(a).
                  </p>
                  <p className="word-paper-p">
                    Atentamente,
                  </p>
                </section>

                <div className="word-signatures-box" style={{ marginTop: "2rem" }}>
                  <div>
                    <div className="word-signature-line">____________________________________________</div>
                    <div className="word-signature-name">{teacher}</div>
                    <div className="word-signature-role">Docente Tutor(a) / Responsable de Área</div>
                  </div>
                  <div>
                    <div className="word-signature-line">____________________________________________</div>
                    <div className="word-signature-name">{director}</div>
                    <div className="word-signature-role">Dirección General</div>
                  </div>
                </div>

                {/* Talón desglosable para la familia */}
                <div className="word-tear-off-slip">
                  <span className="word-tear-off-label">✂ Talón de Acuse de Recibo (Desglosar y entregar firmado al aula)</span>
                  <div style={{ fontSize: "0.8125rem", lineHeight: "1.5", marginTop: "0.5rem" }}>
                    Yo, ____________________________________________________, identificado con DNI N.° __________________,
                    padre/madre/tutor de {student} del {grade} "{section}", confirmo haber recibido y tomado conocimiento de la comunicación "{artifact.document_title}".
                    <br /><br />
                    Firma del Padre / Apoderado: __________________________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Teléfono: ___________________
                  </div>
                </div>
              </>
            ) : null}

            {/* ==================== 5. ARQUETIPO: DOCUMENTOS Y RECURSOS ==================== */}
            {isDocument || isResource ? (
              <>
                <header className="word-paper-header">
                  <div className="word-paper-motto">
                    DOCUMENTO PEDAGÓGICO EDITABLE
                  </div>
                  <h1 className="word-paper-title">{artifact.document_title}</h1>
                  <div className="word-paper-subtitle">
                    {area.toUpperCase()} · NIVEL: {level.toUpperCase()} · GRADO: {grade.toUpperCase()} "{section}"
                  </div>
                </header>

                <section className="word-section">
                  <h2 className="word-section-h1">I. DATOS INFORMATIVOS</h2>
                  <div className="word-table-responsive">
                    <table className="word-table">
                      <tbody>
                        <tr>
                          <td className="word-table-cell-bold" style={{ width: "35%" }}>DRE</td>
                          <td>{dre}</td>
                        </tr>
                        <tr>
                          <td className="word-table-cell-bold">UGEL</td>
                          <td>{ugel}</td>
                        </tr>
                        <tr>
                          <td className="word-table-cell-bold">INSTITUCIÓN EDUCATIVA</td>
                          <td>{ie}</td>
                        </tr>
                        <tr>
                          <td className="word-table-cell-bold">NIVEL / GRADO / SECCIÓN</td>
                          <td>{level} / {grade} "{section}"</td>
                        </tr>
                        <tr>
                          <td className="word-table-cell-bold">ÁREA CURRICULAR</td>
                          <td>{area}</td>
                        </tr>
                        <tr>
                          <td className="word-table-cell-bold">DOCENTE RESPONSABLE</td>
                          <td>{teacher}</td>
                        </tr>
                        <tr>
                          <td className="word-table-cell-bold">DIRECTOR(A)</td>
                          <td>{director}</td>
                        </tr>
                        <tr>
                          <td className="word-table-cell-bold">AÑO LECTIVO</td>
                          <td>{year}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="word-section">
                  <h2 className="word-section-h1">II. PROPÓSITO GENERAL Y FUNDAMENTACIÓN</h2>
                  <p className="word-paper-p">{artifact.executive_summary}</p>
                </section>

                {/* Si es Sesión de Aprendizaje, desplegamos la tabla de los 3 momentos didácticos */}
                {(artifact.tables?.length ?? 0) > 0 ? (
                  <GeneratedArtifactTables artifact={artifact} heading="III. MATRICES DE PLANIFICACIÓN" editingResult={editingResult} onUpdateTableCell={onUpdateTableCell} />
                ) : toolId.includes("sesion") ? (
                  <section className="word-section">
                    <h2 className="word-section-h1">III. SECUENCIA DIDÁCTICA Y PROCESOS PEDAGÓGICOS</h2>
                    <div className="word-table-responsive">
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "20%" }}>Momento Didáctico</th>
                            <th style={{ width: "12%" }} className="word-table-cell-center">Tiempo</th>
                            <th style={{ width: "68%" }}>Actividades, Mediación y Procesos Pedagógicos</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="word-table-cell-bold">INICIO</td>
                            <td className="word-table-cell-center">15 - 20 min</td>
                            <td>
                              • Motivación y problematización inicial.<br />
                              • Recuperación de saberes previos y conflicto cognitivo.<br />
                              • Comunicación del propósito de aprendizaje y acuerdos de convivencia.
                            </td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">DESARROLLO</td>
                            <td className="word-table-cell-center">55 - 60 min</td>
                            <td>
                              • Gestión y acompañamiento del desarrollo de las competencias.<br />
                              • Trabajo individual y colaborativo con material concreto o textos.<br />
                              • Retroalimentación por descubrimiento reflexivo ante errores constructivos.
                            </td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">CIERRE</td>
                            <td className="word-table-cell-center">10 - 15 min</td>
                            <td>
                              • Metacognición: ¿Qué aprendimos hoy? ¿Qué dificultades tuvimos y cómo las superamos?<br />
                              • Evaluación del cumplimiento de acuerdos y compromisos para el hogar.
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                ) : null}

                {/* Secciones pedagógicas desarrolladas */}
                <section className="word-section">
                  <h2 className="word-section-h1">
                    {toolId.includes("sesion") ? "IV. DESARROLLO DE CONTENIDOS Y EVIDENCIAS" : "III. PLANIFICACIÓN Y CONTENIDOS"}
                  </h2>
                  {artifact.sections.map((sec, idx) => (
                    <div key={idx} style={{ marginBottom: "1.5rem" }}>
                      <h3 className="word-section-h2">{idx + 1}. {sec.title}</h3>
                      <p className="word-paper-p">{sec.narrative}</p>
                      {sec.key_points.length > 0 ? (
                        <ul>
                          {sec.key_points.map((p, pIdx) => (
                            <li key={pIdx} style={{ marginBottom: "0.35rem" }}>{p}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </section>

                {artifact.teacher_recommendations.length > 0 ? (
                  <section className="word-section">
                    <h2 className="word-section-h1">ORIENTACIONES PARA LA REVISIÓN DOCENTE</h2>
                    <ul>
                      {artifact.teacher_recommendations.map((rec, idx) => (
                        <li key={idx} style={{ marginBottom: "0.4rem" }}>{rec}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                <div className="word-signatures-box">
                  <div>
                    <div className="word-signature-line">____________________________________________</div>
                    <div className="word-signature-name">{teacher}</div>
                    <div className="word-signature-role">Docente Responsable de {area}</div>
                  </div>
                  <div>
                    <div className="word-signature-line">____________________________________________</div>
                    <div className="word-signature-name">{director}</div>
                    <div className="word-signature-role">Director(a) / Equipo Directivo</div>
                  </div>
                </div>
              </>
            ) : null}
          </article>
        </div>
      ) : (
        <div className={`workflow-artifact__grid ${editingResult ? "is-editing" : ""}`}>
          {artifact.sections.map((sectionItem, index) => (
            <article key={`${sectionItem.title}-${index}`}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {editingResult && onUpdateSection ? (
                <>
                  <input
                    value={sectionItem.title}
                    aria-label={`Título de ${sectionItem.title}`}
                    onChange={(event) => onUpdateSection(index, "title", event.target.value)}
                  />
                  <textarea
                    rows={8}
                    value={sectionItem.narrative}
                    aria-label={`Contenido de ${sectionItem.title}`}
                    onChange={(event) => onUpdateSection(index, "narrative", event.target.value)}
                  />
                  {onRegenerateSection ? (
                    <button className="workflow-section-regenerate" type="button" disabled={regeneratingSection === index} onClick={() => onRegenerateSection(index)}>
                      {regeneratingSection === index ? <LoaderCircle className="is-spinning" /> : <RefreshCw />}
                      {regeneratingSection === index ? "Mejorando sección…" : "Regenerar solo esta sección"}
                    </button>
                  ) : null}
                </>
              ) : (
                <>
                  <h2>{sectionItem.title}</h2>
                  <p>{sectionItem.narrative}</p>
                  {sectionItem.key_points.length > 0 ? (
                    <ul>
                      {sectionItem.key_points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  ) : null}
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

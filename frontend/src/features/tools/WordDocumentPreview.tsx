import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Expand,
  FileText,
  Focus,
  LayoutGrid,
  LoaderCircle,
  Maximize2,
  Minimize2,
  Printer,
  RefreshCw,
  Rows3,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import type { WorkflowDefinition } from "../../config/workflows";
import { AnswerKeyTable, DocumentCover, DocumentIndex, InfoTable, KeyPointList, KeyPointText, Narrative, PreviewTables, QuestionBlock, RiskBadge, ScoringTable, SignatureBox, type IndexEntry } from "./DocumentText";
import { attachTablesToSections, isPlaceholder, resolveQuestions, riskLevelFor, rubricScoring, toRoman, stripNumbering } from "./documentFormat";
import type { WorkflowArtifactTable, WorkflowArtifact } from "./exportWorkflowDocx";
import { HomeworkDocumentPreview } from "./HomeworkDocumentPreview";
import { PdfDocumentPreview } from "./PdfDocumentPreview";
import { PlanAnualDocumentPreview } from "./PlanAnualDocumentPreview";
import "../../styles/word-preview.css";

/** Herramientas cuyo Word lleva portada e índice (ver LONG_DOCUMENTS en exportWorkflowDocx.ts). */
const LONG_DOCUMENT_KINDS: Array<[string, string]> = [
  ["carpeta-pedagogica", "Carpeta pedagógica"],
  ["unidad-aprendizaje", "Unidad de aprendizaje"],
  ["proyectos-integrados", "Proyecto de aprendizaje integrado"],
  ["plan-tutoria", "Plan de tutoría"],
  ["plan-atencion", "Plan de atención"],
  ["plan-refuerzo", "Plan de refuerzo"],
];

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
  onPrepareExactPreview?: () => Promise<Blob>;
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
  const tables = (artifact.tables ?? []).map((table, index) => ({ table, index }));
  if (!tables.length) return null;
  return (
    <section className="word-section generated-artifact-tables">
      <h2 className="word-section-h1">{heading}</h2>
      <PreviewTables tables={tables} editingResult={editingResult} onUpdateTableCell={onUpdateTableCell} />
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
  onPrepareExactPreview,
}: Props) {
  const [viewMode, setViewMode] = useState<"word" | "grid">("word");
  const [documentMode, setDocumentMode] = useState<"fit-width" | "fit-result" | "reading">("fit-width");
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [documentLayout, setDocumentLayout] = useState({ scale: 1, width: 960, height: 1358 });
  const [pageBreaks, setPageBreaks] = useState([{ from: 0, to: 1358 }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [exactPreview, setExactPreview] = useState<Blob | null>(null);
  const [exactPreviewStatus, setExactPreviewStatus] = useState<"idle" | "loading" | "unavailable">("idle");
  const [exactPreviewAttempt, setExactPreviewAttempt] = useState(0);
  const exactPreviewFailed = useCallback(() => {
    setExactPreview(null);
    setExactPreviewStatus("unavailable");
  }, []);
  const previewWrapperRef = useRef<HTMLDivElement>(null);
  const previewViewportRef = useRef<HTMLDivElement>(null);
  const documentPaperRef = useRef<HTMLElement>(null);
  const pageMarkerRefs = useRef<Array<HTMLDivElement | null>>([]);

  useLayoutEffect(() => {
    if (viewMode !== "word" || documentMode === "reading") return undefined;

    const paper = documentPaperRef.current;
    if (!paper) return undefined;
    const pageHeight = 1358;
    const minimumPageContent = 260;

    const updatePages = () => {
      const paperRect = paper.getBoundingClientRect();
      const scale = documentLayout.scale || 1;
      const documentHeight = Math.ceil(paper.scrollHeight);
      const candidates = [...paper.querySelectorAll<HTMLElement>([
        ".word-paper-header",
        ".word-student-exam-header",
        ".word-section:not(.generated-artifact-tables)",
        ".generated-artifact-table",
        ".word-signatures-box",
        ".word-tear-off-slip",
        ".word-table tr",
      ].join(", "))]
        .map((element) => Math.round((element.getBoundingClientRect().bottom - paperRect.top) / scale))
        .filter((bottom) => bottom > 0 && bottom < documentHeight)
        .sort((a, b) => a - b);

      const nextPages: Array<{ from: number; to: number }> = [];
      let from = 0;
      while (from < documentHeight - 1) {
        const target = Math.min(documentHeight, from + pageHeight);
        const candidate = candidates.filter((bottom) => bottom > from + minimumPageContent && bottom <= target).at(-1);
        const to = target >= documentHeight
          ? documentHeight
          : Math.max(from + minimumPageContent, candidate ?? target);
        nextPages.push({ from, to });
        from = to;
      }

      /* Evita una última página casi vacía: el cierre y las firmas se unen
         a la página previa cuando no alcanzan una fracción útil de hoja. */
      if (nextPages.length > 1) {
        const lastPage = nextPages.at(-1)!;
        if (lastPage.to - lastPage.from < pageHeight * 0.45) {
          const previousPage = nextPages.at(-2)!;
          previousPage.to = lastPage.to;
          nextPages.pop();
        }
      }

      const normalizedPages = nextPages.length ? nextPages : [{ from: 0, to: pageHeight }];
      setPageBreaks((current) => (
        current.length === normalizedPages.length && current.every((page, index) => page.from === normalizedPages[index]?.from && page.to === normalizedPages[index]?.to)
          ? current
          : normalizedPages
      ));
    };

    updatePages();
    if (typeof ResizeObserver === "undefined") return undefined;
    const resizeObserver = new ResizeObserver(updatePages);
    resizeObserver.observe(paper);
    return () => resizeObserver.disconnect();
  }, [artifact, documentLayout.scale, documentMode, viewMode]);

  useLayoutEffect(() => {
    if (viewMode !== "word" || documentMode === "reading") return undefined;

    const viewport = previewViewportRef.current;
    const paper = documentPaperRef.current;
    if (!viewport || !paper) return undefined;

    const updateLayout = () => {
      const viewportStyle = window.getComputedStyle(viewport);
      const horizontalPadding = Number.parseFloat(viewportStyle.paddingLeft) + Number.parseFloat(viewportStyle.paddingRight);
      const verticalPadding = Number.parseFloat(viewportStyle.paddingTop) + Number.parseFloat(viewportStyle.paddingBottom);
      const availableWidth = Math.max(1, viewport.clientWidth - horizontalPadding);
      const measuredViewportHeight = viewport.clientHeight - verticalPadding;
      const availableHeight = documentMode === "fit-result"
        ? Math.max(120, measuredViewportHeight)
        : Math.max(240, window.innerHeight - verticalPadding - (isFullscreen ? 150 : 210));
      const paperWidth = paper.offsetWidth || 960;
      const paperHeight = paper.scrollHeight || 1100;
      const widthScale = Math.min(1, availableWidth / paperWidth);
      const resultScale = Math.min(widthScale, availableHeight / paperHeight);
      const baseScale = documentMode === "fit-result" ? resultScale : widthScale;
      const scale = Math.max(0.03, Math.min(1.75, baseScale * zoom));
      const nextLayout = {
        scale,
        width: Math.ceil(paperWidth * scale),
        height: Math.ceil(paperHeight * scale),
      };
      setDocumentLayout((current) => (
        Math.abs(current.scale - nextLayout.scale) < 0.001
        && current.width === nextLayout.width
        && current.height === nextLayout.height
          ? current
          : nextLayout
      ));
    };

    updateLayout();
    window.addEventListener("resize", updateLayout);
    if (typeof ResizeObserver === "undefined") {
      return () => window.removeEventListener("resize", updateLayout);
    }
    const resizeObserver = new ResizeObserver(updateLayout);
    resizeObserver.observe(viewport);
    resizeObserver.observe(paper);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateLayout);
    };
  }, [artifact, documentMode, isFullscreen, viewMode, zoom]);

  useEffect(() => {
    if (!isFullscreen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullscreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!onPrepareExactPreview || viewMode !== "word") return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setExactPreview(null);
      setExactPreviewStatus("loading");
    });
    void onPrepareExactPreview()
      .then((file) => { if (!cancelled) setExactPreview(file); })
      .catch(() => { if (!cancelled) setExactPreviewStatus("unavailable"); })
      .finally(() => { if (!cancelled) setExactPreviewStatus((current) => current === "unavailable" ? current : "idle"); });
    return () => { cancelled = true; };
  }, [exactPreviewAttempt, onPrepareExactPreview, toolId, viewMode, workflowKey]);

  const usesPlanAnualPreview = toolId === "plan-curricular-anual"
    || workflowKey === "planificamos/plan-curricular-anual";
  const usesHomeworkPreview = toolId === "tarea-extension-hogar"
    || workflowKey === "planificamos/tarea-extension-hogar";
  const usesSpecialPreview = usesPlanAnualPreview || usesHomeworkPreview;

  if (usesSpecialPreview && exactPreviewStatus === "loading") {
    return (
      <div className="word-preview-wrapper word-preview-wrapper--exact-only">
        <div className="word-pdf-preview__loading" role="status">
          <LoaderCircle className="is-spinning" />
          <span><strong>Preparando todas las páginas…</strong><small>El documento aparecerá hoja por hoja, completo y sin recortes.</small></span>
        </div>
      </div>
    );
  }

  if (usesSpecialPreview && exactPreview) {
    return (
      <div className="word-preview-wrapper word-preview-wrapper--exact-only">
        <div className="word-preview-toolbar">
          <div className="word-preview-toolbar__status">
            <FileText size={18} />
            <span>Previsualización exacta · {artifact.document_title || "Documento pedagógico"}</span>
          </div>
          {onDownloadWord ? (
            <div className="word-preview-toolbar__actions">
              <button type="button" className="word-preview-btn-toggle" onClick={onDownloadWord}>
                <Download size={15} /><span>Descargar Word</span>
              </button>
            </div>
          ) : null}
        </div>
        <PdfDocumentPreview file={exactPreview} documentTitle={artifact.document_title || "Documento pedagógico"} onUnavailable={exactPreviewFailed} />
      </div>
    );
  }

  // Plan Curricular Anual usa su vista especializada de 17 tablas
  if (usesPlanAnualPreview) {
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

  if (usesHomeworkPreview) {
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
  const dre = String(values.dre || "________");
  const ugel = String(values.ugel || "________");
  const ie = String(values.institution || "________________");
  const level = String(values.level || "Secundaria");
  const grade = String(values.grade || "3° de Secundaria");
  const section = String(values.section || "A");
  const area = String(values.curricular_area || values.area || "Educación Básica");
  const teacher = String(values.teacher_name || "________________");
  const director = String(values.director_name || "________________");
  const student = String(values.student_name || "Estudiante");
  const guardian = String(values.guardian_name || values.guardian_names || "");

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
  const safeCurrentPage = Math.min(Math.max(0, currentPage), Math.max(0, pageBreaks.length - 1));
  const hasPageNavigation = documentMode === "fit-width" && pageBreaks.length > 1;
  // Todas las páginas se muestran apiladas y completas; el paginador solo desplaza hasta la hoja elegida.
  const stageHeight = documentLayout.height;
  const goToPage = (index: number) => {
    const target = Math.max(0, Math.min(pageBreaks.length - 1, index));
    setCurrentPage(target);
    pageMarkerRefs.current[target]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div ref={previewWrapperRef} className={`word-preview-wrapper ${isFullscreen ? "is-fullscreen" : ""}`}>
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

      {viewMode === "word" && !exactPreview && exactPreviewStatus !== "loading" ? (
        <div className="word-preview-display-controls" aria-label="Controles de visualización del documento">
          <div className="word-preview-display-controls__modes" role="group" aria-label="Modo de visualización">
            <button type="button" className={documentMode === "fit-width" ? "is-active" : ""} aria-pressed={documentMode === "fit-width"} onClick={() => { setDocumentMode("fit-width"); setZoom(1); }}>
              <Expand size={16} /> Ajustar al ancho
            </button>
            <button type="button" className={documentMode === "fit-result" ? "is-active" : ""} aria-pressed={documentMode === "fit-result"} onClick={() => { setDocumentMode("fit-result"); setZoom(1); }}>
              <Focus size={16} /> Resultado completo
            </button>
            <button type="button" className={documentMode === "reading" ? "is-active" : ""} aria-pressed={documentMode === "reading"} onClick={() => setDocumentMode("reading")}>
              <Rows3 size={16} /> Lectura cómoda
            </button>
          </div>
          <div className="word-preview-display-controls__zoom" role="group" aria-label="Zoom del documento">
            {documentMode !== "reading" ? (
              <>
                <button type="button" aria-label="Alejar documento" disabled={zoom <= 0.55} onClick={() => setZoom((value) => Math.max(0.5, Number((value - 0.1).toFixed(2))))}><ZoomOut size={17} /></button>
                <output aria-live="polite">{Math.round(documentLayout.scale * 100)}%</output>
                <button type="button" aria-label="Acercar documento" disabled={zoom >= 1.55} onClick={() => setZoom((value) => Math.min(1.6, Number((value + 0.1).toFixed(2))))}><ZoomIn size={17} /></button>
              </>
            ) : <span>Vista adaptada al dispositivo</span>}
            <button type="button" aria-label={isFullscreen ? "Salir de pantalla completa" : "Abrir en pantalla completa"} aria-pressed={isFullscreen} onClick={() => setIsFullscreen((value) => !value)}>
              {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
              <span>{isFullscreen ? "Salir" : "Pantalla completa"}</span>
            </button>
          </div>
        </div>
      ) : null}

      {hasPageNavigation && !exactPreview && exactPreviewStatus !== "loading" ? (
        <nav className="word-preview-pager" aria-label="Páginas del documento">
          <button type="button" disabled={safeCurrentPage === 0} onClick={() => goToPage(safeCurrentPage - 1)}>
            <ChevronLeft size={18} /> Anterior
          </button>
          <span aria-live="polite">Página {safeCurrentPage + 1} de {pageBreaks.length} · todas visibles</span>
          <button type="button" disabled={safeCurrentPage === pageBreaks.length - 1} onClick={() => goToPage(safeCurrentPage + 1)}>
            Siguiente <ChevronRight size={18} />
          </button>
        </nav>
      ) : null}

      {/* Contenedor del documento */}
      {viewMode === "word" ? (exactPreview ? <PdfDocumentPreview file={exactPreview} documentTitle={artifact.document_title || "Documento pedagógico"} onUnavailable={exactPreviewFailed} /> : <>
        {exactPreviewStatus === "loading" ? (
          <div className="word-pdf-preview__loading" role="status">
            <LoaderCircle className="is-spinning" />
            <span><strong>Preparando todas las páginas…</strong><small>Puedes seguir revisando la vista rápida mientras termina el documento exacto.</small></span>
          </div>
        ) : null}
        <div ref={previewViewportRef} className={`word-preview-viewport word-preview-viewport--${documentMode}`}>
          <div
            className={`word-document-stage word-document-stage--${documentMode}`}
            style={documentMode === "reading" ? undefined : { width: `${documentLayout.width}px`, height: `${stageHeight}px` }}
          >
          {documentMode === "fit-width" && pageBreaks.length > 1 ? pageBreaks.map((page, index) => (
            <div
              key={`page-${index}`}
              ref={(element) => { pageMarkerRefs.current[index] = element; }}
              className={`word-page-marker ${index === 0 ? "word-page-marker--first" : ""}`}
              style={{ top: `${Math.round(page.from * documentLayout.scale)}px` }}
              aria-hidden="true"
            >
              <span>Página {index + 1} de {pageBreaks.length}</span>
            </div>
          )) : null}
          <article
            ref={documentPaperRef}
            className={`word-document-paper ${documentMode === "reading" ? "word-document-paper--reading" : "word-document-paper--canvas"}`}
            style={documentMode === "reading" ? undefined : { transform: `scale(${documentLayout.scale})` }}
          >
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
                {(artifact.tables?.length ?? 0) > 0 && !toolId.includes("examen") && !toolId.includes("preguntas") ? (
                  <>
                    <GeneratedArtifactTables artifact={artifact} heading="II. MATRICES DE APLICACIÓN" editingResult={editingResult} onUpdateTableCell={onUpdateTableCell} />
                    {(toolId.includes("rubrica") || toolId.includes("escala")) && rubricScoring(artifact.tables?.[0]) ? (
                      <section className="word-section"><ScoringTable scoring={rubricScoring(artifact.tables?.[0])!} /></section>
                    ) : null}
                  </>
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
                ) : (toolId.includes("examen") || toolId.includes("preguntas")) && resolveQuestions(artifact).length ? (() => {
                  const questions = resolveQuestions(artifact);
                  const isTeacher = (title: string) => /(clave|criterios de correcci[oó]n|criterios y retroalimentaci[oó]n|retroalimentaci[oó]n|respuestas esperadas)/i.test(title);
                  const isQuestions = (title: string) => /^preguntas/i.test(title.trim()) || /^preguntas$/i.test(title.trim());
                  const before = artifact.sections.filter((sec) => !isTeacher(sec.title) && !isQuestions(sec.title) && !/matriz de especificaciones/i.test(sec.title));
                  const levels = [...new Set(questions.map((question) => question.cognitive_level || ""))];
                  const groupByLevel = levels.length > 1 || (levels[0] ?? "") !== "";
                  return (
                    <>
                      {(artifact.tables?.length ?? 0) > 0 ? (
                        <GeneratedArtifactTables artifact={artifact} heading="I. MATRIZ DE ESPECIFICACIONES" editingResult={editingResult} onUpdateTableCell={onUpdateTableCell} />
                      ) : null}
                      <section className="word-section">
                        <h2 className="word-section-h1">II. REACTIVOS Y CONSIGNAS DE EVALUACIÓN</h2>
                        {before.map((sec, idx) => (
                          <div key={idx} style={{ marginBottom: "1rem" }}>
                            <h3 className="word-section-h2">{sec.title}</h3>
                            <Narrative text={sec.narrative} />
                            <KeyPointList items={sec.key_points} />
                          </div>
                        ))}
                        {groupByLevel ? levels.map((level) => (
                          <div key={level || "preguntas"}>
                            <h3 className="word-section-h2">{level ? `Preguntas de nivel ${level.toLocaleLowerCase("es")}` : "Preguntas"}</h3>
                            {questions.filter((question) => (question.cognitive_level || "") === level).map((question) => <QuestionBlock key={question.number} question={question} />)}
                          </div>
                        )) : (
                          <div>
                            <h3 className="word-section-h2">Preguntas</h3>
                            {questions.map((question) => <QuestionBlock key={question.number} question={question} />)}
                          </div>
                        )}
                      </section>
                      <section className="word-section word-teacher-guide">
                        <h2 className="word-section-h1">GUÍA DOCENTE · NO ENTREGAR AL ESTUDIANTE</h2>
                        <AnswerKeyTable questions={questions} />
                        {artifact.sections.filter((sec) => isTeacher(sec.title) && !(questions.some((q) => q.answer) && /clave/i.test(sec.title))).map((sec, idx) => (
                          <div key={idx} style={{ marginBottom: "1rem" }}>
                            <h3 className="word-section-h2">{sec.title}</h3>
                            <Narrative text={sec.narrative} />
                            <KeyPointList items={sec.key_points} />
                          </div>
                        ))}
                      </section>
                    </>
                  );
                })() : (
                  /* Otros instrumentos */
                  <section className="word-section">
                    <h2 className="word-section-h1">II. REACTIVOS Y CONSIGNAS DE EVALUACIÓN</h2>
                    {artifact.sections.map((sec, idx) => (
                      <div key={idx} style={{ marginBottom: "1.5rem" }}>
                        <h3 className="word-section-h2">{idx + 1}. {sec.title}</h3>
                        <Narrative text={sec.narrative} />
                        {sec.key_points.length > 0 ? (
                          <div style={{ marginLeft: "1rem" }}>
                            {sec.key_points.map((p, pIdx) => (
                              <p key={pIdx} className="word-paper-p" style={{ marginBottom: "0.4rem" }}>
                                [  ] <KeyPointText text={p} />
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
                  <strong>Instrucciones:</strong> {artifact.activity?.instructions || artifact.executive_summary || "Lee atentamente cada indicación y desarrolla los retos propuestos aplicando tus conocimientos."}
                </p>

                {toolId.includes("debate") || toolId.includes("casos-estudio") ? null : (
                  <GeneratedArtifactTables artifact={artifact} heading="I. RUTA DE TRABAJO" editingResult={editingResult} onUpdateTableCell={onUpdateTableCell} />
                )}

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
                    <div className="word-callout">
                      <strong>✂ Cómo armar las tarjetas</strong>
                      <p>1. Recorta cada tarjeta por la línea punteada (✂): primero los frentes de la Hoja A y luego los reversos de la Hoja B, que llevan el mismo número.</p>
                      <p>2. Pega cada frente con su reverso espalda con espalda (o imprime la Hoja B al dorso de la Hoja A si tu impresora lo permite).</p>
                      <p>3. Lee la pregunta o concepto, formula tu respuesta y voltea la tarjeta para comprobar con la pista formativa.</p>
                    </div>
                    {(() => {
                      const cards = artifact.activity?.items && artifact.activity.items.length > 0
                        ? artifact.activity.items
                        : artifact.sections.flatMap((s) => s.key_points).map((point, i) => ({ id: String(i), prompt: point, answer: "", hint: "", options: [] }));
                      const rows: Array<Array<[typeof cards[number] | null, number]>> = [];
                      for (let index = 0; index < cards.length; index += 2) {
                        rows.push([[cards[index] ?? null, index], [cards[index + 1] ?? null, index + 1]]);
                      }
                      return (
                        <>
                          <h3 className="word-section-h2">Hoja A · Frentes: pregunta o concepto</h3>
                          <div className="word-flashcards-sheet" aria-label="Hoja de frentes">
                            {rows.flat().map(([card, index]) => card ? (
                              <div key={`front-${card.id || index}`} className="word-flashcard-item word-flashcard-item--front">
                                <span className="word-flashcard-cut-label">✂ Tarjeta N° {index + 1}</span>
                                <p className="word-flashcard-prompt">{card.prompt}</p>
                              </div>
                            ) : <div key={`front-empty-${index}`} className="word-flashcard-item word-flashcard-item--empty" aria-hidden="true" />)}
                          </div>
                          <h3 className="word-section-h2">Hoja B · Reversos: respuesta y pista</h3>
                          <div className="word-flashcards-sheet" aria-label="Hoja de reversos">
                            {rows.flat().map(([card, index]) => card ? (
                              <div key={`back-${card.id || index}`} className="word-flashcard-item word-flashcard-item--back">
                                <span className="word-flashcard-cut-label">Tarjeta N° {index + 1} · Reverso ✂</span>
                                {card.answer ? (
                                  <>
                                    <span className="word-flashcard-kicker">¿Qué significa?</span>
                                    <p className="word-flashcard-answer">{card.answer}</p>
                                    {card.hint ? <p className="word-flashcard-hint"><strong>💡 Pista:</strong> {card.hint}</p> : null}
                                  </>
                                ) : (
                                  <>
                                    <span className="word-flashcard-kicker">Escribe el significado con tus palabras:</span>
                                    <p className="word-flashcard-lines">______________________<br />______________________<br />______________________</p>
                                  </>
                                )}
                              </div>
                            ) : <div key={`back-empty-${index}`} className="word-flashcard-item word-flashcard-item--empty" aria-hidden="true" />)}
                          </div>
                        </>
                      );
                    })()}

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
                ) : toolId.includes("debate") ? (() => {
                  const items = artifact.activity?.items ?? [];
                  const teacher = (title: string) => /(pauta|docente|criterio|r[uú]brica|evaluaci[oó]n|solucion)/i.test(title);
                  const criteria = ["Solidez y coherencia de los argumentos", "Uso de datos, evidencias y ejemplos", "Claridad de expresión, tono y respeto", "Capacidad de refutación de ideas contrarias"];
                  return (
                    <>
                      <section className="word-section">
                        <h2 className="word-section-h1">I. GUÍA Y ESTRUCTURA DEL DEBATE EN EL AULA</h2>
                        <p className="word-paper-p"><strong className="word-label">Moción o tesis central:</strong> {artifact.document_title}</p>
                        <p className="word-paper-p"><strong className="word-label">Instrucciones y acuerdos de convivencia:</strong> {artifact.activity?.instructions || artifact.executive_summary}</p>
                        {artifact.sections.filter((sec) => !teacher(sec.title)).map((sec, idx) => (
                          <div key={idx}>
                            <h3 className="word-section-h2">{sec.title}</h3>
                            <Narrative text={sec.narrative} />
                            <KeyPointList items={sec.key_points} />
                          </div>
                        ))}
                        <PreviewTables tables={(artifact.tables ?? []).map((table, index) => ({ table, index }))} editingResult={editingResult} onUpdateTableCell={onUpdateTableCell} />
                        {items.length ? (
                          <>
                            <h3 className="word-section-h2">Banco de argumentos y preguntas</h3>
                            <div className="word-table-responsive">
                              <table className="word-table word-table--generated">
                                <thead><tr><th>N°</th><th>Argumento o pregunta</th><th>Rol o momento</th><th>Repreguntas para profundizar</th></tr></thead>
                                <tbody>
                                  {items.map((item, index) => (
                                    <tr key={item.id ?? index}>
                                      <td className="word-table-cell-center word-table-cell-bold">{index + 1}</td>
                                      <td>{item.prompt}</td>
                                      <td>{item.hint}</td>
                                      <td>{item.options?.length ? <KeyPointList items={item.options} /> : null}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        ) : null}
                        <h3 className="word-section-h2">Ficha de observación del jurado</h3>
                        <div className="word-table-responsive">
                          <table className="word-table">
                            <thead><tr><th style={{ width: "30%" }}>Criterio observado</th><th>Equipo a favor (notas / puntaje 1-4)</th><th>Equipo en contra (notas / puntaje 1-4)</th></tr></thead>
                            <tbody>
                              {criteria.map((criterion) => (
                                <tr key={criterion}>
                                  <td className="word-table-cell-bold">{criterion}</td>
                                  <td style={{ color: "#94a3b8" }}>Notas: ________________________<br />Puntaje: [ &nbsp;&nbsp; ]</td>
                                  <td style={{ color: "#94a3b8" }}>Notas: ________________________<br />Puntaje: [ &nbsp;&nbsp; ]</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>
                      <section className="word-section word-teacher-guide">
                        <h2 className="word-section-h1">II. PAUTA DOCENTE Y CRITERIOS DE EVALUACIÓN</h2>
                        <p className="word-paper-p" style={{ color: "#64748b", fontStyle: "italic" }}>(Uso exclusivo del docente. Evaluación formativa CNEB)</p>
                        {artifact.sections.filter((sec) => teacher(sec.title)).map((sec, idx) => (
                          <div key={idx}>
                            <h3 className="word-section-h2">{sec.title}</h3>
                            <Narrative text={sec.narrative} />
                            <KeyPointList items={sec.key_points} />
                          </div>
                        ))}
                        {items.some((item) => item.answer) ? (
                          <>
                            <h3 className="word-section-h2">Desarrollo esperado de cada argumento</h3>
                            <div className="word-table-responsive">
                              <table className="word-table word-table--generated">
                                <thead><tr><th>N°</th><th>Argumento o pregunta</th><th>Desarrollo esperado con evidencia</th></tr></thead>
                                <tbody>
                                  {items.map((item, index) => (
                                    <tr key={item.id ?? index}>
                                      <td className="word-table-cell-center word-table-cell-bold">{index + 1}</td>
                                      <td>{item.prompt}</td>
                                      <td>{item.answer}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        ) : null}
                      </section>
                    </>
                  );
                })() : toolId.includes("casos-estudio") ? (() => {
                  const items = artifact.activity?.items ?? [];
                  const teacher = (title: string) => /(pauta|docente|criterio|r[uú]brica|evaluaci[oó]n|solucion|respuesta)/i.test(title);
                  return (
                    <>
                      <section className="word-section">
                        <h2 className="word-section-h1">I. ESTUDIO DE CASO: ANÁLISIS Y PROPUESTA</h2>
                        <p className="word-paper-p"><strong className="word-label">Título del caso:</strong> {artifact.document_title}</p>
                        <p className="word-paper-p"><strong className="word-label">Situación problemática:</strong> {artifact.executive_summary}</p>
                        {artifact.activity?.instructions ? <p className="word-paper-p"><strong className="word-label">Consigna de trabajo:</strong> {artifact.activity.instructions}</p> : null}
                        {artifact.sections.filter((sec) => !teacher(sec.title)).map((sec, idx) => (
                          <div key={idx}>
                            <h3 className="word-section-h2">{sec.title}</h3>
                            <Narrative text={sec.narrative} />
                            <KeyPointList items={sec.key_points} />
                          </div>
                        ))}
                        <PreviewTables tables={(artifact.tables ?? []).map((table, index) => ({ table, index }))} editingResult={editingResult} onUpdateTableCell={onUpdateTableCell} />
                        {items.length ? (
                          <>
                            <h3 className="word-section-h2">Preguntas de análisis del equipo</h3>
                            <div className="word-table-responsive">
                              <table className="word-table word-table--generated">
                                <thead><tr><th>N°</th><th style={{ width: "43%" }}>Pregunta y evidencias sugeridas</th><th>Análisis y propuesta del equipo</th></tr></thead>
                                <tbody>
                                  {items.map((item, index) => (
                                    <tr key={item.id ?? index}>
                                      <td className="word-table-cell-center word-table-cell-bold">{index + 1}</td>
                                      <td>{item.prompt}{item.options?.length ? <div className="generated-artifact-table__note">Evidencias: {item.options.join("; ")}</div> : null}</td>
                                      <td style={{ color: "#94a3b8" }}>____________________________<br />____________________________<br />____________________________</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        ) : null}
                      </section>
                      <section className="word-section word-teacher-guide">
                        <h2 className="word-section-h1">II. PAUTA DOCENTE Y CRITERIOS DE EVALUACIÓN</h2>
                        <p className="word-paper-p" style={{ color: "#64748b", fontStyle: "italic" }}>(Uso exclusivo del docente. No entregar al estudiante)</p>
                        {items.some((item) => item.answer || item.hint) ? (
                          <>
                            <h3 className="word-section-h2">Respuestas esperadas y andamiaje</h3>
                            <div className="word-table-responsive">
                              <table className="word-table word-table--generated">
                                <thead><tr><th>N°</th><th>Pregunta</th><th>Respuesta o criterio esperado</th><th>Andamiaje docente</th></tr></thead>
                                <tbody>
                                  {items.map((item, index) => (
                                    <tr key={item.id ?? index}>
                                      <td className="word-table-cell-center word-table-cell-bold">{index + 1}</td>
                                      <td>{item.prompt}</td>
                                      <td>{item.answer}</td>
                                      <td>{item.hint}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </>
                        ) : null}
                        {artifact.sections.filter((sec) => teacher(sec.title)).map((sec, idx) => (
                          <div key={idx}>
                            <h3 className="word-section-h2">{sec.title}</h3>
                            <Narrative text={sec.narrative} />
                            <KeyPointList items={sec.key_points} />
                          </div>
                        ))}
                      </section>
                    </>
                  );
                })() : (
                  /* Actividades y Retos estándar */
                  <section className="word-section">
                    {artifact.sections.map((sec, idx) => (
                      <div key={idx} style={{ marginBottom: "1.75rem" }}>
                        <h2 className="word-section-h1">{idx + 1}. {sec.title}</h2>
                        <Narrative text={sec.narrative} />
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
                            <td className="word-table-cell-center"><RiskBadge assessment={riskLevelFor(sec, artifact.tables ?? [])} /></td>
                            <td><Narrative text={sec.narrative} className="word-cell-p" /></td>
                            <td>{sec.key_points[0] ? <KeyPointText text={sec.key_points[0]} /> : "Acompañamiento personalizado en aula."}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {(artifact.tables?.length ?? 0) > 0 ? (
                  <GeneratedArtifactTables artifact={artifact} heading="IV. MATRICES DE ANÁLISIS" editingResult={editingResult} onUpdateTableCell={onUpdateTableCell} />
                ) : null}

                <section className="word-section">
                  <h2 className="word-section-h1">{(artifact.tables?.length ?? 0) > 0 ? "V." : "IV."} PLAN DE ACCIÓN Y COMPROMISOS INSTITUCIONALES</h2>
                  <KeyPointList items={artifact.teacher_recommendations} />
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
                    <strong>Para:</strong> {guardian || "________________________"} (Padre, madre o tutor legal)
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
                    <strong>{guardian ? `Estimada familia ${guardian}:` : "Estimada familia:"}</strong>
                  </p>
                  <p className="word-paper-p">
                    Reciban un cordial saludo institucional de parte del equipo directivo y docente {/^_+$/.test(ie) ? "de nuestra institución educativa" : `de la I.E. "${ie}"`}. Por medio de la presente nos dirigimos a ustedes para informarles lo siguiente:
                  </p>
                  <Narrative text={artifact.executive_summary} />

                  {artifact.sections.map((sec, idx) => (
                    <div key={idx} style={{ margin: "1.25rem 0" }}>
                      <h3 className="word-section-h2" style={{ textDecoration: "underline" }}>{sec.title}</h3>
                      <Narrative text={sec.narrative} />
                      <KeyPointList items={sec.key_points} />
                    </div>
                  ))}

                  <PreviewTables
                    tables={(artifact.tables ?? []).map((table, index) => ({ table, index }))}
                    editingResult={editingResult}
                    onUpdateTableCell={onUpdateTableCell}
                  />
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
            {isDocument || isResource ? (() => {
              const placement = attachTablesToSections(artifact);
              const tableIndexOf = (table: WorkflowArtifactTable) => (artifact.tables ?? []).indexOf(table);
              const isSession = toolId.includes("sesion");
              const showGenericSequence = isSession && (artifact.tables?.length ?? 0) === 0;
              let part = 3;
              const matricesPart = placement.remaining.length ? part++ : 0;
              const sequencePart = showGenericSequence ? part++ : 0;
              const sectionsStart = part;
              const orientationsPart = sectionsStart + artifact.sections.length;
              const subtitle = [
                isPlaceholder(area) || /^_+$/.test(area) ? "" : area.toUpperCase(),
                /^_+$/.test(level) ? "" : `NIVEL: ${level.toUpperCase()}`,
                /^_+$/.test(grade) ? "" : `GRADO: ${grade.toUpperCase()}${/^_+$/.test(section) ? "" : ` "${section}"`}`,
              ].filter(Boolean).join(" · ") || "DOCUMENTO DE PLANIFICACIÓN CURRICULAR";
              const signatures = [
                "unidad-aprendizaje", "sesion-aprendizaje", "proyectos-integrados", "adaptacion-nee-dua", "carpeta-pedagogica",
                "plan-atencion", "plan-refuerzo", "plan-tutoria", "informe-tutoria", "informe-padres", "fichas-acompanamiento",
              ].some((key) => (workflowKey || toolId).includes(key));
              // Documentos extensos: portada e índice, igual que el Word exportado.
              const longDocumentKind = LONG_DOCUMENT_KINDS.find(([key]) => (workflowKey || toolId).includes(key))?.[1];
              const indexEntries: IndexEntry[] = [
                { label: "I. INFORMACIÓN GENERAL" },
                { label: "II. PROPÓSITO GENERAL Y FUNDAMENTACIÓN" },
                ...(matricesPart ? [
                  { label: `${toRoman(matricesPart)}. MATRICES DE PLANIFICACIÓN` },
                  ...placement.remaining.map((table) => ({ label: table.title, level: 2 as const })),
                ] : []),
                ...(sequencePart ? [{ label: `${toRoman(sequencePart)}. SECUENCIA DIDÁCTICA Y PROCESOS PEDAGÓGICOS` }] : []),
                ...artifact.sections.map((sec, idx) => ({ label: `${toRoman(sectionsStart + idx)}. ${stripNumbering(sec.title)}` })),
                ...(artifact.teacher_recommendations.length ? [{ label: `${toRoman(orientationsPart)}. ORIENTACIONES PARA LA REVISIÓN DOCENTE` }] : []),
              ];
              return (
              <>
                {longDocumentKind ? (
                  <>
                    <DocumentCover
                      institution={ie}
                      kindLabel={longDocumentKind}
                      title={artifact.document_title}
                      rows={[
                        ["Institución educativa", ie],
                        ["DRE / UGEL", [dre, ugel].filter((part) => !/^_+$/.test(part)).join(" / ")],
                        ["Nivel / grado / sección", /^_+$/.test(grade) ? "" : `${level} / ${grade} "${section}"`],
                        ["Área curricular", area],
                        ["Docente responsable", teacher],
                        ["Director(a)", director],
                        ["Año lectivo", year],
                      ]}
                      year={year}
                    />
                    <DocumentIndex entries={indexEntries} />
                  </>
                ) : null}
                <header className="word-paper-header">
                  <div className="word-paper-motto">
                    DOCUMENTO PEDAGÓGICO EDITABLE
                  </div>
                  <h1 className="word-paper-title">{artifact.document_title}</h1>
                  <div className="word-paper-subtitle">{subtitle}</div>
                </header>

                <section className="word-section">
                  <h2 className="word-section-h1">I. INFORMACIÓN GENERAL</h2>
                  <InfoTable
                    rows={[
                      ["DRE", dre],
                      ["UGEL", ugel],
                      ["INSTITUCIÓN EDUCATIVA", ie],
                      ["NIVEL / GRADO / SECCIÓN", /^_+$/.test(grade) ? "" : `${level} / ${grade} "${section}"`],
                      ["ÁREA CURRICULAR", area],
                      ["DOCENTE RESPONSABLE", teacher],
                      ["DIRECTOR(A)", director],
                      ["AÑO LECTIVO", year],
                    ]}
                    fallback={[["INSTITUCIÓN EDUCATIVA", "________________________"], ["DOCENTE RESPONSABLE", "________________________"], ["AÑO LECTIVO", "________"]]}
                  />
                </section>

                <section className="word-section">
                  <h2 className="word-section-h1">II. PROPÓSITO GENERAL Y FUNDAMENTACIÓN</h2>
                  <Narrative text={artifact.executive_summary} />
                </section>

                {matricesPart ? (
                  <section className="word-section generated-artifact-tables">
                    <h2 className="word-section-h1">{toRoman(matricesPart)}. MATRICES DE PLANIFICACIÓN</h2>
                    <PreviewTables
                      tables={placement.remaining.map((table) => ({ table, index: tableIndexOf(table) }))}
                      editingResult={editingResult}
                      onUpdateTableCell={onUpdateTableCell}
                    />
                  </section>
                ) : null}

                {sequencePart ? (
                  <section className="word-section">
                    <h2 className="word-section-h1">{toRoman(sequencePart)}. SECUENCIA DIDÁCTICA Y PROCESOS PEDAGÓGICOS</h2>
                    <div className="word-table-responsive">
                      <table className="word-table">
                        <thead>
                          <tr>
                            <th style={{ width: "20%" }}>Momento didáctico</th>
                            <th style={{ width: "12%" }} className="word-table-cell-center">Tiempo</th>
                            <th style={{ width: "68%" }}>Actividades, mediación y procesos pedagógicos</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="word-table-cell-bold">INICIO</td>
                            <td className="word-table-cell-center">15 - 20 min</td>
                            <td><KeyPointList items={["Motivación y problematización inicial.", "Recuperación de saberes previos y conflicto cognitivo.", "Comunicación del propósito de aprendizaje y acuerdos de convivencia."]} /></td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">DESARROLLO</td>
                            <td className="word-table-cell-center">55 - 60 min</td>
                            <td><KeyPointList items={["Gestión y acompañamiento del desarrollo de las competencias.", "Trabajo individual y colaborativo con material concreto o textos.", "Retroalimentación por descubrimiento reflexivo ante errores constructivos."]} /></td>
                          </tr>
                          <tr>
                            <td className="word-table-cell-bold">CIERRE</td>
                            <td className="word-table-cell-center">10 - 15 min</td>
                            <td><KeyPointList items={["Metacognición: ¿Qué aprendimos hoy? ¿Qué dificultades tuvimos y cómo las superamos?", "Evaluación del cumplimiento de acuerdos y compromisos para el hogar."]} /></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                ) : null}

                {artifact.sections.map((sec, idx) => (
                  <section className="word-section" key={`${sec.title}-${idx}`}>
                    <h2 className="word-section-h1">{toRoman(sectionsStart + idx)}. {stripNumbering(sec.title)}</h2>
                    <Narrative text={sec.narrative} />
                    <KeyPointList items={sec.key_points} />
                    <PreviewTables
                      tables={(placement.bySection.get(idx) ?? []).map((table) => ({ table, index: tableIndexOf(table) }))}
                      sectionTitle={sec.title}
                      editingResult={editingResult}
                      onUpdateTableCell={onUpdateTableCell}
                    />
                  </section>
                ))}

                {artifact.teacher_recommendations.length > 0 ? (
                  <section className="word-section">
                    <h2 className="word-section-h1">{toRoman(orientationsPart)}. ORIENTACIONES PARA LA REVISIÓN DOCENTE</h2>
                    <KeyPointList items={artifact.teacher_recommendations} />
                  </section>
                ) : null}

                {signatures ? (
                  <SignatureBox
                    people={[
                      { name: teacher, role: isPlaceholder(area) || /^_+$/.test(area) ? "Docente responsable" : `Docente responsable de ${area}` },
                      { name: director, role: "Director(a) / Equipo Directivo" },
                    ]}
                  />
                ) : null}
              </>
              );
            })() : null}
          </article>
          </div>
        </div>
        {exactPreviewStatus === "unavailable" ? <div className="word-exact-preview-status"><span>La vista rápida está disponible, pero no se pudieron cargar las páginas reales.</span><button type="button" onClick={() => setExactPreviewAttempt((attempt) => attempt + 1)}>Reintentar páginas reales</button></div> : null}
        </>) : (
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

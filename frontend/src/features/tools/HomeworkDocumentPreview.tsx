import { Download, GraduationCap, LoaderCircle, Printer, RefreshCw, UserRound } from "lucide-react";
import { useState } from "react";

import type { WorkflowArtifact } from "./exportWorkflowDocx";

type Props = {
  artifact: WorkflowArtifact;
  values: Record<string, unknown>;
  onDownloadWord?: () => void;
  editingResult?: boolean;
  onRegenerateSection?: (index: number) => void;
  regeneratingSection?: number | null;
};

function value(values: Record<string, unknown>, keys: string[], fallback: string) {
  for (const key of keys) {
    const candidate = values[key];
    if (candidate !== undefined && candidate !== null && String(candidate).trim()) {
      return String(candidate).trim();
    }
  }
  return fallback;
}

function StudentResponseSpace({ type = "texto_breve" }: { type?: string }) {
  if (type === "tabla") {
    return (
      <div className="homework-response-table" aria-label="Tabla para completar">
        {Array.from({ length: 9 }, (_, index) => <i key={index} />)}
      </div>
    );
  }
  if (type === "dibujo") {
    return <div className="homework-response-drawing" aria-label="Espacio para dibujo">Dibuja, rotula o representa aquí</div>;
  }
  if (type === "operacion") {
    return <div className="homework-response-operation" aria-label="Espacio para procedimiento y operación">Procedimiento · operación · comprobación</div>;
  }
  if (type === "producto_adjunto") {
    return (
      <div className="homework-response-attachment" aria-label="Registro de producto adjunto">
        <span>Nombre del producto: ______________________________</span>
        <span>Descripción o evidencia: ___________________________</span>
      </div>
    );
  }
  const lineCount = type === "desarrollo" ? 6 : 3;
  return (
    <div className={`homework-task__lines homework-task__lines--${type}`} aria-label="Espacio para respuesta">
      {Array.from({ length: lineCount }, (_, index) => <i key={index} />)}
    </div>
  );
}

export function HomeworkDocumentPreview({
  artifact,
  values,
  onDownloadWord,
  editingResult = false,
  onRegenerateSection,
  regeneratingSection = null,
}: Props) {
  const [audience, setAudience] = useState<"student" | "teacher">("student");
  const items = artifact.activity?.items ?? [];
  const institution = value(values, ["institution"], "Institución educativa");
  const grade = value(values, ["grade"], "Grado");
  const section = value(values, ["section", "sections"], "Sección");
  const area = value(values, ["curricular_area", "curricular_areas", "area"], "Área curricular");
  const materials = Array.from(new Set(items.flatMap((item) => item.options).filter(Boolean)));

  return (
    <div className="word-preview-wrapper homework-preview">
      <div className="word-preview-toolbar homework-preview__toolbar">
        <div className="homework-preview__audience" role="tablist" aria-label="Versión de la tarea">
          <button
            type="button"
            role="tab"
            aria-selected={audience === "student"}
            className={`word-preview-btn-toggle ${audience === "student" ? "is-active" : ""}`}
            onClick={() => setAudience("student")}
          >
            <UserRound size={16} /> Ficha del estudiante
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={audience === "teacher"}
            className={`word-preview-btn-toggle ${audience === "teacher" ? "is-active" : ""}`}
            onClick={() => setAudience("teacher")}
          >
            <GraduationCap size={16} /> Guía docente
          </button>
        </div>
        <div className="word-preview-toolbar__actions">
          {onDownloadWord ? (
            <button type="button" className="word-preview-btn-toggle" onClick={onDownloadWord}>
              <Download size={16} /> Descargar Word
            </button>
          ) : null}
          <button type="button" className="word-preview-btn-toggle" onClick={() => window.print()}>
            <Printer size={16} /> Imprimir
          </button>
        </div>
      </div>

      {editingResult && onRegenerateSection ? (
        <div className="word-preview-regeneration" aria-label="Regeneración por sección">
          <strong>Mejora únicamente la parte que necesites</strong>
          <div>
            {artifact.sections.map((section, index) => (
              <button
                type="button"
                className="workflow-section-regenerate"
                key={`${section.title}-${index}`}
                disabled={regeneratingSection === index}
                onClick={() => onRegenerateSection(index)}
              >
                {regeneratingSection === index ? <LoaderCircle className="is-spinning" /> : <RefreshCw />}
                {regeneratingSection === index ? `Mejorando ${section.title}…` : `Regenerar solo esta sección: ${section.title}`}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="word-preview-viewport">
        <article className="word-document-paper homework-sheet">
          <header className="homework-sheet__header">
            <span>{audience === "student" ? "Tarea de extensión y hogar" : "Guía de revisión docente"}</span>
            <h1>{artifact.document_title}</h1>
            <p>{area} · {grade} · {section}</p>
          </header>

          {audience === "student" ? (
            <>
              <div className="homework-sheet__identity">
                <span><strong>Estudiante:</strong> __________________________________</span>
                <span><strong>Fecha:</strong> ____ / ____ / ______</span>
                <span><strong>I.E.:</strong> {institution}</span>
              </div>

              <section className="homework-sheet__intro">
                <h2>¿Qué vas a lograr?</h2>
                <p>{artifact.executive_summary}</p>
                <h2>¿Qué necesitas?</h2>
                <p>{materials.length ? materials.join(" · ") : "Cuaderno u hojas, lápiz y materiales disponibles en casa."}</p>
                <h2>Antes de empezar</h2>
                <p>{artifact.activity?.instructions}</p>
              </section>

              <section className="homework-sheet__activities" aria-label="Actividades para resolver">
                <h2>Ahora resuelve</h2>
                {items.map((item, index) => (
                  <article className="homework-task" key={item.id || index}>
                    <div className="homework-task__number">{index + 1}</div>
                    <div className="homework-task__content">
                      <h3>{item.prompt}</h3>
                      {item.hint ? <p className="homework-task__hint">Pista: {item.hint}</p> : null}
                      <p className="homework-task__response-label">Mi respuesta o evidencia</p>
                      <StudentResponseSpace type={item.response_type} />
                    </div>
                  </article>
                ))}
              </section>

              <section className="homework-sheet__checklist">
                <h2>Reviso mi trabajo</h2>
                {items.map((item, index) => (
                  <label key={`check-${item.id || index}`}>
                    <input type="checkbox" /> Completé la actividad {index + 1} y expliqué mi respuesta.
                  </label>
                ))}
              </section>
            </>
          ) : (
            <section className="homework-sheet__teacher-guide">
              <p className="homework-sheet__notice">
                Esta guía no se entrega al estudiante. Las respuestas pueden variar si conservan el propósito y muestran evidencia suficiente.
              </p>
              {items.map((item, index) => (
                <article key={`teacher-${item.id || index}`}>
                  <h2>Actividad {index + 1}</h2>
                  <p><strong>Consigna:</strong> {item.prompt}</p>
                  <p><strong>Producto o respuesta esperada:</strong> {item.answer}</p>
                </article>
              ))}
              <h2>Retroalimentación sugerida</h2>
              <ul>{artifact.teacher_recommendations.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
          )}
        </article>
      </div>
    </div>
  );
}

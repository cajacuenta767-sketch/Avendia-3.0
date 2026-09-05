import { FileText, LoaderCircle, Trash2, UploadCloud } from "lucide-react";
import { type ChangeEvent, useId, useRef, useState } from "react";

import { deleteEvaluationSource, uploadEvaluationSource } from "./evaluationApi";
import type { EvaluationSourceDocument, SourceDocumentValue, TextSize } from "./evaluationContracts";
import { validateSourceDocumentFile } from "./sourceDocumentValidation";

export type SourceDocumentInputProps = {
  value: SourceDocumentValue;
  onChange: (value: SourceDocumentValue) => void;
  instrumentId?: string;
  prepareInstrument?: () => Promise<string>;
  ensureInstrument?: () => Promise<string>;
  onSourcesMutated?: (instrumentId: string) => Promise<void> | void;
  showTextSize?: boolean;
  disabled?: boolean;
  uploadSource?: (instrumentId: string, file: File) => Promise<EvaluationSourceDocument>;
  deleteSource?: (instrumentId: string, sourceId: string) => Promise<void>;
};

function textSizeLabel(size: TextSize) {
  if (size === "small") return "Pequeño";
  if (size === "large") return "Grande";
  return "Mediano";
}

export function SourceDocumentInput({
  value,
  onChange,
  instrumentId,
  prepareInstrument,
  ensureInstrument,
  onSourcesMutated,
  showTextSize = false,
  disabled = false,
  uploadSource = uploadEvaluationSource,
  deleteSource = deleteEvaluationSource,
}: SourceDocumentInputProps) {
  const id = useId().replace(/:/g, "");
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    const invalid = files.map((file) => ({ file, message: validateSourceDocumentFile(file) })).find((item) => item.message);
    if (invalid) {
      setError(`${invalid.file.name}: ${invalid.message}`);
      setMessage("");
      event.target.value = "";
      return;
    }
    setUploading(true);
    setError("");
    setMessage("");
    let mutated = false;
    let mutationInstrumentId = instrumentId ?? "";
    try {
      const targetId = prepareInstrument
        ? await prepareInstrument()
        : instrumentId || await ensureInstrument?.();
      if (!targetId) throw new Error("Guarda primero el borrador para asociar el archivo a este instrumento.");
      mutationInstrumentId = targetId;
      let nextValue = value;
      for (const file of files) {
        const source = await uploadSource(targetId, file);
        mutated = true;
        nextValue = {
          ...nextValue,
          sources: [
            ...nextValue.sources,
            {
              source_id: source.id,
              filename: source.filename,
              extracted_text: source.extracted_text,
              edited_text: source.extracted_text,
              extension: source.extension,
              byte_size: source.byte_size,
            },
          ],
        };
        onChange(nextValue);
      }
      await onSourcesMutated?.(targetId);
      setMessage(`${files.length === 1 ? "Documento añadido" : `${files.length} documentos añadidos`}. Revisa los textos extraídos antes de generar.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo procesar el archivo.");
      if (mutated && mutationInstrumentId) await onSourcesMutated?.(mutationInstrumentId);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function removeFile(sourceId: string, filename: string) {
    setDeletingId(sourceId);
    setError("");
    setMessage("");
    try {
      const targetId = prepareInstrument
        ? await prepareInstrument()
        : instrumentId || await ensureInstrument?.();
      if (!targetId) throw new Error("No se encontró el borrador que contiene este archivo.");
      await deleteSource(targetId, sourceId);
      onChange({ ...value, sources: value.sources.filter((source) => source.source_id !== sourceId) });
      await onSourcesMutated?.(targetId);
      setMessage(`${filename} fue retirado. Los demás documentos y el texto pegado se conservan.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo retirar el archivo.");
    } finally {
      setDeletingId("");
    }
  }

  function editSource(sourceId: string, editedText: string) {
    onChange({
      ...value,
      sources: value.sources.map((source) => source.source_id === sourceId
        ? { ...source, edited_text: editedText }
        : source),
    });
  }

  return (
    <section className="source-document" aria-labelledby={`${id}-title`}>
      <header>
        <div>
          <span className="source-document__icon"><FileText aria-hidden="true" /></span>
          <div>
            <h3 id={`${id}-title`}>Texto o documento fuente</h3>
            <p>Pega contenido y combínalo con uno o varios documentos. Cada texto extraído puede revisarse por separado.</p>
          </div>
        </div>
      </header>

      <div className="source-document__grid">
        <label className="source-document__paste" htmlFor={`${id}-pasted`}>
          <span>Escribir o pegar texto</span>
          <textarea
            id={`${id}-pasted`}
            aria-label="Escribir o pegar texto"
            value={value.pasted_text}
            onChange={(event) => onChange({ ...value, pasted_text: event.target.value })}
            placeholder="Ej. Pega aquí la lectura, una situación significativa o el contenido que utilizarán los estudiantes."
            disabled={disabled}
          />
          <small>El contenido pegado no se elimina cuando subes o retiras un archivo.</small>
        </label>

        <div className="source-document__upload">
          <span>Subir PDF o Word DOCX</span>
          <input
            ref={fileInput}
            id={`${id}-file`}
            type="file"
            multiple
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(event) => void handleFiles(event)}
            disabled={disabled || uploading}
            className="source-document__native-file"
          />
          <button type="button" onClick={() => fileInput.current?.click()} disabled={disabled || uploading}>
            {uploading ? <LoaderCircle className="source-document__spinner" aria-hidden="true" /> : <UploadCloud aria-hidden="true" />}
            {uploading ? "Extrayendo texto…" : "Seleccionar archivo"}
          </button>
          <small>Cada archivo puede pesar hasta 10 MB. Word significa DOCX; el formato DOC antiguo debe abrirse y guardarse como DOCX antes de subirlo.</small>
        </div>
      </div>

      {error ? <p className="source-document__status source-document__status--error" role="alert">{error}</p> : null}
      {message ? <p className="source-document__status" role="status">{message}</p> : null}

      {value.sources.length ? (
        <section className="source-document__files" aria-label="Documentos fuente añadidos">
          <header>
            <div><strong>Documentos añadidos</strong><small>{value.sources.length} {value.sources.length === 1 ? "archivo vinculado" : "archivos vinculados"}</small></div>
          </header>
          {value.sources.map((source, index) => (
            <article className="source-document__source" key={source.source_id}>
              <div className="source-document__file">
                <FileText aria-hidden="true" />
                <span>
                  <strong>{source.filename}</strong>
                  <small>Fuente {index + 1}{source.byte_size ? ` · ${Math.max(1, Math.round(source.byte_size / 1024))} KB` : ""}</small>
                </span>
                <button
                  type="button"
                  aria-label={`Retirar ${source.filename}`}
                  onClick={() => void removeFile(source.source_id, source.filename)}
                  disabled={disabled || deletingId === source.source_id}
                >
                  {deletingId === source.source_id ? <LoaderCircle className="source-document__spinner" aria-hidden="true" /> : <Trash2 aria-hidden="true" />}
                </button>
              </div>
              <label className="source-document__preview" htmlFor={`${id}-preview-${index}`}>
                <span>Texto extraído de {source.filename}</span>
                <textarea
                  id={`${id}-preview-${index}`}
                  aria-label={`Vista previa editable de ${source.filename}`}
                  className={`source-document__text--${value.reading_text_size}`}
                  value={source.edited_text}
                  onChange={(event) => editSource(source.source_id, event.target.value)}
                  disabled={disabled}
                />
                <small>Corrige saltos, encabezados o caracteres. Este texto se combinará con las demás fuentes.</small>
              </label>
            </article>
          ))}
        </section>
      ) : null}

      {showTextSize ? (
        <fieldset className="source-document__sizes">
          <legend>Tamaño de texto en la vista previa y el documento</legend>
          {(["reading_text_size", "question_text_size"] as const).map((field) => (
            <label key={field}>
              <span>{field === "reading_text_size" ? "Lectura" : "Preguntas"}</span>
              <select value={value[field]} onChange={(event) => onChange({ ...value, [field]: event.target.value as TextSize })} disabled={disabled}>
                {(["small", "medium", "large"] as TextSize[]).map((size) => <option key={size} value={size}>{textSizeLabel(size)}</option>)}
              </select>
            </label>
          ))}
        </fieldset>
      ) : null}
    </section>
  );
}

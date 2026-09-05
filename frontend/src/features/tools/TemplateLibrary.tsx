import { CheckCircle2, Download, FileArchive, LoaderCircle, Star, Trash2, Upload, X } from "lucide-react";
import { ChangeEvent, DragEvent, useCallback, useEffect, useRef, useState } from "react";
import { TemplateDetails } from "../utilities/TemplateDetails";
import { TemplateTrash, TemplateVersions } from "../utilities/TemplateVersions";

import {
  deleteInstitutionalTemplate,
  downloadInstitutionalTemplate,
  listInstitutionalTemplates,
  setDefaultInstitutionalTemplate,
  type InstitutionalTemplate,
  uploadInstitutionalTemplate,
} from "./templateApi";

const ACCEPTED_EXTENSIONS = [".docx", ".pdf", ".xlsx", ".pptx"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function readableSize(size: number) {
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

function fileExtension(name: string) {
  return `.${name.split(".").pop()?.toLowerCase() ?? ""}`;
}

export function TemplateLibrary() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [templates, setTemplates] = useState<InstitutionalTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [workingId, setWorkingId] = useState("");
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<InstitutionalTemplate | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setTemplates(await listInstitutionalTemplates());
      setError("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo cargar tu biblioteca.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void listInstitutionalTemplates()
      .then((items) => { if (mounted) setTemplates(items); })
      .catch((requestError: unknown) => { if (mounted) setError(requestError instanceof Error ? requestError.message : "No se pudo cargar tu biblioteca."); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  async function uploadFiles(files: File[]) {
    setMessage("");
    setError("");
    const invalid = files.find((file) => !ACCEPTED_EXTENSIONS.includes(fileExtension(file.name)) || file.size > MAX_FILE_SIZE);
    if (invalid) {
      setError(`${invalid.name}: usa DOCX, PDF, XLSX o PPTX de máximo 10 MB.`);
      return;
    }
    if (!files.length) return;

    setUploading(true);
    try {
      for (const file of files) {
        await uploadInstitutionalTemplate(file, templates.length === 0);
      }
      await refresh();
      setMessage(`${files.length === 1 ? "Formato sincronizado" : `${files.length} formatos sincronizados`} con tu cuenta.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudieron subir los formatos.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function chooseFiles(event: ChangeEvent<HTMLInputElement>) {
    void uploadFiles(Array.from(event.target.files ?? []));
  }

  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    void uploadFiles(Array.from(event.dataTransfer.files));
  }

  async function makeDefault(template: InstitutionalTemplate) {
    setWorkingId(template.id);
    setError("");
    try {
      await setDefaultInstitutionalTemplate(template.id);
      await refresh();
      setMessage(`${template.name} será el formato predeterminado.`);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo cambiar el formato predeterminado.");
    } finally {
      setWorkingId("");
    }
  }

  async function removeTemplate() {
    if (!pendingDelete) return;
    setWorkingId(pendingDelete.id);
    setError("");
    try {
      await deleteInstitutionalTemplate(pendingDelete.id);
      setPendingDelete(null);
      await refresh();
      setMessage("Formato movido a la papelera. Puedes recuperarlo.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo eliminar el formato.");
    } finally {
      setWorkingId("");
    }
  }

  async function downloadTemplate(template: InstitutionalTemplate) {
    setError("");
    try {
      await downloadInstitutionalTemplate(template);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo descargar el formato. Inténtalo de nuevo.");
    }
  }

  return (
    <section className="template-library">
      <TemplateTrash refresh={refresh} />
      <div className={`upload-zone template-dropzone ${dragging ? "is-dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
        {uploading ? <LoaderCircle className="is-spinning" /> : <Upload />}
        <h2>{uploading ? "Sincronizando formatos…" : "Arrastra o selecciona tus formatos"}</h2>
        <p>DOCX, PDF, XLSX o PPTX · máximo 10 MB por archivo</p>
        <button className="primary-button" type="button" disabled={uploading} onClick={() => inputRef.current?.click()}><Upload /> Seleccionar archivos</button>
        <input ref={inputRef} type="file" accept=".docx,.pdf,.xlsx,.pptx" multiple hidden onChange={chooseFiles} />
      </div>

      {message ? <div className="template-message"><CheckCircle2 /> {message}</div> : null}
      {error ? <div className="template-message template-message--error">{error}</div> : null}

      <div className="template-list">
        <header><div><h2>Mis formatos</h2><p>Sincronizados con tu cuenta y disponibles al descargar documentos.</p></div><strong>{templates.length}</strong></header>
        {loading ? <div className="template-empty"><LoaderCircle className="is-spinning" /> Cargando biblioteca…</div> : templates.length ? templates.map((template) => <article key={template.id}>
          <span><FileArchive /></span>
          <div><strong>{template.name}{template.is_default ? <em>Predeterminado</em> : null}</strong><small>{template.extension.slice(1).toUpperCase()} · {readableSize(template.size_bytes)} · {new Date(template.updated_at).toLocaleString("es-PE")}</small></div>
          {!template.is_default ? <button className="secondary-button template-default" onClick={() => void makeDefault(template)} disabled={workingId === template.id}><Star /> Usar por defecto</button> : null}
          <button className="secondary-button" onClick={() => void downloadTemplate(template)}><Download /> Descargar</button>
          <button className="template-delete" onClick={() => setPendingDelete(template)} aria-label={`Eliminar ${template.name}`}><Trash2 /></button>
          <TemplateDetails id={template.id} refresh={refresh} />
          <TemplateVersions id={template.id} revision={template.revision ?? 1} refresh={refresh} />
        </article>) : <div className="template-empty"><FileArchive /><span>Aún no guardaste formatos.</span></div>}
      </div>

      {pendingDelete ? <div className="template-confirm-layer" role="dialog" aria-modal="true" aria-labelledby="template-delete-title">
        <button type="button" className="template-confirm-layer__backdrop" onClick={() => setPendingDelete(null)} aria-label="Cancelar eliminación" />
        <article className="template-confirm">
          <header><h2 id="template-delete-title">Eliminar formato</h2><button type="button" onClick={() => setPendingDelete(null)} aria-label="Cerrar"><X /></button></header>
          <p><strong>{pendingDelete.name}</strong> pasará a la papelera y podrás recuperarlo. Los documentos ya descargados no cambiarán.</p>
          <footer><button className="secondary-button" type="button" onClick={() => setPendingDelete(null)}>Cancelar</button><button className="template-delete-action" type="button" onClick={() => void removeTemplate()} disabled={workingId === pendingDelete.id}>{workingId === pendingDelete.id ? <LoaderCircle className="is-spinning" /> : <Trash2 />} Eliminar</button></footer>
        </article>
      </div> : null}
    </section>
  );
}

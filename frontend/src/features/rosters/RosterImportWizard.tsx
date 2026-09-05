import { AlertTriangle, ArrowLeft, ArrowRight, Check, FileSpreadsheet, LoaderCircle, Upload, X } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

import { confirmRosterImport, previewRosterImport } from "./rosterApi";
import type { ImportMapping, ImportMappingField, RosterImportPreview, RosterImportRow, Student } from "./rosterTypes";
import { useDialogFocus } from "./useDialogFocus";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const VALID_EXTENSION = /\.(xlsx|xls|csv)$/i;
const mappingFields: Array<{ field: ImportMappingField; label: string }> = [
  { field: "full_name", label: "Nombre completo" },
  { field: "last_names", label: "Apellidos" },
  { field: "first_names", label: "Nombres" },
  { field: "document_number", label: "DNI o documento" },
  { field: "internal_code", label: "Código interno" },
  { field: "sex", label: "Sexo" },
  { field: "notes", label: "Observación" },
];

function normalizedName(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLocaleLowerCase("es-PE");
}

function rowName(row: RosterImportRow, mapping: ImportMapping): string {
  if (mapping.full_name) return row.values[mapping.full_name]?.trim() ?? "";
  return [mapping.last_names ? row.values[mapping.last_names] : "", mapping.first_names ? row.values[mapping.first_names] : ""].filter(Boolean).join(" ").trim();
}

function uniqueMapping(mapping: ImportMapping): ImportMapping {
  const used = new Set<string>();
  return Object.fromEntries(Object.entries(mapping).filter(([, column]) => {
    if (!column || used.has(column)) return false;
    used.add(column);
    return true;
  })) as ImportMapping;
}

type ReviewedRow = RosterImportRow & { reviewStatus: "valid" | "duplicate-file" | "duplicate-roster" | "invalid"; fullName: string };

function reviewRows(preview: RosterImportPreview, mapping: ImportMapping, existingStudents: Student[]): ReviewedRow[] {
  const existingNames = new Set(existingStudents.map((student) => normalizedName(student.full_name)));
  const fileNames = new Set<string>();
  return preview.rows.flatMap((row) => {
    if (Object.values(row.values).every((value) => !String(value).trim())) return [];
    const fullName = rowName(row, mapping);
    const normalized = normalizedName(fullName);
    let reviewStatus: ReviewedRow["reviewStatus"] = "valid";
    if (!normalized || row.status === "invalid") reviewStatus = "invalid";
    else if (row.status === "duplicate" || fileNames.has(normalized)) reviewStatus = "duplicate-file";
    else if (existingNames.has(normalized)) reviewStatus = "duplicate-roster";
    fileNames.add(normalized);
    return [{ ...row, fullName, reviewStatus }];
  });
}

type RosterImportWizardProps = {
  rosterId: string;
  existingStudents: Student[];
  onClose: () => void;
  onImported: (createdCount: number) => Promise<void> | void;
};

export function RosterImportWizard({ rosterId, existingStudents, onClose, onImported }: RosterImportWizardProps) {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<RosterImportPreview | null>(null);
  const [mapping, setMapping] = useState<ImportMapping>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const handleKeyDown = useDialogFocus(dialogRef, onClose);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);
  const hasNameMapping = Boolean(mapping.full_name || (mapping.last_names && mapping.first_names));
  const reviewedRows = useMemo(() => preview ? reviewRows(preview, mapping, existingStudents) : [], [preview, mapping, existingStudents]);
  const validRows = reviewedRows.filter((row) => row.reviewStatus === "valid");
  const duplicateRows = reviewedRows.filter((row) => row.reviewStatus.startsWith("duplicate"));
  const invalidRows = reviewedRows.filter((row) => row.reviewStatus === "invalid");

  const selectFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setError("");
    setPreview(null);
    if (!selected) return;
    if (!VALID_EXTENSION.test(selected.name)) {
      setFile(null);
      setError("Elige un archivo .xlsx, .xls o .csv. Los libros con macros no están permitidos.");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("El archivo supera 10 MB. Reduce la nómina o guárdala como CSV e inténtalo nuevamente.");
      return;
    }
    setFile(selected);
    setBusy(true);
    try {
      const nextPreview = await previewRosterImport(rosterId, selected);
      if (!nextPreview.columns.length) throw new Error("No encontramos encabezados legibles. Revisa la primera fila o usa la plantilla de Avendia.");
      setPreview(nextPreview);
      setMapping(uniqueMapping(nextPreview.suggested_mapping));
      setStep(2);
    } catch (requestError) {
      setFile(null);
      setError(requestError instanceof Error ? requestError.message : "No pudimos leer el archivo. Verifica que no esté corrupto e inténtalo nuevamente.");
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  const changeMapping = (field: ImportMappingField, column: string) => {
    setMapping((current) => {
      const next = { ...current };
      for (const key of Object.keys(next) as ImportMappingField[]) {
        if (key !== field && column && next[key] === column) delete next[key];
      }
      if (column) next[field] = column;
      else delete next[field];
      return next;
    });
  };

  const confirm = async () => {
    if (!preview || !hasNameMapping || !validRows.length) return;
    setBusy(true);
    setError("");
    try {
      const result = await confirmRosterImport(rosterId, {
        preview_token: preview.preview_token,
        mapping,
        rows: validRows.map((row) => row.values),
        skip_duplicates: true,
      });
      const created = result.created_count ?? validRows.length;
      setSuccessCount(created);
      await onImported(created);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo confirmar la importación. Ningún estudiante fue agregado.");
    } finally {
      setBusy(false);
    }
  };

  return <div className="dialog-backdrop roster-dialog-backdrop" role="presentation"><section ref={dialogRef} className="roster-import" role="dialog" aria-modal="true" aria-labelledby="roster-import-title" tabIndex={-1} onKeyDown={handleKeyDown}>
    <header><div><span><FileSpreadsheet /></span><div><h2 id="roster-import-title">Importar estudiantes</h2><p>Revisa los datos antes de incorporarlos al aula.</p></div></div><button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar"><X /></button></header>
    <ol className="roster-import__steps" aria-label="Pasos de importación">
      {["Archivo", "Revisar", "Confirmar"].map((label, index) => <li className={step === index + 1 ? "is-current" : step > index + 1 ? "is-complete" : ""} key={label} aria-current={step === index + 1 ? "step" : undefined}><span>{step > index + 1 ? <Check /> : index + 1}</span><strong>{label}</strong></li>)}
    </ol>
    {error ? <div className="roster-alert roster-alert--error" role="alert" ref={errorRef} tabIndex={-1}><AlertTriangle />{error}</div> : null}
    {preview?.warnings.length ? <div className="roster-import__warnings" role="status" aria-label="Advertencias del archivo"><AlertTriangle /><div><strong>Revisa estas observaciones</strong><ul>{preview.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul></div></div> : null}
    {successCount != null ? <div className="roster-import__success"><span><Check /></span><h3>Importación completada</h3><p>Se agregaron {successCount} estudiantes. Los duplicados y las filas vacías no se incorporaron.</p><button className="primary-button" onClick={onClose}>Volver al aula</button></div> : null}
    {successCount == null && step === 1 ? <div className="roster-import__body"><label className={`roster-dropzone ${busy ? "is-busy" : ""}`}><input data-dialog-initial-focus type="file" accept=".xlsx,.xls,.csv" onChange={selectFile} disabled={busy} /><span>{busy ? <LoaderCircle className="is-spinning" /> : <Upload />}</span><strong>{busy ? "Leyendo archivo…" : "Selecciona tu archivo"}</strong><p>Formatos .xlsx, .xls o .csv · Máximo 10 MB</p><small>Ejemplo: una fila por estudiante y encabezados en la primera fila.</small></label></div> : null}
    {successCount == null && preview && step === 2 ? <div className="roster-import__body"><section className="roster-mapping"><div><h3>Relaciona las columnas</h3><p>Cada columna solo puede usarse una vez. El nombre completo, o la combinación de nombres y apellidos, es obligatorio.</p></div><div className="roster-mapping__grid">{mappingFields.map((item) => <label key={item.field}><span>{item.label}</span><select aria-label={`Columna para ${item.label}`} value={mapping[item.field] ?? ""} onChange={(event) => changeMapping(item.field, event.target.value)}><option value="">No importar</option>{preview.columns.map((column) => <option key={column} disabled={Object.entries(mapping).some(([field, selected]) => field !== item.field && selected === column)}>{column}</option>)}</select></label>)}</div>{!hasNameMapping ? <div className="roster-alert roster-alert--warning"><AlertTriangle />Selecciona “Nombre completo” o ambas columnas “Nombres” y “Apellidos”.</div> : null}</section><section className="roster-preview"><header><div><h3>Vista previa</h3><p>{reviewedRows.length} filas con contenido</p></div><div><span className="is-valid">{validRows.length} listas</span><span className="is-duplicate">{duplicateRows.length} duplicadas</span><span className="is-invalid">{invalidRows.length} por corregir</span></div></header><div className="roster-preview__scroll"><table><thead><tr><th>Fila</th><th>Nombre detectado</th><th>Documento</th><th>Estado</th></tr></thead><tbody>{reviewedRows.slice(0, 50).map((row) => <tr key={row.row_number}><td>{row.row_number}</td><td>{row.fullName || "Sin nombre"}</td><td>{mapping.document_number ? row.values[mapping.document_number] || "—" : "—"}</td><td><span className={`roster-row-status roster-row-status--${row.reviewStatus}`}>{row.reviewStatus === "valid" ? "Lista" : row.reviewStatus === "duplicate-file" ? "Duplicada en archivo" : row.reviewStatus === "duplicate-roster" ? "Ya existe" : "Sin nombre"}</span></td></tr>)}</tbody></table></div>{reviewedRows.length > 50 ? <small>Se muestran las primeras 50 filas. Todas se validarán al confirmar.</small> : null}</section></div> : null}
    {successCount == null && preview && step === 3 ? <div className="roster-import__body roster-import__confirm"><span><FileSpreadsheet /></span><h3>Todo listo para importar</h3><dl><div><dt>Archivo</dt><dd>{file?.name}</dd></div><div><dt>Estudiantes nuevos</dt><dd>{validRows.length}</dd></div><div><dt>Duplicados omitidos</dt><dd>{duplicateRows.length}</dd></div><div><dt>Filas no válidas</dt><dd>{invalidRows.length}</dd></div></dl><p>Avendia solo agregará las filas listas. Esta acción no modifica estudiantes existentes.</p></div> : null}
    {successCount == null ? <footer><button className="secondary-button" type="button" onClick={() => step === 1 ? onClose() : setStep((current) => current - 1)}><ArrowLeft />{step === 1 ? "Cancelar" : "Atrás"}</button>{step === 2 ? <button className="primary-button" type="button" disabled={!hasNameMapping || !validRows.length} onClick={() => setStep(3)}>Continuar <ArrowRight /></button> : null}{step === 3 ? <button className="primary-button" type="button" disabled={busy || !validRows.length} onClick={confirm}>{busy ? <LoaderCircle className="is-spinning" /> : <Check />}{busy ? "Importando…" : `Importar ${validRows.length} estudiantes`}</button> : null}</footer> : null}
  </section></div>;
}

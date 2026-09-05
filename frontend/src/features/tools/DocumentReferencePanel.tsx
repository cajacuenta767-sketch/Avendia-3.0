import { Check, ChevronDown, FileInput, Link2, LoaderCircle, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import type { WorkflowField } from "../../config/workflows";
import { apiRequest } from "../../lib/api";

type FieldValue = string | string[];

export type DocumentReferenceSelection = {
  documentId: string;
  revision: number;
  title: string;
  fields: string[];
  compatibilityStatus: "compatible" | "review" | "not_recommended";
};

type CompatibleDocument = {
  id: string;
  revision: number;
  title: string;
  document_type: string;
  updated_at: string;
  metadata_json: { fields?: Record<string, FieldValue> };
  compatibility_status: "compatible" | "review" | "not_recommended";
  compatibility_reasons: string[];
};

type Props = {
  targetType: string;
  fields: WorkflowField[];
  selection?: DocumentReferenceSelection;
  onImport: (selection: DocumentReferenceSelection, values: Record<string, FieldValue>) => void;
  onClear: () => void;
};

const blockedField = (id: string) => /student|estudiante|score|nota|grade_value|diagnosis|diagn[oó]stico|password|correo|phone|famil/.test(id.toLocaleLowerCase());
const reusableGroups = [
  ["topic", "theme", "unit_title", "session_title", "session_topic", "task_title", "central_question"],
  ["curricular_area", "area"],
  ["competencies", "competency", "capacities", "capacity", "performance"],
  ["purpose", "learning_purpose", "objective", "goal"],
  ["evidence", "product", "criteria", "criterion"],
  ["institution", "school_name"],
];

function sourceValueFor(fieldId: string, sourceFields: Record<string, FieldValue>) {
  if (sourceFields[fieldId] !== undefined && String(sourceFields[fieldId] ?? "").trim()) return sourceFields[fieldId];
  const group = reusableGroups.find((items) => items.some((item) => fieldId.toLocaleLowerCase().includes(item)));
  const key = group?.find((item) => sourceFields[item] !== undefined && String(sourceFields[item] ?? "").trim());
  return key ? sourceFields[key] : undefined;
}

export function DocumentReferencePanel({ targetType, fields, selection, onImport, onClear }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<CompatibleDocument[]>([]);
  const [documentId, setDocumentId] = useState(selection?.documentId ?? "");
  const [selectedFields, setSelectedFields] = useState<string[]>(selection?.fields ?? []);
  const source = documents.find((document) => document.id === documentId);
  const availableFields = useMemo(() => {
    const sourceFields = source?.metadata_json?.fields ?? {};
    return fields.filter((field) => !blockedField(field.id) && sourceValueFor(field.id, sourceFields) !== undefined);
  }, [fields, source]);

  const toggleOpen = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (!nextOpen || documents.length) return;
    const token = sessionStorage.getItem("avendia.accessToken");
    if (!token) return;
    setLoading(true);
    void apiRequest<CompatibleDocument[]>(`/documents/compatible/${targetType}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(setDocuments)
      .finally(() => setLoading(false));
  };

  const selectDocument = (nextId: string) => {
    setDocumentId(nextId);
    const next = documents.find((document) => document.id === nextId);
    const sourceFields = next?.metadata_json?.fields ?? {};
    setSelectedFields(fields.filter((field) => !blockedField(field.id) && sourceValueFor(field.id, sourceFields) !== undefined).map((field) => field.id));
  };

  const apply = () => {
    if (!source || !selectedFields.length) return;
    const sourceFields = source.metadata_json.fields ?? {};
    const values = Object.fromEntries(selectedFields.map((id) => [id, sourceValueFor(id, sourceFields) ?? ""]));
    onImport({
      documentId: source.id,
      revision: source.revision,
      title: source.title,
      fields: selectedFields,
      compatibilityStatus: source.compatibility_status,
    }, values);
  };

  return <section className={`document-reference ${open ? "is-open" : ""}`}>
    <button type="button" className="document-reference__toggle" aria-expanded={open} onClick={toggleOpen}>
      <span><Link2 /><strong>{selection ? `Referencia: ${selection.title}` : "Crear desde cero o continuar una secuencia"}</strong><small>{selection ? `${selection.fields.length} campos vinculados · revisión ${selection.revision}` : "Opcional: reutiliza solo los datos que elijas de un documento anterior."}</small></span><ChevronDown />
    </button>
    {open ? <div className="document-reference__body">
      <div className="document-reference__mode"><ShieldCheck /><p><strong>El docente mantiene el control.</strong> No se copian estudiantes, calificaciones ni datos familiares; nada cambia hasta que pulses “Usar campos seleccionados”.</p></div>
      {loading ? <p className="document-reference__loading"><LoaderCircle className="is-spinning" /> Buscando documentos compatibles…</p> : <label><span>Documento de referencia</span><select value={documentId} onChange={(event) => selectDocument(event.target.value)}><option value="">Crear desde cero</option>{documents.filter((document) => document.compatibility_status !== "not_recommended").map((document) => <option key={document.id} value={document.id}>{document.title} · {document.compatibility_status === "compatible" ? "compatible" : "requiere ajustes"}</option>)}</select></label>}
      {source ? <><p className={`document-reference__compatibility is-${source.compatibility_status}`}>{source.compatibility_reasons.join(" ")}</p><fieldset><legend>Elige qué reutilizar</legend><div>{availableFields.map((field) => <label key={field.id}><input type="checkbox" checked={selectedFields.includes(field.id)} onChange={() => setSelectedFields((current) => current.includes(field.id) ? current.filter((id) => id !== field.id) : [...current, field.id])} /><span><strong>{field.label}</strong><small>{String(sourceValueFor(field.id, source.metadata_json.fields ?? {}) ?? "")}</small></span></label>)}</div></fieldset><footer><button type="button" className="secondary-button" onClick={() => { setDocumentId(""); setSelectedFields([]); onClear(); }}>Crear desde cero</button><button type="button" className="workflow-primary" disabled={!selectedFields.length} onClick={apply}><FileInput /> Usar campos seleccionados</button></footer></> : null}
      {selection ? <p className="document-reference__applied"><Check /> Referencia guardada; podrás editar cualquier campo heredado.</p> : null}
    </div> : null}
  </section>;
}

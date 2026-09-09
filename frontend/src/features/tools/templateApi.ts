import { apiBlob, apiRequest, downloadApiBlob } from "../../lib/api";
import { readAccessToken } from "../../lib/session";

export type InstitutionalTemplate = {
  revision: number;
  trashed: boolean;
  id: string;
  name: string;
  extension: ".docx" | ".pdf" | ".xlsx" | ".pptx";
  mime_type: string;
  size_bytes: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

function requireAuthentication() {
  if (!readAccessToken()) throw new Error("Inicia sesión para usar tus formatos institucionales.");
}

export function listInstitutionalTemplates() {
  requireAuthentication();
  return apiRequest<InstitutionalTemplate[]>("/templates");
}

export function uploadInstitutionalTemplate(file: File, makeDefault = false) {
  requireAuthentication();
  const form = new FormData();
  form.append("file", file);
  form.append("make_default", String(makeDefault));
  return apiRequest<InstitutionalTemplate>("/templates", {
    method: "POST",
    body: form,
  });
}

export function setDefaultInstitutionalTemplate(templateId: string) {
  requireAuthentication();
  return apiRequest<InstitutionalTemplate>(`/templates/${templateId}/default`, {
    method: "PATCH",
  });
}

export function deleteInstitutionalTemplate(templateId: string) {
  requireAuthentication();
  return apiRequest<void>(`/templates/${templateId}`, {
    method: "DELETE",
  });
}

export async function downloadInstitutionalTemplate(template: InstitutionalTemplate) {
  requireAuthentication();
  const file = await apiBlob(`/templates/${template.id}/download`);
  downloadApiBlob(file);
}

export async function renderInstitutionalTemplate(templateId: string, artifact: unknown, documentType: string) {
  requireAuthentication();
  const file = await apiBlob(`/templates/${templateId}/render`, {
    method: "POST",
    body: JSON.stringify({ artifact, document_type: documentType }),
  });
  downloadApiBlob(file);
}

const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** Aplica cabecera, pie y logo del formato institucional a un Word ya generado. */
export async function applyInstitutionalTemplate(templateId: string, blob: Blob, fileName: string): Promise<{ blob: Blob; filename: string }> {
  requireAuthentication();
  const form = new FormData();
  form.set("file", new File([blob], fileName, { type: DOCX_MIME }));
  return apiBlob(`/templates/${templateId}/apply`, { method: "POST", body: form, timeoutMs: 55_000 });
}

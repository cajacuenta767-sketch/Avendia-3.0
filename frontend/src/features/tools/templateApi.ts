import { apiBlob, apiRequest, downloadApiBlob } from "../../lib/api";

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

function authenticationHeaders() {
  const token = sessionStorage.getItem("avendia.accessToken");
  if (!token) throw new Error("Inicia sesión para usar tus formatos institucionales.");
  return { Authorization: `Bearer ${token}` };
}

export function listInstitutionalTemplates() {
  return apiRequest<InstitutionalTemplate[]>("/templates", { headers: authenticationHeaders() });
}

export function uploadInstitutionalTemplate(file: File, makeDefault = false) {
  const form = new FormData();
  form.append("file", file);
  form.append("make_default", String(makeDefault));
  return apiRequest<InstitutionalTemplate>("/templates", {
    method: "POST",
    headers: authenticationHeaders(),
    body: form,
  });
}

export function setDefaultInstitutionalTemplate(templateId: string) {
  return apiRequest<InstitutionalTemplate>(`/templates/${templateId}/default`, {
    method: "PATCH",
    headers: authenticationHeaders(),
  });
}

export function deleteInstitutionalTemplate(templateId: string) {
  return apiRequest<void>(`/templates/${templateId}`, {
    method: "DELETE",
    headers: authenticationHeaders(),
  });
}

export async function downloadInstitutionalTemplate(template: InstitutionalTemplate) {
  const file = await apiBlob(`/templates/${template.id}/download`, { headers: authenticationHeaders() });
  downloadApiBlob(file);
}

export async function renderInstitutionalTemplate(templateId: string, artifact: unknown, documentType: string) {
  const file = await apiBlob(`/templates/${templateId}/render`, {
    method: "POST",
    headers: authenticationHeaders(),
    body: JSON.stringify({ artifact, document_type: documentType }),
  });
  downloadApiBlob(file);
}

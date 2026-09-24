/**
 * Adaptador de `WorkflowGateway` sobre la API de Avendia.
 *
 * Es el único punto del motor que conoce rutas y cabeceras. Traduce el lenguaje
 * del dominio (documento, vínculo, generación) al del servidor.
 */
import { apiRequest } from "../../../../lib/api";
import { readAccessToken } from "../../../../lib/session";
import {
  referencesFromDocuments,
  type CurricularReference,
  type ReferenceDocument,
} from "../../../../lib/curricularReference";
import type { WorkflowArtifact } from "../../exportWorkflowDocx";
import type { CompatibleDocument } from "../../documentReference";
import type {
  DocumentToSave,
  GenerationRequest,
  RelationToSave,
  SavedDocument,
  StoredDocument,
  WorkflowGateway,
} from "../ports/workflowGateway";

function authHeaders(): Record<string, string> | undefined {
  const token = readAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

export function httpWorkflowGateway(): WorkflowGateway {
  return {
    async readDocument(documentId: string): Promise<StoredDocument | null> {
      const headers = authHeaders();
      if (!headers) return null;
      return apiRequest<StoredDocument>(`/documents/${documentId}`, { headers });
    },

    async saveDocument(document: DocumentToSave): Promise<SavedDocument | null> {
      const headers = authHeaders();
      if (!headers) return null;
      const saved = await apiRequest<{ id: string }>(
        document.documentId ? `/documents/${document.documentId}` : "/documents",
        {
          method: document.documentId ? "PATCH" : "POST",
          headers,
          body: JSON.stringify({
            title: document.title,
            document_type: document.documentType,
            content: document.content,
            metadata: { version: document.serverVersion, ...document.metadata },
          }),
        },
      );
      return { id: saved.id, serverVersion: document.serverVersion };
    },

    async linkDocument(relation: RelationToSave): Promise<void> {
      const headers = authHeaders();
      if (!headers) return;
      await apiRequest("/documents/relations", {
        method: "POST",
        headers,
        body: JSON.stringify({
          parent_document_id: relation.parentDocumentId,
          child_document_id: relation.childDocumentId,
          relation_type: relation.relationType,
          inherited_fields: relation.inheritedFields,
          context: relation.context,
          compatibility_status: relation.compatibilityStatus,
          consent: true,
        }),
      });
    },

    generate(request: GenerationRequest): Promise<WorkflowArtifact> {
      return apiRequest<WorkflowArtifact>("/ai/tools/workflow/generate", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          request_id: request.requestId,
          tool_id: request.toolId,
          module: request.module,
          tool_title: request.toolTitle,
          artifact_type: request.artifactType,
          fields: request.fields,
          requested_sections: request.requestedSections,
          ...(request.sourceDocumentId ? { source_document_id: request.sourceDocumentId } : {}),
        }),
      });
    },

    async listCurricularReferences(signal?: AbortSignal): Promise<CurricularReference[]> {
      const headers = authHeaders();
      if (!headers) return [];
      const documents = await apiRequest<ReferenceDocument[]>("/documents", { headers, signal });
      return referencesFromDocuments(documents);
    },

    async listCompatibleDocuments(targetType: string): Promise<CompatibleDocument[] | null> {
      const headers = authHeaders();
      if (!headers) return null;
      return apiRequest<CompatibleDocument[]>(`/documents/compatible/${targetType}`, { headers });
    },
  };
}

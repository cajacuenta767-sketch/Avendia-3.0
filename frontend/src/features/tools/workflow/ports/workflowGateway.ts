/**
 * Puerto de datos remotos del motor de herramientas.
 *
 * Declara QUÉ necesita el caso de uso —guardar el documento, vincularlo con su
 * origen, generar el artefacto, listar planes y unidades— sin decir cómo se
 * habla con el servidor. El componente deja así de conocer rutas, cabeceras ni
 * formatos de petición.
 */
import type { WorkflowArtifact } from "../../exportWorkflowDocx";
import type { CurricularReference } from "../../../../lib/curricularReference";
import type { FieldValue } from "../domain/fieldValue";
import type { CompatibleDocument } from "../../documentReference";

export type SavedDocument = { id: string; serverVersion: number };

export type DocumentToSave = {
  title: string;
  documentType: string;
  content: string;
  metadata: Record<string, unknown>;
  /** Presente al actualizar un documento ya guardado. */
  documentId?: string;
  serverVersion: number;
};

export type RelationToSave = {
  parentDocumentId: string;
  childDocumentId: string;
  relationType: "continuation" | "reference";
  inheritedFields: string[];
  context: Record<string, unknown>;
  compatibilityStatus: "compatible" | "review";
};

export type GenerationRequest = {
  requestId: string;
  toolId: string;
  module: string;
  toolTitle: string;
  artifactType: string;
  fields: Record<string, string>;
  requestedSections: string[];
  /** Plan anual o unidad de la que procede el documento, cuando se eligió. */
  sourceDocumentId?: string;
};

/** Documento recuperado del historial, tal como lo guarda el servidor. */
export type StoredDocument = { id: string; metadata_json: Record<string, unknown> };

export type WorkflowGateway = {
  /** `null` cuando no hay sesión o el documento no se puede recuperar. */
  readDocument(documentId: string): Promise<StoredDocument | null>;
  /** `null` cuando no hay sesión: el borrador se queda en el dispositivo. */
  saveDocument(document: DocumentToSave): Promise<SavedDocument | null>;
  linkDocument(relation: RelationToSave): Promise<void>;
  generate(request: GenerationRequest): Promise<WorkflowArtifact>;
  listCurricularReferences(signal?: AbortSignal): Promise<CurricularReference[]>;
  /** Documentos del historial que pueden alimentar esta herramienta; `null` sin sesión. */
  listCompatibleDocuments(targetType: string): Promise<CompatibleDocument[] | null>;
};

export type { FieldValue };

import type { WorkflowDefinition } from "../../config/workflows";
import type { WorkflowArtifact } from "./exportWorkflowDocx";
import { WordDocumentPreview } from "./WordDocumentPreview";

type Props = {
  artifact: WorkflowArtifact;
  artifactType: WorkflowDefinition["artifactType"];
  toolId: string;
  values: Record<string, unknown>;
  workflowKey?: string;
  onDownloadWord?: () => void;
  editingResult?: boolean;
  onUpdateSection?: (index: number, key: "title" | "narrative", value: string) => void;
  onUpdateTableCell?: (tableIndex: number, rowIndex: number, cellIndex: number, value: string) => void;
  onRegenerateSection?: (index: number) => void;
  regeneratingSection?: number | null;
  onPrepareExactPreview?: () => Promise<Blob>;
};

export function StructuredArtifactPreview({
  artifact,
  artifactType,
  values,
  toolId,
  workflowKey,
  onDownloadWord,
  editingResult,
  onUpdateSection,
  onUpdateTableCell,
  onRegenerateSection,
  regeneratingSection,
  onPrepareExactPreview,
}: Props) {
  // Previsualización enriquecida universal tipo hoja de Word adaptada a las 57 herramientas
  return (
    <WordDocumentPreview
      artifact={artifact}
      artifactType={artifactType}
      toolId={toolId}
      workflowKey={workflowKey}
      values={values}
      onDownloadWord={onDownloadWord}
      editingResult={editingResult}
      onUpdateSection={onUpdateSection}
      onUpdateTableCell={onUpdateTableCell}
      onRegenerateSection={onRegenerateSection}
      regeneratingSection={regeneratingSection}
      onPrepareExactPreview={onPrepareExactPreview}
    />
  );
}

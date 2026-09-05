import { lazy, Suspense } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { WorkflowTool } from "./WorkflowTool";

const ChecklistTool = lazy(() => import("../evaluations/checklist/ChecklistTool").then((module) => ({ default: module.ChecklistTool })));
const RubricTool = lazy(() => import("../evaluations/rubric/RubricTool").then((module) => ({ default: module.RubricTool })));
const SourceDocumentTool = lazy(() => import("../evaluations/source-documents/SourceDocumentTool").then((module) => ({ default: module.SourceDocumentTool })));
const ObservationTool = lazy(() => import("../evaluations/observation/ObservationTool").then((module) => ({ default: module.ObservationTool })));
const RecoveryFolderTool = lazy(() => import("../evaluations/recovery/RecoveryFolderTool").then((module) => ({ default: module.RecoveryFolderTool })));
const AuxiliaryRegisterTool = lazy(() => import("../evaluations/registers/AuxiliaryRegisterTool").then((module) => ({ default: module.AuxiliaryRegisterTool })));

function EvaluationLoadingState() {
  return <div className="admin-state" role="status">Preparando la herramienta de evaluación…</div>;
}

export function ToolWorkspace() {
  const { moduleId, toolId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  if (moduleId !== "evaluamos") return <WorkflowTool />;

  const instrumentId = searchParams.get("document")?.trim() || undefined;
  const handleInstrumentIdChange = (nextInstrumentId: string) => {
    const next = new URLSearchParams(searchParams);
    if (nextInstrumentId) next.set("document", nextInstrumentId);
    else next.delete("document");
    setSearchParams(next, { replace: true });
  };

  let content = null;
  const instrumentProps = { instrumentId, onInstrumentIdChange: handleInstrumentIdChange };
  if (toolId === "lista-cotejo") content = <ChecklistTool {...instrumentProps} />;
  if (toolId === "rubrica-evaluacion" || toolId === "rubrica") content = <RubricTool variant="builder" {...instrumentProps} />;
  if (toolId === "calificador-rubrica" || toolId === "calificador") content = <RubricTool variant="grader" {...instrumentProps} />;
  if (toolId === "ficha-aprendizaje") content = <SourceDocumentTool kind="learning_sheet" {...instrumentProps} />;
  if (toolId === "preguntas-texto") content = <SourceDocumentTool kind="text_questions" {...instrumentProps} />;
  if (toolId === "ficha-observacion") content = <ObservationTool {...instrumentProps} />;
  if (toolId === "carpetas-recuperacion") content = <RecoveryFolderTool {...instrumentProps} />;
  if (toolId === "registros-auxiliares") content = <AuxiliaryRegisterTool {...instrumentProps} />;

  if (!content) return <WorkflowTool />;
  return <Suspense fallback={<EvaluationLoadingState />}>{content}</Suspense>;
}

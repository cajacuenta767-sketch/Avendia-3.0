import type { StudentSelection } from "../../../components/students/StudentSelector";
import type { EducationFrame } from "../source-documents/evaluationContracts";
import type { WorkflowArtifact } from "../../tools/exportWorkflowDocx";

export type RecoverySelectionMode = "single" | "multiple" | "classroom";

export type RecoveryToolState = {
  frame: EducationFrame;
  selection_mode: RecoverySelectionMode;
  selection: StudentSelection | null;
  application_period: string;
  diagnosis: string;
  prioritized_competencies: string;
  criteria: string;
  expected_evidence: string;
  activity_route: string;
  resources: string;
  timeline: string;
  family_guidance: string;
  general_followup: string;
  individual_followup: Record<string, string>;
  artifact: WorkflowArtifact | null;
};

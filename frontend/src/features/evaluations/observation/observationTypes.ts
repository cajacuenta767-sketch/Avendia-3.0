import type { StudentSelection } from "../../../components/students/StudentSelector";
import type { EducationFrame } from "../source-documents/evaluationContracts";

export type ObservationMode = "individual" | "multiple" | "team" | "classroom";

export type ObservationCriterionDraft = {
  client_key: string;
  title: string;
};

export type ObservationToolState = {
  frame: EducationFrame;
  mode: ObservationMode;
  selection: StudentSelection | null;
  observed_date: string;
  observed_time: string;
  situation: string;
  focus: string;
  scale_type: "Descriptiva" | "AD/A/B/C" | "Frecuencia";
  criteria: ObservationCriterionDraft[];
  common_notes: string;
  individual_notes: Record<string, string>;
  context_factors: string;
  interpretation: string;
  conclusion: string;
  commitments: string;
};

export type EvaluationInstrumentKind =
  | "checklist"
  | "rubric"
  | "observation"
  | "recovery"
  | "auxiliary_record"
  | "learning_sheet"
  | "text_questions";

export type ParticipantRole = "student" | "team_member" | "group";

export type EvaluationParticipant = {
  student_id: string;
  role?: ParticipantRole;
  team_name?: string | null;
  sort_order?: number;
  common_notes?: string | null;
  individual_notes?: string | null;
};

export type EvaluationLevel = {
  client_key: string;
  code: string;
  label: string;
  description?: string;
  score?: number;
  sort_order?: number;
};

export type EvaluationCriterion = {
  client_key: string;
  code: string;
  title: string;
  description?: string;
  weight?: number;
  sort_order: number;
  levels?: EvaluationLevel[];
};

export type EvaluationRecord = {
  student_id: string;
  criterion_key: string;
  level_key?: string | null;
  value?: string | null;
  evidence?: string | null;
  strength?: string | null;
  improvement?: string | null;
  recommendation?: string | null;
  teacher_decision?: string | null;
  observation?: string | null;
};

export type InstrumentObservation = {
  student_id?: string | null;
  observed_at: string;
  situation: string;
  focus: string;
  objective_facts: string;
  context_factors?: string | null;
  interpretation?: string | null;
  conclusion?: string | null;
  commitments?: string | null;
  common_to_group?: boolean;
};

export type EvaluationDraftPayload = {
  kind: EvaluationInstrumentKind;
  status?: "draft" | "generated";
  title: string;
  roster_id?: string | null;
  general_data?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  general_observation?: string | null;
  participants?: EvaluationParticipant[];
  criteria?: EvaluationCriterion[];
  records?: EvaluationRecord[];
  observations?: InstrumentObservation[];
  expected_revision?: number;
};

export type EvaluationInstrument = Omit<EvaluationDraftPayload, "status"> & {
  id: string;
  status?: "draft" | "generated" | "archived";
  revision?: number;
  created_at?: string;
  updated_at?: string;
  sources?: EvaluationSourceDocument[];
};

export type EvaluationInstrumentList = {
  items: EvaluationInstrument[];
  total: number;
  limit?: number;
  offset?: number;
};

export type EvaluationSourceDocument = {
  id: string;
  filename: string;
  media_type: string;
  extension: string;
  byte_size: number;
  sha256: string;
  extracted_text: string;
  extraction_status: "pending" | "completed" | "failed";
  created_at: string;
  instrument_revision: number;
};

export type TextSize = "small" | "medium" | "large";

export type SourceDocumentValue = {
  pasted_text: string;
  sources: SourceDocumentItem[];
  reading_text_size: TextSize;
  question_text_size: TextSize;
};

export type SourceDocumentItem = {
  source_id: string;
  filename: string;
  extracted_text: string;
  edited_text: string;
  extension?: string;
  byte_size?: number;
};

export const EMPTY_SOURCE_DOCUMENT: SourceDocumentValue = {
  pasted_text: "",
  sources: [],
  reading_text_size: "medium",
  question_text_size: "medium",
};

export type EducationFrame = {
  teacher_name: string;
  institution_name: string;
  modality: "EBR" | "EBA" | "EBE";
  education_level: string;
  grade_or_cycle: string;
  section: string;
  curricular_area: string;
};

export const EMPTY_EDUCATION_FRAME: EducationFrame = {
  teacher_name: "",
  institution_name: "",
  modality: "EBR",
  education_level: "",
  grade_or_cycle: "",
  section: "",
  curricular_area: "",
};

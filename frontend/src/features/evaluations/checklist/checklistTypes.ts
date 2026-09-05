import type { StudentSelection } from "../../../components/students/StudentSelector";

export type ChecklistResponse = "yes" | "no" | "in_progress";
export type ChecklistResponseScale = "yes_no" | "yes_no_progress";

export type ChecklistGeneralData = {
  teacherName: string;
  directorName: string;
  institution: string;
  modality: "EBR" | "EBA" | "EBE";
  level: string;
  grade: string;
  area: string;
  activity: string;
  date: string;
  period: string;
};

/** Canonical API shape. Legacy camelCase drafts remain readable by the backend. */
export type ChecklistGeneralDataPayload = {
  teacher_name: string;
  director_name: string;
  institution_name: string;
  modality: "EBR" | "EBA" | "EBE";
  education_level: string;
  grade: string;
  curricular_area: string;
  activity: string;
  date: string;
  period: string;
};

export type ChecklistCriterion = {
  id: string;
  code: string;
  description: string;
};

export type ChecklistStudentRecord = {
  studentId: string;
  responses: Record<string, ChecklistResponse | "">;
  observation: string;
};

export type ChecklistDraft = {
  version: 1;
  general: ChecklistGeneralData;
  selection: StudentSelection | null;
  responseScale: ChecklistResponseScale;
  criteria: ChecklistCriterion[];
  records: ChecklistStudentRecord[];
  generalObservation: string;
  currentStep: number;
  updatedAt: string;
};

export type InstrumentParticipantInput = {
  student_id: string;
  role: "student";
  sort_order: number;
  individual_notes?: string | null;
};

export type InstrumentCriterionInput = {
  client_key: string;
  code: string;
  title: string;
  description?: string | null;
  sort_order: number;
};

export type InstrumentChecklistRecordInput = {
  student_id: string;
  criterion_key: string;
  value: ChecklistResponse | null;
  observation?: string | null;
};

export type ChecklistInstrumentPayload = {
  kind: "checklist";
  status: "draft" | "generated";
  title: string;
  roster_id?: string;
  general_data: ChecklistGeneralDataPayload;
  settings: { response_scale: ChecklistResponseScale };
  general_observation?: string | null;
  participants: InstrumentParticipantInput[];
  criteria: InstrumentCriterionInput[];
  records: InstrumentChecklistRecordInput[];
  expected_revision?: number;
};

export type EvaluationInstrumentDetail = {
  id: string;
  kind?: string;
  title?: string;
  roster_id?: string | null;
  revision: number;
  status?: "draft" | "generated" | "archived";
  general_data?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  general_observation?: string | null;
  participants?: Array<{
    student_id: string;
    sort_order?: number;
    individual_notes?: string | null;
  }>;
  criteria?: Array<{
    client_key: string;
    code: string;
    title: string;
    description?: string | null;
    sort_order?: number;
  }>;
  records?: Array<{
    student_id: string;
    criterion_key: string;
    value?: ChecklistResponse | null;
    observation?: string | null;
  }>;
  updated_at?: string;
};

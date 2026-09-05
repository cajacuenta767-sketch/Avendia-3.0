import type { StudentSelection } from "../../../components/students/StudentSelector";

export type RubricType = "analytic" | "holistic";

export type RubricGeneralData = {
  teacherName: string;
  institution: string;
  modality: "EBR" | "EBA" | "EBE";
  level: string;
  grade: string;
  area: string;
  competence: string;
  performance: string;
  context: string;
  evidenceTitle: string;
  date: string;
};

export type RubricLevel = {
  id: string;
  code: string;
  label: string;
  score: number;
};

export type RubricCriterion = {
  id: string;
  code: string;
  title: string;
  description: string;
  weight: number | null;
  descriptors: Record<string, string>;
};

export type RubricCriterionRating = {
  levelId: string;
  strength: string;
  improvement: string;
  recommendation: string;
};

export type RubricStudentAssessment = {
  studentId: string;
  evidence: string;
  ratings: Record<string, RubricCriterionRating>;
  teacherDecision: string;
};

export type RubricDraft = {
  version: 1;
  rubricType: RubricType;
  weighted: boolean;
  general: RubricGeneralData;
  selection: StudentSelection | null;
  criteria: RubricCriterion[];
  levels: RubricLevel[];
  assessments: RubricStudentAssessment[];
  currentStep: number;
  activeStudentId: string;
  updatedAt: string;
};

export type RubricInstrumentPayload = {
  kind: "rubric";
  status: "draft" | "generated";
  title: string;
  roster_id?: string;
  general_data: Record<string, unknown>;
  settings: { rubric_type: RubricType; weighted: boolean };
  participants: Array<{ student_id: string; role: "student"; sort_order: number }>;
  criteria: Array<{
    client_key: string;
    code: string;
    title: string;
    description?: string | null;
    weight?: number | null;
    sort_order: number;
    levels: Array<{
      client_key: string;
      code: string;
      label: string;
      description?: string | null;
      score?: number | null;
      sort_order: number;
    }>;
  }>;
  records: Array<{
    student_id: string;
    criterion_key: string;
    level_key?: string | null;
    evidence?: string | null;
    strength?: string | null;
    improvement?: string | null;
    recommendation?: string | null;
    teacher_decision?: string | null;
  }>;
  expected_revision?: number;
};

export type RubricInstrumentDetail = {
  id: string;
  kind?: string;
  title?: string;
  roster_id?: string | null;
  revision: number;
  status?: "draft" | "generated" | "archived";
  general_data?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  participants?: Array<{ student_id: string; sort_order?: number }>;
  criteria?: Array<{
    client_key: string;
    code: string;
    title: string;
    description?: string | null;
    weight?: number | null;
    sort_order?: number;
    levels?: Array<{
      client_key: string;
      code: string;
      label: string;
      description?: string | null;
      score?: number | null;
      sort_order?: number;
    }>;
  }>;
  records?: Array<{
    student_id: string;
    criterion_key: string;
    level_key?: string | null;
    evidence?: string | null;
    strength?: string | null;
    improvement?: string | null;
    recommendation?: string | null;
    teacher_decision?: string | null;
  }>;
  updated_at?: string;
};

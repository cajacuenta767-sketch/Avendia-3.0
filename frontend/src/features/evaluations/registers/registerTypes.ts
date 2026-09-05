import type { StudentSelection } from "../../../components/students/StudentSelector";
import type { EducationFrame } from "../source-documents/evaluationContracts";

export type AttendanceValue = "P" | "T" | "A" | "J";

export type AuxiliaryRegisterState = {
  frame: EducationFrame;
  selection: StudentSelection | null;
  period: string;
  competencies: string;
  criteria: string;
  evidence: string;
  attendance_date: string;
  attendance: Record<string, AttendanceValue>;
  attendance_observations: string;
  in_progress_conclusions: string;
  achieved_conclusions: string;
  individual_conclusions: Record<string, string>;
};

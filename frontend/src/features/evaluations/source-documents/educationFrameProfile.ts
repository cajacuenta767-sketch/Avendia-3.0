import { readStoredSessionUser } from "../../../lib/session";
import type { EducationFrame } from "./evaluationContracts";

export function educationFrameFromProfile(): EducationFrame {
  const profile = (readStoredSessionUser() ?? {}) as Record<string, unknown>;
  const modality = String(profile.education_modality ?? "EBR");
  return {
    teacher_name: String(profile.full_name ?? ""),
    institution_name: String(profile.school_name ?? ""),
    modality: modality === "EBA" || modality === "EBE" ? modality : "EBR",
    education_level: String(profile.education_level ?? ""),
    grade_or_cycle: String(profile.grade ?? ""),
    section: String(profile.section ?? ""),
    curricular_area: String(profile.curricular_area ?? ""),
  };
}

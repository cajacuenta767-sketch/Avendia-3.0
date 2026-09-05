import type { Student } from "../../rosters/rosterTypes";
import type { RubricCriterion, RubricStudentAssessment } from "./rubricTypes";

export function reconcileRubricAssessments(
  students: Student[],
  criteria: RubricCriterion[],
  assessments: RubricStudentAssessment[],
): RubricStudentAssessment[] {
  const byStudent = new Map(assessments.map((assessment) => [assessment.studentId, assessment]));
  return students.map((student) => {
    const existing = byStudent.get(student.id);
    return {
      studentId: student.id,
      evidence: existing?.evidence ?? "",
      teacherDecision: existing?.teacherDecision ?? "",
      ratings: Object.fromEntries(criteria.map((criterion) => {
        const rating = existing?.ratings[criterion.id];
        return [criterion.id, {
          levelId: rating?.levelId ?? "",
          strength: rating?.strength ?? "",
          improvement: rating?.improvement ?? "",
          recommendation: rating?.recommendation ?? "",
        }];
      })),
    };
  });
}

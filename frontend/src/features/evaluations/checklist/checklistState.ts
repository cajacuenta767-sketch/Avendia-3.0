import type { Student } from "../../rosters/rosterTypes";
import type { ChecklistCriterion, ChecklistStudentRecord } from "./checklistTypes";

export function reconcileChecklistRecords(
  students: Student[],
  criteria: ChecklistCriterion[],
  records: ChecklistStudentRecord[],
): ChecklistStudentRecord[] {
  const currentByStudent = new Map(records.map((record) => [record.studentId, record]));
  return students.map((student) => {
    const current = currentByStudent.get(student.id);
    return {
      studentId: student.id,
      observation: current?.observation ?? "",
      responses: Object.fromEntries(criteria.map((criterion) => [criterion.id, current?.responses[criterion.id] ?? ""])),
    };
  });
}

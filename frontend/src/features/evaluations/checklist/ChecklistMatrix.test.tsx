import { describe, expect, it } from "vitest";

import type { Student } from "../../rosters/rosterTypes";
import { reconcileChecklistRecords } from "./checklistState";

describe("reconcileChecklistRecords", () => {
  it("preserves marks by stable IDs and removes deleted criterion columns", () => {
    const students: Student[] = [{ id: "student-1", roster_id: "roster-1", full_name: "Ana", sort_order: 0, active: true }];
    const result = reconcileChecklistRecords(
      students,
      [{ id: "criterion-new", code: "C1", description: "Nuevo" }],
      [{ studentId: "student-1", observation: "Nota", responses: { "criterion-old": "no", "criterion-new": "yes" } }],
    );
    expect(result).toEqual([{ studentId: "student-1", observation: "Nota", responses: { "criterion-new": "yes" } }]);
  });
});

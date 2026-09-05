import { describe, expect, it } from "vitest";

import { getWorkflowFieldGuide } from "./aiGuides";
import { workflowDefinitions } from "./workflows";

describe("contextual AI guides", () => {
  it("resolves every recovered AI button to a field-specific context", () => {
    const fallbackGuides: string[] = [];

    for (const workflow of workflowDefinitions) {
      for (const field of workflow.steps.flatMap((step) => step.fields).filter((item) => item.guide !== false)) {
        const guide = getWorkflowFieldGuide(workflow.toolId, field);
        if (guide.contextKey?.startsWith("fallback:")) fallbackGuides.push(`${workflow.key}:${field.id}`);
        expect(guide.title, `${workflow.key}:${field.id}`).toBeTruthy();
        expect(guide.question1, `${workflow.key}:${field.id}`).toContain("¿");
        expect(guide.question2, `${workflow.key}:${field.id}`).toContain("¿");
        expect(guide.suggestions?.length, `${workflow.key}:${field.id}`).toBeGreaterThanOrEqual(5);
      }
    }

    expect(fallbackGuides).toEqual([]);
  });

  it("changes the questions when the selected field changes", () => {
    const pca = workflowDefinitions.find((workflow) => workflow.key === "planificamos/plan-curricular-anual");
    const fields = pca?.steps.flatMap((step) => step.fields) ?? [];
    const justification = fields.find((field) => field.id === "justification");
    const bibliography = fields.find((field) => field.id === "teacher_bibliography");

    expect(justification).toBeDefined();
    expect(bibliography).toBeDefined();
    const justificationGuide = getWorkflowFieldGuide(pca!.toolId, justification!);
    const bibliographyGuide = getWorkflowFieldGuide(pca!.toolId, bibliography!);

    expect(justificationGuide.question1).not.toBe(bibliographyGuide.question1);
    expect(justificationGuide.suggestions).not.toEqual(bibliographyGuide.suggestions);
  });

  it("covers the 58 routes for the 57 functional tools and excludes administrative fields", () => {
    expect(workflowDefinitions.length).toBe(58);
    const functionalKeys = workflowDefinitions.map((workflow) =>
      workflow.toolId === "adaptacion-nee-dua" ? workflow.toolId : workflow.key,
    );
    expect(new Set(functionalKeys).size).toBe(57);
    const administrativeIds = ["dre", "ugel", "institution", "teacher_name", "director_name", "subdirector_name", "school_year", "section", "modality", "level", "grade", "curricular_area"];

    for (const workflow of workflowDefinitions) {
      const allFields = workflow.steps.flatMap((step) => step.fields);
      const guidedFields = allFields.filter((item) => item.guide !== false);
      expect(guidedFields.length, `Workflow ${workflow.key} should have pedagogical guided fields`).toBeGreaterThan(0);

      // Verify no administrative fields are guided
      for (const adminId of administrativeIds) {
        const adminField = allFields.find((f) => f.id === adminId);
        if (adminField) {
          expect(adminField.guide, `Administrative field ${adminId} in ${workflow.key} must not be guided`).toBe(false);
        }
      }
    }
  });
});

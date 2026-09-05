import { describe, expect, it } from "vitest";

import { tools } from "./tools";
import { LEGACY_WORKFLOW_SHAPES } from "./legacyWorkflowShapes";
import { getWorkflow, LEGACY_GUIDED_FIELDS, WORKFLOW_GUIDED_FIELDS, workflowDefinitions, workflowModalities } from "./workflows";

describe("workflow registry", () => {
  it("covers every sidebar tool exactly once", () => {
    expect(workflowDefinitions).toHaveLength(tools.length);
    expect(new Set(workflowDefinitions.map((workflow) => workflow.key)).size).toBe(tools.length);
    for (const tool of tools) expect(getWorkflow(tool), tool.path).toBeDefined();
  });

  it("certifies the 58 routes that expose the 57 functional tools", () => {
    const counts = Object.fromEntries(
      ["planificamos", "evaluamos", "incluimos", "reforzamos", "acompanamos", "tutoria", "recursos"]
        .map((module) => [module, workflowDefinitions.filter((workflow) => workflow.module === module).length]),
    );

    expect(counts).toEqual({
      planificamos: 8,
      evaluamos: 12,
      incluimos: 5,
      reforzamos: 5,
      acompanamos: 5,
      tutoria: 8,
      recursos: 15,
    });

    const functionalKeys = workflowDefinitions.map((workflow) =>
      workflow.toolId === "adaptacion-nee-dua" ? workflow.toolId : workflow.key,
    );
    expect(new Set(functionalKeys).size).toBe(57);
  });

  it("gives every field and result a usable explicit contract", () => {
    for (const workflow of workflowDefinitions) {
      expect(workflow.steps.length, workflow.key).toBeGreaterThan(0);
      expect(workflow.outputSections.length, workflow.key).toBeGreaterThan(0);
      expect(new Set(workflow.outputSections).size, workflow.key).toBe(workflow.outputSections.length);

      for (const step of workflow.steps) {
        expect(step.title.trim(), `${workflow.key}:${step.id}`).not.toBe("");
        expect(step.description.trim(), `${workflow.key}:${step.id}`).not.toBe("");
        for (const field of step.fields) {
          expect(field.help?.trim(), `${workflow.key}:${field.id}:help`).not.toBe("");
          if (field.type === "text" || field.type === "textarea") {
            expect(field.placeholder?.trim(), `${workflow.key}:${field.id}`).not.toBe("");
          }
          if (field.type === "select" || field.type === "multiselect") {
            expect(
              Boolean(field.options?.length || field.dynamicOptions),
              `${workflow.key}:${field.id}`,
            ).toBe(true);
          }
        }
      }
    }
  });

  it("requires an education modality in every tool", () => {
    for (const workflow of workflowDefinitions) {
      const modality = workflow.steps.flatMap((step) => step.fields).find((field) => field.id === "modality");
      expect(modality, workflow.key).toMatchObject({ type: "select", required: true });
      expect(modality?.options, workflow.key).toEqual(workflowModalities);
    }
    expect(workflowModalities.map((option) => option.slice(0, 3))).toEqual(["EBR", "EBA", "EBE"]);
    expect(workflowDefinitions.flatMap((workflow) => workflow.steps.flatMap((step) => step.fields.flatMap((field) => field.options ?? []))).some((option) => option.includes("EBEE"))).toBe(false);
  });

  it("makes every level selector depend on the selected modality", () => {
    for (const workflow of workflowDefinitions) {
      const level = workflow.steps.flatMap((step) => step.fields).find((field) => field.id === "level");
      if (!level) continue;
      expect(level.type, workflow.key).toBe("select");
      expect(level.dependsOn, workflow.key).toBe("modality");
      expect(level.dynamicOptions, workflow.key).toBe("levelsByModality");
    }
  });

  it("keeps complex planning flows deeper than didactic resources", () => {
    const pca = workflowDefinitions.find((workflow) => workflow.key === "planificamos/plan-curricular-anual");
    const flashcards = workflowDefinitions.find((workflow) => workflow.key === "recursos/tarjetas-estudio");
    expect(pca?.steps).toHaveLength(9);
    expect((pca?.steps.flatMap((step) => step.fields).length ?? 0)).toBeGreaterThan(30);
    expect(flashcards?.steps).toHaveLength(3);
    expect((flashcards?.steps.flatMap((step) => step.fields).length ?? 0)).toBeLessThan(15);
  });

  it("uses dependent CNEB selectors instead of free text when an area is available", () => {
    for (const workflow of workflowDefinitions) {
      const fields = workflow.steps.flatMap((step) => step.fields);
      if (!fields.some((field) => field.id === "curricular_area")) continue;
      for (const field of fields.filter((item) => ["competency", "competencies"].includes(item.id))) {
        if (field.guide !== false) {
          expect(field.type, workflow.key).toBe("textarea");
          continue;
        }
        expect(field.dependsOn, workflow.key).toBe("curricular_area");
        expect(field.dynamicOptions, workflow.key).toBe("competenciesByArea");
        expect(["select", "multiselect"], workflow.key).toContain(field.type);
      }
    }
  });

  it("never invents AI suggestions for identification fields", () => {
    const identificationFields = new Set([
      "dre",
      "ugel",
      "institution",
      "teacher_name",
      "director_name",
      "subdirector_name",
      "modality",
      "level",
      "grade",
      "section",
      "sections",
      "school_year",
    ]);

    for (const workflow of workflowDefinitions) {
      for (const field of workflow.steps.flatMap((step) => step.fields)) {
        if (!identificationFields.has(field.id)) continue;
        expect(field.guide, `${workflow.key}:${field.id}`).toBe(false);
      }
    }
  });

  it("keeps AI assistance limited to tools and fields verified in the previous project", () => {
    const guidedFields = workflowDefinitions.flatMap((workflow) =>
      workflow.steps.flatMap((step) =>
        step.fields.filter((field) => field.guide !== false).map((field) => `${workflow.key}:${field.id}`),
      ),
    );

    expect(guidedFields.length).toBeGreaterThan(0);
    expect(guidedFields.every((entry) => !entry.endsWith(":dre") && !entry.endsWith(":ugel") && !entry.endsWith(":institution"))).toBe(true);
  });

  it("keeps every verified legacy AI field connected to a real field", () => {
    const missingByWorkflow: Record<string, string[]> = {};
    for (const [workflowKey, expectedFieldIds] of Object.entries(LEGACY_GUIDED_FIELDS)) {
      const workflow = workflowDefinitions.find((item) => item.key === workflowKey);
      const actualFieldIds = new Set(workflow?.steps.flatMap((step) => step.fields.map((field) => field.id)) ?? []);
      const missing = expectedFieldIds?.filter((fieldId) => !actualFieldIds.has(fieldId)) ?? [];
      if (missing.length) missingByWorkflow[workflowKey] = missing;
    }
    expect(missingByWorkflow).toEqual({});
  });

  it("matches the exact per-tool AI-button inventory across all 57 tools", () => {
    const expectedCounts: Record<string, number> = Object.fromEntries(
      Object.entries(WORKFLOW_GUIDED_FIELDS).map(([key, fields]) => [key, fields.length])
    );
    const actualCounts = Object.fromEntries(workflowDefinitions
      .map((workflow) => [workflow.key, workflow.steps.flatMap((step) => step.fields).filter((field) => field.guide !== false).length] as const)
      .filter(([, count]) => count > 0));
    expect(actualCounts).toEqual(expectedCounts);
  });

  it("reproduces the PCA institutional and curricular groups from the previous project", () => {
    const pca = workflowDefinitions.find((workflow) => workflow.key === "planificamos/plan-curricular-anual");
    const dataStep = pca?.steps[0];

    expect(dataStep?.columns).toBe(3);
    expect(dataStep?.groups?.map((group) => group.title)).toEqual([
      "1. Datos informativos (DRE / UGEL / I.E.)",
      "2. Estructura y modalidad curricular",
      "3. Selección de áreas curriculares",
      "4. Responsables y enfoque del documento",
    ]);
    expect(dataStep?.fields.find((field) => field.id === "planning_scope")?.variant).toBe("radio");
    expect(dataStep?.fields.filter((field) => ["dre", "ugel", "institution"].includes(field.id)).every((field) => field.guide === false)).toBe(true);
  });

  it("uses the grouped three-column institutional structure in every official document", () => {
    const officialSteps = workflowDefinitions.flatMap((workflow) =>
      workflow.steps.filter((step) => step.groups?.some((group) => group.title.includes("Datos informativos"))).map((step) => ({ workflow, step })),
    );

    expect(officialSteps.length).toBeGreaterThan(0);
    for (const { workflow, step } of officialSteps) {
      expect(step.columns, workflow.key).toBe(3);
      expect(step.groups?.some((group) => group.title.includes("Datos informativos")), workflow.key).toBe(true);
      expect(step.groups?.some((group) => group.title.includes("Estructura y modalidad")), workflow.key).toBe(true);
      expect(step.groups?.some((group) => group.title.includes("Responsables")), workflow.key).toBe(true);
    }
  });

  it("applies every recovered legacy stage title in the original order", () => {
    for (const [workflowKey, shape] of Object.entries(LEGACY_WORKFLOW_SHAPES)) {
      const workflow = workflowDefinitions.find((item) => item.key === workflowKey);
      expect(workflow, workflowKey).toBeDefined();
      expect(workflow?.embeddedResult, workflowKey).toBe(true);
      expect(workflow?.steps.map((item) => item.title), workflowKey).toEqual(shape.stages.map((item) => item.title));
      expect(workflow?.steps.map((item) => item.kind), workflowKey).toEqual(shape.stages.map((item) => item.kind ?? "form"));
    }
  });

  it("does not duplicate fields while regrouping the recovered formats", () => {
    for (const workflow of workflowDefinitions) {
      const fieldIds = workflow.steps.flatMap((step) => step.fields.map((field) => field.id));
      expect(new Set(fieldIds).size, workflow.key).toBe(fieldIds.length);
    }
  });
});

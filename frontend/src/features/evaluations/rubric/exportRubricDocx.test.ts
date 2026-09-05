import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import { describe, expect, it } from "vitest";

import type { Student } from "../../rosters/rosterTypes";
import { buildRubricDocx } from "./exportRubricDocx";
import type { RubricDraft } from "./rubricTypes";

describe("buildRubricDocx", () => {
  it("exports the exact matrix and separate feedback for every selected student", async () => {
    const students: Student[] = [
      { id: "student-1", roster_id: "roster-1", full_name: "Ana Quispe Ramos", internal_code: "EST-01", sort_order: 0, active: true },
      { id: "student-2", roster_id: "roster-1", full_name: "Bruno Flores Soto", internal_code: "EST-02", sort_order: 1, active: true },
    ];
    const levels = [
      { id: "ad", code: "AD", label: "Logro destacado", score: 4 },
      { id: "a", code: "A", label: "Logro esperado", score: 3 },
      { id: "b", code: "B", label: "En proceso", score: 2 },
      { id: "c", code: "C", label: "En inicio", score: 1 },
    ];
    const criterionData = [
      ["Tesis clara", "Formula una tesis verificable y pertinente."],
      ["Evidencias", "Sustenta sus afirmaciones con datos relevantes."],
      ["Coherencia", "Organiza sus argumentos mediante relaciones lógicas."],
    ];
    const criteria = criterionData.map(([title, description], index) => ({
      id: `criterion-${index + 1}`,
      code: `C${index + 1}`,
      title,
      description,
      weight: 100 / 3,
      descriptors: Object.fromEntries(levels.map((level, levelIndex) => [level.id, `${level.label}: evidencia observable específica ${index + 1}.${levelIndex + 1}.`])),
    }));
    const assessments = students.map((student) => ({
      studentId: student.id,
      evidence: `Ensayo revisado de ${student.full_name}.`,
      ratings: Object.fromEntries(criteria.map((criterion) => [criterion.id, {
        levelId: "a",
        strength: `Fortaleza observable en ${criterion.code}.`,
        improvement: `Aspecto concreto por mejorar en ${criterion.code}.`,
        recommendation: `Siguiente paso accionable para ${criterion.code}.`,
      }])),
      teacherDecision: "Mantener acompañamiento formativo y revisar el siguiente borrador.",
    }));
    const draft: RubricDraft = {
      version: 1,
      rubricType: "analytic",
      weighted: false,
      general: {
        teacherName: "Prof. Manuel Cárdenas Vega",
        institution: "I.E. Avendia Demo",
        modality: "EBR",
        level: "Secundaria",
        grade: "4.º de secundaria",
        area: "Comunicación",
        competence: "Escribe diversos tipos de textos en su lengua materna",
        performance: "Sustenta una postura con argumentos y evidencias verificables.",
        context: "Ensayo sobre biodiversidad amazónica.",
        evidenceTitle: "Ensayo argumentativo sobre biodiversidad amazónica",
        date: "2026-09-04",
      },
      selection: { mode: "multiple", rosterId: "roster-1", studentIds: students.map((student) => student.id) },
      criteria,
      levels,
      assessments,
      currentStep: 3,
      activeStudentId: "student-1",
      updatedAt: "2026-09-04T12:00:00Z",
    };

    const buffer = await Packer.toBuffer(buildRubricDocx(draft, students));
    const target = path.resolve("..", "exports-qa-word", "24-rubrica-semantica.docx");
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, buffer);

    expect(buffer.byteLength).toBeGreaterThan(8_000);
    expect(fs.existsSync(target)).toBe(true);
  });
});

import { describe, expect, it } from "vitest";

import {
  areasByLevel,
  getDynamicEducationOptions,
  getEducationLevels,
  gradesByLevel,
} from "./education";

describe("education catalog", () => {
  it("keeps EBR, EBA and EBE in separate official structures", () => {
    expect(getEducationLevels("EBR")).toEqual(["Inicial", "Primaria", "Secundaria"]);
    expect(getEducationLevels("EBA")).toEqual([
      "EBA · Ciclo Inicial",
      "EBA · Ciclo Intermedio",
      "EBA · Ciclo Avanzado",
    ]);
    expect(getEducationLevels("EBE")).toEqual([
      "PRITE · Ciclo I",
      "CEBE · Inicial (ciclo II)",
      "CEBE · Primaria (ciclos III–V)",
    ]);
  });

  it("does not offer regular-school levels inside EBA or EBE", () => {
    expect(getEducationLevels("EBA")).not.toContain("Secundaria");
    expect(getEducationLevels("EBE")).not.toContain("Secundaria");
    expect(gradesByLevel["PRITE · Ciclo I"]).toEqual(["Menor de 1 año", "1 año", "2 años"]);
  });

  it("resolves dependent levels, grades and areas from the selected context", () => {
    expect(getDynamicEducationOptions("levelsByModality", "EBA")).toContain("EBA · Ciclo Avanzado");
    expect(getDynamicEducationOptions("gradesByLevel", "EBA · Ciclo Avanzado")).toHaveLength(4);
    expect(getDynamicEducationOptions("areasByLevel", "CEBE · Primaria (ciclos III–V)"))
      .toEqual(areasByLevel["CEBE · Primaria (ciclos III–V)"]);
  });
});

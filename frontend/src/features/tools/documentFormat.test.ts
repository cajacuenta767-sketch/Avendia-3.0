import { describe, expect, it } from "vitest";

import { attachTablesToSections, isPlaceholder, sameTitle, splitLabel, splitNarrative, toRoman } from "./documentFormat";

describe("documentFormat", () => {
  it("numbers parts with roman numerals", () => {
    expect([1, 2, 3, 4, 5, 9, 10, 14].map(toRoman)).toEqual(["I", "II", "III", "IV", "V", "IX", "X", "XIV"]);
  });

  it("detects placeholders the teacher did not fill", () => {
    expect(isPlaceholder("No registrado")).toBe(true);
    expect(isPlaceholder("  ")).toBe(true);
    expect(isPlaceholder("N/A")).toBe(true);
    expect(isPlaceholder("I.E. 0001")).toBe(false);
  });

  it("splits inline bullets and paragraph breaks into blocks", () => {
    const blocks = splitNarrative("Destacamos lo siguiente: • Creatividad: participa. • Empatía: trato respetuoso.\n\nSegundo párrafo.\n- Punto con guion");
    expect(blocks).toEqual([
      { text: "Destacamos lo siguiente:", bullet: false },
      { text: "Creatividad: participa.", bullet: true },
      { text: "Empatía: trato respetuoso.", bullet: true },
      { text: "Segundo párrafo.", bullet: false },
      { text: "Punto con guion", bullet: true },
    ]);
  });

  it("keeps a plain paragraph intact", () => {
    expect(splitNarrative("Un párrafo normal con 5 • 3 = 15 no es una lista.")).toEqual([
      { text: "Un párrafo normal con 5 • 3 = 15 no es una lista.", bullet: false },
    ]);
  });

  it("recognises short labels only", () => {
    expect(splitLabel("Competencia: Lee diversos tipos de textos")).toEqual({ label: "Competencia", body: "Lee diversos tipos de textos" });
    expect(splitLabel("Lee diversos tipos de textos escritos: en su lengua").label).toBeNull();
    expect(splitLabel("sin etiqueta").label).toBeNull();
  });

  it("matches tables to the section that shares their title words", () => {
    const placement = attachTablesToSections({
      sections: [
        { title: "Propósitos de aprendizaje", narrative: "", key_points: [] },
        { title: "Secuencia didáctica", narrative: "", key_points: [] },
      ],
      tables: [
        { title: "Secuencia didáctica de la sesión", columns: ["a", "b"], rows: [["1", "2"]], note: "" },
        { title: "Calendarización anual", columns: ["a", "b"], rows: [["1", "2"]], note: "" },
      ],
    });
    expect([...placement.bySection.keys()]).toEqual([1]);
    expect(placement.bySection.get(1)?.[0].title).toBe("Secuencia didáctica de la sesión");
    expect(placement.remaining.map((table) => table.title)).toEqual(["Calendarización anual"]);
    expect(sameTitle("Secuencia didáctica", "Secuencia Didáctica")).toBe(true);
    expect(sameTitle("Secuencia didáctica", "Secuencia didáctica de la sesión")).toBe(false);
  });
});

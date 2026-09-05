import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { InteractiveArtifact, type WorkflowActivity } from "./InteractiveArtifact";

afterEach(cleanup);

const items = [
  { id: "item-1", prompt: "Capital del Perú", answer: "Lima", hint: "Ciudad costera", options: ["Cusco", "Lima"] },
  { id: "item-2", prompt: "Capital de Junín", answer: "Huancayo", hint: "Valle del Mantaro", options: ["Huancayo", "Puno"] },
];

function activity(mode: string): WorkflowActivity {
  return { mode, title: "Actividad de prueba", instructions: "Resuelve y comprueba cada elemento.", items, word_bank: [] };
}

describe("InteractiveArtifact", () => {
  it("turns generated flashcards into a revealable activity", () => {
    render(<InteractiveArtifact activity={activity("tarjetas")} toolId="tarjetas-estudio" />);
    fireEvent.click(screen.getByRole("button", { name: /Capital del Perú/i }));
    expect(screen.getByText("Lima")).toBeInTheDocument();
  });

  it("checks completed sentences and reports the score", () => {
    const completion = activity("completar");
    completion.items = [{ ...items[0], prompt: "La capital del Perú es _____.", options: [] }];
    render(<InteractiveArtifact activity={completion} toolId="completa-frase" />);
    fireEvent.change(screen.getByPlaceholderText(/Escribe la palabra/i), { target: { value: "Lima" } });
    fireEvent.click(screen.getByRole("button", { name: /Comprobar respuestas/i }));
    expect(screen.getByText("1 de 1 correctas")).toBeInTheDocument();
  });

  it.each([
    ["presentacion", "presentaciones-didacticas", "Diapositiva 1 de 2"],
    ["ahorcado", "ahorcado", "6 intentos"],
    ["emparejar", "emparejar-palabras", "Columna A"],
    ["crucigrama", "crucigramas", "Comprobar crucigrama"],
    ["sopa", "sopas-letras", "Comprobar selección"],
    ["catalogo", "banco-planificacion", "Ver orientación"],
  ])("renders the %s workspace", (mode, toolId, expected) => {
    render(<InteractiveArtifact activity={activity(mode)} toolId={toolId} />);
    expect(screen.getAllByText(expected)[0]).toBeInTheDocument();
  });

  it("keeps a thirty-word word search proportional and scrollable", () => {
    const vocabulary = [
      "Agua", "Bosque", "Clima", "Tierra", "Reciclaje", "Energía", "Sol", "Viento",
      "Río", "Lago", "Océano", "Flora", "Fauna", "Hábitat", "Residuo", "Papel",
      "Vidrio", "Metal", "Plástico", "Compost", "Semilla", "Árbol", "Hoja", "Raíz",
      "Lluvia", "Nube", "Aire", "Suelo", "Naturaleza", "Planeta",
    ];
    const manyWords = vocabulary.map((answer, index) => ({
      id: `word-${index + 1}`,
      prompt: `Pista ${index + 1}`,
      answer,
      hint: "Relacionada con el tema",
      options: [],
    }));
    render(<InteractiveArtifact activity={{ ...activity("sopa"), items: manyWords }} toolId="sopas-letras" />);
    const grid = document.querySelector(".wordsearch-grid") as HTMLElement;
    expect(grid).toBeInTheDocument();
    expect(grid.style.gridTemplateColumns).toContain("var(--puzzle-cell)");
    expect(screen.getAllByRole("button", { name: /Letra/ }).length).toBeGreaterThanOrEqual(16 * 16);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

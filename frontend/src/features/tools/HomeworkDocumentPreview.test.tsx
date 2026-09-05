import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomeworkDocumentPreview } from "./HomeworkDocumentPreview";

const artifact = {
  document_title: "Cuidamos el agua en casa",
  executive_summary: "Observar el uso del agua y proponer una mejora posible para el hogar.",
  sections: [{ title: "Propósito", narrative: "Cuidar el agua.", key_points: ["Observar y mejorar."] }],
  teacher_recommendations: ["Valorar la explicación del estudiante.", "Aceptar dibujos como evidencia."],
  activity: {
    mode: "ficha_hogar",
    title: "Mi registro",
    instructions: "Lee y resuelve cada actividad con tus propias palabras.",
    items: [1, 2, 3].map((index) => ({
      id: `item-${index}`,
      prompt: `Observa el momento ${index} y registra cómo se utiliza el agua.`,
      answer: `Registro esperado ${index} con observación y explicación.`,
      hint: "Puedes escribir o dibujar.",
      options: ["Cuaderno", "Lápiz"],
      response_type: (["tabla", "dibujo", "operacion"] as const)[index - 1],
    })),
    word_bank: [],
  },
  tables: [],
  model: "gemini-test",
};

describe("HomeworkDocumentPreview", () => {
  it("separates the resolvable student sheet from the teacher answer guide", () => {
    render(<HomeworkDocumentPreview artifact={artifact} values={{ grade: "4°", section: "A" }} />);

    expect(screen.getByRole("heading", { name: /ahora resuelve/i })).toBeInTheDocument();
    expect(screen.getAllByText(/mi respuesta o evidencia/i)).toHaveLength(3);
    expect(screen.getByLabelText(/tabla para completar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/espacio para dibujo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/espacio para procedimiento y operación/i)).toBeInTheDocument();
    expect(screen.queryByText(/Registro esperado 1/)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: /guía docente/i }));

    expect(screen.getByText(/Registro esperado 1/)).toBeInTheDocument();
    expect(screen.getByText(/no se entrega al estudiante/i)).toBeInTheDocument();
  });
});

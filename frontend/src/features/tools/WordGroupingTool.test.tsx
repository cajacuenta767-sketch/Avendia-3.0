import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiRequest } from "../../lib/api";
import { WordGroupingTool, type WordGroupingResult } from "./WordGroupingTool";

vi.mock("../../lib/api", async () => {
  const actual = await vi.importActual<typeof import("../../lib/api")>("../../lib/api");
  return { ...actual, apiRequest: vi.fn() };
});

const generated: WordGroupingResult = {
  activity_title: "Clasificamos los sistemas del cuerpo humano",
  instructions: "Ubica cada órgano en el sistema correspondiente.",
  categories: [
    { id: "category-1", name: "Sistema digestivo", explanation: "Procesa los alimentos." },
    { id: "category-2", name: "Sistema respiratorio", explanation: "Realiza el intercambio de gases." },
  ],
  words: [
    { id: "word-1-1", word: "Estómago", correct_category_id: "category-1" },
    { id: "word-1-2", word: "Intestino", correct_category_id: "category-1" },
    { id: "word-2-1", word: "Pulmones", correct_category_id: "category-2" },
    { id: "word-2-2", word: "Tráquea", correct_category_id: "category-2" },
  ],
  model: "gemini-3.6-flash",
};

describe("WordGroupingTool", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem("avendia.accessToken", "test-token");
    sessionStorage.setItem(
      "avendia.user",
      JSON.stringify({
        id: "teacher-test-id",
        full_name: "María Gómez",
        school_name: "I.E. José María Arguedas",
        education_modality: "EBR",
        education_level: "Primaria",
        grade: "4° de Primaria",
        curricular_area: "Ciencia y Tecnología",
      }),
    );
    vi.mocked(apiRequest).mockReset();
    vi.mocked(apiRequest).mockResolvedValue(generated);
  });

  it("generates, reviews and starts the interactive activity", async () => {
    render(<MemoryRouter><WordGroupingTool /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/Tema o criterio taxonómico/i), {
      target: { value: "Los sistemas del cuerpo humano" },
    });
    fireEvent.change(screen.getByLabelText("Número de categorías"), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Generar con Avend IA/i }));

    await waitFor(() => expect(screen.getByRole("heading", { name: "Revisa la propuesta de la IA" })).toBeInTheDocument());
    expect(apiRequest).toHaveBeenCalledWith(
      "/ai/tools/agrupar-palabras/generate",
      expect.objectContaining({ method: "POST" }),
    );

    fireEvent.click(screen.getByRole("button", { name: /Preparar actividad/i }));
    expect(screen.getByRole("heading", { name: generated.activity_title })).toBeInTheDocument();
    expect(screen.getByText("Estómago")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ubica todas las palabras/i })).toBeDisabled();
  });

  it("shows the fields that are missing instead of disabling the action", async () => {
    sessionStorage.setItem("avendia.user", JSON.stringify({ id: "teacher-empty" }));
    render(<MemoryRouter><WordGroupingTool /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: /Generar con Avend IA/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/faltan completar/i);
    const teacher = screen.getByPlaceholderText(/Prof. María Gómez/i);
    await waitFor(() => expect(teacher).toHaveFocus());
    expect(apiRequest).not.toHaveBeenCalled();
  });
});

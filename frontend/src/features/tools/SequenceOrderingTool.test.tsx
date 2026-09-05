import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiRequest } from "../../lib/api";
import {
  SequenceOrderingTool,
  type SequenceOrderingForm,
  type SequenceOrderingResult,
} from "./SequenceOrderingTool";
import { exportSequenceOrderingDocx } from "./exportSequenceOrderingDocx";

vi.mock("../../lib/api", async () => {
  const actual = await vi.importActual<typeof import("../../lib/api")>("../../lib/api");
  return { ...actual, apiRequest: vi.fn() };
});

const generated: SequenceOrderingResult = {
  activity_title: "Ordenamos el ciclo del agua",
  instructions: "Ubica cada transformación del agua en su orden lógico.",
  pedagogical_rationale:
    "La evaporación permite la condensación; después ocurre la precipitación y el agua se acumula nuevamente.",
  blocks: [
    { id: "block-1", correct_order: 1, text: "El calor solar evapora el agua de mares y ríos.", hint: "El Sol inicia el cambio." },
    { id: "block-2", correct_order: 2, text: "El vapor se enfría y forma gotas en las nubes.", hint: "Ocurre en la atmósfera." },
    { id: "block-3", correct_order: 3, text: "Las gotas caen a la superficie como precipitación.", hint: "Las nubes están cargadas." },
    { id: "block-4", correct_order: 4, text: "El agua se acumula en ríos, lagos y océanos.", hint: "El ciclo puede reiniciarse." },
  ],
  model: "gemini-3.6-flash",
};

describe("SequenceOrderingTool", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem("avendia.accessToken", "test-token");
    sessionStorage.setItem(
      "avendia.user",
      JSON.stringify({
        id: "teacher-sequence-id",
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

  it("generates, reviews and starts the ordering activity", async () => {
    render(<MemoryRouter><SequenceOrderingTool /></MemoryRouter>);

    fireEvent.change(screen.getByLabelText(/Tema o proceso central/i), {
      target: { value: "El ciclo del agua" },
    });
    fireEvent.change(screen.getByLabelText("Cantidad de bloques"), {
      target: { value: "4" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Generar secuencia con Avend IA/i }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Revisa el orden y las pistas" })).toBeInTheDocument(),
    );
    expect(apiRequest).toHaveBeenCalledWith(
      "/ai/tools/ordenar-bloques/generate",
      expect.objectContaining({ method: "POST" }),
    );

    fireEvent.click(screen.getByRole("button", { name: /Preparar reto interactivo/i }));
    expect(screen.getByRole("heading", { name: generated.activity_title })).toBeInTheDocument();
    expect(screen.getByText(generated.blocks[0].text)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Verificar orden" }));
    expect(screen.getByRole("status")).toHaveTextContent(/bloques están en la posición correcta/i);
  });

  it("shows and focuses missing fields before calling the AI", async () => {
    sessionStorage.setItem("avendia.user", JSON.stringify({ id: "sequence-empty" }));
    render(<MemoryRouter><SequenceOrderingTool /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: /Generar secuencia con Avend IA/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/faltan completar/i);
    const teacher = screen.getByPlaceholderText(/Prof. María Gómez/i);
    await waitFor(() => expect(teacher).toHaveFocus());
    expect(apiRequest).not.toHaveBeenCalled();
  });

  it("exports a real DOCX package", async () => {
    let exportedBlob: Blob | null = null;
    const createUrl = vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      exportedBlob = blob as Blob;
      return "blob:sequence-docx";
    });
    const revokeUrl = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const anchorClick = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);
    const form: SequenceOrderingForm = {
      teacherName: "María Gómez",
      institution: "I.E. José María Arguedas",
      modality: "EBR",
      level: "Primaria",
      grade: "4° de Primaria",
      curricularArea: "Ciencia y Tecnología",
      sequenceType: "Proceso científico o natural",
      topic: "El ciclo del agua",
      stepCount: 4,
    };

    await exportSequenceOrderingDocx(form, generated);

    expect(exportedBlob).not.toBeNull();
    const bytes = await new Promise<Uint8Array>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(exportedBlob as Blob);
    });
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe("PK");
    expect(anchorClick).toHaveBeenCalledOnce();
    expect(createUrl).toHaveBeenCalledOnce();
    expect(revokeUrl).toHaveBeenCalledWith("blob:sequence-docx");

    createUrl.mockRestore();
    revokeUrl.mockRestore();
    anchorClick.mockRestore();
  });
});

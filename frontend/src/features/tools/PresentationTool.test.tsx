import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";

import { PresentationTool } from "./PresentationTool";

describe("PresentationTool", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem("avendia.user", JSON.stringify({
      id: "teacher-presentation",
      full_name: "María Gómez",
      school_name: "I.E. José María Arguedas",
      education_modality: "EBR",
    }));
  });

  it("reproduces the dependent curricular filters and pedagogical step", () => {
    render(<MemoryRouter><PresentationTool /></MemoryRouter>);

    expect(screen.getByText("Datos generales y modalidad educativa")).toBeInTheDocument();
    const grade = screen.getByLabelText(/Grado \/ aula/i) as HTMLSelectElement;
    const area = screen.getByLabelText(/Área curricular/i) as HTMLSelectElement;
    expect(grade).toBeDisabled();
    expect(area).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/Nivel educativo/i), { target: { value: "Primaria" } });
    expect(grade).not.toBeDisabled();
    expect(area).not.toBeDisabled();
    expect(screen.getByRole("option", { name: "4° de Primaria" })).toBeInTheDocument();

    fireEvent.change(grade, { target: { value: "4° de Primaria" } });
    fireEvent.change(area, { target: { value: "Comunicación" } });
    fireEvent.change(screen.getByLabelText(/Estilo visual/i), { target: { value: "infografico" } });
    fireEvent.change(screen.getByLabelText(/Tema \/ título de la sesión/i), { target: { value: "Leemos noticias de nuestra comunidad" } });
    fireEvent.click(screen.getByRole("button", { name: /Siguiente paso/i }));

    expect(screen.getByText("Estructura y enfoque pedagógico")).toBeInTheDocument();
    expect(screen.getByText("Se comunica oralmente en su lengua materna")).toBeInTheDocument();
    expect(screen.getByText("Preguntas de reflexión y debate")).toBeInTheDocument();
    expect(screen.getByText("Alto contraste y DUA")).toBeInTheDocument();
  });

  it("explains missing fields and focuses the first one", async () => {
    render(<MemoryRouter><PresentationTool /></MemoryRouter>);

    fireEvent.click(screen.getByRole("button", { name: /Siguiente paso/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/faltan completar/i);
    const level = screen.getByLabelText(/Nivel educativo/i);
    await waitFor(() => expect(level).toHaveFocus());
  });

  it("adapts a text-heavy content slide to the preview without dropping its teaching points", () => {
    localStorage.setItem("avendia.draft.presentaciones-didacticas.v1.teacher-presentation", JSON.stringify({
      version: 1,
      activeStep: 3,
      updatedAt: "2026-09-04T12:00:00.000Z",
      form: {
        teacherName: "María Gómez",
        institution: "I.E. José María Arguedas",
        modality: "EBR",
        level: "Primaria",
        grade: "4° de Primaria",
        curricularArea: "Personal Social",
        slideCount: 3,
        visualStyle: "ilustrado",
        topic: "Alimentos de ayer y de hoy",
        competencies: ["Construye su identidad"],
        didacticPurpose: "Introducción a un nuevo tema / Motivación inicial",
        interactions: ["Preguntas de saberes previos y metacognición"],
      },
      result: {
        presentation_title: "Alimentos de ayer y de hoy",
        learning_objective: "Reconocer alimentos y prácticas de alimentación de la comunidad.",
        model: "test",
        slides: [{
          order: 1,
          type: "contenido",
          title: "Alimentos de ayer: nuestros antepasados y sus prácticas de alimentación",
          subtitle: "Lo que se cultivaba y compartía en el antiguo Perú",
          key_points: [
            "Los incas comían papa, quinua, kiwicha y choclo.",
            "Las familias cuidaban semillas para la siguiente cosecha.",
            "El intercambio ayudaba a conocer alimentos de otras regiones.",
            "Cada alimento tenía relación con el territorio y el clima.",
          ],
          highlighted_quote: "",
          interactive_activity: "Observa imágenes de alimentos nativos y conversa sobre cuáles consumes en casa.",
          speaker_notes: "Guía la conversación con ejemplos cercanos.",
          visual_prompt: "Andean children and native foods",
        }],
      },
    }));

    const { container } = render(<MemoryRouter><PresentationTool /></MemoryRouter>);
    const canvas = container.querySelector(".presentation-editor .presentation-canvas");

    expect(canvas).toHaveClass("presentation-canvas--density-dense");
    expect(canvas).toHaveClass("has-activity");
    expect(canvas?.querySelectorAll("li")).toHaveLength(4);
    expect(canvas?.querySelector(".presentation-canvas__activity small")).toHaveTextContent(/Observa imágenes/i);
  });
});

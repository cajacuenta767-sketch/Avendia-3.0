import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { WorkflowField, WorkflowFieldGuide } from "../../config/workflows";
import { ContextualAIGuideDialog } from "./ContextualAIGuideDialog";

const field: WorkflowField = {
  id: "justification",
  label: "Justificación y necesidades de aprendizaje",
  type: "textarea",
  guide: {},
};

const guide: WorkflowFieldGuide = {
  title: "Personalicemos tu justificación",
  question1: "¿Qué dificultad se ha detectado?",
  placeholder1: "Ej. Comprensión lectora baja.",
  question2: "¿Qué logro se busca?",
  placeholder2: "Ej. Argumentar con evidencias.",
  suggestions: ["Comprensión lectora baja", "Razonamiento lógico", "Trabajo colaborativo", "Hábitos de estudio", "Motivación"],
};

afterEach(cleanup);

describe("ContextualAIGuideDialog", () => {
  it("stays scoped to the field that opened it", () => {
    render(<ContextualAIGuideDialog
      toolTitle="Plan Curricular Anual (PCA)"
      field={field}
      guide={guide}
      hasExistingContent={false}
      answer1=""
      answer2=""
      customDetail=""
      selectedSuggestions={[]}
      reply=""
      loading={false}
      applyMode="replace"
      onAnswer1Change={vi.fn()}
      onAnswer2Change={vi.fn()}
      onCustomDetailChange={vi.fn()}
      onToggleSuggestion={vi.fn()}
      onReplyChange={vi.fn()}
      onApplyModeChange={vi.fn()}
      onGenerate={vi.fn()}
      onApply={vi.fn()}
      onClose={vi.fn()}
    />);

    expect(screen.getByRole("dialog", { name: "Personalicemos tu justificación" })).toBeInTheDocument();
    expect(screen.getByText(field.label)).toBeInTheDocument();
    expect(screen.getByLabelText(guide.question1!)).toHaveAttribute("placeholder", guide.placeholder1);
    expect(screen.queryByText("Campo que deseas preparar")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Datos .* pendientes/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generar para este campo" })).toBeDisabled();
  });

  it("keeps quick suggestions interactive", () => {
    const onToggleSuggestion = vi.fn();
    render(<ContextualAIGuideDialog
      toolTitle="Plan Curricular Anual (PCA)"
      field={field}
      guide={guide}
      hasExistingContent={false}
      answer1=""
      answer2=""
      customDetail=""
      selectedSuggestions={[]}
      reply=""
      loading={false}
      applyMode="replace"
      onAnswer1Change={vi.fn()}
      onAnswer2Change={vi.fn()}
      onCustomDetailChange={vi.fn()}
      onToggleSuggestion={onToggleSuggestion}
      onReplyChange={vi.fn()}
      onApplyModeChange={vi.fn()}
      onGenerate={vi.fn()}
      onApply={vi.fn()}
      onClose={vi.fn()}
    />);

    fireEvent.click(screen.getByRole("button", { name: "Comprensión lectora baja" }));
    expect(onToggleSuggestion).toHaveBeenCalledWith("Comprensión lectora baja");
  });
});

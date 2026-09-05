import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GenerationProgressOverlay } from "./GenerationProgressOverlay";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("GenerationProgressOverlay", () => {
  it("shows contextual stages and advances without inventing completion", () => {
    vi.useFakeTimers();
    render(<GenerationProgressOverlay open toolTitle="Plan Curricular Anual" family="planificamos" />);

    expect(screen.getByRole("status", { name: "Generando Plan Curricular Anual" })).toBeInTheDocument();
    expect(screen.getByText("Organizando el propósito y el contexto").closest("li")).toHaveClass("is-active");

    act(() => vi.advanceTimersByTime(1800));
    expect(screen.getByText("Relacionando competencias, actividades y evidencias").closest("li")).toHaveClass("is-active");
    expect(screen.getByText("Organizando el propósito y el contexto").closest("li")).toHaveClass("is-complete");
  });

  it("does not render when no generation is active", () => {
    render(<GenerationProgressOverlay open={false} toolTitle="Ficha" family="evaluamos" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

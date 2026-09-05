import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EMPTY_SOURCE_DOCUMENT, type EvaluationSourceDocument, type SourceDocumentValue } from "./evaluationContracts";
import { SourceDocumentInput } from "./SourceDocumentInput";
import { validateSourceDocumentFile } from "./sourceDocumentValidation";

function sourceResponse(file: File): EvaluationSourceDocument {
  return {
    id: "source-1",
    filename: file.name,
    media_type: file.type,
    extension: ".pdf",
    byte_size: file.size,
    sha256: "abc",
    extracted_text: "Texto extraído editable",
    extraction_status: "completed",
    created_at: "2026-09-01T12:00:00Z",
    instrument_revision: 1,
  };
}

describe("SourceDocumentInput", () => {
  it("rechaza archivos vacíos, DOC antiguo y tipos ajenos con mensajes accionables", () => {
    expect(validateSourceDocumentFile(new File([], "vacio.pdf", { type: "application/pdf" }))).toContain("vacío");
    expect(validateSourceDocumentFile(new File(["x"], "antiguo.doc", { type: "application/msword" }))).toContain("guárdalo como DOCX");
    expect(validateSourceDocumentFile(new File(["x"], "imagen.png", { type: "image/png" }))).toContain("Formato no permitido");
    expect(validateSourceDocumentFile(new File(["x"], "falso.pdf", { type: "image/png" }))).toContain("no coincide");
  });

  it("extrae un PDF, conserva el texto pegado y deja editar la vista previa", async () => {
    const ensureInstrument = vi.fn().mockResolvedValue("instrument-1");
    const uploadSource = vi.fn(async (_id: string, file: File) => sourceResponse(file));
    const changes: SourceDocumentValue[] = [];

    function Harness() {
      const current = changes.at(-1) ?? { ...EMPTY_SOURCE_DOCUMENT, pasted_text: "Texto pegado" };
      return <SourceDocumentInput
        value={current}
        onChange={(value) => { changes.push(value); rerender(<Harness />); }}
        ensureInstrument={ensureInstrument}
        uploadSource={uploadSource}
        showTextSize
      />;
    }

    const { container, rerender } = render(<Harness />);
    const file = new File(["contenido"], "lectura.pdf", { type: "application/pdf" });
    fireEvent.change(container.querySelector("input[type='file']") as HTMLInputElement, { target: { files: [file] } });

    await waitFor(() => expect(uploadSource).toHaveBeenCalledWith("instrument-1", file));
    expect(screen.getByDisplayValue("Texto extraído editable")).toBeInTheDocument();
    expect(changes.at(-1)?.pasted_text).toBe("Texto pegado");
    fireEvent.change(screen.getByLabelText("Vista previa editable de lectura.pdf"), { target: { value: "Texto corregido" } });
    expect(changes.at(-1)?.sources[0]?.edited_text).toBe("Texto corregido");
    expect(screen.getAllByRole("combobox")).toHaveLength(2);
  });

  it("no intenta subir un formato inválido", async () => {
    const uploadSource = vi.fn();
    const { container } = render(<SourceDocumentInput value={{ ...EMPTY_SOURCE_DOCUMENT }} onChange={vi.fn()} instrumentId="instrument-1" uploadSource={uploadSource} />);
    fireEvent.change(container.querySelector("input[type='file']") as HTMLInputElement, { target: { files: [new File(["x"], "datos.csv", { type: "text/csv" })] } });
    expect(await screen.findByRole("alert")).toHaveTextContent("Formato no permitido");
    expect(uploadSource).not.toHaveBeenCalled();
  });
});

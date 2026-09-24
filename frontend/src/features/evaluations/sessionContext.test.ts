import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ apiRequest: vi.fn() }));

vi.mock("../../lib/api", () => ({ apiRequest: (...args: unknown[]) => mocks.apiRequest(...args) }));

import { readSessionContext } from "./sessionContext";

const documento = {
  id: "doc-1",
  title: "Sesión: argumentos en textos",
  metadata_json: {
    fields: {
      teacher_name: "Prof. Manuel Cárdenas",
      director_name: "No registrado",
      institution: "I.E. 0001",
      modality: "EBA — Educación Básica Alternativa",
      level: "Secundaria",
      grade: "3° de Secundaria",
      sections: ["A", "B"],
      curricular_area: "Comunicación",
      session_topic: "Argumentos en textos expositivos",
    },
  },
};

describe("readSessionContext", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mocks.apiRequest.mockReset();
    mocks.apiRequest.mockResolvedValue([documento]);
  });

  it("normaliza los datos del documento de origen", async () => {
    sessionStorage.setItem("avendia.accessToken", "token");

    const context = await readSessionContext("doc-1", "lista-cotejo");

    expect(context).not.toBeNull();
    expect(context?.teacherName).toBe("Prof. Manuel Cárdenas");
    expect(context?.directorName).toBe("");
    expect(context?.modality).toBe("EBA");
    expect(context?.section).toBe("A, B");
    expect(context?.topic).toBe("Argumentos en textos expositivos");
  });

  it("devuelve null cuando el documento ya no está", async () => {
    sessionStorage.setItem("avendia.accessToken", "token");
    mocks.apiRequest.mockResolvedValue([]);

    expect(await readSessionContext("doc-1", "lista-cotejo")).toBeNull();
  });

  it("no consulta al servidor sin sesión activa", async () => {
    expect(await readSessionContext("doc-1", "lista-cotejo")).toBeNull();
    expect(mocks.apiRequest).not.toHaveBeenCalled();
  });
});

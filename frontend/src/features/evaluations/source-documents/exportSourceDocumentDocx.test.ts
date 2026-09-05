import * as fs from "node:fs";
import * as path from "node:path";

import { Packer } from "docx";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";

import type { WorkflowArtifact } from "../../tools/exportWorkflowDocx";
import { buildSourceDocumentDocx } from "./exportSourceDocumentDocx";

const artifact: WorkflowArtifact = {
  document_title: "Comprendemos el ciclo del agua",
  executive_summary: "Lee la fuente y responde usando evidencias verificables.",
  sections: [
    { title: "Lectura o síntesis", narrative: "El agua cambia de estado por efecto del calor.", key_points: [] },
    { title: "Preguntas literales", narrative: "Ubica información explícita.", key_points: ["[Opción múltiple] ¿Qué elemento cambia de estado? | A) El agua | B) La roca | C) El suelo | D) El aire", "[Texto breve] ¿Qué causa el cambio?"] },
    { title: "Preguntas inferenciales", narrative: "Relaciona causas y efectos.", key_points: ["[Resolución matemática] ¿Qué ocurriría sin calor?"] },
    { title: "Preguntas crítico-reflexivas", narrative: "Sustenta tu opinión.", key_points: ["[Tabla] ¿Por qué debemos cuidar el agua?"] },
    { title: "Respuestas esperadas", narrative: "Clave de corrección.", key_points: ["El agua", "El calor", "No cambiaría de estado", "Respuesta argumentada"] },
    { title: "Justificación de respuestas", narrative: "La fuente menciona el calor como causa.", key_points: ["Contrastar cada respuesta con el texto"] },
    { title: "Criterios", narrative: "Usa información y argumenta.", key_points: ["Respuesta basada en evidencia"] },
    { title: "Retroalimentación", narrative: "Releer la oración que explica la causa.", key_points: ["Explicar el siguiente paso"] },
  ],
  teacher_recommendations: ["Aceptar una explicación oral cuando el estudiante requiera apoyo DUA."],
  tables: [],
  activity: null,
  model: "gemini-test",
  quality_status: "ready",
};

describe("buildSourceDocumentDocx", () => {
  it("separa la ficha del estudiante y la guía docente sin filtrar respuestas", async () => {
    const document = await buildSourceDocumentDocx(
      artifact,
      "El agua se evapora cuando recibe calor y luego se condensa.",
      "medium",
      "medium",
    );
    const buffer = await Packer.toBuffer(document);
    const archive = await JSZip.loadAsync(buffer);
    const xml = await archive.file("word/document.xml")!.async("string");
    const teacherGuideIndex = xml.indexOf("GUÍA DOCENTE");

    expect(teacherGuideIndex).toBeGreaterThan(0);
    expect(xml.slice(0, teacherGuideIndex)).toContain("¿Qué elemento cambia de estado?");
    expect(xml.slice(0, teacherGuideIndex)).toContain("Respuesta / desarrollo:");
    expect(xml.slice(0, teacherGuideIndex)).toContain("Dato 1");
    expect(xml.slice(0, teacherGuideIndex)).toContain("Procedimiento, operación y comprobación:");
    expect(xml.slice(0, teacherGuideIndex)).not.toContain("[Opción múltiple]");
    expect(xml.slice(0, teacherGuideIndex)).not.toContain("No cambiaría de estado");
    expect(xml.slice(teacherGuideIndex)).toContain("No cambiaría de estado");
    expect(xml).toContain("w:pageBreakBefore");

    const targetDirectory = path.resolve("..", "exports-qa-word");
    fs.mkdirSync(targetDirectory, { recursive: true });
    fs.writeFileSync(path.join(targetDirectory, "28-preguntas-texto-semantica.docx"), buffer);
  });
});

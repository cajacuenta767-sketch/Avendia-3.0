import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildInstrumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 25-evaluamos-lista-cotejo", () => {
  it("generates 25-evaluamos-lista-cotejo.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Lista de Cotejo Formativa: Exposición Oral y Debate sobre Conservación de Cuencas Hidrográficas",
      executive_summary:
        "Instrumento de evaluación formativa diseñado para 3° de Secundaria, orientado a verificar desempeños observables de la competencia 'Se comunica oralmente en su lengua materna' durante la sustentación de propuestas de cuidado del agua y preservación ecológica.",
      sections: [
        {
          title: "Desempeños y Rasgos Observables de la Competencia Oral",
          narrative:
            "Indicadores directos de logro para la observación sistemática individual y grupal:",
          key_points: [
            "Presenta una postura clara, delimitada y fundamentada sobre la problemática de la cuenca hídrica local.",
            "Sustenta sus afirmaciones empleando al menos dos fuentes técnicas o normativas verificables (ANA, MINAM).",
            "Utiliza recursos no verbales (contacto visual, postura erguida) y paraverbales (entonación y volumen adecuados).",
            "Responde con asertividad y argumentos consistentes a las repreguntas planteadas por sus compañeros.",
            "Mantiene un registro lingüístico formal y vocabulario disciplinar preciso durante toda la intervención.",
          ],
        },
      ],
      teacher_recommendations: [
        "Socializar previamente los 5 desempeños observables con los estudiantes para orientar su preparación expositiva.",
        "Registrar anotaciones cualitativas breves en la columna de observaciones para orientar la devolución formativa.",
        "Realizar una breve asamblea de retroalimentación colectiva al término de las exposiciones destacando avances comunes.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildInstrumentDocx(artifact, {
      workflowKey: "evaluamos/lista-cotejo",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "3° de Secundaria",
      section: "A",
      course: "Comunicación / Oralidad CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "25-evaluamos-lista-cotejo.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import { buildActivityDocx, type WorkflowArtifact } from "./exportWorkflowDocx";

describe("QA Generator: 09-recursos-debate-aula", () => {
  it("generates 09-recursos-debate-aula.docx and saves to exports-qa-word directory", async () => {
    const artifact: WorkflowArtifact = {
      document_title: "¿Se debe regular el uso de teléfonos celulares en las aulas de secundaria?",
      executive_summary: "Guía estructurada de debate escolar para 3° de Secundaria en el área de DPCC bajo el CNEB, fomentando la argumentación ética, ciudadana y la competencia digital.",
      sections: [
        {
          title: "Moción y Marco de Convivencia",
          narrative: "Esta dinámica propone un debate estructurado por roles para evaluar las dimensiones de concentración, convivencia y autonomía digital en la escuela.",
          key_points: [
            "Moción: El uso de dispositivos móviles debe estar estrictamente regulado a actividades pedagógicas planificadas.",
            "Formato: Debate por equipos con portavoces, preguntas cruzadas y jurado escolar.",
            "Acuerdos: Respeto mutuo, sustento con evidencias y escucha empática.",
          ],
        },
      ],
      teacher_recommendations: [
        "Establecer con claridad las reglas del cronómetro antes de iniciar la primera ronda.",
        "Monitorear que las preguntas cruzadas se dirijan a los argumentos y nunca a las personas.",
        "Aplicar la rúbrica formativa al cierre para brindar retroalimentación colectiva.",
      ],
      activity: {
        mode: "debate",
        title: "Debate Escolar: Teléfonos Celulares y Convivencia en el Aula",
        instructions: "Sigue las 4 fases de debate, consulta la matriz de posturas contrapuestas y completa la ficha de evaluación del jurado.",
        items: [],
      },
      model: "gemini-3.6-flash",
    };

    const options = {
      workflowKey: "recursos/debate-aula",
      values: {
        level: "Secundaria",
        grade: "3°",
        section: "A",
        area: "Desarrollo Personal, Ciudadanía y Cívica",
        ie: "I.E. 0001 República del Perú",
        teacher: "Prof. Manuel Cárdenas Vega",
        year: 2026,
      },
    };

    const doc = buildActivityDocx(artifact, options);
    const buffer = await Packer.toBuffer(doc);

    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "09-recursos-debate-aula.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

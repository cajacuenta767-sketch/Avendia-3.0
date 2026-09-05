import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import { buildActivityDocx, type WorkflowArtifact } from "./exportWorkflowDocx";

describe("QA Generator: 02-recursos-completa-frase", () => {
  it("generates 02-recursos-completa-frase.docx and saves to exports-qa-word directory", async () => {
    const artifact: WorkflowArtifact = {
      document_title: "Ficha de Aplicación: Completa la Frase sobre las Plantas",
      executive_summary: "Actividad formativa para identificar las partes de la planta y sus funciones vitales en 2° de Primaria.",
      sections: [
        {
          title: "Instrucciones",
          narrative: "Lee con atención y completa los enunciados utilizando las palabras clave del banco.",
          key_points: ["Raíz", "Tallo", "Hojas", "Flor", "Fruto", "Semillas", "Clorofila", "Fotosíntesis"],
        },
      ],
      teacher_recommendations: [
        "Llevar una planta pequeña al aula para que los estudiantes observen sus partes reales.",
        "Reforzar el vocabulario científico con apoyo de láminas ilustradas.",
        "Revisar el solucionario desglosable en plenaria para consolidar los aprendizajes.",
      ],
      activity: {
        mode: "completa",
        title: "Completa la Frase: Las Partes de la Planta",
        instructions: "Lee con atención cada enunciado. Elige la palabra correcta del Banco de Palabras y escríbela sobre la línea punteada.",
        items: [
          {
            id: "1",
            prompt: "La raíz absorbe el agua y las sales minerales del suelo para nutrir a la planta.",
            answer: "RAÍZ",
            hint: "Fija la planta a la tierra y absorbe los nutrientes vitales.",
            options: [],
          },
          {
            id: "2",
            prompt: "El tallo sostiene las hojas, flores y frutos, y transporta la savia por toda la planta.",
            answer: "TALLO",
            hint: "Es el eje principal de soporte que crece hacia la luz del sol.",
            options: [],
          },
          {
            id: "3",
            prompt: "En las hojas se realiza la respiración y la fotosíntesis gracias a la luz solar.",
            answer: "HOJAS",
            hint: "Son las estructuras verdes donde la planta fabrica su propio alimento.",
            options: [],
          },
          {
            id: "4",
            prompt: "La flor es el órgano reproductor de la planta que luego se transformará en fruto.",
            answer: "FLOR",
            hint: "Posee pétalos de vivos colores y produce el polen necesario.",
            options: [],
          },
          {
            id: "5",
            prompt: "El fruto contiene y protege a las semillas hasta que alcanzan su madurez.",
            answer: "FRUTO",
            hint: "Se origina a partir de la flor fecundada y sirve de alimento.",
            options: [],
          },
          {
            id: "6",
            prompt: "Las semillas dan origen a una nueva plantita cuando caen en tierra fértil y húmeda.",
            answer: "SEMILLAS",
            hint: "Contienen el embrión vegetal que germina bajo condiciones adecuadas.",
            options: [],
          },
          {
            id: "7",
            prompt: "El pigmento verde que atrapa la energía de la luz solar se denomina clorofila.",
            answer: "CLOROFILA",
            hint: "Es la sustancia responsable del color verde característico de los vegetales.",
            options: [],
          },
          {
            id: "8",
            prompt: "El proceso biológico mediante el cual la planta elabora su propio alimento es la fotosíntesis.",
            answer: "FOTOSÍNTESIS",
            hint: "Requiere agua, dióxido de carbono, clorofila y radiación solar.",
            options: [],
          },
        ],
        word_bank: ["RAÍZ", "TALLO", "HOJAS", "FLOR", "FRUTO", "SEMILLAS", "CLOROFILA", "FOTOSÍNTESIS"],
      },
      model: "gemini-3.6-flash",
    };

    const options = {
      workflowKey: "recursos/completa-frase",
      values: {
        level: "Primaria",
        grade: "2°",
        section: "B",
        area: "Ciencia y Tecnología",
        ie: "I.E. 0001 República del Perú",
        teacher: "Prof. Carlos Sánchez Vega",
        year: 2026,
      },
    };

    const doc = buildActivityDocx(artifact, options);
    const buffer = await Packer.toBuffer(doc);

    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "02-recursos-completa-frase.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

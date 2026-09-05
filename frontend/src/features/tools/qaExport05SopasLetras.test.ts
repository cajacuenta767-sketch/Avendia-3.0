import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import { buildActivityDocx, type WorkflowArtifact } from "./exportWorkflowDocx";

describe("QA Generator: 05-recursos-sopas-letras", () => {
  it("generates 05-recursos-sopas-letras.docx and saves to exports-qa-word directory", async () => {
    const artifact: WorkflowArtifact = {
      document_title: "Sopa de Letras: El Sistema Solar y los Planetas",
      executive_summary: "Actividad de afianzamiento astronómico y vocabulario científico para 5° de Primaria.",
      sections: [
        {
          title: "Instrucciones",
          narrative: "Localiza los ocho planetas que orbitan alrededor del Sol en la cuadrícula de búsqueda.",
          key_points: [
            "Mercurio",
            "Venus",
            "Tierra",
            "Marte",
            "Júpiter",
            "Saturno",
            "Urano",
            "Neptuno",
          ],
        },
      ],
      teacher_recommendations: [
        "Presentar una infografía del orden de los planetas respecto al Sol.",
        "Monitorear la identificación de planetas rocosos versus gigantes gaseosos.",
        "Usar la tabla de ubicación para la verificación colectiva.",
      ],
      activity: {
        mode: "sopa",
        title: "Sopa de Letras: Planetas del Sistema Solar",
        instructions: "Encuentra los ocho planetas en la cuadrícula y escribe una característica en las líneas de aplicación.",
        grid: [
          ["M", "E", "R", "C", "U", "R", "I", "O", "X", "L", "A", "P"],
          ["Z", "K", "V", "E", "N", "U", "S", "W", "Q", "E", "D", "T"],
          ["T", "I", "E", "R", "R", "A", "B", "C", "O", "R", "T", "Y"],
          ["L", "O", "P", "R", "M", "A", "R", "T", "E", "S", "H", "U"],
          ["B", "J", "U", "P", "I", "T", "E", "R", "K", "L", "M", "N"],
          ["S", "A", "T", "U", "R", "N", "O", "F", "V", "B", "N", "Q"],
          ["A", "C", "D", "U", "R", "A", "N", "O", "P", "R", "T", "Z"],
          ["W", "N", "E", "P", "T", "U", "N", "O", "X", "Y", "Z", "A"],
          ["S", "O", "L", "A", "R", "B", "I", "T", "A", "S", "D", "F"],
          ["G", "A", "L", "A", "X", "I", "A", "S", "P", "L", "A", "N"],
          ["C", "O", "M", "E", "T", "A", "S", "T", "R", "O", "E", "S"],
          ["E", "S", "T", "R", "E", "L", "L", "A", "F", "U", "E", "G"],
        ],
        word_bank: [
          "MERCURIO",
          "VENUS",
          "TIERRA",
          "MARTE",
          "JUPITER",
          "SATURNO",
          "URANO",
          "NEPTUNO",
        ],
        items: [
          { id: "1", prompt: "Planeta más cercano al Sol y el más pequeño del sistema solar.", answer: "MERCURIO", hint: "Fila 1, Horizontal" },
          { id: "2", prompt: "Planeta más caliente cubierto por densas nubes de ácido sulfúrico.", answer: "VENUS", hint: "Fila 2, Horizontal" },
          { id: "3", prompt: "Nuestro planeta, el único conocido con agua líquida y vida.", answer: "TIERRA", hint: "Fila 3, Horizontal" },
          { id: "4", prompt: "Planeta rojo debido al óxido de hierro en su suelo.", answer: "MARTE", hint: "Fila 4, Horizontal" },
          { id: "5", prompt: "El planeta más grande del sistema solar, famoso por su Gran Mancha Roja.", answer: "JUPITER", hint: "Fila 5, Horizontal" },
          { id: "6", prompt: "Famoso por su espectacular sistema de anillos brillantes de hielo y roca.", answer: "SATURNO", hint: "Fila 6, Horizontal" },
          { id: "7", prompt: "Gigante helado que gira inclinado de lado.", answer: "URANO", hint: "Fila 7, Horizontal" },
          { id: "8", prompt: "Planeta más alejado del Sol con vientos supersónicos.", answer: "NEPTUNO", hint: "Fila 8, Horizontal" },
        ],
      },
      model: "gemini-3.6-flash",
    };

    const options = {
      workflowKey: "recursos/sopas-letras",
      values: {
        level: "Primaria",
        grade: "5°",
        section: "A",
        area: "Ciencia y Tecnología",
        ie: "I.E. 0001 República del Perú",
        teacher: "Prof. Elena Morales Farfán",
        year: 2026,
      },
    };

    const doc = buildActivityDocx(artifact, options);
    const buffer = await Packer.toBuffer(doc);

    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "05-recursos-sopas-letras.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

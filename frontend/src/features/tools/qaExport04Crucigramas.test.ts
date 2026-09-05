import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import { buildActivityDocx, type WorkflowArtifact } from "./exportWorkflowDocx";

describe("QA Generator: 04-recursos-crucigramas", () => {
  it("generates 04-recursos-crucigramas.docx and saves to exports-qa-word directory", async () => {
    const artifact: WorkflowArtifact = {
      document_title: "Crucigrama Educativo: Las Regiones Naturales del Perú",
      executive_summary: "Actividad lúdico-pedagógica de afianzamiento geográfico para 4° de Primaria.",
      sections: [
        {
          title: "Instrucciones",
          narrative: "Completa el crucigrama identificando las características geográficas y culturales del Perú.",
          key_points: [
            "Costa o Chala",
            "Mar de Grau",
            "Cordillera de los Andes",
            "Cusco Histórico",
            "Selva Amazónica",
            "Río Amazonas",
            "Lago Titicaca",
            "Cañón del Colca",
          ],
        },
      ],
      teacher_recommendations: [
        "Proyectar un mapa físico del Perú para orientar a los estudiantes.",
        "Monitorear la resolución de pistas verticales antes de las horizontales.",
        "Utilizar el solucionario final para la coevaluación en parejas.",
      ],
      activity: {
        mode: "crucigrama",
        title: "Crucigrama Geográfico del Perú",
        instructions: "Lee atentamente cada pista horizontal y vertical. Escribe las letras correspondientes en la cuadrícula.",
        items: [
          {
            id: "1",
            prompt: "Región costeña cálida y árida junto al océano Pacífico.",
            answer: "COSTA",
            hint: "Comprende valles fértiles y extensos desiertos.",
            options: [],
          },
          {
            id: "2",
            prompt: "Mar territorial peruano muy rico en biomasa y recursos ictiológicos.",
            answer: "GRAU",
            hint: "Lleva el nombre del Gran Almirante Miguel Grau.",
            options: [],
          },
          {
            id: "3",
            prompt: "Gran cordillera montañosa de altitud que divide el territorio peruano.",
            answer: "ANDES",
            hint: "Presenta picos nevados, volcanes y altiplanos.",
            options: [],
          },
          {
            id: "4",
            prompt: "Ciudad imperial histórica y capital del Tahuantinsuyo en la sierra sur.",
            answer: "CUSCO",
            hint: "Famosa por Sacsayhuamán y su arquitectura inca.",
            options: [],
          },
          {
            id: "5",
            prompt: "Región de bosque tropical denso con la mayor biodiversidad del país.",
            answer: "SELVA",
            hint: "Abarca la selva alta o rupa rupa y la selva baja u omagua.",
            options: [],
          },
          {
            id: "6",
            prompt: "El río más largo y caudaloso del mundo que nace en las cumbres del Perú.",
            answer: "AMAZONAS",
            hint: "Se forma de la confluencia del Marañón y Ucayali.",
            options: [],
          },
          {
            id: "7",
            prompt: "El lago navegable más alto del mundo compartido con Bolivia.",
            answer: "TITICACA",
            hint: "Ubicado a más de 3800 m s. n. m. en Puno.",
            options: [],
          },
          {
            id: "8",
            prompt: "Impresionante cañón profundo y hábitat del majestuoso cóndor en Arequipa.",
            answer: "COLCA",
            hint: "Destino turístico emblemático del sur andino.",
            options: [],
          },
        ],
      },
      model: "gemini-3.6-flash",
    };

    const options = {
      workflowKey: "recursos/crucigramas",
      values: {
        level: "Primaria",
        grade: "4°",
        section: "A",
        area: "Personal Social",
        ie: "I.E. 0001 República del Perú",
        teacher: "Prof. Alberto Mendoza Rojas",
        year: 2026,
      },
    };

    const doc = buildActivityDocx(artifact, options);
    const buffer = await Packer.toBuffer(doc);

    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "04-recursos-crucigramas.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

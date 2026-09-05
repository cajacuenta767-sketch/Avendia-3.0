import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import { buildActivityDocx, type WorkflowArtifact } from "./exportWorkflowDocx";

describe("QA Generator: 07-recursos-agrupar-palabras", () => {
  it("generates 07-recursos-agrupar-palabras.docx and saves to exports-qa-word directory", async () => {
    const artifact: WorkflowArtifact = {
      document_title: "Ficha de Aplicación: Agrupar y Categorizar Seres Vivos",
      executive_summary: "Actividad formativa de clasificación taxonómica según tipo de alimentación para 3° de Primaria.",
      sections: [
        {
          title: "Herbívoros (Se alimentan de plantas)",
          narrative: "Animales que comen pastos, hojas, frutos y cortezas.",
          key_points: ["Vaca", "Conejo", "Oveja", "Caballo"],
        },
        {
          title: "Carnívoros (Se alimentan de carne)",
          narrative: "Animales depredadores que cazan para alimentarse.",
          key_points: ["León", "Tigre", "Águila", "Tiburón"],
        },
        {
          title: "Omnívoros (Se alimentan de plantas y carne)",
          narrative: "Animales con dieta variada de origen vegetal y animal.",
          key_points: ["Cerdo", "Oso", "Chimpancé", "Gallina"],
        },
      ],
      teacher_recommendations: [
        "Presentar imágenes de los animales antes de iniciar la clasificación individual.",
        "Discutir cómo la dentadura de cada grupo se adapta a su tipo de alimento.",
        "Revisar en plenaria con el solucionario docente.",
      ],
      activity: {
        mode: "agrupar",
        title: "Clasificación de Animales según su Alimentación",
        instructions: "Observa el banco de términos y clasifica cada animal en la columna correcta.",
        word_bank: [
          "VACA",
          "LEÓN",
          "CERDO",
          "CONEJO",
          "TIGRE",
          "OSO",
          "OVEJA",
          "ÁGUILA",
          "CHIMPANCÉ",
          "CABALLO",
          "TIBURÓN",
          "GALLINA",
        ],
        items: [
          { id: "1", prompt: "VACA", answer: "HERBÍVORO", hint: "Come pasto y forraje.", options: [] },
          { id: "2", prompt: "LEÓN", answer: "CARNÍVORO", hint: "Caza presas en la sabana.", options: [] },
          { id: "3", prompt: "CERDO", answer: "OMNÍVORO", hint: "Come vegetales, restos y granos.", options: [] },
          { id: "4", prompt: "CONEJO", answer: "HERBÍVORO", hint: "Se alimenta de hierbas y zanahorias.", options: [] },
          { id: "5", prompt: "TIGRE", answer: "CARNÍVORO", hint: "Gran felino cazador.", options: [] },
          { id: "6", prompt: "OSO", answer: "OMNÍVORO", hint: "Come peces, frutos silvestres y raíces.", options: [] },
          { id: "7", prompt: "OVEJA", answer: "HERBÍVORO", hint: "Pastorea en campos y praderas.", options: [] },
          { id: "8", prompt: "ÁGUILA", answer: "CARNÍVORO", hint: "Ave rapaz carnívora.", options: [] },
          { id: "9", prompt: "CHIMPANCÉ", answer: "OMNÍVORO", hint: "Come frutas, hojas e insectos.", options: [] },
          { id: "10", prompt: "CABALLO", answer: "HERBÍVORO", hint: "Herbívoro de pradera.", options: [] },
          { id: "11", prompt: "TIBURÓN", answer: "CARNÍVORO", hint: "Depredador acuático.", options: [] },
          { id: "12", prompt: "GALLINA", answer: "OMNÍVORO", hint: "Come maíz, gusanos e insectos.", options: [] },
        ],
      },
      model: "gemini-3.6-flash",
    };

    const options = {
      workflowKey: "recursos/agrupar-palabras",
      values: {
        level: "Primaria",
        grade: "3°",
        section: "B",
        area: "Ciencia y Tecnología",
        ie: "I.E. 0001 República del Perú",
        teacher: "Prof. Sonia Huamán Ríos",
        year: 2026,
      },
    };

    const doc = buildActivityDocx(artifact, options);
    const buffer = await Packer.toBuffer(doc);

    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "07-recursos-agrupar-palabras.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

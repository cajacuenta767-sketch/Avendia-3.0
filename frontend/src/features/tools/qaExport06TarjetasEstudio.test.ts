import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import { buildActivityDocx, type WorkflowArtifact } from "./exportWorkflowDocx";

describe("QA Generator: 06-recursos-tarjetas-estudio", () => {
  it("generates 06-recursos-tarjetas-estudio.docx and saves to exports-qa-word directory", async () => {
    const artifact: WorkflowArtifact = {
      document_title: "Tarjetas de Estudio: Figuras Literarias en la Poesía",
      executive_summary: "Material didáctico manipulable y recortable de afianzamiento poético para 1° de Secundaria.",
      sections: [
        {
          title: "Instrucciones",
          narrative: "Recorta las tarjetas por la línea discontinua y utilízalas para estudiar conceptos y ejemplos de figuras retóricas.",
          key_points: [
            "Metáfora",
            "Símil",
            "Hipérbole",
            "Personificación",
            "Anáfora",
            "Epíteto",
          ],
        },
      ],
      teacher_recommendations: [
        "Sugerir pegar las tarjetas sobre cartulina para mayor durabilidad en el rincón de lectura.",
        "Organizar rondas de adivinanzas poéticas en equipos de cuatro estudiantes.",
        "Verificar la correcta identificación de figuras mediante la tabla solucionario.",
      ],
      activity: {
        mode: "tarjetas",
        title: "Tarjetas de Estudio: Figuras Retóricas",
        instructions: "Recorta cada tarjeta por la línea punteada (✂). Lee el concepto al frente y comprueba con el reverso.",
        items: [
          {
            id: "1",
            prompt: "METÁFORA",
            answer: "Identificación de un término real con uno imaginario por relación de semejanza.",
            hint: "Ejemplo clásico: 'Las perlas de tu boca' (refiriéndose a los dientes blancos).",
            options: [],
          },
          {
            id: "2",
            prompt: "SÍMIL O COMPARACIÓN",
            answer: "Comparación explícita entre dos términos empleando nexos como 'como', 'cual' o 'parece'.",
            hint: "Ejemplo: 'Tus ojos brillan como dos luceros en la noche oscura'.",
            options: [],
          },
          {
            id: "3",
            prompt: "HIPÉRBOLE",
            answer: "Exageración intencionada de la realidad para aumentar la expresividad emotiva.",
            hint: "Ejemplo poético: 'Lloró ríos de lágrimas al despedirse de su patria'.",
            options: [],
          },
          {
            id: "4",
            prompt: "PERSONIFICACIÓN",
            answer: "Atribución de características y emociones humanas a seres inanimados o animales.",
            hint: "Ejemplo: 'El viejo sauce lloraba en silencio junto a la ribera del río'.",
            options: [],
          },
          {
            id: "5",
            prompt: "ANÁFORA",
            answer: "Repetición voluntaria de una palabra al comienzo de versos u oraciones sucesivas.",
            hint: "Ejemplo: 'Por ti la luna llena, por ti el cielo estrellado, por ti mi canto...'.",
            options: [],
          },
          {
            id: "6",
            prompt: "EPÍTETO",
            answer: "Adjetivo explicativo que destaca una cualidad intrínseca y propia del sustantivo.",
            hint: "Ejemplo: 'La blanca nieve cubría los silenciosos campos en invierno'.",
            options: [],
          },
        ],
      },
      model: "gemini-3.6-flash",
    };

    const options = {
      workflowKey: "recursos/tarjetas-estudio",
      values: {
        level: "Secundaria",
        grade: "1°",
        section: "B",
        area: "Comunicación",
        ie: "I.E. 0001 República del Perú",
        teacher: "Prof. Lucía Carranza Poma",
        year: 2026,
      },
    };

    const doc = buildActivityDocx(artifact, options);
    const buffer = await Packer.toBuffer(doc);

    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "06-recursos-tarjetas-estudio.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

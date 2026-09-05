import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import { buildActivityDocx, type WorkflowArtifact } from "./exportWorkflowDocx";

describe("QA Generator: 01-recursos-ahorcado", () => {
  it("generates 01-recursos-ahorcado.docx and saves to exports-qa-word directory", async () => {
    const artifact: WorkflowArtifact = {
      document_title: "Juego del Ahorcado: Emociones Básicas y Convivencia",
      executive_summary: "Ficha de adivinanzas y retos léxicos para identificar emociones básicas y promover el buen trato en el aula de 1° de Primaria.",
      sections: [
        {
          title: "Instrucciones",
          narrative: "Descubre las palabras secretas leyendo cada pista. Completa las casillas cuadradas y cuida tus 4 vidas.",
          key_points: ["Alegría", "Calma", "Tristeza", "Miedo", "Enojo", "Empatía", "Respeto", "Abrazo", "Amistad", "Gratitud"],
        },
      ],
      teacher_recommendations: [
        "Presentar las emociones con títeres o láminas visuales antes de la actividad.",
        "Acompañar a los estudiantes en el reconocimiento de las letras del abecedario.",
        "Brindar retroalimentación inmediata utilizando el solucionario desglosable.",
      ],
      activity: {
        mode: "ahorcado",
        title: "Adivina la Emoción Secreta",
        instructions: "Lee la pista, completa las casillas con letras y tacha en el abecedario. ¡Tienes 4 vidas por reto!",
        items: [
          {
            id: "1",
            prompt: "Emoción bonita que sentimos cuando jugamos o nos dan una linda noticia",
            answer: "ALEGRIA",
            hint: "Nos hace sonreír y compartir con los demás.",
            options: [],
          },
          {
            id: "2",
            prompt: "Sensación de paz y tranquilidad cuando respiramos hondo",
            answer: "CALMA",
            hint: "Nos ayuda a pensar antes de actuar.",
            options: [],
          },
          {
            id: "3",
            prompt: "Sentimiento cuando algo nos duele o extrañamos a alguien",
            answer: "TRISTEZA",
            hint: "Llorar y hablar con mamá o la maestra nos alivia.",
            options: [],
          },
          {
            id: "4",
            prompt: "Emoción que nos avisa de un peligro para protegernos",
            answer: "MIEDO",
            hint: "Pedir un abrazo a un adulto de confianza nos da seguridad.",
            options: [],
          },
          {
            id: "5",
            prompt: "Sentimiento cuando algo nos parece injusto o nos molesta",
            answer: "ENOJO",
            hint: "Contar hasta diez nos ayuda a no lastimar a nadie.",
            options: [],
          },
          {
            id: "6",
            prompt: "Ponerse en el lugar del amigo y comprender cómo se siente",
            answer: "EMPATIA",
            hint: "Escuchar con cariño a los compañeros del salón.",
            options: [],
          },
          {
            id: "7",
            prompt: "Tratar con cuidado, educación y cariño a todas las personas",
            answer: "RESPETO",
            hint: "Saludar, pedir por favor y dar las gracias siempre.",
            options: [],
          },
          {
            id: "8",
            prompt: "Gesto cariñoso con los brazos que nos hace sentir acompañados",
            answer: "ABRAZO",
            hint: "Demuestra afecto y consuelo en el momento oportuno.",
            options: [],
          },
          {
            id: "9",
            prompt: "Vínculo bonito entre compañeros que juegan y se ayudan",
            answer: "AMISTAD",
            hint: "Compartir los materiales y aprender juntos.",
            options: [],
          },
          {
            id: "10",
            prompt: "Dar las gracias de corazón por el cariño o la ayuda recibida",
            answer: "GRATITUD",
            hint: "Agradecer a nuestros profesores y a nuestra familia.",
            options: [],
          },
        ],
        word_bank: ["ALEGRIA", "CALMA", "TRISTEZA", "MIEDO", "ENOJO", "EMPATIA", "RESPETO", "ABRAZO", "AMISTAD", "GRATITUD"],
      },
      model: "gemini-3.6-flash",
    };

    const options = {
      workflowKey: "recursos/ahorcado",
      values: {
        level: "Primaria",
        grade: "1°",
        section: "A",
        area: "Personal Social",
        ie: "I.E. 0001 República del Perú",
        teacher: "Prof. María Mendoza Quispe",
        year: 2026,
      },
    };

    const doc = buildActivityDocx(artifact, options);
    const buffer = await Packer.toBuffer(doc);

    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "01-recursos-ahorcado.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

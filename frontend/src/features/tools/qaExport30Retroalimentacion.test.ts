import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 30-evaluamos-retroalimentacion", () => {
  it("generates 30-evaluamos-retroalimentacion.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Guía de Retroalimentación Formativa y Devolución Pedagógica: Escalera de Wilson",
      executive_summary:
        "Documento técnico de acompañamiento formativo diseñado para 3° de Secundaria, orientado a estructurar la devolución pedagógica de la competencia 'Escribe diversos tipos de textos en su lengua materna' mediante los 4 peldaños de la Escalera de Wilson (Clarificar, Valorar, Expresar inquietudes y Sugerir).",
      sections: [
        {
          title: "Peldaño 1: Clarificar (Preguntas para Comprender la Intención del Estudiante)",
          narrative:
            "Preguntas orientadas a esclarecer ideas antes de emitir cualquier juicio pedagógico:",
          key_points: [
            "¿Qué fuentes estadísticas utilizaste para sustentar tu postura sobre la inversión del canon minero?",
            "¿A qué sector específico de la comunidad educativa está dirigido el llamado a la acción de tu ensayo?",
            "¿Por qué elegiste contrastar la visión local con el marco normativo nacional en el párrafo de desarrollo?",
          ],
        },
        {
          title: "Peldaño 2: Valorar (Reconocimiento Explícito de Fortalezas)",
          narrative:
            "Identificación de aspectos logrados y desempeños destacados observables en la producción escrita:",
          key_points: [
            "Excelente delimitación de la tesis central en el párrafo introductorio, manteniendo coherencia temática.",
            "Uso riguroso de conectores de causa-efecto y contraargumentación que otorgan fluidez a la lectura.",
            "Vocabulario académico y formal adecuado a la situación comunicativa planteada.",
          ],
        },
        {
          title: "Peldaño 3: Expresar Inquietudes (Preguntas Reflexivas sobre Desafíos)",
          narrative:
            "Puntos críticos formulados como cuestionamientos reflexivos para activar la autocrítica:",
          key_points: [
            "Me pregunto si el segundo argumento considera suficientemente el impacto financiero en las pequeñas empresas locales.",
            "¿Cómo podríamos reforzar el cierre para que no solo resuma la tesis, sino que motive una acción ciudadana concreta?",
            "Noto que algunas afirmaciones del tercer párrafo carecen de respaldo bibliográfico explícito.",
          ],
        },
        {
          title: "Peldaño 4: Hacer Sugerencias (Pautas Claras de Mejora Continua)",
          narrative:
            "Recomendaciones viables y accionables para la reescritura de la versión final:",
          key_points: [
            "Incorpora al menos un caso empírico de tu localidad para otorgar mayor fuerza persuasiva a tu propuesta.",
            "Revisa la puntuación en oraciones compuestas largas para evitar ambigüedades en la lectura.",
            "Elabora una ficha de autoevaluación contrastando tu ensayo con los criterios de la rúbrica antes de la entrega final.",
          ],
        },
      ],
      teacher_recommendations: [
        "Realizar la devolución formativa dentro de las 48 horas posteriores a la recepción de la evidencia preliminar.",
        "Brindar siempre la retroalimentación en un clima de empatía y confianza, priorizando el diálogo reflexivo sobre la corrección punitiva.",
        "Monitorear la incorporación efectiva de las sugerencias en la versión reescrita del estudiante.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "evaluamos/retroalimentacion-formativa",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "3° de Secundaria",
      section: "A",
      course: "Comunicación / Producción Textual CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "30-evaluamos-retroalimentacion.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

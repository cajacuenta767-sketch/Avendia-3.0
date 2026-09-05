import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildAnalyticsDocx } from "./exportWorkflowDocx";

describe("QA Generator: 46-acompanamos-calificador-ia", () => {
  it("generates 46-acompanamos-calificador-ia.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Informe Técnico de Calificación Asistida con IA: Valoración de Evidencia y Retroalimentación Formativa",
      executive_summary:
        "Dictamen pedagógico de evaluación formativa asistida con IA bajo el principio de soberanía docente para 5° de Secundaria en Comunicación. Analiza la evidencia auténtica producida por el estudiante (artículo de opinión sobre el uso ético del agua potable), contrasta su desempeño con la rúbrica analítica CNEB, sugiere el nivel de logro alcanzado y propone pautas de retroalimentación reflexiva guiada.",
      sections: [
        {
          title: "Adecuación al Propósito y Registro Formal",
          narrative:
            "Evaluación del criterio 1 sobre la adecuación pragmática:\n" +
            "• Evidencia analizada: El estudiante define con claridad su postura en el párrafo inicial, manteniendo un registro formal académico y dirigiéndose con pertinencia al público objetivo de la comunidad escolar.\n" +
            "• Nivel sugerido: Logro Esperado (A).\n" +
            "• Observación de mejora: Profundizar el uso de terminología técnica de gestión hídrica para elevar la solidez conceptual.",
          key_points: [
            "Retroalimentación: Destacar la claridad de la tesis y sugerir incorporar datos estadísticos del INEI.",
          ],
        },
        {
          title: "Cohesión Textual y Uso de Conectores Lógicos",
          narrative:
            "Evaluación del criterio 2 sobre articulación sintáctica y discursiva:\n" +
            "• Evidencia analizada: Emplea conectores de causa ('debido a que', 'puesto que') y consecuencia ('por consiguiente', 'en efecto') de manera adecuada en tres de los cuatro párrafos.\n" +
            "• Nivel sugerido: Logro Esperado (A).\n" +
            "• Observación de mejora: Evitar la repetición del conector 'además' en el párrafo de cierre, sustituyéndolo por ordenadores discursivos más precisos ('asimismo', 'en última instancia').",
          key_points: [
            "Retroalimentación: Proporcionar una lista de conectores de contraste y adición para enriquecer la variedad léxica.",
          ],
        },
        {
          title: "Argumentación Crítica y Respaldo de Fuentes",
          narrative:
            "Evaluación del criterio 3 sobre solidez argumentativa:\n" +
            "• Evidencia analizada: Plantea dos argumentos principales sustentados en ejemplos cotidianos, pero carece de citas de fuentes autorizadas o evidencia empírica contrastada.\n" +
            "• Nivel sugerido: En Proceso (B).\n" +
            "• Observación de mejora: Integrar al menos una fuente científica o institucional (SUNASS / ANA) que respalde la afirmación sobre el desperdicio doméstico del agua.",
          key_points: [
            "Retroalimentación: Guiar al estudiante mediante preguntas reflexivas: '¿qué institución avala esta cifra?' y '¿cómo responderías al contraargumento?'.",
          ],
        },
        {
          title: "Dictamen Consolidado y Decisión Docente Soberana",
          narrative:
            "Síntesis evaluativa para el registro oficial SIAGIE:\n" +
            "• Nivel consolidado propuesto: Logro Esperado (A).\n" +
            "• Conclusión descriptiva: Rodrigo demuestra competencia sólida para estructurar argumentos claros y cohesionados en defensa del recurso hídrico, recomendándose incorporar citas documentadas para alcanzar el nivel Destacado (AD).\n" +
            "• Aprobación del docente: El docente revisa, valida y suscribe las recomendaciones de la IA sin objeción.",
          key_points: [
            "Compromiso pedagógico: Devolver el texto anotado en un plazo de 24 horas y programar diálogo reflexivo de 10 minutos.",
          ],
        },
      ],
      teacher_recommendations: [
        "Recordar que la sugerencia de la IA es meramente consultiva; la decisión pedagógica final recae siempre en el juicio profesional del docente.",
        "Entregar la retroalimentación escrita acompañada de una conversación presencial para afianzar la metacognición.",
        "Archivar el borrador inicial y la versión reescrita en el portafolio de evidencias del estudiante.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildAnalyticsDocx(artifact, {
      workflowKey: "acompanamos/calificador-ia",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      directorName: "Lic. Elena Torres Valdivia",
      grade: "5° de Secundaria",
      section: "A",
      course: "Comunicación CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "46-acompanamos-calificador-ia.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

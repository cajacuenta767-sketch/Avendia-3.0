import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildAnalyticsDocx } from "./exportWorkflowDocx";

describe("QA Generator: 31-evaluamos-calificador", () => {
  it("generates 31-evaluamos-calificador.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Informe Técnico de Calificación Formativa de Evidencias con IA",
      executive_summary:
        "Reporte pedagógico individualizado de calificación formativa asistida con IA bajo supervisión y decisión docente, correspondiente a la competencia 'Construye interpretaciones históricas' para 4° de Secundaria, evaluando el análisis crítico de fuentes y causalidad múltiple.",
      sections: [
        {
          title: "Datos de la Evidencia y Estudiante Evaluado",
          narrative:
            "Estudiante: Lucila Vílchez Barzola · Grado: 4° de Secundaria 'A'.\n" +
            "Evidencia analizada: Ensayo histórico 'Las Reformas Borbónicas y la Rebelión de Túpac Amaru II: Ruptura del Pacto Colonial'.\n" +
            "Nivel global sugerido por IA: Logro Esperado (A) · Confirmado por el docente.",
          key_points: [
            "Fecha de presentación de evidencia: 24 de marzo de 2026.",
            "Instrumento aplicado: Rúbrica analítica CNEB de 3 criterios.",
          ],
        },
        {
          title: "Desglose del Análisis Cualitativo por Criterios",
          narrative:
            "Valoración detallada por cada dimensión de la competencia evaluada:\n" +
            "1. Contraste de fuentes históricas (Logro Esperado - A): Utiliza extractos de edictos virreinales y cartas pastorales del Obispo Moscoso, distinguiendo hechos de interpretaciones.\n" +
            "2. Comprensión de causalidad múltiple (Logro Destacado - AD): Relaciona magistralmente el aumento de la alcabala y la creación de aduanas internas con el estallido insurgente.\n" +
            "3. Perspectiva histórica sin anacronismos (Logro Esperado - A): Comprende los intereses de los comerciantes criollos y mestizos en el Cusco del siglo XVIII.",
          key_points: [
            "Evidencia citada: 'El reparto forzoso de mercancías ahogó la economía campesina y quebró la lealtad comunal al corregidor'.",
          ],
        },
        {
          title: "Fortalezas Destacadas en la Producción Estudiantil",
          narrative:
            "Aspectos de alto valor pedagógico identificados en el texto:",
          key_points: [
            "Excelente dominio del vocabulario disciplinar (alcabalas, corregimientos, intendencias, visitador Areche).",
            "Articulación lógica fluida entre las citas textuales y las conclusiones personales del estudiante.",
            "Postura crítica que trasciende la visión anecdótica de los hechos históricos.",
          ],
        },
        {
          title: "Pautas de Mejora y Retroalimentación Descriptiva CNEB",
          narrative:
            "Pautas concretas para el estudiante orientadas al siguiente nivel de logro (AD):",
          key_points: [
            "Investigar la postura de curacas leales a la corona (como Mateo Pumacahua) para complejizar el debate sobre la división étnica.",
            "Homogeneizar las referencias bibliográficas empleando normas de citación formal (APA o Chicago).",
            "Autoevaluación metacognitiva: Reflexionar sobre cómo este proceso emancipador conecta con las tensiones regionales del Perú republicano.",
          ],
        },
      ],
      teacher_recommendations: [
        "La sugerencia de la IA ha sido validada y ajustada por el docente de aula, garantizando la centralidad pedagógica humana.",
        "Programar una reunión breve de devolución formativa individual de 5 minutos con la estudiante.",
        "Archivar una copia de este informe en el portafolio de evidencias de evaluación de la I.E.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildAnalyticsDocx(artifact, {
      workflowKey: "evaluamos/calificador-rubrica",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "4° de Secundaria",
      section: "A",
      course: "Ciencias Sociales / Historia del Perú CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "31-evaluamos-calificador.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

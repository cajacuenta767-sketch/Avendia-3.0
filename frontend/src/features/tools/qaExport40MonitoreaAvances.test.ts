import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildAnalyticsDocx } from "./exportWorkflowDocx";

describe("QA Generator: 40-reforzamos-monitorea-avances", () => {
  it("generates 40-reforzamos-monitorea-avances.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Informe Técnico de Monitoreo de Avances de Aprendizaje y Decisiones Pedagógicas",
      executive_summary:
        "Informe analítico de seguimiento formativo del progreso de los aprendizajes para 4° de Primaria en Comunicación. Sistematiza la línea de base, el registro semanal de hitos evaluativos en comprensión lectora inferencial, la categorización en grupos flexibles de atención y las decisiones de reajuste pedagógico para cerrar brechas formativas.",
      sections: [
        {
          title: "I. Línea de Base y Caracterización Inicial del Aula",
          narrative:
            "Diagnóstico de entrada del aula de 4° 'A' (28 estudiantes):\n" +
            "• Estado inicial: 12 estudiantes (43%) presentaban nivel de inicio (C) en la deducción de relaciones de causa-efecto en textos continuos.\n" +
            "• Factores influyentes: Vocabulario restringido y escaso hábito de lectura guiada en el ámbito familiar.\n" +
            "• Meta de la intervención: Lograr que el 85% de los estudiantes transite a niveles de proceso o logro esperado al cierre del bimestre.",
          key_points: [
            "Competencia priorizada: Lee diversos tipos de textos escritos en su lengua materna.",
            "Desempeño observado: Deduce características implícitas de personajes y relaciones lógicas de causa-efecto.",
          ],
        },
        {
          title: "II. Matriz Semanal de Hitos, Evidencias y Análisis Cualitativo",
          narrative:
            "Evolución registrada a lo largo de cuatro semanas de aplicación de andamiajes:\n" +
            "• Semana 1 (Hito 1): Identificación de pistas contextuales con apoyo visual y subrayado guiado.\n" +
            "• Semana 2 (Hito 2): Elaboración de esquemas gráficos de causa-efecto en trabajo de parejas.\n" +
            "• Semana 3 (Hito 3): Resolución independiente de fichas inferenciales en textos de divulgación científica.\n" +
            "• Balance cualitativo: 9 estudiantes superaron la condición de inicio; 3 estudiantes requieren afianzar fluidez decodificadora previa.",
          key_points: [
            "Evidencias contrastadas: Fichas de lectura con esquemas causa-efecto y rúbrica formativa de desempeño.",
          ],
        },
        {
          title: "III. Agrupamiento Flexible y Estrategias Remediales Diferenciadas",
          narrative:
            "Organización del aula en tres grupos dinámicos según necesidades observadas:\n" +
            "• Grupo de Atención Prioritaria (3 estudiantes): Acompañamiento personalizado en contraturno con textos en lectura fácil y soporte auditivo.\n" +
            "• Grupo en Proceso (14 estudiantes): Práctica cooperativa guiada con listas de verificación de auto-monitoreo.\n" +
            "• Grupo Avanzado (11 estudiantes): Desafíos de lectura crítica y contraste de fuentes informativas sobre el patrimonio natural.",
          key_points: [
            "Principio metodológico: Movilidad de grupos basada en evidencia semanal, evitando la estigmatización.",
          ],
        },
        {
          title: "IV. Decisiones Pedagógicas Institucionales y Cronograma de Reajuste",
          narrative:
            "Compromisos adoptados para garantizar la sostenibilidad de los logros:\n" +
            "• Coordinación docente: Compartir las estrategias de subrayado cromático con los docentes de Personal Social y Ciencia.\n" +
            "• Vinculación con la familia: Implementar la 'Mochila Viajera' con lecturas rotativas semanales en el hogar.\n" +
            "• Próxima fecha de corte evaluativo: 12 de junio de 2026.",
          key_points: [
            "Monitoreo colegiado: Revisión mensual de avances en la reunión de trabajo colegiado del ciclo.",
          ],
        },
      ],
      teacher_recommendations: [
        "Asegurar que las retroalimentaciones individuales se brinden en un lapso no mayor a 48 horas tras la aplicación de la evidencia.",
        "Articular los textos de refuerzo con temas de interés genuino del grupo para sostener la motivación intrínseca.",
        "Registrar los progresos en el cuaderno de campo pedagógico para respaldar las conclusiones descriptivas del SIAGIE.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildAnalyticsDocx(artifact, {
      workflowKey: "reforzamos/monitorea-avances",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      directorName: "Lic. Elena Torres Valdivia",
      grade: "4° de Primaria",
      section: "A",
      course: "Comunicación / Monitoreo Pedagógico CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "40-reforzamos-monitorea-avances.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

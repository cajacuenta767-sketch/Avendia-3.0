import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 37-incluimos-seguimiento-evaluacion", () => {
  it("generates 37-incluimos-seguimiento-evaluacion.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Informe Pedagógico de Seguimiento y Evaluación de Ajustes Razonables (DUA)",
      executive_summary:
        "Informe evaluativo institucional bimestral para 4° de Primaria. Documenta la eficacia de las medidas DUA y ajustes razonables aplicados durante el Bimestre 1, el progreso cognitivo y socioemocional del estudiante focalizado, las dificultades aún observadas y las decisiones pedagógicas de reajuste para el siguiente periodo lectivo.",
      sections: [
        {
          title: "I. Caracterización del Estudiante, Periodo y Adaptaciones Implementadas",
          narrative:
            "Estudiante focal: Mateo Saldaña Paredes · 4° de Primaria 'B'.\n" +
            "Periodo evaluado: Bimestre 1 (16 de marzo al 15 de mayo de 2026).\n" +
            "Adaptaciones curriculares implementadas:\n" +
            "• Apoyos de acceso: Cuadrículas macro de 1 cm × 1 cm con código posicional de color (azul/rojo/verde) y regletas Cuisenaire.\n" +
            "• Apoyos metodológicos: Verbalización oral previa al registro escrito y ampliación del 25% en el tiempo de evaluación formativa.",
          key_points: [
            "Condición pedagógica: Dificultad específica en el procesamiento visoespacial del cálculo.",
            "Nivel de cumplimiento del plan: 95% de las sesiones contaron con el material estructurado previsto.",
          ],
        },
        {
          title: "II. Logros de Aprendizaje, Avances Socioemocionales y Evidencias",
          narrative:
            "Evaluación de progresos alcanzados en el aula regular:\n" +
            "• Progreso pedagógico: Mateo alinea correctamente columnas posicionales de tres y cuatro cifras en el 85% de los ejercicios propuestos; comprende el significado del canje aditivo utilizando regletas.\n" +
            "• Progreso socioemocional: Reducción significativa de la frustración y la ansiedad matemática; participa voluntariamente en la socialización de soluciones ante su grupo de trabajo.\n" +
            "• Evidencias sustentatorias: Portafolio de fichas en cuadrícula macro, lista de cotejo de observación directa y grabaciones breves de explicación oral.",
          key_points: [
            "Calificación formativa cualitativa del periodo: Logro Esperado (A) en la competencia 'Resuelve problemas de cantidad' con apoyos.",
          ],
        },
        {
          title: "III. Evaluación de la Efectividad de los Apoyos y Dificultades Persistentes",
          narrative:
            "Balance analítico de la intervención psicopedagógica:\n" +
            "• Apoyos de alta efectividad: Las cuadrículas macro y el código cromático erradicaron por completo los errores de cálculo por desalineación de columnas.\n" +
            "• Apoyos de mediana efectividad: La calculadora de verificación generó cierta distracción cuando se utilizó al inicio de la sesión, por lo que se restringió a la etapa final de autocorrección.\n" +
            "• Dificultades persistentes: Se observa fatiga cognitiva ante enunciados textuales extensos de problemas de dos etapas sin soporte gráfico.",
          key_points: [
            "Conclusión técnica: Los apoyos visoespaciales son indispensables y deben mantenerse durante el Bimestre 2.",
          ],
        },
        {
          title: "IV. Reajustes DUA, Orientaciones Familiares y Metas del Bimestre 2",
          narrative:
            "Decisiones pedagógicas concertadas para el siguiente bimestre:\n" +
            "• Nuevos ajustes DUA: Incorporación de organizadores gráficos de datos y diagramas de barras ilustrados en problemas verbales de dos operaciones.\n" +
            "• Pautas para el hogar: Continuar el refuerzo lúdico semanal mediante juegos de mesa matemáticos y consolidar la lectura compartida de consignas.\n" +
            "• Meta prioritaria Bimestre 2: Resolver de manera autónoma problemas aditivos de dos etapas justificando el procedimiento con soporte gráfico.",
          key_points: [
            "Fecha de próximo corte evaluativo: 24 de julio de 2026.",
          ],
        },
      ],
      teacher_recommendations: [
        "Compartir los resultados del informe con el equipo SAANEE y la comisión de inclusión de la I.E.",
        "Asegurar que las cuadrículas macro estén disponibles en todas las sesiones del área sin generar señalamiento.",
        "Monitorear periódicamente el estado socioemocional del estudiante frente a nuevos desafíos matemáticos.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "incluimos/seguimiento-evaluacion",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "4° de Primaria",
      section: "B",
      course: "Matemática / Educación Inclusiva CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "37-incluimos-seguimiento-evaluacion.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

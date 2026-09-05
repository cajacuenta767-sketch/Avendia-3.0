import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 39-reforzamos-carpeta-recuperacion", () => {
  it("generates 39-reforzamos-carpeta-recuperacion.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Carpeta de Recuperación Pedagógica y Nivelación de Aprendizajes CNEB",
      executive_summary:
        "Documento técnico-pedagógico institucional para 3° de Secundaria en el área de Matemática. Establece la ruta formativa de recuperación para los estudiantes que requieren consolidar aprendizajes en las competencias 'Resuelve problemas de cantidad' y 'Resuelve problemas de regularidad, equivalencia y cambio', mediante experiencias de aprendizaje guiadas, criterios de evaluación formativa y cronograma de seguimiento coordinado con la familia.",
      sections: [
        {
          title: "I. Diagnóstico Pedagógico y Estudiantes Focalizados",
          narrative:
            "Diagnóstico de necesidades de aprendizaje:\n" +
            "• Justificación pedagógica: La evaluación de término de periodo evidenció dificultades recurrentes en la resolución de problemas con expresiones fraccionarias y modelado algebraico de primer grado.\n" +
            "• Población focalizada: Ocho estudiantes que se encuentran en nivel de inicio (C) o proceso (B), quienes recibirán acompañamiento intensivo.\n" +
            "• Propósito formativo: Desarrollar autonomía en el aprendizaje y consolidar nociones matemáticas aplicadas a situaciones de la vida real.",
          key_points: [
            "Periodo de ejecución: Cuatro semanas lectivas con sesiones de asesoría semanal.",
            "Enfoque de evaluación: Evaluación auténtica y formativa orientada a la mejora continua.",
          ],
        },
        {
          title: "II. Competencias Priorizadas y Criterios de Evaluación",
          narrative:
            "Matriz curricular de competencias y capacidades seleccionadas:\n" +
            "• Competencia 1: Resuelve problemas de cantidad. Criterio: Modela situaciones de compra y venta empleando operaciones con números racionales y porcentajes.\n" +
            "• Competencia 2: Resuelve problemas de regularidad, equivalencia y cambio. Criterio: Establece relaciones de equivalencia y resuelve ecuaciones lineales justificando cada transformación algebraica.\n" +
            "• Evidencia integradora: Cuaderno de campo financiero con análisis de costos e ingresos familiares.",
          key_points: [
            "Instrumento de evaluación: Rúbrica descriptiva de niveles de logro (En Inicio, En Proceso, Logro Esperado).",
          ],
        },
        {
          title: "III. Ruta Diferenciada de Experiencias de Aprendizaje",
          narrative:
            "Secuencia escalonada de actividades diseñadas para el trabajo guiado y autónomo:\n" +
            "• Experiencia 1: 'Organizamos el presupuesto familiar mensual'. Cálculo de ingresos, gastos y ahorro utilizando fracciones y porcentajes.\n" +
            "• Experiencia 2: 'Optimizamos costos en un emprendimiento local'. Planteamiento de funciones lineales para determinar el punto de equilibrio comercial.\n" +
            "• Experiencia 3: 'Modelamos situaciones con ecuaciones'. Resolución de problemas verbales contextualizados en el ahorro de energía eléctrica.",
          key_points: [
            "Andamiaje didáctico: Cada actividad incluye un ejemplo resuelto paso a paso antes del planteamiento de retos independientes.",
          ],
        },
        {
          title: "IV. Cronograma de Entregas, Asesorías y Compromiso Familiar",
          narrative:
            "Planificación temporal y articulación con el hogar:\n" +
            "• Semana 1 y 2: Desarrollo y entrega de la Experiencia 1; primera sesión presencial de retroalimentación reflexiva.\n" +
            "• Semana 3 y 4: Desarrollo de las Experiencias 2 y 3; entrega del portafolio final y autoevaluación guiada.\n" +
            "• Compromisos de la familia: Habilitar un espacio de estudio diario, monitorear el cronograma de avance y firmar la ficha de seguimiento semanal.",
          key_points: [
            "Fecha límite de entrega de carpeta completa: 30 de abril de 2026.",
          ],
        },
      ],
      teacher_recommendations: [
        "Brindar retroalimentación descriptiva a tiempo enfocada en los aciertos y en cómo superar las dificultades matemáticas.",
        "Evitar la acumulación de actividades al final del periodo promoviendo entregas parciales semanales.",
        "Coordinar con la dirección la emisión de las actas de evaluación de recuperación una vez consolidado el portafolio.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "reforzamos/carpeta-recuperacion",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      directorName: "Lic. Elena Torres Valdivia",
      grade: "3° de Secundaria",
      section: "A",
      course: "Matemática / Refuerzo Escolar CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "39-reforzamos-carpeta-recuperacion.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

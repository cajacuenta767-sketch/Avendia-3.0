import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 13-recursos-normativa-educativa", () => {
  it("generates 13-recursos-normativa-educativa.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Síntesis y Marco Normativo MINEDU: Evaluación Formativa y Promoción Guiada (RVM N° 094-2020-MINEDU)",
      executive_summary:
        "Guía de consulta y fundamentación técnica sobre la 'Norma que regula la Evaluación de las Competencias de los Estudiantes de la Educación Básica' (RVM N° 094-2020-MINEDU), orientada a brindar seguridad jurídica y consistencia pedagógica en la toma de decisiones docentes.",
      sections: [
        {
          title: "Marco Legal Vigente y Jerarquía Normativa",
          narrative:
            "Disposiciones legales vigentes que regulan los procesos evaluativos en las instituciones educativas de Educación Básica Regular:",
          key_points: [
            "Ley General de Educación N° 28044 (Art. 30): La evaluación como proceso formativo, continuo e integral.",
            "RVM N° 094-2020-MINEDU: Norma técnica matriz para la evaluación diagnóstica, formativa y sumativa.",
            "RVM N° 587-2023-MINEDU y R.M. N° 587-2024-MINEDU: Lineamientos para el desarrollo del año lectivo.",
            "Ley N° 29719: Ley que promueve la convivencia sin violencia en las instituciones educativas.",
          ],
        },
        {
          title: "Disposiciones Clave sobre Evaluación Formativa y Retroalimentación",
          narrative:
            "Obligaciones y criterios mandatorios para el docente de aula en relación con los estudiantes y sus familias:",
          key_points: [
            "Propósito evaluativo: Identificar el avance real, fortalezas y barreras de aprendizaje del estudiante respecto al estándar CNEB.",
            "Retroalimentación reflexiva: Priorizar la retroalimentación formativa oportuna por sobre la mera asignación de una calificación numérica o cualitativa.",
            "Criterios de evaluación: Deben ser explícitos, conocidos previamente por los alumnos y formulados a partir de los estándares y desempeños del ciclo.",
            "Escala de calificación cualitativa (AD, A, B, C): Ningún estudiante de EBR puede recibir un calificativo sin informe descriptivo sustentatorio.",
          ],
        },
        {
          title: "Protocolo de Aplicación en el Aula y Promoción Acompañada",
          narrative:
            "Procedimientos reglamentarios para el cierre de periodos lectivos y carpetas de recuperación pedagógica:",
          key_points: [
            "Conclusiones descriptivas: Obligatorias para todo estudiante que obtenga nivel de logro 'C' o 'B' en alguna competencia.",
            "Evaluación psicopedagógica y DUA: Adecuación de tiempos, formatos y apoyos razonables para estudiantes con NEE.",
            "Período de recuperación estival: Diseñar carpetas de recuperación contextualizadas con autoevaluación formativa.",
          ],
        },
      ],
      teacher_recommendations: [
        "Verificar periódicamente las resoluciones complementarias publicadas en el portal oficial del MINEDU / Gob.pe.",
        "Articular los criterios de las rúbricas de área con las definiciones precisas de la RVM N° 094-2020-MINEDU.",
        "Socializar con los padres de familia los criterios e instrumentos de evaluación al inicio de cada unidad o bimestre.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "recursos/normativa-educativa",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "1° a 5° de Secundaria",
      section: "Todas",
      course: "Gestión Pedagógica y Currículo",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "13-recursos-normativa-educativa.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

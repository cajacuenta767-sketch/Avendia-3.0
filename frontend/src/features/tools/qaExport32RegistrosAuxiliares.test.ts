import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildInstrumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 32-evaluamos-registros-auxiliares", () => {
  it("generates 32-evaluamos-registros-auxiliares.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Registro Auxiliar Oficial de Evaluación Formativa CNEB - Bimestre I",
      executive_summary:
        "Documento normativo de seguimiento y valoración formativa correspondiente al Primer Bimestre del año lectivo 2026 para 5° de Secundaria. Articula la nómina escolar con los criterios de evaluación de la competencia 'Lee diversos tipos de textos escritos en su lengua materna', asistencia y conclusiones descriptivas para el SIAGIE.",
      sections: [
        {
          title: "I. Competencias y Capacidades Evaluadas",
          narrative:
            "Competencia priorizada: Lee diversos tipos de textos escritos en su lengua materna.\n" +
            "Capacidades movilizadas:\n" +
            "• Obtiene información del texto escrito.\n" +
            "• Infiere e interpreta información del texto.\n" +
            "• Reflexiona y evalúa la forma, el contenido y contexto del texto.",
          key_points: [
            "Enfoque del área: Comunicativo y sociocultural.",
            "Periodo lectivo: Bimestre 1 (Marzo - Mayo 2026).",
          ],
        },
        {
          title: "II. Matriz de Criterios de Evaluación y Evidencias",
          narrative:
            "Criterios de valoración y producciones esperadas de los estudiantes:\n" +
            "• C1: Identifica posturas explícitas y contraargumentos en ensayos de opinión contemporáneos.\n" +
            "• C2: Deduce la intención comunicativa y los sesgos ideológicos del autor a partir de recursos retóricos.\n" +
            "• C3: Emite juicio crítico fundamentado contrastando el texto con la realidad sociocultural del país.",
          key_points: [
            "Evidencia principal: Matriz de análisis textual crítico y sustentación argumentativa en plenario.",
            "Instrumento articulado: Rúbrica analítica y registro de campo.",
          ],
        },
        {
          title: "III. Balance de Asistencia y Permanencia Escolar",
          narrative:
            "Monitoreo integral de asistencia del aula (Total: 28 estudiantes matriculados):\n" +
            "• Asistencia promedio bimestral: 96.4%.\n" +
            "• Tardanzas justificadas: 4 registros atendidos con tutoría preventiva.\n" +
            "• Inasistencias injustificadas: 0 casos (0% de riesgo de deserción).",
          key_points: [
            "Medida preventiva: Seguimiento coordinado con el comité de tutoría y comunicación oportuna a las familias.",
          ],
        },
        {
          title: "IV. Conclusiones Descriptivas Oficiales CNEB (Por Niveles de Logro)",
          narrative:
            "Orientaciones para el registro oficial de calificaciones en el SIAGIE:\n" +
            "• Estudiantes en Proceso (Nivel B): Identifican información explícita y tesis central, pero requieren apoyo pedagógico para fundamentar sus inferencias ante recursos estilísticos complejos como la ironía.\n" +
            "• Estudiantes en Logro Esperado (Nivel A): Interpretan el sentido global del texto, contrastan argumentos con suficiencia y justifican su postura con razones lógicas consistentes.\n" +
            "• Estudiantes en Logro Destacado (Nivel AD): Evalúan la validez de los argumentos, detectan falacias y proponen lecturas intertextuales profundas vinculadas al contexto ciudadano.",
          key_points: [
            "Plan de refuerzo: 3 estudiantes focalizados recibirán sesiones de lectura guiada en horario extracurricular.",
          ],
        },
      ],
      teacher_recommendations: [
        "Consignar las conclusiones descriptivas en el SIAGIE priorizando siempre a los estudiantes en niveles Inicio (C) y Proceso (B).",
        "Compartir los resultados cualitativos en la reunión de entrega de informes de progreso con las familias.",
        "Articular las necesidades identificadas con el Plan de Refuerzo Escolar del segundo bimestre.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildInstrumentDocx(artifact, {
      workflowKey: "evaluamos/registros-auxiliares",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "5° de Secundaria",
      section: "A",
      course: "Comunicación / Comprensión Lectora CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "32-evaluamos-registros-auxiliares.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

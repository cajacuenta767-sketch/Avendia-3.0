import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 33-incluimos-adaptacion-nee-dua", () => {
  it("generates 33-incluimos-adaptacion-nee-dua.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Plan de Adaptación Curricular Individualizada y Ajustes Razonables (DUA)",
      executive_summary:
        "Documento pedagógico normativo de inclusión educativa diseñado para 4° de Primaria. Establece adaptaciones curriculares, metodológicas y de acceso basadas en los tres principios del Diseño Universal para el Aprendizaje (DUA) para garantizar el progreso formativo y la participación plena del estudiante focalizado.",
      sections: [
        {
          title: "I. Diagnóstico Pedagógico y Barreras para el Aprendizaje (BAP)",
          narrative:
            "Estudiante focal: Mateo Saldaña Paredes · 4° de Primaria 'B'.\n" +
            "Diagnóstico funcional y barreras identificadas:\n" +
            "• Fortalezas e intereses: Destacada memoria auditiva, fluidez verbal expresiva, interés por relatos históricos y disposición al trabajo cooperativo.\n" +
            "• Barreras para el aprendizaje (BAP): Dificultad para alinear columnas de cifras en papel estándar y sobrecarga cognitiva frente a textos matemáticos con enunciados densos y sin apoyo visual.",
          key_points: [
            "Condición pedagógica: Dificultad específica en el procesamiento visoespacial del cálculo.",
            "Enfoque inclusivo: Mantenimiento de altas expectativas sin reducir la exigencia conceptual.",
          ],
        },
        {
          title: "II. Matriz de Ajustes Razonables basada en los Principios DUA",
          narrative:
            "Implementación de medidas universales y focalizadas en el aula regular:\n" +
            "• Principio I (Compromiso y Motivación): Formulación de problemas contextualizados en la economía familiar y el comercio local; opción de elegir el orden de desarrollo de los retos.\n" +
            "• Principio II (Representación y Acceso): Uso sistemático de material multibase, regletas de Cuisenaire y hojas con cuadrículas ampliadas (1 cm × 1 cm) con código de colores posicionales (Unidades en azul, Decenas en rojo, Centenas en verde).\n" +
            "• Principio III (Acción y Expresión): Posibilidad de verbalizar oralmente la estrategia de resolución previa al registro escrito, empleo de tarjetas de dígitos recortables y verificación autónoma.",
          key_points: [
            "Recursos de accesibilidad: Cuadrículas macro, regletas manipulativas y calculadora de control formativo.",
          ],
        },
        {
          title: "III. Adaptaciones Curriculares en Desempeños y Evaluación",
          narrative:
            "Graduación del desempeño y criterios evaluativos de la competencia 'Resuelve problemas de cantidad':\n" +
            "• Desempeño adaptado: Expresa su comprensión del sistema de numeración decimal hasta cuatro cifras y realiza operaciones aditivas empleando material concreto y representaciones gráficas estructuradas.\n" +
            "• Ajustes en la evaluación: Evaluación auténtica basada en rúbrica descriptiva; instrucciones orales segmentadas paso a paso y extensión del tiempo de resolución en un 25%.\n" +
            "• Instrumento prioritario: Lista de cotejo cualitativa y registro de observación de procedimientos.",
          key_points: [
            "Evidencia diferenciada: Cuaderno de campo matemático con gráficos estructurados y explicación verbal guiada.",
          ],
        },
        {
          title: "IV. Coordinación SAANEE, Familia y Cronograma de Monitoreo",
          narrative:
            "Líneas de articulación y compromisos institucionales:\n" +
            "• Acompañamiento SAANEE: Asesoría quincenal al docente de aula para el reajuste de materiales manipulativos.\n" +
            "• Compromisos de la familia: Afianzar la autonomía personal en casa, apoyar rutinas de organización temporal y reforzar el cálculo mediante juegos cotidianos de mesa.\n" +
            "• Cronograma de revisión: Evaluación bimestral de avances al término de cada periodo lectivo.",
          key_points: [
            "Meta bimestral: Consolidar la resolución autónoma de problemas aditivos de dos etapas con soporte de cuadrícula ampliada.",
          ],
        },
      ],
      teacher_recommendations: [
        "Compartir las pautas DUA con los docentes de las demás áreas curriculares para mantener coherencia en las adaptaciones.",
        "Promover un clima de aula respetuoso de la diversidad y erradicar cualquier manifestación de etiquetado.",
        "Documentar los progresos en el portafolio pedagógico de atención a la diversidad de la institución educativa.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "incluimos/adaptacion-nee-dua",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "4° de Primaria",
      section: "B",
      course: "Matemática / Educación Inclusiva CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "33-incluimos-adaptacion-nee-dua.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

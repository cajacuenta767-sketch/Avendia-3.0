import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildInstrumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 24-evaluamos-rubrica-evaluacion", () => {
  it("generates 24-evaluamos-rubrica-evaluacion.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Rúbrica Analítica de Evaluación Formativa: Ensayo Argumentativo sobre Biodiversidad Amazónica",
      executive_summary:
        "Instrumento técnico de evaluación auténtica y formativa diseñado para 4° de Secundaria, orientado a valorar el nivel de desarrollo de la competencia 'Escribe diversos tipos de textos en su lengua materna' mediante la producción de un ensayo científico-argumentativo sobre la conservación de la biodiversidad y el desarrollo sostenible.",
      sections: [
        {
          title: "1. Tesis y Postura Crítica Fundamentada",
          narrative:
            "Plantea una tesis clara, coherente y delimitada con postura crítica fundamentada sobre la biodiversidad.",
          key_points: [
            "La postura es ambigua o no se distingue con claridad del tema general; carece de punto de vista propio.",
            "Formula una tesis identificable pero con argumentos genéricos sin postura crítica sólida frente al problema.",
            "Plantea una tesis clara, coherente y delimitada con postura crítica fundamentada sobre la biodiversidad.",
            "Formula una tesis innovadora, de alta complejidad conceptual y articulada rigurosamente con la realidad socioambiental regional.",
          ],
        },
        {
          title: "2. Sustento Argumentativo y Evidencia Científica",
          narrative:
            "Sustenta cada argumento con evidencias científicas sólidas, datos estadísticos y referencias bibliográficas pertinentes.",
          key_points: [
            "Utiliza opiniones personales sin respaldo documental ni fuentes científicas verificables.",
            "Incorpora algunas citas aisladas pero sin análisis crítico ni contraste entre autores o evidencias.",
            "Sustenta cada argumento con evidencias científicas sólidas, datos estadísticos y referencias bibliográficas pertinentes.",
            "Contrasta múltiples fuentes académicas especializadas, analiza contraargumentos y valida la evidencia con solvencia epistémica.",
          ],
        },
        {
          title: "3. Coherencia, Cohesión y Progresión Temática",
          narrative:
            "Articula las ideas con fluidez mediante conectores lógicos variados, jerarquía capitular y sólida cohesión interparrafal.",
          key_points: [
            "Presenta reiteraciones innecesarias, digresiones o vacíos de información que dificultan la comprensión lectora.",
            "Mantiene la progresión temática básica con uso limitado de conectores lógicos y leves desajustes de cohesión.",
            "Articula las ideas con fluidez mediante conectores lógicos variados, jerarquía capitular y sólida cohesión interparrafal.",
            "Evidencia maestría estilística, ritmo argumentativo impecable y transición conceptual armónica en todo el cuerpo textual.",
          ],
        },
        {
          title: "4. Adecuación Pragmática y Ética de las Fuentes",
          narrative:
            "Aplica el registro formal estándar, precisión léxica disciplinar y citado ético riguroso según normas académicas.",
          key_points: [
            "Emplea registro coloquial recurrente e incurre en citas no atribuidas o parafraseo inadecuado.",
            "Usa registro formal con algunas imprecisiones léxicas y citas incompletas según la norma APA requerida.",
            "Aplica el registro formal estándar, precisión léxica disciplinar y citado ético riguroso según normas académicas.",
            "Demuestra excelencia en el manejo del lenguaje académico especializado y rigurosa ética de autoría intelectual.",
          ],
        },
      ],
      teacher_recommendations: [
        "Compartir y analizar la rúbrica con los estudiantes antes del inicio de la redacción para garantizar la transparencia de los criterios de evaluación.",
        "Utilizar la rúbrica para brindar retroalimentación descriptiva a los borradores intermedios mediante preguntas de mediación.",
        "Promover la coevaluación entre pares en parejas de trabajo antes de la versión final del ensayo.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildInstrumentDocx(artifact, {
      workflowKey: "evaluamos/rubrica-evaluacion",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "4° de Secundaria",
      section: "A",
      course: "Comunicación / CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "24-evaluamos-rubrica-evaluacion.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

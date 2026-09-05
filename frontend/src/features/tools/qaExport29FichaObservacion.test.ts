import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildInstrumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 29-evaluamos-ficha-observacion", () => {
  it("generates 29-evaluamos-ficha-observacion.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Ficha de Observación Sistemática en Aula: Resolución de Problemas Matemáticos",
      executive_summary:
        "Instrumento técnico de observación directa y formativa diseñado para 4° de Secundaria, orientado a registrar de manera sistemática las evidencias de desempeño de la competencia 'Resuelve problemas de cantidad' y el clima socioemocional de aprendizaje durante las sesiones de modelación financiera.",
      sections: [
        {
          title: "Focalización y Situación de Aprendizaje Observada",
          narrative:
            "Sesión de aprendizaje dedicada a la modelación algebraica del interés compuesto e inflación económica en proyectos familiares. Se observa la interacción dialógica, el uso reflexivo del error y la toma de decisiones en parejas de trabajo.",
          key_points: [
            "Foco prioritario: Identificar la autorregulación cognitiva y la justificación matemática de procedimientos.",
            "Espacio y horario: Laboratorio de matemática / 90 minutos de sesión pedagógica.",
          ],
        },
        {
          title: "Criterios de Observación y Conductas Visibles",
          narrative:
            "Registro de conductas observables organizadas por niveles de desarrollo formativo:",
          key_points: [
            "[  ] Criterio 1: Explora y ensaya diversas estrategias heurísticas (tablas, gráficos) antes de formalizar la ecuación financiera.",
            "[  ] Criterio 2: Comunica con vocabulario formal y precisión simbólica los pasos seguidos para llegar a la solución.",
            "[  ] Criterio 3: Asume el error de cálculo como oportunidad de aprendizaje y solicita retroalimentación específica a su par.",
          ],
        },
        {
          title: "Interpretación Pedagógica y Hallazgos Observados",
          narrative:
            "Análisis contextualizado de las interacciones observadas en el aula:\n" +
            "- Los estudiantes muestran alto dominio en el cálculo algorítmico básico, pero un tercio del aula presenta bloqueos al traducir enunciados contextualizados a expresiones exponenciales.\n" +
            "- El trabajo cooperativo redujo la ansiedad matemática, promoviendo debates productivos sobre la viabilidad de créditos financieros.",
          key_points: [
            "Fortaleza: Alta disposición al debate argumentativo y formulación de preguntas entre pares.",
            "Aspecto a reforzar: Interpretación económica de los parámetros temporales en fórmulas de amortización.",
          ],
        },
        {
          title: "Conclusiones y Compromisos de Mejora Docente",
          narrative:
            "Plan de acción para las sesiones posteriores del área:\n" +
            "1. Diseñar fichas de andamiaje con casos reales de microfinanzas comunales para conectar la teoría con la realidad cotidiana.\n" +
            "2. Destinar 15 minutos al inicio de la siguiente clase para modelar en plenaria la decodificación lingüística de problemas complejos.",
          key_points: [
            "Compromiso docente: Realizar seguimiento focalizado a las 4 parejas que evidenciaron dudas en tasas efectivas anuales.",
            "Acuerdo estudiantil: Elaborar un glosario de términos financieros en sus cuadernos de trabajo.",
          ],
        },
      ],
      teacher_recommendations: [
        "Contrastar los registros de esta ficha con las evidencias escritas entregadas por los alumnos al cierre de la sesión.",
        "Programar una devolución formativa colectiva destacando los aciertos y estrategias innovadoras encontradas en los grupos.",
        "Registrar los compromisos asumidos en el anecdotario del aula para medir la evolución longitudinal de actitudes.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildInstrumentDocx(artifact, {
      workflowKey: "evaluamos/ficha-observacion",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "4° de Secundaria",
      section: "B",
      course: "Matemática / Resolución de Problemas de Cantidad",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "29-evaluamos-ficha-observacion.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

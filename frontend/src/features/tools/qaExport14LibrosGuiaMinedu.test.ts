import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 14-recursos-libros-guia-minedu", () => {
  it("generates 14-recursos-libros-guia-minedu.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Guía Pedagógica y Uso Didáctico de Materiales MINEDU: Resolvamos Problemas 1 (Matemática)",
      executive_summary:
        "Orientaciones metodológicas y dosificación curricular para la integración efectiva del cuaderno de trabajo 'Resolvamos Problemas 1' y la 'Guía Docente de Matemática Ciclo VI' en las sesiones de aprendizaje sobre fracciones, decimales y porcentajes en 1° de Secundaria bajo el CNEB.",
      sections: [
        {
          title: "Ficha Técnica y Referencias Bibliográficas Oficiales MINEDU",
          narrative:
            "Materiales educativos distribuidos por el Ministerio de Educación seleccionados para la unidad didáctica:",
          key_points: [
            "Texto Escolar: Matemática 1 - Secundaria (Páginas 68-79: Números racionales y proporcionalidad).",
            "Cuaderno de Trabajo: Resolvamos Problemas 1 - Ficha N° 4 'Comparamos ofertas en el mercado local' (Páginas 45-56).",
            "Guía para el Docente: Orientaciones pedagógicas para el desarrollo de competencias matemáticas (MINEDU, 2024).",
            "Repositorio Digital: PerúEduca - Recursos interactivos y fichas de refuerzo escolar para Ciclo VI.",
          ],
        },
        {
          title: "Articulación Curricular y Desempeños Priorizados",
          narrative:
            "Correspondencia entre las actividades del cuaderno de trabajo y los desempeños del Programa Curricular de Secundaria:",
          key_points: [
            "Competencia: Resuelve problemas de cantidad.",
            "Desempeño 1: Establece relaciones entre datos y acciones de comparar e igualar cantidades; las transforma a expresiones numéricas que incluyen operaciones con fracciones y decimales.",
            "Desempeño 2: Expresa con diversas representaciones y lenguaje numérico su comprensión sobre la equivalencia entre fracciones, decimales y porcentajes usuales (25%, 50%, 75%).",
            "Enfoque Transversal: Búsqueda de la excelencia y Orientación al bien común.",
          ],
        },
        {
          title: "Secuencia Metodológica de Integración en el Aula",
          narrative:
            "Ruta didáctica estructurada para optimizar el trabajo autónomo y colaborativo con las fichas del MINEDU:",
          key_points: [
            "Inicio (15 min): Análisis vivencial de la situación significativa 'Las rebajas de temporada' (Ficha 4, Pág. 45) mediante preguntas de activación.",
            "Desarrollo (60 min): Trabajo en pares resolviendo los problemas 1 al 4 con material concreto (regletas de fracciones) y registro en el cuaderno.",
            "Cierre (15 min): Puesta en común de estrategias divergentes y resolución colectiva de la sección 'Evaluamos nuestros avances'.",
          ],
        },
        {
          title: "Adaptaciones DUA y Andamiajes Didácticos",
          narrative:
            "Adecuaciones metodológicas para atender la diversidad de ritmos de aprendizaje del aula:",
          key_points: [
            "Andamiaje visual: Tablas de doble entrada y cuadrículas de 10x10 para visualizar porcentajes como fracciones decimales.",
            "Nivelación formativa: Fichas de refuerzo complementarias de PerúEduca para estudiantes que requieren consolidar la división decimal.",
            "Ampliación de retos: Problemas abiertos de investigación de precios reales de la canasta básica familiar para estudiantes avanzados.",
          ],
        },
      ],
      teacher_recommendations: [
        "Monitorear que los estudiantes utilicen sus propios cuadernos de trabajo sin limitarse a copiar respuestas del solucionario.",
        "Aprovechar las secciones de metacognición al final de cada ficha para evaluar las estrategias heuristicas empleadas.",
        "Articular el registro de evidencias de la Ficha 4 con los criterios de evaluación del Registro Auxiliar Oficial.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "recursos/libros-guia-minedu",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "1° de Secundaria",
      section: "A",
      course: "Matemática",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "14-recursos-libros-guia-minedu.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

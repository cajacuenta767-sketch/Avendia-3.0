import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 18-planificamos-sesion-aprendizaje", () => {
  it("generates 18-planificamos-sesion-aprendizaje.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Sesión de Aprendizaje N° 04: Identificamos Tesis y Argumentos en Ensayos sobre Biodiversidad",
      executive_summary:
        "Sesión pedagógica de 90 minutos diseñada para estudiantes de 2° de Secundaria en el área de Comunicación, orientada a desarrollar la lectura crítica y la discriminación entre posturas, tesis y evidencias científicas en textos argumentativos bajo el enfoque CNEB.",
      sections: [
        {
          title: "Propósitos de Aprendizaje y Criterios de Evaluación CNEB",
          narrative:
            "Competencias, capacidades y criterios formativos precisados para la sesión de clase:",
          key_points: [
            "Competencia: Lee diversos tipos de textos en su lengua materna.",
            "Capacidad 1: Obtiene información del texto escrito (ubica la tesis explícita o implícita en la introducción del ensayo).",
            "Capacidad 2: Infiere e interpreta información del texto (discrimina entre argumentos causales, de autoridad y ejemplos ilustrativos).",
            "Capacidad 3: Reflexiona y evalúa la forma, el contenido y el contexto del texto (emite juicio crítico sobre la validez de los argumentos).",
            "Enfoque Transversal: Enfoque Ambiental y Orientación al Bien Común.",
          ],
        },
        {
          title: "Procesos Didácticos Específicos del Área de Comunicación",
          narrative:
            "Secuencia metodológica de interacción con el texto durante la sesión:",
          key_points: [
            "Antes de la lectura (15 min): Lectura del título 'El pulmón amenazado de la Amazonía', activación de saberes sobre deforestación y predicción de la postura del autor.",
            "Durante la lectura (45 min): Primera lectura silenciosa individual; segunda lectura guiada en voz alta con técnica del sumillado al margen y subrayado de tesis (rojo) y argumentos (azul).",
            "Después de la lectura (30 min): Trabajo en pares completando el 'Árbol de Tesis y Argumentos' y contraste dialógico con las predicciones iniciales.",
          ],
        },
        {
          title: "Evidencia de Aprendizaje e Instrumento de Evaluación Formativa",
          narrative:
            "Producción tangible del estudiante para evidenciar el nivel de logro de la competencia:",
          key_points: [
            "Evidencia: Ficha de análisis textual con el árbol de tesis y argumentos completado y un párrafo de valoración crítica de 5 líneas.",
            "Instrumento: Lista de Cotejo Formativa con 4 descriptores dicotómicos (Sí / No / En proceso) y espacio para retroalimentación inmediata.",
            "Mecanismo de devolución: Retroalimentación reflexiva en plenaria a partir del análisis de un error frecuente sobre confusión entre tema y tesis.",
          ],
        },
        {
          title: "Adaptaciones Curriculares DUA y Accesibilidad Universal",
          narrative:
            "Estrategias inclusivas para garantizar el aprendizaje de todos los estudiantes:",
          key_points: [
            "Principio I DUA: Conexión con problemáticas vivenciales de la región amazónica para suscitar interés intrínseco.",
            "Principio II DUA: Organizador gráfico prediseñado con casillas rotuladas y vocabulario de conectores lógicos de causa-consecuencia.",
            "Principio III DUA: Opción de registrar las conclusiones de forma escrita o sustentarlas mediante una breve grabación de voz en tablet escolar.",
          ],
        },
      ],
      teacher_recommendations: [
        "Recordar a los estudiantes que la tesis es una postura debatible y no un hecho comprobado indiscutible.",
        "Monitorear los equipos de trabajo prestando especial atención a los estudiantes que confunden el tema general con la tesis particular.",
        "Articular los argumentos analizados como insumo directo para la siguiente sesión de redacción del propio ensayo de opinión.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "planificamos/sesion-aprendizaje",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "2° de Secundaria",
      section: "A",
      course: "Comunicación",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "18-planificamos-sesion-aprendizaje.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

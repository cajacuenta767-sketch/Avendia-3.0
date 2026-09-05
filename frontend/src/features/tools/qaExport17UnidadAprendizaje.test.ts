import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 17-planificamos-unidad-aprendizaje", () => {
  it("generates 17-planificamos-unidad-aprendizaje.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Unidad de Aprendizaje N° 02: Promovemos el Consumo Responsable y el Cuidado del Agua en Nuestra Comunidad",
      executive_summary:
        "Unidad didáctica de 4 semanas diseñada para 3° de Secundaria que articula las competencias comunicativas y ciudadanas frente al desabastecimiento hídrico local, culminando en la producción y difusión de un manifiesto juvenil y una infografía comunitaria bajo el enfoque CNEB.",
      sections: [
        {
          title: "Situación Significativa y Desafío del Contexto",
          narrative:
            "En la comunidad semiurbana de Lamas, las familias enfrentan cortes programados de agua potable durante la temporada seca, afectando la higiene y el bienestar. Ante esta realidad, los estudiantes se preguntan: ¿Cómo podemos sensibilizar a la población sobre el uso eficiente del agua y la preservación de las fuentes naturales? ¿Qué propuestas argumentativas podemos formular desde la escuela?",
          key_points: [
            "Eje de la situación: Cuidado del ambiente y convivencia democrática.",
            "Desafío cognitivo: Investigar el ciclo del agua local, entrevistar a líderes vecinales y redactar un texto expositivo-argumentativo.",
            "Producto integrador: Manifiesto escolar con compromisos comunitarios para la gestión del agua potable.",
          ],
        },
        {
          title: "Matriz de Propósitos de Aprendizaje y Competencias CNEB",
          narrative:
            "Competencias, capacidades y desempeños precisados a desarrollar durante la unidad:",
          key_points: [
            "Competencia: Lee diversos tipos de textos en su lengua materna (identifica información explícita, deduce relaciones de causa-efecto y evalúa la intención del autor).",
            "Competencia: Escribe diversos tipos de textos en su lengua materna (adecúa el texto a la situación comunicativa, organiza ideas de forma coherente y cohesionada con conectores lógicos).",
            "Competencia Transversal: Gestiona su aprendizaje de manera autónoma (establece metas viables y evalúa sus avances continuamente).",
            "Enfoques Transversales: Enfoque Ambiental (justicia y solidaridad intergeneracional) y Orientación al Bien Común.",
          ],
        },
        {
          title: "Secuencia Didáctica de Sesiones de Aprendizaje",
          narrative:
            "Ruta metodológica de 5 sesiones articuladas de 90 minutos cada una:",
          key_points: [
            "Sesión 1: 'Analizamos la problemática hídrica de nuestra localidad mediante lecturas estadísticas' (Activación y diagnóstico).",
            "Sesión 2: 'Identificamos las posturas de los actores sociales en artículos de opinión sobre recursos naturales' (Comprensión crítica).",
            "Sesión 3: 'Planificamos la estructura y argumentos de nuestro manifiesto comunal' (Planificación y textualización).",
            "Sesión 4: 'Revisamos borradores entre pares utilizando una rúbrica analítica y criterios de cohesión' (Coevaluación y edición).",
            "Sesión 5: 'Presentamos y sustentamos nuestras propuestas ante el comité ambiental escolar' (Socialización y evaluación sumativa).",
          ],
        },
        {
          title: "Criterios de Evaluación, Evidencias e Instrumentos",
          narrative:
            "Sistema de evaluación formativa para monitorear el logro de los desempeños del Ciclo VII:",
          key_points: [
            "Evidencia 1: Cuadro comparativo de causas y consecuencias del mal uso del agua (Evaluado con Lista de Cotejo).",
            "Evidencia 2: Borrador preliminar del manifiesto con argumentos basados en fuentes científicas (Evaluado con Ficha de Observación).",
            "Evidencia Final: Manifiesto institucional y exposición oral comunitaria (Evaluado con Rúbrica Analítica de Desempeño).",
          ],
        },
        {
          title: "Adaptaciones Curriculares DUA y Atención a la Diversidad",
          narrative:
            "Ajustes razonables para garantizar la participación equitativa de todos los estudiantes:",
          key_points: [
            "Principio I DUA (Compromiso): Elección autónoma de formatos de difusión (podcast radial escolar, afiche mural o sustentación oral).",
            "Principio II DUA (Representación): Textos informativos acompañados de esquemas gráficos, glosarios y versión en audio.",
            "Principio III DUA (Acción y Expresión): Permiso de uso de procesadores de texto y software de dictado por voz para estudiantes con dificultades motrices.",
          ],
        },
      ],
      teacher_recommendations: [
        "Coordinar previamente con los docentes de Ciencias Sociales para articular las sesiones de análisis histórico del acceso al agua.",
        "Promover que los estudiantes compartan el manifiesto con sus familias para generar acuerdos concretos en el hogar.",
        "Monitorear los cuadernos de trabajo y registrar el avance en el Registro Auxiliar de Competencias de manera semanal.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "planificamos/unidad-aprendizaje",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "3° de Secundaria",
      section: "A",
      course: "Comunicación",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "17-planificamos-unidad-aprendizaje.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

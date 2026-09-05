import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 12-recursos-banco-planificacion", () => {
  it("generates 12-recursos-banco-planificacion.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Banco Curricular de Recursos Didácticos: Comprensión Lectora y Ensayos Argumentativos",
      executive_summary:
        "Compendio organizado y clasificado de recursos pedagógicos, lecturas modelo, organizadores gráficos y guías de escritura diseñado para fortalecer las competencias comunicativas y la argumentación crítica en estudiantes de 2° de Secundaria bajo el CNEB.",
      sections: [
        {
          title: "Catálogo de Recursos Pedagógicos Seleccionados",
          narrative:
            "El presente banco reúne materiales dosificados por nivel de complejidad para su aplicación en sesiones de aprendizaje y proyectos interdisciplinarios:",
          key_points: [
            "Fichas de lectura crítica: 5 textos argumentativos breves sobre ciudadanía ambiental y tecnología.",
            "Organizadores visuales: Plantillas de mapa de ideas, árbol de problemas y diagrama de tesis-argumentos.",
            "Guías de redacción paso a paso: Matrices de conectores lógicos de causa, consecuencia y oposición.",
            "Portafolio de evidencias: Fichas de autoevaluación y coevaluación para borradores intermedios.",
          ],
        },
        {
          title: "Matriz de Articulación Curricular y Desempeños",
          narrative:
            "Cada recurso del banco tributa directamente al desarrollo de los estándares de aprendizaje del Ciclo VI:",
          key_points: [
            "Competencia: Lee diversos tipos de textos en su lengua materna (identifica información explícita e infiere la postura del autor).",
            "Competencia: Escribe diversos tipos de textos en su lengua materna (adecúa el texto a la situación comunicativa y emplea vocabulario variado).",
            "Enfoque transversal: Orientación al bien común y Enfoque ambiental.",
          ],
        },
        {
          title: "Orientaciones de Adaptación DUA y Diversificación",
          narrative:
            "Estrategias para flexibilizar los materiales y asegurar la participación de todos los estudiantes del aula:",
          key_points: [
            "Principio 1 DUA (Múltiples formas de representación): Textos acompañados de infografías y glosarios explicativos contextualizados.",
            "Principio 2 DUA (Múltiples formas de acción y expresión): Opciones de entrega escrita, esquema gráfico o sustentación oral breve.",
            "Principio 3 DUA (Múltiples formas de implicación): Elección de temas de interés juvenil vinculados a su entorno comunitario.",
          ],
        },
      ],
      teacher_recommendations: [
        "Revisar la concordancia entre los objetivos de la sesión y el recurso seleccionado antes de su reproducción.",
        "Monitorear que el uso de plantillas de conectores no restrinja la creatividad ni la voz propia del estudiante.",
        "Registrar los resultados y adaptaciones exitosas en la bitácora pedagógica para su retroalimentación colegiada.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "recursos/banco-planificacion",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "2° de Secundaria",
      section: "A",
      course: "Comunicación",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "12-recursos-banco-planificacion.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 35-incluimos-estrategias-inclusion", () => {
  it("generates 35-incluimos-estrategias-inclusion.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Guía de Estrategias Pedagógicas para la Inclusión Educativa y Eliminación de Barreras",
      executive_summary:
        "Documento metodológico institucional para 2° de Secundaria en el área de Ciencia y Tecnología. Articula el aprendizaje cooperativo, el trabajo por estaciones y el Diseño Universal para el Aprendizaje (DUA) con el fin de eliminar barreras en el laboratorio escolar y promover la participación plena y equitativa de todo el alumnado.",
      sections: [
        {
          title: "I. Caracterización de la Diversidad y Dinámica del Aula",
          narrative:
            "Diagnóstico socioeducativo del aula (30 estudiantes en total):\n" +
            "• Diversidad identificada: Presencia de ritmos heterogéneos de aprendizaje, dos estudiantes con dificultades en comprensión de textos científicos y un estudiante con baja visión leve.\n" +
            "• Dinámica grupal: Relaciones cordiales pero con tendencia a la formación de subgrupos cerrados durante actividades prácticas de laboratorio.\n" +
            "• Objetivo de inclusión: Implementar el aprendizaje cooperativo estructurado para garantizar que el 100% de estudiantes movilice capacidades de indagación científica.",
          key_points: [
            "Enfoque transversal: Atención a la diversidad y orientación al bien común.",
            "Meta de convivencia: Fomentar la corresponsabilidad pedagógica y la ayuda mutua en equipos heterogéneos.",
          ],
        },
        {
          title: "II. Metodología Central: Estaciones de Aprendizaje Cooperativo",
          narrative:
            "Diseño de una ruta de indagación experimental distribuida en cuatro estaciones simultáneas (15 minutos por estación):\n" +
            "• Estación 1 (Acceso visual y digital): Modelos tridimensionales de células y animaciones científicas con subtítulos claros.\n" +
            "• Estación 2 (Acceso manipulativo y multisensorial): Microscopía óptica con lupas adaptadas y muestras biológicas tangibles.\n" +
            "• Estación 3 (Lectura guiada y glosario): Fichas en lectura fácil, macrotipos (14 pt) y organizadores gráficos causa-efecto.\n" +
            "• Estación 4 (Expresión y debate): Síntesis de conclusiones mediante esquemas visuales, grabaciones breves o informe escrito según elección.",
          key_points: [
            "Flexibilización metodológica: Cada estación ofrece al menos dos formas distintas de acceder a la misma noción científica.",
          ],
        },
        {
          title: "III. Clima de Aula, Convivencia y Tutoría entre Pares",
          narrative:
            "Estrategias para afianzar la cohesión socioemocional y la empatía en el aula inclusiva:\n" +
            "• Roles cooperativos interdependientes: Coordinador de equipo, Gestor de instrumental, Relator de hallazgos y Verificador de consensos (rotación semanal).\n" +
            "• Dinámica de pares solidarios: Acompañamiento cercano en el manejo seguro del instrumental de laboratorio sin generar dependencia.\n" +
            "• Cultura del error formativo: Análisis colectivo de resultados experimentales inesperados como punto de partida para nuevas hipótesis.",
          key_points: [
            "Principio rector: Ningún equipo da por concluida la tarea hasta que todos sus integrantes puedan explicar el procedimiento seguido.",
          ],
        },
        {
          title: "IV. Ajustes de Accesibilidad, Tiempos e Indicadores de Seguimiento",
          narrative:
            "Medidas operativas para derribar barreras físicas y cognitivas:\n" +
            "• Ajustes de accesibilidad: Textos de alto contraste, iluminación focalizada en mesas de trabajo y ampliación óptica de microscopios.\n" +
            "• Flexibilización de tiempos: Concesión de pausas activas breves de 2 minutos para evitar fatiga visual o cognitiva.\n" +
            "• Indicadores observables de inclusión: 100% de participación activa en roles cooperativos, reducción total de episodios de aislamiento y mejora del 35% en argumentación científica.",
          key_points: [
            "Instrumento de monitoreo: Ficha de observación de interacciones inclusivas y lista de cotejo grupal.",
          ],
        },
      ],
      teacher_recommendations: [
        "Monitorear la rotación efectiva de roles en los equipos cooperativos para evitar la sobrecarga del estudiante más aventajado.",
        "Proporcionar retroalimentación inmediata durante la transición entre estaciones de indagación.",
        "Registrar los ajustes exitosos en el anecdotario pedagógico para compartirlos en las jornadas de reflexión del área.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "incluimos/estrategias-inclusion",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "2° de Secundaria",
      section: "B",
      course: "Ciencia y Tecnología / Educación Inclusiva CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "35-incluimos-estrategias-inclusion.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

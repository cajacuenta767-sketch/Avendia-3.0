import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildActivityDocx } from "./exportWorkflowDocx";

describe("QA Generator: 11-recursos-casos-estudio", () => {
  it("generates 11-recursos-casos-estudio.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Dilema de la Gestión del Agua y Desarrollo Sostenible en el Valle de San Lorenzo",
      executive_summary:
        "En una cuenca agrícola costera del norte peruano, la escasez hídrica estacional genera tensiones entre la pequeña agricultura comunal de panllevar, las empresas agroexportadoras de riego presurizado y la demanda de agua potable de los centros urbanos en crecimiento.",
      sections: [
        {
          title: "Presentación del Caso y Narrativa Real",
          narrative:
            "El Valle de San Lorenzo enfrenta uno de los periodos de estiaje más severos de la última década. La represa principal opera al 28% de su capacidad. Los pequeños agricultores denuncian que las grandes empresas agroexportadoras continúan extrayendo agua del subsuelo mediante pozos profundos no autorizados, mientras que la población urbana de Tambogrande sufre racionamiento severo recibiendo agua potable solo 2 horas cada tres días.",
          key_points: [
            "Capacidad actual de la represa: 28% (situación de emergencia hídrica declarada).",
            "Población afectada sin agua continua: 45,000 habitantes urbanos y rurales.",
            "Conflicto de prioridades entre derecho humano al agua y contratos comerciales agroexportadores.",
          ],
        },
      ],
      teacher_recommendations: [
        "Fomentar que los estudiantes analicen el caso desde la perspectiva de todos los actores antes de asumir una postura.",
        "Articular con la competencia CNEB: Gestiona responsablemente los recursos económicos y el ambiente.",
        "Evaluar la viabilidad técnica y el sustento constitucional en la propuesta de solución de cada equipo.",
      ],
      activity: {
        mode: "case_study",
        title: "Estudio de Caso ABP: Gestión Integral de Cuencas Hídricas",
        instructions:
          "Lee atentamente la situación problemática, examina la matriz de actores y responde las 4 preguntas guía de investigación crítica.",
        items: [],
      },
      model: "gemini-3.6-flash",
    };

    const doc = await buildActivityDocx(artifact, {
      workflowKey: "recursos/casos-estudio",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "4° de Secundaria",
      section: "A",
      course: "Ciencias Sociales",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "11-recursos-casos-estudio.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

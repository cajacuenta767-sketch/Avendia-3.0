import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildInstrumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 26-evaluamos-escala-estimacion", () => {
  it("generates 26-evaluamos-escala-estimacion.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Escala de Estimación y Valoración Cualitativa: Trabajo Colaborativo e Indagación Científica",
      executive_summary:
        "Instrumento de estimación del desempeño formativo diseñado para 2° de Secundaria, orientado a valorar de manera progresiva y cualitativa las habilidades socioemocionales y procedimentales de la competencia 'Indaga mediante métodos científicos' durante las sesiones de experimentación y trabajo en equipo.",
      sections: [
        {
          title: "Participación Activa y Compromiso en el Equipo de Indagación",
          narrative:
            "Nivel de involucramiento y corresponsabilidad en el desarrollo de la práctica experimental:",
          key_points: [
            "Muestra iniciativa al formular hipótesis y proponer alternativas viables de indagación.",
            "Asume con puntualidad y responsabilidad el rol asignado dentro del equipo de trabajo.",
            "Utiliza y comparte los materiales de laboratorio respetando estrictamente las normas de bioseguridad.",
          ],
        },
        {
          title: "Rigor Metodológico en el Registro y Manejo de Datos",
          narrative:
            "Sistematicidad en la recolección y análisis de evidencias experimentales:",
          key_points: [
            "Registra sistemáticamente las observaciones cualitativas y mediciones numéricas en tablas ordenadas.",
            "Manipula los instrumentos de medición (balanza analítica, probeta graduada) con pulcritud técnica.",
            "Contrasta los datos experimentales con información científica previa para validar o refutar hipótesis.",
          ],
        },
        {
          title: "Comunicación Asertiva y Construcción Colectiva de Conclusiones",
          narrative:
            "Habilidades dialógicas para consensuar resultados de aprendizaje:",
          key_points: [
            "Sustenta sus explicaciones con base en los datos empíricos recogidos durante el experimento.",
            "Escucha con atención y respeto las objeciones o puntos de vista discordantes de sus compañeros.",
            "Formula conclusiones conjuntas redactadas con coherencia y propiedad disciplinar.",
          ],
        },
      ],
      teacher_recommendations: [
        "Aplicar la escala de estimación al término de cada sesión de indagación para retroalimentar la dinámica de equipo.",
        "Generar un espacio de autovaloración de 5 minutos donde cada equipo contraste su percepción con la del docente.",
        "Utilizar los resultados para conformar grupos heterogéneos que equilibren las fortalezas de los estudiantes.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildInstrumentDocx(artifact, {
      workflowKey: "evaluamos/escala-estimacion",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "2° de Secundaria",
      section: "A",
      course: "Ciencia y Tecnología / Indagación CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "26-evaluamos-escala-estimacion.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

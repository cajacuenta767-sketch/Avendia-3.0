import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 34-incluimos-plan-atencion", () => {
  it("generates 34-incluimos-plan-atencion.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Plan de Atención Individualizado (PAI) para la Diversidad y la Inclusión Educativa",
      executive_summary:
        "Documento normativo institucional de planificación y seguimiento pedagógico para 5° de Primaria. Define la caracterización del estudiante focalizado, sus fortalezas y barreras (BAP), adaptaciones curriculares DUA, metas formativas bimestrales y los compromisos articulados entre la I.E., el equipo SAANEE y la familia.",
      sections: [
        {
          title: "I. Caracterización del Estudiante, Diagnóstico y Antecedentes",
          narrative:
            "Estudiante focal: Camila Nicole Mendoza Huamán · Edad: 10 años · Grado: 5° de Primaria 'A'.\n" +
            "Diagnóstico pedagógico y antecedentes:\n" +
            "• Condición relevante: Condición del Espectro Autista (Nivel 1 - Necesidad de apoyo leve), con hipersensibilidad a sobrecargas sonoras y preferencia por rutinas estructuradas.\n" +
            "• Desempeño actual: Rendimiento destacado en comprensión lectora literal y redacción informativa; requiere acompañamiento en la interpretación de metáforas, ironías y normas sociales implícitas.",
          key_points: [
            "Informe psicopedagógico: Se recomienda uso prioritario de agendas visuales anticipatorias y pausas de descanso sensorial reguladas.",
            "Alcance del plan: Atención individualizada articulada con el aula inclusiva regular.",
          ],
        },
        {
          title: "II. Perfil Funcional, Talentos y Barreras para el Aprendizaje (BAP)",
          narrative:
            "Identificación multidimensional de potencialidades y obstáculos en el entorno escolar:\n" +
            "• Talentos e intereses especiales: Alta memoria visual, pasión por las ciencias espaciales y la botánica, meticulosidad en la presentación de producciones escritas.\n" +
            "• Autonomía y socialización: Interactúa cordialmente en grupos pequeños con roles definidos; necesita mediación docente para iniciar y sostener diálogos espontáneos en espacios abiertos.\n" +
            "• Barreras identificadas (BAP): Ruidos estridentes imprevistos, cambios no avisados de horarios o docentes y consignas orales extensas sin soporte visual.",
          key_points: [
            "Factor clave de éxito: Anticipación clara de la secuencia diaria de actividades mediante panel visual.",
          ],
        },
        {
          title: "III. Medidas DUA y Adaptaciones Curriculares Específicas",
          narrative:
            "Estrategias universales y adaptaciones razonables de acceso y evaluación:\n" +
            "• Medidas DUA: Presentación de consignas segmentadas en listas de verificación numeradas; inclusión de temáticas de astronomía para enganche motivacional; opción de respuestas orales o diagramadas.\n" +
            "• Adaptaciones curriculares: Graduación en la competencia comunicativa: formulación de preguntas con contexto explícito y andamiaje para inferencias de sentido figurado.\n" +
            "• Ajustes de accesibilidad: Ubicación preferencial del pupitre en zona lateral del aula de baja reverberación, uso de audífonos de cancelación de ruido durante recreos ruidosos si lo requiere.",
          key_points: [
            "Evaluación accesible: Tiempos flexibles de entrega y pruebas aplicadas en ambiente calmo y estructurado.",
          ],
        },
        {
          title: "IV. Metas Bimestrales, Compromisos y Articulación Familiar-SAANEE",
          narrative:
            "Cronograma operativo y responsabilidades compartidas:\n" +
            "• Meta Bimestre 1: Gestionar de manera autónoma su horario escolar con agenda visual y participar en 3 debates guiados en equipo.\n" +
            "• Compromisos de la I.E.: Sensibilizar a los compañeros en empatía neurodivergente y respetar los tiempos de autorregulación emocional.\n" +
            "• Compromisos de la Familia: Replicar las pautas de anticipación en las actividades del hogar y mantener registro diario en el cuaderno de enlace.\n" +
            "• Seguimiento SAANEE: Reuniones de asesoría mensual y reajuste trimestral de los apoyos curriculares.",
          key_points: [
            "Fecha de primera revisión oficial del plan: 15 de mayo de 2026.",
          ],
        },
      ],
      teacher_recommendations: [
        "Mantener actualizada la agenda visual diaria al inicio de cada jornada para preservar la estabilidad socioemocional de la estudiante.",
        "Reconocer y valorar públicamente sus talentos e intereses frente a sus pares como factor de inclusión y cohesión grupal.",
        "Evitar la sobreprotección y fomentar progresivamente la toma autónoma de decisiones pedagógicas.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "incluimos/plan-atencion",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "5° de Primaria",
      section: "A",
      course: "Comunicación / Atención a la Diversidad CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "34-incluimos-plan-atencion.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 48-tutoria-plan-tutoria", () => {
  it("generates 48-tutoria-plan-tutoria.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Plan Tutorial de Aula Anual CNEB - Tutoría y Orientación Educativa (TOE)",
      executive_summary:
        "Documento de gestión pedagógica tutorial elaborado de acuerdo a las directivas del CNEB y la RVM N° 212-2020-MINEDU para 3° de Secundaria. Articula el diagnóstico socioafectivo y de convivencia del grupo clase, define los objetivos por dimensiones formativas (personal, social y de los aprendizajes), y programa las acciones de tutoría grupal, acompañamiento individual, orientación familiar y derivación comunitaria.",
      sections: [
        {
          title: "I. Diagnóstico de Necesidades de Orientación y Caracterización del Aula",
          narrative:
            "Diagnóstico socioemocional y grupal de 3° de Secundaria 'B' (32 estudiantes: 17 mujeres y 15 varones):\n" +
            "• Dimensión Personal: 40% del aula manifiesta dificultades en el manejo de la presión de grupo, inseguridad en la autoimagen corporal y conductas de postergación en tareas académicas.\n" +
            "• Dimensión Social y Convivencia: Clima de aula mayoritariamente cordial, aunque se detectan subgrupos cerrados con tendencia a la exclusión sutil y uso inadecuado de redes sociales fuera del horario escolar.\n" +
            "• Dimensión de los Aprendizajes: Necesidad urgente de fortalecer hábitos de organización del tiempo de estudio y técnicas de autorregulación metacognitiva ante evaluaciones.",
          key_points: [
            "Población atendida: 32 estudiantes matriculados en Educación Básica Regular.",
            "Enfoque transversal: Enfoque de derechos, igualdad de género e interculturalidad.",
          ],
        },
        {
          title: "II. Objetivos del Plan por Dimensiones Formativas de la TOE",
          narrative:
            "Propósitos orientadores para el año lectivo 2026:\n" +
            "• Objetivo General: Promover el desarrollo integral y socioafectivo de los estudiantes, fortaleciendo sus habilidades socioemocionales, la convivencia armónica y su proyecto de vida.\n" +
            "• Dimensión Personal: Fomentar el autoconocimiento, la autoestima y la autorregulación emocional mediante talleres vivenciales y debates guiados.\n" +
            "• Dimensión Social: Consolidar una convivencia escolar pacífica, inclusiva y libre de discriminación, promoviendo el liderazgo asertivo y la empatía activa.\n" +
            "• Dimensión de los Aprendizajes: Acompañar el desarrollo de estrategias autónomas de estudio y orientación vocacional temprana.",
          key_points: [
            "Líneas de acción CNEB: Tutoría grupal (hora semanal de tutoría) y tutoría individual permanente.",
          ],
        },
        {
          title: "III. Plan de Acción: Tutoría Grupal, Atención Individual y Alianza con Familias",
          narrative:
            "Estrategias articuladas de acompañamiento durante el año escolar:\n" +
            "• Tutoría Grupal (36 sesiones anuales): Módulos temáticos sobre comunicación asertiva, prevención de adicciones, uso seguro de entornos digitales y proyecto vocacional.\n" +
            "• Tutoría Individual: Entrevistas personalizadas prioritarias con estudiantes en situación de vulnerabilidad o desenganche académico (al menos 2 entrevistas por bimestre).\n" +
            "• Orientación a Familias: 4 escuelas para padres con talleres vivenciales ('Límites con afecto en la adolescencia', 'Prevención de ciberacoso') y entrevistas individuales concertadas.\n" +
            "• Articulación Interinstitucional: Coordinación con el Centro de Salud Mental Comunitario (CSMC) y la DEMUNA local para casos de derivación protegida.",
          key_points: [
            "Frecuencia de tutoría grupal: 2 horas pedagógicas semanales los días miércoles.",
            "Instrumento de registro: Ficha de atención individual y anecdotario del comité TOE.",
          ],
        },
        {
          title: "IV. Cronograma de Implementación Bimestral, Recursos y Sistema de Evaluación",
          narrative:
            "Distribución temporal y seguimiento del plan tutorial:\n" +
            "• I Bimestre: Diagnóstico, conformación del comité de aula y talleres de cohesión grupal y acuerdos de convivencia.\n" +
            "• II Bimestre: Habilidades socioemocionales, manejo del estrés y primera reunión formal con familias.\n" +
            "• III Bimestre: Prevención de riesgos psicosociales y exploración vocacional temprana.\n" +
            "• IV Bimestre: Proyecto de vida, balance anual de logros y festival de talentos comunitarios.\n\n" +
            "Recursos y evaluación:\n" +
            "• Materiales: Guías de tutoría MINEDU, cuadernillo de TOE para el estudiante y material audiovisual interactivo.\n" +
            "• Criterios de evaluación del plan: Nivel de satisfacción de los estudiantes, reducción de incidentes de convivencia y cumplimiento de metas académicas.",
          key_points: [
            "Revisión y balance colegiado: Reunión bimestral de evaluación con la coordinación de tutoría.",
            "Monitoreo institucional: Informe de avance semestral elevado a la Dirección de la I.E.",
          ],
        },
      ],
      teacher_recommendations: [
        "Asegurar un clima de confidencialidad estricta en las entrevistas individuales de tutoría.",
        "Articular permanentemente con los docentes del grado para homologar criterios de manejo conductual positivo.",
        "Derivar de inmediato al protocolo de protección institucional en caso de detectarse cualquier vulneración de derechos.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "tutoria/plan-tutoria",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Lic. Carlos Alberto Ramos",
      directorName: "Lic. Elena Torres Valdivia",
      grade: "3° de Secundaria",
      section: "B",
      course: "Tutoría y Orientación Educativa (TOE) CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "48-tutoria-plan-tutoria.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

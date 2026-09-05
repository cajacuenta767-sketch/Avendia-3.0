import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 50-tutoria-informe-tutoria", () => {
  it("generates 50-tutoria-informe-tutoria.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Informe Técnico Bimestral de Gestión de Tutoría y Orientación Educativa (TOE)",
      executive_summary:
        "Informe oficial de balance tutorial del I Bimestre 2026 para 4° de Secundaria 'B' elaborado conforme a las directivas del CNEB y la RVM N° 212-2020-MINEDU. Consolida el reporte de acciones ejecutadas en tutoría grupal, acompañamiento individual, articulación con familias y seguimiento a casos focalizados.",
      sections: [
        {
          title: "I. Datos de Cobertura, Población Atendida y Caracterización Inicial",
          narrative:
            "• Población Matriculada: 30 estudiantes (16 mujeres y 14 varones) en 4° de Secundaria 'B'.\n" +
            "• Asistencia y Participación Tutorial: 96.8% de permanencia en el I Bimestre.\n" +
            "• Diagnóstico de Entrada: Grupo cohesionado con fortalezas en trabajo colaborativo, pero con un 25% de estudiantes que demandó apoyo específico en gestión del tiempo y autorregulación del uso de dispositivos móviles.",
          key_points: [
            "Periodo informado: I Bimestre (17 de marzo al 23 de mayo de 2026).",
            "Docente Tutor: Lic. Carlos Alberto Ramos.",
          ],
        },
        {
          title: "II. Reporte Consolidado de Acciones Ejecutadas por Líneas de Acción",
          narrative:
            "1. Tutoría Grupal (8 sesiones desarrolladas):\n" +
            "• Sesión 1 y 2: Acuerdos democráticos de convivencia y elección del comité de aula.\n" +
            "• Sesión 3 y 4: Manejo asertivo de la presión de grupo e identidad personal.\n" +
            "• Sesión 5 y 6: Prevención del ciberacoso y huella digital responsable.\n" +
            "• Sesión 7 y 8: Exploración inicial de intereses y proyecto de vida.\n\n" +
            "2. Tutoría Individualizada (6 estudiantes focalizados):\n" +
            "• Se realizaron 12 entrevistas personales con estudiantes en riesgo académico o vulnerabilidad socioafectiva, logrando acuerdos de mejora conductual y académica firmados en actas de compromiso.\n\n" +
            "3. Orientación a las Familias:\n" +
            "• 1 Escuela de Padres presencial con 88% de asistencia: 'Acompañamiento positivo en la adolescencia'.\n" +
            "• 6 entrevistas individuales con apoderados para coordinar apoyos domiciliarios.",
          key_points: [
            "Cobertura grupal: 100% de estudiantes del aula atendidos.",
            "Articulación interinstitucional: 1 caso derivado preventivamente a psicología escolar.",
          ],
        },
        {
          title: "III. Balance Cualitativo: Logros Alcanzados, Dificultades y Medidas Correctivas",
          narrative:
            "• Logros Consolidados: Cero incidentes graves de agresión física o ciberacoso registrados en el periodo; fortalecimiento de la empatía grupal y mejora del 20% en puntualidad general del aula.\n" +
            "• Dificultades Detectadas: Tres estudiantes presentaron ausentismo injustificado intermitente debido a responsabilidades laborales familiares fuera del horario escolar.\n" +
            "• Medidas Remediales Aplicadas: Adecuación de horarios de entrega de actividades, reprogramación evaluativa coordinada con los docentes de área y actas de compromiso suscritas con los apoderados.",
          key_points: [
            "Clima de aula: 92% de valoración positiva en la encuesta de clima tutorial.",
            "Cumplimiento del plan anual: 100% de sesiones programadas para el bimestre.",
          ],
        },
        {
          title: "IV. Conclusiones y Recomendaciones para la Gestión Tutorial del II Bimestre",
          narrative:
            "• Conclusión 1: La tutoría grupal sistemática ha afianzado vínculos protectores y ha reducido notablemente las conductas de exclusión entre pares.\n" +
            "• Recomendación 1: Intensificar las sesiones de orientación vocacional y técnicas de estudio autónomo durante el II Bimestre.\n" +
            "• Recomendación 2: Mantener reuniones bimensuales de coordinación con el equipo de docentes del grado para homologar criterios disciplinarios formativos.\n" +
            "• Recomendación 3: Realizar el seguimiento quincenal a los 3 estudiantes focalizados en asistencia con apoyo de la trabajadora social de la I.E.",
          key_points: [
            "Elevado a: Coordinación de Tutoría y Dirección de la I.E. 0001 República del Perú.",
            "Fecha de presentación: 26 de mayo de 2026.",
          ],
        },
      ],
      teacher_recommendations: [
        "Custodiar el archivo confidencial de las fichas de atención individual en la carpeta tutorial.",
        "Continuar el trabajo preventivo con familias enfatizando límites claros y afecto en el hogar.",
        "Coordinar con la psicóloga de la institución para talleres vivenciales focalizados.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "tutoria/informe-tutoria",
      values: {
        school_year: "2026",
        dre: "DRE Lima Metropolitana",
        ugel: "UGEL 03",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        level: "Secundaria",
        grade: "4° de Secundaria",
        section: "B",
        curricular_area: "Tutoría y Orientación Educativa (TOE)",
        teacher_name: "Lic. Carlos Alberto Ramos",
        director_name: "Lic. Elena Torres Valdivia",
      },
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "50-tutoria-informe-tutoria.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

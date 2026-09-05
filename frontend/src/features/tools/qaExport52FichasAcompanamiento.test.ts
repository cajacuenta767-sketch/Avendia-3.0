import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 52-tutoria-fichas-acompanamiento", () => {
  it("generates 52-tutoria-fichas-acompanamiento.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Ficha Oficial de Acompañamiento y Orientación Socioemocional Tutorial",
      executive_summary:
        "Instrumento técnico de registro y seguimiento de tutoría individualizada elaborado conforme a los lineamientos del CNEB y la RVM N° 212-2020-MINEDU para 3° de Secundaria. Documenta la entrevista de orientación personal, el diagnóstico de necesidades afectivas, las estrategias de soporte y los acuerdos vinculantes asumidos con el estudiante.",
      sections: [
        {
          title: "I. Datos Informativos de la Atención y Motivo de la Entrevista",
          narrative:
            "• Estudiante Atendido: Sebastián Alonso Quispe Mendoza (14 años, 3° de Secundaria 'B').\n" +
            "• Fecha y Modalidad: 28 de mayo de 2026 / Entrevista individual presencial reservada en el ambiente de tutoría.\n" +
            "• Motivo de la Atención: Derivación del docente de Ciencias Sociales por aislamiento recurrente durante los trabajos en equipo, baja repentina en el rendimiento académico y muestras de desmotivación persistente.",
          key_points: [
            "Tipo de atención: Tutoría individual de acompañamiento formativo.",
            "Docente Tutor: Lic. Carlos Alberto Ramos.",
          ],
        },
        {
          title: "II. Indagación Socioafectiva, Escucha Activa y Manifestaciones del Estudiante",
          narrative:
            "Durante la conversación empática y confidencial se recogen los siguientes aspectos relevantes:\n" +
            "• Factores Familiares: El estudiante expresa preocupación y tristeza debido a una reciente reorganización en el hogar por viaje laboral prolongado de su padre.\n" +
            "• Percepción Académica: Manifiesta temor a defraudar a su familia y sobrecarga al asumir tareas domésticas adicionales tras el horario escolar.\n" +
            "• Recursos y Fortalezas: Demuestra autocrítica constructiva, agrado por la lectura científica y voluntad sincera de superar el bache académico.",
          key_points: [
            "Clima de la entrevista: Confianza, escucha no punitiva y respeto a los ritmos del estudiante.",
            "Factor protector: Buena relación afectiva con su madre y tutor.",
          ],
        },
        {
          title: "III. Orientaciones Pedagógicas y Estrategias Socioemocionales Brindadas",
          narrative:
            "El tutor brinda las siguientes pautas formativas graduadas:\n" +
            "• Validación y Autorregulación Emocional: Reconocimiento legítimo de la tristeza como emoción transitoria; práctica guiada de ejercicios de respiración consciente ante momentos de agobio.\n" +
            "• Planificación del Tiempo: Diseño conjunto de un cronograma balanceado que reserve momentos de estudio autónomo (45 min) y espacios indispensables de descanso y recreación.\n" +
            "• Reintegración Social: Pauta para incorporarse voluntariamente a la comisión de organización del periódico mural del aula.",
          key_points: [
            "Enfoque: Orientación centrada en la resiliencia y el bienestar integral.",
            "Técnica aplicada: Reestructuración cognitiva y metas a corto plazo.",
          ],
        },
        {
          title: "IV. Acuerdos y Compromisos Vinculantes, Derivación y Ruta de Seguimiento",
          narrative:
            "Compromisos pactados con el estudiante:\n" +
            "• Compromiso 1: Elaborar y cumplir el horario visual de actividades en casa, reportando su avance al tutor cada viernes.\n" +
            "• Compromiso 2: Comunicar asertivamente a los docentes de área cuando requiera una breve pausa para clarificar dudas de tareas.\n" +
            "• Coordinación y Derivación: Entrevista reservada con la madre de familia programada para el 3 de junio de 2026 a fin de alinear apoyos; no se requiere derivación externa a CSMC en esta etapa.\n" +
            "• Próxima sesión de seguimiento tutorial: Jueves 11 de junio de 2026 (11:00 a.m.).",
          key_points: [
            "Seguimiento: Ficha de monitoreo quincenal en carpeta tutorial.",
            "Carácter del documento: Estricta reserva y custodia pedagógica.",
          ],
        },
      ],
      teacher_recommendations: [
        "Custodiar bajo llave el expediente individual en la carpeta de tutoría institucional.",
        "Verificar discretamente el cumplimiento de los acuerdos sin estigmatizar al estudiante frente al aula.",
        "Mantener comunicación fluida con la madre de familia para monitorear el descanso nocturno.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "tutoria/fichas-acompanamiento",
      values: {
        school_year: "2026",
        dre: "DRE Lima Metropolitana",
        ugel: "UGEL 03",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        level: "Secundaria",
        grade: "3° de Secundaria",
        section: "B",
        curricular_area: "Tutoría y Orientación Educativa (TOE)",
        teacher_name: "Lic. Carlos Alberto Ramos",
        director_name: "Lic. Elena Torres Valdivia",
      },
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "52-tutoria-fichas-acompanamiento.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 47-acompanamos-reporte-seguimiento", () => {
  it("generates 47-acompanamos-reporte-seguimiento.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Informe Técnico de Seguimiento Integral, Acuerdos Formativos y Próximos Pasos",
      executive_summary:
        "Documento pedagógico de seguimiento individualizado para 6° de Primaria. Sistematiza el balance bimestral del acompañamiento académico, socioemocional y familiar del estudiante focalizado, documentando la evolución de sus aprendizajes, las barreras persistentes, los compromisos suscritos por los actores educativos y el cronograma de verificación continua.",
      sections: [
        {
          title: "I. Encuadre del Caso, Tipo de Acompañamiento y Antecedentes",
          narrative:
            "Datos de contextualización y seguimiento continuo (Periodo: Marzo - Mayo 2026):\n" +
            "• Estudiante focalizado: Matías Gabriel Benavides Flores · 11 años · 6° de Primaria 'B'.\n" +
            "• Tipología del seguimiento: Mixto (Académico, Convivencia y Compromisos Familiares).\n" +
            "• Antecedente inicial: Registro de desatención prolongada durante las sesiones de matemática y reiteradas omisiones en la entrega de tareas domiciliarias durante el inicio del año escolar.",
          key_points: [
            "Frecuencia de monitoreo: Registro quincenal en el anecdotario del aula y reporte mensual a coordinación.",
            "Enfoque del plan: Acompañamiento formativo preventivo y desarrollo de hábitos de autonomía responsable.",
          ],
        },
        {
          title: "II. Balance de Avances Cualitativos y Logros Consolidados",
          narrative:
            "Progresos observados tras la aplicación de las estrategias de apoyo diferenciado:\n" +
            "• En el plano socioemocional y de convivencia: Integración armónica en equipos de trabajo cooperativo, mayor apertura para expresar sus emociones y disposición colaborativa en actividades comunales.\n" +
            "• En el plano pedagógico: Incremento significativo en la comprensión de textos narrativos e informativos, demostrando iniciativa destacada en proyectos de indagación científica escolar.\n" +
            "• Hábitos escolares: Puntualidad sostenida en el horario de ingreso y cumplimiento en la entrega de materiales de trabajo del aula.",
          key_points: [
            "Competencias fortalecidas: Convive y participa democráticamente e Indaga mediante métodos científicos.",
          ],
        },
        {
          title: "III. Dificultades Persistentes y Nudos Críticos de Aprendizaje",
          narrative:
            "Aspectos que aún requieren andamiaje y supervisión concertada:\n" +
            "• Área Matemática: Dificultad para formular operaciones con fracciones y decimales en situaciones cotidianas, recurriendo al tanteo sin justificación escrita.\n" +
            "• Rutina domiciliaria: La familia reporta dificultades para retirar los dispositivos electrónicos (videojuegos) después de las 9:00 p.m., lo que genera fatiga matutina ocasional en el aula.\n" +
            "• Autocontrol en evaluaciones: Tendencia a la impaciencia para revisar las respuestas antes de entregar la prueba escrita.",
          key_points: [
            "Medida correctiva: Proporcionar tarjetas mnemotécnicas de fracciones y pactar horario de desconexión en el hogar.",
          ],
        },
        {
          title: "IV. Compromisos Suscritos, Responsabilidades y Ruta de Próximos Pasos",
          narrative:
            "Acuerdos vinculantes formalizados entre la escuela, el estudiante y la familia:\n" +
            "• Compromiso del estudiante: Revisar minuciosamente sus procedimientos matemáticos durante 5 minutos adicionales antes de entregar la ficha y colocar su teléfono celular fuera de la habitación a las 8:30 p.m.\n" +
            "• Compromiso de la familia: Supervisar la lectura diaria de 20 minutos, firmar semanalmente la agenda de control y asegurar 9 horas de descanso nocturno.\n" +
            "• Compromiso del docente tutor: Brindar 30 minutos semanales de asesoría matemática guiada en contraturno y mantener comunicación fluida con los apoderados.\n\n" +
            "Cronograma de verificación:\n" +
            "• Fecha de próxima revisión colegiada: 26 de junio de 2026.",
          key_points: [
            "Responsables: Docente de aula, Sres. Padres de Familia y Estudiante.",
            "Canal de seguimiento: Cuaderno de control pedagógico y entrevista quincenal breve.",
          ],
        },
      ],
      teacher_recommendations: [
        "Mantener un registro anecdotario detallado de cada entrevista individual para contar con evidencia formativa sólida.",
        "Reforzar positivamente cada logro en cálculo numérico para reconstruir la autoeficacia matemática del estudiante.",
        "Remitir copia del presente informe al archivo del comité de tutoría de la Institución Educativa.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "acompanamos/reporte-seguimiento",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Gladys Ramos Espinoza",
      directorName: "Lic. Elena Torres Valdivia",
      grade: "6° de Primaria",
      section: "B",
      course: "Tutoría y Acompañamiento Integral CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "47-acompanamos-reporte-seguimiento.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

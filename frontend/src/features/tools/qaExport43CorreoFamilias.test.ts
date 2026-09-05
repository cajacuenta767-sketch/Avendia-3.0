import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildCommunicationDocx } from "./exportWorkflowDocx";

describe("QA Generator: 43-acompanamos-correo-familias", () => {
  it("generates 43-acompanamos-correo-familias.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Comunicación Oficial a Familias: Informe de Progreso y Citación a Entrevista Formativa",
      executive_summary:
        "Comunicación institucional dirigida a los padres de familia y apoderados de 4° de Primaria. Presenta un balance cualitativo del avance académico y socioemocional de la estudiante, destaca sus fortalezas en expresión comunicativa, identifica oportunidades de mejora en hábitos de estudio autónomo e invita formalmente a una entrevista pedagógica individual con el equipo docente.",
      sections: [
        {
          title: "I. Estimada Familia y Saludo Institucional",
          narrative:
            "Estimados señores Valdivia Mendoza, padres de la estudiante Sofía Valdivia Mendoza (4° 'B'):\n" +
            "Reciban un cordial y afectuoso saludo en nombre de la comunidad educativa de la I.E. 0001 República del Perú. A través de la presente misiva, deseamos compartir con ustedes una valoración formativa del desempeño escolar y desarrollo socioafectivo de su menor hija durante el presente bimestre, reafirmando nuestro compromiso compartido de acompañar su formación integral con cercanía y respeto.",
          key_points: [
            "Destinatario formal: Sres. Fernando Valdivia y Rosa Mendoza (Apoderados).",
            "Propósito: Fortalecer la alianza escuela-familia mediante una comunicación transparente y orientadora.",
          ],
        },
        {
          title: "II. Logros Destacados y Fortalezas Observadas",
          narrative:
            "En el ámbito pedagógico y de convivencia escolar, destacamos con especial satisfacción:\n" +
            "• Creatividad y expresión oral: Sofía demuestra gran elocuencia al formular opiniones en debates de aula y muestra un talento notable para la producción plástica y el dibujo.\n" +
            "• Empatía y compañerismo: Su trato hacia sus compañeros es siempre respetuoso, colaborativo y solidario, fomentando un clima de aula armonioso.\n" +
            "• Curiosidad investigativa: Manifiesta entusiasmo e iniciativa ante las actividades prácticas de indagación en Ciencia y Tecnología.",
          key_points: [
            "Competencias fortalecidas: Se comunica oralmente en su lengua materna y Convive y participa democráticamente.",
          ],
        },
        {
          title: "III. Oportunidades de Mejora y Recomendaciones de Acompañamiento",
          narrative:
            "Para afianzar su crecimiento integral, identificamos los siguientes aspectos que requieren nuestro apoyo conjunto:\n" +
            "• Organización del tiempo de estudio: Presenta desatención eventual ante instrucciones de trabajo individual prolongado, demorando en el inicio de las actividades escritas.\n" +
            "• Cumplimiento regular de tareas: En las últimas tres semanas se han registrado omisiones en la entrega oportuna de evidencias del área de Matemática.\n" +
            "• Pauta recomendada para casa: Establecer un horario vespertino fijo de 40 minutos para el estudio, libre de distracciones de pantallas o televisión, verificando juntos la agenda escolar.",
          key_points: [
            "Estrategia de apoyo: Dosificar las actividades complejas en metas cortas y validar cada logro alcanzado.",
          ],
        },
        {
          title: "IV. Citación a Entrevista Pedagógica Individual y Confirmación",
          narrative:
            "A fin de acordar compromisos comunes que beneficien el aprendizaje de Sofía, los convocamos cordialmente a una entrevista pedagógica presencial:\n" +
            "• Fecha: Viernes 29 de mayo de 2026.\n" +
            "• Hora: 3:30 p.m. a 4:15 p.m.\n" +
            "• Lugar: Sala de Tutoría y Orientación Educativa (2° piso del pabellón principal).\n\n" +
            "Agradecemos devolver el talón inferior debidamente firmado a través del cuaderno de control a más tardar el miércoles 27 de mayo.",
          key_points: [
            "Canal de atención docente: Horario de atención a padres: martes y jueves de 3:00 p.m. a 4:00 p.m.",
            "Talón de acuse de recibo: Línea de corte institucional para archivo en la carpeta tutorial.",
          ],
        },
      ],
      teacher_recommendations: [
        "Revisar diariamente la agenda escolar y firmar el cuaderno de control al término de la jornada.",
        "Generar un clima de confianza en el hogar escuchando las vivencias cotidianas de la estudiante sin juicios precipitados.",
        "Asistir con puntualidad a la entrevista programada para consolidar el plan de apoyo conjunto.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildCommunicationDocx(artifact, {
      workflowKey: "acompanamos/correo-familias",
      values: {
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        teacher_name: "Prof. Rosa Gutiérrez Paz",
        director_name: "Lic. Elena Torres Valdivia",
        grade: "4° de Primaria",
        section: "B",
        curricular_area: "Comunicación y Tutoría CNEB",
        guardian_name: "Sres. Fernando Valdivia y Rosa Mendoza",
        student_name: "Sofía Valdivia Mendoza",
      },
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "43-acompanamos-correo-familias.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

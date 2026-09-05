import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildCommunicationDocx } from "./exportWorkflowDocx";

describe("QA Generator: 51-tutoria-informe-padres", () => {
  it("generates 51-tutoria-informe-padres.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Informe Individual a las Familias: Balance Formativo y Compromisos de Tutoría",
      executive_summary:
        "Comunicación oficial a los padres de familia y apoderados de la estudiante Valeria Andrea Morales Castro (2° de Secundaria 'A') emitida por la tutoría escolar en coordinación con la Dirección de la I.E. 0001 República del Perú. Informa los avances socioemocionales, logros de aprendizaje y pautas de acompañamiento domiciliario con talón desglosable de cargo firmado.",
      sections: [
        {
          title: "I. Saludo Institucional y Propósito Formativo del Encuentro",
          narrative:
            "Estimados señores Morales Castro:\n" +
            "Reciban el saludo afectuoso y cordial del equipo tutorial y directivo de la I.E. 0001 República del Perú. La presente comunicación tiene por objetivo compartir con ustedes una valoración cualitativa integral del proceso educativo y socioemocional de su menor hija Valeria, destacando sus logros consolidados y estableciendo acuerdos formativos compartidos para potenciar su bienestar integral.",
          key_points: [
            "Estudiante: Valeria Andrea Morales Castro (13 años).",
            "Modalidad de atención: Entrevista presencial de tutoría familiar.",
          ],
        },
        {
          title: "II. Logros Socioafectivos y Potencialidades Observadas en el Aula",
          narrative:
            "• Dimensión Personal: Valeria demuestra una alta sensibilidad empática, solidaridad espontánea con sus compañeras y notable capacidad de liderazgo positivo en dinámicas de equipo.\n" +
            "• Dimensión Académica: Muestra un desempeño sobresaliente en las áreas de Comunicación y Arte y Cultura, expresando sus ideas con claridad y creatividad argumentativa.\n" +
            "• Convivencia Escolar: Cumple responsablemente los acuerdos de convivencia y promueve la resolución pacífica de desacuerdos cotidianos en el grupo.",
          key_points: [
            "Clima relacional: Alta integración y respeto en su grupo de pares.",
            "Participación: Intervención activa en proyectos comunitarios escolares.",
          ],
        },
        {
          title: "III. Aspectos de Acompañamiento Prioritario y Pautas para el Hogar",
          narrative:
            "Con la finalidad de consolidar su desarrollo armónico, se recomienda brindar soporte específico en los siguientes aspectos:\n" +
            "• Organización del Tiempo Domiciliario: Establecer una rutina predecible de estudio de 45 minutos diarios sin distractores tecnológicos (notificaciones de celular/redes sociales).\n" +
            "• Gestión de la Autoexigencia: Fomentar en el hogar espacios de diálogo donde se valore el esfuerzo y el error como oportunidad de aprendizaje, disminuyendo la ansiedad ante exámenes de Matemática.\n" +
            "• Comunicación Abierta: Mantener conversaciones diarias sobre sus vivencias escolares basadas en la escucha activa y la validación afectiva.",
          key_points: [
            "Estrategia clave: Horario visual de tareas colocado en un lugar visible de la casa.",
            "Acompañamiento emocional: Refuerzo positivo ante logros cotidianos.",
          ],
        },
        {
          title: "IV. Acuerdos Suscritos, Canales de Contacto y Próxima Verificación",
          narrative:
            "Compromisos asumidos en la entrevista del 27 de mayo de 2026:\n" +
            "• Por la Familia: Supervisar el cumplimiento del horario de descanso nocturno (dormir al menos 8 horas) y firmar la agenda escolar diariamente.\n" +
            "• Por la Institución Educativa: Realizar seguimiento quincenal de su evolución académica en Matemática y brindar retroalimentación reflexiva semanal.\n" +
            "• Próxima fecha de contacto y revisión de compromisos: Viernes 26 de junio de 2026.\n" +
            "Canal de atención docente: Miércoles de 11:30 a.m. a 12:30 p.m. previa cita.",
          key_points: [
            "Atención docente: Horario colegiado de atención a familias.",
            "Firma de cargo: Requisito de devolución obligatoria del talón inferior.",
          ],
        },
      ],
      teacher_recommendations: [
        "Archivar una copia de la presente comunicación en el anecdotario del comité TOE.",
        "Monitorear la entrega del talón de cargo debidamente firmado por el apoderado dentro de las 48 horas.",
        "Articular con el docente de Matemática para registrar los progresos en la carpeta de refuerzo.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildCommunicationDocx(artifact, {
      workflowKey: "tutoria/informe-padres",
      values: {
        school_year: "2026",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        guardian_name: "Sres. Roberto Morales y Carmen Castro",
        student_name: "Valeria Andrea Morales Castro",
        grade: "2° de Secundaria",
        section: "A",
        meeting_date: "27 de mayo de 2026",
        discussed_situation: "Balance socioemocional y pautas de acompañamiento en el hogar.",
        teacher_name: "Lic. Carlos Alberto Ramos",
        director_name: "Lic. Elena Torres Valdivia",
      },
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "51-tutoria-informe-padres.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

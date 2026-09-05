import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildCommunicationDocx } from "./exportWorkflowDocx";

describe("QA Generator: 36-incluimos-trabajo-familias", () => {
  it("generates 36-incluimos-trabajo-familias.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Acta de Compromiso y Orientaciones para el Acompañamiento Inclusivo en el Hogar",
      executive_summary:
        "Documento institucional de vinculación formativa entre la escuela y el hogar para 3° de Primaria. Registra el diálogo sostenido en la entrevista individual con la madre de familia, las barreras identificadas en casa, las pautas psicopedagógicas acordadas para el estudio diario y el cronograma de seguimiento coordinado.",
      sections: [
        {
          title: "I. Diagnóstico Compartido y Puntos Tratados en el Encuentro",
          narrative:
            "Encuentro individual sostenido con la madre de familia, Sra. Carmen Quispe de Morales, en relación al estudiante Sebastián Morales Quispe (3° 'A'):\n" +
            "• Avances observados: El estudiante demuestra progresos notables en expresión oral y buena disposición para integrarse en dinámicas lúdicas de equipo.\n" +
            "• Barreras identificadas en el hogar: Dificultad para iniciar las tareas escolares de forma autónoma debido a la cercanía de dispositivos digitales distractores (televisión y celular) y fatiga por horarios tardíos de estudio.\n" +
            "• Acuerdos de encuadre: Reconocer la importancia de rutinas predecibles y reforzar la confianza del estudiante mediante elogios a su esfuerzo.",
          key_points: [
            "Modalidad del encuentro: Entrevista pedagógica presencial individual.",
            "Objetivo central: Consolidar hábitos de estudio saludables y autorregulación en casa.",
          ],
        },
        {
          title: "II. Pautas de Organización de Rutinas y Estudio en el Hogar",
          narrative:
            "Recomendaciones prácticas adaptadas a la dinámica familiar:\n" +
            "• Espacio de aprendizaje: Disponer una mesa despejada, bien iluminada y libre de pantallas encendidas durante los 35 minutos destinados al refuerzo escolar.\n" +
            "• Horario fijo: Establecer un horario vespertino regular (de 4:30 p.m. a 5:15 p.m.) con una pausa activa de hidratación a la mitad de la sesión.\n" +
            "• Soporte motivacional: Fraccionar las tareas extensas en dos pasos simples y felicitar la culminación de cada bloque antes de pasar al juego.",
          key_points: [
            "Descanso nocturno: Asegurar al menos 9 horas continuas de sueño para favorecer la consolidación de la memoria y la atención diurna.",
          ],
        },
        {
          title: "III. Compromisos Específicos Asumidos por la Familia",
          narrative:
            "Acuerdos firmados por la madre de familia para su cumplimiento cotidiano:\n" +
            "• Revisar diariamente el cuaderno de control y firmar las comunicaciones escolares al regresar a casa.\n" +
            "• Destinar 15 minutos diarios a la lectura compartida de cuentos ilustrados, dialogando sobre las acciones de los personajes.\n" +
            "• Fomentar la autonomía personal permitiendo que Sebastián prepare su mochila y uniforme la noche anterior.",
          key_points: [
            "Compromiso escolar complementario: El docente tutor adaptará las consignas escritas para facilitar su lectura autónoma en el hogar.",
          ],
        },
        {
          title: "IV. Canales de Comunicación y Fecha de Próxima Revisión",
          narrative:
            "Pautas para mantener un contacto fluido, respetuoso y oportuno:\n" +
            "• Canal prioritario: Cuaderno de control pedagógico para avisos cotidianos y número telefónico institucional para emergencias justificadas.\n" +
            "• Frecuencia de reporte: Registro semanal de desempeño en el cuaderno de enlace y llamada quincenal de retroalimentación breve.\n" +
            "• Próximo encuentro de evaluación: 22 de mayo de 2026 para revisar el impacto de las rutinas domiciliarias.",
          key_points: [
            "Talón de confirmación: La familia suscribe el talón inferior y lo remite firmado al aula para constancia en el legajo de tutoría.",
          ],
        },
      ],
      teacher_recommendations: [
        "Mantener una comunicación empática y constructiva, priorizando el reconocimiento de pequeños logros sobre el reporte de dificultades.",
        "Coordinar con los docentes de áreas especiales para garantizar la aplicación coherente de las mismas pautas de apoyo.",
        "Archivar el acta en el portafolio de trabajo con familias del comité de tutoría de la institución educativa.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildCommunicationDocx(artifact, {
      workflowKey: "incluimos/trabajo-familias",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      directorName: "Lic. Elena Torres Valdivia",
      studentName: "Sebastián Morales Quispe",
      guardianName: "Sra. Carmen Quispe de Morales",
      grade: "3° de Primaria",
      section: "A",
      course: "Tutoría / Trabajo con Familias CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "36-incluimos-trabajo-familias.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

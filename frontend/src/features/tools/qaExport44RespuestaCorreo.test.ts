import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildCommunicationDocx } from "./exportWorkflowDocx";

describe("QA Generator: 44-acompanamos-respuesta-correo", () => {
  it("generates 44-acompanamos-respuesta-correo.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Respuesta Pedagógica a Consulta de Apoderado: Evaluación Formativa CNEB y Progreso Curricular",
      executive_summary:
        "Respuesta institucional y formativa emitida por la tutoría de 2° de Secundaria a la consulta formal remitida por la madre de familia. Brinda una explicación clara, fundamentada en la RVM N° 094-2020-MINEDU, sobre los criterios de la escala de calificación cualitativa (AD, A, B, C), detalla las evidencias evaluadas en el área de Ciencias Sociales y plantea acuerdos pedagógicos conjuntos.",
      sections: [
        {
          title: "I. Consulta Recibida y Encuadre Institucional",
          narrative:
            "En atención a la consulta recibida el 26 de mayo por parte de la Sra. Patricia Salazar Villegas, apoderada del estudiante Joaquín Mendoza Salazar (2° 'C'):\n" +
            "• Consulta planteada: Inquietud sobre la calificación 'B' consignada en el informe de progreso de Ciencias Sociales y solicitud de equivalencia numérica con el sistema vigesimal anterior.\n" +
            "• Propósito institucional: Atender de manera oportuna, empática y transparente la inquietud de la familia, clarificando el sentido pedagógico de la evaluación auténtica centrada en competencias.",
          key_points: [
            "Estudiante: Joaquín Mendoza Salazar · 2° de Secundaria 'C'.",
            "Marco regulatorio: Currículo Nacional de la Educación Básica (CNEB) y RVM N° 094-2020-MINEDU.",
          ],
        },
        {
          title: "II. Fundamentación Pedagógica del Nivel de Logro Alcanzado",
          narrative:
            "Esclarecimiento técnico del estado de aprendizaje de Joaquín en el I Bimestre:\n" +
            "• Competencia evaluada: Construye interpretaciones históricas.\n" +
            "• Nivel 'En Proceso' (B): Indica que el estudiante se encuentra próximo o cerca al nivel esperado, demostrando comprensión básica pero requiriendo acompañamiento para contrastar fuentes primarias diversas y fundamentar causas complejas.\n" +
            "• Sentido de la evaluación cualitativa: En el marco del CNEB, las calificaciones no son castigos ni etiquetas numéricas, sino brújulas de navegación formativa que identifican con exactitud qué habilidades necesitan andamiaje pedagógico continuo.",
          key_points: [
            "Evidencia analizada: Ensayo histórico sobre el Tahuantinsuyo y organizador de fuentes históricas.",
            "Fortaleza destacada: Excelente participación oral y capacidad analítica en debates grupales.",
          ],
        },
        {
          title: "III. Plan de Acompañamiento y Acuerdos de Aprendizaje",
          narrative:
            "Acciones remediales y formativas acordadas por el docente para el II Bimestre:\n" +
            "• Estrategia de andamiaje: Proporcionar a Joaquín guías estructuradas de lectura de fuentes históricas con preguntas orientadoras escalonadas.\n" +
            "• Oportunidad de mejora de evidencia: El estudiante podrá reescribir y enriquecer su ensayo histórico integrando las observaciones formativas brindadas en la rúbrica analítica.\n" +
            "• Apoyo en el hogar solicitado: Estimular conversaciones sobre hechos de actualidad y verificar que revise las fuentes bibliográficas recomendadas en clase.",
          key_points: [
            "Fecha límite de nueva evidencia: Viernes 12 de junio de 2026.",
            "Modalidad de seguimiento: Retroalimentación reflexiva quincenal en horario de tutoría.",
          ],
        },
        {
          title: "IV. Canales de Coordinación y Conclusión Institucional",
          narrative:
            "Agradecemos profundamente su constante preocupación por el crecimiento educativo de Joaquín. Reiteramos nuestra absoluta disposición a dialogar de manera directa y presencial:\n" +
            "• Horario de atención a padres: Miércoles de 3:30 p.m. a 4:30 p.m., previa cita en coordinación pedagógica.\n" +
            "• Notificación y constancia: Solicitamos firmar el talón inferior y remitirlo con el estudiante para archivo formal en su portafolio tutorial.",
          key_points: [
            "Compromiso compartido: Garantizar que Joaquín alcance el nivel 'Logro Esperado' (A) al cierre del ciclo.",
          ],
        },
      ],
      teacher_recommendations: [
        "Fomentar la lectura analítica en el hogar a través de preguntas de contraste ('¿por qué ocurrió?', '¿quién opina distinto?').",
        "Valorar el progreso sostenido del estudiante evitando comparaciones numéricas tradicionales.",
        "Devolver el talón desglosable firmado para confirmar la recepción conforme del presente informe.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildCommunicationDocx(artifact, {
      workflowKey: "acompanamos/respuesta-correo",
      values: {
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        teacher_name: "Lic. Roberto Casas Paredes",
        director_name: "Lic. Elena Torres Valdivia",
        grade: "2° de Secundaria",
        section: "C",
        curricular_area: "Ciencias Sociales y Tutoría CNEB",
        guardian_name: "Sra. Patricia Salazar Villegas",
        student_name: "Joaquín Mendoza Salazar",
      },
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "44-acompanamos-respuesta-correo.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import { buildActivityDocx, type WorkflowArtifact } from "./exportWorkflowDocx";

describe("QA Generator: 03-recursos-emparejar-palabras", () => {
  it("generates 03-recursos-emparejar-palabras.docx and saves to exports-qa-word directory", async () => {
    const artifact: WorkflowArtifact = {
      document_title: "Ficha de Aplicación: Emparejar Derechos y Deberes del Niño",
      executive_summary: "Actividad de relación de conceptos y casos para 3° de Primaria sobre los Derechos Fundamentales de la Infancia.",
      sections: [
        {
          title: "Instrucciones",
          narrative: "Relaciona los derechos de la Columna A con las situaciones de la Columna B colocando la letra correspondiente dentro del paréntesis.",
          key_points: [
            "Derecho a la Identidad",
            "Derecho a la Educación",
            "Derecho a la Salud",
            "Derecho a la Recreación",
            "Derecho a la Protección",
            "Derecho a la Participación",
          ],
        },
      ],
      teacher_recommendations: [
        "Iniciar con un diálogo reflexivo sobre los derechos en la vida cotidiana de los niños.",
        "Aclarar dudas sobre el significado de cada término antes de la resolución individual.",
        "Verificar las respuestas usando el solucionario desglosable.",
      ],
      activity: {
        mode: "emparejar",
        title: "Relaciona los Derechos del Niño con su Significado",
        instructions: "Lee con atención cada derecho de la Columna A y escribe su letra dentro del paréntesis de la Columna B que le corresponda.",
        items: [
          {
            id: "1",
            prompt: "Contar con un nombre, apellidos propios y una nacionalidad reconocida desde el nacimiento.",
            answer: "DERECHO A LA IDENTIDAD",
            hint: "Garantiza la inscripción legal inmediata en el registro civil.",
            options: [],
          },
          {
            id: "2",
            prompt: "Asistir a la escuela, aprender y desarrollar plenamente todas nuestras capacidades intelectuales y humanas.",
            answer: "DERECHO A LA EDUCACIÓN",
            hint: "Promueve el acceso universal a la formación escolar gratuita y de calidad.",
            options: [],
          },
          {
            id: "3",
            prompt: "Recibir atención médica oportuna, vacunas preventivas y cuidados médicos si nos enfermamos.",
            answer: "DERECHO A LA SALUD",
            hint: "Asegura el bienestar físico, mental y el desarrollo saludable de la infancia.",
            options: [],
          },
          {
            id: "4",
            prompt: "Disponer de tiempo libre para descansar, jugar sanamente, realizar deportes y divertirnos con amigos.",
            answer: "DERECHO A LA RECREACIÓN",
            hint: "El juego es vital para el desarrollo social y emocional de los niños.",
            options: [],
          },
          {
            id: "5",
            prompt: "Vivir en un entorno familiar y comunitario seguro, protegidos de toda violencia, maltrato o explotación laboral.",
            answer: "DERECHO A LA PROTECCIÓN",
            hint: "El Estado y la sociedad deben cuidar la integridad física y moral del menor.",
            options: [],
          },
          {
            id: "6",
            prompt: "Expresar nuestras opiniones con libertad y ser escuchados con respeto y consideración por los adultos.",
            answer: "DERECHO A LA PARTICIPACIÓN",
            hint: "La voz del niño debe ser valorada en las decisiones que le afectan.",
            options: [],
          },
        ],
      },
      model: "gemini-3.6-flash",
    };

    const options = {
      workflowKey: "recursos/emparejar-palabras",
      values: {
        level: "Primaria",
        grade: "3°",
        section: "A",
        area: "Personal Social",
        ie: "I.E. 0001 República del Perú",
        teacher: "Prof. Rosa Quispe Alarcón",
        year: 2026,
      },
    };

    const doc = buildActivityDocx(artifact, options);
    const buffer = await Packer.toBuffer(doc);

    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "03-recursos-emparejar-palabras.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

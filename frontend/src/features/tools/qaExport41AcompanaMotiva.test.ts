import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 41-reforzamos-acompana-motiva", () => {
  it("generates 41-reforzamos-acompana-motiva.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Plan de Acompañamiento Socioemocional, Micro-Metas y Motivación Escolar",
      executive_summary:
        "Documento institucional de tutoría y orientación educativa (TOE) para 1° de Secundaria. Articula la caracterización del estado socioafectivo del estudiante focalizado frente a episodios de ansiedad y frustración en la transición a secundaria, definiendo micro-metas progresivas, canales de reconocimiento positivo y mensajes formativos articulados con el hogar.",
      sections: [
        {
          title: "I. Lectura Socioemocional, Estado Inicial y Detonantes",
          narrative:
            "Estudiante focal: Diego Alonso Quispe Huanca · 12 años · 1° de Secundaria 'B'.\n" +
            "Diagnóstico socioemocional:\n" +
            "• Estado recurrente: Ansiedad y bloqueo emocional transitorio ante evaluaciones escritas o tareas extensas de cálculo numérico.\n" +
            "• Detonantes identificados: Temor al error público y comparación con pares durante la adaptación al ritmo de la secundaria.\n" +
            "• Factores protectores: Actitud respetuosa, afición por el dibujo técnico y los deportes, y alta receptividad a la orientación docente.",
          key_points: [
            "Frecuencia de las manifestaciones: Ocurrencia semanal asociada a momentos de evaluación sumativa.",
            "Enfoque del plan: Fortalecimiento de la autoeficacia y mentalidad de crecimiento.",
          ],
        },
        {
          title: "II. Fortalezas, Intereses y Recursos Personales",
          narrative:
            "Potencialidades identificadas para apalancar la motivación intrínseca:\n" +
            "• Talentos e intereses: Gran capacidad para la representación gráfica y esquemática, disciplina en entrenamientos deportivos y lealtad grupal.\n" +
            "• Dinámica del hogar: Padres comprometidos que requieren orientación para transformar la exigencia de calificaciones en refuerzo del esfuerzo.\n" +
            "• Vínculo con el tutor: Confianza establecida que permite el diálogo honesto sobre sus emociones escolares.",
          key_points: [
            "Oportunidad pedagógica: Utilizar organizadores visuales y analogías deportivas para explicar conceptos abstractos.",
          ],
        },
        {
          title: "III. Plan de Micro-Metas y Reconocimiento Positivo",
          narrative:
            "Estrategia de metas cortas y alcanzables para reconstruir la confianza académica:\n" +
            "• Micro-meta 1: Resolver de forma autónoma dos ejercicios iniciales en cada sesión antes de consultar al docente o compañero.\n" +
            "• Micro-meta 2: Formular una pregunta en voz alta por semana para despejar dudas, normalizando la consulta como acto de aprendizaje.\n" +
            "• Modalidad de reconocimiento: Conversación reflexiva breve al término de la semana y notas adhesivas con mensajes de aliento en sus tareas.",
          key_points: [
            "Criterio de éxito: Celebrar el proceso de indagación y la constancia por encima del resultado inmediato.",
          ],
        },
        {
          title: "IV. Mensajes Formativos, Compromiso Familiar y Seguimiento",
          narrative:
            "Acciones conjuntas de acompañamiento socioafectivo:\n" +
            "• Mensaje inspirador para Diego: 'Tu perseverancia y talento para el dibujo demuestran que tienes la fuerza para superar cualquier reto. Equivocarse es la forma más valiente de aprender.'\n" +
            "• Orientaciones para la familia: Dedicar 15 minutos diarios a conversar sobre sus emociones sin centrarse únicamente en las notas, celebrando sus pequeños avances.\n" +
            "• Fecha de revisión de metas: 29 de mayo de 2026.",
          key_points: [
            "Monitoreo formativo: Reunión mensual de retroalimentación con la familia y ficha de seguimiento tutorial.",
          ],
        },
      ],
      teacher_recommendations: [
        "Evitar exponer al estudiante a situaciones de presión pública en la pizarra hasta consolidar su seguridad personal.",
        "Coordinar con los docentes de las distintas áreas para homologar las pautas de aliento y validación emocional.",
        "Documentar los cambios actitudinales en el anecdotario del comité de tutoría institucional.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "reforzamos/acompanamiento-motivacion",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      directorName: "Lic. Elena Torres Valdivia",
      grade: "1° de Secundaria",
      section: "B",
      course: "Tutoría y Orientación Educativa (TOE) CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "41-reforzamos-acompana-motiva.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

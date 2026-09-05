import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 55-tutoria-orientacion-vocacional", () => {
  it("generates 55-tutoria-orientacion-vocacional.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Plan y Ruta Integral de Orientación Vocacional: Construcción del Proyecto de Vida",
      executive_summary:
        "Documento de orientación vocacional y ocupacional diseñado para 5° de Secundaria bajo las directivas del CNEB y la RVM N° 212-2020-MINEDU. Proporciona una ruta metodológica estructurada para la exploración de intereses, la identificación de habilidades y la toma informada de decisiones formativas y profesionales con proyección comunitaria.",
      sections: [
        {
          title: "I. Síntesis del Perfil Vocacional, Intereses y Fortalezas Personales",
          narrative:
            "• Estudiante Focalizado: Leonardo Fabricio Vega Chumpitaz (16 años, 5° de Secundaria 'A').\n" +
            "• Intereses Predominantes: Fuerte inclinación hacia el razonamiento computacional, la robótica educativa, la optimización de procesos y el impacto ambiental positivo.\n" +
            "• Fortalezas Académicas y Socioemocionales: Rendimiento destacado en Matemática y Ciencia y Tecnología; habilidades sobresalientes de pensamiento crítico, resolución de problemas complejos y perseverancia en tareas demandantes.\n" +
            "• Valores y Motivaciones: Alto sentido de responsabilidad social, deseo de retribuir a su comunidad y aspiración a la innovación tecnológica sostenible.",
          key_points: [
            "Población atendida: Promoción 2026 de Educación Básica Regular.",
            "Tutor / Orientador Vocacional: Lic. Carlos Alberto Ramos.",
          ],
        },
        {
          title: "II. Áreas Vocacionales Compatibles y Exploración de Oferta Formativa",
          narrative:
            "1. Familias Profesionales Priorizadas:\n" +
            "• Opción 1: Ingeniería de Sistemas / Ciencia de la Computación (Universidad Nacional Mayor de San Marcos o UNI).\n" +
            "• Opción 2: Ingeniería Mecatrónica y Automatización Industrial (Institutos Tecnológicos licenciados / SENATI / TECSUP).\n" +
            "• Opción 3: Biotecnología y Gestión Ambiental.\n\n" +
            "2. Análisis de Viabilidad y Oportunidades:\n" +
            "• Modalidad de Ingreso: Postulación a la convocatoria Beca 18 (Modalidad Ordinaria / Rendimiento Académico en tercio superior acreditado en SIAGIE).\n" +
            "• Consulta de Plataformas Oficiales: Indagación en el portal 'Mi Carrera' del MTPE y revisión de licenciamiento institucional SUNEDU.",
          key_points: [
            "Criterio de elección: Coherencia vocacional, alta empleabilidad formal y vocación de servicio.",
            "Fuentes consultadas: Portal 'Mi Carrera' (MTPE) y catálogo PRONABEC.",
          ],
        },
        {
          title: "III. Ruta de Exploración Activa y Plan de Próximos Pasos (Corto y Mediano Plazo)",
          narrative:
            "Cronograma de actividades para la toma informada de decisiones:\n" +
            "• Junio 2026: Aplicación y triangulación de la batería de test vocacionales validados en la plataforma virtual del MTPE.\n" +
            "• Julio 2026: Participación en la Feria Vocacional Interuniversitaria de Lima Metropolitana y entrevistas a profesionales en ejercicio.\n" +
            "• Agosto - Octubre 2026: Inscripción en el simulacro de admisión y ciclo de reforzamiento académico en áreas de ciencias y letras.\n" +
            "• Noviembre 2026: Presentación de expediente formal de postulación a Beca 18 con acompañamiento tutorial.",
          key_points: [
            "Meta inmediata: Consolidación del portafolio de evidencias y notas del tercio superior.",
            "Acompañamiento: Sesiones quincenales de tutoría vocacional individual.",
          ],
        },
        {
          title: "IV. Orientación Familiar, Diálogo en el Hogar y Decisión Informada",
          narrative:
            "Estrategias de articulación con los apoderados:\n" +
            "• Diálogo sin Presión: Facilitar un espacio de conversación constructiva entre padres e hijos que disipe temores sobre carreras no tradicionales y reconozca el talento individual del estudiante.\n" +
            "• Planificación Económica Familiar: Análisis realista de costos de postulación, transporte, materiales y manutención durante el periodo de estudios superiores.\n" +
            "• Compromiso Familiar: Los padres asumen el compromiso de brindar respaldo emocional y propiciar un ambiente libre de tensiones durante la etapa de exámenes de admisión.",
          key_points: [
            "Entrevista con familia: Reunión formal de alineación programada para el 15 de julio de 2026.",
            "Resultado esperado: Elección vocacional madura, autónoma y respaldada por el hogar.",
          ],
        },
      ],
      teacher_recommendations: [
        "Recordar al estudiante que la vocación se construye y reajusta a lo largo de toda la trayectoria vital.",
        "Facilitar el acceso al aula de innovación pedagógica (AIP) para la indagación de mallas curriculares universitarias.",
        "Monitorear la estabilidad emocional del adolescente previniendo cuadros de ansiedad preuniversitaria.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "tutoria/orientacion-vocacional",
      values: {
        school_year: "2026",
        dre: "DRE Lima Metropolitana",
        ugel: "UGEL 03",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        level: "Secundaria",
        grade: "5° de Secundaria",
        section: "A",
        curricular_area: "Tutoría y Orientación Vocacional (TOE)",
        teacher_name: "Lic. Carlos Alberto Ramos",
        director_name: "Lic. Elena Torres Valdivia",
      },
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "55-tutoria-orientacion-vocacional.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

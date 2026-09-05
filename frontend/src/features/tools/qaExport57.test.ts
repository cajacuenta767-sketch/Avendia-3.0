import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 57-evaluamos-carpetas-recuperacion", () => {
  it("generates 57-evaluamos-carpetas-recuperacion.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Carpeta de Recuperación Pedagógica 2026: Matemática y Resolución de Problemas Auténticos",
      executive_summary:
        "Instrumento curricular y pedagógico de recuperación de aprendizajes para estudiantes que requieren consolidación en competencias matemáticas prioritarias de Educación Secundaria (Ciclo VI / 2° de Secundaria), conforme a la RVM N° 094-2020-MINEDU y los lineamientos del CNEB. Organiza actividades desafiantes, criterios de autoevaluación y compromisos familiares para el logro del nivel esperado.",
      sections: [
        {
          title: "I. Diagnóstico de Necesidades de Aprendizaje y Grupo Focalizado",
          narrative:
            "• Estudiantes Focalizados: Grupo de 4 estudiantes de 2° de Secundaria Sección 'B' que requieren acompañamiento intensivo para alcanzar el nivel de logro esperado en el área de Matemática.\n" +
            "• Diagnóstico de Brechas Cognitivas: Durante el periodo lectivo regular, los estudiantes mostraron dificultades para modelar relaciones de cambio con ecuaciones lineales y traducir situaciones cotidianas a operaciones con números racionales y porcentajes.\n" +
            "• Factores Asociados: Intermitencia en la asistencia por motivos de salud y necesidad de andamiaje con representaciones pictóricas y esquemas visuales previos a la formalización simbólica.",
          key_points: [
            "Población atendida: 4 estudiantes focalizados de 2° Secundaria 'B'.",
            "Periodo de ejecución: 4 semanas intensivas con entrega de evidencias semanales.",
          ],
        },
        {
          title: "II. Competencias Priorizadas, Criterios de Evaluación y Evidencias",
          narrative:
            "1. Competencias del CNEB Priorizadas:\n" +
            "• Competencia 1: 'Resuelve problemas de cantidad' (desempeños precisados en operaciones con números enteros, fracciones y cálculo de porcentajes aplicados al comercio familiar).\n" +
            "• Competencia 2: 'Resuelve problemas de regularidad, equivalencia y cambio' (establecimiento de equivalencias algebraicas y resolución de ecuaciones de primer grado ax + b = c).\n\n" +
            "2. Criterios de Evaluación Formativa:\n" +
            "• Criterio 1: Modela situaciones de compra y venta usando fracciones y porcentajes justificando el procedimiento aritmético.\n" +
            "• Criterio 2: Expresa el valor desconocido en una relación de igualdad mediante una ecuación lineal y halla el conjunto solución.\n" +
            "• Criterio 3: Explica con argumentos lógicos la validez de la solución obtenida en el contexto del problema planteado.\n\n" +
            "3. Evidencias Esperadas:\n" +
            "• Portafolio de recuperación física que contiene las cuatro fichas de actividades resueltas paso a paso, con esquemas explicativos y autoevaluación.",
          key_points: [
            "Enfoque de evaluación: Formativo, orientado a la autorregulación y la retroalimentación oportuna.",
            "Instrumento de verificación: Lista de cotejo diagnóstica y rúbrica analítica de nivel de logro.",
          ],
        },
        {
          title: "III. Ruta Metodológica y Secuencia de Actividades de Recuperación",
          narrative:
            "Secuencia didáctica organizada en 4 actividades desafiantes y contextualizadas:\n" +
            "• Actividad 1 ('Presupuesto para el Emprendimiento Familiar'): Los estudiantes analizan los costos de elaboración de un producto gastronómico local, calculando proporciones de ingredientes, costos unitarios y porcentajes de ganancia estimada.\n" +
            "• Actividad 2 ('Distribución Equitativa en el Biohuerto Escolar'): Resolución de situaciones problemáticas sobre reparto proporcional de semillas y delimitación geométrica de parcelas usando ecuaciones lineales.\n" +
            "• Actividad 3 ('Comparando Ofertas en el Mercado Comunal'): Análisis crítico de promociones comerciales (descuentos sucesivos del 10% y 20%) para determinar la alternativa más ventajosa económicamente.\n" +
            "• Actividad 4 ('Diseño de un Plan de Ahorro y Consumo Eficiente'): Síntesis e integración de los aprendizajes mediante la elaboración de un informe gráfico y numérico de consumo eléctrico del hogar con propuestas de optimización.",
          key_points: [
            "Metodología: Aprendizaje basado en problemas (ABP) y práctica reflexiva guiada.",
            "Recursos: Fichas impresas, cuaderno de trabajo Minedu 'Resolvamos Problemas 2' y calculadora básica.",
          ],
        },
        {
          title: "IV. Cronograma de Trabajo y Orientaciones para el Acompañamiento Familiar",
          narrative:
            "1. Cronograma de Trabajo Autónomo:\n" +
            "• Semana 1: Desarrollo y entrega de la Actividad 1 (Números racionales y fracciones).\n" +
            "• Semana 2: Desarrollo y entrega de la Actividad 2 (Ecuaciones lineales en contexto).\n" +
            "• Semana 3: Desarrollo y entrega de la Actividad 3 (Porcentajes y descuentos).\n" +
            "• Semana 4: Consolidación del producto integrador y sustentación presencial de la carpeta.\n\n" +
            "2. Orientaciones Pedagógicas para la Familia:\n" +
            "• Establecer un horario fijo de estudio diario (mínimo 60 minutos continuos) en un ambiente libre de ruidos y distracciones audiovisuales.\n" +
            "• Brindar aliento y motivación constante sin resolver las actividades por el estudiante; propiciar que el alumno verbalice sus razonamientos.\n" +
            "• Firmar semanalmente la ficha de avance y compromisos de la carpeta pedagógica.",
          key_points: [
            "Compromiso del hogar: Firma semanal de monitoreo y asistencia a la reunión de balance.",
            "Horario sugerido: Lunes a viernes de 16:00 a 17:00 horas.",
          ],
        },
        {
          title: "V. Sistema de Retroalimentación, Evaluación y Cierre de la Carpeta",
          narrative:
            "• Modalidad de Seguimiento Docente: Asesoría pedagógica presencial semanal los días miércoles de 10:00 a 11:30 horas para absolver dudas específicas.\n" +
            "• Mecanismo de Retroalimentación: Devolución escrita en cada actividad aplicando preguntas socráticas ('¿Por qué elegiste esta operación?', '¿Cómo verificarías que el resultado es razonable?').\n" +
            "• Conclusión del Proceso: Evaluación final conforme a la escala ministerial (AD, A, B, C) e informe de nivel de logro para el registro en el sistema SIAGIE.",
          key_points: [
            "Criterio de aprobación: Demostración de progreso formativo y sustentación reflexiva.",
            "Registro SIAGIE: Consignación de la calificación final en el periodo de evaluación de recuperación.",
          ],
        },
      ],
      teacher_recommendations: [
        "Revisar previamente con el estudiante la estructura general de la carpeta y los criterios de evaluación esperados.",
        "Validar el esfuerzo y la persistencia del estudiante por encima de la inmediatez en las respuestas.",
        "Programar una entrevista formativa final con el apoderado para retroalimentar los avances consolidados.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "evaluamos/carpetas-recuperacion",
      values: {
        school_year: "2026",
        dre: "DRE Lima Metropolitana",
        ugel: "UGEL 03",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        level: "Secundaria",
        grade: "2° de Secundaria",
        section: "B",
        curricular_area: "Matemática",
        teacher_name: "Prof. Manuel Cárdenas Vega",
        director_name: "Lic. Elena Torres Valdivia",
      },
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "57-evaluamos-carpetas-recuperacion.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 49-tutoria-sesiones-tutoria", () => {
  it("generates 49-tutoria-sesiones-tutoria.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Sesión de Tutoría y Orientación Educativa: Decisiones Asertivas Frente a la Presión de Grupo",
      executive_summary:
        "Diseño de sesión tutorial formativa bajo el marco de la RVM N° 212-2020-MINEDU para 3° de Secundaria. Articula el desarrollo de la dimensión personal y socioemocional, dotando a los adolescentes de estrategias de autorregulación y asertividad ante influencias negativas del entorno social.",
      sections: [
        {
          title: "I. Propósito Formativo, Dimensión TOE y Enfoques Transversales",
          narrative:
            "• Dimensión de la Tutoría: Dimensión Personal (Autoconocimiento, Autoestima y Habilidades Socioemocionales).\n" +
            "• Propósito Central: Que las y los estudiantes reconozcan situaciones de presión de grupo en su entorno escolar y digital, y apliquen técnicas de comunicación asertiva para tomar decisiones autónomas y coherentes con su proyecto de vida.\n" +
            "• Enfoque Transversal: Enfoque de Derechos y Enfoque de Orientación al Bien Común.\n" +
            "• Evidencia Formativa: Registro de compromisos individuales en el 'Decálogo del Estudiante Autónomo' y sociodramas de respuesta asertiva.",
          key_points: [
            "Población: 3° de Secundaria 'A' (32 estudiantes).",
            "Duración estimada: 90 minutos pedagógicos.",
          ],
        },
        {
          title: "II. Secuencia Didáctica Detallada: Inicio, Desarrollo y Cierre",
          narrative:
            "1. Momento de Inicio (15 minutos) - Motivación y Conflicto Cognitivo:\n" +
            "El tutor saluda cordialmente y presenta el caso animado 'El desafío de Mateo': un adolescente presionado a grabar una broma ofensiva para TikTok. Preguntas de apertura: ¿Qué hubieras sentido en el lugar de Mateo? ¿Por qué cuesta tanto decir 'No' a los amigos? Se recogen ideas fuerza en la pizarra y se explicita el propósito de la sesión.\n\n" +
            "2. Momento de Desarrollo (50 minutos) - Construcción y Vivencia:\n" +
            "Se conforman 4 equipos de trabajo heterogéneos. Cada equipo recibe una tarjeta con un dilema real (dilemas: consumo de alcohol en fiestas, aislamiento de compañeros nuevos, ciberacoso y copiado en exámenes). Los estudiantes dramatizan dos desenlaces: (a) ceder a la presión por miedo al rechazo; (b) aplicar la técnica asertiva del 'Disco Rayado' o 'Asertividad Positiva' manteniendo su postura con empatía y firmeza.\n\n" +
            "3. Momento de Cierre (25 minutos) - Reflexión y Metacognición:\n" +
            "Plenaria integradora. Los estudiantes completan la tarjeta 'Mi Escudo Protector' con 3 frases de autoafirmación personal. El tutor sintetiza: 'Ser asertivo no es agredir ni someterse, es valorarse a uno mismo y respetar al otro'.",
          key_points: [
            "Materiales: Fichas de casos, tarjetas de autoafirmación, papelotes y plumones.",
            "Metodología: Aprendizaje vivencial, sociodrama y debate reflexivo guiado.",
          ],
        },
        {
          title: "III. Cuidado Socioemocional, Factores Protectores y Rutas de Derivación",
          narrative:
            "Pautas preventivas durante el desarrollo de la sesión:\n" +
            "• Clima de Aula: Respeto absoluto a la libre expresión; prohibición de burlas o descalificaciones ante revelaciones íntimas.\n" +
            "• Señales de Alerta: Identificación de estudiantes que muestren angustia severa, retraimiento persistente o llanto al abordar dinámicas de exclusión.\n" +
            "• Ruta de Protección y Derivación: En caso de manifestación o sospecha de acoso escolar sistemático o vulneración de derechos, se activará el protocolo del Portal SíseVe y se coordinará entrevista reservada con la coordinación TOE y el departamento de psicología.",
          key_points: [
            "Línea de contingencia: Entrevista personalizada post-sesión para estudiantes focalizados.",
            "Articulación institucional: Registro reservado en el anecdotario tutorial.",
          ],
        },
        {
          title: "IV. Instrumento de Evaluación Formativa y Seguimiento Tutorial",
          narrative:
            "Monitoreo del logro de la sesión mediante ficha de observación cualitativa:\n" +
            "• Criterio 1: Identifica con claridad situaciones cotidianas donde se ejerce presión de grupo.\n" +
            "• Criterio 2: Propone respuestas asertivas argumentadas sin recurrir a la agresión ni a la sumisión.\n" +
            "• Criterio 3: Asume un compromiso personal verificable de respeto hacia sí mismo y sus pares.\n" +
            "Acciones de extensión: Compartir en el hogar la dinámica del escudo protector y reflexionar con la familia sobre la confianza y el diálogo.",
          key_points: [
            "Instrumento: Lista de cotejo socioemocional formativa.",
            "Monitoreo continuo: Verificación de acuerdos en las siguientes dos semanas.",
          ],
        },
      ],
      teacher_recommendations: [
        "Fomentar la escucha activa y validar las emociones de los adolescentes sin juzgar sus miedos.",
        "Monitorear discretamente el lenguaje corporal de estudiantes en situación de timidez o vulnerabilidad.",
        "Articular con los docentes de áreas curriculares para reforzar conductas asertivas en los trabajos grupales.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "tutoria/sesiones-tutoria",
      values: {
        school_year: "2026",
        dre: "DRE Lima Metropolitana",
        ugel: "UGEL 03",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        level: "Secundaria",
        grade: "3° de Secundaria",
        section: "A",
        curricular_area: "Tutoría y Orientación Educativa (TOE)",
        teacher_name: "Lic. Carlos Alberto Ramos",
        director_name: "Lic. Elena Torres Valdivia",
      },
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "49-tutoria-sesiones-tutoria.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 54-tutoria-recursos-tutoria", () => {
  it("generates 54-tutoria-recursos-tutoria.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Guía Oficial de Recursos Didácticos y Dinámicas Vivenciales de Tutoría (TOE)",
      executive_summary:
        "Compendio metodológico de dinámicas grupales, fichas de reflexión socioemocional y guías de facilitación tutorial para Educación Secundaria elaborado bajo el marco del CNEB y la RVM N° 212-2020-MINEDU. Proporciona herramientas estructuradas para el fortalecimiento de la cohesión grupal, la empatía activa y la convivencia democrática.",
      sections: [
        {
          title: "I. Fundamentación Curricular y Dimensión de la Tutoría",
          narrative:
            "• Dimensión TOE: Dimensión Social y Convivencia Escolar.\n" +
            "• Propósito Pedagógico: Desarrollar habilidades de escucha activa, interdependencia positiva y resolución colaborativa de desafíos en adolescentes de 3° y 4° de Secundaria.\n" +
            "• Enfoque Transversal: Enfoque de Orientación al Bien Común e Igualdad de Género.\n" +
            "• Tiempo estimado de aplicación: Taller vivencial de 90 minutos pedagógicos.",
          key_points: [
            "Población objetivo: Estudiantes de Educación Básica Regular (Nivel Secundaria).",
            "Modalidad: Dinámica vivencial participativa y plenaria reflexiva.",
          ],
        },
        {
          title: "II. Dinámica Vivencial Central: 'La Red de Apoyo y el Puente de la Confianza'",
          narrative:
            "1. Preparación y Materiales: Madeja de lana de color visible, tarjetas de situación, música instrumental suave y espacio despejado en círculo.\n\n" +
            "2. Secuencia de Facilitación Paso a Paso:\n" +
            "• Fase 1 - Lanzamiento del Ovillo (15 min): El tutor sostiene la punta de la lana y expresa una cualidad positiva que admira del aula; luego lanza el ovillo a un compañero sin soltar su tramo, tejiendo progresivamente una red geométrica interconectada entre todos los participantes.\n" +
            "• Fase 2 - El Desafío de la Tensión Compartida (20 min): Se coloca una pelota liviana en el centro de la red tejida. El grupo debe cooperar milimétricamente para transportarla hacia una meta sin que caiga, vivenciando la interdependencia: 'Si uno suelta su hilo, la red se desestabiliza'.\n" +
            "• Fase 3 - Cierre Simbólico (10 min): Cada estudiante corta un trozo del hilo de la red y lo ata en su muñeca como recordatorio del soporte mutuo.",
          key_points: [
            "Rol del docente: Facilitador empático que guía la experiencia sin juzgar.",
            "Materiales requeridos: Lana gruesa de color, 1 pelota liviana y tijeras escolares.",
          ],
        },
        {
          title: "III. Ficha de Trabajo Reflexivo y Preguntas Metacognitivas Guiadas",
          narrative:
            "Pauta de diálogo reflexivo posterior a la vivencia:\n" +
            "• Pregunta 1 (Identificación Emocional): ¿Qué sentiste cuando el ovillo llegó a ti y escuchaste lo que tus compañeros valoran de ti?\n" +
            "• Pregunta 2 (Interdependencia): ¿Qué ocurrió en el grupo cuando la pelota tambaleó? ¿Cómo se organizaron para no dejarla caer?\n" +
            "• Pregunta 3 (Transferencia a la Convivencia): ¿En qué situaciones cotidianas del colegio o del hogar necesitamos sostener la 'red' de nuestros compañeros?\n" +
            "Los estudiantes redactan en su cuaderno de tutoría una acción concreta de apoyo que brindarán esta semana a un compañero que lo necesite.",
          key_points: [
            "Evidencia esperada: Compromiso solidario individual registrado por escrito.",
            "Estrategia de metacognición: Diálogo en parejas y socialización voluntaria.",
          ],
        },
        {
          title: "IV. Pautas de Cuidado Socioemocional y Adaptaciones Inclusivas (DUA)",
          narrative:
            "Orientaciones para garantizar un espacio seguro e inclusivo:\n" +
            "• Resguardo Afectivo: No forzar la participación oral de estudiantes tímidos; permitirles expresar sus reflexiones mediante dibujos o tarjetas escritas.\n" +
            "• Adaptación DUA: Para estudiantes con discapacidad motora o auditiva, adaptar la dinámica asegurando que el ovillo se entregue en mano con contacto visual y apoyo de un compañero monitor.\n" +
            "• Alertas de Derivación: Si la dinámica desencadena llanto o evoca vivencias de soledad severa en algún estudiante, brindar contención emocional en privado al culminar la sesión.",
          key_points: [
            "Principio rector: Cuidado de la vulnerabilidad y respeto a la intimidad.",
            "Evaluación formativa: Ficha de clima de aula y registro anecdótico tutorial.",
          ],
        },
      ],
      teacher_recommendations: [
        "Preparar el ambiente con anticipación asegurando que no haya interrupciones externas.",
        "Validar todas las respuestas de los estudiantes evitando emitir juicios de valor.",
        "Articular con el comité de tutoría la réplica de la dinámica en otros grados del ciclo.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "tutoria/recursos-tutoria",
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
    const targetFile = path.join(targetDir, "54-tutoria-recursos-tutoria.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

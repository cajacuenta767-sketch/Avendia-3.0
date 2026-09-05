import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import JSZip from "jszip";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildInstrumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 27-evaluamos-examen", () => {
  it("generates 27-evaluamos-examen.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Evaluación Escrita Formativa CNEB: Comprensión Lectora y Razonamiento Crítico",
      executive_summary:
        "Prueba escrita estandarizada de evaluación formativa orientada a medir los tres niveles de comprensión lectora (literal, inferencial y crítico-valorativo) de la competencia 'Lee diversos tipos de textos escritos en su lengua materna' para 3° de Secundaria.",
      sections: [
        {
          title: "Instrucciones",
          narrative: "Lee el texto fuente, responde los cinco reactivos y sustenta las respuestas abiertas con evidencias verificables.",
          key_points: ["Administra 60 minutos y revisa todas tus respuestas antes de entregar."],
        },
        {
          title: "Matriz de especificaciones",
          narrative: "La evaluación distribuye reactivos literales, inferenciales y crítico-reflexivos con veinte puntos en total.",
          key_points: ["La matriz adjunta permite verificar cobertura, cantidad y puntaje antes de aplicar."],
        },
        {
          title: "Preguntas",
          narrative: "Responde de manera clara; en las preguntas abiertas explica el razonamiento seguido.",
          key_points: [
            "[Opción múltiple] ¿Cuál es la principal causa de fragmentación ecológica descrita en el texto? | A) La lluvia estacional | B) La apertura de trochas | C) El turismo comunal | D) La reforestación",
            "[Respuesta corta] ¿Qué tecnología emplean las brigadas comunales para registrar alertas tempranas?",
            "[Relacionar] Relaciona cada fenómeno con su consecuencia. | Columna A: 1) Tala ilegal; 2) Pérdida de cobertura | Columna B: a) Menor seguridad hídrica; b) Fragmentación ecológica",
            "[Verdadero/Falso] La seguridad hídrica no depende de la cobertura vegetal.",
            "[Desarrollo] Propón dos medidas viables para enfrentar la tala ilegal sin perjudicar a la comunidad.",
          ],
        },
        {
          title: "Puntaje",
          narrative: "El examen suma veinte puntos y cada reactivo conserva el valor declarado en la matriz.",
          key_points: ["Reactivos 1 y 2: 3 puntos cada uno; reactivos 3 y 4: 4 puntos cada uno; reactivo 5: 6 puntos."],
        },
        {
          title: "Clave de respuestas",
          narrative: "Clave reservada para la corrección y retroalimentación del docente.",
          key_points: [
            "Apertura de trochas para extracción maderera ilegal.",
            "Patrullaje satelital y drones de monitoreo.",
            "Disminuye la captación de humedad que abastece a las comunidades.",
            "Alertar sobre la crisis y visibilizar la respuesta comunal, con evidencia pertinente.",
            "Dos medidas viables, justificadas y respetuosas de los derechos de la comunidad.",
          ],
        },
        {
          title: "Criterios de corrección",
          narrative: "Valora comprensión, inferencia, uso de evidencia y argumentación, sin premiar únicamente la extensión.",
          key_points: ["Exactitud conceptual", "Evidencia textual", "Coherencia del razonamiento", "Viabilidad de la propuesta"],
        },
      ],
      tables: [{
        title: "Matriz de especificaciones",
        columns: ["Competencia o tema", "Nivel cognitivo", "Tipo de pregunta", "Cantidad", "Puntaje"],
        rows: [
          ["Comprensión del texto", "Literal", "Opción múltiple", "1", "3"],
          ["Comprensión del texto", "Literal", "Respuesta corta", "1", "3"],
          ["Comprensión del texto", "Inferencial", "Relacionar", "1", "4"],
          ["Ciudadanía ambiental", "Inferencial", "Verdadero/Falso", "1", "4"],
          ["Ciudadanía ambiental", "Crítico", "Desarrollo", "1", "6"],
        ],
      }],
      teacher_recommendations: [
        "CLAVE DE RESPUESTAS OFICIAL: Reactivo 1: B | Reactivo 2: C | Reactivo 3: B | Reactivo 4: C | Reactivo 5: Rúbrica de 8 puntos.",
        "Justificación pedagógica Reactivo 3: La deducción se basa en que los bosques de neblina actúan como esponjas hídricas naturales.",
        "Criterio de devolución formativa para Reactivo 5: Si el estudiante solo repite el texto sin emitir juicio propio, ubicar en nivel En Proceso (B).",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildInstrumentDocx(artifact, {
      workflowKey: "evaluamos/examen",
      values: {
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        teacher_name: "Prof. Manuel Cárdenas Vega",
        grade: "3° de Secundaria",
        section: "A",
        curricular_area: "Comunicación",
        school_year: "2026",
        total_score: "20",
      },
    });

    const buffer = await Packer.toBuffer(doc);
    const archive = await JSZip.loadAsync(buffer);
    const xml = await archive.file("word/document.xml")!.async("string");
    const guideIndex = xml.indexOf("GUÍA DOCENTE");
    expect(guideIndex).toBeGreaterThan(0);
    expect(xml.slice(0, guideIndex)).toContain("¿Cuál es la principal causa");
    expect(xml.slice(0, guideIndex)).toContain("OPCIÓN MÚLTIPLE");
    expect(xml.slice(0, guideIndex)).toContain("[  ] A) La lluvia estacional");
    expect(xml.slice(0, guideIndex)).toContain("Verdadero");
    expect(xml.slice(0, guideIndex)).toContain("Columna A");
    expect(xml.slice(0, guideIndex)).not.toContain("Apertura de trochas para extracción");
    expect(xml.slice(guideIndex)).toContain("Apertura de trochas para extracción");
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "27-evaluamos-examen.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

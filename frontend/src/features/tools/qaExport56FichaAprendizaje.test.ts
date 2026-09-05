import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 56-evaluamos-ficha-aprendizaje", () => {
  it("generates 56-evaluamos-ficha-aprendizaje.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Ficha de Aprendizaje y Evaluación Auténtica: Gestión Sostenible de los Recursos Hídricos",
      executive_summary:
        "Ficha de aprendizaje, aplicación práctica y evaluación formativa alineada al CNEB para 2° de Secundaria en el área de Ciencia y Tecnología. Integra situaciones auténticas de indagación sobre el ciclo del agua, actividades de modelación cuantitativa de la huella hídrica y una matriz docente con solucionario y rúbrica formativa.",
      sections: [
        {
          title: "I. Propósito de Aprendizaje, Competencias y Criterios de Evaluación CNEB",
          narrative:
            "• Área Curricular: Ciencia y Tecnología · 2° de Secundaria.\n" +
            "• Competencia Priorizada: Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo.\n" +
            "• Capacidades: Comprende y usa conocimientos sobre los seres vivos; evalúa las implicancias del saber y del quehacer científico y tecnológico.\n" +
            "• Desempeño Precisado: Justifica que la conservación de las cuencas hidrográficas y el tratamiento de aguas residuales reducen el impacto ambiental en las comunidades costeras y andinas.\n" +
            "• Evidencia de Aprendizaje: Reporte técnico de auditoría hídrica con propuesta tecnológica de filtración casera sustentada.",
          key_points: [
            "Enfoque transversal: Enfoque Ambiental y Enfoque de Derechos.",
            "Nivel de dificultad: Intermedia - Desafiante.",
          ],
        },
        {
          title: "II. Activación y Práctica Guiada: Ciclo del Agua y Cuencas Hidrográficas",
          narrative:
            "Lectura Científica Contextualizada:\n" +
            "'El río Rímac abastece a más de 10 millones de habitantes, pero recibe descargas industriales y domésticas que alteran sus parámetros fisicoquímicos (DBO, turbidez y metales pesados). Las plantas de tratamiento de La Atarjea y Huachipa aplican procesos físicos de coagulación, floculación y desinfección con cloro gaseoso'.\n\n" +
            "Actividad 1 (Práctica Guiada - Análisis Fisicoquímico):\n" +
            "A partir de la lectura, completa el cuadro comparativo explicando el rol de: (a) la coagulación con sulfato de aluminio; (b) la sedimentación gravitacional; y (c) la filtración por lechos de arena y antracita.",
          key_points: [
            "Pregunta reto: ¿Por qué el agua potable no es químicamente pura (H2O) sino una solución de sales minerales apta para el consumo humano?",
            "Apoyo DUA: Esquema gráfico secuencial del proceso de potabilización con glosario de términos técnicos.",
          ],
        },
        {
          title: "III. Aplicación y Reto Autónomo: Auditoría del Consumo y Huella Hídrica",
          narrative:
            "Actividad 2 (Resolución de Problema Auténtico):\n" +
            "Una familia de 4 integrantes consume en promedio 18 metros cúbicos (18,000 litros) de agua al mes según su recibo de facturación.\n" +
            "1. Calcula el consumo diario por persona en litros (Litros/persona/día) y compáralo con el estándar de 100 litros diarios recomendado por la OMS.\n" +
            "2. Diseña un prototipo casero de sistema de biofiltro para aguas grises (lavamanos y duchas) empleando grava, arena fina, carbón activado y algodón sintético.\n" +
            "3. Explica el principio biológico y físico que permite reducir los sólidos suspendidos en el efluente.",
          key_points: [
            "Cálculo cuantitativo: 18,000 L / 30 días = 600 L/día familia; 150 L/persona/día (exceso del 50% respecto al parámetro OMS).",
            "Producción del estudiante: Diagrama rotulado del biofiltro con justificación de materiales.",
          ],
        },
        {
          title: "IV. Solucionario Docente, Criterios de Calificación y Metacognición",
          narrative:
            "Solucionario y Pautas de Corrección para el Docente:\n" +
            "• Respuesta Actividad 1: La coagulación neutraliza las cargas eléctricas negativas de las partículas coloidales permitiendo su agregación en flóculos decantables.\n" +
            "• Respuesta Actividad 2: El consumo de 150 L/persona/día evidencia sobreconsumo en actividades de riego o fugas; el biofiltro actúa mediante adsorción física de impurezas en los microporos del carbón activado y retención mecánica en las arenas.\n\n" +
            "Preguntas Metacognitivas para el Estudiante:\n" +
            "• ¿Qué ideas previas sobre el tratamiento del agua cambiaste con esta ficha?\n" +
            "• ¿Qué dificultades tuviste al calcular tu huella hídrica y cómo las superaste?",
          key_points: [
            "Nivel Logro Esperado (A): Justifica con fundamentos científicos los procesos de potabilización y propone mejoras viables.",
            "Nivel Destacado (AD): Integra variables de costo-beneficio y formula campañas escolares de sensibilización hídrica.",
          ],
        },
      ],
      teacher_recommendations: [
        "Propiciar que los estudiantes traigan recibos reales de agua para personalizar el análisis matemático.",
        "Articular con el área de Matemática para el cálculo porcentual del exceso de consumo.",
        "Promover la construcción efectiva del prototipo de biofiltro en el laboratorio escolar.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "evaluamos/ficha-aprendizaje",
      values: {
        school_year: "2026",
        dre: "DRE Lima Metropolitana",
        ugel: "UGEL 03",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        level: "Secundaria",
        grade: "2° de Secundaria",
        section: "B",
        curricular_area: "Ciencia y Tecnología",
        teacher_name: "Lic. Carlos Alberto Ramos",
        director_name: "Lic. Elena Torres Valdivia",
      },
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "56-evaluamos-ficha-aprendizaje.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

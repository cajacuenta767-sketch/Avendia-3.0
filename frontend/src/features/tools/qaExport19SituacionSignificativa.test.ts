import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 19-planificamos-situacion-significativa", () => {
  it("generates 19-planificamos-situacion-significativa.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Situación Significativa 2026: Fortalecemos la Seguridad Alimentaria y Revaloramos los Cultivos Ancestrales en Lamas",
      executive_summary:
        "Diseño curricular y pedagógico de una situación significativa contextualizada para 3° de Secundaria, orientada a movilizar competencias de indagación científica, construcción histórica y producción escrita frente a la malnutrición infantil y el abandono de cultivos nativos en la provincia de Lamas.",
      sections: [
        {
          title: "Caracterización del Contexto Sociocultural y Diagnóstico de la Problemática",
          narrative:
            "En la provincia de Lamas (San Martín), conviven saberes ancestrales de comunidades quechua-lamistas y mestizas con una rica agrobiodiversidad (sacha inchi, frijol huasca, plátano, yuca y cacao). No obstante, los diagnósticos de salud escolar revelan un incremento de anemia leve y malos hábitos alimenticios debido a la sustitución de productos tradicionales por golosinas y ultraprocesados en los quioscos y hogares. Esta desconexión amenaza la salud comunitaria y la identidad cultural.",
          key_points: [
            "Eje temático CNEB: Salud integral, conservación ambiental y revaloración intercultural.",
            "Ubicación contextual: Comunidad educativa de Lamas, articulada con familias productoras locales.",
            "Población diana: Estudiantes de Ciclo VII (3° de Secundaria) con potencial de liderazgo juvenil.",
          ],
        },
        {
          title: "Formulación del Reto y Preguntas Provocadoras de Conflicto Cognitivo",
          narrative:
            "Planteamiento desafiante para despertar el interés intrínseco y la necesidad de aprender:",
          key_points: [
            "Pregunta retadora central: ¿Por qué en una región con tanta riqueza agrícola consumimos alimentos que deterioran nuestra salud y cómo podemos liderar una campaña comunitaria de revaloración alimentaria?",
            "Subpregunta de indagación: ¿Qué valor nutricional y propiedades químicas poseen los cultivos autóctonos frente a los productos industrializados?",
            "Subpregunta sociohistórica: ¿Qué técnicas agrícolas y recetas ancestrales transmitieron nuestros abuelos para asegurar la alimentación sostenible?",
            "Subpregunta comunicativa: ¿Qué formatos multimodales (podcasts, trípticos, recetarios digitales) resultan más persuasivos para sensibilizar a nuestras familias?",
          ],
        },
        {
          title: "Justificación Pedagógica y Articulación con el Perfil de Egreso",
          narrative:
            "La situación demanda que los estudiantes actúen como investigadores sociales y científicos escolares, contrastando evidencias empíricas con conocimientos académicos para resolver una necesidad sentida de su entorno.",
          key_points: [
            "Perfil de Egreso CNEB: El estudiante indaga el mundo natural y artificial, practica una vida activa y saludable, y convive democráticamente respetando la diversidad cultural.",
            "Enfoque pedagógico: Aprendizaje basado en indagación y resolución de problemas auténticos.",
            "Articulación curricular: Ciencia y Tecnología + Ciencias Sociales + Comunicación + DPCC.",
          ],
        },
        {
          title: "Matriz de Competencias y Enfoques Transversales Articulados",
          narrative:
            "Propósitos curriculares de alta exigencia cognitiva a movilizar a lo largo de la unidad didáctica:",
          key_points: [
            "Ciencia y Tecnología: 'Indaga mediante métodos científicos para construir conocimientos' y 'Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía'.",
            "Ciencias Sociales: 'Construye interpretaciones históricas' y 'Gestiona responsablemente los recursos económicos'.",
            "Comunicación: 'Escribe diversos tipos de textos en su lengua materna' y 'Se comunica oralmente en su lengua materna'.",
            "Enfoques Transversales: Enfoque Intercultural (diálogo de saberes ancestrales y científicos) y Enfoque Ambiental (agricultura regenerativa y soberanía alimentaria).",
          ],
        },
        {
          title: "Producto Integrador, Evidencias y Criterios de Evaluación Auténtica",
          narrative:
            "Demostración pública del aprendizaje aplicado mediante una solución innovadora:",
          key_points: [
            "Producto integrador: 'Guía Gastronómica y Nutricional Comunitaria: El Poder de Nuestros Cultivos de Lamas' (versión impresa y digital con códigos QR a videos de preparación casera).",
            "Evidencia procesual 1: Reporte de laboratorio sobre contenido proteico y lipídico del sacha inchi y legumbres locales.",
            "Evidencia procesual 2: Monografía histórica sobre los pisos ecológicos y calendarios de siembra tradicionales de la comunidad.",
            "Instrumento oficial: Rúbrica Analítica Holística con 4 niveles de desempeño (Previo al inicio, Inicio, Proceso y Logro Destacado).",
          ],
        },
      ],
      teacher_recommendations: [
        "Establecer alianzas con la posta médica local y la asociación de agricultores para que validen técnicamente los recetarios.",
        "Asegurar que las entrevistas a los abuelos y sabios comunales se realicen con consentimiento informado y respeto ético a la tradición oral.",
        "Facilitar la difusión del producto final en la radio comunal y en las asambleas de padres de familia.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "planificamos/situacion-significativa",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "3° de Secundaria",
      section: "A",
      course: "Ciencia y Tecnología / Interdisciplinar",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "19-planificamos-situacion-significativa.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

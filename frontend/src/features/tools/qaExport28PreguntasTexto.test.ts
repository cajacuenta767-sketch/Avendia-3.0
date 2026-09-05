import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildInstrumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 28-evaluamos-preguntas-texto", () => {
  it("generates 28-evaluamos-preguntas-texto.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Ficha de Lectura Crítica y Preguntas sobre Texto: 'El Misterio de las Líneas de Nazca'",
      executive_summary:
        "Ficha técnica de comprensión lectora multinivel diseñada para 2° de Secundaria, orientada a evaluar las tres capacidades de la competencia 'Lee diversos tipos de textos escritos en su lengua materna' mediante la lectura rigurosa de un texto expositivo-científico sobre arqueología peruana.",
      sections: [
        {
          title: "Lectura Base: 'El Legado Astronómico y Ritual de los Antiguos Nazca'",
          narrative:
            "En las pampas de Jumana y San José, en el desierto costero de Ica, yacen cientos de geoglifos trazados hace más de 1,500 años por la cultura Nazca. Durante décadas, la investigadora alemana María Reiche sostuvo que estas gigantescas figuras de colibríes, monos y arañas constituían el calendario astronómico a cielo abierto más grande del planeta, diseñado para predecir solsticios y temporadas de siembra. Sin embargo, investigaciones arqueológicas recientes encabezadas por Johny Isla y Markus Reindel han revelado una función predominantemente ritual vinculada al culto al agua y la fertilidad agraria en un entorno hiperárido. Los antiguos pobladores no solo observaban los astros, sino que realizaban procesiones y ceremonias sobre las líneas para implorar lluvias en las cabeceras de cuenca.",
          key_points: [
            "Lee atentamente el texto y responde a las interrogantes formuladas según cada nivel cognitivo.",
          ],
        },
        {
          title: "Nivel Literal: Localización de Información Explícita (Reactivos 1 y 2 - 6 Puntos)",
          narrative:
            "Pregunta 1 (3 pts): ¿Qué hipótesis central defendió la científica María Reiche sobre la finalidad de las líneas de Nazca?\n" +
            "A) Un sistema de demarcación territorial entre clanes guerreros.\n" +
            "B) Un gigantesco calendario astronómico para predecir siembras y solsticios. [RESPUESTA CORRECTA]\n" +
            "C) Pistas de aterrizaje construidas por civilizaciones cósmicas.\n" +
            "D) Rutas comerciales de intercambio marítimo y cordillerano.\n\n" +
            "Pregunta 2 (3 pts): Según las excavaciones contemporáneas de Isla y Reindel, ¿a qué culto estaban asociadas las líneas?\n" +
            "A) Al culto al agua y a la fertilidad en un entorno árido. [RESPUESTA CORRECTA]\n" +
            "B) Al culto a los muertos y entierros de la élite sacerdotal.\n" +
            "C) Al culto al dios felino de la época formativa.\n" +
            "D) Al homenaje bélico a los vencedores de batallas costeras.",
          key_points: [
            "Marque con una 'X' clara la respuesta correcta identificada en el texto.",
          ],
        },
        {
          title: "Nivel Inferencial: Deducción de Intencionalidad y Sentido Global (Reactivos 3 y 4 - 6 Puntos)",
          narrative:
            "Pregunta 3 (3 pts): ¿Por qué el autor contrapone la teoría de María Reiche con los hallazgos de Isla y Reindel?\n" +
            "A) Para descalificar el esfuerzo pionero de los primeros investigadores del siglo XX.\n" +
            "B) Para demostrar que el conocimiento arqueológico evoluciona y se enriquece con nuevas evidencias científicas. [RESPUESTA CORRECTA]\n" +
            "C) Para demostrar que las hipótesis antiguas carecían de rigor metodológico.\n" +
            "D) Para persuadir al lector de que la arqueología es una disciplina estática.\n\n" +
            "Pregunta 4 (3 pts): Se infiere que la realización de procesiones sobre las líneas revela que los Nazca:\n" +
            "A) Entendían el paisaje desértico como un espacio sagrado interactivo y ceremonial. [RESPUESTA CORRECTA]\n" +
            "B) Desconocían las técnicas hidráulicas de acueductos subterráneos.\n" +
            "C) Dependían exclusivamente de la ayuda de pueblos vecinos de la sierra.\n" +
            "D) Carecían de una organización social jerárquica y sacerdotal.",
          key_points: [
            "Deduzca el sentido global a partir de las pistas contextuales ofrecidas por el texto.",
          ],
        },
        {
          title: "Nivel Crítico-Reflexivo: Valoración y Argumentación Ética (Reactivo 5 - 8 Puntos)",
          narrative:
            "Pregunta 5 (8 pts): En la actualidad, el crecimiento urbano desordenado y las invasiones ilegales amenazan la integridad de los geoglifos de Nazca, declarados Patrimonio de la Humanidad por la UNESCO. Desde tu perspectiva como estudiante y ciudadano, ¿qué medidas urgentes deben implementar el Ministerio de Cultura y los municipios locales para preservar este patrimonio sin desatender el derecho a la vivienda de la población?\n\n" +
            "Desarrollo fundamentado:\n" +
            "_________________________________________________________________________________\n" +
            "_________________________________________________________________________________\n" +
            "_________________________________________________________________________________\n" +
            "_________________________________________________________________________________",
          key_points: [
            "Criterios de valoración: Propuesta equilibrada (2 pts), Argumentación legal y patrimonial (3 pts), Viabilidad social y respeto a la comunidad (3 pts).",
          ],
        },
      ],
      teacher_recommendations: [
        "CLAVE DE RESPUESTAS OFICIAL: Pregunta 1: B | Pregunta 2: A | Pregunta 3: B | Pregunta 4: A | Pregunta 5: Rúbrica de 8 puntos.",
        "Orientación de retroalimentación formativa: Guiar al estudiante a identificar que la ciencia arqueológica se basa en contrastación empírica continua.",
        "Estrategia DUA: Permitir relectura guiada de párrafos clave antes de emitir la respuesta abierta en la pregunta 5.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildInstrumentDocx(artifact, {
      workflowKey: "evaluamos/preguntas-texto",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "2° de Secundaria",
      section: "A",
      course: "Comunicación / Comprensión de Textos CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "28-evaluamos-preguntas-texto.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

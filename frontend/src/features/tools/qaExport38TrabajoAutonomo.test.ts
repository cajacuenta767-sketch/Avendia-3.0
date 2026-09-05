import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildActivityDocx } from "./exportWorkflowDocx";

describe("QA Generator: 38-reforzamos-trabajo-autonomo", () => {
  it("generates 38-reforzamos-trabajo-autonomo.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Ficha de Refuerzo y Trabajo Autónomo: Los Ecosistemas y Cadenas Tróficas del Perú",
      executive_summary:
        "Ficha didáctica de aprendizaje autónomo diseñada para 5° de Primaria en Ciencia y Tecnología. Articula explicaciones conceptuales accesibles sobre el flujo de energía en la biodiversidad peruana, retos escalonados de indagación y una pauta de autoevaluación reflexiva con acompañamiento familiar en el hogar.",
      sections: [
        {
          title: "I. ¿Qué aprenderé hoy y por qué es importante? (Fundamentación y Conceptos Clave)",
          narrative:
            "En esta ficha descubrirás cómo fluye la energía a través de productores, consumidores y descomponedores en ecosistemas emblemáticos del Perú como las lomas costeras y la Amazonía. Comprenderás por qué la alteración de una sola especie afecta el equilibrio de toda la comunidad ecológica.",
          key_points: [
            "Identifica a los organismos productores en las lomas costeras (amancaes, algas y arbustos) y describe cómo capturan energía solar.",
            "Clasifica a cuatro animales peruanos (vicuña, zorro andino, puma y cóndor) según el nivel trófico que ocupan en la cadena alimentaria.",
          ],
        },
        {
          title: "II. Práctica Guiada y Análisis de Situaciones Ecológicas",
          narrative:
            "Lee con atención cada planteamiento y demuestra tu capacidad de indagación científica mediante esquemas y argumentos fundamentados.",
          key_points: [
            "Construye una cadena trófica de cuatro eslabones del lago Titicaca: fitoplancton -> zooplancton -> carachi/pejerrey -> ave zambullidora.",
            "Explica qué consecuencias ecológicas ocurrirían si una plaga elimina a los consumidores primarios de un ecosistema andino.",
          ],
        },
        {
          title: "III. Reto de Aplicación en el Hogar y Autoevaluación",
          narrative:
            "Comparte lo aprendido con tu familia y propongan acciones conjuntas para la protección ambiental en tu entorno cercano.",
          key_points: [
            "Formula dos compromisos familiares para cuidar la flora y fauna local y evitar la contaminación de parques o fuentes de agua.",
            "Autoevaluación formativa: Marca con sinceridad si lograste explicar la red alimentaria con tus propias palabras y qué dudas resolviste.",
          ],
        },
      ],
      teacher_recommendations: [
        "Clave Reto 1: Los productores son organismos autótrofos que sustentan la biomasa del ecosistema mediante fotosíntesis.",
        "Clave Reto 2: Vicuña = consumidor primario (herbívoro); Zorro andino = consumidor secundario (carnívoro/omnívoro); Puma = superdepredador.",
        "Clave Reto 3: Verificar que las flechas apunten en dirección del flujo de energía (hacia el organismo que consume).",
        "Pauta de mediación: Guiar al estudiante mediante preguntas reflexivas en lugar de brindar respuestas directas.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildActivityDocx(artifact, {
      workflowKey: "reforzamos/trabajo-autonomo",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      directorName: "Lic. Elena Torres Valdivia",
      grade: "5° de Primaria",
      section: "B",
      course: "Ciencia y Tecnología / Refuerzo Escolar CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "38-reforzamos-trabajo-autonomo.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

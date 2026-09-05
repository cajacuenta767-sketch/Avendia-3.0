import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 15-recursos-canales-audiovisuales", () => {
  it("generates 15-recursos-canales-audiovisuales.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Curaduría Audiovisual y Guía de Observación Activa: Ecosistemas del Perú y Biodiversidad",
      executive_summary:
        "Guía pedagógica de curaduría de canales y videos educativos con orientaciones para la mediación antes, durante y después de la proyección, orientada a estudiantes de 3° de Primaria en el área de Ciencia y Tecnología bajo el enfoque CNEB.",
      sections: [
        {
          title: "Canales Educativos y Videos Curados Recomendados",
          narrative:
            "Selección de fuentes audiovisuales verificadas, con rigor científico y formato adaptado para niños de 8 a 9 años:",
          key_points: [
            "Canal SERNANP Oficial: 'Áreas Naturales Protegidas del Perú' (Video: 'El Manu: Paraíso de la Biodiversidad', 10 min, Full HD, audio en español).",
            "Canal TVPerú Educa: 'Fauna Silvestre de la Costa, Sierra y Selva' (Episodio didáctico: 'Aves y mamíferos emblemáticos', 12 min).",
            "Canal Curiosamente Kids: '¿Cómo funciona una cadena alimenticia?' (Animación pedagógica sobre productores y consumidores, 7 min).",
            "Canal MINEDU - Aprendo en Casa: 'Guardianes de la Naturaleza' (Guía interactiva infantil, 9 min).",
          ],
        },
        {
          title: "Criterios de Calidad Pedagógica y Accesibilidad DUA",
          narrative:
            "Estándares aplicados para la selección segura y formativa de los recursos audiovisuales:",
          key_points: [
            "Rigor científico y curricular: Correspondencia directa con la competencia 'Explica el mundo físico basándose en conocimientos sobre biodiversidad y seres vivos'.",
            "Accesibilidad universal: Videos con subtítulos completos en español para estudiantes con barreras auditivas y lenguaje claro.",
            "Seguridad digital: Contenidos sin publicidad externa, aptos para proyección comunitaria en aula sin riesgos de distracción.",
          ],
        },
        {
          title: "Estrategia de Mediación: Antes, Durante y Después",
          narrative:
            "Momentos de intervención docente para convertir la visualización en una experiencia de aprendizaje activo:",
          key_points: [
            "Antes de la proyección (10 min): Pregunta detonante: '¿Qué pasaría si desapareciera una especie de nuestro ecosistema?' y registro de predicciones.",
            "Durante la proyección (15 min): Pausa activa guiada en el minuto 5:00 para identificar qué come cada animal observado y verificar predicciones.",
            "Después de la proyección (20 min): Completar la Ficha de Registro de Biodiversidad en equipos y diseñar un cartel de compromiso ambiental.",
          ],
        },
        {
          title: "Preguntas Guía para el Pensamiento Crítico Infantil",
          narrative:
            "Preguntas cognitivas para orientar el diálogo reflexivo posterior al video:",
          key_points: [
            "¿Qué diferencias observaste entre los animales de la costa desértica y los de la selva tropical?",
            "¿Por qué es importante que los parques nacionales estén protegidos por guardaparques del Estado?",
            "¿Qué acciones cotidianas desde nuestra escuela ayudan a cuidar el hábitat de los animales peruanos?",
          ],
        },
      ],
      teacher_recommendations: [
        "Previsualizar el video completo antes de la sesión para comprobar que el enlace y los subtítulos funcionen sin internet rápido.",
        "Asegurar un volumen adecuado y una ubicación visible de la pantalla para todos los estudiantes del aula.",
        "Conectar las conclusiones del video con la siguiente sesión práctica de siembra en el biohuerto escolar.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "recursos/canales-audiovisuales",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "3° de Primaria",
      section: "A",
      course: "Ciencia y Tecnología",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "15-recursos-canales-audiovisuales.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

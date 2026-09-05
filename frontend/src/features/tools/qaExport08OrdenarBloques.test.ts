import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import { buildActivityDocx, type WorkflowArtifact } from "./exportWorkflowDocx";

describe("QA Generator: 08-recursos-ordenar-bloques", () => {
  it("generates 08-recursos-ordenar-bloques.docx and saves to exports-qa-word directory", async () => {
    const artifact: WorkflowArtifact = {
      document_title: "Ficha de Aplicación: Ordenar Bloques y Secuencia Histórica",
      executive_summary: "Actividad pedagógica de secuenciación cronológica de las etapas de la historia del Perú para 4° de Primaria.",
      sections: [
        {
          title: "Instrucciones",
          narrative: "Lee con atención cada bloque histórico y ordénalos cronológicamente desde el más antiguo hasta el más reciente.",
          key_points: [
            "Época Preincaica: Primeras civilizaciones andinas (Caral, Chavín, Paracas).",
            "Época Incaica: Expansión y gobierno imperial del Tahuantinsuyo con Pachacútec.",
            "Época de la Conquista: Llegada de los españoles y caída del inca Atahualpa (1532).",
            "Época del Virreinato: Administración colonial bajo el mandato de los virreyes del Perú.",
            "Época de la Independencia: Gestas patrióticas y proclamación por San Martín (1821).",
            "Época Republicana: Nacimiento y consolidación del Estado peruano democrático moderno.",
          ],
        },
      ],
      teacher_recommendations: [
        "Presentar una línea de tiempo mural antes de resolver la ficha individual.",
        "Monitorear la comprensión de causas y consecuencias entre etapas sucesivas.",
        "Validar el orden en plenaria utilizando el solucionario docente.",
      ],
      activity: {
        mode: "ordenar",
        title: "Línea de Tiempo: Etapas Históricas del Perú",
        instructions: "Analiza los acontecimientos y escribe el número de orden (del 1 al 6) según corresponda cronológicamente.",
        items: [
          {
            id: "1",
            prompt: "Época Preincaica: Desarrollo de culturas como Caral, Chavín, Paracas y Moche.",
            answer: "1",
            hint: "Primeras sociedades complejas en el territorio andino.",
            options: [],
          },
          {
            id: "2",
            prompt: "Época Incaica o Tahuantinsuyo: Gran imperio unificado por el Inca Pachacútec con capital en el Cusco.",
            answer: "2",
            hint: "Cúspide de la organización andina antes de la llegada europea.",
            options: [],
          },
          {
            id: "3",
            prompt: "Época de la Conquista: Llegada de Francisco Pizarro, captura de Atahualpa y desestructuración del imperio.",
            answer: "3",
            hint: "Inicio de la dominación hispánica hacia 1532.",
            options: [],
          },
          {
            id: "4",
            prompt: "Época del Virreinato: Creación del Virreinato del Perú y gobierno colonial durante casi tres siglos.",
            answer: "4",
            hint: "Periodo colonial de comercio y dependencia de la Corona española.",
            options: [],
          },
          {
            id: "5",
            prompt: "Época de la Independencia: Corrientes libertadoras y proclamación de la libertad en Lima en 1821.",
            answer: "5",
            hint: "Ruptura del vínculo colonial y nacimiento de la república.",
            options: [],
          },
          {
            id: "6",
            prompt: "Época Republicana: Consolidación republicana tras las batallas de Junín y Ayacucho hasta hoy.",
            answer: "6",
            hint: "Nuestra etapa actual de gobierno republicano y democrático.",
            options: [],
          },
        ],
      },
      model: "gemini-3.6-flash",
    };

    const options = {
      workflowKey: "recursos/ordenar-bloques",
      values: {
        level: "Primaria",
        grade: "4°",
        section: "A",
        area: "Personal Social",
        ie: "I.E. 0001 República del Perú",
        teacher: "Prof. Manuel Cárdenas Vega",
        year: 2026,
      },
    };

    const doc = buildActivityDocx(artifact, options);
    const buffer = await Packer.toBuffer(doc);

    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "08-recursos-ordenar-bloques.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

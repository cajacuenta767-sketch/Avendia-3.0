import fs from "fs";
import path from "path";
import { Packer } from "docx";
import { buildPlanAnualDocxDocument } from "../src/features/tools/exportPlanAnualDocx";

async function main() {
  const artifact = {
    document_title: "Planificación Curricular Anual 2026 - Matemática",
    executive_summary: "Plan anual de Matemática para tercer grado de secundaria...",
    sections: [
      {
        title: "Justificación",
        narrative: "Esta planificación anual responde al diagnóstico del grado...",
        key_points: ["Desarrollar competencias matemáticas", "Promover la autonomía"],
      },
    ],
    teacher_recommendations: ["Revisar rúbricas", "Coordinar con tutores"],
    model: "gemini-3.6-flash",
  };

  const context = {
    workflowKey: "planificamos/plan-curricular-anual",
    values: {
      dre: "SAN MARTÍN",
      ugel: "LAMAS",
      institution: "MARTÍN DE LA RIVA Y HERRERA",
      level: "Secundaria",
      grade: "3° de Secundaria",
      section: "A",
      modality: "Educación Básica Regular (EBR)",
      shift: "Mañana",
      curricular_area: "Matemática",
      hours: "5 horas semanales",
      school_year: "2026",
      teacher_name: "Prof. María Elena Ríos Flores",
      director_name: "Mg. Roberto Carlos Mendoza Paz",
      subdirector_name: "Lic. Ana Sofía Torres Morales",
    },
  };

  const doc = await buildPlanAnualDocxDocument(artifact, context);
  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, "test_generated_pca.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated DOCX successfully: ${outPath} (${buffer.length} bytes)`);
}

main().catch(console.error);

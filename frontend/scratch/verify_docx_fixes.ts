import { exportPlanAnualDocx } from "../src/features/tools/exportPlanAnualDocx";
import { exportWorkflowDocx, type WorkflowArtifact } from "../src/features/tools/exportWorkflowDocx";
import * as fs from "fs";
import * as path from "path";

async function testFixes() {
  const dummyContext = {
    teacherName: "Prof. María Gómez",
    institution: "I.E. Martín de la Riva y Herrera",
    modality: "EBR",
    level: "Secundaria",
    grade: "3° de Secundaria",
    section: "A",
    curricularArea: "Matemática",
    year: 2026,
    directorName: "Director General",
    ugel: "UGEL Lamas",
    dre: "DRE San Martín",
    values: {
      dre: "DRE San Martín",
      ugel: "UGEL Lamas",
      institution: "I.E. Martín de la Riva y Herrera",
      level: "Secundaria",
      grade: "3° de Secundaria",
      section: "A",
      curricular_area: "Matemática",
      teacher_name: "Prof. María Gómez",
      director_name: "Director General",
      school_year: 2026,
    },
  };

  const sampleArtifact: WorkflowArtifact = {
    document_title: "Plan Curricular Anual 2026 - Matemática",
    executive_summary: "Planificación anual de matemática orientada al desarrollo de competencias del CNEB.",
    sections: [
      {
        title: "Datos Informativos",
        narrative: "Información general de la I.E.",
        key_points: ["DRE San Martín", "UGEL Lamas"],
      },
    ],
    teacher_recommendations: ["Adecuar las actividades al contexto productivo."],
    model: "gemini-3.6-flash",
  };

  console.log("Generating PCA DOCX buffer...");
  const pcaBlob = await exportPlanAnualDocx(sampleArtifact, dummyContext);
  const pcaBuffer = Buffer.from(await pcaBlob.arrayBuffer());
  const pcaPath = path.join(process.cwd(), "scratch", "test_pca_fixed.docx");
  fs.writeFileSync(pcaPath, pcaBuffer);
  console.log("Saved test_pca_fixed.docx successfully, size:", pcaBuffer.length);
}

testFixes().catch((err) => {
  console.error(err);
  process.exit(1);
});

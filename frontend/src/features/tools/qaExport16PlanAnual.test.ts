import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { WorkflowArtifact } from "./exportWorkflowDocx";
import { buildPlanAnualDocxDocument } from "./exportPlanAnualDocx";

describe("QA Generator: 16-planificamos-plan-curricular-anual", () => {
  it("generates 16-planificamos-plan-curricular-anual.docx and saves to exports-qa-word directory", async () => {
    const artifact: WorkflowArtifact = {
      document_title: "Plan Curricular Anual 2026: Matemática 3° de Secundaria (Ciclo VII)",
      executive_summary:
        "Programación Curricular Anual que organiza las cuatro competencias del área de Matemática a lo largo de 4 bimestres y 8 unidades didácticas, articulando situaciones significativas del contexto sociocultural, metas de aprendizaje y enfoques transversales bajo el CNEB.",
      sections: [
        {
          title: "I. Justificación Curricular y Fundamentación",
          narrative:
            "El área de Matemática en el 3° grado de Educación Secundaria contribuye a formar ciudadanos capaces de interpretar la realidad económica, científica y ambiental mediante modelos matemáticos rigurosos, desarrollando el razonamiento lógico y la toma de decisiones informadas.",
          key_points: [
            "Enfoque centrado en la resolución de problemas (problemas contextualizados y vivenciales).",
            "Articulación de competencias matemáticas: Cantidad, Regularidad, Forma/Espacio y Datos/Incertidumbre.",
            "Integración de herramientas digitales y software de geometría dinámica (GeoGebra).",
          ],
        },
        {
          title: "II. Perfil de Egreso y Metas del Ciclo VII",
          narrative:
            "Al culminar el grado, los estudiantes argumentan la validez de soluciones, interpretan datos estadísticos complejos y modelan fenómenos del entorno local aplicando funciones lineales, sistemas de ecuaciones y geometría analítica básica.",
          key_points: [
            "Meta Bimestral: 85% de estudiantes en niveles Logrado (A) o Destacado (AD).",
            "Reducción de barreras en cálculo algebraico y razonamiento probabilístico.",
            "Desarrollo de proyectos interdisciplinarios vinculados a la sostenibilidad ambiental.",
          ],
        },
        {
          title: "III. Organización de las Unidades Didácticas del Año Lectivo 2026",
          narrative:
            "Distribución temporal y curricular de 8 unidades de aprendizaje organizadas en 4 periodos bimestrales:",
          key_points: [
            "Unidad 1 (Bimestre I): 'Analizamos el presupuesto y la canasta básica familiar' (Números racionales e irracionales).",
            "Unidad 2 (Bimestre I): 'Modelamos el crecimiento demográfico local' (Progresiones aritméticas y geométricas).",
            "Unidad 3 (Bimestre II): 'Optimizamos recursos productivos en la comunidad' (Sistemas de ecuaciones lineales con 2 variables).",
            "Unidad 4 (Bimestre II): 'Diseñamos estructuras arquitectónicas sostenibles' (Áreas, perímetros y figuras compuestas).",
            "Unidad 5 (Bimestre III): 'Calculamos distancias y alturas inaccesibles' (Razones trigonométricas y teorema de Pitágoras).",
            "Unidad 6 (Bimestre III): 'Evaluamos factores de riesgo nutricional' (Medidas de tendencia central y dispersión).",
            "Unidad 7 (Bimestre IV): 'Probabilidad y toma de decisiones en juegos de azar y clima' (Espacio muestral y regla de Laplace).",
            "Unidad 8 (Bimestre IV): 'Planificamos un emprendimiento escolar sostenible' (Funciones cuadráticas y presupuesto).",
          ],
        },
      ],
      teacher_recommendations: [
        "Planificar sesiones con énfasis en material concreto y simuladores virtuales antes de la abstracción algebraica.",
        "Promover la autoevaluación y coevaluación en cada cierre de unidad didáctica mediante rúbricas analíticas.",
        "Sostener reuniones de trabajo colegiado mensuales para el análisis conjunto de evidencias de aprendizaje.",
      ],
      model: "gemini-3.6-flash",
    };

    const values = {
      school_year: "2026",
      dre: "SAN MARTÍN",
      ugel: "LAMAS",
      institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
      modality: "Educación Básica Regular (EBR)",
      level: "Secundaria",
      grade: "3° de Secundaria",
      section: "A",
      curricular_area: "Matemática",
      teacher_name: "Prof. Manuel Cárdenas Vega",
      director_name: "Lic. Rosa Alvarado Torres",
      subdirector_name: "Mg. Carlos Mendoza Paredes",
      shift: "Mañana",
      hours: "5 horas pedagógicas semanales",
      justification:
        "Esta planificación anual de Matemática para 3° de Secundaria se alinea estrictamente al Currículo Nacional de la Educación Básica (CNEB), garantizando el desarrollo de competencias matemáticas mediante el enfoque de resolución de problemas en situaciones auténticas del contexto regional.",
      graduate_profile:
        "Al finalizar el grado, el estudiante formula y resuelve problemas del entorno sociocultural y ambiental, comunica conceptos numéricos y geométricos con lenguaje formal, y adopta actitudes de perseverancia y trabajo colaborativo.",
      student_characteristics:
        "Los estudiantes de 3° de Secundaria presentan un pensamiento abstracto en consolidación, capacidad para formular hipótesis y alto interés por desafíos interactivos y tecnológicos.",
      context_characteristics:
        "La comunidad educativa se ubica en un entorno semiurbano con actividades agrícolas, comerciales y turísticas que proveen contextos significativos para la matemática aplicada.",
    };

    const doc = await buildPlanAnualDocxDocument(artifact, {
      workflowKey: "planificamos/plan-curricular-anual",
      values,
      toolTitle: "Plan Curricular Anual (PCA)",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "16-planificamos-plan-curricular-anual.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(10000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

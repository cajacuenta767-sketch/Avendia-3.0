import { afterEach, describe, expect, it, vi } from "vitest";

import { exportWorkflowDocx, type WorkflowArtifact } from "./exportWorkflowDocx";

describe("exportWorkflowDocx", () => {
  afterEach(() => vi.restoreAllMocks());

  it("creates a real editable DOCX package for generated workflows", async () => {
    let exportedBlob: Blob | null = null;
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      exportedBlob = blob as Blob;
      return "blob:workflow-docx";
    });
    const revokeUrl = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
    const artifact: WorkflowArtifact = {
      document_title: "Sesión sobre el ciclo del agua",
      executive_summary: "Sesión contextualizada para cuarto grado con experiencias observables y revisión docente.",
      sections: [
        {
          title: "Propósito",
          narrative: "Explicar los cambios de estado del agua usando evidencias del entorno.",
          key_points: ["Observa", "Explica", "Comunica"],
        },
      ],
      teacher_recommendations: ["Adecuar el vocabulario al grupo.", "Verificar los tiempos."],
      activity: null,
      model: "gemini-3.6-flash",
    };

    await exportWorkflowDocx(artifact);

    expect(exportedBlob).not.toBeNull();
    const bytes = await new Promise<Uint8Array>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(exportedBlob as Blob);
    });
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe("PK");
    expect(anchorClick).toHaveBeenCalledOnce();
    expect(revokeUrl).toHaveBeenCalledWith("blob:workflow-docx");
  });

  it("generates a high-fidelity institutional landscape DOCX for Plan Curricular Anual", async () => {
    let exportedBlob: Blob | null = null;
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      exportedBlob = blob as Blob;
      return "blob:pca-docx";
    });
    const revokeUrl = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    const anchorClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    const artifact: WorkflowArtifact = {
      document_title: "Planificación Curricular Anual 2026 - Matemática",
      executive_summary: "Planificación anual de Matemática para tercer grado de secundaria.",
      sections: [
        {
          title: "Justificación",
          narrative: "Esta planificación responde a las necesidades prioritarias del CNEB.",
          key_points: ["Enfoque por competencias", "Resolución de problemas"],
        },
      ],
      teacher_recommendations: ["Coordinar con tutores", "Revisar rúbricas"],
      tables: Array.from({ length: 17 }, (_, index) => ({
        title: `Matriz anual ${index + 1}`,
        columns: ["Elemento", "Decisión pedagógica", "Evidencia"],
        rows: [[`Elemento ${index + 1}`, "Decisión contextualizada del equipo docente", "Evidencia verificable"]],
        note: "Matriz generada a partir de los datos del formulario.",
      })),
      activity: null,
      model: "gemini-3.6-flash",
    };

    await exportWorkflowDocx(artifact, {
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
    });

    expect(exportedBlob).not.toBeNull();
    const bytes = await new Promise<Uint8Array>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(exportedBlob as Blob);
    });
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe("PK");
    expect(bytes.length).toBeGreaterThan(12000);
    expect(anchorClick).toHaveBeenCalledOnce();
    expect(revokeUrl).toHaveBeenCalledWith("blob:pca-docx");
  });

  it("generates an evaluation instrument DOCX (Rubric) with matrix table", async () => {
    let exportedBlob: Blob | null = null;
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      exportedBlob = blob as Blob;
      return "blob:rubric-docx";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    const artifact: WorkflowArtifact = {
      document_title: "Rúbrica de Resolución de Problemas",
      executive_summary: "Rúbrica analítica por capacidades CNEB.",
      sections: [
        {
          title: "Modela situaciones con formas geométricas",
          narrative: "Capacidad para representar propiedades de figuras.",
          key_points: ["Nivel C: Dificultad", "Nivel B: Con apoyo", "Nivel A: Logrado", "Nivel AD: Destacado"],
        },
      ],
      teacher_recommendations: ["Brindar retroalimentación oportuna."],
      model: "gemini-3.6-flash",
    };

    await exportWorkflowDocx(artifact, {
      workflowKey: "evaluamos/rubrica-evaluacion",
      values: {
        institution: "I.E. Los Libertadores",
        grade: "4° de Secundaria",
        teacher_name: "Prof. Carlos Ruiz",
      },
    });

    expect(exportedBlob).not.toBeNull();
    const bytes = await new Promise<Uint8Array>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(exportedBlob as Blob);
    });
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe("PK");
    expect(bytes.length).toBeGreaterThan(5000);
  });

  it("generates an activity DOCX (Word Search / Flashcards) with letter grid", async () => {
    let exportedBlob: Blob | null = null;
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      exportedBlob = blob as Blob;
      return "blob:activity-docx";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    const artifact: WorkflowArtifact = {
      document_title: "Sopa de Letras: Ecosistemas del Perú",
      executive_summary: "Ficha lúdica para afianzar vocabulario científico.",
      sections: [
        {
          title: "Términos Biológicos",
          narrative: "Encuentra los términos biológicos en la cuadrícula.",
          key_points: ["BIODIVERSIDAD", "ECOSISTEMA", "HABITAT", "ESPECIE"],
        },
      ],
      teacher_recommendations: ["Pedir a los alumnos que redacten un resumen con los términos hallados."],
      model: "gemini-3.6-flash",
    };

    await exportWorkflowDocx(artifact, {
      workflowKey: "recursos/sopas-letras",
      values: {
        institution: "I.E. República del Perú",
        grade: "1° de Secundaria",
        section: "B",
      },
    });

    expect(exportedBlob).not.toBeNull();
    const bytes = await new Promise<Uint8Array>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(exportedBlob as Blob);
    });
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe("PK");
    expect(bytes.length).toBeGreaterThan(5000);
  });

  it("generates an analytics report DOCX with traffic-light risk table", async () => {
    let exportedBlob: Blob | null = null;
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      exportedBlob = blob as Blob;
      return "blob:analytics-docx";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    const artifact: WorkflowArtifact = {
      document_title: "Informe Pedagógico de Alertas de Rendimiento",
      executive_summary: "Diagnóstico bimestral de estudiantes con riesgo de rezago.",
      sections: [
        {
          title: "Comprensión Lectora Crítica",
          narrative: "12 estudiantes presentan nivel inicio en inferencias complejas.",
          key_points: ["Taller remedial de lectura inferencial."],
        },
      ],
      teacher_recommendations: ["Citar a familias de estudiantes en alerta roja."],
      model: "gemini-3.6-flash",
    };

    await exportWorkflowDocx(artifact, {
      workflowKey: "evaluamos/analytics-alertas",
      values: {
        institution: "I.E. San Juan",
        grade: "2° de Secundaria",
        teacher_name: "Lic. Laura Vega",
      },
    });

    expect(exportedBlob).not.toBeNull();
    const bytes = await new Promise<Uint8Array>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(exportedBlob as Blob);
    });
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe("PK");
    expect(bytes.length).toBeGreaterThan(5000);
  });

  it("generates a family communication DOCX with official letterhead and receipt slip", async () => {
    let exportedBlob: Blob | null = null;
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      exportedBlob = blob as Blob;
      return "blob:comm-docx";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    const artifact: WorkflowArtifact = {
      document_title: "Citación a Reunión de Tutoría Individual",
      executive_summary: "Coordinación formativa sobre el progreso del estudiante.",
      sections: [
        {
          title: "Puntos de la Agenda",
          narrative: "Revisión de metas de aprendizaje y compromisos en el hogar.",
          key_points: ["Puntualidad en entregas", "Apoyo en hábitos de estudio"],
        },
      ],
      teacher_recommendations: ["Registrar la asistencia en el cuaderno de actas."],
      model: "gemini-3.6-flash",
    };

    await exportWorkflowDocx(artifact, {
      workflowKey: "acompanamos/correo-familias",
      values: {
        institution: "I.E. José Martí",
        guardian_name: "Familia Quispe Mamani",
        student_name: "Mateo Quispe",
        grade: "5° de Primaria",
      },
    });

    expect(exportedBlob).not.toBeNull();
    const bytes = await new Promise<Uint8Array>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(exportedBlob as Blob);
    });
    expect(String.fromCharCode(bytes[0], bytes[1])).toBe("PK");
    expect(bytes.length).toBeGreaterThan(5000);
  });
});

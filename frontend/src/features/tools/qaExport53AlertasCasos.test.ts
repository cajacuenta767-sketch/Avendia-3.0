import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildAnalyticsDocx } from "./exportWorkflowDocx";

describe("QA Generator: 53-tutoria-alertas-casos", () => {
  it("generates 53-tutoria-alertas-casos.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Registro Oficial de Alertas Tempranas y Ruta de Protección Integral Escolar",
      executive_summary:
        "Documento de gestión tutorial y protección de derechos elaborado conforme al D.S. N° 004-2018-MINEDU (Lineamientos para la Gestión de la Convivencia Escolar y la Prevención de la Violencia) y la plataforma SíseVe para 3° de Secundaria. Sistematiza la matriz de alertas tempranas, el registro objetivo de hechos, las medidas de contención inmediata y las rutas de derivación institucional protegida.",
      sections: [
        {
          title: "Alerta Crítica: Convivencia y Presunto Ciberacoso entre Pares",
          narrative:
            "Detección de difusión no consentida de fotografías con comentarios denigrantes en un grupo de WhatsApp conformado por estudiantes de 3° 'A' y 'B'. La estudiante afectada manifiesta angustia severa y temor de asistir a la escuela. Se recopilaron capturas de pantalla proporcionadas voluntariamente por el apoderado sin exponer la identidad de la menor.",
          key_points: [
            "Acción prioritaria: Activación inmediata del Libro de Incidencias, reporte formal al portal SíseVe (código de registro generado) y separación preventiva de ambientes.",
            "Medida de protección: Acompañamiento psicológico escolar urgente y entrevista con familias por separado.",
          ],
        },
        {
          title: "Alerta Moderada: Vulnerabilidad Socioemocional y Aislamiento Persistente",
          narrative:
            "Estudiante varón de 14 años muestra retraimiento social prolongado durante tres semanas consecutivas, llanto espontáneo en horas de clase y descenso abrupto en la entrega de producciones académicas. No se evidencian lesiones físicas ni indicadores de violencia directa, pero sí un cuadro de depresión reactiva ante duelo familiar reciente.",
          key_points: [
            "Acción prioritaria: Derivación reservada al Centro de Salud Mental Comunitario (CSMC) mediante oficio de coordinación interinstitucional suscrito por la Dirección.",
            "Medida de protección: Plan de andamiaje afectivo con docentes de área y designación de un tutor sombra entre pares.",
          ],
        },
        {
          title: "Alerta Preventiva: Inasistencia Reiterada y Desenganche Escolar Temprano",
          narrative:
            "Dos estudiantes presentan un patrón acumulativo de 5 inasistencias injustificadas en el último mes, coincidiendo con días de evaluaciones sumativas. La indagación preliminar descarta situación de trabajo infantil forzoso, identificando falta de supervisión parental por extensas jornadas laborales de los tutores legales.",
          key_points: [
            "Acción prioritaria: Suscripción de acta de compromiso de permanencia escolar con los apoderados en coordinación con el área de Servicio Social.",
            "Medida de protección: Flexibilización en la recepción de carpetas de refuerzo y monitoreo de asistencia mediante llamada telefónica diaria.",
          ],
        },
      ],
      teacher_recommendations: [
        "Preservar en todo momento el principio de confidencialidad y reserva absoluta de la identidad de los estudiantes involucrados.",
        "Evitar cualquier tipo de careo, confrontación directa o revictimización entre las partes señaladas en incidentes de violencia escolar.",
        "Cumplir estrictamente los plazos normativos de 24 horas para el registro en el portal SíseVe y la comunicación a la DEMUNA local en casos graves.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildAnalyticsDocx(artifact, {
      workflowKey: "tutoria/alertas-casos",
      values: {
        school_year: "2026",
        dre: "DRE Lima Metropolitana",
        ugel: "UGEL 03",
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        level: "Secundaria",
        grade: "3° de Secundaria",
        section: "A",
        curricular_area: "Tutoría y Convivencia Democrática (TOE)",
        teacher_name: "Lic. Carlos Alberto Ramos",
        director_name: "Lic. Elena Torres Valdivia",
      },
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "53-tutoria-alertas-casos.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

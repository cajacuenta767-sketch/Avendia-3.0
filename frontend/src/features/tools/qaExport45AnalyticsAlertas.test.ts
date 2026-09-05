import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildAnalyticsDocx } from "./exportWorkflowDocx";

describe("QA Generator: 45-acompanamos-analytics-alertas", () => {
  it("generates 45-acompanamos-analytics-alertas.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Informe Analítico de Aula y Sistema de Alertas Tempranas para el Acompañamiento Integral",
      executive_summary:
        "Reporte analítico y predictivo de gestión tutorial para 3° de Secundaria 'B'. Consolida la triangulación de indicadores multidimensionales (rendimiento académico, asistencia escolar, convivencia y bienestar socioafectivo) a fin de priorizar oportunamente a los estudiantes en situación de riesgo de desenganche o rezago formativo, articulando planes de intervención docente y derivaciones interdisciplinarias.",
      sections: [
        {
          title: "Dimensión Académica: Riesgo de Desaprobación y Brechas de Competencia",
          narrative:
            "Diagnóstico de desempeño curricular al cierre del I Bimestre (34 estudiantes matriculados):\n" +
            "• Alerta Crítica (Nivel Inicio - C): 5 estudiantes presentan riesgo severo de desaprobación simultánea en Matemática y Comunicación.\n" +
            "• Dificultades predominantes: Bloqueo en la resolución de problemas multiplicativos y comprensión literal deficiente en textos expositivos.\n" +
            "• Tendencia observada: La brecha se acentúa en estudiantes que no cuentan con soporte de estudio guiado fuera del horario escolar.",
          key_points: [
            "Acción prioritaria: Inclusión inmediata en el programa de refuerzo escolar en contraturno y asignación de tutoría entre pares.",
          ],
        },
        {
          title: "Dimensión de Asistencia y Puntualidad: Faltas Recurrentes y Deserción Potencial",
          narrative:
            "Monitoreo del registro biométrico y anecdotario de asistencia escolar:\n" +
            "• Alerta Amarilla (Riesgo Moderado): 4 estudiantes registran más de 4 inasistencias injustificadas acumuladas en el mes y tardanzas sistemáticas los días lunes.\n" +
            "• Causas identificadas: Responsabilidades de cuidado de hermanos menores y dificultades de transporte en zonas periurbanas.\n" +
            "• Factor protector: Buena predisposición de los estudiantes para reintegrarse a las clases cuando asisten con regularidad.",
          key_points: [
            "Acción prioritaria: Entrevista de encuadre con apoderados y flexibilización de horarios de ingreso con compromiso formal suscrito.",
          ],
        },
        {
          title: "Dimensión Socioemocional y Clima de Aula: Bienestar y Convivencia Democrática",
          narrative:
            "Observación de dinámicas relacionales y encuestas breves de clima escolar:\n" +
            "• Señales detectadas: 2 estudiantes muestran retraimiento social acentuado, mutismo selectivo en trabajos en equipo y signos de estrés somático antes de exposiciones orales.\n" +
            "• Clima general del aula: Positivo y respetuoso en un 85%, aunque se requiere reforzar la escucha activa y la resolución pacífica de discrepancias en juegos deportivos.\n" +
            "• Intervención del comité TOE: Implementación de dinámicas de cohesión grupal y círculos restaurativos de diálogo.",
          key_points: [
            "Acción prioritaria: Derivación al servicio de psicología educativa y seguimiento quincenal por el tutor de aula.",
          ],
        },
        {
          title: "Matriz de Casos Prioritarios y Derivaciones Interdisciplinarias",
          narrative:
            "Focalización nominal y ruta de atención coordinada:\n" +
            "• Caso 1 (Académico + Asistencia): Kevin R. — derivado a coordinación pedagógica para plan de nivelación intensivo.\n" +
            "• Caso 2 (Socioemocional): Camila T. — derivada al departamento psicopedagógico con consentimiento informado de la familia.\n" +
            "• Caso 3 (Convivencia): Matías G. — suscripción de acta de compromiso de autorregulación conductual con el tutor de aula.",
          key_points: [
            "Fecha de evaluación de impacto: 19 de junio de 2026 en sesión de trabajo colegiado tutorial.",
          ],
        },
      ],
      teacher_recommendations: [
        "Articular quincenalmente con los docentes de todas las áreas para actualizar la semaforización de alertas en el sistema de gestión escolar.",
        "Evitar exponer las alertas frente al grupo clase para preservar la autoestima y privacidad de los estudiantes.",
        "Sostener reuniones de coordinación estrecha con las familias focalizadas, enfatizando soluciones constructivas y pactos de apoyo.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildAnalyticsDocx(artifact, {
      workflowKey: "acompanamos/analytics-alertas",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Lic. Andrea Morales Rivas",
      directorName: "Lic. Elena Torres Valdivia",
      grade: "3° de Secundaria",
      section: "B",
      course: "Tutoría y Convivencia Escolar CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "45-acompanamos-analytics-alertas.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 23-planificamos-carpeta-pedagogica", () => {
  it("generates 23-planificamos-carpeta-pedagogica.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Carpeta Pedagógica Institucional 2026: Portafolio Oficial de Gestión Docente y Desempeño CNEB",
      executive_summary:
        "Portafolio oficial y sistemático de gestión curricular, pedagógica y tutorial para el año lectivo 2026, estructurado bajo las orientaciones del Marco de Buen Desempeño Docente (MBDD) y las normativas vigentes del MINEDU para optimizar los procesos de mediación, acompañamiento formativo y evaluación continua de los aprendizajes.",
      sections: [
        {
          title: "Ideario, Marco Ético y Filosofía Pedagógica del Docente",
          narrative:
            "Como docente comprometido con la educación pública, concibo la escuela como un espacio de acogida, equidad y desarrollo integral donde cada estudiante es protagonista de su propio aprendizaje. Mi práctica pedagógica se sustenta en el enfoque sociocognitivo y la mediación reflexiva para formar ciudadanos críticos y éticos.",
          key_points: [
            "Misión pedagógica: Fomentar el pensamiento reflexivo y el rigor matemático mediante la resolución de problemas auténticos del entorno amazónico.",
            "Visión docente: Consolidar un aula inclusiva orientada a la excelencia académica y la formación socioemocional bajo el Marco del Buen Desempeño Docente (MBDD).",
            "Valores institucionales: Responsabilidad, justicia, respeto a la diversidad y honestidad académica.",
          ],
        },
        {
          title: "Calendarización Anual, Semanas Lectivas y Semanas de Gestión Escolar 2026",
          narrative:
            "Distribución temporal del tiempo escolar alineada a la RVM N° 587-2023-MINEDU:",
          key_points: [
            "Semana de Gestión 1 y 2: Del 2 al 13 de marzo (Planificación institucional, actualización del PAT y preparación de bienvenida escolar).",
            "Bimestre I: Del 16 de marzo al 22 de mayo (10 semanas lectivas - Unidades Didácticas 1 y 2).",
            "Semana de Gestión 3: Del 25 al 29 de mayo (Balance intermedio de aprendizajes y reajuste curricular).",
            "Bimestre II: Del 1 de junio al 24 de julio (8 semanas lectivas - Unidades Didácticas 3 y 4).",
            "Vacaciones estudiantiles y Semanas de Gestión 4 y 5: Del 27 de julio al 7 de agosto (Evaluación de metas y capacitación colegiada).",
            "Bimestre III: Del 10 de agosto al 16 de octubre (10 semanas lectivas - Unidades Didácticas 5 y 6).",
            "Bimestre IV: Del 19 de octubre al 18 de diciembre (9 semanas lectivas - Unidades Didácticas 7 y 8).",
            "Semana de Gestión 6 y 7: Del 21 al 31 de diciembre (Cierre de SIAGIE, rendición de cuentas y memoria anual de gestión).",
          ],
        },
        {
          title: "Comisiones Institucionales y Plan de Responsabilidades Asignadas",
          narrative:
            "Participación activa en los Comités de Gestión Escolar de la institución educativa:",
          key_points: [
            "Comité de Gestión Pedagógica: Coordinador de área curricular; responsable de articular los proyectos integrados ABP y los Círculos de Interaprendizaje (GIA).",
            "Brigada de Educación Ambiental y Gestión del Riesgo de Desastres: Miembro del equipo de respuesta rápida y promotor de simulacros nacionales escolares.",
            "Tutoría y Orientación Educativa (TOE): Tutor titular del 3° de Secundaria Sección 'A'; responsable de asambleas de aula y atención personalizada a familias.",
          ],
        },
        {
          title: "Diagnóstico de Aula y Caracterización de Estilos y Ritmos de Aprendizaje",
          narrative:
            "Perfil biopsicosocial y académico del grupo aula (32 estudiantes matriculados):",
          key_points: [
            "Estilos predominantes: 50% estilo visual (preferencia por organizadores gráficos y esquemas dinámicos), 35% kinestésico (material concreto y experimentación) y 15% auditivo.",
            "Metas de aprendizaje diagnosticadas: Superar brechas en el manejo de operaciones con números racionales y formulación de hipótesis estadísticas.",
            "Inclusión educativa: Atención a un estudiante con NEE asociadas a TEA Grado 1 bajo la matriz de adaptaciones curriculares DUA.",
          ],
        },
        {
          title: "Acuerdos de Convivencia Escolar y Protocolos de Clima Positivo",
          narrative:
            "Normas consensuadas democráticamente durante la primera semana lectiva:",
          key_points: [
            "Acuerdo 1: Practicamos la escucha activa y solicitamos la palabra levantando la mano con cordialidad.",
            "Acuerdo 2: Cuidamos el mobiliario, los dispositivos tecnológicos y los materiales compartidos del aula.",
            "Acuerdo 3: Resolvemos las discrepancias mediante el diálogo asertivo y la mediación entre pares.",
            "Protocolo de actuación: Aplicación de las directivas contra el acoso escolar (Ley N° 29719) y reporte preventivo en el portal SiseVe ante cualquier alerta de violencia.",
          ],
        },
        {
          title: "Estructura Oficial del Portafolio Docente Físico y Digital",
          narrative:
            "Organización sistemática de la documentación que acredita la labor pedagógica:",
          key_points: [
            "Módulo I - Documentos Normativos e Institucionales: PEI, PAT, PCI, RI y calendarización escolar oficial.",
            "Módulo II - Planificación Curricular: Plan Curricular Anual (PCA), Unidades de Aprendizaje y Sesiones de Aprendizaje fechadas.",
            "Módulo III - Instrumentos de Evaluación: Rúbricas analíticas, listas de cotejo, pruebas escritas y registros auxiliares de competencias.",
            "Módulo IV - Tutoría y Atención a Familias: Plan tutorial del aula, actas de reuniones de padres y fichas de seguimiento socioemocional.",
            "Módulo V - Producción y Evidencias de Aprendizaje: Fotografías de proyectos ABP, cuadernos muestra de estudiantes y reportes de progreso.",
          ],
        },
      ],
      teacher_recommendations: [
        "Mantener la carpeta pedagógica actualizada semanalmente tanto en el archivador físico de aula como en la nube institucional Drive.",
        "Revisar periódicamente los compromisos de convivencia con los estudiantes y reajustarlos al término de cada bimestre.",
        "Presentar los avances documentales ante la subdirección pedagógica durante las semanas de corte de gestión.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "planificamos/carpeta-pedagogica",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      grade: "3° de Secundaria",
      section: "A",
      course: "Matemática / Gestión Docente",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "23-planificamos-carpeta-pedagogica.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

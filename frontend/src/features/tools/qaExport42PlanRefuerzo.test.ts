import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 42-reforzamos-plan-refuerzo", () => {
  it("generates 42-reforzamos-plan-refuerzo.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Plan de Refuerzo Escolar Anual CNEB - Fortalecimiento de Competencias Matemáticas",
      executive_summary:
        "Documento curricular y de gestión pedagógica institucional elaborado conforme a las directivas del MINEDU (RVM N° 045-2022-MINEDU). Articula el diagnóstico de la evaluación diagnóstica de entrada, la focalización de estudiantes en niveles 'En Inicio' y 'En Proceso', las metas de aprendizaje bimestrales, la matriz de acciones diferenciadas y el sistema de monitoreo formativo y compromisos tripartitos.",
      sections: [
        {
          title: "I. Diagnóstico de Entrada y Focalización Pedagógica",
          narrative:
            "Resultados de la evaluación diagnóstica aplicada al iniciar el año lectivo en 2° de Secundaria:\n" +
            "• Población evaluada: 32 estudiantes de la sección 'A'.\n" +
            "• Nivel de logro alcanzado: 12 estudiantes (37.5%) se ubican en el nivel 'En Inicio', 14 estudiantes (43.8%) en 'En Proceso' y 6 estudiantes (18.7%) en 'Logro Esperado'.\n" +
            "• Brechas cognitivas prioritarias: Dificultad severa para traducir relaciones numéricas complejas a modelos algebraicos, interpretación errónea de razones y proporciones en contextos cotidianos y falta de justificación formal de procedimientos de resolución de problemas.",
          key_points: [
            "Competencia focalizada: Resuelve problemas de regularidad, equivalencia y cambio (CNEB).",
            "Población diana prioritaria: 12 estudiantes focalizados para sesiones intensivas de refuerzo escolar.",
          ],
        },
        {
          title: "II. Metas de Aprendizaje y Criterios de Evaluación CNEB",
          narrative:
            "Definición de metas formativas y estándares de desempeño para el año lectivo:\n" +
            "• Meta cuantitativa: Al término del II Bimestre, lograr que el 75% de los estudiantes focalizados transiten del nivel 'En Inicio' al nivel 'En Proceso'; al término del IV Bimestre, lograr que el 80% del aula alcance el 'Logro Esperado'.\n" +
            "• Criterio 1: Modela situaciones de variación proporcional directa e inversa utilizando tablas, gráficos y ecuaciones lineales simples.\n" +
            "• Criterio 2: Expresa su comprensión de las propiedades de la igualdad mediante representaciones algebraicas y lenguaje formal matemático.\n" +
            "• Producto integrador: Carpeta de evidencias de resolución de situaciones problemáticas contextualizadas con rúbrica analítica formativa.",
          key_points: [
            "Estándar de ciclo: Desempeños alineados al Nivel 6 de los Estándares de Aprendizaje CNEB.",
            "Instrumento evaluativo: Rúbrica analítica y listas de cotejo de progreso quincenal.",
          ],
        },
        {
          title: "III. Acciones Diferenciadas y Estrategias Pedagógicas de Refuerzo",
          narrative:
            "Conjunto articulado de intervenciones para atender la diversidad de ritmos de aprendizaje:\n" +
            "• Bloque 1: Talleres de nivelación matemática en horario alterno (2 horas pedagógicas semanales los días martes y jueves).\n" +
            "• Bloque 2: Andamiaje cognitivo graduado mediante fichas de trabajo escalonadas y uso intensivo de material manipulativo concreto (bloques multibase, balanzas algebraicas y software GeoGebra).\n" +
            "• Bloque 3: Estrategia de tutoría entre pares (círculos de estudio colaborativo donde estudiantes de nivel destacado orientan a sus compañeros en la formulación de conjeturas).\n" +
            "• Recursos educativos: Cuadernos de trabajo MINEDU 'Resolvamos Problemas 2' y recursos digitales interactivos del portal Aprendo en Casa.",
          key_points: [
            "Atención personalizada: Grupos reducidos de no más de 6 estudiantes por mesa de trabajo guiada.",
            "Modalidad de retroalimentación: Retroalimentación por descubrimiento o reflexión guiada según la escalera de Daniel Wilson.",
          ],
        },
        {
          title: "IV. Cronograma de Implementación, Hitos Bimestrales y Compromisos Tripartitos",
          narrative:
            "Ruta de ejecución temporal y pacto educativo institucional:\n" +
            "• Hito 1 (Mayo): Primera evaluación de corte formativo y reajuste de agrupamientos pedagógicos.\n" +
            "• Hito 2 (Julio): Balance de medio año y muestra de logros matemáticos ante la comunidad educativa.\n" +
            "• Hito 3 (Octubre): Aplicación de prueba intermedia de proceso y refuerzo de estrategias metacognitivas.\n" +
            "• Hito 4 (Diciembre): Evaluación de salida institucional y certificación de metas alcanzadas.\n\n" +
            "Compromisos formativos tripartitos:\n" +
            "• Compromiso Docente: Preparar materiales contextualizados, brindar retroalimentación oportuna y mantener comunicación continua con las familias.\n" +
            "• Compromiso del Estudiante: Asistir puntualmente a las sesiones de refuerzo, participar activamente y completar sus actividades de autoaprendizaje.\n" +
            "• Compromiso de la Familia: Adecuar un espacio iluminado y libre de distracciones en el hogar, revisar semanalmente la carpeta de evidencias y alentar el esfuerzo constante.",
          key_points: [
            "Frecuencia de monitoreo: Reuniones de coordinación quincenal con la subdirección pedagógica.",
            "Registro de asistencia y avances: Registro auxiliar de refuerzo escolar debidamente visado.",
          ],
        },
      ],
      teacher_recommendations: [
        "Monitorear sistemáticamente la asistencia a las sesiones extracurriculares de refuerzo escolar.",
        "Articular permanentemente con el tutor de aula y el equipo SAANEE para canalizar adaptaciones curriculares en caso de NEE asociadas a cálculo.",
        "Elevar informes bimestrales de progreso cuantitativo y cualitativo a la Dirección de la Institución Educativa.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "reforzamos/plan-refuerzo",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega",
      directorName: "Lic. Elena Torres Valdivia",
      grade: "2° de Secundaria",
      section: "A",
      course: "Matemática - Refuerzo Escolar CNEB",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "42-reforzamos-plan-refuerzo.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

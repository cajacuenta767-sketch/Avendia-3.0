import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 20-planificamos-proyectos-integrados", () => {
  it("generates 20-planificamos-proyectos-integrados.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Proyecto Integrador Interdisciplinario ABP: Ecosistemas Sostenibles y Biohuerto Automatizado Escolar",
      executive_summary:
        "Proyecto de Aprendizaje Basado en Proyectos (ABP) de 6 semanas de duración diseñado para estudiantes de 4° de Secundaria, que articula Ciencia y Tecnología, Matemática, Educación para el Trabajo (EPT) y Comunicación para diseñar e implementar un sistema de biohuerto con riego tecnificado por goteo y compostaje orgánico.",
      sections: [
        {
          title: "Identidad del Proyecto y Situación Desafiante Auténtica",
          narrative:
            "En la Institución Educativa República del Perú, los espacios verdes se encuentran degradados por falta de agua constante y suelo erosionado. Al mismo tiempo, los estudiantes adquieren productos agrícolas de origen incierto y costoso. Ante este desafío, el equipo docente plantea la pregunta motriz: ¿Cómo podemos transformar un área baldía de nuestra escuela en un modelo de biohuerto autosostenible tecnificado que sirva como laboratorio vivo y fuente de alimentos saludables?",
          key_points: [
            "Pregunta motriz: ¿Cómo diseñar e implementar un biohuerto tecnificado con riego automatizado de bajo costo para fortalecer la seguridad alimentaria y el aprendizaje vivencial?",
            "Duración: 6 semanas (30 horas pedagógicas distribuidas en 4 áreas curriculares).",
            "Destinatarios: 4° de Secundaria (Secciones A y B - 60 estudiantes organizados en 12 equipos cooperativos).",
          ],
        },
        {
          title: "Matriz de Propósitos de Aprendizaje y Competencias Interdisciplinarias CNEB",
          narrative:
            "Articulación curricular entre las cuatro áreas participantes con sus respectivas evidencias articuladas:",
          key_points: [
            "Ciencia y Tecnología: 'Diseña y construye soluciones tecnológicas para resolver problemas de su entorno' (Prototipo de riego por goteo por gravedad con materiales reciclados y compostera aeróbica).",
            "Matemática: 'Resuelve problemas de forma, movimiento y localización' (Cálculo de áreas de cultivo, pendiente de tuberías, volumen de agua en tanques y escalas topográficas).",
            "Educación para el Trabajo: 'Gestiona proyectos de emprendimiento económico o social' (Presupuesto de materiales, análisis de costos, plan de siembra y modelo Canvas de distribución de hortalizas).",
            "Comunicación: 'Se comunica oralmente en su lengua materna' (Pitch de presentación del proyecto y elaboración de una bitácora científica ilustrada).",
            "Enfoques Transversales: Enfoque Ambiental (gestión de residuos sólidos y recursos hídricos) y Búsqueda de la Excelencia (innovación y mejora continua).",
          ],
        },
        {
          title: "Ruta Metodológica y Secuencia de Fases ABP",
          narrative:
            "Desarrollo secuencial organizado en 5 fases de aprendizaje auténtico:",
          key_points: [
            "Fase 1 - Inmersión y Diagnóstico (Semana 1): Análisis del suelo escolar, toma de muestras de pH y entrevistas a técnicos del Ministerio de Agricultura (MIDAGRI).",
            "Fase 2 - Ideación y Modelado Técnico (Semana 2): Planos acotados del terreno, diseño del circuito de tuberías y cotización de insumos locales.",
            "Fase 3 - Construcción y Montaje (Semanas 3-4): Nivelación de bancales, instalación de mangueras de goteo, armado de la compostera escolar y semillero de lechugas, acelgas y tomates cherry.",
            "Fase 4 - Experimentación y Registro Fenológico (Semana 5): Monitoreo diario de humedad, tasa de crecimiento foliar y calibración del caudal de riego.",
            "Fase 5 - Evaluación y Feria Tecnológica (Semana 6): Cosecha comunitaria, degustación culinaria y sustentación pública ante la comunidad educativa.",
          ],
        },
        {
          title: "Roles del Equipo Docente, Estudiantes y Alianzas Estratégicas",
          narrative:
            "Organización operativa y sinergia comunitaria para asegurar la sostenibilidad:",
          key_points: [
            "Equipo Docente: Reuniones semanales de trabajo colegiado (GIA) para sincronizar avances y criterios de evaluación formativa compartidos.",
            "Equipos de Estudiantes: Roles rotativos de Coordinador de Proyecto, Responsable Técnico de Riego, Encargado de Bitácora y Gestor de Recursos.",
            "Aliados Estratégicos: Municipalidad Provincial (donación de compost y plantones), APAFA (financiamiento menor de herramientas) y posta médica.",
          ],
        },
        {
          title: "Sistema de Evaluación Formativa y Criterios Integrados",
          narrative:
            "Monitoreo del desempeño a través de rúbricas analíticas interdisciplinarias y portafolio digital:",
          key_points: [
            "Criterio CyT: Justifica la funcionalidad del prototipo de riego y evalúa su eficiencia en el ahorro hídrico (Rúbrica de Solución Tecnológica).",
            "Criterio Matemática: Aplica fórmulas geométricas y conversiones de unidades volumétricas con precisión milimétrica (Lista de Cotejo Técnica).",
            "Criterio EPT: Demuestra viabilidad económica y optimización de costos en el presupuesto del proyecto (Escala Valorativa).",
            "Criterio Comunicación: Argumenta con solvencia técnica y lenguaje formal durante la exposición en la feria escolar (Rúbrica de Expresión Oral).",
          ],
        },
      ],
      teacher_recommendations: [
        "Planificar una visita de campo preliminar con los estudiantes para levantar el croquis del terreno antes de comprar materiales.",
        "Asegurar el mantenimiento del biohuerto durante los fines de semana mediante un rol consensuado de guardianía escolar voluntaria.",
        "Promover la sistematización de la experiencia para postular al concurso nacional de proyectos de innovación educativa (FONDEP).",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "planificamos/proyectos-integrados",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Equipo Colegiado Interdisciplinar (CyT, Matemática, EPT, Comunicación)",
      grade: "4° de Secundaria",
      section: "A y B",
      course: "Proyectos Integrados ABP",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "20-planificamos-proyectos-integrados.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildDocumentDocx } from "./exportWorkflowDocx";

describe("QA Generator: 21-planificamos-adaptacion-nee-dua", () => {
  it("generates 21-planificamos-adaptacion-nee-dua.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Plan de Adaptación Curricular Inclusiva y Matriz DUA: Trastorno del Espectro Autista (TEA Grado 1) y Dificultades Específicas de Aprendizaje",
      executive_summary:
        "Documento técnico pedagógico de diversificación e inclusión educativa diseñado bajo los lineamientos del Diseño Universal para el Aprendizaje (DUA) y la RVM 222-2021-MINEDU, orientado a eliminar barreras de aprendizaje y garantizar la participación plena de estudiantes con NEE asociadas a TEA Grado 1 en el 2° grado de Educación Secundaria.",
      sections: [
        {
          title: "Caracterización del Estudiante, Fortalezas y Barreras para el Aprendizaje y la Participación (BAP)",
          narrative:
            "El estudiante Mateo R. (14 años) cursa el 2° grado de Secundaria. Posee un destacado rendimiento en razonamiento lógico-matemático y alta retención de detalles visuales y esquemáticos. Sin embargo, presenta barreras actitudinales y metodológicas en el aula regular debido a hipersensibilidad a ruidos intensos, sobrecarga ante consignas textuales extensas sin estructurar y dificultad para iniciar interacciones orales espontáneas en grupos numerosos.",
          key_points: [
            "Fortalezas: Gran capacidad de concentración en tareas estructuradas, habilidad para modelar gráficos y respeto estricto de normas explícitas.",
            "Barrera Sensorial: Intolerancia a ruidos imprevistos o bullicio que detona estados de ansiedad y desconexión.",
            "Barrera Cognitivo-Comunicativa: Fatiga cognitiva ante preguntas abiertas polisémicas o instrucciones no fragmentadas.",
            "Barrera Social: Tendencia al aislamiento durante trabajos en equipo no mediados por el docente.",
          ],
        },
        {
          title: "Matriz de Aplicación del Diseño Universal para el Aprendizaje (DUA)",
          narrative:
            "Ajustes sistemáticos en los tres principios rectores del DUA para beneficiar al estudiante y al grupo aula:",
          key_points: [
            "Principio I - Compromiso y Motivación: Implementación de un horario visual anticipado en la esquina de la pizarra; temporizador visual de 20 minutos de trabajo concentrado con pausas activas breves; selección de temas de indagación vinculados a su interés por la astronomía y la robótica.",
            "Principio II - Representación y Acceso a la Información: Entrega de guías de aprendizaje con tipografía clara (Arial 12 pt), doble interlineado, diagramas de flujo y organizadores visuales previos a la lectura de textos extensos; uso de resaltadores de color para identificar instrucciones clave.",
            "Principio III - Acción y Expresión del Aprendizaje: Flexibilidad en la entrega de productos de evaluación: opción de entregar infografías digitales, maquetas tridimensionales o audios breves en lugar de ensayos manuscritos monótonos.",
          ],
        },
        {
          title: "Adaptaciones Curriculares Específicas en Desempeños y Criterios CNEB",
          narrative:
            "Graduación pedagógica de la exigencia curricular sin comprometer el estándar de aprendizaje del Ciclo VI:",
          key_points: [
            "Área de Comunicación: En la competencia 'Escribe diversos tipos de textos', se fragmenta la consigna en 3 entregables intermedios (lluvia de ideas en mapa mental, primer borrador guiado por plantilla de conectores y versión final editada).",
            "Área de Matemática: En 'Resuelve problemas de cantidad', se autoriza el uso continuo de hojas de apoyo con fórmulas algebraicas y calculadora básica para reducir la carga en memoria de trabajo.",
            "Tiempo y Espacio: Se otorga un 25% adicional de tiempo durante las evaluaciones escritas y ubicación preferencial en la primera fila, lejos de puertas y ventanas ruidosas.",
          ],
        },
        {
          title: "Estrategias de Acompañamiento en el Aula y Tutoría entre Pares",
          narrative:
            "Dispositivos socioemocionales y de clima positivo en el aula inclusiva:",
          key_points: [
            "Tutoría entre pares: Designación voluntaria de dos compañeros tutores de confianza para facilitar el traspaso de apuntes y la mediación en dinámicas grupales.",
            "Espacio de Autorregulación Sensorial: Habilitación en el rincón del aula de un espacio tranquilo con auriculares con cancelación de ruido pasivo y tarjetas de respiración consciente.",
            "Contrato pedagógico conductual: Acuerdos claros y predecibles sobre señales discretas con la mano cuando el estudiante requiera una pausa.",
          ],
        },
        {
          title: "Articulación con la Familia, Equipo SAANEE y Monitoreo Psicopedagógico",
          narrative:
            "Protocolo de corresponsabilidad educativa familia-escuela-especialistas:",
          key_points: [
            "Pautas para el hogar: Mantener un espacio libre de distractores para el estudio, reforzar la agenda escolar nocturna y validar emocionalmente sus progresos diarios.",
            "Acompañamiento SAANEE: Reuniones mensuales de asesoramiento técnico al equipo docente para calibrar adaptaciones curriculares y materiales multisensoriales.",
            "Bitácora de progreso: Registro quincenal cualitativo de autonomía, participación oral y autorregulación emocional en el cuaderno de incidencias pedagógicas.",
          ],
        },
      ],
      teacher_recommendations: [
        "Anticipar verbalmente cualquier cambio en el horario habitual (visitas, simulacros, actos cívicos) con al menos 24 horas de antelación.",
        "Evitar exponer al estudiante a lecturas orales improvisadas en voz alta frente al aula; preferir lecturas compartidas o preparadas previamente.",
        "Socializar de forma discreta con el grupo de clase la importancia del respeto a los diferentes estilos y ritmos de aprendizaje bajo el Enfoque Inclusivo.",
      ],
      model: "gemini-3.6-flash",
    };

    const doc = buildDocumentDocx(artifact, {
      workflowKey: "planificamos/adaptacion-nee-dua",
      schoolName: "I.E. 0001 REPÚBLICA DEL PERÚ",
      teacherName: "Prof. Manuel Cárdenas Vega / Equipo SAANEE",
      grade: "2° de Secundaria",
      section: "A",
      course: "Atención a la Diversidad / DUA",
    });

    const buffer = await Packer.toBuffer(doc);
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "21-planificamos-adaptacion-nee-dua.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

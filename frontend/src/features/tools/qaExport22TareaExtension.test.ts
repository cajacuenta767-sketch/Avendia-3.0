import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";
import { Packer } from "docx";
import JSZip from "jszip";
import type { StructuredArtifact } from "./exportWorkflowDocx";
import { buildHomeworkDocx } from "./exportWorkflowDocx";

describe("QA Generator: 22-planificamos-tarea-extension", () => {
  it("generates 22-planificamos-tarea-extension.docx and saves to exports-qa-word directory", async () => {
    const artifact: StructuredArtifact = {
      document_title: "Tarea de Extensión y Conexión con el Hogar: Registro de Hábitos de Consumo Energético Familiar",
      executive_summary:
        "Actividad de aprendizaje autónomo y vinculación familiar diseñada para 1° de Secundaria que articula Ciencia y Tecnología con Matemática, orientada a que los estudiantes registren, analicen y calculen el consumo eléctrico de su vivienda durante 3 días para acordar compromisos de eficiencia energética en familia bajo el enfoque CNEB.",
      sections: [
        {
          title: "Propósito de Aprendizaje y Vinculación Curricular CNEB",
          narrative:
            "Esta tarea de extensión busca transferir los conocimientos sobre energía y potencia eléctrica al contexto cotidiano del estudiante, promoviendo el uso responsable de los recursos energéticos y la colaboración intergeneracional.",
          key_points: [
            "Competencia CyT: 'Explica el mundo físico basándose en conocimientos sobre energía, materia y seres vivos'.",
            "Competencia Matemática: 'Resuelve problemas de cantidad' (operaciones con decimales y proporcionalidad directa en el costo de la energía eléctrica en soles por kWh).",
            "Competencia Transversal: 'Gestiona su aprendizaje de manera autónoma' (planifica su horario de registro nocturno y monitorea el cumplimiento de la consigna).",
            "Enfoque Transversal: Enfoque Ambiental (justicia y solidaridad intergeneracional frente al cambio climático).",
          ],
        },
        {
          title: "Consigna de Trabajo Autónomo Paso a Paso para el Estudiante",
          narrative:
            "Sigue detenidamente estos cuatro pasos para completar tu indagación familiar:",
          key_points: [
            "Paso 1 - Inventario de Artefactos (Día 1): Con autorización de un adulto, revisa las etiquetas posteriores de 4 electrodomésticos de tu hogar (refrigeradora, televisor, foco ahorrador, plancha) y anota su potencia nominal en watts (W). Convierte los watts a kilovatios (kW) dividiendo entre 1,000.",
            "Paso 2 - Registro de Horas de Uso (Días 1, 2 y 3): Observa y registra en tu tabla cuántas horas al día permanece encendido cada artefacto.",
            "Paso 3 - Cálculo del Consumo y Costo Estimado: Aplica la fórmula: Consumo (kWh) = Potencia (kW) × Horas de uso. Multiplica el total de kWh por la tarifa eléctrica que figura en el recibo de luz de tu localidad (aprox. S/ 0.85 por kWh).",
            "Paso 4 - Compromisos de Ahorro Familiar: Reúne a tu familia durante la cena y preséntales los resultados. Formulen juntos al menos 2 acuerdos prácticos para desconectar artefactos en 'modo vampiro' o sustituir focos incandescentes.",
          ],
        },
        {
          title: "Materiales Accesibles y Apoyos DUA en el Hogar",
          narrative:
            "Recursos sencillos sin necesidad de compras o impresiones obligatorias:",
          key_points: [
            "Materiales básicos: Cuaderno de trabajo de Ciencia y Tecnología, regla, lápiz y un recibo de luz reciente de la vivienda.",
            "Ajustes DUA (Acceso y Representación): Si el estudiante no cuenta con recibo físico, puede usar el modelo didáctico impreso facilitado por el docente.",
            "Ajustes DUA (Expresión): Los cálculos pueden realizarse en hoja manuscrita, en hoja de cálculo básica o mediante un video testimonial breve explicando los acuerdos familiares.",
          ],
        },
        {
          title: "Orientaciones y Rol Pedagógico de la Familia",
          narrative:
            "Pautas claras para acompañar a sus hijas e hijos sin sustituir su esfuerzo reflexivo:",
          key_points: [
            "Acompañar y supervisar: Guiar al estudiante durante la lectura de las etiquetas técnicas de los artefactos para evitar accidentes eléctricos.",
            "Estimular la autonomía: No resolver los cálculos matemáticos por el estudiante; formular preguntas orientadoras como: '¿Qué artefacto crees que gasta más y por qué?'.",
            "Firmar la bitácora: Suscribir conjuntamente el acta de acuerdos familiares al culminar la actividad como respaldo formativo.",
          ],
        },
        {
          title: "Criterios de Evaluación y Autoevaluación Metacognitiva",
          narrative:
            "Instrumento para que el estudiante verifique sus logros antes de la entrega final:",
          key_points: [
            "Criterio 1: Identifiqué la potencia de al menos 4 artefactos y realicé la conversión matemática correcta a kW.",
            "Criterio 2: Registré sistemáticamente las horas de uso durante los tres días consecutivos de indagación.",
            "Criterio 3: Calculé el consumo total en kWh y estimé el costo económico aproximado en la moneda local.",
            "Criterio 4: Consensué con mi familia compromisos concretos y viables para reducir el desperdicio de energía eléctrica.",
          ],
        },
      ],
      teacher_recommendations: [
        "Dedicar los primeros 10 minutos de la sesión siguiente a que los estudiantes comparen en grupos pequeños sus estimaciones de consumo.",
        "Destacar aquellos acuerdos familiares creativos que demuestren un impacto directo en la reducción de la huella de carbono del hogar.",
        "Registrar el nivel de cumplimiento y calidad reflexiva en el registro auxiliar formativo del área.",
      ],
      activity: {
        mode: "ficha_hogar",
        title: "Investigamos el consumo de energía",
        instructions: "Realiza cada actividad en orden, registra tus cálculos y explica el acuerdo final con tus propias palabras.",
        items: [
          {
            id: "item-1",
            prompt: "Identifica cuatro artefactos del hogar y registra la potencia indicada en su etiqueta.",
            answer: "Tabla con cuatro artefactos y su potencia expresada en watts.",
            hint: "Pide a un adulto que te ayude a leer las etiquetas sin manipular conexiones.",
            options: ["Cuaderno", "Lápiz", "Etiquetas de artefactos"],
            response_type: "tabla",
          },
          {
            id: "item-2",
            prompt: "Registra durante tres días cuántas horas se utiliza cada artefacto seleccionado.",
            answer: "Registro de tres días con las horas de uso de cada artefacto.",
            hint: "Usa una fila por artefacto y una columna por día.",
            options: ["Cuaderno", "Regla"],
            response_type: "tabla",
          },
          {
            id: "item-3",
            prompt: "Calcula el consumo estimado y escribe dos compromisos familiares para ahorrar energía.",
            answer: "Cálculos de consumo y dos compromisos concretos redactados por el estudiante.",
            hint: "Multiplica la potencia en kW por las horas de uso.",
            options: ["Calculadora opcional", "Recibo de luz opcional"],
            response_type: "operacion",
          },
        ],
        word_bank: [],
      },
      model: "gemini-3.6-flash",
    };

    const doc = buildHomeworkDocx(artifact, {
      workflowKey: "planificamos/tarea-extension-hogar",
      values: {
        institution: "I.E. 0001 REPÚBLICA DEL PERÚ",
        teacher_name: "Prof. Manuel Cárdenas Vega",
        grade: "1° de Secundaria",
        section: "A",
        curricular_area: "Ciencia y Tecnología",
        school_year: "2026",
      },
    });

    const buffer = await Packer.toBuffer(doc);
    const archive = await JSZip.loadAsync(buffer);
    const documentXml = await archive.file("word/document.xml")!.async("string");
    const targetDir = "c:\\Users\\PC\\Documents\\ChatGPT\\Avend Escala 3.0\\exports-qa-word";
    const targetFile = path.join(targetDir, "22-planificamos-tarea-extension.docx");

    fs.mkdirSync(targetDir, { recursive: true });
    fs.writeFileSync(targetFile, buffer);

    expect(fs.existsSync(targetFile)).toBe(true);
    const stats = fs.statSync(targetFile);
    expect(stats.size).toBeGreaterThan(5000);
    for (const item of artifact.activity!.items) {
      expect(documentXml).toContain(`w:name="${item.id}"`);
      expect(documentXml).toContain(item.prompt);
      expect(documentXml).toContain(item.answer);
    }
    console.log(`Documento generado con éxito: ${targetFile} (${stats.size} bytes)`);
  });
});

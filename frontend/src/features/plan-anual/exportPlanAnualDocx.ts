import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

function safeFileName(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase() || "plan-curricular-anual-2026"
  );
}

function base64ToUint8Array(base64Data: string): Uint8Array {
  const pureBase64 = base64Data.includes(",") ? base64Data.split(",")[1] : base64Data;
  const binaryString = window.atob(pureBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function exportPlanAnualWord(data: any): Promise<void> {
  const children: (Paragraph | Table)[] = [];

  const cellMargins = { top: 100, bottom: 100, left: 140, right: 140 };
  const borderClean = {
    top: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    left: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
    right: { style: BorderStyle.SINGLE, size: 4, color: "CBD5E1" },
  };

  const headerCellStyle = {
    shading: { fill: "F1F5F9" },
    margins: cellMargins,
    borders: borderClean,
  };

  const bodyCellStyle = {
    margins: cellMargins,
    borders: borderClean,
  };

  // 1. ENCABEZADO Y TITULO
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "PLAN CURRICULAR ANUAL (PCA) - AÑO LECTIVO 2026",
          bold: true,
          size: 28,
          color: "1E293B",
        }),
      ],
      spacing: { before: 100, after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "MINISTERIO DE EDUCACIÓN — CURRÍCULO NACIONAL DE LA EDUCACIÓN BÁSICA (CNEB)",
          size: 18,
          color: "64748B",
          bold: true,
        }),
      ],
      spacing: { after: 260 },
    }),
  );

  // 2. I. DATOS INFORMATIVOS
  children.push(
    new Paragraph({
      text: "I. DATOS INFORMATIVOS",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 200, after: 120 },
    }),
  );

  const infoRows = [
    ["Dirección Regional de Educación (DRE):", data.dre || "SAN MARTÍN", "Unidad de Gestión Educativa Local (UGEL):", data.ugel || "LAMAS"],
    ["Institución Educativa:", data.ie || "MARTÍN DE LA RIVA Y HERRERA", "Modelo de Servicio Educativo (MSE):", data.mse || "JER"],
    ["Nivel Educativo:", data.nivel || "Secundaria", "Modalidad:", data.modalidad || "EBR"],
    ["Grado / Ciclo:", data.gradoCiclo || "1ro de Secundaria", "Secciones:", data.secciones || "A, B, C"],
    ["Tiempo de Ejecución:", data.tiempo || "Del 16 de marzo al 18 de diciembre", "Año Lectivo:", data.anioLectivo || "2026"],
    ["Área(s) Curricular(es):", Array.isArray(data.areas) ? data.areas.join(", ") : "Comunicación", "Docente Responsable:", data.docenteResponsable || "Docente Titular"],
    ["Director(a) General:", data.director || "Dirección General", "Subdirector(a) Pedagógico(a):", data.subdirector || "Subdirección Pedagógica"],
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: infoRows.map(
        (row) =>
          new TableRow({
            children: [
              new TableCell({
                ...headerCellStyle,
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: row[0], bold: true, size: 18 })] })],
              }),
              new TableCell({
                ...bodyCellStyle,
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: row[1], size: 18 })] })],
              }),
              new TableCell({
                ...headerCellStyle,
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: row[2], bold: true, size: 18 })] })],
              }),
              new TableCell({
                ...bodyCellStyle,
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: row[3], size: 18 })] })],
              }),
            ],
          }),
      ),
    }),
  );

  // 3. II. DESCRIPCION GENERAL
  children.push(
    new Paragraph({
      text: "II. DESCRIPCIÓN GENERAL Y DIAGNÓSTICO PEDAGÓGICO",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "2.1 Justificación pedagógica:", bold: true, size: 20 })],
      spacing: { before: 100, after: 60 },
    }),
    new Paragraph({
      text: data.justificacion || "El presente Plan Curricular Anual organiza los aprendizajes esperados, competencias y capacidades según las orientaciones del Currículo Nacional de la Educación Básica (CNEB).",
      spacing: { after: 140 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "2.2 Perfil de egreso articulado:", bold: true, size: 20 })],
      spacing: { before: 100, after: 60 },
    }),
    new Paragraph({
      text: data.perfilEgreso || "Los estudiantes afianzan su identidad personal, pensamiento crítico, ética cívica y capacidades de resolución de problemas en el entorno.",
      spacing: { after: 140 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "2.3 Caracterización de los estudiantes:", bold: true, size: 20 })],
      spacing: { before: 100, after: 60 },
    }),
    new Paragraph({
      text: data.caracteristicasEstudiantes || "Estudiantes con diversos ritmos y estilos de aprendizaje, requiriendo experiencias significativas, activas y colaborativas.",
      spacing: { after: 140 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "2.4 Caracterización del contexto institucional y local:", bold: true, size: 20 })],
      spacing: { before: 100, after: 60 },
    }),
    new Paragraph({
      text: data.caracteristicasContexto || "Comunidad educativa activa con potencial cultural y productivo, enfocada en la mejora de la calidad educativa y el bienestar integral.",
      spacing: { after: 200 },
    }),
  );

  // 4. III. CALENDARIZACION
  children.push(
    new Paragraph({
      text: "III. CALENDARIZACIÓN DEL AÑO ESCOLAR",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 120 },
    }),
  );

  if (data.calendarizacion_img && typeof data.calendarizacion_img === "string") {
    try {
      const imageBytes = base64ToUint8Array(data.calendarizacion_img);
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new ImageRun({
              data: imageBytes,
              transformation: { width: 550, height: 300 },
            } as any),
          ],
          spacing: { before: 120, after: 160 },
        }),
      );
    } catch {
      // Fallback
    }
  } else {
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: {
                  top: { style: BorderStyle.DASHED, size: 6, color: "94A3B8" },
                  bottom: { style: BorderStyle.DASHED, size: 6, color: "94A3B8" },
                  left: { style: BorderStyle.DASHED, size: 6, color: "94A3B8" },
                  right: { style: BorderStyle.DASHED, size: 6, color: "94A3B8" },
                },
                shading: { fill: "F8FAFC" },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: "[ESPACIO ROTULADO: Pegue aquí la calendarización y cronograma oficial de la I.E. / UGEL]",
                        bold: true,
                        size: 18,
                        color: "64748B",
                      }),
                    ],
                    spacing: { before: 300, after: 300 },
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    );
  }

  // 5. IV. MATRIZ DE DIAGNOSTICO
  children.push(
    new Paragraph({
      text: "IV. MATRIZ DE DIAGNÓSTICO TERRITORIO / AULA",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 120 },
    }),
  );

  const problemas = Array.isArray(data.problemas_matriz) ? data.problemas_matriz : [];
  const probHeaders = ["Problema Priorizado", "Causa Raíz", "Alternativa de Solución", "Demanda Educativa"];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: probHeaders.map(
            (h) =>
              new TableCell({
                ...headerCellStyle,
                width: { size: 25, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18 })] })],
              }),
          ),
        }),
        ...(problemas.length > 0
          ? problemas.map(
              (p: any) =>
                new TableRow({
                  children: [
                    new TableCell({ ...bodyCellStyle, children: [new Paragraph({ text: p.problema || "-" })] }),
                    new TableCell({ ...bodyCellStyle, children: [new Paragraph({ text: p.causa || "-" })] }),
                    new TableCell({ ...bodyCellStyle, children: [new Paragraph({ text: p.alternativa || "-" })] }),
                    new TableCell({ ...bodyCellStyle, children: [new Paragraph({ text: p.demanda || "-" })] }),
                  ],
                }),
            )
          : [
              new TableRow({
                children: [
                  new TableCell({
                    ...bodyCellStyle,
                    columnSpan: 4,
                    children: [new Paragraph({ text: "No se registraron problemas específicos en el diagnóstico.", alignment: AlignmentType.CENTER })],
                  }),
                ],
              }),
            ]),
      ],
    }),
  );

  // 6. V. MALLA CURRICULAR
  children.push(
    new Paragraph({
      text: `V. MALLA CURRICULAR Y DISTRIBUCIÓN DE UNIDADES DIDÁCTICAS (${data.organizacion_periodo || "Bimestral"})`,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 120 },
    }),
  );

  const unidades = Array.isArray(data.unidades_malla) ? data.unidades_malla : [];
  const uniHeaders = ["Unidad", "Título de la Unidad", "Situación Significativa", "Competencias", "Producto/Evidencia", "Campo Temático", "Duración"];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: uniHeaders.map(
            (h, idx) =>
              new TableCell({
                ...headerCellStyle,
                width: { size: idx === 0 ? 8 : idx === 1 ? 18 : idx === 2 ? 22 : idx === 3 ? 18 : idx === 4 ? 14 : idx === 5 ? 12 : 8, type: WidthType.PERCENTAGE },
                children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 16 })] })],
              }),
          ),
        }),
        ...(unidades.length > 0
          ? unidades.map(
              (u: any, idx: number) =>
                new TableRow({
                  children: [
                    new TableCell({ ...bodyCellStyle, children: [new Paragraph({ text: `U${idx + 1}` })] }),
                    new TableCell({ ...bodyCellStyle, children: [new Paragraph({ text: u.titulo || "-" })] }),
                    new TableCell({ ...bodyCellStyle, children: [new Paragraph({ text: u.situacionSignificativa || "-" })] }),
                    new TableCell({ ...bodyCellStyle, children: [new Paragraph({ text: u.competenciasCapacidades || "-" })] }),
                    new TableCell({ ...bodyCellStyle, children: [new Paragraph({ text: u.producto || "-" })] }),
                    new TableCell({ ...bodyCellStyle, children: [new Paragraph({ text: u.campoTematico || "-" })] }),
                    new TableCell({ ...bodyCellStyle, children: [new Paragraph({ text: u.duracion || "4 sem." })] }),
                  ],
                }),
            )
          : [
              new TableRow({
                children: [
                  new TableCell({
                    ...bodyCellStyle,
                    columnSpan: 7,
                    children: [new Paragraph({ text: "Las unidades de aprendizaje serán programadas progresivamente al inicio de cada periodo pedagógico.", alignment: AlignmentType.CENTER })],
                  }),
                ],
              }),
            ]),
      ],
    }),
  );

  // 7. VI. PRIORIDADES DE GESTION
  children.push(
    new Paragraph({
      text: "VI. PRIORIDADES DE GESTIÓN, BIENESTAR Y ATENCIÓN A LA DIVERSIDAD",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 120 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "Prioridades de Gestión Escolar 2026:", bold: true })],
      spacing: { before: 80, after: 40 },
    }),
    new Paragraph({ text: `• Prioridad 1: ${data.prioridad1 || "Consolidar niveles satisfactorios de comprensión lectora y razonamiento lógico."}` }),
    new Paragraph({ text: `• Prioridad 2: ${data.prioridad2 || "Promover el trabajo colegiado e interaprendizaje pedagógico continuo."}` }),
    new Paragraph({ text: `• Prioridad 3: ${data.prioridad3 || "Fortalecer la convivencia democrática y la contención socioemocional escolar."}`, spacing: { after: 120 } }),
  );

  // 8. VII. ENFOQUES Y TUTORIA
  children.push(
    new Paragraph({
      text: "VII. COMPETENCIAS TRANSVERSALES, ENFOQUES Y TUTORÍA",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 120 },
    }),
    new Paragraph({ children: [new TextRun({ text: "• Se desenvuelve en entornos virtuales generados por las TIC.", bold: true })] }),
    new Paragraph({ children: [new TextRun({ text: "• Gestiona su aprendizaje de manera autónoma.", bold: true })], spacing: { after: 100 } }),
  );

  const enfoques = Array.isArray(data.enfoques_transversales) ? data.enfoques_transversales : [];
  if (enfoques.length > 0) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: "Enfoques Transversales Priorizados:", bold: true })] }),
      ...enfoques.map((e: string) => new Paragraph({ text: `✔ ${e}` })),
    );
  }

  if (data.tutoria_plan) {
    children.push(
      new Paragraph({ children: [new TextRun({ text: "Plan de Tutoría y Orientación Educativa:", bold: true })], spacing: { before: 100, after: 40 } }),
      new Paragraph({ text: data.tutoria_plan, spacing: { after: 140 } }),
    );
  }

  // 9. VIII. MATERIALES
  children.push(
    new Paragraph({
      text: "VIII. MATERIALES, RECURSOS Y BIBLIOGRAFÍA",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 300, after: 120 },
    }),
    new Paragraph({ children: [new TextRun({ text: "Para el Docente:", bold: true })] }),
    new Paragraph({ text: data.referencias_docente || "• MINEDU (2016). Currículo Nacional de la Educación Básica. Lima - Perú.\n• Textos y guías metodológicas de especialidad." }),
    new Paragraph({ children: [new TextRun({ text: "Para el Estudiante:", bold: true })], spacing: { before: 80 } }),
    new Paragraph({ text: data.referencias_estudiante || "• MINEDU. Cuadernos de trabajo y fichas de autoaprendizaje del grado." }),
  );

  // 10. BLOQUE DE FIRMAS
  children.push(
    new Paragraph({ text: "", spacing: { before: 400, after: 200 } }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, text: "____________________________________" }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: data.docenteResponsable ? `Prof. ${data.docenteResponsable}` : "Docente Responsable", bold: true })],
                }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Firma y Sello del Docente", size: 16, color: "718096" })] }),
              ],
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              children: [
                new Paragraph({ alignment: AlignmentType.CENTER, text: "____________________________________" }),
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [new TextRun({ text: data.director ? `Lic./Mg. ${data.director}` : "Dirección General", bold: true })],
                }),
                new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Firma y Sello de la Dirección", size: 16, color: "718096" })] }),
              ],
            }),
          ],
        }),
      ],
    }),
  );

  const outputDocument = new Document({ sections: [{ properties: {}, children }] });
  const blob = await Packer.toBlob(outputDocument);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  const fileName = safeFileName(`Plan-Curricular-Anual-${data.gradoCiclo || "2026"}`);
  anchor.download = `${fileName}.docx`;
  anchor.click();
  URL.revokeObjectURL(url);
}

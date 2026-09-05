import type {
  SequenceOrderingForm,
  SequenceOrderingResult,
} from "./SequenceOrderingTool";
import type {
  Paragraph as DocxParagraph,
  Table as DocxTable,
  TableCell as DocxTableCell,
  TableRow as DocxTableRow,
} from "docx";

function safeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase() || "ordenar-bloques";
}

function worksheetOrder<T>(items: T[]): T[] {
  if (items.length < 2) return items;
  const evenPositions = items.filter((_, index) => index % 2 === 1);
  const oddPositions = items.filter((_, index) => index % 2 === 0);
  return [...evenPositions.reverse(), ...oddPositions.reverse()];
}

export async function exportSequenceOrderingDocx(
  form: SequenceOrderingForm,
  result: SequenceOrderingResult,
) {
  const {
    AlignmentType,
    BorderStyle,
    Document,
    Footer,
    Header,
    Packer,
    PageBreak,
    PageNumber,
    Paragraph,
    ShadingType,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
  } = await import("docx");

  const COLOR_PRIMARY = "1F4D78";
  const COLOR_MUTED = "64748B";
  const COLOR_TEXT = "1E293B";
  const COLOR_BORDER = "CBD5E1";
  const COLOR_HEADER_BG = "F1F5F9";

  const cellBorder = { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER };
  const borders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

  const createCell = (
    text: string | DocxParagraph[],
    options: {
      isHeader?: boolean;
      fillColor?: string;
      bold?: boolean;
      alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
      widthPercent?: number;
      colSpan?: number;
      fontSize?: number;
    } = {}
  ): DocxTableCell => {
    const isHeader = options.isHeader ?? false;
    const fillColor = options.fillColor ?? (isHeader ? COLOR_HEADER_BG : undefined);
    const fontSize = options.fontSize ?? (isHeader ? 19 : 18);

    let paragraphs: DocxParagraph[];
    if (Array.isArray(text)) {
      paragraphs = text;
    } else {
      paragraphs = [
        new Paragraph({
          alignment: options.alignment ?? (isHeader ? AlignmentType.CENTER : AlignmentType.LEFT),
          children: [
            new TextRun({
              text: text || "",
              bold: options.bold ?? isHeader,
              color: isHeader ? COLOR_PRIMARY : COLOR_TEXT,
              size: fontSize,
              font: "Calibri",
            }),
          ],
          spacing: { before: 30, after: 30 },
        }),
      ];
    }

    return new TableCell({
      columnSpan: options.colSpan,
      width: options.widthPercent ? { size: options.widthPercent, type: WidthType.PERCENTAGE } : undefined,
      margins: { top: 70, bottom: 70, left: 90, right: 90 },
      borders,
      shading: fillColor ? { fill: fillColor, type: ShadingType.CLEAR } : undefined,
      children: paragraphs,
    });
  };

  const shuffledBlocks = worksheetOrder(result.blocks);
  const solution = [...result.blocks].sort(
    (left, right) => left.correct_order - right.correct_order
  );

  const children: (DocxParagraph | DocxTable)[] = [];

  // Lema oficial
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "DOCUMENTO PEDAGÓGICO EDITABLE",
          italics: true,
          color: COLOR_MUTED,
          size: 18,
          font: "Calibri",
        }),
      ],
      spacing: { after: 100 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: (result.activity_title || "Secuencia Lógica").toUpperCase(),
          bold: true,
          color: "000000",
          size: 28,
          font: "Calibri",
        }),
      ],
      spacing: { after: 40 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `FICHA DE APLICACIÓN: ORDENAR Y SECUENCIAR · ${form.curricularArea.toUpperCase()}`,
          bold: true,
          color: "000000",
          size: 20,
          font: "Calibri",
        }),
      ],
      spacing: { after: 140 },
    })
  );

  // Cuadro de datos del estudiante
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell("Estudiante: __________________________________________________", { colSpan: 2, widthPercent: 75 }),
            createCell(`Grado/Secc: ${form.grade}`, { widthPercent: 25 }),
          ],
        }),
        new TableRow({
          children: [
            createCell(`I.E.: ${form.institution}`, { widthPercent: 50 }),
            createCell(`Área: ${form.curricularArea}`, { widthPercent: 25 }),
            createCell("Fecha: ____/____/2026", { widthPercent: 25 }),
          ],
        }),
      ],
    })
  );

  // Instrucciones
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Instrucciones: ", bold: true, color: COLOR_PRIMARY, size: 20, font: "Calibri" }),
        new TextRun({
          text: result.instructions || "Lee con atención los bloques desordenados. Escribe el número del 1 al " + result.blocks.length + " en la casilla correspondiente o recorta y pega cada bloque en orden.",
          size: 20,
          font: "Calibri",
          color: COLOR_TEXT,
        }),
      ],
      spacing: { before: 140, after: 120 },
    })
  );

  // I. Bloques desordenados
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "I. BLOQUES DE SECUENCIA (DESORDENADOS)", bold: true, color: COLOR_PRIMARY, size: 22, font: "Calibri" }),
      ],
      spacing: { before: 80, after: 80 },
    })
  );

  const blockTableRows: DocxTableRow[] = [
    new TableRow({
      tableHeader: true,
      cantSplit: true,
      children: [
        createCell("✂ Bloque / Paso", { isHeader: true, widthPercent: 20, alignment: AlignmentType.CENTER }),
        createCell("Descripción del Hecho o Procedimiento", { isHeader: true, widthPercent: 60 }),
        createCell("Tu Orden (1 al " + result.blocks.length + ")", { isHeader: true, widthPercent: 20, alignment: AlignmentType.CENTER }),
      ],
    }),
  ];

  shuffledBlocks.forEach((block, idx) => {
    blockTableRows.push(
      new TableRow({
        cantSplit: true,
        children: [
          createCell(`✂ Bloque #${idx + 1}`, { bold: true, alignment: AlignmentType.CENTER, widthPercent: 20, fillColor: "F8FAFC" }),
          createCell(block.hint ? `${block.text}\n\n💡 Pista: ${block.hint}` : block.text, { widthPercent: 60 }),
          createCell("[     ]", { bold: true, alignment: AlignmentType.CENTER, widthPercent: 20, fontSize: 22 }),
        ],
      })
    );
  });
  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: blockTableRows }));

  // II. Hoja de respuesta estructurada
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "II. HOJA DE SECUENCIA FINAL DEL ESTUDIANTE", bold: true, color: COLOR_PRIMARY, size: 22, font: "Calibri" }),
      ],
      spacing: { before: 180, after: 80 },
    })
  );

  const answerRows: DocxTableRow[] = [
    new TableRow({
      tableHeader: true,
      cantSplit: true,
      children: [
        createCell("N° Orden", { isHeader: true, widthPercent: 15, alignment: AlignmentType.CENTER }),
        createCell("Bloque / Acción que Ocurre en este Momento", { isHeader: true, widthPercent: 85 }),
      ],
    }),
  ];

  for (let i = 1; i <= result.blocks.length; i++) {
    answerRows.push(
      new TableRow({
        cantSplit: true,
        children: [
          createCell(`Paso ${i}`, { bold: true, alignment: AlignmentType.CENTER, widthPercent: 15, fillColor: "F8FAFC" }),
          createCell("__________________________________________________________________________", { widthPercent: 85, fontSize: 16 }),
        ],
      })
    );
  }
  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: answerRows }));

  // III. Solucionario Docente
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "SOLUCIONARIO Y CLAVE DOCENTE (DESGLOSABLE)",
          bold: true,
          color: COLOR_PRIMARY,
          size: 26,
          font: "Calibri",
        }),
      ],
      spacing: { after: 60 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `Verificación oficial de orden lógico · ${form.institution} · ${form.teacherName}`,
          color: COLOR_MUTED,
          size: 18,
          font: "Calibri",
        }),
      ],
      spacing: { after: 140 },
    })
  );

  const solRows: DocxTableRow[] = [
    new TableRow({
      tableHeader: true,
      cantSplit: true,
      children: [
        createCell("Orden", { isHeader: true, widthPercent: 12, alignment: AlignmentType.CENTER }),
        createCell("Bloque Oficial", { isHeader: true, widthPercent: 55 }),
        createCell("Pista / Justificación", { isHeader: true, widthPercent: 33 }),
      ],
    }),
  ];

  solution.forEach((block) => {
    solRows.push(
      new TableRow({
        cantSplit: true,
        children: [
          createCell(`Paso ${block.correct_order}`, { bold: true, alignment: AlignmentType.CENTER, widthPercent: 12, fillColor: "F8FAFC" }),
          createCell(block.text, { bold: true, widthPercent: 55 }),
          createCell(block.hint || "Paso indispensable de la secuencia.", { widthPercent: 33 }),
        ],
      })
    );
  });
  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: solRows }));

  if (result.pedagogical_rationale) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: "Fundamento pedagógico y lógico: ", bold: true, color: COLOR_PRIMARY, size: 20, font: "Calibri" }),
          new TextRun({ text: result.pedagogical_rationale, size: 19, color: COLOR_TEXT, font: "Calibri" }),
        ],
        spacing: { before: 160 },
      })
    );
  }

  const document = new Document({
    creator: "Avendia",
    title: result.activity_title,
    description: "Actividad de secuenciación generada por IA y revisada por el docente.",
    sections: [
      {
        properties: {
          page: {
            margin: { top: 900, bottom: 900, left: 1080, right: 1080 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${form.institution} · ${form.curricularArea} · ${form.grade}`,
                    size: 16,
                    color: COLOR_MUTED,
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({ text: "Página ", size: 16, color: COLOR_MUTED, font: "Calibri" }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: COLOR_MUTED, font: "Calibri" }),
                  new TextRun({ text: " de ", size: 16, color: COLOR_MUTED, font: "Calibri" }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: COLOR_MUTED, font: "Calibri" }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(document);
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeFileName(result.activity_title)}.docx`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return blob;
}

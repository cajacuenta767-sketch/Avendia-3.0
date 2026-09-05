import type { WordGroupingResult } from "./WordGroupingTool";
import type {
  Paragraph as DocxParagraph,
  Table as DocxTable,
  TableCell as DocxTableCell,
  TableRow as DocxTableRow,
} from "docx";

type ExportForm = {
  teacherName: string;
  institution: string;
  modality: string;
  level: string;
  grade: string;
  curricularArea: string;
  topic: string;
};

function safeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9 -]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase() || "agrupar-palabras";
}

const COLOR_PRIMARY = "1F4D78";
const COLOR_MUTED = "64748B";
const COLOR_TEXT = "1E293B";
const COLOR_BORDER = "CBD5E1";
const COLOR_HEADER_BG = "F1F5F9";

export async function exportWordGroupingDocx(form: ExportForm, result: WordGroupingResult) {
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
      const raw = String(text ?? "").trim();
      const splitLines = raw
        .replace(/\s+•\s+/g, "\n• ")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (splitLines.length > 1 || (splitLines.length === 1 && (splitLines[0].startsWith("•") || splitLines[0].startsWith("-")))) {
        paragraphs = splitLines.map((line) => {
          const isBullet = line.startsWith("•") || line.startsWith("-");
          const cleanLine = line.replace(/^[-•]\s*/, "");
          return new Paragraph({
            bullet: isBullet ? { level: 0 } : undefined,
            alignment: options.alignment ?? (isHeader ? AlignmentType.CENTER : AlignmentType.LEFT),
            children: [
              new TextRun({
                text: cleanLine,
                bold: options.bold ?? isHeader,
                color: isHeader ? COLOR_PRIMARY : COLOR_TEXT,
                size: fontSize,
                font: "Calibri",
              }),
            ],
            spacing: { before: 20, after: 20 },
          });
        });
      } else {
        paragraphs = [
          new Paragraph({
            alignment: options.alignment ?? (isHeader ? AlignmentType.CENTER : AlignmentType.LEFT),
            children: [
              new TextRun({
                text: raw,
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
          text: (result.activity_title || "Actividad de Clasificación").toUpperCase(),
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
          text: `FICHA DE APLICACIÓN: AGRUPAR Y CLASIFICAR · ${form.curricularArea.toUpperCase()}`,
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
          text: result.instructions || "Observa el banco de palabras y clasifica cada concepto en la categoría que le corresponda.",
          size: 20,
          font: "Calibri",
          color: COLOR_TEXT,
        }),
      ],
      spacing: { before: 140, after: 120 },
    })
  );

  // I. Banco de palabras en tabla de tarjetas
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "I. BANCO DE PALABRAS PARA CLASIFICAR", bold: true, color: COLOR_PRIMARY, size: 22, font: "Calibri" }),
      ],
      spacing: { before: 80, after: 80 },
    })
  );

  const sortedWords = [...result.words].map((w) => w.word).sort((a, b) => a.localeCompare(b, "es"));
  const numCols = 3;
  const wordBankRows: DocxTableRow[] = [];
  for (let i = 0; i < sortedWords.length; i += numCols) {
    const chunk = sortedWords.slice(i, i + numCols);
    wordBankRows.push(
      new TableRow({
        cantSplit: true,
        children: Array.from({ length: numCols }).map((_, cIdx) => {
          const word = chunk[cIdx];
          return createCell(word ? `🏷 ${word}` : "", {
            alignment: AlignmentType.CENTER,
            bold: Boolean(word),
            fillColor: word ? "F8FAFC" : undefined,
            widthPercent: Math.floor(100 / numCols),
            fontSize: 20,
          });
        }),
      })
    );
  }
  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: wordBankRows }));

  // II. Cuadros de Clasificación por Categorías
  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "II. CUADROS DE CLASIFICACIÓN", bold: true, color: COLOR_PRIMARY, size: 22, font: "Calibri" }),
      ],
      spacing: { before: 180, after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Escribe o pega cada palabra en el recuadro de la categoría correcta:",
          italics: true,
          color: COLOR_MUTED,
          size: 18,
          font: "Calibri",
        }),
      ],
      spacing: { after: 100 },
    })
  );

  const categories = result.categories;
  const catCols = categories.length <= 3 ? categories.length : 2;
  const colWidth = Math.floor(100 / catCols);

  for (let c = 0; c < categories.length; c += catCols) {
    const activeCats = categories.slice(c, c + catCols);
    const catRows: DocxTableRow[] = [];

    // Fila 1: Títulos de categorías
    catRows.push(
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: activeCats.map((cat) =>
          createCell(cat.name.toUpperCase(), {
            isHeader: true,
            bold: true,
            alignment: AlignmentType.CENTER,
            widthPercent: colWidth,
            fillColor: "BDD7EE",
            fontSize: 20,
          })
        ),
      })
    );

    // Fila 2: Descripción de la categoría
    catRows.push(
      new TableRow({
        cantSplit: true,
        children: activeCats.map((cat) =>
          createCell(cat.explanation || "Categoría temática", {
            alignment: AlignmentType.CENTER,
            widthPercent: colWidth,
            fillColor: "F8FAFC",
            fontSize: 17,
          })
        ),
      })
    );

    // Filas 3-7: Casillas de escritura para el estudiante (5 líneas)
    for (let slot = 1; slot <= 5; slot++) {
      catRows.push(
        new TableRow({
          cantSplit: true,
          children: activeCats.map(() =>
            createCell(`${slot}. __________________________________`, {
              widthPercent: colWidth,
              fontSize: 18,
            })
          ),
        })
      );
    }

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: catRows }));
    children.push(new Paragraph({ spacing: { after: 120 } }));
  }

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
          text: `Verificación oficial de respuestas · ${form.institution} · ${form.teacherName}`,
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
        createCell("Categoría Oficial", { isHeader: true, widthPercent: 30 }),
        createCell("Criterio / Justificación Pedagógica", { isHeader: true, widthPercent: 35 }),
        createCell("Palabras que Corresponden", { isHeader: true, widthPercent: 35 }),
      ],
    }),
  ];

  result.categories.forEach((cat) => {
    const catWords = result.words
      .filter((w) => w.correct_category_id === cat.id)
      .map((w) => w.word);
    solRows.push(
      new TableRow({
        cantSplit: true,
        children: [
          createCell(cat.name, { bold: true, widthPercent: 30 }),
          createCell(cat.explanation || "Correspondencia temática directa.", { widthPercent: 35 }),
          createCell(catWords.map((w) => `• ${w}`).join("\n"), { widthPercent: 35, fillColor: "F8FAFC" }),
        ],
      })
    );
  });
  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: solRows }));

  const document = new Document({
    creator: "Avendia",
    title: result.activity_title,
    description: "Ficha de aplicación y clasificación de palabras generada por Avendia.",
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

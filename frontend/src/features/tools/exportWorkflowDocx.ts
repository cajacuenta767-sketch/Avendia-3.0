import {
  AlignmentType,
  Bookmark,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  PageBreak,
  PageNumber,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableOfContents,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from "docx";

import type { WorkflowActivity } from "./InteractiveArtifact";
import {
  attachTablesToSections,
  formatPoints,
  isPlaceholder,
  parseQuestionText,
  QUESTION_FORMAT_LABELS,
  resolveQuestions,
  riskLevelFor,
  rubricScoring,
  sameTitle,
  scoreToVigesimal,
  splitLabel,
  splitNarrative,
  stripNumbering,
  toRoman,
  type DocumentQuestion,
} from "./documentFormat";
import {
  buildPlanAnualDocxDocument,
  type ExportPlanAnualContext,
} from "./exportPlanAnualDocx";

export type WorkflowArtifactSection = {
  title: string;
  narrative: string;
  key_points: string[];
};

export type WorkflowArtifactTable = {
  title: string;
  columns: string[];
  rows: string[][];
  note?: string;
};

export type WorkflowArtifact = {
  document_title: string;
  executive_summary: string;
  sections: WorkflowArtifactSection[];
  teacher_recommendations: string[];
  activity?: WorkflowActivity | null;
  tables?: WorkflowArtifactTable[];
  questions?: DocumentQuestion[];
  model: string;
  contract_version?: string;
  generation_brief?: string;
  quality_checks?: Array<{
    code: string;
    label: string;
    passed: boolean;
    detail: string;
    severity?: "P0" | "P1" | "P2";
  }>;
  warnings?: string[];
  quality_status?: "ready" | "review" | "blocked";
  suggested_next_tools?: string[];
  repair_attempted?: boolean;
  repair_succeeded?: boolean;
  repair_notes?: string[];
};

// Nombre mantenido para las pruebas y exportadores especializados creados por lotes.
export type StructuredArtifact = WorkflowArtifact;

export type ExportWorkflowDocxOptions = ExportPlanAnualContext;

const COLOR_PRIMARY = "1F4D78"; // Azul institucional MINEDU oscuro
const COLOR_SECONDARY = "2E74B5"; // Azul secundario encabezados
const COLOR_ZEBRA_BG = "F8FAFC"; // Fondo alterno sutil
const COLOR_BORDER = "BDD7EE"; // Borde suave institucional
const COLOR_TEXT = "1F2937"; // Texto oscuro legible
const COLOR_MUTED = "64748B"; // Texto secundario
const COLOR_BAND_BG = "EAF2FB"; // Banda suave detrás de los títulos principales
const COLOR_CALLOUT_BG = "F1F6FC"; // Fondo de las cajas de instrucciones
const COLOR_CARD_FRONT_BG = "F8FAFC"; // Frente de las tarjetas recortables
const COLOR_CARD_BACK_BG = "FFFDF5"; // Reverso de las tarjetas recortables
const COLOR_DASHED = "94A3B8"; // Líneas de recorte
const COLOR_HEADING = "000000";

function safeFileName(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9-_ ]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase() || "avendia-documento"
  );
}

function cleanText(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = Array.isArray(value) ? value.join(", ") : String(value);
  return str.replace(/\*+/g, "").replace(/^#{1,6}\s*/gm, "").trim();
}

function normalizePuzzleWord(value: string): string {
  return cleanText(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-zÑñ]/g, "")
    .toUpperCase();
}

type PrintableWordPlacement = {
  answer: string;
  row: number;
  col: number;
  direction: string;
};

function createPrintableWordSearch(words: string[]): {
  grid: string[][];
  placements: PrintableWordPlacement[];
} {
  const source = words.map(normalizePuzzleWord).filter((word) => word.length > 1);
  const longest = Math.max(...source.map((word) => word.length), 10);
  const totalLetters = source.reduce((total, word) => total + word.length, 0);
  const size = Math.max(12, Math.min(32, Math.max(longest + 2, Math.ceil(Math.sqrt(totalLetters * 2.2)))));
  const alphabet = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";
  const grid = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => alphabet[(row * 7 + col * 11 + row * col) % alphabet.length]),
  );
  const occupied = new Map<string, string>();
  const placements: PrintableWordPlacement[] = [];
  const directions = [
    { dr: 0, dc: 1, label: "Horizontal →" },
    { dr: 1, dc: 0, label: "Vertical ↓" },
    { dr: 1, dc: 1, label: "Diagonal ↘" },
    { dr: 1, dc: -1, label: "Diagonal ↙" },
    { dr: 0, dc: -1, label: "Horizontal ←" },
    { dr: -1, dc: 0, label: "Vertical ↑" },
  ];

  source.sort((a, b) => b.length - a.length).forEach((word) => {
    let best: { keys: string[]; row: number; col: number; direction: string } | null = null;
    let bestIntersections = -1;
    for (let row = 0; row < size; row += 1) for (let col = 0; col < size; col += 1) for (const direction of directions) {
      const endRow = row + direction.dr * (word.length - 1);
      const endCol = col + direction.dc * (word.length - 1);
      if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;
      const keys = word.split("").map((_, index) => `${row + direction.dr * index},${col + direction.dc * index}`);
      if (!keys.every((key, index) => !occupied.has(key) || occupied.get(key) === word[index])) continue;
      const intersections = keys.filter((key) => occupied.has(key)).length;
      if (intersections > bestIntersections) {
        best = { keys, row, col, direction: direction.label };
        bestIntersections = intersections;
      }
    }
    if (!best) return;
    best.keys.forEach((key, index) => {
      const [row, col] = key.split(",").map(Number);
      occupied.set(key, word[index]);
      grid[row][col] = word[index];
    });
    placements.push({ answer: word, row: best.row, col: best.col, direction: best.direction });
  });

  return { grid, placements };
}

type PrintableCrosswordEntry = {
  number: number;
  answer: string;
  prompt: string;
  hint: string;
  row: number;
  col: number;
  vertical: boolean;
};

function createPrintableCrossword(items: NonNullable<WorkflowActivity["items"]>): {
  grid: string[][];
  entries: PrintableCrosswordEntry[];
} {
  const source = items
    .map((item) => ({ ...item, answer: normalizePuzzleWord(item.answer) }))
    .filter((item) => item.answer.length > 1)
    .sort((a, b) => b.answer.length - a.answer.length);
  const longest = Math.max(...source.map((item) => item.answer.length), 10);
  const totalLetters = source.reduce((total, item) => total + item.answer.length, 0);
  const size = Math.max(12, Math.min(32, Math.max(longest + 2, Math.ceil(Math.sqrt(totalLetters * 2.4)))));
  const occupied = new Map<string, string>();
  const entries: PrintableCrosswordEntry[] = [];
  const directions = [{ dr: 0, dc: 1, vertical: false }, { dr: 1, dc: 0, vertical: true }];

  source.forEach((item) => {
    let best: { keys: string[]; row: number; col: number; vertical: boolean } | null = null;
    let bestIntersections = -1;
    for (let row = 0; row < size; row += 1) for (let col = 0; col < size; col += 1) for (const direction of directions) {
      const endRow = row + direction.dr * (item.answer.length - 1);
      const endCol = col + direction.dc * (item.answer.length - 1);
      if (endRow >= size || endCol >= size) continue;
      const keys = item.answer.split("").map((_, index) => `${row + direction.dr * index},${col + direction.dc * index}`);
      if (!keys.every((key, index) => !occupied.has(key) || occupied.get(key) === item.answer[index])) continue;
      const intersections = keys.filter((key) => occupied.has(key)).length;
      if (intersections > bestIntersections) {
        best = { keys, row, col, vertical: direction.vertical };
        bestIntersections = intersections;
      }
    }
    if (!best) return;
    best.keys.forEach((key, index) => occupied.set(key, item.answer[index]));
    entries.push({
      number: entries.length + 1,
      answer: item.answer,
      prompt: item.prompt,
      hint: item.hint,
      row: best.row,
      col: best.col,
      vertical: best.vertical,
    });
  });

  const usedPositions = [...occupied.keys()].map((key) => key.split(",").map(Number));
  const maxRow = Math.max(0, ...usedPositions.map(([row]) => row));
  const maxCol = Math.max(0, ...usedPositions.map(([, col]) => col));
  const grid = Array.from({ length: maxRow + 1 }, (_, row) =>
    Array.from({ length: maxCol + 1 }, (_, col) => occupied.get(`${row},${col}`) ?? "█"),
  );
  return { grid, entries };
}

function cellBorders() {
  const border = { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER };
  return { top: border, bottom: border, left: border, right: border };
}

// ==========================================================================
// FORMATO COMPARTIDO: estilos, página, cabecera/pie, párrafos y tablas
// ==========================================================================

export { attachTablesToSections, isPlaceholder, toRoman };

function displayValue(value: unknown, fallback = "________________"): string {
  return isPlaceholder(value) ? fallback : String(value).trim();
}

/** Hoja de estilos Word: fuente base y jerarquía de títulos reutilizable por el docente. */
const documentStyles = {
  default: {
    document: { run: { font: "Calibri", size: 21, color: COLOR_TEXT } },
  },
  paragraphStyles: [
    {
      id: "Heading1",
      name: "Heading 1",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { font: "Calibri", size: 24, bold: true, color: COLOR_PRIMARY },
      paragraph: {
        spacing: { before: 260, after: 100 },
        keepNext: true,
        outlineLevel: 0,
        indent: { left: 100 },
        shading: { type: ShadingType.CLEAR, fill: COLOR_BAND_BG },
        border: {
          left: { style: BorderStyle.SINGLE, size: 24, color: COLOR_PRIMARY, space: 4 },
          bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER, space: 2 },
        },
      },
    },
    {
      id: "Heading2",
      name: "Heading 2",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { font: "Calibri", size: 22, bold: true, color: COLOR_SECONDARY },
      paragraph: {
        spacing: { before: 180, after: 80 },
        keepNext: true,
        outlineLevel: 1,
        indent: { left: 100 },
        border: { left: { style: BorderStyle.SINGLE, size: 18, color: COLOR_SECONDARY, space: 4 } },
      },
    },
    // Entradas del índice precargado (se ven en cualquier visor; Word las actualiza con páginas).
    {
      id: "TOC1", name: "toc 1", basedOn: "Normal", next: "Normal",
      run: { font: "Calibri", size: 20, bold: true, color: COLOR_PRIMARY },
      paragraph: { spacing: { before: 60, after: 40 } },
    },
    {
      id: "TOC2", name: "toc 2", basedOn: "Normal", next: "Normal",
      run: { font: "Calibri", size: 19, color: COLOR_TEXT },
      paragraph: { spacing: { after: 30 }, indent: { left: 360 } },
    },
    {
      id: "Heading3",
      name: "Heading 3",
      basedOn: "Normal",
      next: "Normal",
      quickFormat: true,
      run: { font: "Calibri", size: 21, bold: true, color: COLOR_PRIMARY },
      paragraph: { spacing: { before: 140, after: 60 }, keepNext: true, outlineLevel: 2 },
    },
  ],
};

type PageMode = "portrait" | "landscape";

/** Tamaño A4 y márgenes homogéneos para todas las familias de documentos. */
function pageProperties(mode: PageMode = "portrait") {
  const landscape = mode === "landscape";
  return {
    page: {
      size: {
        // docx intercambia ancho y alto cuando la orientación es horizontal: siempre se pasa A4 vertical.
        orientation: landscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
        width: 11906,
        height: 16838,
      },
      margin: landscape
        ? { top: 720, bottom: 720, left: 1080, right: 1080 }
        : { top: 900, bottom: 900, left: 1080, right: 1080 },
    },
  };
}

function headerText(values: ReturnType<typeof extractCommonValues>, label: string): string {
  return [values.ie, label, values.year].filter((part) => !isPlaceholder(part)).join(" · ");
}

// Ancho útil de la hoja A4 vertical con los márgenes de pageProperties (twips).
const CONTENT_WIDTH_TWIPS = 9746;

/** Cabecera institucional: marca a la izquierda y datos del documento a la derecha, sobre una regla azul. */
function documentHeader(text: string) {
  return {
    default: new Header({
      children: [
        new Paragraph({
          tabStops: [{ type: "right" as const, position: CONTENT_WIDTH_TWIPS }],
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_SECONDARY, space: 4 } },
          children: [
            new TextRun({ text: "AVENDIA", bold: true, size: 16, color: COLOR_PRIMARY, font: "Calibri", characterSpacing: 20 }),
            new TextRun({ text: " · Documento pedagógico", size: 16, color: COLOR_MUTED, font: "Calibri" }),
            new TextRun({ text: `\t${cleanText(text)}`, size: 16, color: COLOR_MUTED, font: "Calibri" }),
          ],
        }),
      ],
    }),
  };
}

/** Pie de página: leyenda a la izquierda y numeración "Página N de M" a la derecha. */
function documentFooter() {
  const muted = { size: 16, color: COLOR_MUTED, font: "Calibri" };
  return {
    default: new Footer({
      children: [
        new Paragraph({
          tabStops: [{ type: "right" as const, position: CONTENT_WIDTH_TWIPS }],
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER, space: 4 } },
          children: [
            new TextRun({ text: "Elaborado con Avendia para el aula peruana", ...muted }),
            new TextRun({ text: "\tPágina ", ...muted }),
            new TextRun({ children: [PageNumber.CURRENT], ...muted, bold: true, color: COLOR_PRIMARY }),
            new TextRun({ text: " de ", ...muted }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], ...muted, bold: true, color: COLOR_PRIMARY }),
          ],
        }),
      ],
    }),
  };
}

/** Caja destacada para instrucciones u orientaciones: franja lateral azul y fondo suave. */
function createCalloutBlock(title: string, text: string, options: { icon?: string } = {}): Table {
  const side = { style: BorderStyle.SINGLE, size: 4, color: COLOR_BORDER };
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        borders: {
          left: { style: BorderStyle.SINGLE, size: 24, color: COLOR_SECONDARY },
          top: side, bottom: side, right: side,
        },
        shading: { fill: COLOR_CALLOUT_BG, type: ShadingType.CLEAR },
        margins: { top: 110, bottom: 110, left: 160, right: 160 },
        children: [
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: `${options.icon ? `${options.icon} ` : ""}${cleanText(title)}`, bold: true, size: 19, color: COLOR_PRIMARY, font: "Calibri" })],
          }),
          ...createBodyParagraphs(text, { size: 19, after: 0 }),
        ],
      })],
    })],
  });
}

/** Texto en negrita para "Etiqueta: contenido" (etiqueta de una a cuatro palabras). */
function labelRuns(text: string, size: number, color = COLOR_TEXT): TextRun[] {
  const parts = splitLabel(cleanText(text));
  if (parts.label) {
    return [
      new TextRun({ text: `${parts.label}: `, bold: true, size, color: COLOR_PRIMARY, font: "Calibri" }),
      new TextRun({ text: parts.body, size, color, font: "Calibri" }),
    ];
  }
  return [new TextRun({ text: cleanText(text), size, color, font: "Calibri" })];
}

function createKeyPoint(text: string, options: { size?: number; after?: number } = {}): Paragraph {
  return new Paragraph({
    bullet: { level: 0 },
    children: labelRuns(text, options.size ?? 20),
    spacing: { after: options.after ?? 50, line: 264 },
  });
}

/** Párrafos de cuerpo: respeta saltos de párrafo y convierte viñetas incrustadas en lista. */
function createBodyParagraphs(
  text: string,
  options: { bold?: boolean; italic?: boolean; after?: number; size?: number } = {}
): Paragraph[] {
  const blocks = splitNarrative(text);
  if (!blocks.length) return [];
  return blocks.map((block) =>
    block.bullet
      ? createKeyPoint(block.text, { size: options.size ?? 20 })
      : new Paragraph({
          alignment: AlignmentType.JUSTIFIED,
          children: [
            new TextRun({
              text: block.text,
              bold: options.bold,
              italics: options.italic,
              color: COLOR_TEXT,
              size: options.size ?? 20,
              font: "Calibri",
            }),
          ],
          spacing: { after: options.after ?? 100, line: 276 },
        })
  );
}

/** Anchos de columna proporcionales al contenido, con mínimo legible. */
function columnWidths(table: WorkflowArtifactTable): number[] {
  const count = table.columns.length;
  const weights = table.columns.map((column, index) => {
    const cells = table.rows.map((row) => String(row[index] ?? ""));
    const average = cells.reduce((sum, cell) => sum + cell.length, 0) / Math.max(1, cells.length);
    return Math.max(column.length * 0.8, average, 6);
  });
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const minimum = Math.min(12, Math.floor(60 / count));
  const raw = weights.map((weight) => Math.max(minimum, (weight / total) * 100));
  const rawTotal = raw.reduce((sum, weight) => sum + weight, 0);
  const widths = raw.map((weight) => Math.round((weight / rawTotal) * 100));
  widths[widths.length - 1] += 100 - widths.reduce((sum, weight) => sum + weight, 0);
  return widths;
}

function createTableBlocks(tables: WorkflowArtifactTable[], options: { sectionTitle?: string } = {}): (Paragraph | Table)[] {
  return tables.flatMap((table) => {
    const repeatsSectionTitle = options.sectionTitle ? sameTitle(table.title, options.sectionTitle) : false;
    const widths = columnWidths(table);
    const rows = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: table.columns.map((column, index) =>
          createStyledCell(column, { isHeader: true, widthPercent: widths[index] }),
        ),
      }),
      ...table.rows.map((row, rowIndex) =>
        new TableRow({
          cantSplit: true,
          children: row.map((cell, index) =>
            createStyledCell(cell, {
              widthPercent: widths[index],
              bold: index === 0 && String(cell).length <= 40 ? true : undefined,
              fillColor: rowIndex % 2 ? COLOR_ZEBRA_BG : undefined,
            }),
          ),
        }),
      ),
    ];
    const blocks: (Paragraph | Table)[] = [
      ...(repeatsSectionTitle ? [] : [createHeading(table.title, HeadingLevel.HEADING_2)]),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: widths.map((width) => Math.round((width / 100) * 9746)),
        rows,
      }),
    ];
    if (table.note) blocks.push(createBodyParagraph(table.note, { italic: true, after: 120 }));
    else blocks.push(new Paragraph({ spacing: { after: 80 }, children: [] }));
    return blocks;
  });
}

function createStyledCell(
  content: string | Paragraph[],
  options: {
    isHeader?: boolean;
    fillColor?: string;
    bold?: boolean;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    widthPercent?: number;
    colSpan?: number;
    fontSize?: number;
    italics?: boolean;
    color?: string;
  } = {}
): TableCell {
  const isHeader = options.isHeader ?? false;
  const fillColor = options.fillColor ?? (isHeader ? COLOR_PRIMARY : undefined);
  // Cabecera sólida azul con texto blanco; si la herramienta pide otro fondo, conserva el texto oscuro.
  const headerTextColor = isHeader && !options.fillColor ? "FFFFFF" : COLOR_PRIMARY;
  const fontSize = options.fontSize ?? (isHeader ? 19 : 18);

  let paragraphs: Paragraph[];
  if (Array.isArray(content)) {
    paragraphs = content;
  } else {
    const raw = String(content ?? "").trim();
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
              text: cleanText(cleanLine),
              bold: options.bold ?? isHeader,
              color: options.color ?? (isHeader ? headerTextColor : COLOR_TEXT),
              italics: options.italics,
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
              text: cleanText(raw),
              bold: options.bold ?? isHeader,
              color: options.color ?? (isHeader ? headerTextColor : COLOR_TEXT),
              italics: options.italics,
              size: fontSize,
              font: "Calibri",
            }),
          ],
          spacing: { before: 40, after: 40 },
        }),
      ];
    }
  }

  return new TableCell({
    columnSpan: options.colSpan,
    width: options.widthPercent
      ? { size: options.widthPercent, type: WidthType.PERCENTAGE }
      : undefined,
    margins: { top: 70, bottom: 70, left: 90, right: 90 },
    borders: cellBorders(),
    shading: fillColor ? { fill: fillColor, type: ShadingType.CLEAR } : undefined,
    verticalAlign: isHeader ? VerticalAlign.CENTER : undefined,
    children: paragraphs,
  });
}

function createHeading(
  text: string,
  level: (typeof HeadingLevel)[keyof typeof HeadingLevel],
  num?: string
) {
  const fullText = num ? `${num} ${text}` : text;
  const isH1 = level === HeadingLevel.HEADING_1;
  return new Paragraph({
    heading: level,
    keepNext: true,
    children: [
      new TextRun({
        text: isH1 ? cleanText(fullText).toLocaleUpperCase("es") : cleanText(fullText),
        bold: true,
        color: isH1 ? COLOR_PRIMARY : COLOR_SECONDARY,
        size: isH1 ? 24 : 22,
        font: "Calibri",
      }),
    ],
    indent: { left: 100 },
    shading: isH1 ? { type: ShadingType.CLEAR, fill: COLOR_BAND_BG } : undefined,
    border: isH1
      ? {
          left: { style: BorderStyle.SINGLE, size: 24, color: COLOR_PRIMARY, space: 4 },
          bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR_BORDER, space: 2 },
        }
      : { left: { style: BorderStyle.SINGLE, size: 18, color: COLOR_SECONDARY, space: 4 } },
    spacing: { before: isH1 ? 260 : 180, after: isH1 ? 100 : 80 },
  });
}

function createGeneratedTableBlocks(artifact: WorkflowArtifact): (Paragraph | Table)[] {
  return createTableBlocks(artifact.tables ?? []);
}

function createBodyParagraph(
  text: string,
  options: { bold?: boolean; italic?: boolean; after?: number } = {}
) {
  return new Paragraph({
    children: [
      new TextRun({
        text: cleanText(text),
        bold: options.bold,
        italics: options.italic,
        color: COLOR_TEXT,
        size: 20,
        font: "Calibri",
      }),
    ],
    spacing: { after: options.after ?? 100, line: 276 },
  });
}

function createLabeledParagraph(label: string, text: string, options: { size?: number } = {}): Paragraph {
  const size = options.size ?? 20;
  return new Paragraph({
    children: [
      new TextRun({ text: `${label} `, bold: true, color: COLOR_PRIMARY, size, font: "Calibri" }),
      new TextRun({ text: cleanText(text), color: COLOR_TEXT, size, font: "Calibri" }),
    ],
    spacing: { before: 60, after: 100, line: 276 },
  });
}

function createAnswerLines(count: number): Paragraph[] {
  return Array.from({ length: count }, (_, index) => new Paragraph({
    children: [new TextRun({
      text: `${index === 0 ? "Respuesta: " : ""}________________________________________________________________________________`,
      size: 18,
      color: index === 0 ? COLOR_MUTED : "B9CDE5",
      font: "Calibri",
    })],
    spacing: { before: 35, after: 90 },
  }));
}

function createResponseSpace(format: DocumentQuestion["format"]): (Paragraph | Table)[] {
  if (format === "desarrollo") return createAnswerLines(5);
  if (format === "tabla") {
    const rows = Array.from({ length: 3 }, () => new TableRow({
      cantSplit: true,
      children: Array.from({ length: 3 }, () => createStyledCell(" ", { widthPercent: 33 })),
    }));
    return [new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }), new Paragraph({ spacing: { after: 100 } })];
  }
  if (format === "dibujo" || format === "operacion") {
    const box = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({
        cantSplit: true,
        height: { value: 2600, rule: "atLeast" as const },
        children: [new TableCell({
          borders: {
            top: { style: BorderStyle.DASHED, size: 6, color: "B9CDE5" },
            bottom: { style: BorderStyle.DASHED, size: 6, color: "B9CDE5" },
            left: { style: BorderStyle.DASHED, size: 6, color: "B9CDE5" },
            right: { style: BorderStyle.DASHED, size: 6, color: "B9CDE5" },
          },
          children: [new Paragraph({ children: [] })],
        })],
      })],
    });
    return [box, new Paragraph({ spacing: { after: 100 } })];
  }
  return createAnswerLines(2);
}

/** Reactivo listo para el estudiante a partir de la pregunta tipada. */
function createQuestionBlocks(question: DocumentQuestion, options: { showLevel?: boolean } = {}): (Paragraph | Table)[] {
  const points = formatPoints(question.points);
  const tag = [
    QUESTION_FORMAT_LABELS[question.format],
    options.showLevel && question.cognitive_level ? question.cognitive_level : "",
    points,
  ].filter(Boolean).join(" · ");
  const blocks: (Paragraph | Table)[] = [
    new Paragraph({
      children: [
        new TextRun({ text: `${question.number}. `, bold: true, color: COLOR_PRIMARY, size: 21, font: "Calibri" }),
        new TextRun({ text: cleanText(question.prompt), bold: true, color: COLOR_TEXT, size: 20, font: "Calibri" }),
        new TextRun({ text: `   ${tag}`, bold: true, color: COLOR_SECONDARY, size: 15, font: "Calibri" }),
      ],
      spacing: { before: 80, after: 80 },
      keepNext: true,
    }),
  ];

  if (question.format === "opcion_multiple" && question.options.length) {
    const rows: TableRow[] = [];
    for (let optionIndex = 0; optionIndex < question.options.length; optionIndex += 2) {
      rows.push(new TableRow({
        cantSplit: true,
        children: [
          createStyledCell(`[  ] ${question.options[optionIndex]}`, { widthPercent: 50 }),
          createStyledCell(question.options[optionIndex + 1] ? `[  ] ${question.options[optionIndex + 1]}` : " ", { widthPercent: 50 }),
        ],
      }));
    }
    blocks.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
    blocks.push(new Paragraph({ spacing: { after: 100 } }));
    return blocks;
  }

  if (question.format === "verdadero_falso") {
    blocks.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("[  ] Verdadero", { widthPercent: 50, alignment: AlignmentType.CENTER }),
          createStyledCell("[  ] Falso", { widthPercent: 50, alignment: AlignmentType.CENTER }),
        ],
      })],
    }));
    blocks.push(new Paragraph({ spacing: { after: 100 } }));
    return blocks;
  }

  if (question.format === "relacionar" && question.left_column.length && question.right_column.length) {
    const rowCount = Math.max(question.left_column.length, question.right_column.length);
    const rows = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("Columna A", { isHeader: true, widthPercent: 44 }),
          createStyledCell("Respuesta", { isHeader: true, widthPercent: 12 }),
          createStyledCell("Columna B", { isHeader: true, widthPercent: 44 }),
        ],
      }),
      ...Array.from({ length: rowCount }, (_, rowIndex) => new TableRow({
        cantSplit: true,
        children: [
          createStyledCell(question.left_column[rowIndex] ?? " ", { widthPercent: 44 }),
          createStyledCell("____", { widthPercent: 12, alignment: AlignmentType.CENTER }),
          createStyledCell(question.right_column[rowIndex] ?? " ", { widthPercent: 44 }),
        ],
      })),
    ];
    blocks.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
    blocks.push(new Paragraph({ spacing: { after: 100 } }));
    return blocks;
  }

  blocks.push(...createResponseSpace(question.format));
  return blocks;
}

/** Clave docente en tabla a partir de las preguntas tipadas. */
function createAnswerKeyBlocks(questions: DocumentQuestion[]): (Paragraph | Table)[] {
  const answered = questions.filter((question) => question.answer || question.justification);
  if (!answered.length) return [];
  const hasPoints = answered.some((question) => question.points != null);
  const hasJustification = answered.some((question) => question.justification);
  const widths = hasJustification ? [8, 42, 38, 12] : [8, 76, 0, 16];
  const header = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: [
      createStyledCell("N°", { isHeader: true, widthPercent: widths[0] }),
      createStyledCell("Respuesta esperada", { isHeader: true, widthPercent: widths[1] }),
      ...(hasJustification ? [createStyledCell("Justificación", { isHeader: true, widthPercent: widths[2] })] : []),
      ...(hasPoints ? [createStyledCell("Puntaje", { isHeader: true, widthPercent: widths[3] })] : []),
    ],
  });
  const rows = answered.map((question, index) => new TableRow({
    cantSplit: true,
    children: [
      createStyledCell(String(question.number), { widthPercent: widths[0], alignment: AlignmentType.CENTER, bold: true, fillColor: index % 2 ? COLOR_ZEBRA_BG : undefined }),
      createStyledCell(question.answer || "—", { widthPercent: widths[1], fillColor: index % 2 ? COLOR_ZEBRA_BG : undefined }),
      ...(hasJustification ? [createStyledCell(question.justification || " ", { widthPercent: widths[2], fillColor: index % 2 ? COLOR_ZEBRA_BG : undefined })] : []),
      ...(hasPoints ? [createStyledCell(formatPoints(question.points) || " ", { widthPercent: widths[3], alignment: AlignmentType.CENTER, fillColor: index % 2 ? COLOR_ZEBRA_BG : undefined })] : []),
    ],
  }));
  return [
    createHeading("Clave de respuestas", HeadingLevel.HEADING_2),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [header, ...rows] }),
    new Paragraph({ spacing: { after: 120 } }),
  ];
}

/** Registro de puntaje por criterio y nivel, con conversión a nota vigesimal. */
function createScoringBlocks(scoring: ReturnType<typeof rubricScoring>): (Paragraph | Table)[] {
  if (!scoring) return [];
  const legend = scoring.levels
    .map((level, index) => `${level} = ${scoring.pointsPerLevel[index]} ${scoring.pointsPerLevel[index] === 1 ? "punto" : "puntos"}`)
    .join(" · ");
  const rows = [
    new TableRow({
      tableHeader: true,
      cantSplit: true,
      children: [
        createStyledCell("Criterio", { isHeader: true, widthPercent: 50 }),
        createStyledCell("Nivel alcanzado", { isHeader: true, widthPercent: 28 }),
        createStyledCell("Puntos", { isHeader: true, widthPercent: 22 }),
      ],
    }),
    ...scoring.criteria.map((criterion, index) => new TableRow({
      cantSplit: true,
      children: [
        createStyledCell(criterion, { widthPercent: 50, bold: true, fillColor: index % 2 ? COLOR_ZEBRA_BG : undefined }),
        createStyledCell("________", { widthPercent: 28, alignment: AlignmentType.CENTER, fillColor: index % 2 ? COLOR_ZEBRA_BG : undefined }),
        createStyledCell(`____ / ${scoring.maxPerCriterion}`, { widthPercent: 22, alignment: AlignmentType.CENTER, fillColor: index % 2 ? COLOR_ZEBRA_BG : undefined }),
      ],
    })),
    new TableRow({
      cantSplit: true,
      children: [
        createStyledCell("Total", { widthPercent: 50, bold: true }),
        createStyledCell("Nota vigesimal: ____ / 20", { widthPercent: 28, alignment: AlignmentType.CENTER, bold: true }),
        createStyledCell(`____ / ${scoring.total}`, { widthPercent: 22, alignment: AlignmentType.CENTER, bold: true }),
      ],
    }),
  ];
  const example = Math.ceil(scoring.total * 0.75);
  return [
    createHeading("Registro de puntaje", HeadingLevel.HEADING_2),
    createBodyParagraph(legend, { italic: true, after: 80 }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }),
    createBodyParagraph(
      `Conversión: nota = puntos obtenidos × 20 ÷ ${scoring.total}. Por ejemplo, ${example} puntos equivalen a ${scoreToVigesimal(example, scoring.total)}.`,
      { italic: true, after: 120 },
    ),
  ];
}

function createSignaturesTable(
  leftName: string,
  leftRole: string,
  rightName: string,
  rightRole: string
) {
  const borderNone = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const transparentBorders = {
    top: borderNone,
    bottom: borderNone,
    left: borderNone,
    right: borderNone,
  };

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: transparentBorders,
            margins: { top: 120, bottom: 30, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "____________________________________________",
                    color: "94A3B8",
                    size: 18,
                    font: "Calibri",
                  }),
                ],
                spacing: { after: 40 },
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: cleanText(leftName),
                    bold: true,
                    color: COLOR_PRIMARY,
                    size: 20,
                    font: "Calibri",
                  }),
                ],
                spacing: { after: 20 },
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: cleanText(leftRole),
                    color: COLOR_MUTED,
                    size: 17,
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            borders: transparentBorders,
            margins: { top: 120, bottom: 30, left: 100, right: 100 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "____________________________________________",
                    color: "94A3B8",
                    size: 18,
                    font: "Calibri",
                  }),
                ],
                spacing: { after: 40 },
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: cleanText(rightName),
                    bold: true,
                    color: COLOR_PRIMARY,
                    size: 20,
                    font: "Calibri",
                  }),
                ],
                spacing: { after: 20 },
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: cleanText(rightRole),
                    color: COLOR_MUTED,
                    size: 17,
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

/** Sustituye un dato no aportado por una línea de llenado en cabeceras y textos corridos. */
function fill(value: string, width = 12): string {
  return isPlaceholder(value) ? "_".repeat(width) : value;
}

function extractCommonValues(values: Record<string, unknown> = {}, context: Record<string, unknown> = {}) {
  const missing = "No registrado";
  // Algunas llamadas (p. ej. las muestras de QA) traen los datos en el contexto y no en `values`.
  return {
    year: cleanText(values.school_year || context.schoolYear) || missing,
    dre: cleanText(values.dre || context.dre) || missing,
    ugel: cleanText(values.ugel || context.ugel) || missing,
    ie: cleanText(values.institution || context.schoolName) || missing,
    level: cleanText(values.level || context.level) || missing,
    grade: cleanText(values.grade || context.grade) || missing,
    section: cleanText(values.section || values.sections || context.section) || missing,
    area: cleanText(values.curricular_area || values.curricular_areas || values.area || context.course) || missing,
    teacher: cleanText(values.teacher_name || context.teacherName) || missing,
    director: cleanText(values.director_name || context.directorName) || missing,
    student: cleanText(values.student_name) || missing,
    guardian: cleanText(values.guardian_name || values.guardian_names) || missing,
  };
}

// ==========================================================================
// 1. BUILDER: INSTRUMENTOS DE EVALUACIÓN
// ==========================================================================
export function buildInstrumentDocx(
  artifact: WorkflowArtifact,
  context: ExportWorkflowDocxOptions
): Document {
  const v = extractCommonValues(context.values, context);
  const isRubric = (context.workflowKey || "").includes("rubrica");
  const isChecklist = (context.workflowKey || "").includes("lista-cotejo");
  const isStandaloneExam = (context.workflowKey || "").includes("examen");
  const isScale = (context.workflowKey || "").includes("escala-estimacion");
  const isTextQuestions = (context.workflowKey || "").includes("preguntas-texto");
  const typedQuestions = isStandaloneExam || isTextQuestions ? resolveQuestions(artifact) : [];
  const isExam =
    isStandaloneExam ||
    (context.workflowKey || "").includes("preguntas");

  const children: (Paragraph | Table)[] = [];

  // Encabezado
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
      spacing: { after: 120 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: cleanText(artifact.document_title).toUpperCase(),
          bold: true,
          color: COLOR_HEADING,
          size: 28,
          font: "Calibri",
        }),
      ],
      spacing: { after: 50 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `INSTRUMENTO OFICIAL DE EVALUACIÓN FORMATIVA · ${v.area.toUpperCase()}`,
          bold: true,
          color: COLOR_HEADING,
          size: 20,
          font: "Calibri",
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Si es Examen / Prueba
  if (isExam) {
    const examTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createStyledCell(`I.E.: ${fill(v.ie, 20)}`, { widthPercent: 40 }),
            createStyledCell(`Área: ${fill(v.area, 14)}`, { widthPercent: 35 }),
            createStyledCell(`Grado/Secc: ${fill(v.grade, 10)} "${fill(v.section, 4)}"`, { widthPercent: 25 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell("Apellidos y Nombres: __________________________________________________", {
              colSpan: 2,
              widthPercent: 75,
            }),
            createStyledCell(`Fecha: ____/____/${fill(v.year, 6)}`, { widthPercent: 25 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell(`Docente evaluador: ${fill(v.teacher, 22)}`, { colSpan: 2, widthPercent: 75 }),
            createStyledCell(`Puntaje: ____ / ${cleanText(context.values?.total_score) || "20"}`, {
              bold: true,
              widthPercent: 25,
              alignment: AlignmentType.CENTER,
              fillColor: "F1F5F9",
            }),
          ],
        }),
      ],
    });
    children.push(examTable);
  } else {
    // Datos informativos estándar
    children.push(createHeading("DATOS INFORMATIVOS", HeadingLevel.HEADING_1, "I."));
    const infoTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createStyledCell("INSTITUCIÓN EDUCATIVA", { bold: true, widthPercent: 35 }),
            createStyledCell(v.ie, { widthPercent: 65 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell("ÁREA CURRICULAR / GRADO", { bold: true, widthPercent: 35 }),
            createStyledCell(`${fill(v.area, 14)} · ${fill(v.grade, 10)} "${fill(v.section, 4)}"`, { widthPercent: 65 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell("DOCENTE EVALUADOR(A)", { bold: true, widthPercent: 35 }),
            createStyledCell(v.teacher, { widthPercent: 65 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell("PROPÓSITO DE LA EVALUACIÓN", { bold: true, widthPercent: 35 }),
            createStyledCell(artifact.executive_summary, { widthPercent: 65 }),
          ],
        }),
      ],
    });
    children.push(infoTable);
  }

  // Matriz de Evaluación
  if ((artifact.tables?.length ?? 0) > 0 && !isStandaloneExam && !isTextQuestions) {
    children.push(createHeading("MATRICES DE APLICACIÓN", HeadingLevel.HEADING_1, "II."));
    children.push(...createGeneratedTableBlocks(artifact));
    if (isRubric || isScale) children.push(...createScoringBlocks(rubricScoring(artifact.tables?.[0])));
  } else if (isRubric) {
    children.push(createHeading("MATRIZ ANALÍTICA DE NIVELES DE LOGRO", HeadingLevel.HEADING_1, "II."));
    const rubricRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("Criterio / Capacidad", { isHeader: true, widthPercent: 20 }),
          createStyledCell("Inicio (C)", { isHeader: true, widthPercent: 20 }),
          createStyledCell("En proceso (B)", { isHeader: true, widthPercent: 20 }),
          createStyledCell("Logro esperado (A)", { isHeader: true, widthPercent: 20 }),
          createStyledCell("Logro destacado (AD)", { isHeader: true, widthPercent: 20 }),
        ],
      }),
    ];

    artifact.sections.forEach((sec) => {
      rubricRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(sec.title, { bold: true, widthPercent: 20 }),
            createStyledCell(sec.key_points[0] || "Presenta dificultades iniciales para demostrar la habilidad.", {
              widthPercent: 20,
            }),
            createStyledCell(sec.key_points[1] || "Aplica con guía parcial y requiere andamiaje formativo.", {
              widthPercent: 20,
            }),
            createStyledCell(sec.key_points[2] || sec.narrative || "Demuestra solvencia en todas las tareas propuestas.", {
              widthPercent: 20,
            }),
            createStyledCell(sec.key_points[3] || "Supera el estándar esperado y transfiere a situaciones nuevas.", {
              widthPercent: 20,
            }),
          ],
        })
      );
    });
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: rubricRows }));
  } else if (isChecklist) {
    children.push(createHeading("LISTA DE COTEJO Y DESEMPEÑOS OBSERVABLES", HeadingLevel.HEADING_1, "II."));
    const checklistRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("N°", { isHeader: true, widthPercent: 6, alignment: AlignmentType.CENTER }),
          createStyledCell("Criterio / Desempeño Observable", { isHeader: true, widthPercent: 54 }),
          createStyledCell("Sí", { isHeader: true, widthPercent: 10, alignment: AlignmentType.CENTER }),
          createStyledCell("No", { isHeader: true, widthPercent: 10, alignment: AlignmentType.CENTER }),
          createStyledCell("Observaciones / Pautas", { isHeader: true, widthPercent: 20 }),
        ],
      }),
    ];

    const allPoints = artifact.sections.flatMap((s) => s.key_points);
    allPoints.forEach((point, idx) => {
      checklistRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(String(idx + 1), { alignment: AlignmentType.CENTER, widthPercent: 6 }),
            createStyledCell(point, { widthPercent: 54 }),
            createStyledCell("[  ]", { alignment: AlignmentType.CENTER, widthPercent: 10 }),
            createStyledCell("[  ]", { alignment: AlignmentType.CENTER, widthPercent: 10 }),
            createStyledCell("Retroalimentación oportuna en el aula.", { widthPercent: 20 }),
          ],
        })
      );
    });
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: checklistRows }));
  } else if (isStandaloneExam) {
    // El examen conserva su matriz, sus reactivos y una clave docente separada.
    if ((artifact.tables?.length ?? 0) > 0) {
      children.push(createHeading("MATRIZ DE ESPECIFICACIONES", HeadingLevel.HEADING_1, "I."));
      children.push(...createGeneratedTableBlocks(artifact));
    }
    children.push(createHeading("REACTIVOS Y CONSIGNAS DE EVALUACIÓN", HeadingLevel.HEADING_1, "II."));
    const teacherSections = artifact.sections.filter((section) => /(clave|criterios de correcci[oó]n|retroalimentaci[oó]n)/i.test(section.title));
    const examSectionPriority = (title: string) => /instrucciones/i.test(title) ? 0 : /puntaje/i.test(title) ? 1 : /preguntas/i.test(title) ? 2 : 3;
    const studentSections = artifact.sections
      .filter((section) => !teacherSections.includes(section) && !/matriz de especificaciones/i.test(section.title))
      .map((section, index) => ({ section, index }))
      .sort((left, right) => examSectionPriority(left.section.title) - examSectionPriority(right.section.title) || left.index - right.index)
      .map(({ section }) => section);
    studentSections.forEach((sec, idx) => {
      children.push(createHeading(`${idx + 1}. ${sec.title}`, HeadingLevel.HEADING_2));
      if (sec.narrative) children.push(...createBodyParagraphs(sec.narrative));
      if (/preguntas/i.test(sec.title)) {
        const questions = typedQuestions.length
          ? typedQuestions
          : sec.key_points.map((point, pointIndex) => parseQuestionText(point, pointIndex + 1));
        questions.forEach((question) => children.push(...createQuestionBlocks(question)));
        return;
      }
      sec.key_points.forEach((point, pointIndex) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({ text: `${pointIndex + 1}. ${cleanText(point)}`, size: 20, font: "Calibri", color: COLOR_TEXT }),
            ],
            spacing: { before: 40, after: 60 },
          })
        );
      });
    });

    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
      children: [new TextRun({ text: "GUÍA DOCENTE · NO ENTREGAR AL ESTUDIANTE", bold: true, size: 28, color: "000000" })],
      spacing: { after: 180 },
    }));
    const typedKey = createAnswerKeyBlocks(typedQuestions);
    children.push(...typedKey);
    teacherSections.filter((sec) => !(typedKey.length && /clave/i.test(sec.title))).forEach((sec, idx) => {
      children.push(createHeading(`${idx + 1}. ${sec.title}`, HeadingLevel.HEADING_2));
      if (sec.narrative) children.push(...createBodyParagraphs(sec.narrative));
      sec.key_points.forEach((point, pointIndex) => children.push(new Paragraph({
        children: [
          new TextRun({ text: `${pointIndex + 1}. `, bold: true, color: COLOR_SECONDARY, size: 20 }),
          new TextRun({ text: cleanText(point), color: "000000", size: 20 }),
        ],
        spacing: { after: 70 },
      })));
    });
    if (artifact.teacher_recommendations.length) {
      children.push(createHeading("Orientaciones para retroalimentar", HeadingLevel.HEADING_2));
      artifact.teacher_recommendations.forEach((recommendation) => children.push(new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun({ text: cleanText(recommendation), size: 19, font: "Calibri", color: COLOR_TEXT })],
        spacing: { after: 60 },
      })));
    }
  } else if (isTextQuestions && typedQuestions.length) {
    // Preguntas sobre un texto: fuente, reactivos por nivel y clave docente separada.
    const isTeacherSection = (title: string) => /(clave|criterios|retroalimentaci[oó]n|respuestas esperadas)/i.test(title);
    const isQuestionSection = (title: string) => /^preguntas/i.test(title.trim());
    const sourceSections = artifact.sections.filter((section) => !isTeacherSection(section.title) && !isQuestionSection(section.title));
    children.push(createHeading("TEXTO Y PREGUNTAS", HeadingLevel.HEADING_1, "II."));
    sourceSections.forEach((sec) => {
      children.push(createHeading(sec.title, HeadingLevel.HEADING_2));
      if (sec.narrative) children.push(...createBodyParagraphs(sec.narrative));
      sec.key_points.forEach((point) => children.push(createKeyPoint(point)));
    });
    const levels = [...new Set(typedQuestions.map((question) => question.cognitive_level || "Preguntas"))];
    levels.forEach((level) => {
      children.push(createHeading(level === "Preguntas" ? "Preguntas" : `Preguntas de nivel ${level.toLocaleLowerCase("es")}`, HeadingLevel.HEADING_2));
      typedQuestions
        .filter((question) => (question.cognitive_level || "Preguntas") === level)
        .forEach((question) => children.push(...createQuestionBlocks(question)));
    });
    if ((artifact.tables?.length ?? 0) > 0) children.push(...createGeneratedTableBlocks(artifact));

    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
      children: [new TextRun({ text: "GUÍA DOCENTE · NO ENTREGAR AL ESTUDIANTE", bold: true, size: 28, color: "000000", font: "Calibri" })],
      spacing: { after: 180 },
    }));
    const key = createAnswerKeyBlocks(typedQuestions);
    children.push(...key);
    artifact.sections
      .filter((section) => isTeacherSection(section.title) && !(key.length && /clave/i.test(section.title)))
      .forEach((sec) => {
        children.push(createHeading(sec.title, HeadingLevel.HEADING_2));
        if (sec.narrative) children.push(...createBodyParagraphs(sec.narrative));
        sec.key_points.forEach((point, pointIndex) => children.push(new Paragraph({
          children: [
            new TextRun({ text: `${pointIndex + 1}. `, bold: true, color: COLOR_SECONDARY, size: 20, font: "Calibri" }),
            ...labelRuns(point, 20),
          ],
          spacing: { after: 70 },
        })));
      });
  } else {
    // Otros instrumentos genéricos
    children.push(createHeading("REACTIVOS Y CONSIGNAS DE EVALUACIÓN", HeadingLevel.HEADING_1, "II."));
    artifact.sections.forEach((sec, idx) => {
      children.push(createHeading(`${idx + 1}. ${sec.title}`, HeadingLevel.HEADING_2));
      if (sec.narrative) children.push(...createBodyParagraphs(sec.narrative));
      sec.key_points.forEach((point) => children.push(new Paragraph({
        children: [new TextRun({ text: `[  ] ${cleanText(point)}`, size: 20, font: "Calibri", color: COLOR_TEXT })],
        spacing: { before: 40, after: 60 },
      })));
    });
  }

  // Orientaciones. Los instrumentos de evaluación se entregan listos para usar
  // y no fuerzan una hoja adicional únicamente para firmas. Las validaciones
  // institucionales se conservan en los documentos que realmente las requieren.
  if (artifact.teacher_recommendations.length > 0 && !isStandaloneExam) {
    children.push(createHeading("ORIENTACIONES PARA LA RETROALIMENTACIÓN DOCENTE", HeadingLevel.HEADING_1, "III."));
    artifact.teacher_recommendations.forEach((rec) => {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: cleanText(rec), size: 19, font: "Calibri", color: COLOR_TEXT })],
          spacing: { after: 60 },
        })
      );
    });
  }

  const isLandscape = isRubric
    || (artifact.tables ?? []).some((table) => table.columns.length > 5)
    || (context.workflowKey || "").includes("registros-auxiliares");

  return new Document({
    styles: documentStyles,
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: isLandscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
              width: 11906,
              height: 16838,
            },
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
                    text: headerText(v, "Evaluación Formativa CNEB"),
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
                  new TextRun({
                    text: "Página ",
                    size: 16,
                    color: COLOR_MUTED,
                    font: "Calibri",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: COLOR_MUTED,
                    font: "Calibri",
                  }),
                  new TextRun({
                    text: " de ",
                    size: 16,
                    color: COLOR_MUTED,
                    font: "Calibri",
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: COLOR_MUTED,
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
}

type FlashcardItem = { id?: string; prompt: string; answer?: string; hint?: string };

/** Celda de una tarjeta recortable: bordes punteados, altura fija y contenido centrado. */
function createFlashcardCell(card: FlashcardItem | null, index: number, side: "front" | "back"): TableCell {
  const dashed = { style: BorderStyle.DASHED, size: 8, color: COLOR_DASHED };
  const borders = { top: dashed, bottom: dashed, left: dashed, right: dashed };
  if (!card) {
    return new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, borders, children: [new Paragraph({ children: [] })] });
  }
  const label = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 90 },
    children: [new TextRun({
      text: side === "front" ? `✂  TARJETA N° ${index + 1}` : `TARJETA N° ${index + 1} · REVERSO  ✂`,
      bold: true, size: 15, color: COLOR_MUTED, font: "Calibri", characterSpacing: 15,
    })],
  });
  const body: Paragraph[] = side === "front"
    ? [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 60, after: 60, line: 276 },
        children: [new TextRun({ text: cleanText(card.prompt), bold: true, size: 24, color: COLOR_PRIMARY, font: "Calibri" })],
      })]
    : cleanText(card.answer ?? "")
      ? [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 40 },
            children: [new TextRun({ text: "¿QUÉ SIGNIFICA?", bold: true, size: 15, color: COLOR_SECONDARY, font: "Calibri" })],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 60, line: 264 },
            children: [new TextRun({ text: cleanText(card.answer ?? ""), size: 19, color: COLOR_TEXT, font: "Calibri" })],
          }),
          ...(cleanText(card.hint ?? "") ? [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 20 },
            children: [
              new TextRun({ text: "💡 Pista: ", bold: true, size: 17, color: COLOR_SECONDARY, font: "Calibri" }),
              new TextRun({ text: cleanText(card.hint ?? ""), italics: true, size: 17, color: COLOR_MUTED, font: "Calibri" }),
            ],
          })] : []),
        ]
      : [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 80 },
            children: [new TextRun({ text: "Escribe el significado con tus palabras:", bold: true, size: 17, color: COLOR_SECONDARY, font: "Calibri" })],
          }),
          ...Array.from({ length: 3 }, () => new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 70 },
            children: [new TextRun({ text: "______________________________________", size: 18, color: "B9CDE5", font: "Calibri" })],
          })),
        ];
  return new TableCell({
    width: { size: 50, type: WidthType.PERCENTAGE },
    borders,
    shading: { fill: side === "front" ? COLOR_CARD_FRONT_BG : COLOR_CARD_BACK_BG, type: ShadingType.CLEAR },
    margins: { top: 140, bottom: 140, left: 180, right: 180 },
    verticalAlign: VerticalAlign.CENTER,
    children: [label, ...body],
  });
}

/** Hoja de tarjetas en cuadrícula de dos columnas; frentes y reversos llevan el mismo número. */
function createFlashcardSheet(cards: FlashcardItem[], side: "front" | "back"): Table {
  const rows: TableRow[] = [];
  for (let index = 0; index < cards.length; index += 2) {
    const pair: Array<[FlashcardItem | null, number]> = [[cards[index] ?? null, index], [cards[index + 1] ?? null, index + 1]];
    rows.push(new TableRow({
      cantSplit: true,
      height: { value: 2500, rule: "atLeast" as const },
      children: pair.map(([card, cardIndex]) => createFlashcardCell(card, cardIndex, side)),
    }));
  }
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [Math.round(CONTENT_WIDTH_TWIPS / 2), Math.round(CONTENT_WIDTH_TWIPS / 2)],
    rows,
  });
}

// ==========================================================================
// 2. BUILDER: ACTIVIDADES Y RECURSOS
// ==========================================================================
export function buildActivityDocx(
  artifact: WorkflowArtifact,
  context: ExportWorkflowDocxOptions
): Document {
  const v = extractCommonValues(context.values, context);
  const isWordSearch = (context.workflowKey || "").includes("sopa");
  const isFlashcards = (context.workflowKey || "").includes("tarjeta");
  const isHangman = (context.workflowKey || "").includes("ahorcado");
  const isCompletion = (context.workflowKey || "").includes("completa");
  const isMatching = (context.workflowKey || "").includes("emparejar");
  const isCrossword = (context.workflowKey || "").includes("crucigrama");
  const isGrouping = (context.workflowKey || "").includes("agrupar");
  const isSequence = (context.workflowKey || "").includes("ordenar");
  const isDebate = (context.workflowKey || "").includes("debate");
  const isCaseStudy = (context.workflowKey || "").includes("casos-estudio");

  const children: (Paragraph | Table)[] = [];

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
      spacing: { after: 120 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: cleanText(artifact.document_title).toUpperCase(),
          bold: true,
          color: COLOR_HEADING,
          size: 28,
          font: "Calibri",
        }),
      ],
      spacing: { after: 50 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `FICHA DE APLICACIÓN Y TRABAJO ACTIVO · ${v.area.toUpperCase()}`,
          bold: true,
          color: COLOR_HEADING,
          size: 20,
          font: "Calibri",
        }),
      ],
      spacing: { after: 180 },
    })
  );

  // Encabezado del estudiante
  const studentHeader = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createStyledCell("Estudiante: __________________________________________________", {
            colSpan: 2,
            widthPercent: 75,
            fillColor: COLOR_ZEBRA_BG,
          }),
          createStyledCell(`Grado/Secc: ${fill(v.grade, 10)} "${fill(v.section, 4)}"`, { widthPercent: 25, fillColor: COLOR_ZEBRA_BG }),
        ],
      }),
      new TableRow({
        children: [
          createStyledCell(`I.E.: ${fill(v.ie, 20)}`, { widthPercent: 50, fillColor: COLOR_ZEBRA_BG }),
          createStyledCell(`Área: ${fill(v.area, 14)}`, { widthPercent: 25, fillColor: COLOR_ZEBRA_BG }),
          createStyledCell(`Fecha: ____/____/${fill(v.year, 6)}`, { widthPercent: 25, fillColor: COLOR_ZEBRA_BG }),
        ],
      }),
    ],
  });
  children.push(studentHeader);

  children.push(new Paragraph({ spacing: { after: 40 }, children: [] }));
  children.push(createCalloutBlock(
    "Instrucciones",
    cleanText(artifact.activity?.instructions || artifact.executive_summary) || "Lee con atención y completa los retos propuestos aplicando tus saberes.",
    { icon: "📝" },
  ));
  children.push(new Paragraph({ spacing: { after: 60 }, children: [] }));

  if ((artifact.tables?.length ?? 0) > 0 && !isDebate && !isCaseStudy) {
    children.push(createHeading("RUTA DE TRABAJO", HeadingLevel.HEADING_2));
    children.push(...createGeneratedTableBlocks(artifact));
  }

  // Si es Sopa de Letras
  if (isWordSearch) {
    children.push(createHeading("CUADRÍCULA DE BÚSQUEDA DE PALABRAS", HeadingLevel.HEADING_1, "I."));
    children.push(createCalloutBlock("Instrucciones para el estudiante", "Encuentra las palabras clave en la cuadrícula de letras (pueden estar en sentido horizontal, vertical o diagonal). Enciérralas con colores y escribe una oración breve para cada una en la tabla inferior.", { icon: "📝" }));

    const items = (artifact.activity?.items && artifact.activity.items.length > 0)
      ? artifact.activity.items
      : artifact.sections.flatMap((section, index) => section.key_points.map((point, pointIndex) => ({
          id: `fallback-${index}-${pointIndex}`,
          prompt: point,
          answer: point.split(/\s+/)[0] || "APRENDER",
          hint: section.title,
          options: [],
        }))).slice(0, 12);
    const words = items.map((item) => item.answer);
    const generatedSearch = createPrintableWordSearch(words);
    const gridMatrix: string[][] = generatedSearch.grid;

    const colWidth = Math.floor(100 / gridMatrix[0].length);

    const gridRows: TableRow[] = gridMatrix.map(
      (row) =>
        new TableRow({
          cantSplit: true,
          children: row.map((char) =>
            createStyledCell(char, {
              alignment: AlignmentType.CENTER,
              bold: true,
              fontSize: 16,
              widthPercent: colWidth,
            })
          ),
        })
    );
    children.push(
      new Table({ width: { size: 85, type: WidthType.PERCENTAGE }, alignment: AlignmentType.CENTER, rows: gridRows }),
      new Paragraph({ spacing: { after: 180 } })
    );

    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("PALABRAS CLAVE A ENCONTRAR Y APLICACIÓN", HeadingLevel.HEADING_1, "II."),
    );
    const wordsTableRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("Palabra Clave", { isHeader: true, widthPercent: 30 }),
          createStyledCell("Oración o Aplicación Curricular del Estudiante", { isHeader: true, widthPercent: 70 }),
        ],
      }),
    ];

    words.forEach((w) => {
      wordsTableRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(`[   ]  ${cleanText(w).toUpperCase()}`, { bold: true, widthPercent: 30 }),
            createStyledCell("___________________________________________________________________", { widthPercent: 70 }),
          ],
        })
      );
    });
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: wordsTableRows }));

    // Solucionario de Sopa de Letras en nueva página
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
      createHeading("SOLUCIONARIO Y GUÍA DE UBICACIÓN: SOPA DE LETRAS", HeadingLevel.HEADING_1, "III."),
      new Paragraph({
        children: [
          new TextRun({
            text: "(USO EXCLUSIVO DEL DOCENTE - NO ENTREGAR AL ESTUDIANTE)",
            italics: true,
            bold: true,
            size: 18,
            color: COLOR_MUTED,
            font: "Calibri",
          }),
        ],
        spacing: { after: 120 },
      })
    );

    const solutionRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("N°", { isHeader: true, widthPercent: 8, alignment: AlignmentType.CENTER }),
          createStyledCell("Palabra Clave", { isHeader: true, widthPercent: 22 }),
          createStyledCell("Coordenadas", { isHeader: true, widthPercent: 20, alignment: AlignmentType.CENTER }),
          createStyledCell("Sentido", { isHeader: true, widthPercent: 18, alignment: AlignmentType.CENTER }),
          createStyledCell("Pauta Pedagógica / Datos Clave", { isHeader: true, widthPercent: 32 }),
        ],
      }),
    ];

    items.forEach((item, idx) => {
      const placement = generatedSearch.placements.find(
        (candidate) => candidate.answer === normalizePuzzleWord(item.answer),
      );
      solutionRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(String(idx + 1), { widthPercent: 8, alignment: AlignmentType.CENTER, bold: true }),
            createStyledCell(cleanText(item.answer || item.prompt).toUpperCase(), { widthPercent: 22, bold: true }),
            createStyledCell(placement ? `Fila ${placement.row + 1}, Col ${placement.col + 1}` : "Revisar ubicación", { widthPercent: 20, alignment: AlignmentType.CENTER }),
            createStyledCell(placement?.direction ?? "No ubicada", { widthPercent: 18, alignment: AlignmentType.CENTER }),
            createStyledCell(cleanText(item.hint) || cleanText(item.prompt) || "Identificar características clave.", { widthPercent: 32, italics: true }),
          ],
        })
      );
    });

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: solutionRows }));
  } else if (isFlashcards) {
    const cardItems = (artifact.activity?.items && artifact.activity.items.length > 0)
      ? artifact.activity.items
      : artifact.sections.flatMap((s) => s.key_points).map((p, i) => ({
          id: String(i + 1),
          prompt: p,
          answer: "",
          hint: "",
          options: [],
        }));

    children.push(createHeading("TARJETAS DIDÁCTICAS RECORTABLES (FRENTE Y REVERSO)", HeadingLevel.HEADING_1, "I."));
    children.push(createCalloutBlock(
      "Cómo armar las tarjetas",
      "1. Recorta cada tarjeta por la línea punteada (✂): primero los frentes de la Hoja A y luego los reversos de la Hoja B, que llevan el mismo número.\n"
      + "2. Pega cada frente con su reverso espalda con espalda (o imprime la Hoja B al dorso de la Hoja A si tu impresora lo permite).\n"
      + "3. Lee la pregunta o concepto, formula tu respuesta en voz alta o por escrito y voltea la tarjeta para comprobar con la pista formativa.",
      { icon: "✂" },
    ));
    children.push(new Paragraph({ spacing: { after: 40 }, children: [] }));
    children.push(createHeading("Hoja A · Frentes: pregunta o concepto", HeadingLevel.HEADING_2));
    children.push(createFlashcardSheet(cardItems, "front"));
    children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
    children.push(createHeading("Hoja B · Reversos: respuesta y pista", HeadingLevel.HEADING_2));
    children.push(createFlashcardSheet(cardItems, "back"));

    // Solucionario de Tarjetas de Estudio en nueva página
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
      createHeading("SOLUCIONARIO Y PAUTA DOCENTE: TARJETAS DE ESTUDIO", HeadingLevel.HEADING_1, "II."),
      new Paragraph({
        children: [
          new TextRun({
            text: "(USO EXCLUSIVO DEL DOCENTE - NO ENTREGAR AL ESTUDIANTE)",
            italics: true,
            bold: true,
            size: 18,
            color: COLOR_MUTED,
            font: "Calibri",
          }),
        ],
        spacing: { after: 120 },
      })
    );

    const flashcardsSolutionRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("N°", { isHeader: true, widthPercent: 8, alignment: AlignmentType.CENTER }),
          createStyledCell("Concepto / Pregunta (Frente)", { isHeader: true, widthPercent: 32 }),
          createStyledCell("Respuesta y Explicación (Dorso)", { isHeader: true, widthPercent: 40 }),
          createStyledCell("Pauta Pedagógica / Ejemplo", { isHeader: true, widthPercent: 20 }),
        ],
      }),
    ];

    cardItems.forEach((card, idx) => {
      flashcardsSolutionRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(String(idx + 1), { widthPercent: 8, alignment: AlignmentType.CENTER, bold: true, fillColor: idx % 2 ? COLOR_ZEBRA_BG : undefined }),
            createStyledCell(cleanText(card.prompt), { widthPercent: 32, bold: true, fillColor: idx % 2 ? COLOR_ZEBRA_BG : undefined }),
            createStyledCell(cleanText(card.answer) || "Respuesta construida por el estudiante con sus propias palabras.", { widthPercent: 40, fillColor: idx % 2 ? COLOR_ZEBRA_BG : undefined }),
            createStyledCell(cleanText(card.hint) || "Verificar comprensión activa.", { widthPercent: 20, italics: true, fillColor: idx % 2 ? COLOR_ZEBRA_BG : undefined }),
          ],
        })
      );
    });

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: flashcardsSolutionRows }));
  } else if (isHangman) {
    children.push(createHeading("RETOS DE VOCABULARIO Y ADIVINANZAS: JUEGO DEL AHORCADO", HeadingLevel.HEADING_1, "I."));
    children.push(createCalloutBlock("Instrucciones para el estudiante", "Lee con atención la pista o adivinanza de cada reto. Descubre la palabra secreta completando una letra en cada casilla cuadrada. Puedes tachar en el abecedario las letras que vayas probando. Tienes 4 vidas [♥] por palabra antes de equivocarte.", { icon: "📝" }));

    const hangmanItems = (artifact.activity?.items && artifact.activity.items.length > 0)
      ? artifact.activity.items
      : artifact.sections.flatMap((s, sIdx) => s.key_points.map((kp, kpIdx) => ({
          id: `h-${sIdx}-${kpIdx}`,
          prompt: s.title ? `${s.title}: ${kp}` : kp,
          answer: kp.split(" ")[0] || "PALABRA",
          hint: s.narrative || "Pista orientadora",
          options: [],
        })));

    hangmanItems.forEach((item, idx) => {
      const cleanAnswer = cleanText(item.answer || "").toUpperCase().replace(/[^A-ZÑÁÉÍÓÚ]/g, "");
      const letters = cleanAnswer.length > 0 ? cleanAnswer.split("") : ["P", "A", "L", "A", "B", "R", "A"];

      // Cabecera del Reto
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `RETO N° ${idx + 1}: `,
              bold: true,
              color: COLOR_PRIMARY,
              size: 20,
              font: "Calibri",
            }),
            new TextRun({
              text: `«${cleanText(item.prompt)}»`,
              italics: true,
              size: 20,
              color: COLOR_TEXT,
              font: "Calibri",
            }),
          ],
          spacing: { before: 140, after: 80 },
        })
      );

      // Casillas de letras (Tabla de 1 fila con N celdas cuadradas)
      const letterCells: TableCell[] = letters.map(() =>
        createStyledCell(" ", {
          widthPercent: Math.max(5, Math.floor(90 / letters.length)),
          alignment: AlignmentType.CENTER,
          bold: true,
          fillColor: "FFFFFF",
        })
      );

      children.push(
        new Table({
          width: { size: Math.min(95, Math.max(30, letters.length * 8)), type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              cantSplit: true,
              children: letterCells,
            }),
          ],
        })
      );

      // Abecedario para tachar y vidas disponibles
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Abecedario: ",
              bold: true,
              size: 16,
              color: COLOR_MUTED,
              font: "Calibri",
            }),
            new TextRun({
              text: "A · B · C · D · E · F · G · H · I · J · K · L · M · N · Ñ · O · P · Q · R · S · T · U · V · W · X · Y · Z",
              size: 15,
              color: "#475569",
              font: "Calibri",
            }),
          ],
          spacing: { before: 60, after: 40 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "Vidas disponibles: [ ♥ ] [ ♥ ] [ ♥ ] [ ♥ ]",
              bold: true,
              size: 16,
              color: COLOR_PRIMARY,
              font: "Calibri",
            }),
            new TextRun({
              text: "    |    Intentos que usaste: [ ____ ]",
              size: 16,
              color: COLOR_MUTED,
              font: "Calibri",
            }),
          ],
          spacing: { after: 160 },
        })
      );
    });

    // Solucionario en nueva página
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
      createHeading("SOLUCIONARIO Y PAUTA DOCENTE: JUEGO DEL AHORCADO", HeadingLevel.HEADING_1, "II."),
      new Paragraph({
        children: [
          new TextRun({
            text: "(USO EXCLUSIVO DEL DOCENTE - NO ENTREGAR AL ESTUDIANTE)",
            italics: true,
            bold: true,
            size: 18,
            color: COLOR_MUTED,
            font: "Calibri",
          }),
        ],
        spacing: { after: 120 },
      })
    );

    const solutionRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("Reto", { isHeader: true, widthPercent: 10, alignment: AlignmentType.CENTER }),
          createStyledCell("Pista / Adivinanza", { isHeader: true, widthPercent: 45 }),
          createStyledCell("Palabra Secreta", { isHeader: true, widthPercent: 20, alignment: AlignmentType.CENTER }),
          createStyledCell("Orientación Pedagógica", { isHeader: true, widthPercent: 25 }),
        ],
      }),
    ];

    hangmanItems.forEach((item, idx) => {
      solutionRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(String(idx + 1), { widthPercent: 10, alignment: AlignmentType.CENTER, bold: true }),
            createStyledCell(cleanText(item.prompt), { widthPercent: 45 }),
            createStyledCell(cleanText(item.answer).toUpperCase(), { widthPercent: 20, alignment: AlignmentType.CENTER, bold: true }),
            createStyledCell(cleanText(item.hint) || "Reforzar el concepto en plenaria.", { widthPercent: 25, italics: true }),
          ],
        })
      );
    });

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: solutionRows }));
  } else if (isCompletion) {
    children.push(createHeading("FICHA DE APLICACIÓN: COMPLETA LA FRASE", HeadingLevel.HEADING_1, "I."));
    children.push(createCalloutBlock("Instrucciones para el estudiante", "Lee con atención cada enunciado. Selecciona la palabra adecuada del Banco de Palabras y escríbela sobre la línea punteada para completar correctamente cada oración.", { icon: "📝" }));

    // Obtener los ítems de completación
    const completionItems = (artifact.activity?.items && artifact.activity.items.length > 0)
      ? artifact.activity.items
      : artifact.sections.flatMap((s, sIdx) => s.key_points.map((kp, kpIdx) => ({
          id: `c-${sIdx}-${kpIdx}`,
          prompt: kp,
          answer: kp.split(" ")[0] || "PALABRA",
          hint: s.narrative || "Pista orientadora",
          options: [],
        })));

    // Banco de palabras
    const wordBankList = (artifact.activity?.word_bank && artifact.activity.word_bank.length > 0)
      ? artifact.activity.word_bank
      : completionItems.map((it) => it.answer.toUpperCase());

    // Renderizar caja de Banco de Palabras
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            cantSplit: true,
            children: [
              new TableCell({
                shading: { fill: "F0F4F8", type: ShadingType.CLEAR },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
                  bottom: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
                  left: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
                  right: { style: BorderStyle.SINGLE, size: 8, color: COLOR_PRIMARY },
                },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                      new TextRun({
                        text: "★ BANCO DE PALABRAS PARA COMPLETAR ★",
                        bold: true,
                        size: 18,
                        color: COLOR_PRIMARY,
                        font: "Calibri",
                      }),
                    ],
                    spacing: { before: 80, after: 60 },
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: wordBankList.map((word, wIdx) => new TextRun({
                      text: `[ ${word.toUpperCase()} ]${wIdx < wordBankList.length - 1 ? "   ·   " : ""}`,
                      bold: true,
                      size: 19,
                      color: COLOR_SECONDARY,
                      font: "Calibri",
                    })),
                    spacing: { after: 80 },
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      new Paragraph({ spacing: { after: 160 } })
    );

    // Oraciones numeradas con línea para completar
    completionItems.forEach((item, idx) => {
      let sentence = cleanText(item.prompt);
      const answer = cleanText(item.answer);
      if (answer && sentence.toLowerCase().includes(answer.toLowerCase())) {
        const regex = new RegExp(answer, "gi");
        sentence = sentence.replace(regex, "_________________________");
      } else if (!sentence.includes("_____")) {
        sentence = `${sentence}: _________________________`;
      }

      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${idx + 1}.  `,
              bold: true,
              color: COLOR_PRIMARY,
              size: 20,
              font: "Calibri",
            }),
            new TextRun({
              text: sentence,
              size: 20,
              color: COLOR_TEXT,
              font: "Calibri",
            }),
          ],
          spacing: { before: 80, after: 120 },
        })
      );
    });

    // Solucionario en nueva página
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
      createHeading("SOLUCIONARIO Y PAUTA DOCENTE: COMPLETA LA FRASE", HeadingLevel.HEADING_1, "II."),
      new Paragraph({
        children: [
          new TextRun({
            text: "(USO EXCLUSIVO DEL DOCENTE - NO ENTREGAR AL ESTUDIANTE)",
            italics: true,
            bold: true,
            size: 18,
            color: COLOR_MUTED,
            font: "Calibri",
          }),
        ],
        spacing: { after: 120 },
      })
    );

    const solutionRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("N°", { isHeader: true, widthPercent: 8, alignment: AlignmentType.CENTER }),
          createStyledCell("Enunciado Incompleto", { isHeader: true, widthPercent: 45 }),
          createStyledCell("Palabra Clave Correcta", { isHeader: true, widthPercent: 22, alignment: AlignmentType.CENTER }),
          createStyledCell("Explicación y Fundamento Pedagógico", { isHeader: true, widthPercent: 25 }),
        ],
      }),
    ];

    completionItems.forEach((item, idx) => {
      solutionRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(String(idx + 1), { widthPercent: 8, alignment: AlignmentType.CENTER, bold: true }),
            createStyledCell(cleanText(item.prompt), { widthPercent: 45 }),
            createStyledCell(cleanText(item.answer).toUpperCase(), { widthPercent: 22, alignment: AlignmentType.CENTER, bold: true }),
            createStyledCell(cleanText(item.hint) || "Verificar la concordancia gramatical y el significado biológico.", { widthPercent: 25, italics: true }),
          ],
        })
      );
    });

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: solutionRows }));
  } else if (isMatching) {
    children.push(createHeading("FICHA DE APLICACIÓN: EMPAREJAR CONCEPTOS Y RELACIONES", HeadingLevel.HEADING_1, "I."));
    children.push(createCalloutBlock("Instrucciones para el estudiante", "Lee con atención los conceptos de la Columna A y sus definiciones en la Columna B. Relaciona cada concepto escribiendo la letra mayúscula correspondiente dentro de los paréntesis vacíos (   ).", { icon: "📝" }));

    const matchingItems = (artifact.activity?.items && artifact.activity.items.length > 0)
      ? artifact.activity.items
      : artifact.sections.flatMap((s, sIdx) => s.key_points.map((kp, kpIdx) => ({
          id: `m-${sIdx}-${kpIdx}`,
          prompt: kp,
          answer: s.title || `Concepto ${kpIdx + 1}`,
          hint: s.narrative || "Relación conceptual",
          options: [],
        })));

    const letters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
    const shuffledIndices = matchingItems.map((_, i) => (i * 3 + 2) % matchingItems.length);
    const uniqueIndices = Array.from(new Set(shuffledIndices));
    const finalOrder = uniqueIndices.length === matchingItems.length
      ? shuffledIndices
      : matchingItems.map((_, i) => (i + 1) % matchingItems.length);

    const matchingRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("COLUMNA A: CONCEPTO / TÉRMINO", { isHeader: true, widthPercent: 42 }),
          createStyledCell("COLUMNA B: DEFINICIÓN / CASO", { isHeader: true, widthPercent: 58 }),
        ],
      }),
    ];

    matchingItems.forEach((item, idx) => {
      const rightIdx = finalOrder[idx];
      const rightItem = matchingItems[rightIdx];
      const leftLetter = letters[idx] || String(idx + 1);

      matchingRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            new TableCell({
              width: { size: 42, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: "BDD7EE" },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: "BDD7EE" },
                left: { style: BorderStyle.SINGLE, size: 4, color: "BDD7EE" },
                right: { style: BorderStyle.SINGLE, size: 4, color: "BDD7EE" },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: `${leftLetter}.  `, bold: true, color: COLOR_PRIMARY, size: 19, font: "Calibri" }),
                    new TextRun({ text: cleanText(item.answer || item.prompt), bold: true, size: 19, font: "Calibri", color: COLOR_TEXT }),
                  ],
                  spacing: { before: 80, after: 80 },
                }),
              ],
            }),
            new TableCell({
              width: { size: 58, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.SINGLE, size: 4, color: "BDD7EE" },
                bottom: { style: BorderStyle.SINGLE, size: 4, color: "BDD7EE" },
                left: { style: BorderStyle.SINGLE, size: 4, color: "BDD7EE" },
                right: { style: BorderStyle.SINGLE, size: 4, color: "BDD7EE" },
              },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: "(       )  ", bold: true, color: COLOR_PRIMARY, size: 20, font: "Calibri" }),
                    new TextRun({ text: cleanText(rightItem.prompt), size: 19, font: "Calibri", color: COLOR_TEXT }),
                  ],
                  spacing: { before: 80, after: 80 },
                }),
              ],
            }),
          ],
        })
      );
    });

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: matchingRows }));

    // Solucionario en nueva página
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
      createHeading("SOLUCIONARIO Y PAUTA DOCENTE: EMPAREJAR CONCEPTOS", HeadingLevel.HEADING_1, "II."),
      new Paragraph({
        children: [
          new TextRun({
            text: "(USO EXCLUSIVO DEL DOCENTE - NO ENTREGAR AL ESTUDIANTE)",
            italics: true,
            bold: true,
            size: 18,
            color: COLOR_MUTED,
            font: "Calibri",
          }),
        ],
        spacing: { after: 120 },
      })
    );

    const solutionRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("Letra", { isHeader: true, widthPercent: 8, alignment: AlignmentType.CENTER }),
          createStyledCell("Concepto (Columna A)", { isHeader: true, widthPercent: 32 }),
          createStyledCell("Paréntesis", { isHeader: true, widthPercent: 14, alignment: AlignmentType.CENTER }),
          createStyledCell("Definición Asociada (Columna B)", { isHeader: true, widthPercent: 46 }),
        ],
      }),
    ];

    matchingItems.forEach((item, idx) => {
      const letter = letters[idx] || String(idx + 1);
      solutionRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(letter, { widthPercent: 8, alignment: AlignmentType.CENTER, bold: true }),
            createStyledCell(cleanText(item.answer || item.prompt), { widthPercent: 32, bold: true }),
            createStyledCell(`(  ${letter}  )`, { widthPercent: 14, alignment: AlignmentType.CENTER, bold: true }),
            createStyledCell(cleanText(item.prompt), { widthPercent: 46 }),
          ],
        })
      );
    });

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: solutionRows }));
  } else if (isCrossword) {
    children.push(createHeading("CUADRÍCULA Y RETOS DEL CRUCIGRAMA EDUCATIVO", HeadingLevel.HEADING_1, "I."));
    children.push(createCalloutBlock("Instrucciones para el estudiante", "Lee atentamente las pistas horizontales y verticales. Escribe una letra en cada casilla blanca según el número correspondiente. Las casillas sombreadas indican separación entre palabras.", { icon: "📝" }));

    const crosswordItems = (artifact.activity?.items && artifact.activity.items.length > 0)
      ? artifact.activity.items
      : artifact.sections.flatMap((section, index) => section.key_points.map((point, pointIndex) => ({
          id: `fallback-${index}-${pointIndex}`,
          prompt: point,
          answer: point.split(/\s+/)[0] || "APRENDER",
          hint: section.title,
          options: [],
        }))).slice(0, 12);
    const crossword = createPrintableCrossword(crosswordItems);
    const crosswordGrid = crossword.grid;
    const startNumbers = new Map(
      crossword.entries.map((entry) => [`${entry.row},${entry.col}`, entry.number]),
    );

    const gridRows: TableRow[] = crosswordGrid.map((row, rowIndex) =>
      new TableRow({
        cantSplit: true,
        children: row.map((cell, colIndex) => {
          const isBlocked = cell === "█";
          const cellContent = isBlocked ? "" : String(startNumbers.get(`${rowIndex},${colIndex}`) ?? "");
          return new TableCell({
            width: { size: 10, type: WidthType.PERCENTAGE },
            shading: {
              fill: isBlocked ? "334155" : "FFFFFF",
              type: ShadingType.CLEAR,
            },
            borders: {
              top: { style: BorderStyle.SINGLE, size: isBlocked ? 2 : 8, color: isBlocked ? "475569" : "1F4D78" },
              bottom: { style: BorderStyle.SINGLE, size: isBlocked ? 2 : 8, color: isBlocked ? "475569" : "1F4D78" },
              left: { style: BorderStyle.SINGLE, size: isBlocked ? 2 : 8, color: isBlocked ? "475569" : "1F4D78" },
              right: { style: BorderStyle.SINGLE, size: isBlocked ? 2 : 8, color: isBlocked ? "475569" : "1F4D78" },
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: cellContent,
                    bold: true,
                    size: 16,
                    color: COLOR_PRIMARY,
                    font: "Calibri",
                  }),
                ],
                spacing: { before: 20, after: 40 },
              }),
            ],
          });
        }),
      })
    );

    children.push(
      new Table({
        width: { size: 75, type: WidthType.PERCENTAGE },
        alignment: AlignmentType.CENTER,
        rows: gridRows,
      }),
      new Paragraph({ spacing: { after: 180 } })
    );

    // Pistas horizontales y verticales calculadas desde la cuadrícula real.
    const horizontales = crossword.entries.filter((entry) => !entry.vertical);
    const verticales = crossword.entries.filter((entry) => entry.vertical);

    children.push(
      new Paragraph({ children: [new PageBreak()] }),
      createHeading("PISTAS PARA COMPLETAR EL CRUCIGRAMA", HeadingLevel.HEADING_2),
    );

    const maxClues = Math.max(horizontales.length, verticales.length);
    const clueRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("HORIZONTALES ( → )", { isHeader: true, widthPercent: 50 }),
          createStyledCell("VERTICALES ( ↓ )", { isHeader: true, widthPercent: 50 }),
        ],
      }),
    ];

    for (let i = 0; i < maxClues; i++) {
      const h = horizontales[i];
      const v = verticales[i];
      clueRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(h ? `${h.number}. ${cleanText(h.prompt)}` : "", { widthPercent: 50 }),
            createStyledCell(v ? `${v.number}. ${cleanText(v.prompt)}` : "", { widthPercent: 50 }),
          ],
        })
      );
    }

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: clueRows }));

    // Solucionario en nueva página
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
      createHeading("SOLUCIONARIO Y PAUTA DOCENTE: CRUCIGRAMA", HeadingLevel.HEADING_1, "II."),
      new Paragraph({
        children: [
          new TextRun({
            text: "(USO EXCLUSIVO DEL DOCENTE - NO ENTREGAR AL ESTUDIANTE)",
            italics: true,
            bold: true,
            size: 18,
            color: COLOR_MUTED,
            font: "Calibri",
          }),
        ],
        spacing: { after: 120 },
      })
    );

    const solutionRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("N°", { isHeader: true, widthPercent: 8, alignment: AlignmentType.CENTER }),
          createStyledCell("Sentido", { isHeader: true, widthPercent: 15, alignment: AlignmentType.CENTER }),
          createStyledCell("Pista Curricular", { isHeader: true, widthPercent: 42 }),
          createStyledCell("Palabra Clave Resuelta", { isHeader: true, widthPercent: 20, alignment: AlignmentType.CENTER }),
          createStyledCell("Orientación Pedagógica", { isHeader: true, widthPercent: 15 }),
        ],
      }),
    ];

    crossword.entries.forEach((item) => {
      solutionRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(String(item.number), { widthPercent: 8, alignment: AlignmentType.CENTER, bold: true }),
            createStyledCell(item.vertical ? "Vertical ( ↓ )" : "Horizontal ( → )", { widthPercent: 15, alignment: AlignmentType.CENTER }),
            createStyledCell(cleanText(item.prompt), { widthPercent: 42 }),
            createStyledCell(cleanText(item.answer).toUpperCase(), { widthPercent: 20, alignment: AlignmentType.CENTER, bold: true }),
            createStyledCell(cleanText(item.hint) || "Reforzar ubicación geográfica.", { widthPercent: 15, italics: true }),
          ],
        })
      );
    });

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: solutionRows }));
  } else if (isGrouping) {
    children.push(createHeading("FICHA DE APLICACIÓN: AGRUPAR Y CATEGORIZAR CONCEPTOS", HeadingLevel.HEADING_1, "I."));
    children.push(createCalloutBlock("Instrucciones para el estudiante", "Observa con atención el Banco de Términos desordenados. Clasifica y escribe cada elemento en la columna correspondiente según el criterio pedagógico indicado.", { icon: "📝" }));

    const rawBank = (artifact.activity?.word_bank && artifact.activity.word_bank.length > 0)
      ? artifact.activity.word_bank
      : (artifact.activity?.items && artifact.activity.items.length > 0)
      ? artifact.activity.items.map((i) => i.answer)
      : [
          "VACA", "LEÓN", "CERDO", "CONEJO", "TIGRE", "OSO",
          "OVEJA", "ÁGUILA", "CHIMPANCÉ", "CABALLO", "TIBURÓN", "GALLINA"
        ];

    const bankRuns: TextRun[] = [
      new TextRun({ text: "★ BANCO DE TÉRMINOS A CLASIFICAR ★   ", bold: true, color: "2E7D32", size: 18, font: "Calibri" }),
    ];
    rawBank.forEach((term, idx) => {
      bankRuns.push(
        new TextRun({
          text: `[  ${cleanText(term).toUpperCase()}  ]${idx < rawBank.length - 1 ? "   " : ""}`,
          bold: true,
          color: COLOR_PRIMARY,
          size: 18,
          font: "Calibri",
        })
      );
    });

    const bankTable = new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              shading: { fill: "F0FDF4", type: ShadingType.CLEAR },
              borders: {
                top: { style: BorderStyle.DASHED, size: 6, color: "22C55E" },
                bottom: { style: BorderStyle.DASHED, size: 6, color: "22C55E" },
                left: { style: BorderStyle.DASHED, size: 6, color: "22C55E" },
                right: { style: BorderStyle.DASHED, size: 6, color: "22C55E" },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: bankRuns,
                  spacing: { before: 120, after: 120 },
                }),
              ],
            }),
          ],
        }),
      ],
    });

    children.push(bankTable, new Paragraph({ spacing: { after: 160 } }));

    const categories = artifact.sections && artifact.sections.length >= 3
      ? artifact.sections.slice(0, 3).map((s) => s.title)
      : ["HERBÍVOROS (Plantas)", "CARNÍVOROS (Carne)", "OMNÍVOROS (Plantas y Carne)"];

    const groupRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: categories.map((cat) =>
          createStyledCell(cat.toUpperCase(), {
            isHeader: true,
            alignment: AlignmentType.CENTER,
            widthPercent: 33,
          })
        ),
      }),
    ];

    for (let r = 0; r < 4; r++) {
      groupRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(`${r + 1}.  ___________________________`, { widthPercent: 33 }),
            createStyledCell(`${r + 1}.  ___________________________`, { widthPercent: 33 }),
            createStyledCell(`${r + 1}.  ___________________________`, { widthPercent: 33 }),
          ],
        })
      );
    }

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: groupRows }));

    // Solucionario en nueva página
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
      createHeading("SOLUCIONARIO Y PAUTA DOCENTE: AGRUPAR CONCEPTOS", HeadingLevel.HEADING_1, "II."),
      new Paragraph({
        children: [
          new TextRun({
            text: "(USO EXCLUSIVO DEL DOCENTE - NO ENTREGAR AL ESTUDIANTE)",
            italics: true,
            bold: true,
            size: 18,
            color: COLOR_MUTED,
            font: "Calibri",
          }),
        ],
        spacing: { after: 120 },
      })
    );

    const solutionRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("Categoría Curricular", { isHeader: true, widthPercent: 25 }),
          createStyledCell("Criterio y Definición Biológica", { isHeader: true, widthPercent: 30 }),
          createStyledCell("Elementos Correctos Agrupados", { isHeader: true, widthPercent: 30 }),
          createStyledCell("Orientación Pedagógica", { isHeader: true, widthPercent: 15 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("HERBÍVOROS", { widthPercent: 25, bold: true }),
          createStyledCell("Animales cuya dieta está compuesta exclusivamente de plantas, hierbas y pastos.", { widthPercent: 30 }),
          createStyledCell("VACA, CONEJO, OVEJA, CABALLO", { widthPercent: 30, bold: true, color: COLOR_PRIMARY }),
          createStyledCell("Reforzar adaptaciones de dentadura plana y digestión.", { widthPercent: 15, italics: true }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("CARNÍVOROS", { widthPercent: 25, bold: true }),
          createStyledCell("Animales que consumen primordialmente carne de otros animales mediante caza o carroña.", { widthPercent: 30 }),
          createStyledCell("LEÓN, TIGRE, ÁGUILA, TIBURÓN", { widthPercent: 30, bold: true, color: COLOR_PRIMARY }),
          createStyledCell("Comprender su rol como depredadores en la cadena trófica.", { widthPercent: 15, italics: true }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("OMNÍVOROS", { widthPercent: 25, bold: true }),
          createStyledCell("Animales con dieta mixta que se alimentan tanto de materia vegetal como animal.", { widthPercent: 30 }),
          createStyledCell("CERDO, OSO, CHIMPANCÉ, GALLINA", { widthPercent: 30, bold: true, color: COLOR_PRIMARY }),
          createStyledCell("Analizar la ventaja adaptativa ante cambios del ecosistema.", { widthPercent: 15, italics: true }),
        ],
      }),
    ];

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: solutionRows }));
  } else if (isSequence) {
    children.push(createHeading("FICHA DE APLICACIÓN: ORDENAR BLOQUES Y SECUENCIAS", HeadingLevel.HEADING_1, "I."));
    children.push(createCalloutBlock("Instrucciones para el estudiante", "Lee con atención los bloques desordenados. Analiza la cronología o el procedimiento lógico y escribe el número de orden correspondiente en cada casilla.", { icon: "📝" }));

    const sequenceItems = (artifact.activity?.items && artifact.activity.items.length > 0)
      ? artifact.activity.items
      : artifact.sections.flatMap((s) => s.key_points).map((p, idx) => ({
          id: String(idx + 1),
          prompt: p,
          answer: String(idx + 1),
          hint: "Etapa o paso clave del proceso.",
          options: [],
        }));

    const blockRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("✂ Bloque / Paso", { isHeader: true, widthPercent: 20, alignment: AlignmentType.CENTER }),
          createStyledCell("Descripción del Hecho o Procedimiento", { isHeader: true, widthPercent: 60 }),
          createStyledCell(`Tu Orden (1 al ${sequenceItems.length})`, { isHeader: true, widthPercent: 20, alignment: AlignmentType.CENTER }),
        ],
      }),
    ];

    const shuffled = [...sequenceItems].sort((a, b) => {
      const parity = (Number(a.id) % 2) - (Number(b.id) % 2);
      return parity || Number(a.id) - Number(b.id);
    });

    shuffled.forEach((item, idx) => {
      blockRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(`✂ Bloque #${idx + 1}`, { bold: true, alignment: AlignmentType.CENTER, widthPercent: 20, fillColor: "F8FAFC" }),
            createStyledCell(cleanText(item.prompt) + (item.hint ? `\n\n💡 Pista formativa: ${cleanText(item.hint)}` : ""), { widthPercent: 60 }),
            createStyledCell("[     ]", { bold: true, alignment: AlignmentType.CENTER, widthPercent: 20, fontSize: 22 }),
          ],
        })
      );
    });

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: blockRows }));

    // Solucionario en nueva página
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
      createHeading("SOLUCIONARIO Y PAUTA DOCENTE: ORDEN LÓGICO Y SECUENCIAS", HeadingLevel.HEADING_1, "II."),
      new Paragraph({
        children: [
          new TextRun({
            text: "(USO EXCLUSIVO DEL DOCENTE - NO ENTREGAR AL ESTUDIANTE)",
            italics: true,
            bold: true,
            size: 18,
            color: COLOR_MUTED,
            font: "Calibri",
          }),
        ],
        spacing: { after: 120 },
      })
    );

    const solutionRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("N° Orden", { isHeader: true, widthPercent: 12, alignment: AlignmentType.CENTER }),
          createStyledCell("Acontecimiento / Bloque Oficial", { isHeader: true, widthPercent: 53 }),
          createStyledCell("Pauta Pedagógica / Criterio Temporal", { isHeader: true, widthPercent: 35 }),
        ],
      }),
    ];

    sequenceItems.forEach((item, idx) => {
      solutionRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(`Paso ${idx + 1}`, { widthPercent: 12, alignment: AlignmentType.CENTER, bold: true }),
            createStyledCell(cleanText(item.prompt), { widthPercent: 53, bold: true }),
            createStyledCell(cleanText(item.hint) || "Verificar correlatividad histórica y procedimental.", { widthPercent: 35, italics: true }),
          ],
        })
      );
    });

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: solutionRows }));
  } else if (isDebate) {
    const activity = artifact.activity;
    const items = activity?.items ?? [];
    const teacherSection = (title: string) => /(pauta|docente|criterio|r[uú]brica|evaluaci[oó]n|solucion)/i.test(title);
    children.push(createHeading("GUÍA Y ESTRUCTURA DEL DEBATE EN EL AULA", HeadingLevel.HEADING_1, "I."));
    children.push(createLabeledParagraph("Moción o tesis central:", artifact.document_title));
    children.push(createLabeledParagraph(
      "Instrucciones y acuerdos de convivencia:",
      activity?.instructions || artifact.executive_summary,
    ));
    artifact.sections.filter((section) => !teacherSection(section.title)).forEach((sec) => {
      children.push(createHeading(sec.title, HeadingLevel.HEADING_2));
      if (sec.narrative) children.push(...createBodyParagraphs(sec.narrative));
      sec.key_points.forEach((point) => children.push(createKeyPoint(point)));
    });
    if ((artifact.tables?.length ?? 0) > 0) children.push(...createGeneratedTableBlocks(artifact));

    if (items.length) {
      children.push(createHeading("Banco de argumentos y preguntas", HeadingLevel.HEADING_2));
      const rows = [
        new TableRow({
          tableHeader: true,
          cantSplit: true,
          children: [
            createStyledCell("N°", { isHeader: true, widthPercent: 7 }),
            createStyledCell("Argumento o pregunta", { isHeader: true, widthPercent: 43 }),
            createStyledCell("Rol o momento", { isHeader: true, widthPercent: 20 }),
            createStyledCell("Repreguntas para profundizar", { isHeader: true, widthPercent: 30 }),
          ],
        }),
        ...items.map((item, index) => new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(String(index + 1), { widthPercent: 7, alignment: AlignmentType.CENTER, bold: true }),
            createStyledCell(item.prompt, { widthPercent: 43 }),
            createStyledCell(item.hint || " ", { widthPercent: 20 }),
            createStyledCell(item.options?.length ? item.options.join("\n") : " ", { widthPercent: 30 }),
          ],
        })),
      ];
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }), new Paragraph({ spacing: { after: 140 } }));
    }

    children.push(createHeading("Ficha de observación del jurado", HeadingLevel.HEADING_2));
    const observationCriteria = [
      "Solidez y coherencia de los argumentos",
      "Uso de datos, evidencias y ejemplos",
      "Claridad de expresión, tono y respeto",
      "Capacidad de refutación de ideas contrarias",
    ];
    const noteRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("Criterio observado", { isHeader: true, widthPercent: 30 }),
          createStyledCell("Equipo a favor (notas / puntaje 1-4)", { isHeader: true, widthPercent: 35 }),
          createStyledCell("Equipo en contra (notas / puntaje 1-4)", { isHeader: true, widthPercent: 35 }),
        ],
      }),
      ...observationCriteria.map((criterion) => new TableRow({
        cantSplit: true,
        children: [
          createStyledCell(criterion, { bold: true, widthPercent: 30 }),
          createStyledCell("Notas: ________________________\nPuntaje: [   ]", { widthPercent: 35 }),
          createStyledCell("Notas: ________________________\nPuntaje: [   ]", { widthPercent: 35 }),
        ],
      })),
    ];
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: noteRows }));

    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(createHeading("PAUTA DOCENTE Y CRITERIOS DE EVALUACIÓN", HeadingLevel.HEADING_1, "II."));
    children.push(createBodyParagraph("(Uso exclusivo del docente. Evaluación formativa CNEB)", { italic: true, after: 120 }));
    artifact.sections.filter((section) => teacherSection(section.title)).forEach((sec) => {
      children.push(createHeading(sec.title, HeadingLevel.HEADING_2));
      if (sec.narrative) children.push(...createBodyParagraphs(sec.narrative));
      sec.key_points.forEach((point) => children.push(createKeyPoint(point)));
    });
    if (items.some((item) => item.answer)) {
      children.push(createHeading("Desarrollo esperado de cada argumento", HeadingLevel.HEADING_2));
      const rows = [
        new TableRow({
          tableHeader: true,
          cantSplit: true,
          children: [
            createStyledCell("N°", { isHeader: true, widthPercent: 7 }),
            createStyledCell("Argumento o pregunta", { isHeader: true, widthPercent: 38 }),
            createStyledCell("Desarrollo esperado con evidencia", { isHeader: true, widthPercent: 55 }),
          ],
        }),
        ...items.map((item, index) => new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(String(index + 1), { widthPercent: 7, alignment: AlignmentType.CENTER, bold: true }),
            createStyledCell(item.prompt, { widthPercent: 38 }),
            createStyledCell(item.answer || " ", { widthPercent: 55 }),
          ],
        })),
      ];
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
    }
    artifact.teacher_recommendations.forEach((recommendation) => children.push(createKeyPoint(recommendation)));
  } else if (isCaseStudy) {
    const activity = artifact.activity;
    const items = activity?.items ?? [];
    const teacherSection = (title: string) => /(pauta|docente|criterio|r[uú]brica|evaluaci[oó]n|solucion|respuesta)/i.test(title);
    children.push(createHeading("ESTUDIO DE CASO: ANÁLISIS Y PROPUESTA", HeadingLevel.HEADING_1, "I."));
    children.push(createLabeledParagraph("Título del caso:", artifact.document_title));
    children.push(createLabeledParagraph("Situación problemática:", artifact.executive_summary));
    if (activity?.instructions) children.push(createLabeledParagraph("Consigna de trabajo:", activity.instructions));
    artifact.sections.filter((section) => !teacherSection(section.title)).forEach((sec) => {
      children.push(createHeading(sec.title, HeadingLevel.HEADING_2));
      if (sec.narrative) children.push(...createBodyParagraphs(sec.narrative));
      sec.key_points.forEach((point) => children.push(createKeyPoint(point)));
    });
    if ((artifact.tables?.length ?? 0) > 0) children.push(...createGeneratedTableBlocks(artifact));

    if (items.length) {
      children.push(createHeading("Preguntas de análisis del equipo", HeadingLevel.HEADING_2));
      const rows = [
        new TableRow({
          tableHeader: true,
          cantSplit: true,
          children: [
            createStyledCell("N°", { isHeader: true, widthPercent: 7 }),
            createStyledCell("Pregunta y evidencias sugeridas", { isHeader: true, widthPercent: 43 }),
            createStyledCell("Análisis y propuesta del equipo", { isHeader: true, widthPercent: 50 }),
          ],
        }),
        ...items.map((item, index) => new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(String(index + 1), { widthPercent: 7, alignment: AlignmentType.CENTER, bold: true }),
            createStyledCell(
              item.options?.length ? `${item.prompt}\nEvidencias: ${item.options.join("; ")}` : item.prompt,
              { widthPercent: 43 },
            ),
            createStyledCell("____________________________________\n____________________________________\n____________________________________", { widthPercent: 50 }),
          ],
        })),
      ];
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
    }

    children.push(new Paragraph({ children: [new PageBreak()] }));
    children.push(createHeading("PAUTA DOCENTE Y CRITERIOS DE EVALUACIÓN", HeadingLevel.HEADING_1, "II."));
    children.push(createBodyParagraph("(Uso exclusivo del docente. No entregar al estudiante)", { italic: true, after: 120 }));
    if (items.some((item) => item.answer || item.hint)) {
      children.push(createHeading("Respuestas esperadas y andamiaje", HeadingLevel.HEADING_2));
      const rows = [
        new TableRow({
          tableHeader: true,
          cantSplit: true,
          children: [
            createStyledCell("N°", { isHeader: true, widthPercent: 7 }),
            createStyledCell("Pregunta", { isHeader: true, widthPercent: 30 }),
            createStyledCell("Respuesta o criterio esperado", { isHeader: true, widthPercent: 38 }),
            createStyledCell("Andamiaje docente", { isHeader: true, widthPercent: 25 }),
          ],
        }),
        ...items.map((item, index) => new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(String(index + 1), { widthPercent: 7, alignment: AlignmentType.CENTER, bold: true }),
            createStyledCell(item.prompt, { widthPercent: 30 }),
            createStyledCell(item.answer || " ", { widthPercent: 38 }),
            createStyledCell(item.hint || " ", { widthPercent: 25 }),
          ],
        })),
      ];
      children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
    }
    artifact.sections.filter((section) => teacherSection(section.title)).forEach((sec) => {
      children.push(createHeading(sec.title, HeadingLevel.HEADING_2));
      if (sec.narrative) children.push(...createBodyParagraphs(sec.narrative));
      sec.key_points.forEach((point) => children.push(createKeyPoint(point)));
    });
    artifact.teacher_recommendations.forEach((recommendation) => children.push(createKeyPoint(recommendation)));
  } else {
    // Retos y actividades estándar
    artifact.sections.forEach((sec, idx) => {
      children.push(createHeading(`${idx + 1}. ${sec.title}`, HeadingLevel.HEADING_1));
      if (sec.narrative) children.push(...createBodyParagraphs(sec.narrative));
      if (sec.key_points.length > 0) {
        const actRows: TableRow[] = [
          new TableRow({
            tableHeader: true,
            cantSplit: true,
            children: [
              createStyledCell("Paso", { isHeader: true, widthPercent: 10, alignment: AlignmentType.CENTER }),
              createStyledCell("Consigna / Reto a Resolver", { isHeader: true, widthPercent: 55 }),
              createStyledCell("Respuesta o Evidencia del Estudiante", { isHeader: true, widthPercent: 35 }),
            ],
          }),
        ];
        sec.key_points.forEach((p, pIdx) => {
          actRows.push(
            new TableRow({
              cantSplit: true,
              children: [
                createStyledCell(String(pIdx + 1), { alignment: AlignmentType.CENTER, widthPercent: 10 }),
                createStyledCell(p, { widthPercent: 55 }),
                createStyledCell("Evidencia / Respuesta del estudiante:\n_________________________________________\n_________________________________________", { widthPercent: 35, fillColor: "FAFAFA" }),
              ],
            })
          );
        });
        children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: actRows }));
      }
    });

    // Solucionario al pie estándar
    children.push(createHeading("SOLUCIONARIO Y CLAVE DOCENTE (DESGLOSABLE)", HeadingLevel.HEADING_2));
    artifact.teacher_recommendations.forEach((rec) => {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: cleanText(rec), size: 18, color: COLOR_MUTED, font: "Calibri" })],
          spacing: { after: 40 },
        })
      );
    });
  }

  return new Document({
    styles: documentStyles,
    sections: [
      {
        properties: pageProperties(isWordSearch || isCrossword ? "landscape" : "portrait"),
        headers: documentHeader(headerText(v, isPlaceholder(v.area) ? "Ficha de trabajo" : v.area)),
        footers: documentFooter(),
        children,
      },
    ],
  });
}

// ==========================================================================
// 3. BUILDER: ANÁLISIS, MÉTRICAS Y ALERTAS
// ==========================================================================
export function buildAnalyticsDocx(
  artifact: WorkflowArtifact,
  context: ExportWorkflowDocxOptions
): Document {
  const v = extractCommonValues(context.values, context);
  const children: (Paragraph | Table)[] = [];

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
      spacing: { after: 120 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: cleanText(artifact.document_title).toUpperCase(),
          bold: true,
          color: COLOR_HEADING,
          size: 28,
          font: "Calibri",
        }),
      ],
      spacing: { after: 50 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "INFORME TÉCNICO PEDAGÓGICO DE SEGUIMIENTO Y ALERTAS",
          bold: true,
          color: COLOR_HEADING,
          size: 20,
          font: "Calibri",
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // I. Datos del informe
  children.push(createHeading("DATOS DEL INFORME", HeadingLevel.HEADING_1, "I."));
  const reportTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createStyledCell("INSTITUCIÓN EDUCATIVA", { bold: true, widthPercent: 35 }),
          createStyledCell(v.ie, { widthPercent: 65 }),
        ],
      }),
      new TableRow({
        children: [
          createStyledCell("GRADO Y SECCIÓN EVALUADA", { bold: true, widthPercent: 35 }),
          createStyledCell(`${fill(v.grade, 10)} "${fill(v.section, 4)}" · ${fill(v.area, 14)}`, { widthPercent: 65 }),
        ],
      }),
      new TableRow({
        children: [
          createStyledCell("DOCENTE RESPONSABLE", { bold: true, widthPercent: 35 }),
          createStyledCell(v.teacher, { widthPercent: 65 }),
        ],
      }),
      new TableRow({
        children: [
          createStyledCell("FECHA DE EMISIÓN", { bold: true, widthPercent: 35 }),
          createStyledCell(new Date().toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" }), {
            widthPercent: 65,
          }),
        ],
      }),
    ],
  });
  children.push(reportTable);

  // II. Resumen ejecutivo
  children.push(createHeading("RESUMEN EJECUTIVO Y DIAGNÓSTICO", HeadingLevel.HEADING_1, "II."));
  children.push(createBodyParagraph(artifact.executive_summary));

  // III. Matriz semaforizada
  children.push(createHeading("MATRIZ SEMAFORIZADA DE RIESGO Y ESTADO PEDAGÓGICO", HeadingLevel.HEADING_1, "III."));
  const analyticsRows: TableRow[] = [
    new TableRow({
      tableHeader: true,
      cantSplit: true,
      children: [
        createStyledCell("Ámbito / Competencia", { isHeader: true, widthPercent: 25 }),
        createStyledCell("Nivel de Riesgo", { isHeader: true, widthPercent: 15, alignment: AlignmentType.CENTER }),
        createStyledCell("Hallazgo Pedagógico Observado", { isHeader: true, widthPercent: 35 }),
        createStyledCell("Acción Remedial Prioritaria", { isHeader: true, widthPercent: 25 }),
      ],
    }),
  ];

  const riskFills = { danger: "FEE2E2", warning: "FEF3C7", success: "DCFCE7" } as const;
  artifact.sections.forEach((sec) => {
    const assessment = riskLevelFor(sec, artifact.tables ?? []);
    const riskLabel = assessment.label;
    const riskFill = riskFills[assessment.level];
    analyticsRows.push(
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell(sec.title, { bold: true, widthPercent: 25 }),
          createStyledCell(riskLabel, {
            bold: true,
            alignment: AlignmentType.CENTER,
            widthPercent: 15,
            fillColor: riskFill,
          }),
          createStyledCell(sec.narrative, { widthPercent: 35 }),
          createStyledCell(sec.key_points[0] || "Acompañamiento personalizado en aula.", { widthPercent: 25 }),
        ],
      })
    );
  });
  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: analyticsRows }));

  // IV. Matrices generadas por la IA (indicadores, alertas, decisiones)
  let analyticsPart = 4;
  if ((artifact.tables?.length ?? 0) > 0) {
    children.push(createHeading("MATRICES DE ANÁLISIS", HeadingLevel.HEADING_1, "IV."));
    children.push(...createGeneratedTableBlocks(artifact));
    analyticsPart = 5;
  }

  // Plan de acción y firmas
  children.push(createHeading("PLAN DE ACCIÓN Y COMPROMISOS INSTITUCIONALES", HeadingLevel.HEADING_1, `${toRoman(analyticsPart)}.`));
  artifact.teacher_recommendations.forEach((rec) => {
    children.push(
      new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun({ text: cleanText(rec), size: 19, font: "Calibri", color: COLOR_TEXT })],
        spacing: { after: 60 },
      })
    );
  });

  children.push(createSignaturesTable(displayValue(v.teacher, ""), "Docente Responsable del Análisis", displayValue(v.director, ""), "Dirección / Coordinación Pedagógica"));

  return new Document({
    styles: documentStyles,
    sections: [
      {
        properties: pageProperties("portrait"),
        headers: documentHeader(headerText(v, "Informe de seguimiento")),
        footers: documentFooter(),
        children,
      },
    ],
  });
}

// ==========================================================================
// 4. BUILDER: COMUNICACIONES A FAMILIAS
// ==========================================================================
export function buildCommunicationDocx(
  artifact: WorkflowArtifact,
  context: ExportWorkflowDocxOptions
): Document {
  const v = extractCommonValues(context.values, context);
  const children: (Paragraph | Table)[] = [];

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
          text: cleanText(v.ie).toUpperCase(),
          bold: true,
          color: COLOR_PRIMARY,
          size: 26,
          font: "Calibri",
        }),
      ],
      spacing: { after: 40 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `COMUNICADO OFICIAL A LA FAMILIA · CICLO ESCOLAR ${fill(v.year, 6)}`,
          bold: true,
          color: COLOR_SECONDARY,
          size: 19,
          font: "Calibri",
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // Destinatario
  const commTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          createStyledCell(`Para: ${fill(v.guardian, 22)} (Padre, madre o tutor legal)`, { widthPercent: 60 }),
          createStyledCell(`Fecha: ${new Date().toLocaleDateString("es-PE")}`, { widthPercent: 40 }),
        ],
      }),
      new TableRow({
        children: [
          createStyledCell(`Estudiante: ${fill(v.student, 22)} · ${fill(v.grade, 10)} "${fill(v.section, 4)}"`, { widthPercent: 60 }),
          createStyledCell(`Asunto: ${cleanText(artifact.document_title)}`, { bold: true, widthPercent: 40 }),
        ],
      }),
    ],
  });
  children.push(commTable);

  const institution = isPlaceholder(v.ie) ? "de nuestra institución educativa" : `de la I.E. "${v.ie}"`;
  children.push(
    createBodyParagraph(isPlaceholder(v.guardian) ? "Estimada familia:" : `Estimada familia ${v.guardian}:`, { bold: true }),
    createBodyParagraph(
      `Reciban un cordial saludo institucional de parte del equipo directivo y docente ${institution}. Por medio de la presente nos dirigimos a ustedes para informarles lo siguiente:`
    ),
    ...createBodyParagraphs(artifact.executive_summary)
  );

  artifact.sections.forEach((sec) => {
    children.push(createHeading(sec.title, HeadingLevel.HEADING_2));
    if (sec.narrative) children.push(...createBodyParagraphs(sec.narrative));
    sec.key_points.forEach((point) => children.push(createKeyPoint(point)));
  });

  if ((artifact.tables?.length ?? 0) > 0) children.push(...createGeneratedTableBlocks(artifact));

  children.push(
    createBodyParagraph(
      "Agradecemos de antemano su constante compromiso con la formación integral de su menor hijo(a)."
    ),
    createBodyParagraph("Atentamente,")
  );

  children.push(createSignaturesTable(displayValue(v.teacher, ""), "Docente Tutor(a)", displayValue(v.director, ""), "Dirección General"));

  // Talón desglosable
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: "✂ - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -",
          color: "94A3B8",
          size: 16,
          font: "Calibri",
        }),
      ],
      spacing: { before: 240, after: 80 },
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "TALÓN DE ACUSE DE RECIBO (Desglosar y entregar firmado al aula)",
          bold: true,
          color: COLOR_PRIMARY,
          size: 18,
          font: "Calibri",
        }),
      ],
      spacing: { after: 80 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Yo, ____________________________________________________, identificado con DNI N.° __________________, padre/madre/tutor de ${fill(v.student, 22)} del ${fill(v.grade, 10)} "${fill(v.section, 4)}", confirmo haber recibido y tomado conocimiento de la comunicación "${cleanText(artifact.document_title)}". Firma del Padre / Apoderado: __________________________________        Teléfono: ___________________`,
          size: 17,
          font: "Calibri",
          color: COLOR_TEXT,
        }),
      ],
      spacing: { after: 100 },
    })
  );

  return new Document({
    styles: documentStyles,
    sections: [
      {
        properties: pageProperties("portrait"),
        headers: documentHeader(headerText(v, "Comunicación a la familia")),
        footers: documentFooter(),
        children,
      },
    ],
  });
}

// ========================================================================== 
// 5. FICHA RESOLUBLE: TAREA DE EXTENSIÓN Y HOGAR
// ========================================================================== 
function createHomeworkResponseBlocks(responseType = "texto_breve"): (Paragraph | Table)[] {
  if (responseType === "tabla") {
    return [new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: Array.from({ length: 4 }, (_, rowIndex) => new TableRow({
        children: Array.from({ length: 3 }, (_, columnIndex) =>
          createStyledCell(
            rowIndex === 0 ? `Dato ${columnIndex + 1}` : " ",
            { isHeader: rowIndex === 0, widthPercent: 33 }
          )
        ),
      })),
    })];
  }
  if (responseType === "operacion") {
    return [
      createBodyParagraph("Procedimiento y operación:", { italic: true, after: 35 }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: Array.from({ length: 5 }, () => new TableRow({
          children: Array.from({ length: 6 }, () => createStyledCell(" ", { widthPercent: 16 })),
        })),
      }),
      createBodyParagraph("Comprobación: ______________________________________________________________", { after: 80 }),
    ];
  }
  if (responseType === "dibujo") {
    return [new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({
        children: [createStyledCell([
          createBodyParagraph("Dibuja, rotula o representa aquí:", { italic: true, after: 520 }),
          createBodyParagraph("________________________________________________________________________________"),
        ])],
      })],
    })];
  }
  if (responseType === "producto_adjunto") {
    return [
      createBodyParagraph("Nombre del producto o archivo: _________________________________________________"),
      createBodyParagraph("Descripción de la evidencia: ___________________________________________________"),
      createBodyParagraph("________________________________________________________________________________", { after: 80 }),
    ];
  }
  return createAnswerLines(responseType === "desarrollo" ? 7 : 3);
}

export function buildHomeworkDocx(
  artifact: WorkflowArtifact,
  context: ExportWorkflowDocxOptions
): Document {
  const v = extractCommonValues(context.values, context);
  const activity = artifact.activity;
  if (!activity || activity.mode !== "ficha_hogar" || activity.items.length < 3) {
    throw new Error("La tarea no contiene actividades suficientes para exportar.");
  }

  const materials = Array.from(
    new Set(activity.items.flatMap((item) => item.options).map(cleanText).filter(Boolean))
  );
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: "FICHA DE TAREA DE EXTENSIÓN Y HOGAR",
        bold: true,
        color: COLOR_HEADING,
        size: 30,
        font: "Calibri",
      })],
      spacing: { after: 80 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: cleanText(artifact.document_title).toUpperCase(),
        bold: true,
        color: COLOR_HEADING,
        size: 24,
        font: "Calibri",
      })],
      spacing: { after: 180 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createStyledCell("Estudiante: __________________________________________", { widthPercent: 60 }),
            createStyledCell(`Grado y sección: ${fill(v.grade, 10)} — ${fill(v.section, 4)}`, { widthPercent: 40 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell(`I.E.: ${fill(v.ie, 20)}`, { widthPercent: 60 }),
            createStyledCell("Fecha: ____ / ____ / ______", { widthPercent: 40 }),
          ],
        }),
      ],
    }),
    createHeading("¿QUÉ VAS A LOGRAR?", HeadingLevel.HEADING_1, "1."),
    createBodyParagraph(artifact.executive_summary),
    createHeading("¿QUÉ NECESITAS?", HeadingLevel.HEADING_1, "2."),
    createBodyParagraph(
      materials.length
        ? materials.join(" · ")
        : "Cuaderno u hojas reutilizables, lápiz y los materiales disponibles en casa."
    ),
    createHeading("INSTRUCCIONES", HeadingLevel.HEADING_1, "3."),
    createBodyParagraph(activity.instructions),
    createHeading("ACTIVIDADES PARA RESOLVER", HeadingLevel.HEADING_1, "4."),
  ];

  activity.items.forEach((item, index) => {
    if (index > 0 && ["operacion", "dibujo"].includes(item.response_type ?? "")) {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
    children.push(
      new Paragraph({
        children: [
          new Bookmark({
            id: item.id,
            children: [new TextRun({
              text: `${index + 1}. ${cleanText(item.prompt)}`,
              bold: true,
              color: COLOR_TEXT,
              size: 21,
              font: "Calibri",
            })],
          }),
        ],
        spacing: { before: 170, after: 90, line: 276 },
      })
    );
    if (item.hint) {
      children.push(createBodyParagraph(`Pista: ${item.hint}`, { italic: true, after: 60 }));
    }
    children.push(
      createBodyParagraph("Respuesta / evidencia:", { bold: true, after: 40 }),
      ...createHomeworkResponseBlocks(item.response_type)
    );
  });

  children.push(
    createHeading("REVISO MI TRABAJO ANTES DE ENTREGAR", HeadingLevel.HEADING_1, "5."),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          tableHeader: true,
          children: [
            createStyledCell("Criterio", { isHeader: true, widthPercent: 72, color: COLOR_HEADING }),
            createStyledCell("Sí", { isHeader: true, widthPercent: 14, color: COLOR_HEADING }),
            createStyledCell("Aún debo mejorar", { isHeader: true, widthPercent: 14, color: COLOR_HEADING }),
          ],
        }),
        ...activity.items.map((item) => new TableRow({
          children: [
            createStyledCell(`Realicé y expliqué: ${cleanText(item.prompt)}`, { widthPercent: 72 }),
            createStyledCell("☐", { widthPercent: 14, alignment: AlignmentType.CENTER }),
            createStyledCell("☐", { widthPercent: 14, alignment: AlignmentType.CENTER }),
          ],
        })),
      ],
    }),
    new Paragraph({ children: [new PageBreak()] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({
        text: "GUÍA DOCENTE — NO ENTREGAR CON LA FICHA DEL ESTUDIANTE",
        bold: true,
        color: COLOR_HEADING,
        size: 25,
        font: "Calibri",
      })],
      spacing: { after: 160 },
    }),
    createBodyParagraph(
      "Esta sección contiene productos esperados para orientar la revisión. Las respuestas del estudiante pueden variar si conservan el propósito y presentan evidencia suficiente."
    )
  );

  activity.items.forEach((item, index) => {
    children.push(
      createHeading(`ACTIVIDAD ${index + 1}`, HeadingLevel.HEADING_2),
      createBodyParagraph(item.prompt, { bold: true }),
      createBodyParagraph(`Producto o respuesta esperada: ${item.answer}`)
    );
  });
  children.push(
    createHeading("RETROALIMENTACIÓN SUGERIDA", HeadingLevel.HEADING_1),
    ...artifact.teacher_recommendations.map((recommendation) =>
      createBodyParagraph(`• ${recommendation}`)
    )
  );

  return new Document({
    styles: documentStyles,
    sections: [{
      properties: {
        page: {
          size: { orientation: PageOrientation.PORTRAIT, width: 11906, height: 16838 },
          margin: { top: 850, bottom: 850, left: 980, right: 980 },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [new TextRun({
              text: headerText(v, isPlaceholder(v.area) ? "Tarea de extensión" : v.area),
              color: COLOR_MUTED,
              size: 16,
              font: "Calibri",
            })],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({ text: "Página ", color: COLOR_MUTED, size: 16, font: "Calibri" }),
              new TextRun({ children: [PageNumber.CURRENT], color: COLOR_MUTED, size: 16, font: "Calibri" }),
              new TextRun({ text: " de ", color: COLOR_MUTED, size: 16, font: "Calibri" }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], color: COLOR_MUTED, size: 16, font: "Calibri" }),
            ],
          })],
        }),
      },
      children,
    }],
  });
}

// ========================================================================== 
// 5. BUILDER: DOCUMENTOS DE GESTIÓN CURRICULAR Y RECURSOS
// ========================================================================== 
const LONG_DOCUMENTS: Array<[string, string]> = [
  ["carpeta-pedagogica", "Carpeta pedagógica"],
  ["unidad-aprendizaje", "Unidad de aprendizaje"],
  ["proyectos-integrados", "Proyecto de aprendizaje integrado"],
  ["plan-tutoria", "Plan de tutoría"],
  ["plan-atencion", "Plan de atención"],
  ["plan-refuerzo", "Plan de refuerzo"],
];

/** Portada institucional e índice para los documentos extensos. */
type IndexEntry = { title: string; level: 1 | 2 };

function createCoverBlocks(
  artifact: WorkflowArtifact,
  v: ReturnType<typeof extractCommonValues>,
  kindLabel: string,
  entries: IndexEntry[],
): (Paragraph | Table | TableOfContents)[] {
  const line = (text: string, size: number, bold = false, color = COLOR_TEXT) => new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: cleanText(text), bold, color, size, font: "Calibri" })],
    spacing: { after: 140 },
  });
  const rows: [string, string][] = ([
    ["INSTITUCIÓN EDUCATIVA", v.ie],
    ["DRE / UGEL", [v.dre, v.ugel].filter((part) => !isPlaceholder(part)).join(" / ")],
    ["NIVEL / GRADO / SECCIÓN", isPlaceholder(v.grade) ? "" : `${v.level} / ${v.grade} "${v.section}"`],
    ["ÁREA CURRICULAR", v.area],
    ["DOCENTE RESPONSABLE", v.teacher],
    ["DIRECTOR(A)", v.director],
    ["AÑO LECTIVO", v.year],
  ] as [string, string][]).filter(([, value]) => !isPlaceholder(value) && !/no registrado/i.test(value));
  // Una tabla sin filas hace fallar a docx ("Invalid array length"): solo se construye si hay datos.
  const table = rows.length ? new Table({
    width: { size: 70, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.CENTER,
    rows: rows.map(([label, value], index) => new TableRow({
      cantSplit: true,
      children: [
        createStyledCell(label, { bold: true, widthPercent: 40, fillColor: index % 2 ? COLOR_ZEBRA_BG : undefined }),
        createStyledCell(value, { widthPercent: 60, fillColor: index % 2 ? COLOR_ZEBRA_BG : undefined }),
      ],
    })),
  }) : null;
  const band = (text: string, size: number, fill: string, color: string) => new Paragraph({
    alignment: AlignmentType.CENTER,
    shading: { type: ShadingType.CLEAR, fill },
    children: [new TextRun({ text: cleanText(text), bold: true, color, size, font: "Calibri" })],
    spacing: { before: 120, after: 140 },
  });
  return [
    new Paragraph({ spacing: { before: 2200 }, children: [] }),
    line(isPlaceholder(v.ie) ? "Institución educativa" : v.ie, 24, true, COLOR_PRIMARY),
    band(kindLabel.toLocaleUpperCase("es"), 40, COLOR_PRIMARY, "FFFFFF"),
    line(artifact.document_title, 26, true),
    new Paragraph({ spacing: { before: 500 }, children: [] }),
    ...(table ? [table] : []),
    new Paragraph({ spacing: { before: 700 }, children: [] }),
    band(`Año lectivo ${isPlaceholder(v.year) ? "________" : v.year}`, 22, COLOR_BAND_BG, COLOR_PRIMARY),
    new Paragraph({ children: [new PageBreak()] }),
    createHeading("CONTENIDO", HeadingLevel.HEADING_1),
    new TableOfContents("Contenido", { hyperlink: true, headingStyleRange: "1-2", cachedEntries: entries }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

export function buildDocumentDocx(
  artifact: WorkflowArtifact,
  context: ExportWorkflowDocxOptions
): Document {
  const v = extractCommonValues(context.values, context);
  const isSession = (context.workflowKey || "").includes("sesion");
  const longDocument = LONG_DOCUMENTS.find(([key]) => (context.workflowKey || "").includes(key));
  const isLongDocument = Boolean(longDocument);
  // Las tablas se imprimen junto a la sección que las describe; el resto forma
  // un bloque de matrices. Solo sin tablas de la IA se usa la secuencia genérica.
  const placement = attachTablesToSections(artifact);
  const showGenericSequence = placement.remaining.length === 0 && isSession && (artifact.tables?.length ?? 0) === 0;
  const children: (Paragraph | Table | TableOfContents)[] = [];
  if (longDocument) {
    // Índice precargado con la misma estructura que se construye más abajo.
    let part = 3;
    const entries: IndexEntry[] = [
      { title: "I. INFORMACIÓN GENERAL", level: 1 },
      { title: "II. PROPÓSITO GENERAL Y FUNDAMENTACIÓN", level: 1 },
    ];
    if (placement.remaining.length > 0) {
      entries.push({ title: `${toRoman(part)}. MATRICES DE PLANIFICACIÓN`, level: 1 });
      placement.remaining.forEach((table) => entries.push({ title: cleanText(table.title), level: 2 }));
      part += 1;
    } else if (showGenericSequence) {
      entries.push({ title: "III. SECUENCIA DIDÁCTICA Y PROCESOS PEDAGÓGICOS", level: 1 });
      part += 1;
    }
    artifact.sections.forEach((sec, idx) => entries.push({ title: `${toRoman(part + idx)}. ${stripNumbering(cleanText(sec.title)).toLocaleUpperCase("es")}`, level: 1 }));
    part += artifact.sections.length;
    if (artifact.teacher_recommendations.length > 0) entries.push({ title: `${toRoman(part)}. ORIENTACIONES PARA LA REVISIÓN DOCENTE`, level: 1 });
    children.push(...createCoverBlocks(artifact, v, context.toolTitle ? String(context.toolTitle) : longDocument[1], entries));
  }

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
      spacing: { after: 120 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: cleanText(artifact.document_title).toUpperCase(),
          bold: true,
          color: COLOR_HEADING,
          size: 28,
          font: "Calibri",
        }),
      ],
      spacing: { after: 50 },
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: [
            isPlaceholder(v.area) ? "" : `ÁREA: ${v.area.toUpperCase()}`,
            isPlaceholder(v.level) ? "" : `NIVEL: ${v.level.toUpperCase()}`,
            isPlaceholder(v.grade) ? "" : `GRADO: ${v.grade.toUpperCase()}${isPlaceholder(v.section) ? "" : ` "${v.section}"`}`,
          ].filter(Boolean).join(" · ") || "DOCUMENTO DE PLANIFICACIÓN CURRICULAR",
          bold: true,
          color: COLOR_HEADING,
          size: 20,
          font: "Calibri",
        }),
      ],
      spacing: { after: 200 },
    })
  );

  // I. Información General
  children.push(createHeading("INFORMACIÓN GENERAL", HeadingLevel.HEADING_1, "I."));
  const infoRows: [string, string][] = [
    ["DRE", v.dre],
    ["UGEL", v.ugel],
    ["INSTITUCIÓN EDUCATIVA", v.ie],
    ["NIVEL / GRADO / SECCIÓN", `${fill(v.level, 10)} / ${fill(v.grade, 10)} "${fill(v.section, 4)}"`],
    ["ÁREA CURRICULAR", v.area],
    ["DOCENTE RESPONSABLE", v.teacher],
    ["DIRECTOR(A)", v.director],
    ["AÑO LECTIVO", v.year],
  ];

  const providedInfoRows = infoRows.filter(([, value]) => !isPlaceholder(value) && !/no registrado/i.test(value));
  // Sin datos aportados, el documento deja espacios de llenado en lugar de "No registrado".
  const visibleInfoRows: [string, string][] = providedInfoRows.length
    ? providedInfoRows
    : [["INSTITUCIÓN EDUCATIVA", "________________________"], ["DOCENTE RESPONSABLE", "________________________"], ["AÑO LECTIVO", "________"]];
  const infoTableRows: TableRow[] = visibleInfoRows.map(
    ([label, val], idx) =>
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell(label, { bold: true, widthPercent: 35, fillColor: idx % 2 === 0 ? undefined : COLOR_ZEBRA_BG }),
          createStyledCell(val, { widthPercent: 65, fillColor: idx % 2 === 0 ? undefined : COLOR_ZEBRA_BG }),
        ],
      })
  );
  children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: infoTableRows }));

  // II. Propósito general
  children.push(createHeading("PROPÓSITO GENERAL Y FUNDAMENTACIÓN", HeadingLevel.HEADING_1, "II."));
  children.push(createBodyParagraph(artifact.executive_summary));

  let partNumber = 3;
  if (placement.remaining.length > 0) {
    children.push(createHeading("MATRICES DE PLANIFICACIÓN", HeadingLevel.HEADING_1, `${toRoman(partNumber)}.`));
    children.push(...createTableBlocks(placement.remaining));
    partNumber += 1;
  } else if (showGenericSequence) {
    children.push(createHeading("SECUENCIA DIDÁCTICA Y PROCESOS PEDAGÓGICOS", HeadingLevel.HEADING_1, "III."));
    const momentsRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("Momento Didáctico", { isHeader: true, widthPercent: 20 }),
          createStyledCell("Tiempo", { isHeader: true, widthPercent: 15, alignment: AlignmentType.CENTER }),
          createStyledCell("Actividades, Mediación y Procesos Pedagógicos", { isHeader: true, widthPercent: 65 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("INICIO", { bold: true, widthPercent: 20 }),
          createStyledCell("15 - 20 min", { alignment: AlignmentType.CENTER, widthPercent: 15 }),
          createStyledCell(
            "• Motivación y problematización inicial.\n• Recuperación de saberes previos y conflicto cognitivo.\n• Comunicación del propósito de aprendizaje y acuerdos de convivencia.",
            { widthPercent: 65 }
          ),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("DESARROLLO", { bold: true, widthPercent: 20 }),
          createStyledCell("55 - 60 min", { alignment: AlignmentType.CENTER, widthPercent: 15 }),
          createStyledCell(
            "• Gestión y acompañamiento del desarrollo de las competencias.\n• Trabajo individual y colaborativo con material concreto o textos.\n• Retroalimentación formativa por descubrimiento ante errores constructivos.",
            { widthPercent: 65 }
          ),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("CIERRE", { bold: true, widthPercent: 20 }),
          createStyledCell("10 - 15 min", { alignment: AlignmentType.CENTER, widthPercent: 15 }),
          createStyledCell(
            "• Metacognición: ¿Qué aprendimos hoy? ¿Qué dificultades tuvimos y cómo las superamos?\n• Evaluación del cumplimiento de acuerdos y compromisos para el hogar.",
            { widthPercent: 65 }
          ),
        ],
      }),
    ];
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: momentsRows }));
    partNumber += 1;
  }

  // Secciones desarrolladas, cada una con sus tablas a continuación
  artifact.sections.forEach((sec, idx) => {
    children.push(createHeading(stripNumbering(sec.title), HeadingLevel.HEADING_1, `${toRoman(partNumber + idx)}.`));
    if (sec.narrative) children.push(...createBodyParagraphs(sec.narrative));
    sec.key_points.forEach((point) => children.push(createKeyPoint(point)));
    const sectionTables = placement.bySection.get(idx);
    if (sectionTables?.length) children.push(...createTableBlocks(sectionTables, { sectionTitle: sec.title }));
  });
  partNumber += artifact.sections.length;

  // Orientaciones docentes
  if (artifact.teacher_recommendations.length > 0) {
    children.push(createHeading("ORIENTACIONES PARA LA REVISIÓN DOCENTE", HeadingLevel.HEADING_1, `${toRoman(partNumber)}.`));
    artifact.teacher_recommendations.forEach((rec) => {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: cleanText(rec), size: 19, font: "Calibri", color: COLOR_TEXT })],
          spacing: { after: 50 },
        })
      );
    });
  }

  // Las firmas solo corresponden a documentos institucionales que realmente las requieren.
  // No se agregan a juegos, bancos de recursos, fichas breves ni materiales didácticos.
  const institutionalDocuments = [
    "unidad-aprendizaje",
    "sesion-aprendizaje",
    "proyectos-integrados",
    "adaptacion-nee-dua",
    "carpeta-pedagogica",
    "plan-atencion",
    "plan-refuerzo",
    "plan-tutoria",
    "informe-tutoria",
    "informe-padres",
    "fichas-acompanamiento",
  ];
  const shouldIncludeSignatures = institutionalDocuments.some((key) =>
    (context.workflowKey || "").includes(key)
  );
  if (shouldIncludeSignatures) {
    children.push(
      createSignaturesTable(
        displayValue(v.teacher, ""),
        isPlaceholder(v.area) ? "Docente responsable" : `Docente responsable de ${v.area}`,
        displayValue(v.director, ""),
        "Director(a) / Equipo Directivo"
      )
    );
  }

  return new Document({
    features: { updateFields: isLongDocument },
    styles: documentStyles,
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT, width: 11906, height: 16838 },
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
                    text: headerText(v, "Planificación Curricular CNEB"),
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
                  new TextRun({
                    text: "Página ",
                    size: 16,
                    color: COLOR_MUTED,
                    font: "Calibri",
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 16,
                    color: COLOR_MUTED,
                    font: "Calibri",
                  }),
                  new TextRun({
                    text: " de ",
                    size: 16,
                    color: COLOR_MUTED,
                    font: "Calibri",
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 16,
                    color: COLOR_MUTED,
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
}

// ==========================================================================
// FUNCIÓN PRINCIPAL DE EXPORTACIÓN UNIVERSAL
// ==========================================================================
export async function buildWorkflowDocxBlob(
  artifact: WorkflowArtifact,
  options: ExportWorkflowDocxOptions = {}
) : Promise<{ blob: Blob; fileName: string }> {
  // 1. Plan Curricular Anual
  if (options.workflowKey === "planificamos/plan-curricular-anual") {
    const doc = await buildPlanAnualDocxDocument(artifact, options);
    const blob = await Packer.toBlob(doc);
    const fileName = `${safeFileName(artifact.document_title || "plan-curricular-anual-2026")}.docx`;
    return { blob, fileName };
  }

  // 2. Determinar arquetipo según workflowKey
  const key = options.workflowKey || "";
  let doc: Document;

  if (key === "planificamos/tarea-extension-hogar") {
    doc = buildHomeworkDocx(artifact, options);
  } else if (
    key.includes("rubrica") ||
    key.includes("lista-cotejo") ||
    key.includes("examen") ||
    key.includes("escala-estimacion") ||
    key.includes("preguntas-texto") ||
    key.includes("ficha-observacion") ||
    key.includes("registros-auxiliares")
  ) {
    doc = buildInstrumentDocx(artifact, options);
  } else if (
    key.includes("sopas-letras") ||
    key.includes("crucigramas") ||
    key.includes("tarjetas-estudio") ||
    key.includes("agrupar-palabras") ||
    key.includes("ordenar-bloques") ||
    key.includes("casos-estudio") ||
    key.includes("ahorcado") ||
    key.includes("completa-frase") ||
    key.includes("emparejar-palabras") ||
    key.includes("debate-aula") ||
    key.includes("trabajo-autonomo")
  ) {
    doc = buildActivityDocx(artifact, options);
  } else if (
    key.includes("calificador") ||
    key.includes("analytics") ||
    key.includes("alertas") ||
    key.includes("monitorea") ||
    key.includes("seguimiento-evaluacion")
  ) {
    doc = buildAnalyticsDocx(artifact, options);
  } else if (
    key.includes("correo-familias") ||
    key.includes("trabajo-familias") ||
    key.includes("respuesta-correo")
  ) {
    doc = buildCommunicationDocx(artifact, options);
  } else {
    // Curricular Documents (Unidades, Sesiones, Proyectos, DUA, etc.) & Resources
    doc = buildDocumentDocx(artifact, options);
  }

  const blob = await Packer.toBlob(doc);
  const fileName = `${safeFileName(artifact.document_title || "avendia-documento")}.docx`;
  return { blob, fileName };
}

export async function exportWorkflowDocx(
  artifact: WorkflowArtifact,
  options: ExportWorkflowDocxOptions = {}
) {
  const { blob, fileName } = await buildWorkflowDocxBlob(artifact, options);
  if (typeof document !== "undefined" && typeof window !== "undefined") {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
  return blob;
}

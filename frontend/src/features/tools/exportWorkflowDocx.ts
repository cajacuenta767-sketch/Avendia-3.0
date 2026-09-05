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
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import type { WorkflowActivity } from "./InteractiveArtifact";
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
const COLOR_HEADER_BG = "BDD7EE"; // Azul suave para cabeceras de tablas
const COLOR_ZEBRA_BG = "F8FAFC"; // Fondo alterno sutil
const COLOR_BORDER = "BDD7EE"; // Borde suave institucional
const COLOR_TEXT = "1F2937"; // Texto oscuro legible
const COLOR_MUTED = "64748B"; // Texto secundario
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
  const fillColor = options.fillColor ?? (isHeader ? COLOR_HEADER_BG : undefined);
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
              color: options.color ?? (isHeader ? COLOR_PRIMARY : COLOR_TEXT),
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
              color: options.color ?? (isHeader ? COLOR_PRIMARY : COLOR_TEXT),
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
    children: [
      new TextRun({
        text: cleanText(fullText),
        bold: true,
        color: COLOR_HEADING,
        size: isH1 ? 24 : 21,
        font: "Calibri",
      }),
    ],
    spacing: { before: isH1 ? 220 : 140, after: 90 },
  });
}

function createGeneratedTableBlocks(artifact: WorkflowArtifact): (Paragraph | Table)[] {
  return (artifact.tables ?? []).flatMap((table) => {
    const width = Math.floor(100 / table.columns.length);
    const rows = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: table.columns.map((column) =>
          createStyledCell(column, { isHeader: true, widthPercent: width }),
        ),
      }),
      ...table.rows.map((row, rowIndex) =>
        new TableRow({
          cantSplit: true,
          children: row.map((cell) =>
            createStyledCell(cell, {
              widthPercent: width,
              fillColor: rowIndex % 2 ? COLOR_ZEBRA_BG : undefined,
            }),
          ),
        }),
      ),
    ];
    const blocks: (Paragraph | Table)[] = [
      createHeading(table.title, HeadingLevel.HEADING_2),
      new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }),
    ];
    if (table.note) blocks.push(createBodyParagraph(table.note, { italic: true, after: 80 }));
    return blocks;
  });
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

type ExamQuestionFormat = "opcion" | "corta" | "relacionar" | "vf" | "desarrollo" | "generica";

type ParsedExamQuestion = {
  format: ExamQuestionFormat;
  label: string;
  prompt: string;
  options: string[];
  leftColumn: string[];
  rightColumn: string[];
};

function parseExamQuestion(rawQuestion: string): ParsedExamQuestion {
  const source = cleanText(rawQuestion);
  const formatMatch = source.match(/^\[([^\]]+)\]\s*/);
  const declared = (formatMatch?.[1] ?? "").toLocaleLowerCase("es");
  const body = source.slice(formatMatch?.[0].length ?? 0).trim();
  const format: ExamQuestionFormat = declared.includes("opción") || declared.includes("opcion")
    ? "opcion"
    : declared.includes("respuesta corta")
      ? "corta"
      : declared.includes("relacionar")
        ? "relacionar"
        : declared.includes("verdadero")
          ? "vf"
          : declared.includes("desarrollo")
            ? "desarrollo"
            : "generica";
  const labels: Record<ExamQuestionFormat, string> = {
    opcion: "OPCIÓN MÚLTIPLE",
    corta: "RESPUESTA CORTA",
    relacionar: "RELACIONAR",
    vf: "VERDADERO / FALSO",
    desarrollo: "DESARROLLO",
    generica: "RESPUESTA",
  };

  const optionMatches = [...body.matchAll(/(?:^|\||\n)\s*([A-D])[.)]\s*([^|\n]+)/gi)];
  const options = optionMatches.map((match) => `${match[1].toUpperCase()}) ${match[2].trim()}`);
  const firstOption = body.search(/(?:^|\||\n)\s*[A-D][.)]\s*/i);
  const relationMatch = body.match(/^(.*?)\s*\|?\s*Columna A:\s*(.*?)\s*\|\s*Columna B:\s*(.*)$/i);
  const splitColumn = (value: string | undefined) => (value ?? "")
    .split(/\s*;\s*/)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    format,
    label: labels[format],
    prompt: relationMatch?.[1]?.trim() || (firstOption >= 0 ? body.slice(0, firstOption).replace(/\|\s*$/, "").trim() : body),
    options,
    leftColumn: splitColumn(relationMatch?.[2]),
    rightColumn: splitColumn(relationMatch?.[3]),
  };
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

function createExamQuestionBlocks(rawQuestion: string, index: number): (Paragraph | Table)[] {
  const question = parseExamQuestion(rawQuestion);
  const blocks: (Paragraph | Table)[] = [
    new Paragraph({
      children: [
        new TextRun({ text: `${index + 1}. `, bold: true, color: COLOR_PRIMARY, size: 21, font: "Calibri" }),
        new TextRun({ text: question.prompt, bold: true, color: COLOR_TEXT, size: 20, font: "Calibri" }),
        new TextRun({ text: `   ${question.label}`, bold: true, color: COLOR_SECONDARY, size: 15, font: "Calibri" }),
      ],
      spacing: { before: 80, after: 80 },
      keepNext: true,
    }),
  ];

  if (question.format === "opcion" && question.options.length) {
    const rows: TableRow[] = [];
    for (let optionIndex = 0; optionIndex < question.options.length; optionIndex += 2) {
      rows.push(new TableRow({
        cantSplit: true,
        children: [
          createStyledCell(`[  ] ${question.options[optionIndex]}`, { widthPercent: 50 }),
          createStyledCell(question.options[optionIndex + 1] ? `[  ] ${question.options[optionIndex + 1]}` : "", { widthPercent: 50 }),
        ],
      }));
    }
    blocks.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
    blocks.push(new Paragraph({ spacing: { after: 100 } }));
    return blocks;
  }

  if (question.format === "vf") {
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

  if (question.format === "relacionar" && question.leftColumn.length && question.rightColumn.length) {
    const rowCount = Math.max(question.leftColumn.length, question.rightColumn.length);
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
          createStyledCell(question.leftColumn[rowIndex] ?? "", { widthPercent: 44 }),
          createStyledCell("____", { widthPercent: 12, alignment: AlignmentType.CENTER }),
          createStyledCell(question.rightColumn[rowIndex] ?? "", { widthPercent: 44 }),
        ],
      })),
    ];
    blocks.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
    blocks.push(new Paragraph({ spacing: { after: 100 } }));
    return blocks;
  }

  blocks.push(...createAnswerLines(question.format === "desarrollo" ? 8 : question.format === "corta" ? 2 : 3));
  return blocks;
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

function extractCommonValues(values: Record<string, unknown> = {}) {
  const missing = "No registrado";
  return {
    year: cleanText(values.school_year) || missing,
    dre: cleanText(values.dre) || missing,
    ugel: cleanText(values.ugel) || missing,
    ie: cleanText(values.institution) || missing,
    level: cleanText(values.level) || missing,
    grade: cleanText(values.grade) || missing,
    section: cleanText(values.section || values.sections) || missing,
    area: cleanText(values.curricular_area || values.curricular_areas || values.area) || missing,
    teacher: cleanText(values.teacher_name) || missing,
    director: cleanText(values.director_name) || missing,
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
  const v = extractCommonValues(context.values);
  const isRubric = (context.workflowKey || "").includes("rubrica");
  const isChecklist = (context.workflowKey || "").includes("lista-cotejo");
  const isStandaloneExam = (context.workflowKey || "").includes("examen");
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
            createStyledCell(`I.E.: ${v.ie}`, { widthPercent: 40 }),
            createStyledCell(`Área: ${v.area}`, { widthPercent: 35 }),
            createStyledCell(`Grado/Secc: ${v.grade} "${v.section}"`, { widthPercent: 25 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell("Apellidos y Nombres: __________________________________________________", {
              colSpan: 2,
              widthPercent: 75,
            }),
            createStyledCell(`Fecha: ____/____/${v.year}`, { widthPercent: 25 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell(`Docente evaluador: ${v.teacher}`, { colSpan: 2, widthPercent: 75 }),
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
            createStyledCell(`${v.area} · ${v.grade} "${v.section}"`, { widthPercent: 65 }),
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
  if ((artifact.tables?.length ?? 0) > 0 && !isStandaloneExam) {
    children.push(createHeading("MATRICES DE APLICACIÓN", HeadingLevel.HEADING_1, "II."));
    children.push(...createGeneratedTableBlocks(artifact));
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
      if (sec.narrative) children.push(createBodyParagraph(sec.narrative));
      if (/preguntas/i.test(sec.title)) {
        sec.key_points.forEach((point, pointIndex) => children.push(...createExamQuestionBlocks(point, pointIndex)));
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
    teacherSections.forEach((sec, idx) => {
      children.push(createHeading(`${idx + 1}. ${sec.title}`, HeadingLevel.HEADING_2));
      if (sec.narrative) children.push(createBodyParagraph(sec.narrative));
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
  } else {
    // Otros instrumentos genéricos
    children.push(createHeading("REACTIVOS Y CONSIGNAS DE EVALUACIÓN", HeadingLevel.HEADING_1, "II."));
    artifact.sections.forEach((sec, idx) => {
      children.push(createHeading(`${idx + 1}. ${sec.title}`, HeadingLevel.HEADING_2));
      if (sec.narrative) children.push(createBodyParagraph(sec.narrative));
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
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: isLandscape ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
              width: isLandscape ? 16838 : 11906,
              height: isLandscape ? 11906 : 16838,
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
                    text: `${v.ie} · Evaluación Formativa CNEB · ${v.year}`,
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
// 2. BUILDER: ACTIVIDADES PRÁCTICAS Y JUEGOS DIDÁCTICOS
// ==========================================================================
export function buildActivityDocx(
  artifact: WorkflowArtifact,
  context: ExportWorkflowDocxOptions
): Document {
  const v = extractCommonValues(context.values);
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
          }),
          createStyledCell(`Grado/Secc: ${v.grade} "${v.section}"`, { widthPercent: 25 }),
        ],
      }),
      new TableRow({
        children: [
          createStyledCell(`I.E.: ${v.ie}`, { widthPercent: 50 }),
          createStyledCell(`Área: ${v.area}`, { widthPercent: 25 }),
          createStyledCell(`Fecha: ____/____/${v.year}`, { widthPercent: 25 }),
        ],
      }),
    ],
  });
  children.push(studentHeader);

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "Instrucciones: ", bold: true, color: COLOR_PRIMARY, size: 20, font: "Calibri" }),
        new TextRun({
          text: cleanText(artifact.executive_summary) || "Lee con atención y completa los retos propuestos aplicando tus saberes.",
          color: COLOR_TEXT,
          size: 20,
          font: "Calibri",
        }),
      ],
      spacing: { before: 140, after: 140 },
    })
  );

  if ((artifact.tables?.length ?? 0) > 0) {
    children.push(createHeading("RUTA DE TRABAJO", HeadingLevel.HEADING_1, "I."));
    children.push(...createGeneratedTableBlocks(artifact));
  }

  // Si es Sopa de Letras
  if (isWordSearch) {
    children.push(createHeading("CUADRÍCULA DE BÚSQUEDA DE PALABRAS", HeadingLevel.HEADING_1, "I."));
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Instrucciones para el estudiante: ",
            bold: true,
            color: COLOR_PRIMARY,
            size: 19,
            font: "Calibri",
          }),
          new TextRun({
            text: "Encuentra las palabras clave en la cuadrícula de letras (pueden estar en sentido horizontal, vertical o diagonal). Enciérralas con colores y escribe una oración breve para cada una en la tabla inferior.",
            size: 19,
            color: COLOR_TEXT,
            font: "Calibri",
          }),
        ],
        spacing: { after: 160 },
      })
    );

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
    children.push(createHeading("TARJETAS DIDÁCTICAS RECORTABLES (FRENTE Y REVERSO)", HeadingLevel.HEADING_1, "I."));
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Instrucciones de recorte y armado: ",
            bold: true,
            color: COLOR_PRIMARY,
            size: 19,
            font: "Calibri",
          }),
          new TextRun({
            text: "Recorta cada tarjeta por la línea punteada (✂). Lee el concepto o pregunta del frente, formula tu respuesta y comprueba con el reverso.",
            size: 19,
            color: COLOR_TEXT,
            font: "Calibri",
          }),
        ],
        spacing: { after: 120 },
      })
    );

    const cardsRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("✂ FRENTE (Anverso / Pregunta o Concepto)", { isHeader: true, widthPercent: 50, alignment: AlignmentType.CENTER }),
          createStyledCell("✂ REVERSO (Dorso / ¿Qué significa? y Pista)", { isHeader: true, widthPercent: 50, alignment: AlignmentType.CENTER }),
        ],
      }),
    ];

    if (artifact.activity && artifact.activity.items && artifact.activity.items.length > 0) {
      artifact.activity.items.forEach((item, idx) => {
        const frontText = `TARJETA N° ${idx + 1}\n\n${item.prompt}`;
        let backText = `¿QUÉ SIGNIFICA?\n${item.answer}`;
        if (item.hint) {
          backText += `\n\n💡 Pista formativa: ${item.hint}`;
        }
        cardsRows.push(
          new TableRow({
            cantSplit: true,
            children: [
              createStyledCell(frontText, {
                bold: true,
                alignment: AlignmentType.CENTER,
                widthPercent: 50,
                fillColor: "F8FAFC",
                fontSize: 22,
              }),
              createStyledCell(backText, {
                widthPercent: 50,
                fillColor: "FFFFFF",
                fontSize: 19,
              }),
            ],
          })
        );
      });
    } else {
      const points = artifact.sections.flatMap((s) => s.key_points);
      for (let i = 0; i < points.length; i += 2) {
        cardsRows.push(
          new TableRow({
            cantSplit: true,
            children: [
              createStyledCell(`✂ TARJETA N° ${i + 1}\n\n${points[i]}`, { widthPercent: 50, bold: true, alignment: AlignmentType.CENTER }),
              createStyledCell(
                points[i + 1] ? `✂ TARJETA N° ${i + 2}\n\n${points[i + 1]}` : "",
                { widthPercent: 50, bold: true, alignment: AlignmentType.CENTER }
              ),
            ],
          })
        );
      }
    }
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: cardsRows }));

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

    const cardItems = (artifact.activity?.items && artifact.activity.items.length > 0)
      ? artifact.activity.items
      : artifact.sections.flatMap((s) => s.key_points).map((p, i) => ({
          id: String(i + 1),
          prompt: `Tarjeta #${i + 1}`,
          answer: p,
          hint: "Profundizar en clase",
          options: [],
        }));

    cardItems.forEach((card, idx) => {
      flashcardsSolutionRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            createStyledCell(String(idx + 1), { widthPercent: 8, alignment: AlignmentType.CENTER, bold: true }),
            createStyledCell(cleanText(card.prompt), { widthPercent: 32, bold: true }),
            createStyledCell(cleanText(card.answer), { widthPercent: 40 }),
            createStyledCell(cleanText(card.hint) || "Verificar comprensión activa.", { widthPercent: 20, italics: true }),
          ],
        })
      );
    });

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: flashcardsSolutionRows }));
  } else if (isHangman) {
    children.push(createHeading("RETOS DE VOCABULARIO Y ADIVINANZAS: JUEGO DEL AHORCADO", HeadingLevel.HEADING_1, "I."));
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Instrucciones para el estudiante: ",
            bold: true,
            color: COLOR_PRIMARY,
            size: 19,
            font: "Calibri",
          }),
          new TextRun({
            text: "Lee con atención la pista o adivinanza de cada reto. Descubre la palabra secreta completando una letra en cada casilla cuadrada. Puedes tachar en el abecedario las letras que vayas probando. Tienes 4 vidas [♥] por palabra antes de equivocarte.",
            size: 19,
            color: COLOR_TEXT,
            font: "Calibri",
          }),
        ],
        spacing: { after: 180 },
      })
    );

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
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Instrucciones para el estudiante: ",
            bold: true,
            color: COLOR_PRIMARY,
            size: 19,
            font: "Calibri",
          }),
          new TextRun({
            text: "Lee con atención cada enunciado. Selecciona la palabra adecuada del Banco de Palabras y escríbela sobre la línea punteada para completar correctamente cada oración.",
            size: 19,
            color: COLOR_TEXT,
            font: "Calibri",
          }),
        ],
        spacing: { after: 140 },
      })
    );

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
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Instrucciones para el estudiante: ",
            bold: true,
            color: COLOR_PRIMARY,
            size: 19,
            font: "Calibri",
          }),
          new TextRun({
            text: "Lee con atención los conceptos de la Columna A y sus definiciones en la Columna B. Relaciona cada concepto escribiendo la letra mayúscula correspondiente dentro de los paréntesis vacíos (   ).",
            size: 19,
            color: COLOR_TEXT,
            font: "Calibri",
          }),
        ],
        spacing: { after: 160 },
      })
    );

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
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Instrucciones para el estudiante: ",
            bold: true,
            color: COLOR_PRIMARY,
            size: 19,
            font: "Calibri",
          }),
          new TextRun({
            text: "Lee atentamente las pistas horizontales y verticales. Escribe una letra en cada casilla blanca según el número correspondiente. Las casillas sombreadas indican separación entre palabras.",
            size: 19,
            color: COLOR_TEXT,
            font: "Calibri",
          }),
        ],
        spacing: { after: 160 },
      })
    );

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
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Instrucciones para el estudiante: ",
            bold: true,
            color: COLOR_PRIMARY,
            size: 19,
            font: "Calibri",
          }),
          new TextRun({
            text: "Observa con atención el Banco de Términos desordenados. Clasifica y escribe cada elemento en la columna correspondiente según el criterio pedagógico indicado.",
            size: 19,
            color: COLOR_TEXT,
            font: "Calibri",
          }),
        ],
        spacing: { after: 140 },
      })
    );

    const rawBank = (artifact.activity?.word_bank && artifact.activity.word_bank.length > 0)
      ? artifact.activity.word_bank
      : (artifact.activity?.items && artifact.activity.items.length > 0)
      ? artifact.activity.items.map((i) => i.answer)
      : [
          "VACA", "LEÓN", "CERDO", "CONEJO", "TIGRE", "OSO",
          "OVEJA", "ÁGUILA", "CHIMPANCÉ", "CABALLO", "TIBURÓN", "GALLINA"
        ];

    const bankRuns: TextRun[] = [
      new TextRun({ text: "★ BANCO DE TÉRMINOS A CLASIFICAR ★\n\n", bold: true, color: "2E7D32", size: 18, font: "Calibri" }),
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
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Instrucciones para el estudiante: ",
            bold: true,
            color: COLOR_PRIMARY,
            size: 19,
            font: "Calibri",
          }),
          new TextRun({
            text: "Lee con atención los bloques desordenados. Analiza la cronología o el procedimiento lógico y escribe el número de orden correspondiente en cada casilla.",
            size: 19,
            color: COLOR_TEXT,
            font: "Calibri",
          }),
        ],
        spacing: { after: 140 },
      })
    );

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
    children.push(createHeading("GUÍA Y ESTRUCTURA DE DINÁMICA DE DEBATE EN EL AULA", HeadingLevel.HEADING_1, "I."));
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Moción o Tesis Central: ",
            bold: true,
            color: COLOR_PRIMARY,
            size: 20,
            font: "Calibri",
          }),
          new TextRun({
            text: artifact.document_title || "¿Se debe regular estrictamente el uso de dispositivos móviles en el entorno escolar?",
            size: 20,
            bold: true,
            color: COLOR_TEXT,
            font: "Calibri",
          }),
        ],
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Instrucciones generales y acuerdos de convivencia: ",
            bold: true,
            color: COLOR_PRIMARY,
            size: 19,
            font: "Calibri",
          }),
          new TextRun({
            text: "El debate es un ejercicio de argumentación rigurosa, escucha activa y respeto democrático. Cada equipo defenderá su postura basándose en evidencias, datos contrastables y razonamientos lógicos, sin descalificaciones personales.",
            size: 19,
            color: COLOR_TEXT,
            font: "Calibri",
          }),
        ],
        spacing: { after: 140 },
      })
    );

    // Tabla 1: Estructura de Fases y Tiempos del Debate
    children.push(createHeading("ESTRUCTURA DE FASES Y TIEMPOS DEL DEBATE", HeadingLevel.HEADING_2));
    const phaseRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("Fase del Debate", { isHeader: true, widthPercent: 25 }),
          createStyledCell("Tiempo", { isHeader: true, widthPercent: 15, alignment: AlignmentType.CENTER }),
          createStyledCell("Rol Participante", { isHeader: true, widthPercent: 25 }),
          createStyledCell("Objetivo Pedagógico CNEB", { isHeader: true, widthPercent: 35 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("1. Apertura e Introducción", { bold: true, widthPercent: 25 }),
          createStyledCell("3 min por equipo", { widthPercent: 15, alignment: AlignmentType.CENTER }),
          createStyledCell("Primer Orador (A favor y En contra)", { widthPercent: 25 }),
          createStyledCell("Presentar la tesis del equipo y el marco contextual de su postura.", { widthPercent: 35 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("2. Argumentación Principal", { bold: true, widthPercent: 25 }),
          createStyledCell("4 min por equipo", { widthPercent: 15, alignment: AlignmentType.CENTER }),
          createStyledCell("Segundo Orador (Evidencias)", { widthPercent: 25 }),
          createStyledCell("Sustentar argumentos con estudios, estadísticas, leyes y ejemplos reales.", { widthPercent: 35 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("3. Refutación y Preguntas", { bold: true, widthPercent: 25 }),
          createStyledCell("5 min cruzados", { widthPercent: 15, alignment: AlignmentType.CENTER }),
          createStyledCell("Tercer Orador / Preguntas Cruzadas", { widthPercent: 25 }),
          createStyledCell("Detectar falacias, contraargumentar y responder cuestionamientos.", { widthPercent: 35 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("4. Conclusiones y Cierre", { bold: true, widthPercent: 25 }),
          createStyledCell("2 min por equipo", { widthPercent: 15, alignment: AlignmentType.CENTER }),
          createStyledCell("Orador de Cierre", { widthPercent: 25 }),
          createStyledCell("Sintetizar puntos fuertes del equipo y brindar mensaje final reflexivo.", { widthPercent: 35 }),
        ],
      }),
    ];
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: phaseRows }), new Paragraph({ spacing: { after: 140 } }));

    // Tabla 2: Posturas Contrapuestas y Banco de Argumentos
    children.push(createHeading("MATRIZ DE POSTURAS CONTRAPUESTAS Y ARGUMENTOS", HeadingLevel.HEADING_2));
    const argRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("EQUIPO A: A FAVOR (Regulación / Restricción)", { isHeader: true, widthPercent: 50, alignment: AlignmentType.CENTER }),
          createStyledCell("EQUIPO B: EN CONTRA (Integración Digital Activa)", { isHeader: true, widthPercent: 50, alignment: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell(
            "• Concentración y atención sostenida: Reduce interrupciones y distracciones constantes en horas de clase.\n\n" +
            "• Salud mental y convivencia: Disminuye la incidencia de ciberacoso y fomenta la interacción social directa entre pares.\n\n" +
            "• Equidad en el aula: Evita brechas visibles entre estudiantes con dispositivos de distinta gama o conectividad.\n\n" +
            "• Desarrollo de pensamiento profundo: Estimula la lectura analítica y la escritura reflexiva sin atajos digitales inmediatos.",
            { widthPercent: 50 }
          ),
          createStyledCell(
            "• Competencia Digital CNEB (Comp. 28): Prepara a los estudiantes para desenvolverse éticamente en entornos virtuales.\n\n" +
            "• Acceso inmediato a la información: Permite corroborar fuentes, explorar simuladores y consultar bases de datos educativas en tiempo real.\n\n" +
            "• Alfabetización crítica de medios: Enseña a discernir noticias falsas y gestionar el autocontrol bajo guía docente en lugar de prohibir.\n\n" +
            "• Herramienta pedagógica versátil: Facilita evaluaciones formativas interactivas, encuestas de aula y portafolios digitales.",
            { widthPercent: 50 }
          ),
        ],
      }),
    ];
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: argRows }), new Paragraph({ spacing: { after: 140 } }));

    // Tabla 3: Ficha de Registro y Toma de Notas del Jurado/Estudiante
    children.push(createHeading("FICHA DE OBSERVACIÓN Y REGISTRO DEL ESTUDIANTE / JURADO", HeadingLevel.HEADING_2));
    const noteRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("Criterio Evaluado", { isHeader: true, widthPercent: 25 }),
          createStyledCell("Equipo A Favor (Anotaciones / Puntaje 1-4)", { isHeader: true, widthPercent: 37 }),
          createStyledCell("Equipo En Contra (Anotaciones / Puntaje 1-4)", { isHeader: true, widthPercent: 38 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("Solidez y coherencia de los argumentos", { bold: true, widthPercent: 25 }),
          createStyledCell("Notas: ________________________________\nPuntaje: [   ]", { widthPercent: 37 }),
          createStyledCell("Notas: ________________________________\nPuntaje: [   ]", { widthPercent: 38 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("Uso de datos, evidencias y ejemplos", { bold: true, widthPercent: 25 }),
          createStyledCell("Notas: ________________________________\nPuntaje: [   ]", { widthPercent: 37 }),
          createStyledCell("Notas: ________________________________\nPuntaje: [   ]", { widthPercent: 38 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("Claridad de expresión, tono y respeto", { bold: true, widthPercent: 25 }),
          createStyledCell("Notas: ________________________________\nPuntaje: [   ]", { widthPercent: 37 }),
          createStyledCell("Notas: ________________________________\nPuntaje: [   ]", { widthPercent: 38 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("Capacidad de refutación de ideas contrarias", { bold: true, widthPercent: 25 }),
          createStyledCell("Notas: ________________________________\nPuntaje: [   ]", { widthPercent: 37 }),
          createStyledCell("Notas: ________________________________\nPuntaje: [   ]", { widthPercent: 38 }),
        ],
      }),
    ];
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: noteRows }));

    // Solucionario y Rúbrica en nueva página
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
      createHeading("RÚBRICA DE EVALUACIÓN Y PAUTA DOCENTE: DEBATE EN EL AULA", HeadingLevel.HEADING_1, "II."),
      new Paragraph({
        children: [
          new TextRun({
            text: "(USO EXCLUSIVO DEL DOCENTE - EVALUACIÓN FORMATIVA CNEB)",
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

    const rubricRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("Criterio CNEB", { isHeader: true, widthPercent: 20 }),
          createStyledCell("AD - Destacado", { isHeader: true, widthPercent: 20, alignment: AlignmentType.CENTER }),
          createStyledCell("A - Esperado", { isHeader: true, widthPercent: 20, alignment: AlignmentType.CENTER }),
          createStyledCell("B - En Proceso", { isHeader: true, widthPercent: 20, alignment: AlignmentType.CENTER }),
          createStyledCell("C - En Inicio", { isHeader: true, widthPercent: 20, alignment: AlignmentType.CENTER }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("Argumentación y Sustento Ético", { bold: true, widthPercent: 20 }),
          createStyledCell("Argumenta con profundidad, citando múltiples fuentes y relacionando ética con bienestar social.", { widthPercent: 20 }),
          createStyledCell("Sustenta sus posturas con argumentos lógicos y fuentes verídicas adecuadas al tema.", { widthPercent: 20 }),
          createStyledCell("Presenta argumentos con escasas evidencias o basados en opiniones generales.", { widthPercent: 20 }),
          createStyledCell("Expone afirmaciones sin justificación ni evidencia comprobable.", { widthPercent: 20 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("Contraargumentación y Escucha", { bold: true, widthPercent: 20 }),
          createStyledCell("Refuta con agudeza lógica argumentos contrarios, respondiendo con datos y cortesía intachable.", { widthPercent: 20 }),
          createStyledCell("Contraargumenta respondiendo directamente a las objeciones del equipo oponente.", { widthPercent: 20 }),
          createStyledCell("Intenta refutar pero desvía el foco de la discusión o reitera su postura inicial.", { widthPercent: 20 }),
          createStyledCell("No responde a las objeciones o interrumpe sin escuchar a los demás.", { widthPercent: 20 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("Competencia Comunicativa Oral", { bold: true, widthPercent: 20 }),
          createStyledCell("Uso sobresaliente de recursos no verbales, modulación vocal y manejo impecable del tiempo.", { widthPercent: 20 }),
          createStyledCell("Vocalización clara, lenguaje formal y empleo correcto del tiempo asignado.", { widthPercent: 20 }),
          createStyledCell("Tono monótono o vacilante, con ligeros excesos o faltas en el uso del tiempo.", { widthPercent: 20 }),
          createStyledCell("Dificultad notoria para expresarse oralmente o abandono antes del tiempo.", { widthPercent: 20 }),
        ],
      }),
    ];
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: rubricRows }));
  } else if (isCaseStudy) {
    children.push(createHeading("ESTUDIO DE CASO ABP: INVESTIGACIÓN Y RESOLUCIÓN DE PROBLEMAS", HeadingLevel.HEADING_1, "I."));
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "Título del Caso: ",
            bold: true,
            color: COLOR_PRIMARY,
            size: 20,
            font: "Calibri",
          }),
          new TextRun({
            text: artifact.document_title || "Dilema de la Gestión del Agua y Desarrollo Sostenible",
            bold: true,
            size: 20,
            color: COLOR_TEXT,
            font: "Calibri",
          }),
        ],
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: "Situación Problemática Real: ",
            bold: true,
            color: COLOR_PRIMARY,
            size: 19,
            font: "Calibri",
          }),
          new TextRun({
            text: artifact.executive_summary || "En una cuenca agrícola costera, la escasez hídrica estacional genera tensiones entre la pequeña agricultura comunal, las empresas agroexportadoras de riego presurizado y la demanda de agua potable de los centros urbanos en crecimiento.",
            size: 19,
            color: COLOR_TEXT,
            font: "Calibri",
          }),
        ],
        spacing: { after: 140 },
      })
    );

    // Tabla 1: Matriz de Actores y Posiciones en Conflicto
    children.push(createHeading("MATRIZ DE ACTORES Y POSICIONES EN CONFLICTO", HeadingLevel.HEADING_2));
    const actorRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("Actor Social / Institución", { isHeader: true, widthPercent: 25 }),
          createStyledCell("Interés y Postura Principal", { isHeader: true, widthPercent: 25 }),
          createStyledCell("Sustento Legal y Económico", { isHeader: true, widthPercent: 25 }),
          createStyledCell("Propuesta de Solución", { isHeader: true, widthPercent: 25 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("Comunidad de Pequeños Agricultores", { bold: true, widthPercent: 25 }),
          createStyledCell("Defensa de derechos de agua tradicionales para cultivos de panllevar y seguridad alimentaria.", { widthPercent: 25 }),
          createStyledCell("Uso consuetudinario ancestral y soberanía alimentaria familiar local.", { widthPercent: 25 }),
          createStyledCell("Respetar turnos tradicionales y subsidio estatal para revestimiento de canales.", { widthPercent: 25 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("Asociación de Agroexportadores", { bold: true, widthPercent: 25 }),
          createStyledCell("Garantizar volumen hídrico constante para plantaciones de alta productividad y contratos externos.", { widthPercent: 25 }),
          createStyledCell("Generación de empleo formal, divisas para el país e inversión en riego por goteo.", { widthPercent: 25 }),
          createStyledCell("Construcción de pozos tubulares profundos y ampliación de reservorios privados.", { widthPercent: 25 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("Población Urbana y Municipio", { bold: true, widthPercent: 25 }),
          createStyledCell("Acceso ininterrumpido a agua potable de calidad para consumo humano diario.", { widthPercent: 25 }),
          createStyledCell("Artículo 7-A de la Constitución Política: Derecho fundamental irrenunciable al agua.", { widthPercent: 25 }),
          createStyledCell("Prioridad absoluta de la red pública sobre cualquier actividad extractiva o agrícola.", { widthPercent: 25 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("Autoridad Nacional del Agua (ANA)", { bold: true, widthPercent: 25 }),
          createStyledCell("Equilibrio hídrico de la cuenca y preservación del caudal ecológico mínimo.", { widthPercent: 25 }),
          createStyledCell("Ley de Recursos Hídricos N° 29338: el agua es patrimonio de la Nación.", { widthPercent: 25 }),
          createStyledCell("Comité de gestión de cuenca con monitoreo digital y medición obligatoria de consumos.", { widthPercent: 25 }),
        ],
      }),
    ];
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: actorRows }), new Paragraph({ spacing: { after: 140 } }));

    // Tabla 2: Preguntas Guía de Análisis ABP para el Equipo
    children.push(createHeading("PREGUNTAS GUÍA DE ANÁLISIS CRÍTICO Y PROPUESTA ABP", HeadingLevel.HEADING_2));
    const questionRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("N°", { isHeader: true, widthPercent: 8, alignment: AlignmentType.CENTER }),
          createStyledCell("Desafío Cognitivo / Pregunta Investigativa", { isHeader: true, widthPercent: 42 }),
          createStyledCell("Análisis Crítico y Propuesta del Equipo Estudiantil", { isHeader: true, widthPercent: 50 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("1", { bold: true, widthPercent: 8, alignment: AlignmentType.CENTER }),
          createStyledCell("¿Cuál es la raíz multidimensional del conflicto? Identifica causas económicas, ambientales y políticas.", { bold: true, widthPercent: 42 }),
          createStyledCell("Líneas de análisis y evidencia:\n____________________________________________________\n____________________________________________________\n____________________________________________________", { widthPercent: 50 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("2", { bold: true, widthPercent: 8, alignment: AlignmentType.CENTER }),
          createStyledCell("¿Cómo se jerarquiza el uso del agua según la legislación peruana frente a las demandas del mercado?", { bold: true, widthPercent: 42 }),
          createStyledCell("Líneas de análisis y evidencia:\n____________________________________________________\n____________________________________________________\n____________________________________________________", { widthPercent: 50 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("3", { bold: true, widthPercent: 8, alignment: AlignmentType.CENTER }),
          createStyledCell("Diseña una propuesta de solución concertada que equilibre productividad, justicia social y conservación ecológica.", { bold: true, widthPercent: 42 }),
          createStyledCell("Líneas de análisis y evidencia:\n____________________________________________________\n____________________________________________________\n____________________________________________________", { widthPercent: 50 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("4", { bold: true, widthPercent: 8, alignment: AlignmentType.CENTER }),
          createStyledCell("¿Qué compromisos éticos debe asumir cada actor social para garantizar la sostenibilidad a 10 años?", { bold: true, widthPercent: 42 }),
          createStyledCell("Líneas de análisis y evidencia:\n____________________________________________________\n____________________________________________________\n____________________________________________________", { widthPercent: 50 }),
        ],
      }),
    ];
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: questionRows }));

    // Solucionario y Rúbrica ABP en nueva página
    children.push(
      new Paragraph({
        children: [new PageBreak()],
      }),
      createHeading("GUÍA METODOLÓGICA Y CRITERIOS DE EVALUACIÓN ABP", HeadingLevel.HEADING_1, "II."),
      new Paragraph({
        children: [
          new TextRun({
            text: "(PAUTA DOCENTE - EVALUACIÓN DE COMPETENCIAS CIUDADANAS Y ECONÓMICAS)",
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

    const guideRows: TableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createStyledCell("Criterio de Evaluación ABP", { isHeader: true, widthPercent: 25 }),
          createStyledCell("Nivel Esperado / Evidencia de Aprendizaje", { isHeader: true, widthPercent: 40 }),
          createStyledCell("Intervención Docente / Retroalimentación", { isHeader: true, widthPercent: 35 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("Comprensión Multicausal", { bold: true, widthPercent: 25 }),
          createStyledCell("Distingue con claridad entre la sequía climática natural y las presiones antrópicas derivadas del crecimiento agroexportador y urbano.", { widthPercent: 40 }),
          createStyledCell("Formular repreguntas sobre externalidades ambientales y agotamiento del acuífero.", { widthPercent: 35 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("Ponderación Ética y Legal", { bold: true, widthPercent: 25 }),
          createStyledCell("Aplica el orden de prioridad de la Ley N° 29338 (1° Primario/Poblacional, 2° Agrícola/Ecológico, 3° Productivo/Industrial).", { widthPercent: 40 }),
          createStyledCell("Verificar que la solución del equipo no vulnere el acceso básico de las poblaciones vulnerables.", { widthPercent: 35 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createStyledCell("Viabilidad de la Propuesta", { bold: true, widthPercent: 25 }),
          createStyledCell("Propone acuerdos concretos: tecnificación de riego comunal financiada con obras por impuestos y junta de cuenca paritaria.", { widthPercent: 40 }),
          createStyledCell("Evaluar si los costos, plazos y mecanismos de fiscalización propuestos son factibles en la realidad.", { widthPercent: 35 }),
        ],
      }),
    ];
    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: guideRows }));
  } else {
    // Retos y actividades estándar
    artifact.sections.forEach((sec, idx) => {
      children.push(createHeading(`${idx + 1}. ${sec.title}`, HeadingLevel.HEADING_1));
      if (sec.narrative) children.push(createBodyParagraph(sec.narrative));
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
    sections: [
      {
        properties: {
          page: {
            size: {
              orientation: isWordSearch || isCrossword ? PageOrientation.LANDSCAPE : PageOrientation.PORTRAIT,
              width: 11906,
              height: 16838,
            },
            margin: isWordSearch || isCrossword
              ? { top: 720, bottom: 720, left: 1080, right: 1080 }
              : { top: 1440, bottom: 1440, left: 1440, right: 1440 },
          },
        },
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
  const v = extractCommonValues(context.values);
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
          createStyledCell(`${v.grade} "${v.section}" · ${v.area}`, { widthPercent: 65 }),
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

  artifact.sections.forEach((sec, idx) => {
    const riskLabel = idx === 0 ? "Crítico (Alerta)" : idx === 1 ? "En Proceso" : "Monitoreo";
    const riskFill = idx === 0 ? "FEE2E2" : idx === 1 ? "FEF3C7" : "DCFCE7";
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

  // IV. Plan de acción y firmas
  children.push(createHeading("PLAN DE ACCIÓN Y COMPROMISOS INSTITUCIONALES", HeadingLevel.HEADING_1, "IV."));
  artifact.teacher_recommendations.forEach((rec) => {
    children.push(
      new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun({ text: cleanText(rec), size: 19, font: "Calibri", color: COLOR_TEXT })],
        spacing: { after: 60 },
      })
    );
  });

  children.push(createSignaturesTable(v.teacher, "Docente Responsable del Análisis", v.director, "Dirección / Coordinación Pedagógica"));

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT, width: 11906, height: 16838 },
            margin: { top: 900, bottom: 900, left: 1080, right: 1080 },
          },
        },
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
  const v = extractCommonValues(context.values);
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
          text: `COMUNICADO OFICIAL A LA FAMILIA · CICLO ESCOLAR ${v.year}`,
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
          createStyledCell(`Para: ${v.guardian} (Padre, madre o tutor legal)`, { widthPercent: 60 }),
          createStyledCell(`Fecha: ${new Date().toLocaleDateString("es-PE")}`, { widthPercent: 40 }),
        ],
      }),
      new TableRow({
        children: [
          createStyledCell(`Estudiante: ${v.student} · ${v.grade} "${v.section}"`, { widthPercent: 60 }),
          createStyledCell(`Asunto: ${cleanText(artifact.document_title)}`, { bold: true, widthPercent: 40 }),
        ],
      }),
    ],
  });
  children.push(commTable);

  children.push(
    createBodyParagraph(`Estimada familia ${v.guardian}:`, { bold: true }),
    createBodyParagraph(
      `Reciban un cordial saludo institucional de parte del equipo directivo y docente de la I.E. "${v.ie}". Por medio de la presente nos dirigimos a ustedes para informarles lo siguiente:`
    ),
    createBodyParagraph(artifact.executive_summary, { bold: true })
  );

  artifact.sections.forEach((sec) => {
    children.push(createHeading(sec.title, HeadingLevel.HEADING_2));
    if (sec.narrative) children.push(createBodyParagraph(sec.narrative));
    sec.key_points.forEach((point) => {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: cleanText(point), size: 19, font: "Calibri", color: COLOR_TEXT })],
          spacing: { after: 40 },
        })
      );
    });
  });

  children.push(
    createBodyParagraph(
      "Agradecemos de antemano su constante compromiso con la formación integral de su menor hijo(a)."
    ),
    createBodyParagraph("Atentamente,")
  );

  children.push(createSignaturesTable(v.teacher, "Docente Tutor(a)", v.director, "Dirección General"));

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
          text: `Yo, ____________________________________________________, identificado con DNI N.° __________________, padre/madre/tutor de ${v.student} del ${v.grade} "${v.section}", confirmo haber recibido y tomado conocimiento de la comunicación "${cleanText(artifact.document_title)}".\n\nFirma del Padre / Apoderado: __________________________________        Teléfono: ___________________`,
          size: 17,
          font: "Calibri",
          color: COLOR_TEXT,
        }),
      ],
      spacing: { after: 100 },
    })
  );

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT, width: 11906, height: 16838 },
            margin: { top: 900, bottom: 900, left: 1080, right: 1080 },
          },
        },
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
  const v = extractCommonValues(context.values);
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
            createStyledCell(`Grado y sección: ${v.grade} — ${v.section}`, { widthPercent: 40 }),
          ],
        }),
        new TableRow({
          children: [
            createStyledCell(`I.E.: ${v.ie}`, { widthPercent: 60 }),
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
              text: `${v.ie} · ${v.area} · ${v.year}`,
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
export function buildDocumentDocx(
  artifact: WorkflowArtifact,
  context: ExportWorkflowDocxOptions
): Document {
  const v = extractCommonValues(context.values);
  const isSession = (context.workflowKey || "").includes("sesion");
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
          text: `ÁREA: ${v.area.toUpperCase()} · NIVEL: ${v.level.toUpperCase()} · GRADO: ${v.grade.toUpperCase()} "${v.section}"`,
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
    ["NIVEL / GRADO / SECCIÓN", `${v.level} / ${v.grade} "${v.section}"`],
    ["ÁREA CURRICULAR", v.area],
    ["DOCENTE RESPONSABLE", v.teacher],
    ["DIRECTOR(A)", v.director],
    ["AÑO LECTIVO", v.year],
  ];

  const infoTableRows: TableRow[] = infoRows.map(
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

  // Si es Sesión de Aprendizaje: Tabla de los 3 Momentos Didácticos
  if ((artifact.tables?.length ?? 0) > 0) {
    children.push(createHeading("MATRICES DE PLANIFICACIÓN", HeadingLevel.HEADING_1, "III."));
    children.push(...createGeneratedTableBlocks(artifact));
  } else if (isSession) {
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
  }

  // Secciones desarrolladas
  const sectionStartNum = isSession || (artifact.tables?.length ?? 0) > 0 ? 4 : 3;
  artifact.sections.forEach((sec, idx) => {
    children.push(createHeading(sec.title, HeadingLevel.HEADING_1, `${sectionStartNum + idx}.`));
    if (sec.narrative) children.push(createBodyParagraph(sec.narrative));
    if (sec.key_points.length > 0) {
      sec.key_points.forEach((p) => {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: cleanText(p), size: 19, font: "Calibri", color: COLOR_TEXT })],
            spacing: { after: 40 },
          })
        );
      });
    }
  });

  // Orientaciones docentes
  if (artifact.teacher_recommendations.length > 0) {
    children.push(createHeading("ORIENTACIONES PARA LA REVISIÓN DOCENTE", HeadingLevel.HEADING_1));
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
        v.teacher,
        `Docente Responsable de ${v.area}`,
        v.director,
        "Director(a) / Equipo Directivo"
      )
    );
  }

  return new Document({
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
                    text: `${v.ie} · Planificación Curricular CNEB · ${v.year}`,
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
    key.includes("respuesta-correo") ||
    key.includes("informe-padres")
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

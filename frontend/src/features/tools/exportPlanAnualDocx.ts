import {
  AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel, Packer, PageBreak,
  PageNumber, PageOrientation, Paragraph, ShadingType, Table, TableCell, TableOfContents, TableRow, TextRun, WidthType,
} from "docx";

import { isPlaceholder, splitLabel, splitNarrative, stripNumbering } from "./documentFormat";
import type { WorkflowArtifact, WorkflowArtifactTable } from "./exportWorkflowDocx";

export type ExportPlanAnualContext = {
  workflowKey?: string;
  values?: Record<string, unknown>;
  toolTitle?: string;
  [key: string]: unknown;
};

const TEXT = "1F2937";
const PRIMARY = "1F4D78";
const SECONDARY = "2E74B5";
const MUTED = "475569";
const BORDER = "BDD7EE";
const HEADER = "BDD7EE";
const ZEBRA = "F8FAFC";

function safeFileName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim().replace(/\s+/g, "-").toLowerCase() || "plan-curricular-anual";
}

function cleanText(input: unknown): string {
  if (input === null || input === undefined) return "";
  const text = Array.isArray(input) ? input.join(", ") : String(input);
  return text.replace(/\*+/g, "").replace(/^#{1,6}\s*/gm, "").trim();
}

function value(values: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const candidate = cleanText(values[key]);
    if (candidate) return candidate;
  }
  return "";
}

function borders() {
  const edge = { style: BorderStyle.SINGLE, size: 4, color: BORDER };
  return { top: edge, bottom: edge, left: edge, right: edge };
}

function paragraph(text: string, options: { bold?: boolean; center?: boolean; size?: number } = {}) {
  return new Paragraph({
    alignment: options.center ? AlignmentType.CENTER : AlignmentType.LEFT,
    children: [new TextRun({ text: cleanText(text), bold: options.bold, color: TEXT, size: options.size ?? 19, font: "Calibri" })],
    spacing: { after: 70, line: 250 },
  });
}

function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel]) {
  const isTop = level === HeadingLevel.HEADING_1;
  return new Paragraph({
    heading: level,
    keepNext: true,
    children: [new TextRun({ text: isTop ? cleanText(text).toLocaleUpperCase("es") : cleanText(text), bold: true, color: isTop ? PRIMARY : SECONDARY, size: isTop ? 24 : 21, font: "Calibri" })],
    border: isTop ? { bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER, space: 2 } } : undefined,
    spacing: { before: isTop ? 220 : 150, after: 80 },
  });
}

function bodyParagraphs(text: string): Paragraph[] {
  return splitNarrative(text).map((block) => {
    if (block.bullet) return keyPoint(block.text);
    return new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      children: [new TextRun({ text: block.text, color: TEXT, size: 19, font: "Calibri" })],
      spacing: { after: 70, line: 250 },
    });
  });
}

function keyPoint(text: string): Paragraph {
  const { label, body } = splitLabel(cleanText(text));
  const runs = label
    ? [new TextRun({ text: `${label}: `, bold: true, color: PRIMARY, size: 18, font: "Calibri" }), new TextRun({ text: body, color: TEXT, size: 18, font: "Calibri" })]
    : [new TextRun({ text: cleanText(text), color: TEXT, size: 18, font: "Calibri" })];
  return new Paragraph({ bullet: { level: 0 }, children: runs, spacing: { after: 45 } });
}

/** Portada institucional del PCA: título, datos clave y responsables. */
function coverPage(artifact: WorkflowArtifact, values: Record<string, unknown>): Array<Paragraph | Table> {
  const line = (text: string, size = 22, bold = false, color = TEXT) => new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text, bold, color, size, font: "Calibri" })],
    spacing: { after: 120 },
  });
  const rows: Array<[string, string]> = [
    ["Institución educativa", value(values, "institution")],
    ["DRE / UGEL", [value(values, "dre"), value(values, "ugel")].filter(Boolean).join(" / ")],
    ["Nivel y grado", [value(values, "level"), value(values, "grade")].filter(Boolean).join(" · ")],
    ["Áreas curriculares", value(values, "curricular_areas", "curricular_area")],
    ["Docente responsable", value(values, "teacher_name")],
    ["Director(a)", value(values, "director_name")],
    ["Año lectivo", value(values, "school_year")],
  ].filter(([, content]) => !isPlaceholder(content)) as Array<[string, string]>;
  return [
    new Paragraph({ spacing: { before: 1800 }, children: [] }),
    line(value(values, "institution") || "Institución educativa", 24, true, PRIMARY),
    line("PLAN CURRICULAR ANUAL", 40, true, PRIMARY),
    line(cleanText(artifact.document_title), 26, true),
    new Paragraph({ spacing: { before: 400 }, children: [] }),
    dataTable(rows),
    new Paragraph({ spacing: { before: 600 }, children: [] }),
    line(`Año lectivo ${value(values, "school_year") || "________"}`, 22, true, SECONDARY),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function cell(text: string, header = false, zebra = false) {
  return new TableCell({
    borders: borders(),
    margins: { top: 80, bottom: 80, left: 90, right: 90 },
    shading: header || zebra ? { fill: header ? HEADER : ZEBRA, type: ShadingType.CLEAR } : undefined,
    children: [new Paragraph({
      alignment: header ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text: cleanText(text), bold: header, color: TEXT, size: header ? 17 : 16, font: "Calibri" })],
      spacing: { before: 15, after: 15 },
    })],
  });
}

function dataTable(rows: Array<[string, string]>) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(([label, content], index) => new TableRow({
      cantSplit: true,
      children: [cell(label, true), cell(content, false, index % 2 === 1)],
    })),
  });
}

function artifactTable(table: WorkflowArtifactTable) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, cantSplit: true, children: table.columns.map((column) => cell(column, true)) }),
      ...table.rows.map((row, index) => new TableRow({
        cantSplit: true,
        children: table.columns.map((_, cellIndex) => cell(row[cellIndex] || "________", false, index % 2 === 1)),
      })),
    ],
  });
}

export async function buildPlanAnualDocxDocument(
  artifact: WorkflowArtifact,
  context: ExportPlanAnualContext = {},
): Promise<Document> {
  const values = context.values ?? {};
  const year = value(values, "school_year");
  const institution = value(values, "institution");
  const area = value(values, "curricular_areas", "curricular_area");
  const tables = artifact.tables ?? [];
  const information: Array<[string, string]> = ([
    ["DRE", value(values, "dre")], ["UGEL", value(values, "ugel")], ["Institución educativa", institution],
    ["Modelo de servicio educativo", value(values, "service_model")], ["Modalidad", value(values, "modality")],
    ["Nivel académico", value(values, "level")], ["Planificación por", value(values, "planning_scope")],
    ["Grado o ciclo", value(values, "grade")], ["Secciones", value(values, "sections", "section")],
    ["Periodo de ejecución", value(values, "execution_period")], ["Año lectivo", year], ["Áreas curriculares", area],
    ["Docente responsable", value(values, "teacher_name")], ["Director(a)", value(values, "director_name")],
    ["Subdirector(a)", value(values, "subdirector_name")], ["Enfoque pedagógico", value(values, "pedagogical_approach")],
    ["Tono de redacción", value(values, "writing_tone")], ["Enfoque de evaluación", value(values, "assessment_approach")],
  ] as Array<[string, string]>).filter(([, content]) => !isPlaceholder(content));
  const signers: Array<[string, string]> = [
    [value(values, "teacher_name"), "Docente responsable"],
    [value(values, "director_name"), "Director(a)"],
  ].filter(([name]) => !isPlaceholder(name)) as Array<[string, string]>;
  // Índice precargado: se ve en cualquier visor y Word lo completa con las páginas al actualizar campos.
  const indexEntries = [
    { title: "I. DATOS INFORMATIVOS", level: 1 },
    { title: "II. SÍNTESIS DE LA PLANIFICACIÓN", level: 1 },
    ...artifact.sections.map((section, index) => ({ title: `${index + 1}. ${stripNumbering(cleanText(section.title))}`, level: 2 })),
    { title: "III. MATRICES ANUALES", level: 1 },
    ...tables.map((table, index) => ({ title: `${index + 1}. ${stripNumbering(cleanText(table.title))}`, level: 2 })),
    { title: "IV. RECOMENDACIONES PARA LA IMPLEMENTACIÓN", level: 1 },
    ...(signers.length ? [{ title: "V. VALIDACIÓN", level: 1 }] : []),
  ];
  const children: Array<Paragraph | Table> = [
    ...coverPage(artifact, values),
    heading("Contenido", HeadingLevel.HEADING_1),
    new TableOfContents("Contenido", { hyperlink: true, headingStyleRange: "1-2", cachedEntries: indexEntries }),
    new Paragraph({ children: [new PageBreak()] }),
    heading("I. DATOS INFORMATIVOS", HeadingLevel.HEADING_1),
    dataTable(information.length ? information : [["Institución educativa", "________________"], ["Docente responsable", "________________"], ["Año lectivo", "________"]]),
    heading("II. SÍNTESIS DE LA PLANIFICACIÓN", HeadingLevel.HEADING_1),
    ...bodyParagraphs(artifact.executive_summary),
  ];

  artifact.sections.forEach((section, index) => {
    children.push(heading(`${index + 1}. ${stripNumbering(section.title)}`, HeadingLevel.HEADING_2));
    children.push(...bodyParagraphs(section.narrative));
    section.key_points.forEach((point) => children.push(keyPoint(point)));
  });

  children.push(heading("III. MATRICES ANUALES", HeadingLevel.HEADING_1));
  if (!tables.length) {
    children.push(paragraph("Las matrices deben regenerarse antes de descargar la versión final."));
  } else {
    tables.forEach((table, index) => {
      children.push(heading(`${index + 1}. ${stripNumbering(table.title)}`, HeadingLevel.HEADING_2));
      children.push(artifactTable(table));
      if (table.note) children.push(paragraph(table.note));
      children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
    });
  }

  children.push(heading("IV. RECOMENDACIONES PARA LA IMPLEMENTACIÓN", HeadingLevel.HEADING_1));
  artifact.teacher_recommendations.forEach((recommendation) => children.push(new Paragraph({
    numbering: { reference: "recommendations", level: 0 },
    children: [new TextRun({ text: cleanText(recommendation), color: TEXT, size: 19, font: "Calibri" })],
    spacing: { after: 55 },
  })));

  if (signers.length) {
    children.push(new Paragraph({
      children: [new TextRun({ text: "V. VALIDACIÓN", bold: true, color: TEXT, size: 23, font: "Calibri" })],
      spacing: { before: 160, after: 70 },
    }));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({
        cantSplit: true,
        children: signers.map(([name, role]) => new TableCell({
          borders: borders(),
          margins: { top: 70, bottom: 70, left: 90, right: 90 },
          shading: { fill: ZEBRA, type: ShadingType.CLEAR },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `${role}: ${name}\n`, bold: true, color: TEXT, size: 17, font: "Calibri" }),
              new TextRun({ text: "Firma: ______________________________", color: TEXT, size: 16, font: "Calibri" }),
            ],
            spacing: { before: 10, after: 10 },
          })],
        })),
      })],
    }));
  }

  return new Document({
    features: { updateFields: true },
    numbering: { config: [{ reference: "recommendations", levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.LEFT }] }] },
    styles: {
      default: { document: { run: { font: "Calibri", size: 19, color: TEXT } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 24, bold: true, color: PRIMARY }, paragraph: { spacing: { before: 220, after: 80 }, keepNext: true, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Calibri", size: 21, bold: true, color: SECONDARY }, paragraph: { spacing: { before: 150, after: 80 }, keepNext: true, outlineLevel: 1 } },
        { id: "TOC1", name: "toc 1", basedOn: "Normal", next: "Normal", run: { font: "Calibri", size: 20, bold: true, color: PRIMARY }, paragraph: { spacing: { before: 60, after: 40 } } },
        { id: "TOC2", name: "toc 2", basedOn: "Normal", next: "Normal", run: { font: "Calibri", size: 19, color: TEXT }, paragraph: { spacing: { after: 30 }, indent: { left: 360 } } },
      ],
    },
    sections: [{
      properties: { page: { size: { orientation: PageOrientation.LANDSCAPE, width: 11906, height: 16838 }, margin: { top: 720, right: 900, bottom: 720, left: 900 } } },
      headers: { default: new Header({ children: [paragraph(`${institution} · PCA ${year}`, { size: 15 })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Página ", color: MUTED, size: 15 }), new TextRun({ children: [PageNumber.CURRENT], color: MUTED, size: 15 }), new TextRun({ text: " de ", color: MUTED, size: 15 }), new TextRun({ children: [PageNumber.TOTAL_PAGES], color: MUTED, size: 15 })] })] }) },
      children,
    }],
  });
}

export async function exportPlanAnualDocx(artifact: WorkflowArtifact, context: ExportPlanAnualContext = {}): Promise<Blob> {
  const doc = await buildPlanAnualDocxDocument(artifact, context);
  const blob = await Packer.toBlob(doc);
  if (typeof window !== "undefined") {
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeFileName(artifact.document_title || "plan-curricular-anual")}.docx`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return blob;
}

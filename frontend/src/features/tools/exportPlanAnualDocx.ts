import {
  AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel, Packer,
  PageNumber, PageOrientation, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType,
} from "docx";

import type { WorkflowArtifact, WorkflowArtifactTable } from "./exportWorkflowDocx";

export type ExportPlanAnualContext = {
  workflowKey?: string;
  values?: Record<string, unknown>;
  toolTitle?: string;
  [key: string]: unknown;
};

const TEXT = "000000";
const MUTED = "475569";
const BORDER = "C7D7EA";
const HEADER = "DCEBFA";
const ZEBRA = "F7FAFD";

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
  return "No registrado";
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
  return new Paragraph({
    heading: level,
    children: [new TextRun({ text: cleanText(text), bold: true, color: TEXT, size: level === HeadingLevel.HEADING_1 ? 25 : 21, font: "Calibri" })],
    spacing: { before: 150, after: 70 },
  });
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
        children: table.columns.map((_, cellIndex) => cell(row[cellIndex] || "No registrado", false, index % 2 === 1)),
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
  const children: Array<Paragraph | Table> = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: cleanText(artifact.document_title || `PLAN CURRICULAR ANUAL ${year}`), bold: true, color: TEXT, size: 32, font: "Calibri" })],
      spacing: { after: 90 },
    }),
    paragraph(`${institution} · ${area} · Año lectivo ${year}`, { bold: true, center: true, size: 21 }),
    heading("I. DATOS INFORMATIVOS", HeadingLevel.HEADING_1),
    dataTable([
      ["DRE", value(values, "dre")], ["UGEL", value(values, "ugel")], ["Institución educativa", institution],
      ["Modelo de servicio educativo", value(values, "service_model")], ["Modalidad", value(values, "modality")],
      ["Nivel académico", value(values, "level")], ["Planificación por", value(values, "planning_scope")],
      ["Grado o ciclo", value(values, "grade")], ["Secciones", value(values, "sections", "section")],
      ["Periodo de ejecución", value(values, "execution_period")], ["Año lectivo", year], ["Áreas curriculares", area],
      ["Docente responsable", value(values, "teacher_name")], ["Director(a)", value(values, "director_name")],
      ["Subdirector(a)", value(values, "subdirector_name")], ["Enfoque pedagógico", value(values, "pedagogical_approach")],
      ["Tono de redacción", value(values, "writing_tone")], ["Enfoque de evaluación", value(values, "assessment_approach")],
    ]),
    heading("II. SÍNTESIS DE LA PLANIFICACIÓN", HeadingLevel.HEADING_1),
    paragraph(artifact.executive_summary),
  ];

  artifact.sections.forEach((section, index) => {
    children.push(heading(`${index + 1}. ${section.title}`, HeadingLevel.HEADING_2));
    children.push(paragraph(section.narrative));
    section.key_points.forEach((point) => children.push(new Paragraph({
      bullet: { level: 0 },
      children: [new TextRun({ text: cleanText(point), color: TEXT, size: 18, font: "Calibri" })],
      spacing: { after: 45 },
    })));
  });

  children.push(heading("III. MATRICES ANUALES", HeadingLevel.HEADING_1));
  if (!tables.length) {
    children.push(paragraph("Las matrices deben regenerarse antes de descargar la versión final."));
  } else {
    tables.forEach((table, index) => {
      children.push(heading(`${index + 1}. ${table.title}`, HeadingLevel.HEADING_2));
      children.push(artifactTable(table));
      if (table.note) children.push(paragraph(table.note));
    });
  }

  children.push(heading("IV. RECOMENDACIONES PARA LA IMPLEMENTACIÓN", HeadingLevel.HEADING_1));
  artifact.teacher_recommendations.forEach((recommendation) => children.push(new Paragraph({
    numbering: { reference: "recommendations", level: 0 },
    children: [new TextRun({ text: cleanText(recommendation), color: TEXT, size: 19, font: "Calibri" })],
    spacing: { after: 55 },
  })));

  const signers: Array<[string, string]> = [
    [value(values, "teacher_name"), "Docente responsable"],
    [value(values, "director_name"), "Director(a)"],
  ].filter(([name]) => name !== "No registrado") as Array<[string, string]>;
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
    numbering: { config: [{ reference: "recommendations", levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.LEFT }] }] },
    styles: { default: { document: { run: { font: "Calibri", size: 19, color: TEXT } } } },
    sections: [{
      properties: { page: { size: { orientation: PageOrientation.LANDSCAPE, width: 11906, height: 16838 }, margin: { top: 720, right: 720, bottom: 600, left: 720 } } },
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

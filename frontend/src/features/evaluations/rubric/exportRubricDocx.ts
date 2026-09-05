import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  PageNumber,
  PageOrientation,
  Paragraph,
  Packer,
  ShadingType,
  SectionType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";

import type { Student } from "../../rosters/rosterTypes";
import { reconcileRubricAssessments } from "./rubricState";
import type { RubricDraft } from "./rubricTypes";

const BLUE = "1D4ED8";
const BLUE_LIGHT = "EAF2FF";
const VIOLET_LIGHT = "F1EDFF";
const BORDER = "B8C7DD";
const TEXT = "000000";

function clean(value: unknown) {
  return String(value ?? "").replace(/\*+/g, "").replace(/^#{1,6}\s*/gm, "").trim();
}

function fileName(value: string) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase() || "rubrica-avendia";
}

function cell(text: string, options: { bold?: boolean; fill?: string; width?: number; center?: boolean } = {}) {
  return new TableCell({
    width: options.width ? { size: options.width, type: WidthType.PERCENTAGE } : undefined,
    shading: options.fill ? { fill: options.fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 110, right: 110, bottom: 110, left: 110 },
    borders: {
      top: { style: BorderStyle.SINGLE, color: BORDER, size: 4 },
      bottom: { style: BorderStyle.SINGLE, color: BORDER, size: 4 },
      left: { style: BorderStyle.SINGLE, color: BORDER, size: 4 },
      right: { style: BorderStyle.SINGLE, color: BORDER, size: 4 },
    },
    children: [new Paragraph({
      alignment: options.center ? AlignmentType.CENTER : AlignmentType.LEFT,
      children: [new TextRun({ text: clean(text), bold: options.bold, color: TEXT, size: 18 })],
    })],
  });
}

function titleBlock(draft: RubricDraft) {
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "RÚBRICA DE EVALUACIÓN", bold: true, color: BLUE, size: 18 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 80 }, children: [new TextRun({ text: clean(draft.general.evidenceTitle), bold: true, color: TEXT, size: 30 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: [draft.general.area, draft.general.grade, draft.general.competence].filter(Boolean).map(clean).join(" · "), color: TEXT, size: 18 })] }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({ children: [
        cell(`Docente: ${draft.general.teacherName}`, { fill: BLUE_LIGHT, width: 25 }),
        cell(`I.E.: ${draft.general.institution}`, { fill: BLUE_LIGHT, width: 25 }),
        cell(`Modalidad: ${draft.general.modality}`, { fill: BLUE_LIGHT, width: 18 }),
        cell(`Fecha: ${draft.general.date}`, { fill: BLUE_LIGHT, width: 18 }),
      ] })],
    }),
    new Paragraph({ spacing: { after: 100 } }),
  ];
}

function matrix(draft: RubricDraft) {
  const levelWidth = Math.floor(76 / Math.max(1, draft.levels.length));
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: [
        cell("Criterio", { bold: true, fill: VIOLET_LIGHT, width: 24, center: true }),
        ...draft.levels.map((level) => cell(`${level.code}\n${level.label}`, { bold: true, fill: VIOLET_LIGHT, width: levelWidth, center: true })),
      ] }),
      ...draft.criteria.map((criterion) => new TableRow({ children: [
        cell(`${criterion.code} · ${criterion.title}${draft.weighted && criterion.weight !== null ? ` (${criterion.weight} %)` : ""}\n${criterion.description}`, { bold: true, fill: BLUE_LIGHT, width: 24 }),
        ...draft.levels.map((level) => cell(criterion.descriptors[level.id] || "Descriptor pendiente", { width: levelWidth })),
      ] })),
    ],
  });
}

function footer() {
  return new Footer({ children: [new Paragraph({
    alignment: AlignmentType.RIGHT,
    children: [new TextRun({ text: "Avendia · Página ", color: TEXT, size: 16 }), new TextRun({ children: [PageNumber.CURRENT], color: TEXT, size: 16 })],
  })] });
}

function header() {
  return new Header({ children: [new Paragraph({ children: [new TextRun({ text: "AVENDIA · INSTRUMENTO PEDAGÓGICO EDITABLE", bold: true, color: BLUE, size: 16 })] })] });
}

export function buildRubricDocx(draft: RubricDraft, students: Student[]) {
  if (draft.criteria.length < 3 || draft.levels.length < 3) {
    throw new Error("La rúbrica necesita al menos tres criterios y tres niveles antes de exportar.");
  }
  const assessments = reconcileRubricAssessments(students, draft.criteria, draft.assessments);
  return new Document({
    styles: {
      default: { document: { run: { font: "Arial", size: 20, color: TEXT }, paragraph: { spacing: { after: 80, line: 270 } } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Arial", size: 28, bold: true, color: TEXT }, paragraph: { spacing: { before: 160, after: 100 } } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { font: "Arial", size: 23, bold: true, color: TEXT }, paragraph: { spacing: { before: 120, after: 80 } } },
      ],
    },
    sections: [
      {
        properties: { page: { size: { orientation: PageOrientation.LANDSCAPE }, margin: { top: 720, right: 620, bottom: 620, left: 620 } } },
        headers: { default: header() },
        footers: { default: footer() },
        children: [
          ...titleBlock(draft),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Matriz de criterios y niveles")] }),
          matrix(draft),
          new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: `Desempeño esperado: ${clean(draft.general.performance)}`, color: TEXT })] }),
          ...(draft.general.context ? [new Paragraph({ children: [new TextRun({ text: `Contexto: ${clean(draft.general.context)}`, color: TEXT })] })] : []),
        ],
      },
      ...students.map((student) => {
        const assessment = assessments.find((item) => item.studentId === student.id);
        return {
          properties: { type: SectionType.NEXT_PAGE, page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
          headers: { default: header() },
          footers: { default: footer() },
          children: [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "RETROALIMENTACIÓN INDIVIDUAL", bold: true, color: BLUE, size: 18 })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 100, after: 140 }, children: [new TextRun({ text: clean(student.full_name), bold: true, color: TEXT, size: 30 })] }),
            new Paragraph({ children: [new TextRun({ text: `Evidencia revisada: ${clean(assessment?.evidence) || "Pendiente de registrar"}`, bold: true, color: TEXT })] }),
            ...draft.criteria.flatMap((criterion) => {
              const rating = assessment?.ratings[criterion.id];
              const level = draft.levels.find((item) => item.id === rating?.levelId);
              return [
                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(`${criterion.code} · ${criterion.title}`)] }),
                new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
                  new TableRow({ children: [cell("Nivel alcanzado", { bold: true, fill: VIOLET_LIGHT, width: 24 }), cell(level ? `${level.code} · ${level.label}` : "Pendiente", { width: 76 })] }),
                  new TableRow({ children: [cell("Fortaleza observada", { bold: true, fill: BLUE_LIGHT, width: 24 }), cell(rating?.strength || "Pendiente de registrar", { width: 76 })] }),
                  new TableRow({ children: [cell("Por mejorar", { bold: true, fill: BLUE_LIGHT, width: 24 }), cell(rating?.improvement || "Pendiente de registrar", { width: 76 })] }),
                  new TableRow({ children: [cell("Siguiente paso", { bold: true, fill: BLUE_LIGHT, width: 24 }), cell(rating?.recommendation || "Pendiente de registrar", { width: 76 })] }),
                ] }),
              ];
            }),
            new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("Decisión docente")] }),
            new Paragraph({ children: [new TextRun({ text: clean(assessment?.teacherDecision) || "Pendiente de registrar", color: TEXT })] }),
          ],
        };
      }),
    ],
  });
}

export async function exportRubricDocx(draft: RubricDraft, students: Student[]) {
  const blob = await Packer.toBlob(buildRubricDocx(draft, students));
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `rubrica-${fileName(draft.general.evidenceTitle)}.docx`;
  anchor.click();
  URL.revokeObjectURL(url);
}

import type { WorkflowArtifact } from "../../tools/exportWorkflowDocx";
import type { TextSize } from "./evaluationContracts";
import type { Paragraph as DocxParagraph, Table as DocxTable } from "docx";

const WORD_SIZE: Record<TextSize, number> = { small: 20, medium: 24, large: 28 };

function cleanText(value: string) {
  return value.replace(/\*+/g, "").replace(/^#{1,6}\s*/gm, "").trim();
}

function safeFileName(value: string) {
  return cleanText(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-_ ]/g, "").trim().replace(/\s+/g, "-").toLowerCase() || "documento-evaluamos";
}

function isTeacherOnly(title: string) {
  return /(respuesta|justificaci[oó]n|clave|soluci[oó]n|retroalimentaci[oó]n|revisi[oó]n docente)/i.test(title);
}

function needsResponseSpace(title: string) {
  return /(pregunta|activaci[oó]n|pr[aá]ctica|aplicaci[oó]n|reto|metacognici[oó]n)/i.test(title)
    && !isTeacherOnly(title);
}

function isCriteriaSection(title: string) {
  return /criteri/i.test(title) && !isTeacherOnly(title);
}

function parseQuestionPoint(value: string) {
  const match = value.trim().match(/^\[([^\]]+)\]\s*(.*)$/s);
  const body = match?.[2] ?? value;
  const parts = body.split("|").map((part) => part.trim()).filter(Boolean);
  return {
    type: (match?.[1] ?? "Texto breve").toLocaleLowerCase("es"),
    prompt: parts[0] ?? body,
    options: parts.slice(1),
  };
}

/** Builds the edited AI result using the reading/question sizes selected by the teacher. */
export async function buildSourceDocumentDocx(
  artifact: WorkflowArtifact,
  sourceText: string,
  readingSize: TextSize,
  questionSize: TextSize,
) {
  const { AlignmentType, BorderStyle, Document, HeadingLevel, Paragraph, ShadingType, Table, TableCell, TableRow, TextRun, WidthType } = await import("docx");
  const publicSections = artifact.sections.filter((section) => !isTeacherOnly(section.title));
  // Keep the success criteria beside the source/context instead of orphaning
  // them after several large response areas on an almost empty page.
  const orderedPublicSections = [
    ...publicSections.filter((section) => !needsResponseSpace(section.title) && !isCriteriaSection(section.title)),
    ...publicSections.filter((section) => isCriteriaSection(section.title)),
    ...publicSections.filter((section) => needsResponseSpace(section.title)),
  ];
  const teacherSections = artifact.sections.filter((section) => isTeacherOnly(section.title));
  const publicTables = (artifact.tables ?? []).filter((table) => !isTeacherOnly(table.title));
  const teacherTables = (artifact.tables ?? []).filter((table) => isTeacherOnly(table.title));
  const border = { style: BorderStyle.SINGLE, size: 4, color: "B9CDE5" };

  const responseBlocks = (type: string, options: string[]): Array<DocxParagraph | DocxTable> => {
    if (type.includes("opción") || type.includes("opcion")) {
      return options.map((option) => new Paragraph({
        children: [new TextRun({ text: `☐  ${cleanText(option)}`, color: "000000", size: WORD_SIZE[questionSize] })],
        spacing: { before: 30, after: 70 },
      }));
    }
    if (type.includes("tabla")) {
      return [new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({
          cantSplit: true,
          children: Array.from({ length: 3 }, (_, columnIndex) => new TableCell({
            borders: { top: border, right: border, bottom: border, left: border },
            shading: { fill: "F3F8FD", type: ShadingType.CLEAR },
            margins: { top: 90, right: 90, bottom: 90, left: 90 },
            children: [
              new Paragraph({ children: [new TextRun({
                text: `Dato ${columnIndex + 1}`,
                bold: true,
                color: "000000",
                size: WORD_SIZE[questionSize],
              })] }),
              new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: " ", size: 20 })] }),
            ],
          })),
        })],
      })];
    }
    if (type.includes("dibujo")) {
      return [new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [new TableRow({
          cantSplit: true,
          children: [new TableCell({
            borders: { top: border, right: border, bottom: border, left: border },
            margins: { top: 120, right: 120, bottom: 120, left: 120 },
            children: [
              new Paragraph({ children: [new TextRun({ text: "Dibuja y rotula aquí.", italics: true, color: "50647D", size: 18 })], spacing: { after: 620 } }),
              new Paragraph({ border: { bottom: border }, children: [new TextRun({ text: " ", size: 20 })] }),
            ],
          })],
        })],
      })];
    }
    if (type.includes("resolución") || type.includes("resolucion")) {
      return [
        new Paragraph({ children: [new TextRun({ text: "Procedimiento, operación y comprobación:", italics: true, color: "50647D", size: 18 })], spacing: { after: 40 } }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: Array.from({ length: 5 }, () => new TableRow({
            cantSplit: true,
            children: Array.from({ length: 6 }, () => new TableCell({
              borders: { top: border, right: border, bottom: border, left: border },
              children: [new Paragraph({ children: [new TextRun({ text: " ", size: 18 })] })],
            })),
          })),
        }),
      ];
    }
    const lineCount = type.includes("desarrollo") ? 6 : 2;
    return [
      new Paragraph({ children: [new TextRun({ text: "Respuesta / desarrollo:", color: "50647D", italics: true, size: 18 })], spacing: { before: 20, after: 40 } }),
      ...Array.from({ length: lineCount }, () => new Paragraph({ border: { bottom: border }, spacing: { after: 150 }, children: [new TextRun({ text: " ", size: 20 })] })),
    ];
  };

  const sectionParagraphs = (section: WorkflowArtifact["sections"][number], teacher = false) => {
    const result: Array<DocxParagraph | DocxTable> = [new Paragraph({
      heading: HeadingLevel.HEADING_1,
      keepNext: true,
      spacing: { before: 220, after: 100 },
      children: [new TextRun({ text: cleanText(section.title), bold: true, color: "000000", size: 28 })],
    })];
    if (section.narrative.trim()) {
      result.push(new Paragraph({
        keepNext: section.key_points.length > 0,
        children: [new TextRun({ text: cleanText(section.narrative), color: "000000", size: WORD_SIZE[questionSize] })],
        spacing: { after: 120 },
      }));
    }
    section.key_points.forEach((point, index) => {
      const parsed = parseQuestionPoint(point);
      const printablePoint = needsResponseSpace(section.title) && !teacher ? parsed.prompt : point;
      result.push(new Paragraph({
        keepNext: needsResponseSpace(section.title) && !teacher,
        children: [
          new TextRun({ text: teacher ? `${index + 1}. ` : `${index + 1}. `, bold: true, color: "1E5A96", size: WORD_SIZE[questionSize] }),
          new TextRun({ text: cleanText(printablePoint), color: "000000", size: WORD_SIZE[questionSize] }),
        ],
        spacing: { after: 80 },
      }));
      if (needsResponseSpace(section.title) && !teacher) {
        result.push(...responseBlocks(parsed.type, parsed.options));
      }
    });
    return result;
  };

  const tableBlocks = (tables: NonNullable<WorkflowArtifact["tables"]>) => {
    const result: Array<DocxParagraph | DocxTable> = [];
    for (const table of tables) {
      result.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 220, after: 100 },
        children: [new TextRun({ text: cleanText(table.title), bold: true, color: "000000", size: 28 })],
      }));
      result.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            tableHeader: true,
            cantSplit: true,
            children: table.columns.map((column) => new TableCell({
              borders: { top: border, right: border, bottom: border, left: border },
              shading: { fill: "DCEBFA", type: ShadingType.CLEAR },
              margins: { top: 80, right: 80, bottom: 80, left: 80 },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: cleanText(column), bold: true, color: "000000", size: WORD_SIZE[questionSize] })] })],
            })),
          }),
          ...table.rows.map((row) => new TableRow({
            cantSplit: true,
            children: table.columns.map((_, index) => new TableCell({
              borders: { top: border, right: border, bottom: border, left: border },
              margins: { top: 80, right: 80, bottom: 80, left: 80 },
              children: [new Paragraph({ children: [new TextRun({ text: cleanText(row[index] ?? ""), color: "000000", size: WORD_SIZE[questionSize] })] })],
            })),
          })),
        ],
      }));
      if (table.note) result.push(new Paragraph({ children: [new TextRun({ text: cleanText(table.note), color: "000000", italics: true, size: 20 })] }));
    }
    return result;
  };

  const children: Array<DocxParagraph | DocxTable> = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      children: [new TextRun({ text: cleanText(artifact.document_title), bold: true, color: "000000", size: 34 })],
    }),
    new Paragraph({
      children: [new TextRun({ text: cleanText(artifact.executive_summary), color: "000000", italics: true, size: 22 })],
      spacing: { after: 260 },
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [new TableRow({
        children: ["Estudiante: ______________________________", "Grado y sección: __________________"].map((text) => new TableCell({
          borders: { top: border, right: border, bottom: border, left: border },
          shading: { fill: "F3F8FD", type: ShadingType.CLEAR },
          margins: { top: 110, right: 110, bottom: 110, left: 110 },
          children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: "000000", size: 20 })] })],
        })),
      })],
    }),
    new Paragraph({ spacing: { after: 120 }, children: [] }),
  ];

  if (sourceText.trim()) {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: "Lectura o contenido fuente", bold: true, color: "000000", size: 28 })],
    }));
    children.push(new Paragraph({
      children: [new TextRun({ text: cleanText(sourceText), color: "000000", size: WORD_SIZE[readingSize] })],
      spacing: { after: 240 },
    }));
  }

  orderedPublicSections.forEach((section) => children.push(...sectionParagraphs(section)));
  children.push(...tableBlocks(publicTables));

  if (teacherSections.length || teacherTables.length || artifact.teacher_recommendations.length) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.TITLE,
      pageBreakBefore: true,
      shading: { fill: "FFF2CC", type: ShadingType.CLEAR },
      children: [new TextRun({ text: "GUÍA DOCENTE · NO ENTREGAR AL ESTUDIANTE", bold: true, color: "000000", size: 32 })],
      spacing: { after: 220 },
    }));
    teacherSections.forEach((section) => children.push(...sectionParagraphs(section, true)));
    children.push(...tableBlocks(teacherTables));
    if (artifact.teacher_recommendations.length) {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: "Orientaciones para revisión docente", bold: true, color: "000000", size: 28 })] }));
      artifact.teacher_recommendations.forEach((item) => children.push(new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun({ text: cleanText(item), color: "000000", size: 22 })],
      })));
    }
  }

  return new Document({ sections: [{ properties: {}, children }] });
}

/** Exports the document and triggers the browser download. */
export async function exportSourceDocumentDocx(
  artifact: WorkflowArtifact,
  sourceText: string,
  readingSize: TextSize,
  questionSize: TextSize,
) {
  const { Packer } = await import("docx");
  const document = await buildSourceDocumentDocx(artifact, sourceText, readingSize, questionSize);
  const blob = await Packer.toBlob(document);
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeFileName(artifact.document_title)}.docx`;
  anchor.click();
  URL.revokeObjectURL(url);
}

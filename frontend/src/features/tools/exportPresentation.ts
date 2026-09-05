import type {
  Paragraph as DocxParagraph,
  Table as DocxTable,
  TableCell as DocxTableCell,
  TableRow as DocxTableRow,
} from "docx";
import PptxGenJS from "pptxgenjs";

import { apiAssetAsDataUrl } from "../../lib/api";
import type { PresentationForm, PresentationResult } from "./PresentationTool";

const STYLE_COLORS: Record<string, { background: string; accent: string; secondary: string }> = {
  infografico: { background: "EAF4FF", accent: "1467F5", secondary: "6D4FE8" },
  bento_pastel: { background: "F4F2FF", accent: "6D4FE8", secondary: "2B70EA" },
  ilustrado: { background: "EEF8FF", accent: "2B70EA", secondary: "F9735B" },
  minimalista: { background: "FFFFFF", accent: "111D3A", secondary: "5B67F1" },
  esquema: { background: "F2F7FB", accent: "2368C4", secondary: "16A37B" },
  alto_contraste: { background: "0D1830", accent: "FFD43B", secondary: "FFFFFF" },
  editorial: { background: "F8F5F0", accent: "24324A", secondary: "C85943" },
  gamificado: { background: "F0F4FF", accent: "6045E6", secondary: "FF8A3D" },
};

function safeFileName(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9-_ ]/g, "").trim().replace(/\s+/g, "-").toLowerCase() || "presentacion-avendia";
}

export async function exportPresentationPptx(form: PresentationForm, result: PresentationResult) {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = form.teacherName;
  pptx.company = form.institution;
  pptx.subject = `${form.curricularArea} · ${form.grade}`;
  pptx.title = result.presentation_title;
  pptx.theme = {
    headFontFace: "Aptos Display",
    bodyFontFace: "Aptos",
  };
  const palette = STYLE_COLORS[form.visualStyle] ?? STYLE_COLORS.infografico;
  const dark = form.visualStyle === "alto_contraste";
  const textColor = dark ? "FFFFFF" : "13203A";
  const mutedColor = dark ? "D7E0F0" : "516078";
  const slideImages = await Promise.all(result.slides.map(async (item) => {
    if (!item.image_url) return "";
    try {
      return await apiAssetAsDataUrl(item.image_url);
    } catch {
      return "";
    }
  }));

  result.slides.forEach((item, index) => {
    const slide = pptx.addSlide();
    const imageData = slideImages[index];
    const isCover = item.type === "portada";
    const isQuote = item.type === "frase_destacada";
    const isClosing = item.type === "cierre";
    const overPhoto = Boolean(imageData) && (isCover || isQuote);
    slide.background = { color: palette.background };
    if (imageData) {
      const frame = overPhoto
        ? { x: 0, y: 0, w: 13.333, h: 7.5 }
        : isClosing
          ? { x: 8.15, y: 0.68, w: 4.58, h: 5.92 }
          : { x: 7.65, y: 0, w: 5.683, h: 7.5 };
      slide.addImage({ data: imageData, ...frame, sizing: { type: "cover", w: frame.w, h: frame.h } });
      if (overPhoto) {
        slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, line: { color: "08162E", transparency: 100 }, fill: { color: "08162E", transparency: isQuote ? 35 : 27 } });
      } else {
        slide.addShape(pptx.ShapeType.rect, { x: 6.75, y: 0, w: 1.35, h: 7.5, line: { color: palette.background, transparency: 100 }, fill: { color: palette.background, transparency: 7 } });
      }
    } else {
      slide.addShape(pptx.ShapeType.rect, { x: 8.25, y: 0, w: 5.083, h: 7.5, line: { color: palette.accent, transparency: 100 }, fill: { color: palette.accent, transparency: 5 } });
      slide.addText(String(index + 1).padStart(2, "0"), { x: 8.58, y: 2.12, w: 4.25, h: 2.2, fontFace: "Aptos Display", fontSize: 82, bold: true, color: "FFFFFF", transparency: 72, margin: 0, align: "center" });
    }

    const foreground = overPhoto ? "FFFFFF" : textColor;
    const foregroundMuted = overPhoto ? "E6EDFA" : mutedColor;
    const accent = overPhoto ? "BCD0FF" : palette.secondary;
    const copyX = isQuote ? 1.12 : 0.68;
    const copyW = isQuote ? 8.25 : imageData && !overPhoto ? 6.35 : 7.1;
    slide.addText(`${String(index + 1).padStart(2, "0")} · ${form.curricularArea.toUpperCase()}`, { x: copyX, y: 0.5, w: copyW, h: 0.28, fontFace: "Aptos", fontSize: 9, bold: true, color: accent, charSpacing: 1.1, margin: 0 });
    slide.addText(item.title, { x: copyX, y: isCover ? 1.28 : 0.92, w: copyW, h: isCover ? 1.55 : 1.0, fontFace: "Aptos Display", fontSize: isCover ? 32 : isQuote ? 27 : 24, bold: true, color: foreground, breakLine: false, margin: 0.02, valign: "middle" });
    if (item.subtitle) slide.addText(item.subtitle, { x: copyX, y: isCover ? 2.86 : 1.92, w: copyW, h: 0.62, fontSize: 13, color: foregroundMuted, margin: 0, breakLine: false });
    if (item.key_points.length && !isQuote) {
      slide.addText(item.key_points.map((point) => ({ text: point, options: { bullet: { indent: 14 }, hanging: 3, breakLine: true } })), { x: copyX + 0.03, y: isCover ? 3.62 : 2.58, w: copyW - 0.1, h: item.interactive_activity ? 2.35 : 3.25, fontSize: isCover ? 15 : 16, color: foreground, breakLine: false, paraSpaceAfter: 12, margin: 0.04, valign: "top" });
    }
    if (item.highlighted_quote) slide.addText(item.highlighted_quote, { x: copyX, y: isQuote ? 3.12 : 4.68, w: isQuote ? 8.25 : copyW, h: isQuote ? 1.75 : 0.92, fontSize: isQuote ? 25 : 17, italic: false, bold: true, color: isQuote ? "FFFFFF" : palette.accent, margin: 0.06, breakLine: false, valign: "middle" });
    if (item.interactive_activity) {
      const activityY = 5.62;
      slide.addShape(pptx.ShapeType.rect, { x: copyX, y: activityY, w: Math.min(copyW, 6.6), h: 1.08, line: { color: palette.accent, transparency: 100 }, fill: { color: overPhoto ? "FFFFFF" : palette.accent, transparency: overPhoto ? 80 : 87 } });
      slide.addShape(pptx.ShapeType.rect, { x: copyX, y: activityY, w: 0.06, h: 1.08, line: { color: palette.accent, transparency: 100 }, fill: { color: overPhoto ? "FFFFFF" : palette.accent } });
      slide.addText("INTERACCIÓN EN AULA", { x: copyX + 0.22, y: activityY + 0.16, w: copyW - 0.35, h: 0.2, fontSize: 8.5, bold: true, color: overPhoto ? "FFFFFF" : palette.accent, charSpacing: 0.8, margin: 0 });
      slide.addText(item.interactive_activity, { x: copyX + 0.22, y: activityY + 0.43, w: Math.min(copyW - 0.35, 6.2), h: 0.48, fontSize: 10.5, color: foreground, margin: 0, breakLine: false });
    }
    slide.addText(`${form.teacherName} · ${form.institution}`, { x: 0.68, y: 7.08, w: 6.5, h: 0.16, fontSize: 7, color: foregroundMuted, margin: 0 });
    if (imageData && item.image_attribution) slide.addText(item.image_attribution, { x: 8.0, y: 7.08, w: 4.65, h: 0.16, fontSize: 5.5, color: overPhoto ? "FFFFFF" : "68758A", transparency: overPhoto ? 15 : 0, margin: 0, align: "right" });
    slide.addText(`${index + 1}/${result.slides.length}`, { x: 12.65, y: 7.07, w: 0.35, h: 0.16, fontSize: 7, bold: true, color: overPhoto ? "FFFFFF" : mutedColor, margin: 0, align: "right" });
    slide.addNotes(`${item.speaker_notes}${item.image_attribution ? `\n\nImagen: ${item.image_attribution}${item.image_source_url ? `\nFuente: ${item.image_source_url}` : ""}` : ""}`);
  });

  const output = await pptx.write({ outputType: "blob" });
  const blob = output instanceof Blob
    ? output
    : new Blob([output as ArrayBuffer | Uint8Array], {
      type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${safeFileName(result.presentation_title)}.pptx`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

export async function buildPresentationDocument(form: PresentationForm, result: PresentationResult) {
  const {
    AlignmentType,
    BorderStyle,
    Document,
    Footer,
    Header,
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
  const COLOR_SECONDARY = "2E74B5";
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
      const raw = String(text ?? "").trim();
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
          text: (result.presentation_title || "Guion de Presentación").toUpperCase(),
          bold: true,
          color: COLOR_PRIMARY,
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
          text: `GUION PEDAGÓGICO DE CLASE Y RECURSO VISUAL · ${form.curricularArea.toUpperCase()}`,
          bold: true,
          color: COLOR_SECONDARY,
          size: 20,
          font: "Calibri",
        }),
      ],
      spacing: { after: 140 },
    })
  );

  // Tabla informativa
  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            createCell(`Institución: ${form.institution}`, { widthPercent: 50, bold: true }),
            createCell(`Docente: ${form.teacherName}`, { widthPercent: 50 }),
          ],
        }),
        new TableRow({
          children: [
            createCell(`Área: ${form.curricularArea} · Nivel: ${form.level}`, { widthPercent: 50 }),
            createCell(`Grado: ${form.grade} · Estilo Visual: ${form.visualStyle}`, { widthPercent: 50 }),
          ],
        }),
        new TableRow({
          children: [
            createCell(`Propósito / Objetivo de Aprendizaje: ${result.learning_objective}`, { colSpan: 2, widthPercent: 100, fillColor: "F8FAFC" }),
          ],
        }),
      ],
    })
  );

  children.push(
    new Paragraph({
      children: [
        new TextRun({ text: "SECUENCIA DE DIAPOSITIVAS Y GUION PEDAGÓGICO", bold: true, color: COLOR_PRIMARY, size: 22, font: "Calibri" }),
      ],
      spacing: { before: 160, after: 100 },
    })
  );

  result.slides.forEach((slide) => {
    const slideRows: DocxTableRow[] = [
      new TableRow({
        tableHeader: true,
        cantSplit: true,
        children: [
          createCell(`Diapositiva ${slide.order}: ${slide.title.toUpperCase()}`, {
            isHeader: true,
            bold: true,
            colSpan: 2,
            widthPercent: 100,
            fillColor: "BDD7EE",
            fontSize: 20,
          }),
        ],
      }),
    ];

    if (slide.subtitle) {
      slideRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            createCell(`Subtítulo: ${slide.subtitle}`, { colSpan: 2, widthPercent: 100, fillColor: "F8FAFC" }),
          ],
        })
      );
    }

    const keyPointsPars = slide.key_points.map((pt) =>
      new Paragraph({
        bullet: { level: 0 },
        children: [new TextRun({ text: pt, size: 18, font: "Calibri", color: COLOR_TEXT })],
        spacing: { before: 20, after: 20 },
      })
    );

    slideRows.push(
      new TableRow({
        cantSplit: true,
        children: [
          createCell("Puntos Clave a Proyectar:", { bold: true, widthPercent: 35, fillColor: "F1F5F9" }),
          createCell(keyPointsPars.length ? keyPointsPars : "Desarrollo conceptual de la diapositiva.", { widthPercent: 65 }),
        ],
      })
    );

    if (slide.highlighted_quote) {
      slideRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            createCell("Cita o Idea Fuerza:", { bold: true, widthPercent: 35, fillColor: "F1F5F9" }),
            createCell(`«${slide.highlighted_quote}»`, { widthPercent: 65, fillColor: "FEF3C7" }),
          ],
        })
      );
    }

    slideRows.push(
      new TableRow({
        cantSplit: true,
        children: [
          createCell("Notas y Preguntas del Docente:", { bold: true, widthPercent: 35, fillColor: "F1F5F9" }),
          createCell(slide.speaker_notes, { widthPercent: 65 }),
        ],
      }),
      new TableRow({
        cantSplit: true,
        children: [
          createCell("Dirección Visual / Ilustración:", { bold: true, widthPercent: 35, fillColor: "F1F5F9" }),
          createCell(slide.visual_prompt, { widthPercent: 65 }),
        ],
      })
    );

    if (slide.interactive_activity) {
      slideRows.push(
        new TableRow({
          cantSplit: true,
          children: [
            createCell("Dinámica o Interacción de Aula:", { bold: true, widthPercent: 35, fillColor: "DCFCE7" }),
            createCell(slide.interactive_activity, { widthPercent: 65, fillColor: "F0FDF4" }),
          ],
        })
      );
    }

    children.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: slideRows }));
    children.push(new Paragraph({ spacing: { after: 120 } }));
  });

  const outputDocument = new Document({
    creator: "Avendia",
    title: result.presentation_title,
    description: "Guion pedagógico de diapositivas generado por Avendia.",
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

  return outputDocument;
}

export async function exportPresentationDocx(form: PresentationForm, result: PresentationResult) {
  const { Packer } = await import("docx");
  const outputDocument = await buildPresentationDocument(form, result);
  const blob = await Packer.toBlob(outputDocument);
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${safeFileName(result.presentation_title)}-guion.docx`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
  return blob;
}

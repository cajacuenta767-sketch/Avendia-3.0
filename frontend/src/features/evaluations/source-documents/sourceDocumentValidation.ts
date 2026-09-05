const MAX_SOURCE_BYTES = 10 * 1024 * 1024;
const DOCX_MEDIA_TYPE = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function validateSourceDocumentFile(file: File, maxBytes = MAX_SOURCE_BYTES): string {
  const extension = file.name.split(".").pop()?.toLocaleLowerCase("es") ?? "";
  if (!file.size) return "El archivo está vacío. Selecciona otro PDF o Word.";
  if (file.size > maxBytes) return "El archivo supera 10 MB. Reduce su tamaño antes de subirlo.";
  if (extension === "doc") return "El formato DOC antiguo no es seguro para extraer texto. Ábrelo en Word y guárdalo como DOCX.";
  if (!["pdf", "docx"].includes(extension)) return "Formato no permitido. Usa un archivo PDF o Word DOCX.";
  if (file.type && !["application/pdf", DOCX_MEDIA_TYPE, "application/octet-stream"].includes(file.type)) {
    return "El tipo del archivo no coincide con PDF o DOCX.";
  }
  return "";
}

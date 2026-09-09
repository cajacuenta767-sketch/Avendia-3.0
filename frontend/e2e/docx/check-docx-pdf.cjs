#!/usr/bin/env node
/**
 * Convierte cada .docx de un directorio a PDF con LibreOffice, cuenta sus
 * páginas, rasteriza la primera página a PNG y compara el número de páginas
 * con la línea base versionada en e2e/docx/pages-baseline.json.
 *
 *   node e2e/docx/check-docx-pdf.cjs <dir-docx> <dir-salida> [--update-baseline]
 *
 * Falla si un documento no se convierte, queda con cero páginas o cambia de
 * páginas más allá de la tolerancia (±1) respecto a la línea base.
 */
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const [source, target, flag] = process.argv.slice(2);
if (!source || !target) {
  console.error("Uso: node check-docx-pdf.cjs <dir-docx> <dir-salida> [--update-baseline]");
  process.exit(2);
}
const updateBaseline = flag === "--update-baseline";
const baselinePath = path.join(__dirname, "pages-baseline.json");
const baseline = fs.existsSync(baselinePath) ? JSON.parse(fs.readFileSync(baselinePath, "utf8")) : {};
fs.mkdirSync(target, { recursive: true });

const docs = fs.readdirSync(source).filter((name) => name.endsWith(".docx")).sort();
if (!docs.length) {
  console.error(`No hay archivos .docx en ${source}`);
  process.exit(2);
}

const profile = path.join(require("node:os").tmpdir(), "lo-profile-avendia");
execFileSync("soffice", [
  "--headless", "--norestore", `-env:UserInstallation=file://${profile}`,
  "--convert-to", "pdf:writer_pdf_Export", "--outdir", target,
  ...docs.map((name) => path.join(source, name)),
], { stdio: "inherit", timeout: 15 * 60 * 1000 });

const pages = {};
const problems = [];
for (const name of docs) {
  const pdf = path.join(target, name.replace(/\.docx$/, ".pdf"));
  if (!fs.existsSync(pdf)) {
    problems.push(`${name}: LibreOffice no produjo el PDF`);
    continue;
  }
  const info = execFileSync("pdfinfo", [pdf], { encoding: "utf8" });
  const count = Number(/Pages:\s+(\d+)/.exec(info)?.[1] ?? 0);
  pages[name] = count;
  if (!count) problems.push(`${name}: el PDF no tiene páginas`);
  try {
    execFileSync("pdftoppm", ["-png", "-r", "60", "-f", "1", "-l", "1", "-singlefile", pdf, path.join(target, name.replace(/\.docx$/, ""))], { stdio: "ignore" });
  } catch {
    problems.push(`${name}: no se pudo rasterizar la primera página`);
  }
  const expected = baseline[name];
  if (!updateBaseline && typeof expected === "number" && Math.abs(expected - count) > 1) {
    problems.push(`${name}: ${count} páginas, la línea base tiene ${expected}`);
  }
}
fs.writeFileSync(path.join(target, "pages.json"), `${JSON.stringify(pages, null, 2)}\n`);
if (updateBaseline) {
  fs.writeFileSync(baselinePath, `${JSON.stringify(pages, null, 2)}\n`);
  console.log(`Línea base actualizada con ${docs.length} documentos.`);
}
console.log(`Convertidos ${docs.length} documentos; páginas totales: ${Object.values(pages).reduce((a, b) => a + b, 0)}.`);
if (problems.length) {
  console.error("\nProblemas:\n- " + problems.join("\n- "));
  process.exit(1);
}

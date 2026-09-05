"""Conversión efímera y segura de DOCX a PDF para el visor de documentos."""

from __future__ import annotations

import asyncio
import os
import shutil
import subprocess
import tempfile
from io import BytesIO
from pathlib import Path
from zipfile import BadZipFile, ZipFile

from fastapi import HTTPException, UploadFile, status

MAX_DOCX_BYTES = 20 * 1024 * 1024
CONVERSION_TIMEOUT_SECONDS = 45


def _office_binary() -> str | None:
    configured = os.getenv("LIBREOFFICE_BIN")
    if configured:
        return configured
    return shutil.which("soffice") or shutil.which("libreoffice")


def _convert_with_word(source: Path, destination: Path, workspace: Path) -> bool:
    """Fallback de desarrollo en Windows; producción usa LibreOffice en el contenedor."""
    word_executable = Path(r"C:\Program Files\Microsoft Office\root\Office16\WINWORD.EXE")
    if os.name != "nt" or not word_executable.exists():
        return False
    script = workspace / "convertir-word.ps1"
    script.write_text(
        """
param([string]$Source, [string]$Destination)
$ErrorActionPreference = 'Stop'
$word = $null
$document = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $document = $word.Documents.Open($Source, $false, $true)
  $document.ExportAsFixedFormat($Destination, 17)
} finally {
  if ($document) { $document.Close([ref]$false) }
  if ($word) { $word.Quit() }
}
""".strip(),
        encoding="utf-8",
    )
    completed = subprocess.run(
        [
            "powershell",
            "-NoProfile",
            "-NonInteractive",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            str(script),
            "-Source",
            str(source),
            "-Destination",
            str(destination),
        ],
        check=False,
        capture_output=True,
        timeout=CONVERSION_TIMEOUT_SECONDS,
    )
    return completed.returncode == 0 and destination.exists() and destination.stat().st_size > 0


def _is_docx(content: bytes) -> bool:
    try:
        with ZipFile(BytesIO(content)) as archive:
            names = set(archive.namelist())
            return "[Content_Types].xml" in names and "word/document.xml" in names
    except BadZipFile:
        return False


def _convert_docx_to_pdf(docx_bytes: bytes, filename: str) -> bytes:
    binary = _office_binary()
    with tempfile.TemporaryDirectory(prefix="avendia-preview-") as temp_dir:
        workspace = Path(temp_dir)
        source = workspace / filename
        source.write_bytes(docx_bytes)
        output = workspace / f"{source.stem}.pdf"
        if binary:
            completed = subprocess.run(
                [
                    binary,
                    "--headless",
                    "--convert-to",
                    "pdf:writer_pdf_Export",
                    "--outdir",
                    str(workspace),
                    str(source),
                ],
                check=False,
                capture_output=True,
                timeout=CONVERSION_TIMEOUT_SECONDS,
            )
            converted = completed.returncode == 0 and output.exists() and output.stat().st_size > 0
        else:
            converted = _convert_with_word(source, output, workspace)
        if not converted:
            raise RuntimeError("LibreOffice no pudo crear el PDF")
        return output.read_bytes()


async def convert_upload_to_pdf(upload: UploadFile) -> tuple[bytes, str]:
    name = Path(upload.filename or "documento.docx").name
    if Path(name).suffix.lower() != ".docx":
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT, "Selecciona un archivo Word (.docx)."
        )
    content = await upload.read(MAX_DOCX_BYTES + 1)
    if not content or len(content) > MAX_DOCX_BYTES or not _is_docx(content):
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_CONTENT,
            "El archivo Word no es válido o supera 20 MB.",
        )
    try:
        pdf = await asyncio.to_thread(_convert_docx_to_pdf, content, name)
    except subprocess.TimeoutExpired as error:
        raise HTTPException(
            status.HTTP_504_GATEWAY_TIMEOUT, "La vista tardó demasiado en prepararse."
        ) from error
    except RuntimeError as error:
        raise HTTPException(
            status.HTTP_503_SERVICE_UNAVAILABLE,
            "La vista exacta de Word no está disponible por el momento. "
            "Puedes descargar el Word sin perder tu trabajo.",
        ) from error
    return pdf, Path(name).with_suffix(".pdf").name

from io import BytesIO

import pytest
from docx import Document
from fastapi import HTTPException, UploadFile

from app.modules.documents import pdf_preview


def docx_bytes() -> bytes:
    document = Document()
    document.add_heading("Examen de prueba", 0)
    buffer = BytesIO()
    document.save(buffer)
    return buffer.getvalue()


async def test_docx_preview_uses_converter_without_persisting_upload(monkeypatch) -> None:
    def fake_convert(content: bytes, filename: str) -> bytes:
        assert content.startswith(b"PK")
        assert filename == "examen.docx"
        return b"%PDF-1.7\npreview"

    monkeypatch.setattr(pdf_preview, "_convert_docx_to_pdf", fake_convert)
    upload = UploadFile(filename="examen.docx", file=BytesIO(docx_bytes()))

    pdf, name = await pdf_preview.convert_upload_to_pdf(upload)

    assert pdf.startswith(b"%PDF")
    assert name == "examen.pdf"


async def test_docx_preview_rejects_non_docx_upload() -> None:
    upload = UploadFile(filename="examen.docx", file=BytesIO(b"no es un docx"))

    with pytest.raises(HTTPException) as error:
        await pdf_preview.convert_upload_to_pdf(upload)

    assert error.value.status_code == 422

import asyncio
import hashlib
import re
from io import BytesIO
from uuid import UUID
from zipfile import BadZipFile, ZipFile

from fastapi import APIRouter, Depends, HTTPException
from pydantic import Field
from sqlalchemy import JSON, ForeignKey, String, Text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from app.api.dependencies import get_current_user
from app.db.base import Base, TimestampMixin
from app.db.session import get_db
from app.modules.templates.router import owned_template
from app.modules.users.model import User
from app.modules.utilities.router import audit
from app.modules.utilities.schemas import Input


class TemplateDetails(TimestampMixin, Base):
    __tablename__ = "template_details"
    template_id: Mapped[UUID] = mapped_column(
        ForeignKey("institutional_templates.id", ondelete="CASCADE"), primary_key=True
    )
    category: Mapped[str] = mapped_column(String(80), default="otros")
    description: Mapped[str] = mapped_column(Text, default="")
    tags: Mapped[list] = mapped_column(JSON, default=list)
    analysis: Mapped[dict] = mapped_column(JSON, default=dict)


class DetailsInput(Input):
    name: str = Field(min_length=3, max_length=240)
    category: str = Field(min_length=2, max_length=80)
    description: str = Field(default="", max_length=2000)
    tags: list[str] = Field(default_factory=list, max_length=20)


router = APIRouter(tags=["templates"])


@router.get("/templates/{template_id}/details")
async def details(
    template_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    template = await owned_template(template_id, user, db)
    detail = await db.get(TemplateDetails, template_id)
    return {
        "name": template.name,
        "category": detail.category if detail else "otros",
        "description": detail.description if detail else "",
        "tags": detail.tags if detail else [],
        "analysis": detail.analysis if detail else {},
    }


@router.put("/templates/{template_id}/details")
async def edit(
    template_id: UUID,
    payload: DetailsInput,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    template = await owned_template(template_id, user, db)
    detail = await db.get(TemplateDetails, template_id)
    if not detail:
        detail = TemplateDetails(template_id=template_id)
        db.add(detail)
    template.name = (
        payload.name
        if payload.name.lower().endswith(template.extension)
        else payload.name + template.extension
    )
    if len(template.name) > 240 or any(len(tag) > 60 for tag in payload.tags):
        raise HTTPException(422, "Nombre o etiqueta demasiado largo")
    detail.category, detail.description, detail.tags = (
        payload.category,
        payload.description,
        payload.tags,
    )
    audit(db, user, "template.classified", template.id, "Nombre y clasificación actualizados")
    await db.commit()
    return await details(template_id, user, db)


def analyze_file(content: bytes, extension: str):
    report = {
        "sha256": hashlib.sha256(content).hexdigest(),
        "size_bytes": len(content),
        "extension": extension,
        "warnings": [],
        "fields": [],
        "parts": 0,
    }
    if extension == ".pdf":
        report["warnings"] = [
            "El formato PDF se conserva como documento de referencia; este análisis no garantiza "
            "campos editables ni reconocimiento de páginas escaneadas."
        ]
        report["mode"] = "reference"
        return report
    try:
        with ZipFile(BytesIO(content)) as archive:
            parts = archive.infolist()
            if len(parts) > 2000 or sum(item.file_size for item in parts) > 40 * 1024 * 1024:
                raise ValueError("El archivo supera el tamaño descomprimido permitido")
            root = {".docx": "word/", ".xlsx": "xl/", ".pptx": "ppt/"}[extension]
            if not any(item.filename.startswith(root) for item in parts):
                raise ValueError("El contenido no coincide con la extensión")
            text = "\n".join(
                archive.read(item).decode("utf-8", errors="replace")
                for item in parts
                if item.filename.startswith(root) and item.filename.endswith(".xml")
            )
            fields = sorted(set(re.findall(r"\{\{([a-zA-Z_áéíóúñ]+)\}\}", text)))
            report["fields"] = fields
            report["parts"] = len(parts)
            report["mode"] = "placeholders" if fields else "append"
            if not fields:
                report["warnings"].append(
                    "No se detectaron marcadores continuos. El exportador puede agregar contenido "
                    "al final; revisa el documento antes de usarlo."
                )
            unknown = set(fields) - {"titulo", "resumen", "contenido"}
            if unknown:
                report["warnings"].append(
                    "Hay marcadores que requieren mapeo adicional: " + ", ".join(sorted(unknown))
                )
            report["warnings"].append(
                "La detección estructural no certifica el diseño final; verifica la exportación."
            )
    except (BadZipFile, KeyError, ValueError) as exc:
        raise ValueError(
            "No se pudo analizar este archivo. Revisa su estructura y tamaño."
        ) from exc
    return report


@router.post("/templates/{template_id}/analyze")
async def analyze(
    template_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    template = await owned_template(template_id, user, db)
    try:
        report = await asyncio.to_thread(analyze_file, template.content, template.extension)
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    detail = await db.get(TemplateDetails, template_id)
    if not detail:
        detail = TemplateDetails(template_id=template_id)
        db.add(detail)
    detail.analysis = report
    audit(db, user, "template.analyzed", template.id, "Informe privado actualizado")
    await db.commit()
    return report

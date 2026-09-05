from io import BytesIO
from pathlib import Path
from urllib.parse import quote
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.modules.templates.model import InstitutionalTemplate, TemplateVersion
from app.modules.templates.router import MAX_TEMPLATE_SIZE, owned_template, valid_signature
from app.modules.templates.schemas import InstitutionalTemplateRead
from app.modules.templates.service import MIME_TYPES
from app.modules.users.model import User
from app.modules.utilities.router import audit
from app.modules.utilities.templates import TemplateDetails

router = APIRouter(tags=["templates"])


async def snapshot(db: AsyncSession, template: InstitutionalTemplate, expected: int):
    if template.revision != expected:
        raise HTTPException(409, "El formato cambió en otra sesión. Recarga antes de reemplazar.")
    claimed = await db.execute(
        update(InstitutionalTemplate)
        .where(InstitutionalTemplate.id == template.id, InstitutionalTemplate.revision == expected)
        .values(revision=expected + 1)
        .execution_options(synchronize_session=False)
    )
    if not claimed.rowcount:
        await db.rollback()
        raise HTTPException(409, "Otra sesión actualizó este formato")
    db.add(
        TemplateVersion(
            template_id=template.id,
            revision=expected,
            name=template.name,
            extension=template.extension,
            mime_type=template.mime_type,
            size_bytes=template.size_bytes,
            content=template.content,
        )
    )
    template.revision = expected + 1
    detail = await db.get(TemplateDetails, template.id)
    if detail:
        detail.analysis = {}


@router.post("/templates/{template_id}/recover", response_model=InstitutionalTemplateRead)
async def recover(
    template_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    template = await owned_template(template_id, user, db, True)
    template.trashed = False
    audit(db, user, "template.recovered", template.id, "Formato recuperado de papelera")
    await db.commit()
    return template


@router.post("/templates/{template_id}/replace", response_model=InstitutionalTemplateRead)
async def replace(
    template_id: UUID,
    expected_revision: int = Form(..., ge=1),
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    template = await owned_template(template_id, user, db)
    extension = Path(file.filename or "").suffix.lower()
    content = await file.read(MAX_TEMPLATE_SIZE + 1)
    if (
        extension not in MIME_TYPES
        or not content
        or len(content) > MAX_TEMPLATE_SIZE
        or not valid_signature(extension, content)
    ):
        raise HTTPException(422, "Usa DOCX, PDF, XLSX o PPTX válido de hasta 10 MB")
    await snapshot(db, template, expected_revision)
    template.content, template.extension = content, extension
    template.name = (file.filename or f"formato{extension}")[:240]
    template.mime_type, template.size_bytes = MIME_TYPES[extension], len(content)
    audit(db, user, "template.replaced", template.id, "Original conservado como versión anterior")
    await db.commit()
    return template


@router.get("/templates/{template_id}/versions")
async def versions(
    template_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    await owned_template(template_id, user, db)
    rows = await db.scalars(
        select(TemplateVersion)
        .where(TemplateVersion.template_id == template_id)
        .order_by(TemplateVersion.revision.desc())
        .limit(50)
    )
    return [
        {
            "id": v.id,
            "revision": v.revision,
            "name": v.name,
            "size_bytes": v.size_bytes,
            "created_at": v.created_at,
        }
        for v in rows
    ]


@router.get("/templates/{template_id}/versions/{version_id}/download")
async def download(
    template_id: UUID,
    version_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await owned_template(template_id, user, db)
    version = await db.scalar(
        select(TemplateVersion).where(
            TemplateVersion.id == version_id, TemplateVersion.template_id == template_id
        )
    )
    if not version:
        raise HTTPException(404, "Versión no encontrada")
    return StreamingResponse(
        BytesIO(version.content),
        media_type=version.mime_type,
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{quote(version.name)}"},
    )


@router.post(
    "/templates/{template_id}/versions/{version_id}/restore",
    response_model=InstitutionalTemplateRead,
)
async def restore(
    template_id: UUID,
    version_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    template = await owned_template(template_id, user, db)
    version = await db.scalar(
        select(TemplateVersion).where(
            TemplateVersion.id == version_id, TemplateVersion.template_id == template_id
        )
    )
    if not version:
        raise HTTPException(404, "Versión no encontrada")
    await snapshot(db, template, template.revision)
    for key in ["content", "name", "extension", "mime_type", "size_bytes"]:
        setattr(template, key, getattr(version, key))
    audit(
        db, user, "template.restored", template.id, "Versión anterior restaurada como nueva versión"
    )
    await db.commit()
    return template

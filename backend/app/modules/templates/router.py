from io import BytesIO
from pathlib import Path
from urllib.parse import quote
from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.modules.templates.model import InstitutionalTemplate
from app.modules.templates.schemas import InstitutionalTemplateRead, TemplateRenderRequest
from app.modules.templates.service import MIME_TYPES, render_template
from app.modules.users.model import User

router = APIRouter(prefix="/templates", tags=["templates"])
MAX_TEMPLATE_SIZE = 10 * 1024 * 1024


async def owned_template(
    template_id: UUID, user: User, db: AsyncSession, include_trash: bool = False
) -> InstitutionalTemplate:
    template = await db.scalar(
        select(InstitutionalTemplate).where(
            InstitutionalTemplate.id == template_id, InstitutionalTemplate.owner_id == user.id
        )
    )
    if template is None or (template.trashed and not include_trash):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Formato no encontrado")
    return template


def valid_signature(extension: str, content: bytes) -> bool:
    if extension == ".pdf":
        return content.startswith(b"%PDF")
    return content.startswith(b"PK")


@router.get("", response_model=list[InstitutionalTemplateRead])
async def list_templates(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    trashed: bool = False,
) -> list[InstitutionalTemplate]:
    result = await db.scalars(
        select(InstitutionalTemplate)
        .where(InstitutionalTemplate.owner_id == user.id, InstitutionalTemplate.trashed == trashed)
        .order_by(InstitutionalTemplate.is_default.desc(), InstitutionalTemplate.updated_at.desc())
    )
    return list(result)


@router.post("", response_model=InstitutionalTemplateRead, status_code=status.HTTP_201_CREATED)
async def upload_template(
    file: UploadFile = File(...),
    make_default: bool = Form(False),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InstitutionalTemplate:
    extension = Path(file.filename or "").suffix.lower()
    if extension not in MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Formato no admitido. Usa DOCX, PDF, XLSX o PPTX.",
        )
    content = await file.read(MAX_TEMPLATE_SIZE + 1)
    if not content or len(content) > MAX_TEMPLATE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="El archivo debe pesar como máximo 10 MB.",
        )
    if not valid_signature(extension, content):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="El archivo no coincide con el formato indicado.",
        )
    existing_count = len(
        list(
            await db.scalars(
                select(InstitutionalTemplate.id).where(
                    InstitutionalTemplate.owner_id == user.id,
                    InstitutionalTemplate.trashed.is_(False),
                )
            )
        )
    )
    should_default = make_default or existing_count == 0
    if should_default:
        await db.execute(
            update(InstitutionalTemplate)
            .where(InstitutionalTemplate.owner_id == user.id)
            .values(is_default=False)
        )
    template = InstitutionalTemplate(
        owner_id=user.id,
        name=file.filename or f"formato{extension}",
        extension=extension,
        mime_type=MIME_TYPES[extension],
        size_bytes=len(content),
        content=content,
        is_default=should_default,
    )
    db.add(template)
    await db.commit()
    await db.refresh(template)
    return template


@router.patch("/{template_id}/default", response_model=InstitutionalTemplateRead)
async def set_default_template(
    template_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> InstitutionalTemplate:
    template = await owned_template(template_id, user, db)
    await db.execute(
        update(InstitutionalTemplate)
        .where(InstitutionalTemplate.owner_id == user.id)
        .values(is_default=False)
    )
    template.is_default = True
    await db.commit()
    await db.refresh(template)
    return template


@router.get("/{template_id}/download")
async def download_template(
    template_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> StreamingResponse:
    template = await owned_template(template_id, user, db)
    headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{quote(template.name)}"}
    return StreamingResponse(
        BytesIO(template.content), media_type=template.mime_type, headers=headers
    )


@router.post("/{template_id}/render")
async def render_with_template(
    payload: TemplateRenderRequest,
    template_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    template = await owned_template(template_id, user, db)
    try:
        content, mime_type, filename = render_template(template, payload.artifact)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "No se pudo aplicar este formato. Verifica que el archivo original no esté dañado."
            ),
        ) from exc
    headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{quote(filename)}"}
    return StreamingResponse(BytesIO(content), media_type=mime_type, headers=headers)


@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_template(
    template_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
) -> Response:
    template = await owned_template(template_id, user, db)
    was_default = template.is_default
    template.trashed = True
    template.is_default = False
    await db.flush()
    if was_default:
        replacement = await db.scalar(
            select(InstitutionalTemplate)
            .where(
                InstitutionalTemplate.owner_id == user.id, InstitutionalTemplate.trashed.is_(False)
            )
            .order_by(InstitutionalTemplate.updated_at.desc())
        )
        if replacement is not None:
            replacement.is_default = True
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)

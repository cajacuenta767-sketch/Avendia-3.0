from io import BytesIO
from pathlib import Path
from urllib.parse import quote
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    Response,
    UploadFile,
    status,
)
from fastapi.responses import StreamingResponse
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.modules.evaluation_instruments.model import (
    EvaluationCriterion,
    EvaluationInstrument,
    EvaluationParticipant,
    EvaluationSourceFile,
)
from app.modules.evaluation_instruments.schemas import (
    DraftWrite,
    InstrumentCreate,
    InstrumentListResponse,
    InstrumentPatch,
    InstrumentRead,
    InstrumentSummary,
    SourceExtractionPreview,
    SourceRead,
)
from app.modules.evaluation_instruments.service import (
    MAX_SOURCE_SIZE,
    SourceDocumentError,
    archive_instrument,
    build_checklist_xlsx,
    owned_instrument,
    parse_source_document,
    replace_instrument_composite,
    restore_instrument,
    serialize_instrument,
    serialize_source,
    synchronize_instrument_sources,
)
from app.modules.users.model import User

router = APIRouter(prefix="/evaluation-instruments", tags=["evaluation-instruments"])
XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


def _ensure_editable(instrument: EvaluationInstrument) -> None:
    if instrument.status == "archived":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Restaura el instrumento antes de modificarlo.",
        )


async def _read_upload(file: UploadFile) -> bytes:
    return await file.read(MAX_SOURCE_SIZE + 1)


@router.post("/sources/extract", response_model=SourceExtractionPreview)
async def preview_source_extraction(
    file: UploadFile = File(...),
    _user: User = Depends(get_current_user),
) -> SourceExtractionPreview:
    content = await _read_upload(file)
    try:
        parsed = parse_source_document(file.filename, file.content_type, content)
    except SourceDocumentError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    return parsed.preview()


@router.get("", response_model=InstrumentListResponse)
async def list_instruments(
    kind: str | None = Query(
        default=None,
        pattern=(
            r"^(checklist|rubric|observation|recovery|auxiliary_record|"
            r"learning_sheet|text_questions)$"
        ),
    ),
    roster_id: UUID | None = None,
    student_id: UUID | None = None,
    search: str | None = Query(default=None, max_length=160),
    include_archived: bool = False,
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InstrumentListResponse:
    filters = [EvaluationInstrument.owner_id == user.id]
    if kind:
        filters.append(EvaluationInstrument.kind == kind)
    if roster_id:
        filters.append(EvaluationInstrument.roster_id == roster_id)
    if student_id:
        filters.append(
            EvaluationInstrument.participants.any(EvaluationParticipant.student_id == student_id)
        )
    if search:
        filters.append(EvaluationInstrument.title.ilike(f"%{search.strip()}%"))
    if not include_archived:
        filters.append(EvaluationInstrument.status != "archived")

    participant_counts = (
        select(
            EvaluationParticipant.instrument_id.label("instrument_id"),
            func.count(EvaluationParticipant.id).label("participant_count"),
        )
        .group_by(EvaluationParticipant.instrument_id)
        .subquery()
    )
    criterion_counts = (
        select(
            EvaluationCriterion.instrument_id.label("instrument_id"),
            func.count(EvaluationCriterion.id).label("criterion_count"),
        )
        .group_by(EvaluationCriterion.instrument_id)
        .subquery()
    )
    rows = (
        await db.execute(
            select(
                EvaluationInstrument,
                func.coalesce(participant_counts.c.participant_count, 0),
                func.coalesce(criterion_counts.c.criterion_count, 0),
            )
            .outerjoin(
                participant_counts,
                participant_counts.c.instrument_id == EvaluationInstrument.id,
            )
            .outerjoin(
                criterion_counts,
                criterion_counts.c.instrument_id == EvaluationInstrument.id,
            )
            .where(*filters)
            .order_by(EvaluationInstrument.updated_at.desc())
            .offset(offset)
            .limit(limit)
        )
    ).all()
    total = int(await db.scalar(select(func.count(EvaluationInstrument.id)).where(*filters)) or 0)
    return InstrumentListResponse(
        items=[
            InstrumentSummary(
                id=instrument.id,
                kind=instrument.kind,
                title=instrument.title,
                roster_id=instrument.roster_id,
                status=instrument.status,
                revision=instrument.revision,
                participant_count=int(participant_count),
                criterion_count=int(criterion_count),
                archived_at=instrument.archived_at,
                created_at=instrument.created_at,
                updated_at=instrument.updated_at,
            )
            for instrument, participant_count, criterion_count in rows
        ],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post("", response_model=InstrumentRead, status_code=status.HTTP_201_CREATED)
async def create_instrument(
    payload: InstrumentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InstrumentRead:
    instrument = EvaluationInstrument(
        owner_id=user.id,
        kind=payload.kind,
        title=payload.title,
        roster_id=payload.roster_id,
        status=payload.status,
        general_data_json={},
        settings_json={},
        revision=0,
    )
    db.add(instrument)
    try:
        await db.flush()
        await replace_instrument_composite(instrument, payload, user, db)
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=409,
            detail="No se pudo guardar porque existen datos duplicados en el instrumento.",
        ) from exc
    except Exception:
        await db.rollback()
        raise
    saved = await owned_instrument(instrument.id, user, db, detailed=True)
    return serialize_instrument(saved)


@router.get("/{instrument_id}", response_model=InstrumentRead)
async def get_instrument(
    instrument_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InstrumentRead:
    instrument = await owned_instrument(instrument_id, user, db, detailed=True)
    return serialize_instrument(instrument)


@router.put("/{instrument_id}", response_model=InstrumentRead)
@router.put("/{instrument_id}/draft", response_model=InstrumentRead)
async def save_instrument_draft(
    instrument_id: UUID,
    payload: DraftWrite,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InstrumentRead:
    instrument = await owned_instrument(instrument_id, user, db, for_update=True)
    _ensure_editable(instrument)
    try:
        await replace_instrument_composite(instrument, payload, user, db)
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=409,
            detail="No se pudo guardar porque existen datos duplicados en el instrumento.",
        ) from exc
    except Exception:
        await db.rollback()
        raise
    saved = await owned_instrument(instrument_id, user, db, detailed=True)
    return serialize_instrument(saved)


@router.get("/{instrument_id}/draft", response_model=InstrumentRead)
async def get_instrument_draft(
    instrument_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InstrumentRead:
    instrument = await owned_instrument(instrument_id, user, db, detailed=True)
    if instrument.draft is None:
        raise HTTPException(status_code=404, detail="Borrador no encontrado")
    return serialize_instrument(instrument)


@router.patch("/{instrument_id}", response_model=InstrumentRead)
async def patch_instrument(
    instrument_id: UUID,
    payload: InstrumentPatch,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InstrumentRead:
    instrument = await owned_instrument(instrument_id, user, db, for_update=True)
    _ensure_editable(instrument)
    changes = payload.model_dump(exclude_unset=True)
    for field, value in changes.items():
        setattr(instrument, field, value)
    instrument.revision += 1
    await db.commit()
    saved = await owned_instrument(instrument_id, user, db, detailed=True)
    return serialize_instrument(saved)


@router.delete("/{instrument_id}", status_code=status.HTTP_204_NO_CONTENT)
@router.delete("/{instrument_id}/draft", status_code=status.HTTP_204_NO_CONTENT)
async def archive_instrument_endpoint(
    instrument_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    instrument = await owned_instrument(instrument_id, user, db, for_update=True)
    archive_instrument(instrument)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{instrument_id}/restore", response_model=InstrumentRead)
async def restore_instrument_endpoint(
    instrument_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InstrumentRead:
    instrument = await owned_instrument(instrument_id, user, db, for_update=True)
    restore_instrument(instrument)
    await db.commit()
    saved = await owned_instrument(instrument_id, user, db, detailed=True)
    return serialize_instrument(saved)


@router.get("/{instrument_id}/sources", response_model=list[SourceRead])
async def list_sources(
    instrument_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SourceRead]:
    instrument = await owned_instrument(instrument_id, user, db)
    sources = list(
        await db.scalars(
            select(EvaluationSourceFile)
            .where(EvaluationSourceFile.instrument_id == instrument.id)
            .order_by(EvaluationSourceFile.created_at)
        )
    )
    return [serialize_source(source, instrument_revision=instrument.revision) for source in sources]


@router.post(
    "/{instrument_id}/sources",
    response_model=SourceRead,
    status_code=status.HTTP_201_CREATED,
)
async def upload_source(
    instrument_id: UUID,
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SourceRead:
    instrument = await owned_instrument(instrument_id, user, db, for_update=True)
    _ensure_editable(instrument)
    content = await _read_upload(file)
    try:
        parsed = parse_source_document(file.filename, file.content_type, content)
    except SourceDocumentError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    existing = await db.scalar(
        select(EvaluationSourceFile).where(
            EvaluationSourceFile.instrument_id == instrument.id,
            EvaluationSourceFile.sha256 == parsed.sha256,
        )
    )
    if existing is not None:
        raise HTTPException(status_code=409, detail="Este archivo ya fue añadido al instrumento.")
    source = EvaluationSourceFile(
        instrument_id=instrument.id,
        filename=parsed.filename,
        media_type=parsed.media_type,
        extension=parsed.extension,
        byte_size=parsed.byte_size,
        sha256=parsed.sha256,
        extracted_text=parsed.extracted_text,
        extraction_status="completed",
        original_content=parsed.content,
    )
    db.add(source)
    await db.flush()
    sources = list(
        await db.scalars(
            select(EvaluationSourceFile)
            .where(EvaluationSourceFile.instrument_id == instrument.id)
            .order_by(EvaluationSourceFile.created_at)
        )
    )
    await synchronize_instrument_sources(instrument, sources, db)
    await db.commit()
    await db.refresh(source)
    return serialize_source(source, instrument_revision=instrument.revision)


async def _owned_source(
    instrument_id: UUID,
    source_id: UUID,
    user: User,
    db: AsyncSession,
) -> EvaluationSourceFile:
    instrument = await owned_instrument(instrument_id, user, db)
    source = await db.scalar(
        select(EvaluationSourceFile).where(
            EvaluationSourceFile.id == source_id,
            EvaluationSourceFile.instrument_id == instrument.id,
        )
    )
    if source is None:
        raise HTTPException(status_code=404, detail="Archivo fuente no encontrado")
    return source


@router.get("/{instrument_id}/sources/{source_id}/download")
async def download_source(
    instrument_id: UUID,
    source_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    source = await _owned_source(instrument_id, source_id, user, db)
    headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{quote(source.filename)}"}
    return StreamingResponse(
        BytesIO(source.original_content),
        media_type=source.media_type,
        headers=headers,
    )


@router.delete(
    "/{instrument_id}/sources/{source_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_source(
    instrument_id: UUID,
    source_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    instrument = await owned_instrument(instrument_id, user, db, for_update=True)
    _ensure_editable(instrument)
    source = await db.scalar(
        select(EvaluationSourceFile).where(
            EvaluationSourceFile.id == source_id,
            EvaluationSourceFile.instrument_id == instrument.id,
        )
    )
    if source is None:
        raise HTTPException(status_code=404, detail="Archivo fuente no encontrado")
    await db.delete(source)
    await db.flush()
    remaining_sources = list(
        await db.scalars(
            select(EvaluationSourceFile)
            .where(EvaluationSourceFile.instrument_id == instrument.id)
            .order_by(EvaluationSourceFile.created_at)
        )
    )
    await synchronize_instrument_sources(instrument, remaining_sources, db)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{instrument_id}/exports/checklist.xlsx")
async def export_checklist(
    instrument_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StreamingResponse:
    instrument = await owned_instrument(instrument_id, user, db, detailed=True)
    content = build_checklist_xlsx(instrument)
    stem = re_safe_filename(instrument.title)
    filename = f"lista-cotejo-{stem}.xlsx"
    headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{quote(filename)}"}
    return StreamingResponse(BytesIO(content), media_type=XLSX_MIME, headers=headers)


def re_safe_filename(value: str) -> str:
    cleaned = "-".join(Path(value).name.strip().lower().split())
    cleaned = "".join(char for char in cleaned if char.isalnum() or char in "-_")
    return cleaned[:80] or "instrumento"

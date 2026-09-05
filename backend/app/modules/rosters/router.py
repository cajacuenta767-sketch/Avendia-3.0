from io import BytesIO
from pathlib import Path
from urllib.parse import quote
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    HTTPException,
    Query,
    Response,
    UploadFile,
    status,
)
from fastapi.responses import StreamingResponse
from sqlalchemy import case, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.modules.rosters.model import Roster, Student
from app.modules.rosters.schemas import (
    ImportConfirmRequest,
    ImportConfirmResponse,
    ImportPreviewResponse,
    RosterCreate,
    RosterListResponse,
    RosterRead,
    RosterUpdate,
    StudentCreate,
    StudentListResponse,
    StudentRead,
    StudentReorderRequest,
    StudentUpdate,
)
from app.modules.rosters.service import (
    MAX_IMPORT_SIZE,
    ImportFileError,
    build_preview,
    build_template_xlsx,
    duplicate_fields,
    parse_import_file,
    prepare_import,
)
from app.modules.users.education_catalog import validate_education_selection
from app.modules.users.model import User

router = APIRouter(prefix="/rosters", tags=["rosters"])
XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


def _roster_read(
    roster: Roster,
    *,
    student_count: int = 0,
    active_student_count: int = 0,
) -> RosterRead:
    return RosterRead(
        id=roster.id,
        school_year=roster.school_year,
        institution_name=roster.institution_name,
        modality=roster.modality,
        education_level=roster.education_level,
        grade=roster.grade,
        section=roster.section,
        name=roster.name,
        active=roster.active,
        student_count=student_count,
        active_student_count=active_student_count,
        created_at=roster.created_at,
        updated_at=roster.updated_at,
    )


async def owned_roster(
    roster_id: UUID,
    user: User,
    db: AsyncSession,
    *,
    for_update: bool = False,
) -> Roster:
    query = select(Roster).where(Roster.id == roster_id, Roster.owner_id == user.id)
    if for_update:
        query = query.with_for_update()
    roster = await db.scalar(query)
    if roster is None:
        raise HTTPException(status_code=404, detail="Nómina no encontrada")
    return roster


async def owned_student(
    roster_id: UUID,
    student_id: UUID,
    user: User,
    db: AsyncSession,
) -> tuple[Roster, Student]:
    roster = await owned_roster(roster_id, user, db)
    student = await db.scalar(
        select(Student).where(Student.id == student_id, Student.roster_id == roster.id)
    )
    if student is None:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    return roster, student


def _ensure_active(roster: Roster) -> None:
    if not roster.active:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Reactiva la nómina antes de agregar o importar estudiantes.",
        )


async def _all_students(roster_id: UUID, db: AsyncSession) -> list[Student]:
    return list(
        await db.scalars(
            select(Student)
            .where(Student.roster_id == roster_id)
            .order_by(Student.sort_order, Student.created_at)
        )
    )


def _duplicate_error(fields: list[str]) -> HTTPException:
    labels = {
        "full_name": "nombre completo",
        "internal_code": "código interno",
        "document_number": "documento",
    }
    readable = ", ".join(labels.get(field, field) for field in fields)
    return HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail={
            "message": "El estudiante ya existe en esta nómina.",
            "duplicate_fields": fields,
            "hint": f"Revisa: {readable}.",
        },
    )


@router.get("/template")
@router.get("/imports/template", include_in_schema=False)
async def download_import_template(
    _user: User = Depends(get_current_user),
) -> StreamingResponse:
    filename = "plantilla-estudiantes-avendia.xlsx"
    headers = {"Content-Disposition": f"attachment; filename*=UTF-8''{quote(filename)}"}
    return StreamingResponse(
        BytesIO(build_template_xlsx()),
        media_type=XLSX_MIME,
        headers=headers,
    )


@router.get("", response_model=RosterListResponse)
async def list_rosters(
    search: str | None = Query(default=None, max_length=160),
    school_year: int | None = Query(default=None, ge=2020, le=2100),
    modality: str | None = Query(default=None, pattern=r"^(EBR|EBA|EBE)$"),
    education_level: str | None = Query(default=None, max_length=80),
    grade: str | None = Query(default=None, max_length=64),
    section: str | None = Query(default=None, max_length=32),
    active: bool | None = Query(default=True),
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RosterListResponse:
    filters = [Roster.owner_id == user.id]
    if search:
        pattern = f"%{search.strip()}%"
        filters.append(
            or_(
                Roster.name.ilike(pattern),
                Roster.institution_name.ilike(pattern),
                Roster.grade.ilike(pattern),
                Roster.section.ilike(pattern),
            )
        )
    if school_year is not None:
        filters.append(Roster.school_year == school_year)
    if modality:
        filters.append(Roster.modality == modality)
    if education_level:
        filters.append(Roster.education_level == education_level)
    if grade:
        filters.append(Roster.grade == grade)
    if section:
        filters.append(Roster.section == section)
    if active is not None:
        filters.append(Roster.active.is_(active))

    counts = (
        select(
            Student.roster_id.label("roster_id"),
            func.count(Student.id).label("student_count"),
            func.coalesce(
                func.sum(case((Student.active.is_(True), 1), else_=0)),
                0,
            ).label("active_student_count"),
        )
        .group_by(Student.roster_id)
        .subquery()
    )
    query = (
        select(
            Roster,
            func.coalesce(counts.c.student_count, 0),
            func.coalesce(counts.c.active_student_count, 0),
        )
        .outerjoin(counts, counts.c.roster_id == Roster.id)
        .where(*filters)
        .order_by(Roster.school_year.desc(), Roster.updated_at.desc())
        .offset(offset)
        .limit(limit)
    )
    rows = (await db.execute(query)).all()
    total = int(await db.scalar(select(func.count(Roster.id)).where(*filters)) or 0)
    return RosterListResponse(
        items=[
            _roster_read(
                roster,
                student_count=int(student_count),
                active_student_count=int(active_student_count),
            )
            for roster, student_count, active_student_count in rows
        ],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.post("", response_model=RosterRead, status_code=status.HTTP_201_CREATED)
async def create_roster(
    payload: RosterCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RosterRead:
    try:
        validate_education_selection(payload.modality, payload.education_level, payload.grade)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    roster = Roster(owner_id=user.id, **payload.model_dump())
    db.add(roster)
    await db.commit()
    await db.refresh(roster)
    return _roster_read(roster)


@router.get("/{roster_id}", response_model=RosterRead)
async def get_roster(
    roster_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RosterRead:
    roster = await owned_roster(roster_id, user, db)
    student_count, active_count = (
        await db.execute(
            select(
                func.count(Student.id),
                func.coalesce(
                    func.sum(case((Student.active.is_(True), 1), else_=0)),
                    0,
                ),
            ).where(Student.roster_id == roster.id)
        )
    ).one()
    return _roster_read(
        roster,
        student_count=int(student_count),
        active_student_count=int(active_count),
    )


@router.patch("/{roster_id}", response_model=RosterRead)
async def update_roster(
    roster_id: UUID,
    payload: RosterUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> RosterRead:
    roster = await owned_roster(roster_id, user, db, for_update=True)
    changes = payload.model_dump(exclude_unset=True)
    modality = changes.get("modality", roster.modality)
    education_level = changes.get("education_level", roster.education_level)
    grade = changes.get("grade", roster.grade)
    try:
        validate_education_selection(modality, education_level, grade)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    for field, value in changes.items():
        setattr(roster, field, value)
    await db.commit()
    await db.refresh(roster)
    students = await _all_students(roster.id, db)
    return _roster_read(
        roster,
        student_count=len(students),
        active_student_count=sum(student.active for student in students),
    )


@router.delete("/{roster_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_roster(
    roster_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    roster = await owned_roster(roster_id, user, db, for_update=True)
    roster.active = False
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{roster_id}/students", response_model=StudentListResponse)
async def list_students(
    roster_id: UUID,
    search: str | None = Query(default=None, max_length=160),
    active: bool | None = Query(default=True),
    limit: int = Query(default=200, ge=1, le=5000),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StudentListResponse:
    roster = await owned_roster(roster_id, user, db)
    filters = [Student.roster_id == roster.id]
    if search:
        filters.append(Student.full_name.ilike(f"%{search.strip()}%"))
    if active is not None:
        filters.append(Student.active.is_(active))
    items = list(
        await db.scalars(
            select(Student)
            .where(*filters)
            .order_by(Student.sort_order, Student.full_name)
            .offset(offset)
            .limit(limit)
        )
    )
    total = int(await db.scalar(select(func.count(Student.id)).where(*filters)) or 0)
    return StudentListResponse(items=items, total=total, limit=limit, offset=offset)


@router.post(
    "/{roster_id}/students",
    response_model=StudentRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_student(
    roster_id: UUID,
    payload: StudentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Student:
    roster = await owned_roster(roster_id, user, db, for_update=True)
    _ensure_active(roster)
    existing = await _all_students(roster.id, db)
    conflicts = duplicate_fields(payload, existing)
    if conflicts:
        raise _duplicate_error(conflicts)
    max_order = max((student.sort_order for student in existing), default=-1)
    student = Student(
        roster_id=roster.id,
        sort_order=max_order + 1,
        **payload.model_dump(),
    )
    db.add(student)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise _duplicate_error(["internal_code", "document_number"]) from exc
    await db.refresh(student)
    return student


@router.patch("/{roster_id}/students/{student_id}", response_model=StudentRead)
async def update_student(
    roster_id: UUID,
    student_id: UUID,
    payload: StudentUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Student:
    roster, student = await owned_student(roster_id, student_id, user, db)
    _ensure_active(roster)
    changes = payload.model_dump(exclude_unset=True)
    candidate = StudentCreate(
        full_name=changes.get("full_name", student.full_name),
        internal_code=changes.get("internal_code", student.internal_code),
        document_number=changes.get("document_number", student.document_number),
        sex=changes.get("sex", student.sex),
        notes=changes.get("notes", student.notes),
    )
    existing = [item for item in await _all_students(roster.id, db) if item.id != student.id]
    conflicts = duplicate_fields(candidate, existing)
    if conflicts:
        raise _duplicate_error(conflicts)
    for field, value in changes.items():
        setattr(student, field, value)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise _duplicate_error(["internal_code", "document_number"]) from exc
    await db.refresh(student)
    return student


@router.delete("/{roster_id}/students/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def deactivate_student(
    roster_id: UUID,
    student_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    _, student = await owned_student(roster_id, student_id, user, db)
    student.active = False
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{roster_id}/students/reorder", response_model=StudentListResponse)
async def reorder_students(
    roster_id: UUID,
    payload: StudentReorderRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> StudentListResponse:
    roster = await owned_roster(roster_id, user, db, for_update=True)
    _ensure_active(roster)
    students = list(
        await db.scalars(
            select(Student)
            .where(Student.roster_id == roster.id, Student.active.is_(True))
            .order_by(Student.sort_order)
        )
    )
    by_id = {student.id: student for student in students}
    if set(payload.student_ids) != set(by_id):
        raise HTTPException(
            status_code=422,
            detail=(
                "Envía una vez cada estudiante activo de la nómina; "
                "no incluyas estudiantes retirados o ajenos."
            ),
        )
    for sort_order, student_id in enumerate(payload.student_ids):
        by_id[student_id].sort_order = sort_order
    await db.commit()
    ordered = [by_id[student_id] for student_id in payload.student_ids]
    for student in ordered:
        await db.refresh(student)
    return StudentListResponse(items=ordered, total=len(ordered), limit=len(ordered), offset=0)


@router.post("/{roster_id}/imports/preview", response_model=ImportPreviewResponse)
@router.post(
    "/{roster_id}/import/preview",
    response_model=ImportPreviewResponse,
    include_in_schema=False,
)
async def preview_import(
    roster_id: UUID,
    file: UploadFile = File(...),
    sheet_name: str | None = Form(default=None),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ImportPreviewResponse:
    roster = await owned_roster(roster_id, user, db)
    _ensure_active(roster)
    content = await file.read(MAX_IMPORT_SIZE + 1)
    try:
        table = parse_import_file(
            file.filename,
            file.content_type,
            content,
            sheet_name=sheet_name,
        )
        existing = await _all_students(roster.id, db)
        preview = build_preview(table, existing)
    except ImportFileError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    valid_rows = sum(row.status == "valid" for row in preview.rows)
    duplicate_rows = sum(row.status == "duplicate" for row in preview.rows)
    invalid_rows = sum(row.status == "invalid" for row in preview.rows)
    mapping = preview.suggested_mapping
    return ImportPreviewResponse(
        filename=Path(file.filename or "archivo").name,
        file_type=table.file_type,
        sheet_name=table.sheet_name,
        available_sheets=table.available_sheets,
        columns=preview.columns,
        rows=preview.rows,
        suggested_mapping=mapping,
        total_rows=len(preview.rows),
        valid_rows=valid_rows,
        invalid_rows=invalid_rows,
        duplicate_rows=duplicate_rows,
        ignored_empty_rows=preview.ignored_empty_rows,
        ignored_example_rows=preview.ignored_example_rows,
        requires_mapping=not mapping.full_name and not (mapping.first_names and mapping.last_names),
        warnings=preview.warnings,
    )


@router.post(
    "/{roster_id}/imports/confirm",
    response_model=ImportConfirmResponse,
    status_code=status.HTTP_201_CREATED,
)
@router.post(
    "/{roster_id}/import/confirm",
    response_model=ImportConfirmResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
async def confirm_import(
    roster_id: UUID,
    payload: ImportConfirmRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ImportConfirmResponse:
    roster = await owned_roster(roster_id, user, db, for_update=True)
    _ensure_active(roster)
    existing = await _all_students(roster.id, db)
    try:
        prepared = prepare_import(
            payload.rows,
            payload.mapping,
            existing,
            skip_duplicates=payload.skip_duplicates,
        )
    except ImportFileError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    next_order = max((student.sort_order for student in existing), default=-1) + 1
    students = [
        Student(
            roster_id=roster.id,
            sort_order=next_order + index,
            **candidate.model_dump(),
        )
        for index, candidate in enumerate(prepared.students)
    ]
    db.add_all(students)
    try:
        await db.commit()
    except IntegrityError as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "La nómina cambió durante la confirmación y ahora contiene duplicados. "
                "Vuelve a cargar la vista previa."
            ),
        ) from exc
    for student in students:
        await db.refresh(student)
    return ImportConfirmResponse(
        created_count=len(students),
        skipped_count=prepared.skipped_count,
        students=students,
    )

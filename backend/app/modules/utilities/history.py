from fastapi import APIRouter, Depends, Query
from sqlalchemy import case, func, literal, select, union_all
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.modules.documents.model import Document
from app.modules.documents.schemas import DocumentRead
from app.modules.evaluation_instruments.model import EvaluationInstrument
from app.modules.users.model import User

router = APIRouter(tags=["history"])


@router.get("/history/feed")
async def feed(
    q: str = Query("", max_length=120),
    state: str = "all",
    favorite: bool = False,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    doc_filters = [Document.owner_id == user.id, Document.status != "trashed"]
    eval_filters = [EvaluationInstrument.owner_id == user.id]
    if favorite:
        doc_filters.append(Document.favorite.is_(True))
        eval_filters.append(literal(False))
    if q:
        doc_filters.append(
            Document.title.icontains(q, autoescape=True)
            | Document.document_type.icontains(q, autoescape=True)
        )
        eval_filters.append(
            EvaluationInstrument.title.icontains(q, autoescape=True)
            | EvaluationInstrument.kind.icontains(q, autoescape=True)
        )
    doc_state = case(
        (Document.status == "completed", "Completado"),
        (Document.status == "archived", "Archivado"),
        else_="Borrador",
    )
    eval_state = case(
        (EvaluationInstrument.status == "generated", "Generado"),
        (EvaluationInstrument.status == "archived", "Archivado"),
        else_="Borrador",
    )
    if state != "all":
        doc_filters.append(doc_state == state)
        eval_filters.append(eval_state == state)
    combined = union_all(
        select(
            Document.id.label("id"),
            Document.updated_at.label("updated_at"),
            literal("document").label("source"),
        ).where(*doc_filters),
        select(
            EvaluationInstrument.id.label("id"),
            EvaluationInstrument.updated_at.label("updated_at"),
            literal("evaluation").label("source"),
        ).where(*eval_filters),
    ).subquery()
    total = await db.scalar(select(func.count()).select_from(combined))
    rows = list(
        await db.execute(
            select(combined)
            .order_by(combined.c.updated_at.desc(), combined.c.id)
            .offset((page - 1) * size)
            .limit(size)
        )
    )
    docs = await db.scalars(
        select(Document).where(
            Document.id.in_([r.id for r in rows if r.source == "document"]),
            Document.owner_id == user.id,
        )
    )
    evaluations = await db.scalars(
        select(EvaluationInstrument).where(
            EvaluationInstrument.id.in_([r.id for r in rows if r.source == "evaluation"]),
            EvaluationInstrument.owner_id == user.id,
        )
    )
    return {
        "total": total,
        "documents": [DocumentRead.model_validate(d) for d in docs],
        "instruments": [
            {
                "id": e.id,
                "title": e.title,
                "kind": e.kind,
                "status": e.status,
                "created_at": e.created_at,
                "updated_at": e.updated_at,
            }
            for e in evaluations
        ],
    }


@router.get("/history")
async def history(
    q: str = Query("", max_length=120),
    trashed: bool = False,
    favorite: bool = False,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    filters = [
        Document.owner_id == user.id,
        Document.status == "trashed" if trashed else Document.status != "trashed",
    ]
    if favorite:
        filters.append(Document.favorite.is_(True))
    if q:
        filters.append(
            Document.title.icontains(q, autoescape=True)
            | Document.document_type.icontains(q, autoescape=True)
        )
    rows = await db.scalars(
        select(Document)
        .where(*filters)
        .order_by(Document.updated_at.desc(), Document.id)
        .offset((page - 1) * size)
        .limit(size)
    )
    total = await db.scalar(select(func.count()).select_from(Document).where(*filters))
    return {"items": [DocumentRead.model_validate(row) for row in rows], "total": total}

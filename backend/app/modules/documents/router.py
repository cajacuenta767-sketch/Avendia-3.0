from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.db.session import get_db
from app.modules.documents.model import Document, DocumentRelation, DocumentVersion
from app.modules.documents.schemas import (
    CompatibleDocumentRead,
    DocumentCreate,
    DocumentRead,
    DocumentRelationCreate,
    DocumentRelationRead,
    DocumentUpdate,
)
from app.modules.users.model import User
from app.modules.utilities.router import audit

router = APIRouter(prefix="/documents", tags=["documents"])

COMPATIBLE_ORIGINS: dict[str, set[str]] = {
    "unidad-aprendizaje": {"plan-curricular-anual"},
    "sesion-aprendizaje": {"plan-curricular-anual", "unidad-aprendizaje"},
    "tarea-extension-hogar": {"unidad-aprendizaje", "sesion-aprendizaje"},
    "presentaciones-didacticas": {"unidad-aprendizaje", "sesion-aprendizaje"},
    "rubrica-evaluacion": {"unidad-aprendizaje", "sesion-aprendizaje"},
    "lista-cotejo": {"unidad-aprendizaje", "sesion-aprendizaje"},
    "examen": {"unidad-aprendizaje", "sesion-aprendizaje"},
    "adaptacion-nee-dua": {"plan-atencion", "sesion-aprendizaje"},
    "plan-refuerzo": {"monitorea-avances", "reporte-seguimiento"},
    "informe-tutoria": {"sesiones-tutoria", "plan-tutoria"},
    "correo-familias": {"informe-tutoria", "reporte-seguimiento", "sesion-aprendizaje"},
}


def compatibility_for(document: Document, target_type: str) -> tuple[str, list[str]]:
    preferred = COMPATIBLE_ORIGINS.get(target_type, set())
    reasons: list[str] = []
    source_type = document.document_type.rsplit("/", 1)[-1]
    if source_type in preferred:
        reasons.append("El tipo de documento forma parte de la secuencia pedagógica recomendada.")
        return "compatible", reasons
    metadata = document.metadata_json or {}
    if metadata.get("fields"):
        reasons.append(
            "Puede reutilizar datos institucionales y contexto, pero requiere revisión pedagógica."
        )
        return "review", reasons
    return "not_recommended", ["No contiene bloques compatibles para esta herramienta."]


async def owned_document(
    document_id: UUID, user: User, db: AsyncSession, include_trash: bool = False
) -> Document:
    document = await db.scalar(
        select(Document).where(Document.id == document_id, Document.owner_id == user.id)
    )
    if document is None or (document.status == "trashed" and not include_trash):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    return document


@router.get("", response_model=list[DocumentRead])
async def list_documents(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[Document]:
    result = await db.scalars(
        select(Document)
        .where(Document.owner_id == user.id, Document.status != "trashed")
        .order_by(Document.updated_at.desc())
    )
    return list(result)


@router.get("/compatible/{target_type}", response_model=list[CompatibleDocumentRead])
async def compatible_documents(
    target_type: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rows = await db.scalars(
        select(Document)
        .where(Document.owner_id == user.id, Document.status != "trashed")
        .order_by(Document.updated_at.desc())
        .limit(100)
    )
    response = []
    for document in rows:
        status_value, reasons = compatibility_for(document, target_type)
        data = DocumentRead.model_validate(document).model_dump()
        response.append(
            {**data, "compatibility_status": status_value, "compatibility_reasons": reasons}
        )
    return response


@router.post("/relations", response_model=DocumentRelationRead, status_code=status.HTTP_201_CREATED)
async def create_document_relation(
    payload: DocumentRelationCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DocumentRelation:
    if not payload.consent:
        raise HTTPException(
            status_code=422, detail="Debes confirmar la reutilización de los campos seleccionados."
        )
    parent = await owned_document(payload.parent_document_id, user, db)
    await owned_document(payload.child_document_id, user, db)
    existing = await db.scalar(
        select(DocumentRelation).where(
            DocumentRelation.parent_document_id == parent.id,
            DocumentRelation.child_document_id == payload.child_document_id,
            DocumentRelation.relation_type == payload.relation_type,
        )
    )
    relation = existing or DocumentRelation(
        owner_id=user.id,
        parent_document_id=parent.id,
        child_document_id=payload.child_document_id,
        relation_type=payload.relation_type,
        source_revision=parent.revision,
    )
    relation.source_revision = parent.revision
    relation.inherited_fields_json = payload.inherited_fields
    relation.context_json = payload.context
    relation.compatibility_status = payload.compatibility_status
    relation.consent = payload.consent
    db.add(relation)
    await db.commit()
    await db.refresh(relation)
    return relation


@router.get("/{document_id}/relations", response_model=list[DocumentRelationRead])
async def document_relations(
    document_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[DocumentRelation]:
    await owned_document(document_id, user, db)
    rows = await db.scalars(
        select(DocumentRelation)
        .where(
            DocumentRelation.owner_id == user.id,
            (DocumentRelation.parent_document_id == document_id)
            | (DocumentRelation.child_document_id == document_id),
        )
        .order_by(DocumentRelation.created_at.desc())
    )
    return list(rows)


@router.post("", response_model=DocumentRead, status_code=status.HTTP_201_CREATED)
async def create_document(
    payload: DocumentCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Document:
    document = Document(
        owner_id=user.id,
        title=payload.title,
        document_type=payload.document_type,
        content=payload.content,
        metadata_json=payload.metadata,
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)
    return document


@router.get("/{document_id}", response_model=DocumentRead)
async def get_document(
    document_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Document:
    return await owned_document(document_id, user, db)


@router.patch("/{document_id}", response_model=DocumentRead)
async def update_document(
    document_id: UUID,
    payload: DocumentUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Document:
    document = await owned_document(document_id, user, db)
    changes = payload.model_dump(exclude_unset=True)
    expected = changes.pop("expected_revision", None)
    if expected is not None and expected != document.revision:
        raise HTTPException(409, "El documento cambió en otra sesión. Recarga antes de guardar.")
    previous = document.revision
    claimed = await db.execute(
        update(Document)
        .where(Document.id == document.id, Document.revision == previous)
        .values(revision=previous + 1)
        .execution_options(synchronize_session=False)
    )
    if not claimed.rowcount:
        await db.rollback()
        raise HTTPException(409, "El documento cambió; recarga antes de guardar.")
    db.add(
        DocumentVersion(
            document_id=document.id,
            revision=previous,
            title=document.title,
            content=document.content,
            metadata_json=document.metadata_json,
        )
    )
    document.revision = previous + 1
    if "metadata" in changes:
        changes["metadata_json"] = changes.pop("metadata")
    for field, value in changes.items():
        setattr(document, field, value)
    audit(db, user, "document.updated", document.id, "Nueva versión guardada")
    await db.commit()
    await db.refresh(document)
    return document


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    document = await owned_document(document_id, user, db)
    document.status = "trashed"
    audit(db, user, "document.trashed", document.id, "Documento movido a papelera")
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.get("/{document_id}/versions")
async def versions(
    document_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    await owned_document(document_id, user, db, True)
    rows = await db.scalars(
        select(DocumentVersion)
        .where(DocumentVersion.document_id == document_id)
        .order_by(DocumentVersion.revision.desc())
        .limit(50)
    )
    return [
        {
            "id": row.id,
            "revision": row.revision,
            "title": row.title,
            "content": row.content,
            "created_at": row.created_at,
        }
        for row in rows
    ]


@router.post("/{document_id}/recover", response_model=DocumentRead)
async def recover(
    document_id: UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    document = await owned_document(document_id, user, db, True)
    if document.status == "trashed":
        document.status = "draft"
        audit(db, user, "document.recovered", document.id, "Documento recuperado")
        await db.commit()
    return document


@router.post("/{document_id}/versions/{version_id}/restore", response_model=DocumentRead)
async def restore_version(
    document_id: UUID,
    version_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    document = await owned_document(document_id, user, db)
    version = await db.scalar(
        select(DocumentVersion).where(
            DocumentVersion.id == version_id, DocumentVersion.document_id == document_id
        )
    )
    if not version:
        raise HTTPException(404, "Versión no encontrada")
    return await update_document(
        document_id,
        DocumentUpdate(
            title=version.title,
            content=version.content,
            metadata=version.metadata_json,
            expected_revision=document.revision,
        ),
        user,
        db,
    )

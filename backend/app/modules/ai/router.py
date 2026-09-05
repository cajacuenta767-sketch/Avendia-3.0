from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.config import get_settings
from app.db.session import get_db
from app.modules.admin.model import AISuggestionFeedback
from app.modules.admin.service import (
    InsufficientAICredits,
    ensure_ai_credits,
    record_ai_usage,
    record_generation_quality,
)
from app.modules.ai.presentation_export import build_presentation_pptx
from app.modules.ai.presentation_images import find_presentation_image
from app.modules.ai.schemas import (
    AssistancePreferences,
    CopilotRequest,
    CopilotResponse,
    FieldAssistFeedbackRequest,
    FieldAssistRequest,
    PresentationExportRequest,
    PresentationGenerationRequest,
    PresentationGenerationResponse,
    SequenceOrderingRequest,
    SequenceOrderingResponse,
    WordGroupingRequest,
    WordGroupingResponse,
    WorkflowGenerationRequest,
    WorkflowGenerationResponse,
)
from app.modules.ai.service import (
    AIConfigurationError,
    AIGenerationError,
    generate_copilot_reply,
    generate_field_assist_reply,
    generate_presentation,
    generate_sequence_ordering,
    generate_word_grouping,
    generate_workflow_artifact,
)
from app.modules.users.model import User

router = APIRouter(prefix="/ai/tools", tags=["ai"])


@router.get("/field-assist/preferences", response_model=AssistancePreferences)
async def read_assistance_preferences(
    user: User = Depends(get_current_user),
) -> AssistancePreferences:
    stored = user.assistance_preferences or {}
    return AssistancePreferences.model_validate(stored) if stored else AssistancePreferences()


@router.patch("/field-assist/preferences", response_model=AssistancePreferences)
async def update_assistance_preferences(
    payload: AssistancePreferences,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AssistancePreferences:
    user.assistance_preferences = payload.model_dump() if payload.consent else {}
    await db.commit()
    return payload if payload.consent else AssistancePreferences()


@router.post("/field-assist/feedback", status_code=status.HTTP_201_CREATED)
async def record_field_assist_feedback(
    payload: FieldAssistFeedbackRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict[str, bool]:
    db.add(AISuggestionFeedback(user_id=user.id, **payload.model_dump()))
    await db.commit()
    return {"saved": True}


@router.get("/presentation-images/{asset_id}", response_class=FileResponse)
async def read_presentation_image(asset_id: str) -> FileResponse:
    image_path = find_presentation_image(asset_id)
    if image_path is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Imagen no encontrada")
    media_types = {".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp"}
    return FileResponse(
        image_path,
        media_type=media_types[image_path.suffix],
        headers={"Cache-Control": "public, max-age=31536000, immutable"},
    )


@router.post("/presentaciones-didacticas/export/pptx")
async def export_presentation_pptx(
    payload: PresentationExportRequest,
    _user: User = Depends(get_current_user),
) -> Response:
    file_bytes, filename = build_presentation_pptx(payload)
    return Response(
        content=file_bytes,
        media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{quote(filename)}"},
    )


@router.post("/copilot", response_model=CopilotResponse)
async def create_copilot_reply(
    payload: CopilotRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CopilotResponse:
    try:
        ensure_ai_credits(user, 40)
        result = await generate_copilot_reply(payload)
        await record_ai_usage(
            db,
            user,
            credit_cost=40,
            estimated_tokens=max(1, len(result.reply) // 4),
            tool_id="copilot",
            module=payload.module,
            model=result.model,
        )
        return result
    except InsufficientAICredits as exc:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="No tienes créditos de IA suficientes. Solicita una recarga al administrador.",
        ) from exc
    except AIConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="La generación con IA no está configurada en este entorno.",
        ) from exc
    except AIGenerationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Avendia no pudo responder con Gemini. Inténtalo nuevamente.",
        ) from exc


@router.post("/field-assist", response_model=CopilotResponse)
async def create_field_assist_reply(
    payload: FieldAssistRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> CopilotResponse:
    try:
        ensure_ai_credits(user, 40)
        result = await generate_field_assist_reply(payload)
        await record_ai_usage(
            db,
            user,
            credit_cost=40,
            estimated_tokens=max(1, len(result.reply) // 4),
            tool_id=payload.tool_id,
            module=payload.module,
            model=result.model,
        )
        return result
    except InsufficientAICredits as exc:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="No tienes créditos de IA suficientes. Solicita una recarga al administrador.",
        ) from exc
    except AIConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="La generación con IA no está configurada en este entorno.",
        ) from exc
    except AIGenerationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Avendia no pudo preparar la sugerencia. Inténtalo nuevamente.",
        ) from exc


@router.post("/agrupar-palabras/generate", response_model=WordGroupingResponse)
async def create_word_grouping_activity(
    payload: WordGroupingRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WordGroupingResponse:
    try:
        ensure_ai_credits(user, 120)
        result = await generate_word_grouping(payload)
        await record_ai_usage(
            db,
            user,
            credit_cost=120,
            estimated_tokens=max(1, len(result.model_dump_json()) // 4),
            tool_id="agrupar-palabras",
            module="recursos",
            model=result.model,
        )
        return result
    except InsufficientAICredits as exc:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="No tienes créditos de IA suficientes. Solicita una recarga al administrador.",
        ) from exc
    except AIConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="La generación con IA no está configurada en este entorno.",
        ) from exc
    except AIGenerationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Avendia no pudo generar la actividad. Inténtalo nuevamente.",
        ) from exc


@router.post("/ordenar-bloques/generate", response_model=SequenceOrderingResponse)
async def create_sequence_ordering_activity(
    payload: SequenceOrderingRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SequenceOrderingResponse:
    try:
        ensure_ai_credits(user, 120)
        result = await generate_sequence_ordering(payload)
        await record_ai_usage(
            db,
            user,
            credit_cost=120,
            estimated_tokens=max(1, len(result.model_dump_json()) // 4),
            tool_id="ordenar-bloques",
            module="recursos",
            model=result.model,
        )
        return result
    except InsufficientAICredits as exc:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="No tienes créditos de IA suficientes. Solicita una recarga al administrador.",
        ) from exc
    except AIConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="La generación con IA no está configurada en este entorno.",
        ) from exc
    except AIGenerationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Avendia no pudo generar la secuencia. Inténtalo nuevamente.",
        ) from exc


@router.post("/workflow/generate", response_model=WorkflowGenerationResponse)
async def create_workflow_artifact(
    payload: WorkflowGenerationRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WorkflowGenerationResponse:
    try:
        ensure_ai_credits(user, 300)
        result = await generate_workflow_artifact(payload)
        failed_checks = [
            check.code for check in result.quality_checks if not check.passed
        ]
        await record_generation_quality(
            db,
            user,
            tool_id=payload.tool_id,
            module=payload.module,
            model=result.model,
            outcome="repaired" if result.repair_succeeded else "completed",
            quality_status=result.quality_status,
            repair_attempted=result.repair_attempted,
            repair_succeeded=result.repair_succeeded,
            failed_checks=failed_checks,
            credit_charged=300,
            commit=False,
        )
        await record_ai_usage(
            db,
            user,
            credit_cost=300,
            estimated_tokens=max(1, len(result.model_dump_json()) // 4),
            tool_id=payload.tool_id,
            module=payload.module,
            model=result.model,
        )
        return result
    except InsufficientAICredits as exc:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="No tienes créditos de IA suficientes. Solicita una recarga al administrador.",
        ) from exc
    except AIConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="La generación con IA no está configurada en este entorno.",
        ) from exc
    except AIGenerationError as exc:
        await record_generation_quality(
            db,
            user,
            tool_id=payload.tool_id,
            module=payload.module,
            model=get_settings().gemini_model,
            outcome="rejected",
            quality_status="blocked",
            repair_attempted=True,
            repair_succeeded=False,
            failed_checks=[str(exc)],
            credit_charged=0,
        )
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc


@router.post(
    "/presentaciones-didacticas/generate",
    response_model=PresentationGenerationResponse,
)
async def create_presentation(
    payload: PresentationGenerationRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> PresentationGenerationResponse:
    try:
        ensure_ai_credits(user, 220)
        result = await generate_presentation(payload)
        await record_ai_usage(
            db,
            user,
            credit_cost=220,
            estimated_tokens=max(1, len(result.model_dump_json()) // 4),
            tool_id="presentaciones-didacticas",
            module="recursos",
            model=result.model,
        )
        return result
    except InsufficientAICredits as exc:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="No tienes créditos de IA suficientes. Solicita una recarga al administrador.",
        ) from exc
    except AIConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="La generación con IA no está configurada en este entorno.",
        ) from exc
    except AIGenerationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Avendia no pudo generar la presentación. Inténtalo nuevamente.",
        ) from exc

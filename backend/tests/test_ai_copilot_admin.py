from unittest.mock import AsyncMock
from uuid import UUID

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.db.session import session_factory
from app.main import app
from app.modules.admin.model import AIGenerationQualityEvent
from app.modules.ai.schemas import CopilotResponse, FieldAssistRequest
from app.modules.ai.service import generate_field_assist_reply
from app.modules.users.model import User, UserRole


def _registration(email: str, full_name: str = "María Gómez") -> dict[str, object]:
    return {
        "email": email,
        "full_name": full_name,
        "password": "a-secure-password",
        "dre": "DRE Lima Metropolitana",
        "ugel": "UGEL 03",
        "school_name": "I.E. José María Arguedas",
        "director_name": "Elena Torres",
        "education_modality": "EBR",
        "education_level": "Primaria",
        "grade": "4° de Primaria",
        "section": "A",
        "curricular_area": "Ciencia y Tecnología",
        "school_year": 2026,
    }


async def _register_and_login(client: AsyncClient, email: str) -> tuple[str, dict[str, object]]:
    registration = _registration(email)
    created = await client.post("/api/v1/auth/register", json=registration)
    assert created.status_code == 201
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": registration["password"]},
    )
    assert login.status_code == 200
    return str(login.json()["access_token"]), created.json()


@pytest.mark.asyncio
async def test_copilot_records_real_credit_and_token_usage(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    reply = "Propósito: explica los cambios de estado del agua usando evidencias del entorno."
    generation_mock = AsyncMock(return_value=CopilotResponse(reply=reply, model="gemini-3.6-flash"))
    monkeypatch.setattr("app.modules.ai.router.generate_copilot_reply", generation_mock)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token, _ = await _register_and_login(client, "copilot@example.edu")
        response = await client.post(
            "/api/v1/ai/tools/copilot",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "message": "Redacta el propósito listo para pegar.",
                "tool_title": "Sesión de aprendizaje",
                "module": "planificamos",
                "form_values": {"grado": "4° de Primaria", "tema": "El agua"},
            },
        )
        me = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    assert response.json()["reply"] == reply
    assert me.json()["ai_credits_balance"] == 9_960
    assert me.json()["ai_generations"] == 1
    assert me.json()["ai_tokens_consumed"] == len(reply) // 4
    generation_mock.assert_awaited_once()


@pytest.mark.asyncio
async def test_copilot_rejects_generation_without_enough_credits(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    generation_mock = AsyncMock()
    monkeypatch.setattr("app.modules.ai.router.generate_copilot_reply", generation_mock)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token, created = await _register_and_login(client, "no-credits@example.edu")
        async with session_factory() as db:
            user = await db.get(User, UUID(str(created["id"])))
            assert user is not None
            user.ai_credits_balance = 0
            await db.commit()
        response = await client.post(
            "/api/v1/ai/tools/copilot",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "message": "Ayúdame con esta actividad.",
                "tool_title": "Actividad",
                "module": "recursos",
                "form_values": {},
            },
        )

    assert response.status_code == 402
    generation_mock.assert_not_awaited()


@pytest.mark.asyncio
async def test_field_assist_records_usage_for_the_real_tool(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    reply = "Los estudiantes explicarán la evaporación mediante una experiencia observable."
    generation_mock = AsyncMock(return_value=CopilotResponse(reply=reply, model="gemini-3.6-flash"))
    monkeypatch.setattr("app.modules.ai.router.generate_field_assist_reply", generation_mock)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token, _ = await _register_and_login(client, "field-assist@example.edu")
        response = await client.post(
            "/api/v1/ai/tools/field-assist",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "tool_id": "sesion-aprendizaje",
                "tool_title": "Sesión de aprendizaje",
                "module": "planificamos",
                "field_id": "learning_purpose",
                "field_label": "Propósito de aprendizaje",
                "question1": "¿Qué aprendizaje central debe alcanzar el grupo?",
                "answer1": "Explicar la evaporación",
                "question2": "¿Qué evidencia permitirá observar el logro?",
                "answer2": "Una explicación con evidencias",
                "selected_suggestions": ["Partir de una experiencia cotidiana"],
                "custom_detail": "Usar lenguaje para cuarto grado",
                "current_value": "",
                "form_values": {"level": "Primaria", "grade": "4° de Primaria"},
            },
        )
        me = await client.get(
            "/api/v1/users/me",
            headers={"Authorization": f"Bearer {token}"},
        )

    assert response.status_code == 200
    assert response.json()["reply"] == reply
    assert me.json()["ai_credits_balance"] == 9_960
    generation_mock.assert_awaited_once()
    sent_payload = generation_mock.await_args.args[0]
    assert sent_payload.tool_id == "sesion-aprendizaje"
    assert sent_payload.field_id == "learning_purpose"


@pytest.mark.asyncio
async def test_field_assist_builds_the_final_prompt_on_the_server(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    copilot_mock = AsyncMock(
        return_value=CopilotResponse(reply="Propuesta", model="gemini-3.6-flash")
    )
    monkeypatch.setattr("app.modules.ai.service.generate_copilot_reply", copilot_mock)
    payload = FieldAssistRequest(
        tool_id="plan-curricular-anual",
        tool_title="Plan Curricular Anual",
        module="planificamos",
        field_id="justification",
        field_label="Justificación y necesidades de aprendizaje",
        question1="¿Cuál es la dificultad principal?",
        answer1="Comprensión lectora baja",
        question2="¿Qué logro se espera?",
        answer2="Inferir información",
        selected_suggestions=["Contexto rural"],
        custom_detail="Considerar biblioteca de aula",
        current_value="Texto inicial",
        form_values={"modality": "EBR", "level": "Primaria"},
    )

    await generate_field_assist_reply(payload)

    sent_payload = copilot_mock.await_args.args[0]
    assert "Justificación y necesidades de aprendizaje" in sent_payload.message
    assert "Comprensión lectora baja" in sent_payload.message
    assert "Texto inicial" in sent_payload.message
    assert sent_payload.form_values["modality"] == "EBR"


@pytest.mark.asyncio
async def test_field_assist_preferences_and_feedback_are_persistent() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token, _ = await _register_and_login(client, "field-preferences@example.edu")
        headers = {"Authorization": f"Bearer {token}"}
        saved = await client.patch(
            "/api/v1/ai/tools/field-assist/preferences",
            headers=headers,
            json={"consent": True, "assistance_mode": "guided", "preferred_length": "detailed"},
        )
        assert saved.status_code == 200
        reread = await client.get("/api/v1/ai/tools/field-assist/preferences", headers=headers)
        assert reread.json()["assistance_mode"] == "guided"

        feedback = await client.post(
            "/api/v1/ai/tools/field-assist/feedback",
            headers=headers,
            json={
                "tool_id": "sesion-aprendizaje",
                "field_id": "purpose",
                "outcome": "edited",
                "assistance_mode": "guided",
                "context_fingerprint": "ctx-12345678",
                "edited": True,
            },
        )
        assert feedback.status_code == 201
        assert feedback.json() == {"saved": True}


@pytest.mark.asyncio
async def test_admin_can_review_and_adjust_ai_credits() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        teacher_token, teacher = await _register_and_login(client, "teacher@example.edu")
        _, admin = await _register_and_login(client, "admin@example.edu")
        async with session_factory() as db:
            admin_user = await db.scalar(select(User).where(User.id == UUID(str(admin["id"]))))
            assert admin_user is not None
            admin_user.role = UserRole.ADMIN
            await db.commit()
        admin_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "admin@example.edu", "password": "a-secure-password"},
        )
        admin_token = admin_login.json()["access_token"]

        forbidden = await client.get(
            "/api/v1/admin/ai-usage/summary",
            headers={"Authorization": f"Bearer {teacher_token}"},
        )
        summary = await client.get(
            "/api/v1/admin/ai-usage/summary",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        adjusted = await client.patch(
            f"/api/v1/admin/ai-usage/accounts/{teacher['id']}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"amount": 500, "reason": "Recarga institucional de prueba"},
        )

    assert forbidden.status_code == 403
    assert summary.status_code == 200
    assert summary.json()["users_total"] == 2
    assert adjusted.status_code == 200
    assert adjusted.json()["ai_credits_balance"] == 10_500
    assert adjusted.json()["ai_credits_total"] == 10_500


@pytest.mark.asyncio
async def test_admin_quality_summary_counts_repairs_and_free_rejections() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        _, teacher = await _register_and_login(client, "quality-teacher@example.edu")
        _, admin = await _register_and_login(client, "quality-admin@example.edu")
        teacher_id = UUID(str(teacher["id"]))
        async with session_factory() as db:
            admin_user = await db.scalar(select(User).where(User.id == UUID(str(admin["id"]))))
            assert admin_user is not None
            admin_user.role = UserRole.ADMIN
            db.add_all(
                [
                    AIGenerationQualityEvent(
                        user_id=teacher_id,
                        tool_id="examen",
                        module="evaluamos",
                        model="gemini-test",
                        outcome="completed",
                        quality_status="ready",
                        repair_attempted=False,
                        repair_succeeded=False,
                        failed_checks_json=[],
                        credit_charged=300,
                    ),
                    AIGenerationQualityEvent(
                        user_id=teacher_id,
                        tool_id="examen",
                        module="evaluamos",
                        model="gemini-test",
                        outcome="repaired",
                        quality_status="ready",
                        repair_attempted=True,
                        repair_succeeded=True,
                        failed_checks_json=["exam_scoring"],
                        credit_charged=300,
                    ),
                    AIGenerationQualityEvent(
                        user_id=teacher_id,
                        tool_id="examen",
                        module="evaluamos",
                        model="gemini-test",
                        outcome="rejected",
                        quality_status="blocked",
                        repair_attempted=True,
                        repair_succeeded=False,
                        failed_checks_json=["exam_questions"],
                        credit_charged=0,
                    ),
                    AIGenerationQualityEvent(
                        user_id=teacher_id,
                        tool_id="examen",
                        module="evaluamos",
                        model="gemini-test",
                        outcome="rejected",
                        quality_status="blocked",
                        repair_attempted=True,
                        repair_succeeded=False,
                        failed_checks_json=["exam_key"],
                        credit_charged=40,
                    ),
                ]
            )
            await db.commit()

        admin_login = await client.post(
            "/api/v1/auth/login",
            json={"email": "quality-admin@example.edu", "password": "a-secure-password"},
        )
        response = await client.get(
            "/api/v1/admin/ai-usage/events?module=evaluamos&tool=examen",
            headers={"Authorization": f"Bearer {admin_login.json()['access_token']}"},
        )

    assert response.status_code == 200
    assert response.json()["quality"] == {
        "attempts": 4,
        "completed": 1,
        "repaired": 1,
        "rejected_without_charge": 1,
        "credits_charged": 640,
    }

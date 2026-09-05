from unittest.mock import AsyncMock

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy import select

from app.db.session import session_factory
from app.main import app
from app.modules.admin.model import AIGenerationQualityEvent
from app.modules.ai.schemas import (
    GeneratedWorkflowArtifact,
    GeneratedWorkflowSection,
    GenerationQualityCheck,
    WorkflowActivity,
    WorkflowActivityItem,
    WorkflowArtifactTable,
    WorkflowGenerationRequest,
    WorkflowGenerationResponse,
)
from app.modules.ai.service import (
    AIGenerationError,
    _normalize_activity_for_tool,
    _quality_report,
    _workflow_prompt,
    generate_workflow_artifact,
)
from app.modules.ai.tool_contracts import get_tool_contract, registered_contract_keys


async def _teacher_token(client: AsyncClient) -> str:
    await client.post(
        "/api/v1/auth/register",
        json={
            "email": "workflow@example.edu",
            "full_name": "María Gómez",
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
        },
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "workflow@example.edu", "password": "a-secure-password"},
    )
    return str(login.json()["access_token"])


def _payload() -> dict[str, object]:
    return {
        "tool_id": "sesion-aprendizaje",
        "module": "planificamos",
        "tool_title": "Sesión de Aprendizaje",
        "artifact_type": "documento",
        "fields": {
            "teacher_name": "María Gómez",
            "institution": "I.E. José María Arguedas",
            "modality": "EBR — Educación Básica Regular",
            "level": "Primaria",
            "grade": "4°",
            "topic": "El ciclo del agua",
        },
        "requested_sections": ["Propósito", "Inicio", "Desarrollo", "Cierre"],
    }


@pytest.mark.asyncio
async def test_workflow_generation_requires_authentication() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/ai/tools/workflow/generate", json=_payload())

    assert response.status_code == 401


@pytest.mark.asyncio
async def test_workflow_generation_returns_structured_artifact(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    generated = WorkflowGenerationResponse(
        document_title="Sesión: comprendemos el ciclo del agua",
        executive_summary=(
            "Sesión alineada al nivel de cuarto grado para explicar los cambios del agua "
            "mediante observación, representación y comunicación de conclusiones."
        ),
        sections=[
            GeneratedWorkflowSection(
                title=title,
                narrative=f"Contenido pedagógico completo para {title.lower()} de la sesión.",
                key_points=[f"Acción verificable correspondiente a {title.lower()}"],
            )
            for title in ["Propósito", "Inicio", "Desarrollo", "Cierre"]
        ],
        teacher_recommendations=[
            "Verificar que el vocabulario sea apropiado para el grupo.",
            "Ajustar los tiempos según la respuesta de los estudiantes.",
        ],
        activity=WorkflowActivity(
            mode="tarjetas",
            title="Repaso del ciclo del agua",
            instructions="Gira cada tarjeta y explica la respuesta con tus palabras.",
            items=[
                WorkflowActivityItem(
                    id="item-1",
                    prompt="¿Qué es la evaporación?",
                    answer="El paso del agua líquida a vapor.",
                    hint="Ocurre por efecto del calor.",
                    options=[],
                )
            ],
            word_bank=[],
        ),
        tables=[
            WorkflowArtifactTable(
                title="Secuencia didáctica",
                columns=[
                    "Momento",
                    "Tiempo",
                    "Acciones del docente",
                    "Acciones del estudiante",
                    "Evidencia y retroalimentación",
                ],
                rows=[
                    ["Inicio", "15 min", "Formula el reto.", "Activa saberes.", "Ideas previas."],
                    ["Desarrollo", "55 min", "Acompaña.", "Experimenta.", "Registro."],
                    ["Cierre", "20 min", "Retroalimenta.", "Explica.", "Conclusión."],
                ],
                note="La suma de tiempos corresponde a la duración prevista.",
            )
        ],
        model="gemini-3.6-flash",
    )
    generation_mock = AsyncMock(return_value=generated)
    monkeypatch.setattr("app.modules.ai.router.generate_workflow_artifact", generation_mock)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token = await _teacher_token(client)
        response = await client.post(
            "/api/v1/ai/tools/workflow/generate",
            headers={"Authorization": f"Bearer {token}"},
            json=_payload(),
        )

    assert response.status_code == 200
    assert response.json()["sections"][2]["title"] == "Desarrollo"
    assert response.json()["activity"]["items"][0]["id"] == "item-1"
    assert response.json()["tables"][0]["rows"][1][0] == "Desarrollo"
    assert len(response.json()["teacher_recommendations"]) == 2
    generation_mock.assert_awaited_once()
    async with session_factory() as db:
        quality_event = await db.scalar(select(AIGenerationQualityEvent))
    assert quality_event is not None
    assert quality_event.outcome == "completed"
    assert quality_event.credit_charged == 300


@pytest.mark.asyncio
async def test_workflow_generation_rejects_duplicate_sections() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token = await _teacher_token(client)
        payload = _payload()
        payload["requested_sections"] = ["Inicio", "Inicio"]
        response = await client.post(
            "/api/v1/ai/tools/workflow/generate",
            headers={"Authorization": f"Bearer {token}"},
            json=payload,
        )

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_rejected_workflow_records_quality_without_charging_credits(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    generation_mock = AsyncMock(
        side_effect=AIGenerationError("La reparación automática siguió bloqueada")
    )
    monkeypatch.setattr("app.modules.ai.router.generate_workflow_artifact", generation_mock)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        token = await _teacher_token(client)
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.post(
            "/api/v1/ai/tools/workflow/generate",
            headers=headers,
            json=_payload(),
        )
        me = await client.get("/api/v1/users/me", headers=headers)

    assert response.status_code == 502
    assert me.json()["ai_credits_balance"] == 10_000
    assert me.json()["ai_generations"] == 0
    async with session_factory() as db:
        quality_event = await db.scalar(select(AIGenerationQualityEvent))
    assert quality_event is not None
    assert quality_event.outcome == "rejected"
    assert quality_event.credit_charged == 0


@pytest.mark.parametrize("tool_id", ["crucigramas", "sopas-letras"])
def test_puzzle_workflow_accepts_thirty_words_and_rejects_larger(tool_id: str) -> None:
    from app.modules.ai.schemas import WorkflowGenerationRequest

    base = {
        "tool_id": tool_id,
        "module": "recursos",
        "tool_title": "Actividad de vocabulario",
        "artifact_type": "actividad",
        "fields": {"word_count": "30"},
        "requested_sections": ["Instrucciones"],
    }
    assert WorkflowGenerationRequest.model_validate(base).fields["word_count"] == "30"
    with pytest.raises(ValueError, match="between 5 and 30"):
        WorkflowGenerationRequest.model_validate({**base, "fields": {"word_count": "31"}})


def test_every_dashboard_tool_route_has_a_generation_contract() -> None:
    keys = registered_contract_keys()
    assert len(keys) == 58
    assert len({tool_id for _, tool_id in keys}) == 56
    assert ("planificamos", "tarea-extension-hogar") in keys
    assert ("planificamos", "adaptacion-nee-dua") in keys
    assert ("incluimos", "adaptacion-nee-dua") in keys


def test_homework_contract_requires_an_executable_family_friendly_product() -> None:
    contract = get_tool_contract("planificamos", "tarea-extension-hogar")
    required = " ".join(contract.required_elements).casefold()
    rules = " ".join(contract.quality_rules).casefold()

    assert "instrucciones numeradas" in required
    assert "producto o evidencia" in required
    assert "apoyo familiar opcional" in required
    assert "no resuelve" in rules


@pytest.mark.parametrize(
    ("modality", "level", "territory"),
    [
        ("EBR — Educación Básica Regular", "Primaria", "Urbano"),
        ("EBA — Educación Básica Alternativa", "Avanzado", "Rural"),
        ("EBE — Educación Básica Especial", "Primaria", "Urbano"),
    ],
)
def test_homework_prompt_preserves_modality_level_and_territory(
    modality: str, level: str, territory: str
) -> None:
    raw = _payload()
    raw.update(
        {
            "tool_id": "tarea-extension-hogar",
            "tool_title": "Tarea de Extensión y Hogar",
            "artifact_type": "actividad",
            "fields": {
                "topic": "Cuidado responsable del agua",
                "modality": modality,
                "level": level,
                "territory": territory,
                "grade": "Grupo multigrado" if territory == "Rural" else "4°",
                "family_context": "Recursos accesibles en el hogar y la comunidad",
            },
            "requested_sections": ["Propósito", "Orientaciones", "Autoevaluación"],
        }
    )
    payload = WorkflowGenerationRequest.model_validate(raw)
    prompt = _workflow_prompt(payload)

    assert modality in prompt
    assert level in prompt
    assert territory in prompt
    assert "Recursos accesibles en el hogar y la comunidad" in prompt


def _homework_payload() -> WorkflowGenerationRequest:
    payload = _payload()
    payload.update(
        {
            "tool_id": "tarea-extension-hogar",
            "tool_title": "Tarea de Extensión y Hogar",
            "artifact_type": "actividad",
            "fields": {
                "topic": "Uso responsable del agua",
                "modality": "EBR — Educación Básica Regular",
                "level": "Primaria",
                "grade": "4°",
            },
            "requested_sections": ["Propósito", "Orientaciones", "Autoevaluación"],
        }
    )
    return WorkflowGenerationRequest.model_validate(payload)


def _homework_artifact(item_count: int = 3) -> GeneratedWorkflowArtifact:
    return GeneratedWorkflowArtifact(
        document_title="Cuidamos el agua en nuestro hogar",
        executive_summary=(
            "Tarea breve sobre el uso responsable del agua que permite observar, "
            "registrar y proponer una mejora posible en el hogar."
        ),
        sections=[
            GeneratedWorkflowSection(
                title=title,
                narrative=(
                    f"Desarrollo específico de {title.lower()} sobre el uso responsable del agua."
                ),
                key_points=[f"Acción verificable de {title.lower()} para el estudiante."],
            )
            for title in ["Propósito", "Orientaciones", "Autoevaluación"]
        ],
        teacher_recommendations=[
            "Revisar la evidencia sin calificar el apoyo familiar.",
            "Aceptar dibujos o una explicación oral como alternativa.",
        ],
        activity=WorkflowActivity(
            mode="actividad_guiada",
            title="Mi registro del agua",
            instructions="Lee cada consigna, realiza la acción y registra tu propia evidencia.",
            items=[
                WorkflowActivityItem(
                    id=f"respuesta-{index}",
                    prompt=(
                        f"Observa durante el momento {index} cómo se utiliza el agua "
                        "y registra lo encontrado."
                    ),
                    answer=(
                        f"Registro personal {index} con una observación y una explicación breve."
                    ),
                    hint="Puedes escribir o dibujar lo que observaste.",
                    options=["Cuaderno", "Lápiz"],
                    response_type=("tabla", "dibujo", "desarrollo")[(index - 1) % 3],
                )
                for index in range(1, item_count + 1)
            ],
        ),
        tables=[
            WorkflowArtifactTable(
                title="Ruta de trabajo",
                columns=[
                    "Paso",
                    "Consigna para el estudiante",
                    "Material",
                    "Evidencia",
                    "Apoyo familiar opcional",
                ],
                rows=[
                    [
                        "1",
                        "Observa el uso del agua.",
                        "Cuaderno",
                        "Registro propio",
                        "Ayudar a identificar un momento seguro",
                    ],
                    [
                        "2",
                        "Compara tus registros.",
                        "Lápiz",
                        "Comparación",
                        "Escuchar la explicación",
                    ],
                    [
                        "3",
                        "Propón una mejora.",
                        "Hoja",
                        "Compromiso",
                        "Conversar sin resolver la tarea",
                    ],
                ],
            )
        ],
    )


def test_homework_normalization_creates_a_real_resolvable_sheet() -> None:
    normalized = _normalize_activity_for_tool(_homework_artifact(), _homework_payload())

    assert normalized.activity is not None
    assert normalized.activity.mode == "ficha_hogar"
    assert [item.id for item in normalized.activity.items] == ["item-1", "item-2", "item-3"]
    assert all(item.answer for item in normalized.activity.items)


def test_homework_rejects_an_explanatory_document_without_enough_tasks() -> None:
    with pytest.raises(AIGenerationError, match="entre 3 y 6 actividades"):
        _normalize_activity_for_tool(_homework_artifact(item_count=2), _homework_payload())


def test_homework_quality_gate_marks_missing_student_work_as_blocked() -> None:
    artifact = _homework_artifact()
    artifact.activity = None
    checks, warnings, status = _quality_report(
        artifact,
        _homework_payload(),
        get_tool_contract("planificamos", "tarea-extension-hogar"),
    )

    assert status == "blocked"
    assert warnings
    assert any(check.code == "homework_products" and not check.passed for check in checks)
    assert all(check.severity in {"P0", "P1", "P2"} for check in checks)


def test_homework_quality_gate_rejects_one_generic_response_space_for_every_task() -> None:
    artifact = _homework_artifact()
    assert artifact.activity is not None
    artifact.activity = artifact.activity.model_copy(
        update={
            "items": [
                item.model_copy(update={"response_type": "texto_breve"})
                for item in artifact.activity.items
            ]
        }
    )
    checks, _, status = _quality_report(
        artifact,
        _homework_payload(),
        get_tool_contract("planificamos", "tarea-extension-hogar"),
    )
    assert status == "blocked"
    assert not next(check for check in checks if check.code == "homework_response_formats").passed


def test_quality_gate_rejects_a_generic_table_for_a_specialized_tool() -> None:
    artifact = _homework_artifact()
    artifact.tables = [
        WorkflowArtifactTable(
            title="Tabla genérica",
            columns=["Elemento", "Descripción"],
            rows=[["Tarea", "Texto general"]],
        )
    ]
    checks, _, status = _quality_report(
        artifact,
        _homework_payload(),
        get_tool_contract("planificamos", "tarea-extension-hogar"),
    )

    assert status == "blocked"
    assert any(check.code == "table_contract" and not check.passed for check in checks)


def _questions_payload() -> WorkflowGenerationRequest:
    return WorkflowGenerationRequest.model_validate(
        {
            "tool_id": "preguntas-texto",
            "module": "evaluamos",
            "tool_title": "Preguntas sobre texto",
            "artifact_type": "instrumento",
            "fields": {
                "reading_title": "El ciclo del agua",
                "source_text": "El agua recibe calor, se evapora, forma nubes y luego se condensa.",
                "literal_count": "2",
                "inferential_count": "1",
                "critical_count": "1",
                "question_format": "Mixtas",
            },
            "requested_sections": [
                "Lectura o síntesis",
                "Preguntas literales",
                "Preguntas inferenciales",
                "Preguntas crítico-reflexivas",
                "Respuestas esperadas",
                "Justificación de respuestas",
                "Criterios",
                "Retroalimentación",
            ],
        }
    )


def _questions_artifact() -> GeneratedWorkflowArtifact:
    section_points = [
        ["El agua recibe calor, se evapora, forma nubes y luego se condensa."],
        [
            "[Opción múltiple] ¿Qué recibe el agua para evaporarse? | "
            "A) Calor | B) Tierra | C) Sal | D) Hielo",
            "[Texto breve] ¿Qué ocurre luego con el vapor?",
        ],
        ["[Desarrollo] ¿Por qué se forman las nubes después de la evaporación?"],
        ["[Tabla] ¿Cómo aplicarías este conocimiento para cuidar el agua?"],
        ["Recibe calor.", "El vapor se condensa.", "El vapor se enfría.", "Respuesta sustentada."],
        ["Cada respuesta se contrasta con una idea explícita o inferida de la fuente."],
        ["Ubica información, infiere relaciones y sustenta una opinión con evidencia."],
        ["Indicar la evidencia encontrada y proponer una relectura focalizada."],
    ]
    return GeneratedWorkflowArtifact(
        document_title="Preguntas sobre el ciclo del agua",
        executive_summary=(
            "Instrumento de comprensión que usa una fuente concreta y separa la guía docente."
        ),
        sections=[
            GeneratedWorkflowSection(
                title=title,
                narrative=f"Desarrollo pedagógico suficiente para el apartado {title.lower()}.",
                key_points=points,
            )
            for title, points in zip(
                _questions_payload().requested_sections, section_points, strict=True
            )
        ],
        teacher_recommendations=[
            "No revelar la clave antes de recoger las respuestas.",
            "Retroalimentar con una evidencia específica del texto.",
        ],
        tables=[
            WorkflowArtifactTable(
                title="Banco de preguntas",
                columns=[
                    "N°",
                    "Nivel literal, inferencial o crítico",
                    "Pregunta",
                    "Respuesta esperada",
                    "Justificación en el texto",
                    "Criterio",
                ],
                rows=[
                    [
                        "1",
                        "Literal",
                        "¿Qué recibe el agua?",
                        "Calor",
                        "Primera oración",
                        "Ubica información",
                    ]
                ],
            )
        ],
    )


def test_text_questions_quality_gate_enforces_distribution_key_and_source() -> None:
    artifact = _questions_artifact()
    checks, _, status = _quality_report(
        artifact,
        _questions_payload(),
        get_tool_contract("evaluamos", "preguntas-texto"),
    )
    assert status in {"ready", "review"}
    assert all(
        next(check for check in checks if check.code == code).passed
        for code in (
            "question_distribution",
            "answer_key",
            "source_grounding",
            "source_question_formats",
        )
    )

    artifact.sections[1] = artifact.sections[1].model_copy(
        update={"key_points": ["[Texto breve] ¿Qué recibe el agua para evaporarse?"]}
    )
    checks, _, status = _quality_report(
        artifact,
        _questions_payload(),
        get_tool_contract("evaluamos", "preguntas-texto"),
    )
    assert status == "blocked"
    assert any(check.code == "question_distribution" and not check.passed for check in checks)


def test_learning_sheet_quality_gate_requires_real_tasks_and_complete_key() -> None:
    payload = WorkflowGenerationRequest.model_validate(
        {
            "tool_id": "ficha-aprendizaje",
            "module": "evaluamos",
            "tool_title": "Ficha de aprendizaje",
            "artifact_type": "recurso",
            "fields": {"topic": "Cuidamos el agua", "activity_count": "5"},
            "requested_sections": [
                "Propósito e instrucciones",
                "Activación",
                "Práctica guiada",
                "Aplicación",
                "Reto",
                "Metacognición",
                "Clave de respuestas",
            ],
        }
    )
    point_counts = (1, 1, 2, 1, 1, 1, 4)
    artifact = GeneratedWorkflowArtifact(
        document_title="Ficha de aprendizaje: cuidamos el agua",
        executive_summary=(
            "Ficha resoluble con actividades graduadas, espacios de respuesta y guía docente."
        ),
        sections=[
            GeneratedWorkflowSection(
                title=title,
                narrative=(
                    f"Orientación contextualizada y suficiente para desarrollar {title.lower()}."
                ),
                key_points=[
                    f"Consigna o pauta verificable {index + 1} de {title}."
                    for index in range(count)
                ],
            )
            for title, count in zip(payload.requested_sections, point_counts, strict=True)
        ],
        teacher_recommendations=[
            "Observar el proceso y registrar evidencia.",
            "Usar la clave únicamente después de la resolución.",
        ],
        tables=[
            WorkflowArtifactTable(
                title="Actividades de la ficha",
                columns=["N°", "Consigna", "Tipo de respuesta", "Espacio o recurso", "Criterio"],
                rows=[
                    [
                        "1",
                        "Explica el uso responsable.",
                        "Abierta",
                        "Tres líneas",
                        "Propone una acción",
                    ]
                ],
            )
        ],
    )
    checks, _, status = _quality_report(
        artifact,
        payload,
        get_tool_contract("evaluamos", "ficha-aprendizaje"),
    )
    assert status == "blocked"
    assert any(check.code == "worksheet_key" and not check.passed for check in checks)


def test_exam_quality_gate_matches_questions_key_matrix_and_total_score() -> None:
    payload = WorkflowGenerationRequest.model_validate(
        {
            "tool_id": "examen",
            "module": "evaluamos",
            "tool_title": "Examen",
            "artifact_type": "instrumento",
            "fields": {
                "topics": "Ciclo del agua",
                "question_count": "5",
                "total_score": "20",
                "difficulty": "Mixto",
                "question_formats": (
                    "Opción múltiple, Respuesta corta, Relacionar, Verdadero/Falso, Desarrollo"
                ),
            },
            "requested_sections": [
                "Instrucciones",
                "Matriz de especificaciones",
                "Preguntas",
                "Puntaje",
                "Clave de respuestas",
                "Criterios de corrección",
            ],
        }
    )
    points = [
        ["Lee cada pregunta y registra el procedimiento cuando corresponda."],
        ["La matriz distribuye contenidos, niveles cognitivos, formatos y puntajes."],
        [
            "[Opción múltiple] ¿Qué cambio de estado ocurre durante la evaporación? | "
            "A) Sólido a líquido | B) Líquido a gas | C) Gas a sólido | "
            "D) Líquido a sólido",
            "[Respuesta corta] Explica por qué el calor interviene en la evaporación.",
            "[Relacionar] Relaciona los procesos del ciclo del agua. | "
            "Columna A: 1) Evaporación; 2) Condensación | "
            "Columna B: a) Forma nubes; b) Transforma líquido en vapor",
            "[Verdadero/Falso] El consumo responsable de agua contribuye a su conservación.",
            "[Desarrollo] Propón una acción sustentada para cuidar el agua.",
        ],
        ["Preguntas 1 y 2: 3 puntos; preguntas 3 y 4: 4 puntos; pregunta 5: 6 puntos."],
        [
            "1. Líquido a gas",
            "2. Aporta energía",
            "3. Condensación",
            "4. Procedimiento válido",
            "5. Propuesta sustentada",
        ],
        ["Exactitud conceptual, procedimiento, uso de evidencia y argumentación."],
    ]
    artifact = GeneratedWorkflowArtifact(
        document_title="Examen sobre el ciclo del agua",
        executive_summary=(
            "Evaluación aplicable con cinco reactivos, matriz de cobertura y clave separada."
        ),
        sections=[
            GeneratedWorkflowSection(
                title=title,
                narrative=f"Contenido completo y contextualizado para el apartado {title.lower()}.",
                key_points=key_points,
            )
            for title, key_points in zip(payload.requested_sections, points, strict=True)
        ],
        teacher_recommendations=[
            "Aplicar los apoyos declarados sin reducir el criterio.",
            "Retroalimentar primero el procedimiento y luego la respuesta.",
        ],
        tables=[
            WorkflowArtifactTable(
                title="Matriz de especificaciones",
                columns=[
                    "Competencia o tema",
                    "Nivel cognitivo",
                    "Tipo de pregunta",
                    "Cantidad",
                    "Puntaje",
                ],
                rows=[
                    ["Ciclo del agua", "Literal", "Opción múltiple", "1", "3"],
                    ["Ciclo del agua", "Literal", "Respuesta corta", "1", "3"],
                    ["Ciclo del agua", "Inferencial", "Relacionar", "1", "4"],
                    ["Cuidado del agua", "Inferencial", "Verdadero/Falso", "1", "4"],
                    ["Cuidado del agua", "Crítico", "Desarrollo", "1", "6"],
                ],
            )
        ],
    )
    checks, _, status = _quality_report(
        artifact,
        payload,
        get_tool_contract("evaluamos", "examen"),
    )
    assert status in {"ready", "review"}
    assert all(
        next(check for check in checks if check.code == code).passed
        for code in (
            "exam_questions",
            "exam_key",
            "exam_formats",
            "exam_scoring",
            "exam_blueprint_alignment",
            "exam_cognitive_distribution",
        )
    )

    original_question = artifact.sections[2].key_points[0]
    artifact.sections[2].key_points[0] = "¿Qué cambio de estado ocurre durante la evaporación?"
    checks, _, status = _quality_report(
        artifact,
        payload,
        get_tool_contract("evaluamos", "examen"),
    )
    assert status == "blocked"
    assert any(check.code == "exam_formats" and not check.passed for check in checks)
    artifact.sections[2].key_points[0] = original_question

    artifact.tables[0].rows[4][4] = "5"
    checks, _, status = _quality_report(
        artifact,
        payload,
        get_tool_contract("evaluamos", "examen"),
    )
    assert status == "blocked"
    assert any(check.code == "exam_scoring" and not check.passed for check in checks)


def test_unknown_workflow_tool_is_rejected() -> None:
    from app.modules.ai.schemas import WorkflowGenerationRequest

    payload = _payload()
    payload["tool_id"] = "herramienta-inexistente"
    with pytest.raises(ValueError, match="No generation contract registered"):
        WorkflowGenerationRequest.model_validate(payload)


def test_generated_table_rejects_rows_with_a_different_column_count() -> None:
    with pytest.raises(ValueError, match="match the column count"):
        WorkflowArtifactTable(
            title="Matriz incompleta",
            columns=["Criterio", "Sí", "No"],
            rows=[["Explica con evidencias", "Sí"]],
        )


def test_priority_workflow_prompt_requires_its_specific_matrix() -> None:
    prompt = _workflow_prompt(WorkflowGenerationRequest.model_validate(_payload()))

    assert "TABLAS ESTRUCTURADAS OBLIGATORIAS" in prompt
    assert "Secuencia didáctica" in prompt
    assert "Acciones del docente" in prompt
    assert "exactamente la misma cantidad de celdas" in prompt


def test_plan_anual_keeps_its_specialized_seventeen_table_renderer() -> None:
    payload = _payload()
    payload.update({"tool_id": "plan-curricular-anual", "tool_title": "Plan Curricular Anual"})
    prompt = _workflow_prompt(WorkflowGenerationRequest.model_validate(payload))

    assert "TABLAS ESTRUCTURADAS OBLIGATORIAS" in prompt
    assert "Calendarización de unidades" in prompt
    assert "Referencias y bibliografía" in prompt
    assert prompt.count("- ") >= 17


def test_plan_anual_accepts_seventeen_generated_matrices() -> None:
    artifact = GeneratedWorkflowArtifact(
        document_title="Plan Curricular Anual contextualizado",
        executive_summary=(
            "Plan anual contextualizado que articula las decisiones pedagógicas "
            "aportadas por el equipo docente."
        ),
        sections=[
            GeneratedWorkflowSection(
                title="Datos informativos",
                narrative="Contenido específico del plan anual.",
                key_points=["Decisión verificable."],
            )
        ],
        teacher_recommendations=["Revisar las evidencias.", "Ajustar el cronograma."],
        tables=[
            WorkflowArtifactTable(
                title=f"Matriz anual {index}",
                columns=["Elemento", "Decisión"],
                rows=[[f"Elemento {index}", f"Decisión {index}"]],
            )
            for index in range(1, 18)
        ],
    )

    assert len(artifact.tables) == 17


def _puzzle_artifact(answers: list[str]) -> GeneratedWorkflowArtifact:
    return GeneratedWorkflowArtifact(
        document_title="Sopa de letras del ambiente",
        executive_summary="Actividad de vocabulario ambiental preparada para el grupo indicado.",
        sections=[
            GeneratedWorkflowSection(
                title="Instrucciones",
                narrative="Encuentra cada palabra y explica su relación con el ambiente.",
                key_points=["Observa horizontal, vertical y diagonalmente."],
            )
        ],
        teacher_recommendations=["Modelar un ejemplo.", "Revisar las definiciones."],
        activity=WorkflowActivity(
            mode="recurso",
            title="Vocabulario ambiental",
            instructions="Encuentra y explica.",
            items=[
                WorkflowActivityItem(
                    id=f"respuesta-{index}",
                    prompt=f"Pista {index}",
                    answer=answer,
                    hint="Relaciona la palabra con el tema.",
                )
                for index, answer in enumerate(answers, start=1)
            ],
        ),
    )


def test_word_search_normalizes_unique_answers_and_stable_ids() -> None:
    payload = _payload()
    payload.update(
        {
            "tool_id": "sopas-letras",
            "module": "recursos",
            "tool_title": "Sopa de letras",
            "artifact_type": "actividad",
            "fields": {"topic": "Ambiente", "word_count": "5"},
            "requested_sections": ["Instrucciones"],
        }
    )
    normalized = _normalize_activity_for_tool(
        _puzzle_artifact(["árbol", "agua", "suelo", "clima", "energía"]),
        WorkflowGenerationRequest.model_validate(payload),
    )

    assert normalized.activity is not None
    assert normalized.activity.mode == "sopa"
    assert normalized.activity.items[0].id == "item-1"
    assert normalized.activity.items[0].answer == "ARBOL"
    assert normalized.activity.word_bank == ["ARBOL", "AGUA", "SUELO", "CLIMA", "ENERGIA"]

    request = WorkflowGenerationRequest.model_validate(payload)
    checks, _, status = _quality_report(
        normalized,
        request,
        get_tool_contract("recursos", "sopas-letras"),
    )
    assert status in {"ready", "review"}
    assert next(check for check in checks if check.code == "resource_semantics").passed

    invalid_activity = normalized.activity.model_copy(update={"word_bank": ["ARBOL"]})
    invalid = normalized.model_copy(update={"activity": invalid_activity})
    checks, _, status = _quality_report(
        invalid,
        request,
        get_tool_contract("recursos", "sopas-letras"),
    )
    assert status == "blocked"
    assert not next(check for check in checks if check.code == "resource_semantics").passed


def test_flashcards_enforce_requested_quantity_and_stable_ids() -> None:
    payload = _payload()
    payload.update(
        {
            "tool_id": "tarjetas-estudio",
            "module": "recursos",
            "tool_title": "Tarjetas de estudio",
            "artifact_type": "actividad",
            "fields": {"topic": "Ambiente", "card_count": "5"},
            "requested_sections": ["Instrucciones"],
        }
    )
    normalized = _normalize_activity_for_tool(
        _puzzle_artifact(["Bosque", "Agua", "Suelo", "Clima", "Energía"]),
        WorkflowGenerationRequest.model_validate(payload),
    )

    assert normalized.activity is not None
    assert normalized.activity.mode == "tarjetas"
    assert [item.id for item in normalized.activity.items] == [
        f"item-{index}" for index in range(1, 6)
    ]


def test_flashcards_reject_wrong_requested_quantity() -> None:
    payload = _payload()
    payload.update(
        {
            "tool_id": "tarjetas-estudio",
            "module": "recursos",
            "tool_title": "Tarjetas de estudio",
            "artifact_type": "actividad",
            "fields": {"topic": "Ambiente", "card_count": "6"},
            "requested_sections": ["Instrucciones"],
        }
    )
    with pytest.raises(AIGenerationError, match="cantidad de elementos"):
        _normalize_activity_for_tool(
            _puzzle_artifact(["Bosque", "Agua", "Suelo", "Clima", "Energía"]),
            WorkflowGenerationRequest.model_validate(payload),
        )


def test_crossword_rejects_repeated_answers() -> None:
    payload = _payload()
    payload.update(
        {
            "tool_id": "crucigramas",
            "module": "recursos",
            "tool_title": "Crucigrama",
            "artifact_type": "actividad",
            "fields": {"topic": "Ambiente", "word_count": "5"},
            "requested_sections": ["Instrucciones"],
        }
    )

    with pytest.raises(AIGenerationError, match="repitió palabras"):
        _normalize_activity_for_tool(
            _puzzle_artifact(["árbol", "ARBOL", "suelo", "clima", "energía"]),
            WorkflowGenerationRequest.model_validate(payload),
        )


def _semantic_artifact(
    section_titles: list[str], tables: list[WorkflowArtifactTable]
) -> GeneratedWorkflowArtifact:
    return GeneratedWorkflowArtifact(
        document_title="Documento pedagógico verificable",
        executive_summary=(
            "Documento específico que transforma los datos docentes en decisiones, "
            "evidencias y acciones pedagógicas verificables."
        ),
        sections=[
            GeneratedWorkflowSection(
                title=title,
                narrative=f"Desarrollo contextual y aplicable de {title.lower()}.",
                key_points=[f"Acción observable y verificable para {title.lower()}"],
            )
            for title in section_titles
        ],
        teacher_recommendations=[
            "Contrastar el resultado con evidencias recientes.",
            "Registrar el siguiente ajuste pedagógico.",
        ],
        tables=tables,
    )


def test_session_quality_gate_checks_moments_actions_and_total_time() -> None:
    payload = WorkflowGenerationRequest.model_validate(
        {
            "tool_id": "sesion-aprendizaje",
            "module": "planificamos",
            "tool_title": "Sesión de aprendizaje",
            "artifact_type": "documento",
            "fields": {"session_topic": "Fracciones equivalentes", "duration_minutes": "90"},
            "requested_sections": ["Inicio", "Desarrollo", "Cierre"],
        }
    )
    table = WorkflowArtifactTable(
        title="Secuencia didáctica",
        columns=[
            "Momento",
            "Tiempo",
            "Acciones del docente",
            "Acciones del estudiante",
            "Evidencia y retroalimentación",
        ],
        rows=[
            [
                "Inicio",
                "15 min",
                "Presenta un reparto concreto.",
                "Explican sus ideas previas.",
                "Hipótesis registradas.",
            ],
            [
                "Desarrollo",
                "55 min",
                "Modela y formula preguntas.",
                "Representan y comparan fracciones.",
                "Producciones con comentarios.",
            ],
            [
                "Cierre",
                "20 min",
                "Contrasta estrategias y retroalimenta.",
                "Justifican una equivalencia.",
                "Ticket de salida.",
            ],
        ],
    )
    artifact = _semantic_artifact(payload.requested_sections, [table])
    checks, _, status = _quality_report(
        artifact, payload, get_tool_contract("planificamos", "sesion-aprendizaje")
    )
    assert next(check for check in checks if check.code == "session_sequence").passed
    assert status in {"ready", "review"}

    artifact.tables[0].rows[1][1] = "35 min"
    checks, _, status = _quality_report(
        artifact, payload, get_tool_contract("planificamos", "sesion-aprendizaje")
    )
    assert status == "blocked"
    assert not next(check for check in checks if check.code == "session_sequence").passed


def test_unit_quality_gate_requires_the_requested_number_of_distinct_sessions() -> None:
    payload = WorkflowGenerationRequest.model_validate(
        {
            "tool_id": "unidad-aprendizaje",
            "module": "planificamos",
            "tool_title": "Unidad de aprendizaje",
            "artifact_type": "documento",
            "fields": {"unit_title": "Cuidamos el agua", "session_count": "2"},
            "requested_sections": ["Situación significativa"],
        }
    )
    table = WorkflowArtifactTable(
        title="Secuencia de sesiones",
        columns=["Sesión", "Propósito", "Actividad central", "Evidencia", "Criterio", "Tiempo"],
        rows=[
            ["1", "Reconocer usos", "Mapa de consumo", "Registro", "Identifica usos", "90 min"],
            [
                "2",
                "Proponer mejoras",
                "Diseño de acuerdos",
                "Afiche",
                "Sustenta acciones",
                "90 min",
            ],
        ],
    )
    artifact = _semantic_artifact(payload.requested_sections, [table])
    checks, _, _ = _quality_report(
        artifact, payload, get_tool_contract("planificamos", "unidad-aprendizaje")
    )
    assert next(check for check in checks if check.code == "unit_session_sequence").passed

    artifact.tables[0].rows.pop()
    checks, _, status = _quality_report(
        artifact, payload, get_tool_contract("planificamos", "unidad-aprendizaje")
    )
    assert status == "blocked"


def test_annual_plan_quality_gate_matches_calendar_to_requested_units() -> None:
    payload = WorkflowGenerationRequest.model_validate(
        {
            "tool_id": "plan-curricular-anual",
            "module": "planificamos",
            "tool_title": "Plan curricular anual",
            "artifact_type": "documento",
            "fields": {"unit_count": "2", "school_year": "2026"},
            "requested_sections": ["Calendarización anual"],
        }
    )
    tables = [
        WorkflowArtifactTable(
            title="Diagnóstico de aprendizaje",
            columns=[
                "Área o competencia",
                "Evidencia diagnóstica",
                "Inicio",
                "En proceso",
                "Logro esperado",
                "Decisión pedagógica",
            ],
            rows=[
                [
                    "Matemática",
                    "Resoluciones",
                    "Por recoger",
                    "Por recoger",
                    "Por recoger",
                    "Diagnosticar",
                ]
            ],
        ),
        WorkflowArtifactTable(
            title="Estándares priorizados",
            columns=[
                "Área",
                "Competencia",
                "Capacidad",
                "Estándar o desempeño esperado",
                "Evidencia anual",
            ],
            rows=[["Matemática", "Cantidad", "Representa", "Resuelve problemas", "Portafolio"]],
        ),
        WorkflowArtifactTable(
            title="Calendarización de unidades",
            columns=[
                "Periodo",
                "Unidad",
                "Título contextualizado",
                "Situación significativa",
                "Competencias",
                "Producto o evidencia",
                "Duración o fechas",
            ],
            rows=[
                ["I", "1", "Nuestra agua", "Consumo local", "Cantidad", "Mapa", "4 semanas"],
                ["II", "2", "Cuidamos el río", "Contaminación", "Datos", "Campaña", "4 semanas"],
            ],
        ),
    ]
    artifact = _semantic_artifact(payload.requested_sections, tables)
    checks, _, _ = _quality_report(
        artifact, payload, get_tool_contract("planificamos", "plan-curricular-anual")
    )
    assert next(check for check in checks if check.code == "annual_calendar").passed


def test_analytics_rejects_incompatible_percentages() -> None:
    payload = WorkflowGenerationRequest.model_validate(
        {
            "tool_id": "analytics-alertas",
            "module": "evaluamos",
            "tool_title": "Analítica y alertas",
            "artifact_type": "analisis",
            "fields": {"approved_percent": "70", "risk_percent": "45"},
            "requested_sections": ["Alertas priorizadas"],
        }
    )
    table = WorkflowArtifactTable(
        title="Casos y tendencias",
        columns=[
            "Indicador",
            "Evidencia disponible",
            "Tendencia",
            "Grupo o caso",
            "Nivel de atención",
            "Acción pedagógica",
            "Responsable",
            "Fecha de revisión",
        ],
        rows=[
            [
                "Lectura",
                "Producciones",
                "Descendente",
                "Grupo A",
                "Alta",
                "Lectura guiada",
                "Docente",
                "15/09/2026",
            ]
        ],
    )
    artifact = _semantic_artifact(payload.requested_sections, [table])
    checks, _, status = _quality_report(
        artifact, payload, get_tool_contract("evaluamos", "analytics-alertas")
    )
    assert status == "blocked"
    assert not next(check for check in checks if check.code == "analytics_decisions").passed


def test_inclusion_rejects_deterministic_or_excluding_language() -> None:
    payload = WorkflowGenerationRequest.model_validate(
        {
            "tool_id": "estrategias-inclusion",
            "module": "incluimos",
            "tool_title": "Estrategias de inclusión",
            "artifact_type": "documento",
            "fields": {"barrier": "Acceso a consignas extensas"},
            "requested_sections": ["Estrategias"],
        }
    )
    table = WorkflowArtifactTable(
        title="Banco de estrategias",
        columns=[
            "Barrera o necesidad",
            "Estrategia inclusiva",
            "Aplicación paso a paso",
            "Recurso accesible",
            "Evidencia de participación",
            "Variante DUA",
        ],
        rows=[
            [
                "Consignas extensas",
                "Secuencia visual",
                "Presentar tres pasos",
                "Pictogramas",
                "Elige y explica",
                "Respuesta oral",
            ]
        ],
    )
    artifact = _semantic_artifact(payload.requested_sections, [table])
    artifact.sections[0] = artifact.sections[0].model_copy(
        update={"narrative": "El estudiante es incapaz y debe ser separado del grupo."}
    )
    checks, _, status = _quality_report(
        artifact, payload, get_tool_contract("incluimos", "estrategias-inclusion")
    )
    assert status == "blocked"
    assert not next(check for check in checks if check.code == "inclusive_safeguards").passed


def test_family_message_must_preserve_the_requested_action() -> None:
    payload = WorkflowGenerationRequest.model_validate(
        {
            "tool_id": "correo-familias",
            "module": "acompanamos",
            "tool_title": "Correo a familias",
            "artifact_type": "comunicacion",
            "fields": {"desired_action": "Confirmar disponibilidad para una reunión breve"},
            "requested_sections": ["Mensaje"],
        }
    )
    artifact = _semantic_artifact(payload.requested_sections, [])
    checks, _, status = _quality_report(
        artifact, payload, get_tool_contract("acompanamos", "correo-familias")
    )
    assert status == "blocked"
    assert not next(check for check in checks if check.code == "communication_purpose").passed

    artifact.sections[0] = artifact.sections[0].model_copy(
        update={"key_points": ["Solicitamos confirmar una reunión breve con la familia."]}
    )
    checks, _, _ = _quality_report(
        artifact, payload, get_tool_contract("acompanamos", "correo-familias")
    )
    assert next(check for check in checks if check.code == "communication_purpose").passed


def test_checklist_builds_dynamic_criteria_columns_and_preserves_roster() -> None:
    payload = WorkflowGenerationRequest.model_validate(
        {
            "tool_id": "lista-cotejo",
            "module": "evaluamos",
            "tool_title": "Lista de cotejo",
            "artifact_type": "instrumento",
            "fields": {
                "criteria_count": "5",
                "student_names": "Ana Torres\nLuis Rojas",
            },
            "requested_sections": ["Indicadores observables"],
        }
    )
    prompt = _workflow_prompt(payload)
    assert "C1 | C2 | C3 | C4 | C5 | Observaciones" in prompt

    register = WorkflowArtifactTable(
        title="Matriz de registro",
        columns=["N°", "Estudiante", "C1", "C2", "C3", "C4", "C5", "Observaciones"],
        rows=[
            ["1", "Ana Torres", "Sí/No", "Sí/No", "Sí/No", "Sí/No", "Sí/No", "Por registrar"],
            ["2", "Luis Rojas", "Sí/No", "Sí/No", "Sí/No", "Sí/No", "Sí/No", "Por registrar"],
        ],
    )
    legend = WorkflowArtifactTable(
        title="Leyenda de criterios",
        columns=["Código", "Criterio observable", "Evidencia"],
        rows=[
            [f"C{index}", f"Criterio observable {index}", f"Evidencia {index}"]
            for index in range(1, 6)
        ],
    )
    artifact = _semantic_artifact(payload.requested_sections, [register, legend])
    checks, _, status = _quality_report(
        artifact, payload, get_tool_contract("evaluamos", "lista-cotejo")
    )
    assert status in {"ready", "review"}
    assert next(check for check in checks if check.code == "checklist_matrix").passed


def test_rubric_rejects_repeated_descriptors_between_levels() -> None:
    payload = WorkflowGenerationRequest.model_validate(
        {
            "tool_id": "rubrica-evaluacion",
            "module": "evaluamos",
            "tool_title": "Rúbrica de evaluación",
            "artifact_type": "instrumento",
            "fields": {"criteria_count": "2"},
            "requested_sections": ["Matriz de criterios y niveles"],
        }
    )
    rubric = WorkflowArtifactTable(
        title="Matriz analítica",
        columns=[
            "Criterio observable",
            "Inicio C",
            "En proceso B",
            "Logro esperado A",
            "Logro destacado AD",
            "Recomendación para avanzar",
        ],
        rows=[
            [
                "Explica",
                "No explica",
                "Explica con apoyo",
                "Explica con evidencia",
                "Compara evidencias",
                "Añade una razón verificable",
            ],
            [
                "Argumenta",
                "Mismo descriptor",
                "Mismo descriptor",
                "Mismo descriptor",
                "Mismo descriptor",
                "Contrasta dos fuentes distintas",
            ],
        ],
    )
    artifact = _semantic_artifact(payload.requested_sections, [rubric])
    checks, _, status = _quality_report(
        artifact, payload, get_tool_contract("evaluamos", "rubrica-evaluacion")
    )
    assert status == "blocked"
    assert not next(check for check in checks if check.code == "rubric_progression").passed


def test_every_registered_tool_rejects_a_result_with_an_unrelated_section() -> None:
    failures: list[str] = []
    for module, tool_id in sorted(registered_contract_keys()):
        payload = WorkflowGenerationRequest.model_validate(
            {
                "tool_id": tool_id,
                "module": module,
                "tool_title": f"Herramienta {tool_id}",
                "artifact_type": "documento",
                "fields": {
                    "topic": "Contexto de prueba",
                    "word_count": "5",
                    "question_count": "5",
                    "total_score": "20",
                    "literal_count": "1",
                    "inferential_count": "1",
                    "critical_count": "1",
                    "activity_count": "3",
                },
                "requested_sections": ["Producto específico solicitado"],
            }
        )
        artifact = _semantic_artifact(["Contenido ajeno a la herramienta"], [])
        checks, _, status = _quality_report(artifact, payload, get_tool_contract(module, tool_id))
        section_check = next((check for check in checks if check.code == "section_contract"), None)
        if status != "blocked" or section_check is None or section_check.passed:
            failures.append(f"{module}/{tool_id}")

    assert failures == []


@pytest.mark.asyncio
async def test_workflow_repairs_a_p0_failure_once_and_reports_it(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    payload = WorkflowGenerationRequest.model_validate(_payload())
    first = _semantic_artifact(payload.requested_sections, [])
    repaired = first.model_copy(
        update={
            "executive_summary": (
                "Sesión corregida con secuencia completa, tiempos consistentes y evidencias "
                "observables para el contexto declarado por el docente."
            )
        }
    )
    candidate_mock = AsyncMock(
        side_effect=[(first, "gemini-test"), (repaired, "gemini-test")]
    )
    failed = GenerationQualityCheck(
        code="session_sequence",
        label="Secuencia didáctica aplicable",
        severity="P0",
        passed=False,
        detail="La secuencia no suma la duración declarada.",
    )
    passed = failed.model_copy(
        update={"passed": True, "detail": "La secuencia fue corregida y validada."}
    )
    reports = iter([([failed], [failed.detail], "blocked"), ([passed], [], "ready")])

    monkeypatch.setattr("app.modules.ai.service._request_workflow_candidate", candidate_mock)
    monkeypatch.setattr(
        "app.modules.ai.service._quality_report",
        lambda *_args: next(reports),
    )

    result = await generate_workflow_artifact(payload)

    assert candidate_mock.await_count == 2
    assert "CORRECCIÓN AUTOMÁTICA CONTROLADA" in candidate_mock.await_args_list[1].args[2]
    assert "La secuencia no suma" in candidate_mock.await_args_list[1].args[2]
    assert result.repair_attempted is True
    assert result.repair_succeeded is True
    assert result.repair_notes == [failed.detail]
    assert result.quality_status == "ready"


@pytest.mark.asyncio
async def test_workflow_does_not_retry_more_than_once_when_repair_still_fails(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    payload = WorkflowGenerationRequest.model_validate(_payload())
    artifact = _semantic_artifact(payload.requested_sections, [])
    candidate_mock = AsyncMock(
        side_effect=[(artifact, "gemini-test"), (artifact, "gemini-test")]
    )
    failed = GenerationQualityCheck(
        code="session_sequence",
        label="Secuencia didáctica aplicable",
        severity="P0",
        passed=False,
        detail="La secuencia continúa incompleta.",
    )

    monkeypatch.setattr("app.modules.ai.service._request_workflow_candidate", candidate_mock)
    monkeypatch.setattr(
        "app.modules.ai.service._quality_report",
        lambda *_args: ([failed], [failed.detail], "blocked"),
    )

    with pytest.raises(AIGenerationError, match="reparación automática"):
        await generate_workflow_artifact(payload)

    assert candidate_mock.await_count == 2

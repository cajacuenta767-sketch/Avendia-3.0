from app.modules.ai.questions import derive_questions, parse_question
from app.modules.ai.schemas import (
    GeneratedWorkflowArtifact,
    GeneratedWorkflowSection,
    WorkflowArtifactTable,
    WorkflowGenerationRequest,
)


def _exam_payload() -> WorkflowGenerationRequest:
    return WorkflowGenerationRequest(
        tool_id="examen",
        module="evaluamos",
        tool_title="Examen",
        artifact_type="instrumento",
        fields={
            "question_count": "5",
            "total_score": "20",
            "question_formats": "Opción múltiple, Relacionar",
        },
        requested_sections=[
            "Instrucciones",
            "Matriz de especificaciones",
            "Preguntas",
            "Puntaje",
            "Clave de respuestas",
            "Criterios de corrección",
        ],
    )


def _section(title: str, points: list[str]) -> GeneratedWorkflowSection:
    return GeneratedWorkflowSection(
        title=title, narrative="Texto de apoyo suficientemente largo.", key_points=points
    )


def test_parse_multiple_choice_relation_and_true_false():
    choice = parse_question(
        "[Opción múltiple] ¿Cuál es la capital? | A) Lima | B) Cusco | C) Piura | D) Tacna", 1
    )
    assert choice.format == "opcion_multiple"
    assert choice.prompt == "¿Cuál es la capital?"
    assert choice.options == ["A) Lima", "B) Cusco", "C) Piura", "D) Tacna"]

    relation = parse_question(
        "[Relacionar] Une cada causa con su efecto. | Columna A: 1) Tala; 2) Lluvia "
        "| Columna B: a) Erosión; b) Inundación",
        2,
    )
    assert relation.format == "relacionar"
    assert relation.prompt == "Une cada causa con su efecto."
    assert relation.left_column == ["1) Tala", "2) Lluvia"]
    assert relation.right_column == ["a) Erosión", "b) Inundación"]

    vf = parse_question("[Verdadero/Falso] 3. El agua hierve a 100 °C al nivel del mar.", 3)
    assert vf.format == "verdadero_falso"
    assert vf.prompt == "El agua hierve a 100 °C al nivel del mar."
    assert vf.options == []

    plain = parse_question("Explica el ciclo del agua.", 4)
    assert plain.format == "generica"


def test_exam_questions_get_answers_and_points_from_matrix():
    artifact = GeneratedWorkflowArtifact(
        document_title="Examen de Ciencia",
        executive_summary="Evaluación formativa sobre el ciclo del agua para 5° de primaria.",
        sections=[
            _section("Instrucciones", ["Lee con atención."]),
            _section("Matriz de especificaciones", ["Ver matriz."]),
            _section(
                "Preguntas",
                [
                    "[Opción múltiple] ¿Qué proceso forma las nubes? | A) Evaporación "
                    "| B) Condensación | C) Filtración | D) Erosión",
                    "[Opción múltiple] ¿Dónde se acumula el agua? | A) Nube | B) Río "
                    "| C) Sol | D) Viento",
                    "[Relacionar] Relaciona. | Columna A: 1) Evaporación; 2) Precipitación "
                    "| Columna B: a) Lluvia; b) Vapor",
                ],
            ),
            _section("Puntaje", ["Suma 20 puntos."]),
            _section("Clave de respuestas", ["1. B", "2. B", "3. 1-b, 2-a"]),
            _section("Criterios de corrección", ["Exactitud."]),
        ],
        teacher_recommendations=["Revisar", "Retroalimentar"],
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
                    ["Ciclo del agua", "Literal", "Opción múltiple", "2", "8"],
                    ["Ciclo del agua", "Inferencial", "Relacionar", "1", "12"],
                ],
            )
        ],
    )
    questions = derive_questions(artifact, _exam_payload())
    assert [question.number for question in questions] == [1, 2, 3]
    assert [question.answer for question in questions] == ["B", "B", "1-b, 2-a"]
    assert [question.points for question in questions] == [4.0, 4.0, 12.0]
    assert questions[2].left_column == ["1) Evaporación", "2) Precipitación"]


def test_exam_points_fall_back_to_total_score_without_matrix():
    artifact = GeneratedWorkflowArtifact(
        document_title="Examen",
        executive_summary="Evaluación breve de comprensión lectora para el aula.",
        sections=[
            _section("Preguntas", ["[Desarrollo] Explica.", "[Respuesta corta] Define."]),
            _section("Clave de respuestas", ["Respuesta abierta", "Definición"]),
        ],
        teacher_recommendations=["Uno", "Dos"],
    )
    questions = derive_questions(artifact, _exam_payload())
    assert [question.points for question in questions] == [10.0, 10.0]
    assert questions[0].format == "desarrollo"


def test_text_questions_take_level_from_section_and_answers_from_key():
    payload = _exam_payload().model_copy(update={"tool_id": "preguntas-texto"})
    artifact = GeneratedWorkflowArtifact(
        document_title="Preguntas sobre el texto",
        executive_summary="Preguntas de comprensión sobre una crónica del Amazonas.",
        sections=[
            _section("Texto o síntesis", ["Síntesis."]),
            _section("Preguntas literales", ["[Texto breve] ¿Quién narra?"]),
            _section("Preguntas inferenciales", ["[Desarrollo] ¿Por qué se fue?"]),
            _section(
                "Preguntas crítico-reflexivas",
                ["[Opción múltiple] ¿Qué harías? | A) Ir | B) Quedarme | C) Avisar | D) Esperar"],
            ),
            _section(
                "Clave y respuestas esperadas", ["1. El cronista", "2. Por la sequía", "3. C"]
            ),
        ],
        teacher_recommendations=["Uno", "Dos"],
    )
    questions = derive_questions(artifact, payload)
    assert [q.cognitive_level for q in questions] == ["Literal", "Inferencial", "Crítico"]
    assert [q.answer for q in questions] == ["El cronista", "Por la sequía", "C"]
    assert questions[2].options[2] == "C) Avisar"


def test_other_tools_have_no_typed_questions():
    payload = _exam_payload().model_copy(
        update={"tool_id": "sesion-aprendizaje", "module": "planificamos"}
    )
    artifact = GeneratedWorkflowArtifact(
        document_title="Sesión",
        executive_summary="Sesión de aprendizaje sobre el ciclo del agua para primaria.",
        sections=[_section("Preguntas", ["[Desarrollo] Algo"])],
        teacher_recommendations=["Uno", "Dos"],
    )
    assert derive_questions(artifact, payload) == []

"""Deriva reactivos tipados a partir del examen o banco de preguntas generado.

El modelo entrega cada pregunta como un punto clave con un prefijo de formato
(``[Opción múltiple] ... | A) ... | B) ...``). Aquí se interpreta una sola vez, en
el servidor, y se expone como ``questions`` para que los renderizadores no
tengan que reconocer prefijos ni separadores.
"""

from __future__ import annotations

import re

from app.modules.ai.schemas import (
    GeneratedWorkflowArtifact,
    GeneratedWorkflowSection,
    WorkflowGenerationRequest,
    WorkflowQuestion,
)

_PREFIX = re.compile(r"^\[([^\]]+)\]\s*")
_OPTION = re.compile(r"(?:^|\||\n)\s*([A-Da-d])[.)]\s*([^|\n]+)")
_RELATION = re.compile(r"^(.*?)\s*\|?\s*Columna A:\s*(.*?)\s*\|\s*Columna B:\s*(.*)$", re.I | re.S)
_LEADING_NUMBER = re.compile(r"^\s*(?:\d+|[a-z])[.)]\s+", re.I)

_FORMATS: tuple[tuple[str, str], ...] = (
    ("opción múltiple", "opcion_multiple"),
    ("opcion multiple", "opcion_multiple"),
    ("respuesta corta", "respuesta_corta"),
    ("relacionar", "relacionar"),
    ("verdadero", "verdadero_falso"),
    ("desarrollo", "desarrollo"),
    ("texto breve", "texto_breve"),
    ("tabla", "tabla"),
    ("dibujo", "dibujo"),
    ("resolución matemática", "operacion"),
    ("resolucion matematica", "operacion"),
    ("operación", "operacion"),
)

_MATRIX_FORMAT_LABELS = {
    "opcion_multiple": ("opción múltiple", "opcion multiple"),
    "respuesta_corta": ("respuesta corta",),
    "relacionar": ("relacionar",),
    "verdadero_falso": ("verdadero",),
    "desarrollo": ("desarrollo",),
}


def _format_from_prefix(prefix: str) -> str:
    lowered = prefix.casefold().strip()
    for needle, code in _FORMATS:
        if needle in lowered:
            return code
    return "generica"


def _split_items(value: str) -> list[str]:
    return [item.strip() for item in re.split(r"\s*;\s*", value) if item.strip()]


def parse_question(raw: str, number: int) -> WorkflowQuestion:
    text = raw.strip()
    match = _PREFIX.match(text)
    format_code = _format_from_prefix(match.group(1)) if match else "generica"
    body = text[match.end() :].strip() if match else text
    body = _LEADING_NUMBER.sub("", body, count=1)

    left_column: list[str] = []
    right_column: list[str] = []
    options: list[str] = []
    prompt = body
    relation = _RELATION.match(body)
    if format_code == "relacionar" and relation:
        prompt = relation.group(1).strip().rstrip("|").strip() or body
        left_column = _split_items(relation.group(2))
        right_column = _split_items(relation.group(3))
    elif format_code == "opcion_multiple":
        found = list(_OPTION.finditer(body))
        if found:
            options = [f"{item.group(1).upper()}) {item.group(2).strip()}" for item in found]
            prompt = body[: found[0].start()].strip().rstrip("|").strip() or body
    return WorkflowQuestion(
        number=number,
        format=format_code,  # type: ignore[arg-type]
        prompt=prompt[:1200],
        options=options[:8],
        left_column=left_column[:12],
        right_column=right_column[:12],
    )


def _find_section(
    sections: list[GeneratedWorkflowSection], *needles: str
) -> GeneratedWorkflowSection | None:
    for section in sections:
        title = section.title.casefold()
        if all(needle in title for needle in needles):
            return section
    return None


def _points_by_format(generated: GeneratedWorkflowArtifact) -> dict[str, float]:
    """Puntaje unitario por formato a partir de la matriz de especificaciones."""
    if not generated.tables:
        return {}
    table = generated.tables[0]
    columns = [column.casefold() for column in table.columns]
    try:
        type_index = next(i for i, c in enumerate(columns) if "tipo" in c)
        count_index = next(i for i, c in enumerate(columns) if "cantidad" in c)
        score_index = next(i for i, c in enumerate(columns) if "puntaje" in c)
    except StopIteration:
        return {}
    totals: dict[str, list[float]] = {}
    for row in table.rows:
        label = row[type_index].casefold()
        count = _number(row[count_index])
        score = _number(row[score_index])
        if not count or score is None:
            continue
        for code, needles in _MATRIX_FORMAT_LABELS.items():
            if any(needle in label for needle in needles):
                totals.setdefault(code, []).append(score / count)
    return {code: round(sum(values) / len(values), 2) for code, values in totals.items() if values}


def _number(value: str) -> float | None:
    match = re.search(r"\d+(?:[.,]\d+)?", value)
    if not match:
        return None
    return float(match.group(0).replace(",", "."))


def _strip_key_number(value: str) -> str:
    return _LEADING_NUMBER.sub("", value.strip(), count=1)


def derive_questions(
    generated: GeneratedWorkflowArtifact, payload: WorkflowGenerationRequest
) -> list[WorkflowQuestion]:
    if payload.tool_id == "examen":
        return _derive_exam(generated, payload)
    if payload.tool_id == "preguntas-texto":
        return _derive_text_questions(generated)
    return []


def _derive_exam(
    generated: GeneratedWorkflowArtifact, payload: WorkflowGenerationRequest
) -> list[WorkflowQuestion]:
    section = _find_section(generated.sections, "preguntas")
    if section is None:
        return []
    key_section = _find_section(generated.sections, "clave")
    answers = [_strip_key_number(item) for item in (key_section.key_points if key_section else [])]
    unit_points = _points_by_format(generated)
    questions = [parse_question(point, index + 1) for index, point in enumerate(section.key_points)]
    if not unit_points and questions:
        total = _number(payload.fields.get("total_score", "")) or 0
        default_points = round(total / len(questions), 2) if total else None
    else:
        default_points = None
    result: list[WorkflowQuestion] = []
    for index, question in enumerate(questions):
        result.append(
            question.model_copy(
                update={
                    "answer": answers[index] if index < len(answers) else "",
                    "points": unit_points.get(question.format, default_points),
                }
            )
        )
    return result[:60]


_LEVELS = (
    ("literal", "Literal"),
    ("inferencial", "Inferencial"),
    ("crítico", "Crítico"),
    ("critico", "Crítico"),
)


def _derive_text_questions(generated: GeneratedWorkflowArtifact) -> list[WorkflowQuestion]:
    question_sections = [
        section
        for section in generated.sections
        if section.title.casefold().startswith("preguntas")
    ]
    if not question_sections:
        return []
    key_section = _find_section(generated.sections, "clave")
    answers = [_strip_key_number(item) for item in (key_section.key_points if key_section else [])]
    result: list[WorkflowQuestion] = []
    number = 0
    for section in question_sections:
        level = next((label for needle, label in _LEVELS if needle in section.title.casefold()), "")
        for point in section.key_points:
            number += 1
            question = parse_question(point, number)
            result.append(
                question.model_copy(
                    update={
                        "cognitive_level": level,
                        "answer": answers[number - 1] if number - 1 < len(answers) else "",
                    }
                )
            )
    return result[:60]

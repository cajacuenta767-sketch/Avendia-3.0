"""Reglas de formato y pulido de estilo para los documentos generados.

El esquema JSON fija la estructura (secciones, puntos clave, tablas, actividad),
pero no cómo se redacta cada campo. Este módulo aporta dos cosas:

* ``formatting_rules``: bloque de instrucciones para el modelo que define cómo se
  verá el documento final (párrafos, puntos clave con etiqueta, celdas breves).
* ``polish_artifact``: limpieza determinista del resultado para que la vista
  previa y el Word reciban texto homogéneo aunque el modelo se desvíe: viñetas
  incrustadas en párrafos, restos de Markdown, numeraciones en títulos, celdas
  con saltos de línea.

El pulido nunca cambia el significado ni la cantidad de elementos en las
herramientas donde esa cantidad se valida (exámenes, preguntas, fichas).
"""

from __future__ import annotations

import re

from app.modules.ai.schemas import (
    GeneratedWorkflowArtifact,
    GeneratedWorkflowSection,
    WorkflowArtifactTable,
    WorkflowGenerationRequest,
)
from app.modules.ai.tool_contracts import ToolGenerationContract

# Herramientas cuya cantidad de key_points se valida contra el pedido del docente:
# en ellas no se extraen viñetas desde el párrafo para no alterar el conteo.
COUNTED_KEY_POINT_TOOLS = frozenset(
    {
        "examen",
        "preguntas-texto",
        "ficha-aprendizaje",
        "carpetas-recuperacion",
        "carpeta-recuperacion",
        "trabajo-autonomo",
        "tarea-extension-hogar",
    }
)

_BULLET_GLYPHS = "•·◦▪▫‣●○■□➢➤►✓✔-–—*"
_LEADING_BULLET = re.compile(rf"^\s*[{re.escape(_BULLET_GLYPHS)}]+\s+")
_LEADING_ENUMERATION = re.compile(
    r"^\s*(?:(?:[IVXLC]+|\d+(?:\.\d+)*|[a-zA-Z])[.)]\s+)+(?=\S)",
)
_MARKDOWN_EMPHASIS = re.compile(r"(\*{1,3}|_{2,3}|`+)(?=\S)(.+?)(?<=\S)\1")
_MARKDOWN_HEADING = re.compile(r"^\s*#{1,6}\s+", re.MULTILINE)
_INLINE_BULLET_SPLIT = re.compile(rf"\s+[{re.escape('•◦▪‣●■➢➤►')}]\s+")
_LINE_BULLET = re.compile(rf"^\s*(?:[{re.escape('•◦▪‣●■➢➤►')}]|[-–—*]|\d+[.)])\s+")
_MULTI_SPACE = re.compile(r"[ \t ]{2,}")
_LABEL_PATTERN = re.compile(r"^([A-ZÁÉÍÓÚÑ][^:]{1,40}?):\s+\S")


def _clean_inline(value: str) -> str:
    text = _MARKDOWN_HEADING.sub("", value)
    text = _MARKDOWN_EMPHASIS.sub(lambda match: match.group(2), text)
    text = text.replace("`", "")
    text = _MULTI_SPACE.sub(" ", text)
    return "\n".join(line.strip() for line in text.splitlines()).strip()


def _strip_bullet(value: str) -> str:
    return _LEADING_BULLET.sub("", value).strip()


def _strip_enumeration(value: str) -> str:
    return _LEADING_ENUMERATION.sub("", value).strip()


def _paragraphs(narrative: str) -> str:
    """Normaliza saltos de línea: cada línea no vacía es un párrafo."""
    parts = [part.strip() for part in re.split(r"\n+", narrative) if part.strip()]
    return "\n\n".join(parts)


def _extract_list(narrative: str) -> tuple[str, list[str]]:
    """Separa una lista incrustada en el párrafo.

    Acepta viñetas en línea (``texto • uno • dos``) y líneas que empiezan con
    viñeta, guion o número. Devuelve el texto introductorio y los elementos.
    """
    lines = [line for line in narrative.splitlines() if line.strip()]
    bullet_lines = [line for line in lines if _LINE_BULLET.match(line)]
    if len(bullet_lines) >= 2 and len(lines) >= 2:
        intro = [line.strip() for line in lines if not _LINE_BULLET.match(line)]
        items = [_LINE_BULLET.sub("", line).strip() for line in bullet_lines]
        return "\n\n".join(intro), items

    inline_parts = _INLINE_BULLET_SPLIT.split(narrative)
    if len(inline_parts) >= 3:
        intro = inline_parts[0].strip()
        items = [part.strip() for part in inline_parts[1:] if part.strip()]
        return intro, items
    return narrative, []


def _polish_section(
    section: GeneratedWorkflowSection, extract_lists: bool
) -> GeneratedWorkflowSection:
    narrative = _clean_inline(section.narrative)
    key_points = [_strip_bullet(_clean_inline(point)) for point in section.key_points]
    if extract_lists:
        intro, items = _extract_list(narrative)
        if items:
            if len(intro) < 20 and items:
                intro = f"{intro} {items[0]}".strip()
                items = items[1:]
            if len(intro) >= 20:
                narrative = intro
                key_points = [_strip_bullet(item) for item in items] + key_points
    narrative = _paragraphs(narrative)
    key_points = [point for point in key_points if len(point) >= 3] or section.key_points
    return section.model_copy(
        update={
            "title": _strip_enumeration(_clean_inline(section.title)),
            "narrative": narrative if len(narrative) >= 20 else section.narrative,
            "key_points": [point[:900] for point in key_points][:40],
        }
    )


def _polish_table(table: WorkflowArtifactTable) -> WorkflowArtifactTable:
    def cell(value: str) -> str:
        cleaned = _strip_bullet(_clean_inline(value)).replace("\n", " ")
        return cleaned or value.strip()

    return table.model_copy(
        update={
            "title": _strip_enumeration(_clean_inline(table.title)),
            "columns": [cell(column) for column in table.columns],
            "rows": [[cell(value) for value in row] for row in table.rows],
            "note": _clean_inline(table.note),
        }
    )


def polish_artifact(
    generated: GeneratedWorkflowArtifact, payload: WorkflowGenerationRequest
) -> GeneratedWorkflowArtifact:
    extract_lists = payload.tool_id not in COUNTED_KEY_POINT_TOOLS
    summary = _clean_inline(generated.executive_summary)
    summary = _INLINE_BULLET_SPLIT.sub(". ", summary).replace("..", ".")
    summary = " ".join(summary.split())
    recommendations = [
        _strip_bullet(_strip_enumeration(_clean_inline(item)))
        for item in generated.teacher_recommendations
    ]
    return generated.model_copy(
        update={
            "document_title": _strip_enumeration(_clean_inline(generated.document_title)),
            "executive_summary": summary if len(summary) >= 30 else generated.executive_summary,
            "sections": [_polish_section(section, extract_lists) for section in generated.sections],
            "teacher_recommendations": [item for item in recommendations if len(item) >= 3]
            or generated.teacher_recommendations,
            "tables": [_polish_table(table) for table in generated.tables],
        }
    )


def has_label(point: str) -> bool:
    """Indica si un punto clave sigue el patrón "Etiqueta: contenido" (1 a 4 palabras)."""
    match = _LABEL_PATTERN.match(point)
    return bool(match) and len(match.group(1).split()) <= 4


def _length_guidance(payload: WorkflowGenerationRequest, contract: ToolGenerationContract) -> str:
    audience = contract.audience.casefold()
    if payload.artifact_type == "comunicacion":
        return (
            "Carta o mensaje de 250 a 450 palabras en total, tratamiento de usted, tono "
            "cordial y directo; el resumen ejecutivo es el saludo y el motivo en dos frases."
        )
    if payload.artifact_type == "actividad" or "estudiante" in audience:
        return (
            "Consignas de una sola oración en lenguaje del grado; cada key_point es una "
            "instrucción o reactivo completo que el estudiante puede leer sin ayuda."
        )
    if payload.artifact_type == "analisis":
        return (
            "Párrafos de dos a cuatro frases que separen evidencia, interpretación y acción; "
            "usa cifras con unidad y evita adjetivos sin dato."
        )
    return (
        "Registro técnico y preciso para lectura del docente y del equipo directivo: "
        "párrafos de dos a cinco frases, sin adjetivos vacíos ni repeticiones."
    )


def formatting_rules(payload: WorkflowGenerationRequest, contract: ToolGenerationContract) -> str:
    return f"""
FORMATO DE REDACCIÓN (determina cómo se verá el documento impreso):
- narrative: de uno a tres párrafos breves separados por una línea en blanco. Frases de
  menos de 30 palabras. Sin viñetas, numeraciones, guiones ni símbolos dentro del párrafo:
  todo lo enumerable va en key_points.
- key_points: cada elemento es una línea completa y autónoma, sin viñeta inicial. Cuando
  el punto nombre un componente (Competencia, Capacidad, Desempeño, Evidencia, Tiempo,
  Recurso, Criterio, Fecha, Responsable, Instrumento, Producto), escríbelo como
  "Etiqueta: contenido" para que el documento resalte la etiqueta.
- No repitas el título del documento ni el nombre de la sección dentro de su texto.
  No numeres los títulos (I., 1., a)): el documento final los numera.
- tables: celdas de una sola idea y máximo 25 palabras, sin viñetas ni saltos de línea.
  Usa "Sí" o "No" cuando la respuesta sea binaria y cifras con unidad (min, %, puntos).
  La primera columna identifica la fila (momento, criterio, estudiante, periodo).
- Cuando un dato no fue aportado y debe completarse a mano, escribe "________" como
  espacio de llenado; nunca "No registrado", "por definir" ni "N/A".
- Extensión y tono: {_length_guidance(payload, contract)}
""".strip()

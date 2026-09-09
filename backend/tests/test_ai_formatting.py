from app.modules.ai.formatting import formatting_rules, has_label, polish_artifact
from app.modules.ai.schemas import (
    GeneratedWorkflowArtifact,
    GeneratedWorkflowSection,
    WorkflowArtifactTable,
    WorkflowGenerationRequest,
)
from app.modules.ai.tool_contracts import get_tool_contract


def _payload(
    tool_id: str = "correo-familias", module: str = "acompanamos"
) -> WorkflowGenerationRequest:
    return WorkflowGenerationRequest(
        tool_id=tool_id,
        module=module,
        tool_title="Herramienta",
        artifact_type="comunicacion" if module == "acompanamos" else "documento",
        fields={"topic": "Hábitos de estudio"},
        requested_sections=["Saludo", "Logros", "Compromisos"],
    )


def _artifact(**overrides) -> GeneratedWorkflowArtifact:
    base = dict(
        document_title="## I. Comunicado a las familias",
        executive_summary=(
            "Reciban un saludo cordial • Informamos el avance • Solicitamos apoyo en casa."
        ),
        sections=[
            GeneratedWorkflowSection(
                title="1. Saludo",
                narrative=(
                    "Destacamos con satisfacción los siguientes logros: • Creatividad y expresión "
                    "oral: participa en debates. • Empatía: trato respetuoso con sus compañeros. "
                    "• Curiosidad: iniciativa en ciencia."
                ),
                key_points=["• Competencia: Se comunica oralmente", "- Otra **evidencia** clara"],
            ),
            GeneratedWorkflowSection(
                title="Logros",
                narrative=(
                    "Primer párrafo de contexto suficiente.\nSegundo párrafo con detalle adicional."
                ),
                key_points=["Evidencia: portafolio revisado"],
            ),
        ],
        teacher_recommendations=["1. Revisar la carta", "* Enviar por agenda"],
        tables=[
            WorkflowArtifactTable(
                title="II. Compromisos",
                columns=["Compromiso", "**Responsable**"],
                rows=[["• Leer 20 min\ndiarios", "Familia"]],
                note="",
            )
        ],
    )
    base.update(overrides)
    return GeneratedWorkflowArtifact(**base)


def test_polish_extracts_inline_bullets_into_key_points_and_cleans_markdown():
    polished = polish_artifact(_artifact(), _payload())

    assert polished.document_title == "Comunicado a las familias"
    assert "•" not in polished.executive_summary
    saludo = polished.sections[0]
    assert saludo.title == "Saludo"
    assert saludo.narrative == "Destacamos con satisfacción los siguientes logros:"
    assert saludo.key_points[:3] == [
        "Creatividad y expresión oral: participa en debates.",
        "Empatía: trato respetuoso con sus compañeros.",
        "Curiosidad: iniciativa en ciencia.",
    ]
    assert saludo.key_points[3:] == ["Competencia: Se comunica oralmente", "Otra evidencia clara"]
    assert polished.sections[1].narrative == (
        "Primer párrafo de contexto suficiente.\n\nSegundo párrafo con detalle adicional."
    )
    assert polished.teacher_recommendations == ["Revisar la carta", "Enviar por agenda"]
    table = polished.tables[0]
    assert table.title == "Compromisos"
    assert table.columns == ["Compromiso", "Responsable"]
    assert table.rows == [["Leer 20 min diarios", "Familia"]]


def test_polish_keeps_key_point_count_for_counted_tools():
    payload = _payload("trabajo-autonomo", "reforzamos")
    polished = polish_artifact(_artifact(), payload)
    section = polished.sections[0]
    assert "•" in section.narrative
    assert len(section.key_points) == 2
    assert section.key_points == ["Competencia: Se comunica oralmente", "Otra evidencia clara"]


def test_polish_never_leaves_short_or_empty_fields():
    artifact = _artifact(
        sections=[
            GeneratedWorkflowSection(
                title="Saludo",
                narrative="• Uno • Dos • Tres palabras cortas",
                key_points=["• ok"],
            )
        ]
    )
    polished = polish_artifact(artifact, _payload())
    section = polished.sections[0]
    assert len(section.narrative) >= 20
    assert section.key_points == ["• ok"]
    GeneratedWorkflowArtifact.model_validate(polished.model_dump())


def test_has_label_detects_component_pattern():
    assert has_label("Competencia: Lee diversos tipos de textos")
    assert not has_label("Lee diversos tipos de textos: en su lengua materna y otras")
    assert not has_label("competencia: en minúscula no cuenta")


def test_formatting_rules_adapt_to_audience():
    letter = formatting_rules(_payload(), get_tool_contract("acompanamos", "correo-familias"))
    assert "250 a 450 palabras" in letter
    assert "Etiqueta: contenido" in letter
    session = formatting_rules(
        _payload("sesion-aprendizaje", "planificamos"),
        get_tool_contract("planificamos", "sesion-aprendizaje"),
    )
    assert "Registro técnico" in session

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class WordGroupingRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    modality: Literal["EBR", "EBA", "EBE"]
    level: Literal["Inicial", "Primaria", "Secundaria"]
    grade: str = Field(min_length=1, max_length=64)
    curricular_area: str = Field(min_length=2, max_length=120)
    topic: str = Field(min_length=3, max_length=180)
    category_count: int = Field(ge=2, le=4)

    @field_validator("grade", "curricular_area", "topic")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("This field is required")
        return cleaned


class GeneratedCategory(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str = Field(min_length=2, max_length=80)
    explanation: str = Field(min_length=8, max_length=240)
    words: list[str] = Field(min_length=3, max_length=4)

    @field_validator("name", "explanation")
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("words")
    @classmethod
    def clean_words(cls, values: list[str]) -> list[str]:
        cleaned = [value.strip() for value in values if value.strip()]
        has_duplicates = len({value.casefold() for value in cleaned}) != len(cleaned)
        if len(cleaned) != len(values) or has_duplicates:
            raise ValueError("Words must be non-empty and unique within a category")
        return cleaned


class GeneratedTaxonomy(BaseModel):
    model_config = ConfigDict(extra="forbid")

    activity_title: str = Field(min_length=3, max_length=140)
    instructions: str = Field(min_length=10, max_length=320)
    categories: list[GeneratedCategory] = Field(min_length=2, max_length=4)

    @model_validator(mode="after")
    def validate_unique_content(self) -> "GeneratedTaxonomy":
        category_names = [category.name.casefold() for category in self.categories]
        if len(set(category_names)) != len(category_names):
            raise ValueError("Category names must be unique")

        all_words = [word.casefold() for category in self.categories for word in category.words]
        if len(set(all_words)) != len(all_words):
            raise ValueError("Words must be unique across the activity")
        return self


class WordGroupingCategory(BaseModel):
    id: str
    name: str
    explanation: str


class WordGroupingWord(BaseModel):
    id: str
    word: str
    correct_category_id: str


class WordGroupingResponse(BaseModel):
    activity_title: str
    instructions: str
    categories: list[WordGroupingCategory]
    words: list[WordGroupingWord]
    model: str


SequenceType = Literal[
    "Proceso científico o natural",
    "Secuencia cronológica o histórica",
    "Algoritmo o procedimiento",
    "Secuencia narrativa",
]


class SequenceOrderingRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    modality: Literal["EBR", "EBA", "EBE"]
    level: Literal["Inicial", "Primaria", "Secundaria"]
    grade: str = Field(min_length=1, max_length=64)
    curricular_area: str = Field(min_length=2, max_length=120)
    sequence_type: SequenceType
    topic: str = Field(min_length=3, max_length=180)
    step_count: int = Field(ge=4, le=8)

    @field_validator("grade", "curricular_area", "topic")
    @classmethod
    def strip_sequence_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("This field is required")
        return cleaned


class GeneratedSequenceBlock(BaseModel):
    model_config = ConfigDict(extra="forbid")

    order: int = Field(ge=1, le=8)
    text: str = Field(min_length=12, max_length=320)
    hint: str = Field(min_length=8, max_length=220)

    @field_validator("text", "hint")
    @classmethod
    def strip_block_text(cls, value: str) -> str:
        return value.strip()


class GeneratedSequence(BaseModel):
    model_config = ConfigDict(extra="forbid")

    activity_title: str = Field(min_length=3, max_length=140)
    instructions: str = Field(min_length=10, max_length=320)
    pedagogical_rationale: str = Field(min_length=20, max_length=700)
    blocks: list[GeneratedSequenceBlock] = Field(min_length=4, max_length=8)

    @field_validator("activity_title", "instructions", "pedagogical_rationale")
    @classmethod
    def strip_sequence_content(cls, value: str) -> str:
        return value.strip()

    @model_validator(mode="after")
    def validate_unique_blocks(self) -> "GeneratedSequence":
        orders = [block.order for block in self.blocks]
        if len(set(orders)) != len(orders):
            raise ValueError("Block orders must be unique")
        texts = [block.text.casefold() for block in self.blocks]
        if len(set(texts)) != len(texts):
            raise ValueError("Block texts must be unique")
        return self


class SequenceOrderingBlock(BaseModel):
    id: str
    correct_order: int
    text: str
    hint: str


class SequenceOrderingResponse(BaseModel):
    activity_title: str
    instructions: str
    pedagogical_rationale: str
    blocks: list[SequenceOrderingBlock]
    model: str


PresentationSlideType = Literal["portada", "contenido", "frase_destacada", "cierre"]


class PresentationGenerationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    teacher_name: str = Field(min_length=2, max_length=140)
    institution: str = Field(min_length=2, max_length=180)
    modality: Literal["EBR", "EBA", "EBE"]
    level: Literal["Inicial", "Primaria", "Secundaria"]
    grade: str = Field(min_length=1, max_length=64)
    curricular_area: str = Field(min_length=2, max_length=120)
    slide_count: Literal[3, 5, 8]
    visual_style: Literal[
        "infografico",
        "bento_pastel",
        "ilustrado",
        "minimalista",
        "esquema",
        "alto_contraste",
        "editorial",
        "gamificado",
    ]
    topic: str = Field(min_length=3, max_length=220)
    competencies: list[str] = Field(min_length=1, max_length=6)
    didactic_purpose: str = Field(min_length=5, max_length=180)
    interactions: list[str] = Field(min_length=1, max_length=4)

    @field_validator(
        "teacher_name",
        "institution",
        "grade",
        "curricular_area",
        "topic",
        "didactic_purpose",
    )
    @classmethod
    def strip_presentation_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("This field is required")
        return cleaned

    @field_validator("competencies", "interactions")
    @classmethod
    def clean_presentation_lists(cls, values: list[str]) -> list[str]:
        cleaned = [value.strip() for value in values if value.strip()]
        unique_values = set(item.casefold() for item in cleaned)
        if len(cleaned) != len(values) or len(unique_values) != len(cleaned):
            raise ValueError("Values must be non-empty and unique")
        return cleaned


class GeneratedPresentationSlide(BaseModel):
    model_config = ConfigDict(extra="forbid")

    order: int = Field(ge=1, le=8)
    type: PresentationSlideType
    title: str = Field(min_length=2, max_length=140)
    subtitle: str = Field(default="", max_length=220)
    key_points: list[str] = Field(default_factory=list, max_length=5)
    highlighted_quote: str = Field(default="", max_length=280)
    interactive_activity: str = Field(default="", max_length=500)
    speaker_notes: str = Field(min_length=10, max_length=1200)
    visual_prompt: str = Field(min_length=8, max_length=500)
    image_search_query: str = Field(default="", max_length=240)
    image_url: str = Field(default="", max_length=500)
    image_alt: str = Field(default="", max_length=260)
    image_attribution: str = Field(default="", max_length=500)
    image_source_url: str = Field(default="", max_length=1000)
    image_license: str = Field(default="", max_length=180)
    image_width: int = Field(default=0, ge=0, le=20000)
    image_height: int = Field(default=0, ge=0, le=20000)

    @field_validator(
        "title",
        "subtitle",
        "highlighted_quote",
        "interactive_activity",
        "speaker_notes",
        "visual_prompt",
        "image_search_query",
        "image_url",
        "image_alt",
        "image_attribution",
        "image_source_url",
        "image_license",
    )
    @classmethod
    def strip_presentation_slide_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("key_points")
    @classmethod
    def clean_presentation_points(cls, values: list[str]) -> list[str]:
        cleaned = [value.strip() for value in values if value.strip()]
        if any(len(value) > 320 for value in cleaned):
            raise ValueError("Invalid key point")
        return cleaned


class GeneratedPresentation(BaseModel):
    model_config = ConfigDict(extra="forbid")

    presentation_title: str = Field(min_length=3, max_length=180)
    learning_objective: str = Field(min_length=12, max_length=700)
    slides: list[GeneratedPresentationSlide] = Field(min_length=3, max_length=8)


class PresentationGenerationResponse(GeneratedPresentation):
    model: str


class PresentationExportRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    teacher_name: str = Field(min_length=2, max_length=140)
    institution: str = Field(min_length=2, max_length=180)
    curricular_area: str = Field(min_length=2, max_length=120)
    grade: str = Field(min_length=1, max_length=64)
    visual_style: Literal[
        "infografico",
        "bento_pastel",
        "ilustrado",
        "minimalista",
        "esquema",
        "alto_contraste",
        "editorial",
        "gamificado",
    ]
    presentation: GeneratedPresentation


class WorkflowGenerationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    tool_id: str = Field(min_length=2, max_length=80, pattern=r"^[a-z0-9-]+$")
    module: Literal[
        "planificamos",
        "evaluamos",
        "incluimos",
        "reforzamos",
        "acompanamos",
        "tutoria",
        "recursos",
    ]
    tool_title: str = Field(min_length=3, max_length=160)
    artifact_type: Literal[
        "documento", "instrumento", "analisis", "comunicacion", "recurso", "actividad"
    ]
    fields: dict[str, str]
    requested_sections: list[str] = Field(min_length=1, max_length=16)

    @field_validator("tool_title")
    @classmethod
    def strip_workflow_title(cls, value: str) -> str:
        return value.strip()

    @field_validator("fields")
    @classmethod
    def validate_workflow_fields(cls, values: dict[str, str]) -> dict[str, str]:
        if not values or len(values) > 120:
            raise ValueError("The workflow must include between 1 and 120 fields")
        cleaned: dict[str, str] = {}
        for key, value in values.items():
            clean_key = key.strip()
            clean_value = value.strip()
            if not clean_key or len(clean_key) > 80 or len(clean_value) > 8000:
                raise ValueError("Invalid workflow field")
            cleaned[clean_key] = clean_value
        return cleaned

    @field_validator("requested_sections")
    @classmethod
    def validate_requested_sections(cls, values: list[str]) -> list[str]:
        cleaned = [value.strip() for value in values]
        if any(not value or len(value) > 120 for value in cleaned):
            raise ValueError("Invalid workflow section")
        if len(set(value.casefold() for value in cleaned)) != len(cleaned):
            raise ValueError("Workflow sections must be unique")
        return cleaned

    @model_validator(mode="after")
    def validate_resource_limits(self) -> "WorkflowGenerationRequest":
        """Keep puzzle limits consistent even when a client bypasses the UI."""
        from app.modules.ai.tool_contracts import get_tool_contract

        get_tool_contract(self.module, self.tool_id)
        if self.tool_id in {"crucigramas", "sopas-letras"} and "word_count" in self.fields:
            try:
                word_count = int(self.fields["word_count"])
            except (TypeError, ValueError) as exc:
                raise ValueError("word_count must be an integer") from exc
            if not 5 <= word_count <= 30:
                raise ValueError("word_count must be between 5 and 30")
        if self.tool_id == "examen":
            try:
                question_count = int(self.fields.get("question_count", "0"))
                total_score = int(self.fields.get("total_score", "20"))
            except (TypeError, ValueError) as exc:
                raise ValueError("question_count and total_score must be integers") from exc
            if not 5 <= question_count <= 30:
                raise ValueError("question_count must be between 5 and 30")
            if not 10 <= total_score <= 100:
                raise ValueError("total_score must be between 10 and 100")
        if self.tool_id == "preguntas-texto":
            try:
                counts = [
                    int(self.fields.get(field, "0"))
                    for field in ("literal_count", "inferential_count", "critical_count")
                ]
            except (TypeError, ValueError) as exc:
                raise ValueError("question distribution values must be integers") from exc
            if any(count < 0 or count > 10 for count in counts) or not 1 <= sum(counts) <= 30:
                raise ValueError("question distribution must total between 1 and 30")
        if self.tool_id == "ficha-aprendizaje":
            try:
                activity_count = int(self.fields.get("activity_count", "0"))
            except (TypeError, ValueError) as exc:
                raise ValueError("activity_count must be an integer") from exc
            if not 2 <= activity_count <= 12:
                raise ValueError("activity_count must be between 2 and 12")
        return self


class GeneratedWorkflowSection(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=2, max_length=140)
    narrative: str = Field(min_length=20, max_length=5000)
    key_points: list[str] = Field(min_length=1, max_length=40)

    @field_validator("title", "narrative")
    @classmethod
    def strip_workflow_section_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("key_points")
    @classmethod
    def validate_workflow_key_points(cls, values: list[str]) -> list[str]:
        cleaned = [value.strip() for value in values]
        if any(len(value) < 3 or len(value) > 900 for value in cleaned):
            raise ValueError("Invalid workflow key point")
        return cleaned


class WorkflowActivityItem(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str = Field(min_length=1, max_length=48)
    prompt: str = Field(min_length=1, max_length=1200)
    answer: str = Field(min_length=1, max_length=1200)
    hint: str = Field(default="", max_length=700)
    options: list[str] = Field(default_factory=list, max_length=8)
    response_type: Literal[
        "texto_breve", "desarrollo", "operacion", "tabla", "dibujo", "producto_adjunto"
    ] = "texto_breve"

    @field_validator("id", "prompt", "answer", "hint")
    @classmethod
    def strip_activity_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("options")
    @classmethod
    def validate_activity_options(cls, values: list[str]) -> list[str]:
        cleaned = [value.strip() for value in values if value.strip()]
        if any(len(value) > 280 for value in cleaned):
            raise ValueError("Invalid activity option")
        return cleaned


class WorkflowActivity(BaseModel):
    model_config = ConfigDict(extra="forbid")

    mode: str = Field(min_length=2, max_length=48)
    title: str = Field(min_length=2, max_length=180)
    instructions: str = Field(min_length=3, max_length=900)
    items: list[WorkflowActivityItem] = Field(default_factory=list, max_length=30)
    word_bank: list[str] = Field(default_factory=list, max_length=40)

    @field_validator("mode", "title", "instructions")
    @classmethod
    def strip_activity_content(cls, value: str) -> str:
        return value.strip()

    @field_validator("word_bank")
    @classmethod
    def validate_word_bank(cls, values: list[str]) -> list[str]:
        return [value.strip() for value in values if value.strip()]


class WorkflowArtifactTable(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str = Field(min_length=3, max_length=180)
    columns: list[str] = Field(min_length=2, max_length=20)
    rows: list[list[str]] = Field(min_length=1, max_length=80)
    note: str = Field(default="", max_length=700)

    @field_validator("title", "note")
    @classmethod
    def strip_table_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("columns")
    @classmethod
    def validate_table_columns(cls, values: list[str]) -> list[str]:
        cleaned = [value.strip() for value in values]
        if any(len(value) < 1 or len(value) > 120 for value in cleaned):
            raise ValueError("Invalid table column")
        if len({value.casefold() for value in cleaned}) != len(cleaned):
            raise ValueError("Table columns must be unique")
        return cleaned

    @model_validator(mode="after")
    def validate_table_rows(self) -> "WorkflowArtifactTable":
        column_count = len(self.columns)
        for row in self.rows:
            if len(row) != column_count:
                raise ValueError("Every table row must match the column count")
            if any(not str(cell).strip() or len(str(cell).strip()) > 1200 for cell in row):
                raise ValueError("Invalid table cell")
        self.rows = [[str(cell).strip() for cell in row] for row in self.rows]
        return self


class GeneratedWorkflowArtifact(BaseModel):
    model_config = ConfigDict(extra="forbid")

    document_title: str = Field(min_length=3, max_length=180)
    executive_summary: str = Field(min_length=30, max_length=1400)
    sections: list[GeneratedWorkflowSection] = Field(min_length=1, max_length=16)
    teacher_recommendations: list[str] = Field(min_length=2, max_length=8)
    activity: WorkflowActivity | None = None
    tables: list[WorkflowArtifactTable] = Field(default_factory=list, max_length=20)


class GenerationQualityCheck(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str = Field(min_length=2, max_length=64)
    label: str = Field(min_length=3, max_length=160)
    passed: bool
    detail: str = Field(min_length=3, max_length=500)
    severity: Literal["P0", "P1", "P2"] = "P1"


class WorkflowGenerationResponse(GeneratedWorkflowArtifact):
    model: str
    contract_version: str = "2026.09"
    generation_brief: str = ""
    quality_checks: list[GenerationQualityCheck] = Field(default_factory=list, max_length=24)
    warnings: list[str] = Field(default_factory=list, max_length=12)
    quality_status: Literal["ready", "review", "blocked"] = "ready"
    suggested_next_tools: list[str] = Field(default_factory=list, max_length=12)
    repair_attempted: bool = False
    repair_succeeded: bool = False
    repair_notes: list[str] = Field(default_factory=list, max_length=12)


class CopilotRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    message: str = Field(min_length=2, max_length=2400)
    tool_title: str = Field(min_length=2, max_length=180)
    module: str = Field(min_length=2, max_length=80)
    form_values: dict[str, str] = Field(default_factory=dict)

    @field_validator("message", "tool_title", "module")
    @classmethod
    def strip_copilot_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("form_values")
    @classmethod
    def validate_copilot_values(cls, values: dict[str, str]) -> dict[str, str]:
        if len(values) > 120:
            raise ValueError("Too many contextual fields")
        return {
            key.strip(): value.strip()
            for key, value in values.items()
            if key.strip() and len(key) <= 80 and len(value) <= 5000
        }


class CopilotResponse(BaseModel):
    reply: str
    model: str


class FieldAssistRequest(BaseModel):
    """Structured context for a field-specific legacy AI action.

    The browser sends facts and answers, while the API owns the final Gemini
    instruction. This prevents a generic client prompt from being reused for
    unrelated fields.
    """

    model_config = ConfigDict(extra="forbid")

    tool_id: str = Field(min_length=2, max_length=120)
    tool_title: str = Field(min_length=2, max_length=180)
    module: str = Field(min_length=2, max_length=80)
    field_id: str = Field(min_length=2, max_length=120)
    field_label: str = Field(min_length=2, max_length=180)
    question1: str = Field(min_length=2, max_length=500)
    answer1: str = Field(default="", max_length=1200)
    question2: str = Field(min_length=2, max_length=500)
    answer2: str = Field(default="", max_length=1200)
    selected_suggestions: list[str] = Field(default_factory=list, max_length=12)
    custom_detail: str = Field(default="", max_length=1600)
    current_value: str = Field(default="", max_length=6000)
    form_values: dict[str, str] = Field(default_factory=dict)
    pedagogical_context: dict[str, object] = Field(default_factory=dict)
    context_fingerprint: str = Field(default="", max_length=80)
    assistance_mode: Literal["quick", "complete", "guided"] = "complete"

    @field_validator(
        "tool_id",
        "tool_title",
        "module",
        "field_id",
        "field_label",
        "question1",
        "answer1",
        "question2",
        "answer2",
        "custom_detail",
        "current_value",
        "context_fingerprint",
    )
    @classmethod
    def strip_field_assist_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("selected_suggestions")
    @classmethod
    def validate_suggestions(cls, values: list[str]) -> list[str]:
        normalized = [value.strip() for value in values if value.strip() and len(value) <= 300]
        return list(dict.fromkeys(normalized))

    @field_validator("form_values")
    @classmethod
    def validate_field_assist_values(cls, values: dict[str, str]) -> dict[str, str]:
        if len(values) > 120:
            raise ValueError("Too many contextual fields")
        return {
            key.strip(): value.strip()
            for key, value in values.items()
            if key.strip() and len(key) <= 80 and len(value) <= 5000
        }

    @field_validator("pedagogical_context")
    @classmethod
    def validate_pedagogical_context(cls, value: dict[str, object]) -> dict[str, object]:
        allowed = {
            "modality",
            "level",
            "grade",
            "area",
            "topic",
            "competency",
            "purpose",
            "evidence",
            "institution",
            "fingerprint",
            "status",
            "summary",
            "missing",
        }
        return {key: item for key, item in value.items() if key in allowed}


class FieldAssistFeedbackRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    tool_id: str = Field(min_length=2, max_length=120)
    field_id: str = Field(min_length=2, max_length=120)
    outcome: Literal["useful", "edited", "incorrect", "repetitive", "too_long", "discarded"]
    assistance_mode: Literal["quick", "complete", "guided"] = "complete"
    context_fingerprint: str = Field(default="", max_length=80)
    edited: bool = False


class AssistancePreferences(BaseModel):
    model_config = ConfigDict(extra="forbid")

    consent: bool = False
    assistance_mode: Literal["quick", "complete", "guided"] = "complete"
    preferred_length: Literal["brief", "balanced", "detailed"] = "balanced"

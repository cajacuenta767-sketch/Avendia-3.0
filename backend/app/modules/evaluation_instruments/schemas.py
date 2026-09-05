import json
import re
from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

InstrumentKind = Literal[
    "checklist",
    "rubric",
    "observation",
    "recovery",
    "auxiliary_record",
    "learning_sheet",
    "text_questions",
]
InstrumentStatus = Literal["draft", "generated", "archived"]
ParticipantRole = Literal["student", "team_member", "group"]
ChecklistValue = Literal["yes", "no", "in_progress"]


def _single_line(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def _optional_text(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


class LevelWrite(BaseModel):
    client_key: str = Field(min_length=1, max_length=64, pattern=r"^[A-Za-z0-9_.:-]+$")
    code: str = Field(min_length=1, max_length=24)
    label: str = Field(min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=5000)
    score: float | None = Field(default=None, ge=-1000, le=1000)
    sort_order: int = Field(default=0, ge=0, le=1000)

    @field_validator("client_key", "code", "label", mode="before")
    @classmethod
    def clean_required(cls, value: object) -> object:
        return _single_line(value) if isinstance(value, str) else value

    @field_validator("description", mode="before")
    @classmethod
    def clean_optional(cls, value: object) -> object:
        return _optional_text(value) if isinstance(value, str) else value


class CriterionWrite(BaseModel):
    client_key: str = Field(min_length=1, max_length=64, pattern=r"^[A-Za-z0-9_.:-]+$")
    code: str = Field(min_length=1, max_length=24)
    title: str = Field(min_length=2, max_length=240)
    description: str | None = Field(default=None, max_length=10000)
    weight: float | None = Field(default=None, ge=0, le=100)
    sort_order: int = Field(default=0, ge=0, le=1000)
    levels: list[LevelWrite] = Field(default_factory=list, max_length=20)

    @field_validator("client_key", "code", "title", mode="before")
    @classmethod
    def clean_required(cls, value: object) -> object:
        return _single_line(value) if isinstance(value, str) else value

    @field_validator("description", mode="before")
    @classmethod
    def clean_optional(cls, value: object) -> object:
        return _optional_text(value) if isinstance(value, str) else value

    @model_validator(mode="after")
    def unique_levels(self) -> "CriterionWrite":
        keys = [level.client_key.casefold() for level in self.levels]
        codes = [level.code.casefold() for level in self.levels]
        if len(keys) != len(set(keys)):
            raise ValueError("Los identificadores de nivel no pueden repetirse en un criterio.")
        if len(codes) != len(set(codes)):
            raise ValueError("Los códigos de nivel no pueden repetirse en un criterio.")
        return self


class ParticipantWrite(BaseModel):
    student_id: UUID
    role: ParticipantRole = "student"
    team_name: str | None = Field(default=None, max_length=120)
    sort_order: int = Field(default=0, ge=0, le=10000)
    common_notes: str | None = Field(default=None, max_length=10000)
    individual_notes: str | None = Field(default=None, max_length=10000)

    @field_validator("team_name", mode="before")
    @classmethod
    def clean_team_name(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        return _single_line(value) or None

    @field_validator("common_notes", "individual_notes", mode="before")
    @classmethod
    def clean_notes(cls, value: object) -> object:
        return _optional_text(value) if isinstance(value, str) else value


class RecordWrite(BaseModel):
    student_id: UUID
    criterion_key: str = Field(min_length=1, max_length=64)
    level_key: str | None = Field(default=None, max_length=64)
    value: ChecklistValue | None = None
    evidence: str | None = Field(default=None, max_length=20000)
    strength: str | None = Field(default=None, max_length=10000)
    improvement: str | None = Field(default=None, max_length=10000)
    recommendation: str | None = Field(default=None, max_length=10000)
    teacher_decision: str | None = Field(default=None, max_length=10000)
    observation: str | None = Field(default=None, max_length=10000)

    @field_validator("criterion_key", mode="before")
    @classmethod
    def clean_key(cls, value: object) -> object:
        return _single_line(value) if isinstance(value, str) else value

    @field_validator("level_key", mode="before")
    @classmethod
    def clean_optional_key(cls, value: object) -> object:
        if not isinstance(value, str):
            return value
        return _single_line(value) or None

    @field_validator(
        "evidence",
        "strength",
        "improvement",
        "recommendation",
        "teacher_decision",
        "observation",
        mode="before",
    )
    @classmethod
    def clean_text(cls, value: object) -> object:
        return _optional_text(value) if isinstance(value, str) else value


class ObservationWrite(BaseModel):
    student_id: UUID | None = None
    observed_at: datetime
    situation: str = Field(min_length=2, max_length=10000)
    focus: str = Field(min_length=2, max_length=10000)
    objective_facts: str = Field(min_length=2, max_length=20000)
    context_factors: str | None = Field(default=None, max_length=10000)
    interpretation: str | None = Field(default=None, max_length=10000)
    conclusion: str | None = Field(default=None, max_length=10000)
    commitments: str | None = Field(default=None, max_length=10000)
    common_to_group: bool = False

    @field_validator("situation", "focus", "objective_facts", mode="before")
    @classmethod
    def clean_required(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator(
        "context_factors", "interpretation", "conclusion", "commitments", mode="before"
    )
    @classmethod
    def clean_optional(cls, value: object) -> object:
        return _optional_text(value) if isinstance(value, str) else value


class InstrumentWrite(BaseModel):
    kind: InstrumentKind
    title: str = Field(min_length=3, max_length=240)
    roster_id: UUID | None = None
    status: Literal["draft", "generated"] = "draft"
    general_data: dict[str, object] = Field(default_factory=dict)
    settings: dict[str, object] = Field(default_factory=dict)
    general_observation: str | None = Field(default=None, max_length=20000)
    participants: list[ParticipantWrite] = Field(default_factory=list, max_length=5000)
    criteria: list[CriterionWrite] = Field(default_factory=list, max_length=200)
    records: list[RecordWrite] = Field(default_factory=list, max_length=100000)
    observations: list[ObservationWrite] = Field(default_factory=list, max_length=20000)

    @field_validator("title", mode="before")
    @classmethod
    def clean_title(cls, value: object) -> object:
        return _single_line(value) if isinstance(value, str) else value

    @field_validator("general_observation", mode="before")
    @classmethod
    def clean_general_observation(cls, value: object) -> object:
        return _optional_text(value) if isinstance(value, str) else value

    @model_validator(mode="after")
    def validate_composite_references(self) -> "InstrumentWrite":
        if self.participants and self.roster_id is None:
            raise ValueError("Selecciona una nómina antes de añadir estudiantes.")

        student_ids = [participant.student_id for participant in self.participants]
        if len(student_ids) != len(set(student_ids)):
            raise ValueError("Un estudiante no puede aparecer dos veces como participante.")

        criterion_keys = [criterion.client_key.casefold() for criterion in self.criteria]
        criterion_codes = [criterion.code.casefold() for criterion in self.criteria]
        if len(criterion_keys) != len(set(criterion_keys)):
            raise ValueError("Los identificadores de criterio no pueden repetirse.")
        if len(criterion_codes) != len(set(criterion_codes)):
            raise ValueError("Los códigos de criterio no pueden repetirse.")

        criteria_by_key = {
            criterion.client_key.casefold(): criterion for criterion in self.criteria
        }
        participant_set = set(student_ids)
        record_pairs: set[tuple[UUID, str]] = set()
        for record in self.records:
            key = record.criterion_key.casefold()
            if record.student_id not in participant_set:
                raise ValueError("Cada registro debe corresponder a un participante seleccionado.")
            criterion = criteria_by_key.get(key)
            if criterion is None:
                raise ValueError("Cada registro debe corresponder a un criterio existente.")
            pair = (record.student_id, key)
            if pair in record_pairs:
                raise ValueError("Solo puede existir un registro por estudiante y criterio.")
            record_pairs.add(pair)
            if record.level_key is not None:
                level_keys = {level.client_key.casefold() for level in criterion.levels}
                if record.level_key.casefold() not in level_keys:
                    raise ValueError("El nivel elegido no pertenece al criterio del registro.")

        for observation in self.observations:
            if observation.student_id is not None and observation.student_id not in participant_set:
                raise ValueError(
                    "Cada observación individual requiere un participante seleccionado."
                )

        try:
            general_size = len(json.dumps(self.general_data, ensure_ascii=False, default=str))
            settings_size = len(json.dumps(self.settings, ensure_ascii=False, default=str))
        except (TypeError, ValueError) as exc:
            raise ValueError("Los datos generales y ajustes deben ser JSON válidos.") from exc
        if general_size > 200_000 or settings_size > 200_000:
            raise ValueError("Los datos generales o ajustes exceden el límite permitido.")

        if self.status == "generated" and self.kind == "rubric":
            if not 3 <= len(self.criteria) <= 6:
                raise ValueError("Una rúbrica final debe contener entre 3 y 6 criterios.")
            if not self.participants:
                raise ValueError("Una rúbrica final debe estar vinculada a estudiantes.")
            criterion_titles = [criterion.title.casefold() for criterion in self.criteria]
            if len(criterion_titles) != len(set(criterion_titles)):
                raise ValueError("Los criterios de una rúbrica final no pueden repetirse.")

            expected_level_codes: tuple[str, ...] | None = None
            for criterion in self.criteria:
                if not 3 <= len(criterion.levels) <= 4:
                    raise ValueError("Cada criterio de la rúbrica debe tener 3 o 4 niveles.")
                level_codes = tuple(level.code.casefold() for level in criterion.levels)
                if expected_level_codes is None:
                    expected_level_codes = level_codes
                elif level_codes != expected_level_codes:
                    raise ValueError(
                        "Todos los criterios deben utilizar la misma escala y el mismo orden."
                    )
                descriptions = [
                    (level.description or "").casefold().strip() for level in criterion.levels
                ]
                if any(len(description.split()) < 4 for description in descriptions):
                    raise ValueError(
                        "Cada nivel debe describir una evidencia observable y suficiente."
                    )
                if len(descriptions) != len(set(descriptions)):
                    raise ValueError(
                        "Los niveles de un criterio deben tener descriptores diferentes."
                    )

            if self.settings.get("weighted") is True:
                weights = [criterion.weight for criterion in self.criteria]
                if (
                    any(weight is None for weight in weights)
                    or abs(sum(weight or 0 for weight in weights) - 100) > 0.001
                ):
                    raise ValueError("Las ponderaciones de la rúbrica deben sumar 100%.")

            expected_records = len(self.participants) * len(self.criteria)
            if len(self.records) != expected_records:
                raise ValueError(
                    "La rúbrica final debe conservar un registro por estudiante y criterio."
                )
            if any(
                record.level_key is None
                or not record.evidence
                or not record.strength
                or not record.improvement
                or not record.recommendation
                for record in self.records
            ):
                raise ValueError(
                    "Cada valoración final requiere nivel, evidencia y retroalimentación completa."
                )

        if self.status == "generated" and self.kind == "checklist":
            if len(self.criteria) < 2:
                raise ValueError("Una lista de cotejo final requiere al menos dos indicadores.")
            if not self.participants:
                raise ValueError("Una lista de cotejo final debe incluir estudiantes.")
            indicator_titles = [criterion.title.casefold() for criterion in self.criteria]
            if len(indicator_titles) != len(set(indicator_titles)):
                raise ValueError("Los indicadores de la lista de cotejo no pueden repetirse.")
            expected_records = len(self.participants) * len(self.criteria)
            if len(self.records) != expected_records or any(
                record.value is None for record in self.records
            ):
                raise ValueError(
                    "La lista final debe registrar una respuesta por estudiante e indicador."
                )

        if self.status == "generated" and self.kind == "observation":
            if not self.participants:
                raise ValueError("Una ficha de observación final debe incluir estudiantes.")
            if not self.criteria:
                raise ValueError("Una ficha de observación final requiere criterios observables.")
            criterion_titles = [criterion.title.casefold() for criterion in self.criteria]
            if len(criterion_titles) != len(set(criterion_titles)):
                raise ValueError("Los criterios de observación no pueden repetirse.")
            if not self.observations:
                raise ValueError(
                    "La ficha final requiere al menos un registro de hechos objetivos."
                )
            if any(
                len(observation.objective_facts.split()) < 5 for observation in self.observations
            ):
                raise ValueError("Cada registro debe describir hechos objetivos suficientes.")
            if any(
                not observation.interpretation
                or not observation.conclusion
                or not observation.commitments
                for observation in self.observations
            ):
                raise ValueError(
                    "Cada observación final requiere interpretación, conclusión y compromisos."
                )
            observed_student_ids = {
                observation.student_id
                for observation in self.observations
                if observation.student_id is not None
            }
            mode = str(self.settings.get("mode", "individual"))
            if mode in {"individual", "multiple", "team"} and not observed_student_ids:
                raise ValueError(
                    "La ficha final requiere al menos un registro individual para la selección."
                )

        if self.status == "generated" and self.kind in {"learning_sheet", "text_questions"}:
            source = self.general_data.get("source")
            if not isinstance(source, dict):
                raise ValueError("El instrumento final debe conservar su contenido fuente.")
            pasted_text = source.get("pasted_text")
            source_references = source.get("sources")
            has_source = bool(isinstance(pasted_text, str) and pasted_text.strip()) or bool(
                isinstance(source_references, list) and source_references
            )
            if not has_source:
                raise ValueError("Añade o sube un contenido fuente antes de finalizar.")

            artifact = self.settings.get("generated_artifact")
            if not isinstance(artifact, dict):
                raise ValueError("Genera y revisa el contenido pedagógico antes de finalizar.")
            if artifact.get("quality_status") == "blocked":
                raise ValueError("El contenido generado no supera la validación pedagógica.")
            document_title = artifact.get("document_title")
            sections = artifact.get("sections")
            if not isinstance(document_title, str) or len(document_title.strip()) < 3:
                raise ValueError("El documento final requiere un título pedagógico válido.")
            if not isinstance(sections, list) or not sections:
                raise ValueError("El documento final requiere secciones pedagógicas utilizables.")

            points_by_title: dict[str, list[object]] = {}
            for section in sections:
                if not isinstance(section, dict):
                    raise ValueError(
                        "Las secciones generadas deben conservar una estructura válida."
                    )
                section_title = section.get("title")
                key_points = section.get("key_points")
                if not isinstance(section_title, str) or not isinstance(key_points, list):
                    raise ValueError("Cada sección requiere título y contenido estructurado.")
                points_by_title[section_title.casefold().strip()] = key_points

            if self.kind == "text_questions":
                requested_counts = {
                    "preguntas literales": int(self.settings.get("literal_count", 0) or 0),
                    "preguntas inferenciales": int(self.settings.get("inferential_count", 0) or 0),
                    "preguntas crítico-reflexivas": int(
                        self.settings.get("critical_count", 0) or 0
                    ),
                }
                total_questions = sum(requested_counts.values())
                if total_questions < 1 or any(
                    len(points_by_title.get(title, [])) != count
                    for title, count in requested_counts.items()
                ):
                    raise ValueError(
                        "La cantidad de preguntas finales debe coincidir con la "
                        "distribución solicitada."
                    )
                if len(points_by_title.get("respuestas esperadas", [])) < total_questions:
                    raise ValueError(
                        "La guía docente debe incluir una respuesta esperada por cada pregunta."
                    )

            if self.kind == "learning_sheet":
                activity_count = int(self.settings.get("activity_count", 0) or 0)
                activity_sections = ("activación", "práctica guiada", "aplicación", "reto")
                generated_activities = sum(
                    len(points_by_title.get(title, [])) for title in activity_sections
                )
                if not 2 <= activity_count <= 12 or generated_activities != activity_count:
                    raise ValueError(
                        "La ficha final debe contener exactamente las actividades solicitadas."
                    )
                if len(points_by_title.get("clave de respuestas", [])) < activity_count:
                    raise ValueError(
                        "La guía docente debe incluir una respuesta o pauta por actividad."
                    )
        return self


class InstrumentCreate(InstrumentWrite):
    pass


class DraftWrite(InstrumentWrite):
    expected_revision: int | None = Field(default=None, ge=0)


class InstrumentPatch(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=240)
    status: Literal["draft", "generated"] | None = None
    general_observation: str | None = Field(default=None, max_length=20000)

    @field_validator("title", mode="before")
    @classmethod
    def clean_title(cls, value: object) -> object:
        return _single_line(value) if isinstance(value, str) else value

    @field_validator("general_observation", mode="before")
    @classmethod
    def clean_observation(cls, value: object) -> object:
        return _optional_text(value) if isinstance(value, str) else value

    @model_validator(mode="after")
    def reject_null_required_fields(self) -> "InstrumentPatch":
        for field in ("title", "status"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"{field} no puede quedar vacío")
        return self


class LevelRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    client_key: str
    code: str
    label: str
    description: str | None
    score: float | None
    sort_order: int


class CriterionRead(BaseModel):
    id: UUID
    client_key: str
    code: str
    title: str
    description: str | None
    weight: float | None
    sort_order: int
    levels: list[LevelRead]


class ParticipantRead(BaseModel):
    id: UUID
    student_id: UUID
    student_name: str
    internal_code: str | None
    role: str
    team_name: str | None
    sort_order: int
    common_notes: str | None
    individual_notes: str | None


class RecordRead(BaseModel):
    id: UUID
    student_id: UUID
    criterion_id: UUID
    criterion_key: str
    level_id: UUID | None
    level_key: str | None
    value: str | None
    evidence: str | None
    strength: str | None
    improvement: str | None
    recommendation: str | None
    teacher_decision: str | None
    observation: str | None


class ObservationRead(BaseModel):
    id: UUID
    student_id: UUID | None
    observed_at: datetime
    situation: str
    focus: str
    objective_facts: str
    context_factors: str | None
    interpretation: str | None
    conclusion: str | None
    commitments: str | None
    common_to_group: bool


class SourceRead(BaseModel):
    id: UUID
    filename: str
    media_type: str
    extension: str
    byte_size: int
    sha256: str
    extracted_text: str
    extraction_status: str
    created_at: datetime
    instrument_revision: int


class SourceExtractionPreview(BaseModel):
    filename: str
    media_type: str
    extension: str
    byte_size: int
    sha256: str
    extracted_text: str
    extraction_status: Literal["completed"] = "completed"


class InstrumentRead(BaseModel):
    id: UUID
    kind: str
    title: str
    roster_id: UUID | None
    status: str
    general_data: dict[str, object]
    settings: dict[str, object]
    general_observation: str | None
    revision: int
    archived_at: datetime | None
    participants: list[ParticipantRead]
    criteria: list[CriterionRead]
    records: list[RecordRead]
    observations: list[ObservationRead]
    sources: list[SourceRead]
    created_at: datetime
    updated_at: datetime


class InstrumentSummary(BaseModel):
    id: UUID
    kind: str
    title: str
    roster_id: UUID | None
    status: str
    revision: int
    participant_count: int
    criterion_count: int
    archived_at: datetime | None
    created_at: datetime
    updated_at: datetime


class InstrumentListResponse(BaseModel):
    items: list[InstrumentSummary]
    total: int
    limit: int
    offset: int

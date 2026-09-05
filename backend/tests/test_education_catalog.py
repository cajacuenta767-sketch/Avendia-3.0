import pytest

from app.modules.users.education_catalog import validate_education_selection


@pytest.mark.parametrize(
    ("modality", "level", "grade"),
    [
        ("EBR", "Secundaria", "5° de Secundaria"),
        ("EBA", "EBA · Ciclo Avanzado", "4.º grado EBA"),
        ("EBE", "PRITE · Ciclo I", "2 años"),
        ("EBE", "CEBE · Primaria (ciclos III–V)", "6.º grado CEBE / TVA"),
    ],
)
def test_accepts_valid_modality_level_and_grade_combinations(
    modality: str,
    level: str,
    grade: str,
) -> None:
    validate_education_selection(modality, level, grade)


@pytest.mark.parametrize(
    ("modality", "level", "grade"),
    [
        ("EBA", "Secundaria", "3° de Secundaria"),
        ("EBE", "Secundaria", "1° de Secundaria"),
        ("EBR", "EBA · Ciclo Inicial", "1.er grado EBA"),
        ("EBE", "PRITE · Ciclo I", "1.er grado CEBE"),
    ],
)
def test_rejects_cross_modality_or_incompatible_grade_combinations(
    modality: str,
    level: str,
    grade: str,
) -> None:
    with pytest.raises(ValueError):
        validate_education_selection(modality, level, grade)

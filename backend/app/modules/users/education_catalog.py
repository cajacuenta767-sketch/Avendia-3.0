VALID_LEVELS_BY_MODALITY: dict[str, tuple[str, ...]] = {
    "EBR": ("Inicial", "Primaria", "Secundaria"),
    "EBA": ("EBA · Ciclo Inicial", "EBA · Ciclo Intermedio", "EBA · Ciclo Avanzado"),
    "EBE": ("PRITE · Ciclo I", "CEBE · Inicial (ciclo II)", "CEBE · Primaria (ciclos III–V)"),
}

VALID_GRADES_BY_LEVEL: dict[str, tuple[str, ...]] = {
    "Inicial": ("0 años", "1 año", "2 años", "3 años", "4 años", "5 años"),
    "Primaria": tuple(f"{grade}° de Primaria" for grade in range(1, 7)),
    "Secundaria": tuple(f"{grade}° de Secundaria" for grade in range(1, 6)),
    "EBA · Ciclo Inicial": ("1.er grado EBA", "2.º grado EBA"),
    "EBA · Ciclo Intermedio": ("1.er grado EBA", "2.º grado EBA", "3.er grado EBA"),
    "EBA · Ciclo Avanzado": ("1.er grado EBA", "2.º grado EBA", "3.er grado EBA", "4.º grado EBA"),
    "PRITE · Ciclo I": ("Menor de 1 año", "1 año", "2 años"),
    "CEBE · Inicial (ciclo II)": ("3 años", "4 años", "5 años"),
    "CEBE · Primaria (ciclos III–V)": (
        "1.er grado CEBE",
        "2.º grado CEBE",
        "3.er grado CEBE",
        "4.º grado CEBE",
        "5.º grado CEBE",
        "6.º grado CEBE / TVA",
    ),
}


def validate_education_selection(modality: str, level: str, grade: str) -> None:
    valid_levels = VALID_LEVELS_BY_MODALITY.get(modality)
    if valid_levels is None:
        raise ValueError("La modalidad educativa no es válida.")
    if level not in valid_levels:
        raise ValueError(f"El nivel o ciclo «{level}» no corresponde a la modalidad {modality}.")
    valid_grades = VALID_GRADES_BY_LEVEL.get(level, ())
    if grade not in valid_grades:
        raise ValueError(f"El grado o grupo «{grade}» no corresponde a «{level}».")

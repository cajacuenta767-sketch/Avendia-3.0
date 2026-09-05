export const educationModalities = [
  { value: "EBR", label: "EBR · Educación Básica Regular" },
  { value: "EBA", label: "EBA · Educación Básica Alternativa" },
  { value: "EBE", label: "EBE · Educación Básica Especial" },
] as const;

export type EducationModality = (typeof educationModalities)[number]["value"];

const ebrEducationLevels = ["Inicial", "Primaria", "Secundaria"] as const;
const ebaEducationLevels = ["EBA · Ciclo Inicial", "EBA · Ciclo Intermedio", "EBA · Ciclo Avanzado"] as const;
const ebeEducationLevels = ["PRITE · Ciclo I", "CEBE · Inicial (ciclo II)", "CEBE · Primaria (ciclos III–V)"] as const;

export type EducationLevel =
  | (typeof ebrEducationLevels)[number]
  | (typeof ebaEducationLevels)[number]
  | (typeof ebeEducationLevels)[number];

// Se conserva este alias para las pantallas EBR existentes. Los formularios
// nuevos deben usar getEducationLevels(modality).
export const educationLevels = ebrEducationLevels;

export const educationLevelsByModality: Record<EducationModality, readonly EducationLevel[]> = {
  EBR: ebrEducationLevels,
  EBA: ebaEducationLevels,
  EBE: ebeEducationLevels,
};

export function getEducationLevels(modality: string): readonly EducationLevel[] {
  const modalityCode = educationModalities.find((item) => modality.startsWith(item.value))?.value ?? "EBR";
  return educationLevelsByModality[modalityCode];
}

export const gradesByLevel: Record<string, string[]> = {
  Inicial: ["0 años", "1 año", "2 años", "3 años", "4 años", "5 años"],
  Primaria: ["1° de Primaria", "2° de Primaria", "3° de Primaria", "4° de Primaria", "5° de Primaria", "6° de Primaria"],
  Secundaria: ["1° de Secundaria", "2° de Secundaria", "3° de Secundaria", "4° de Secundaria", "5° de Secundaria"],
  "EBA · Ciclo Inicial": ["1.er grado EBA", "2.º grado EBA"],
  "EBA · Ciclo Intermedio": ["1.er grado EBA", "2.º grado EBA", "3.er grado EBA"],
  "EBA · Ciclo Avanzado": ["1.er grado EBA", "2.º grado EBA", "3.er grado EBA", "4.º grado EBA"],
  "PRITE · Ciclo I": ["Menor de 1 año", "1 año", "2 años"],
  "CEBE · Inicial (ciclo II)": ["3 años", "4 años", "5 años"],
  "CEBE · Primaria (ciclos III–V)": ["1.er grado CEBE", "2.º grado CEBE", "3.er grado CEBE", "4.º grado CEBE", "5.º grado CEBE", "6.º grado CEBE / TVA"],
};

export const areasByLevel: Record<string, string[]> = {
  Inicial: ["Personal Social", "Psicomotriz", "Comunicación", "Castellano como segunda lengua", "Descubrimiento del Mundo"],
  Primaria: ["Personal Social", "Educación Física", "Comunicación", "Arte y Cultura", "Castellano como segunda lengua", "Inglés", "Matemática", "Ciencia y Tecnología", "Educación Religiosa"],
  Secundaria: ["Desarrollo Personal, Ciudadanía y Cívica", "Ciencias Sociales", "Educación Física", "Comunicación", "Arte y Cultura", "Castellano como segunda lengua", "Inglés", "Matemática", "Ciencia y Tecnología", "Educación para el Trabajo", "Educación Religiosa", "Tutoría"],
  "EBA · Ciclo Inicial": ["Comunicación", "Castellano como segunda lengua", "Matemática", "Desarrollo Personal y Ciudadano", "Ciencia, Tecnología y Salud", "Educación para el Trabajo", "Educación Religiosa"],
  "EBA · Ciclo Intermedio": ["Comunicación", "Castellano como segunda lengua", "Matemática", "Desarrollo Personal y Ciudadano", "Ciencia, Tecnología y Salud", "Educación para el Trabajo", "Educación Religiosa", "Inglés"],
  "EBA · Ciclo Avanzado": ["Comunicación", "Castellano como segunda lengua", "Matemática", "Desarrollo Personal y Ciudadano", "Ciencia, Tecnología y Salud", "Educación para el Trabajo", "Educación Religiosa", "Inglés", "Educación Física", "Arte y Cultura"],
  "PRITE · Ciclo I": ["Personal Social", "Psicomotriz", "Comunicación", "Descubrimiento del Mundo"],
  "CEBE · Inicial (ciclo II)": ["Personal Social", "Psicomotriz", "Comunicación", "Matemática", "Descubrimiento del Mundo", "Arte y Cultura"],
  "CEBE · Primaria (ciclos III–V)": ["Personal Social", "Educación Física", "Comunicación", "Arte y Cultura", "Matemática", "Ciencia y Tecnología"],
};

export const competenciesByArea: Record<string, string[]> = {
  "Personal Social": [
    "Construye su identidad",
    "Convive y participa democráticamente en la búsqueda del bien común",
    "Construye interpretaciones históricas",
    "Gestiona responsablemente el espacio y el ambiente",
    "Gestiona responsablemente los recursos económicos",
  ],
  Psicomotriz: ["Se desenvuelve de manera autónoma a través de su motricidad"],
  Psicomotricidad: ["Se desenvuelve de manera autónoma a través de su motricidad"],
  Comunicación: [
    "Se comunica oralmente en su lengua materna",
    "Lee diversos tipos de textos escritos en su lengua materna",
    "Escribe diversos tipos de textos en su lengua materna",
  ],
  "Castellano como segunda lengua": [
    "Se comunica oralmente en castellano como segunda lengua",
    "Lee diversos tipos de textos escritos en castellano como segunda lengua",
    "Escribe diversos tipos de textos en castellano como segunda lengua",
  ],
  "Descubrimiento del Mundo": [
    "Indaga mediante métodos científicos para construir sus conocimientos",
    "Resuelve problemas de cantidad",
    "Resuelve problemas de forma, movimiento y localización",
  ],
  Matemática: [
    "Resuelve problemas de cantidad",
    "Resuelve problemas de regularidad, equivalencia y cambio",
    "Resuelve problemas de forma, movimiento y localización",
    "Resuelve problemas de gestión de datos e incertidumbre",
  ],
  "Ciencia y Tecnología": [
    "Indaga mediante métodos científicos para construir sus conocimientos",
    "Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo",
    "Diseña y construye soluciones tecnológicas para resolver problemas de su entorno",
  ],
  "Ciencia, Tecnología y Salud": [
    "Indaga mediante métodos científicos para construir sus conocimientos",
    "Explica el mundo físico basándose en conocimientos sobre los seres vivos, materia y energía, biodiversidad, Tierra y universo",
    "Diseña y construye soluciones tecnológicas para resolver problemas de su entorno",
    "Asume una vida saludable",
  ],
  "Desarrollo Personal, Ciudadanía y Cívica": [
    "Construye su identidad",
    "Convive y participa democráticamente en la búsqueda del bien común",
  ],
  "Desarrollo Personal y Ciudadano": [
    "Construye su identidad",
    "Convive y participa democráticamente en la búsqueda del bien común",
    "Construye interpretaciones históricas",
    "Gestiona responsablemente el espacio y el ambiente",
    "Gestiona responsablemente los recursos económicos",
  ],
  "Ciencias Sociales": [
    "Construye interpretaciones históricas",
    "Gestiona responsablemente el espacio y el ambiente",
    "Gestiona responsablemente los recursos económicos",
  ],
  "Educación Física": [
    "Se desenvuelve de manera autónoma a través de su motricidad",
    "Asume una vida saludable",
    "Interactúa a través de sus habilidades sociomotrices",
  ],
  "Arte y Cultura": [
    "Aprecia de manera crítica manifestaciones artístico-culturales",
    "Crea proyectos desde los lenguajes artísticos",
  ],
  Inglés: [
    "Se comunica oralmente en inglés como lengua extranjera",
    "Lee diversos tipos de textos escritos en inglés como lengua extranjera",
    "Escribe diversos tipos de textos en inglés como lengua extranjera",
  ],
  "Educación para el Trabajo": ["Gestiona proyectos de emprendimiento económico o social"],
  "Educación Religiosa": [
    "Construye su identidad como persona humana, amada por Dios, digna, libre y trascendente",
    "Asume la experiencia del encuentro personal y comunitario con Dios en su proyecto de vida",
  ],
  Tutoría: [
    "Construye su identidad",
    "Convive y participa democráticamente en la búsqueda del bien común",
  ],
};

export type DynamicEducationOptions = "levelsByModality" | "gradesByLevel" | "areasByLevel" | "competenciesByArea";

export function getDynamicEducationOptions(source: DynamicEducationOptions, parentValue: string): string[] {
  if (!parentValue) return [];
  if (source === "levelsByModality") return [...getEducationLevels(parentValue)];
  if (source === "gradesByLevel") return gradesByLevel[parentValue] ?? [];
  if (source === "areasByLevel") return areasByLevel[parentValue] ?? [];
  return competenciesByArea[parentValue] ?? [];
}

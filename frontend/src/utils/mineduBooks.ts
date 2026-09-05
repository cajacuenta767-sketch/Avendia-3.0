export interface MineduBook {
  id: string;
  title: string;
  type: "estudiante" | "docente";
}

export function getMineduBooks(area: string, gradeRaw: string): MineduBook[] {
  const cleanArea = (area || "").trim().toLowerCase();
  
  // Extract number from grade (e.g., "3ro de Secundaria" -> "3")
  const gradeMatch = (gradeRaw || "").match(/^(\d+)/);
  const gradeKey = gradeMatch ? gradeMatch[1] : "1";
  
  const gradeSuffixMap: Record<string, string> = {
    "1": "1ro",
    "2": "2do",
    "3": "3ro",
    "4": "4to",
    "5": "5to",
    "6": "6to"
  };
  const gradeWord = gradeSuffixMap[gradeKey] || `${gradeKey}to`;

  if (cleanArea.includes("matem")) {
    return [
      { id: `mat-${gradeKey}-te`, title: `Texto Escolar Matemática ${gradeWord} - MINEDU`, type: "estudiante" },
      { id: `mat-${gradeKey}-ct`, title: `Cuaderno de Trabajo Resolvamos Problemas ${gradeKey} - MINEDU`, type: "estudiante" },
      { id: `mat-${gradeKey}-md`, title: `Manual del Docente de Matemática ${gradeWord} - Editorial Santillana / MINEDU`, type: "docente" }
    ];
  }

  if (cleanArea.includes("comunic")) {
    return [
      { id: `com-${gradeKey}-te`, title: `Texto Escolar Comunicación ${gradeWord} - MINEDU`, type: "estudiante" },
      { id: `com-${gradeKey}-ct`, title: `Cuaderno de Trabajo El Encanto de las Palabras ${gradeKey} - MINEDU`, type: "estudiante" },
      { id: `com-${gradeKey}-md`, title: `Manual del Docente de Comunicación ${gradeWord} - Editorial SM / MINEDU`, type: "docente" }
    ];
  }

  if (cleanArea.includes("cienc")) {
    return [
      { id: `cyt-${gradeKey}-te`, title: `Texto Escolar Ciencia y Tecnología ${gradeWord} - MINEDU`, type: "estudiante" },
      { id: `cyt-${gradeKey}-ct`, title: `Guía de Actividades de Ciencia y Tecnología ${gradeWord} - MINEDU`, type: "estudiante" },
      { id: `cyt-${gradeKey}-md`, title: `Manual del Docente de Ciencia, Tecnología y Ambiente ${gradeWord} - MINEDU`, type: "docente" }
    ];
  }

  if (cleanArea.includes("person") || cleanArea.includes("social") || cleanArea.includes("desarrollo")) {
    return [
      { id: `ps-${gradeKey}-te`, title: `Texto Escolar Desarrollo Personal, Ciudadanía y Cívica ${gradeWord} - MINEDU`, type: "estudiante" },
      { id: `ps-${gradeKey}-ct`, title: `Fichas de Aprendizaje de Desarrollo Personal ${gradeWord} - MINEDU`, type: "estudiante" },
      { id: `ps-${gradeKey}-md`, title: `Guía para el Docente de Desarrollo Personal ${gradeWord} - MINEDU`, type: "docente" }
    ];
  }

  // Fallback default textbooks for any other curricular area
  return [
    { id: `gen-${gradeKey}-te`, title: `Texto Escolar de ${area || "Área Curricular"} ${gradeWord} - MINEDU`, type: "estudiante" },
    { id: `gen-${gradeKey}-ct`, title: `Cuaderno de Trabajo de ${area || "Área Curricular"} ${gradeKey} - MINEDU`, type: "estudiante" },
    { id: `gen-${gradeKey}-md`, title: `Guía Metodológica para el Docente de ${area || "Área Curricular"} ${gradeWord} - MINEDU`, type: "docente" }
  ];
}

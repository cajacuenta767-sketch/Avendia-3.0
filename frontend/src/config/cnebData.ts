export interface LevelData {
  grados: string[];
  ciclos?: string[];
  areas: string[];
}

export const CNEB_DATA: Record<"Inicial" | "Primaria" | "Secundaria", LevelData> = {
  Inicial: {
    grados: ["0-2 años", "3 años", "4 años", "5 años"],
    ciclos: ["Ciclo I", "Ciclo II"],
    areas: ["Comunicación", "Personal Social", "Psicomotriz", "Matemática", "Ciencia y Tecnología"],
  },
  Primaria: {
    grados: ["1er Grado", "2do Grado", "3er Grado", "4to Grado", "5to Grado", "6to Grado"],
    ciclos: ["Ciclo III", "Ciclo IV", "Ciclo V"],
    areas: [
      "Matemática",
      "Comunicación",
      "Inglés como Lengua Extranjera",
      "Arte y Cultura",
      "Personal Social",
      "Educación Física",
      "Ciencia y Tecnología",
      "Educación Religiosa",
    ],
  },
  Secundaria: {
    grados: ["1ro de Secundaria", "2do de Secundaria", "3ro de Secundaria", "4to de Secundaria", "5to de Secundaria"],
    ciclos: ["Ciclo VI", "Ciclo VII"],
    areas: [
      "Matemática",
      "Comunicación",
      "Inglés",
      "Arte y Cultura",
      "Ciencias Sociales",
      "Desarrollo Personal, Ciudadanía y Cívica (DPCC)",
      "Educación Física",
      "Educación Religiosa",
      "Ciencia y Tecnología",
      "Educación para el Trabajo (EPT)",
    ],
  },
};

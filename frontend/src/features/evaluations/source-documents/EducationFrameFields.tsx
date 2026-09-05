import { areasByLevel, educationModalities, getEducationLevels, gradesByLevel } from "../../../config/education";
import type { EducationFrame } from "./evaluationContracts";

type EducationFrameFieldsProps = {
  value: EducationFrame;
  onChange: (value: EducationFrame) => void;
  includeArea?: boolean;
};

export function EducationFrameFields({ value, onChange, includeArea = true }: EducationFrameFieldsProps) {
  const levels = getEducationLevels(value.modality);
  const grades = gradesByLevel[value.education_level] ?? [];
  const areas = areasByLevel[value.education_level] ?? [];

  function setField<Key extends keyof EducationFrame>(key: Key, next: EducationFrame[Key]) {
    const updated = { ...value, [key]: next };
    if (key === "modality") {
      updated.education_level = "";
      updated.grade_or_cycle = "";
      updated.curricular_area = "";
    } else if (key === "education_level") {
      updated.grade_or_cycle = "";
      updated.curricular_area = "";
    }
    onChange(updated);
  }

  return (
    <div className="evaluation-form-grid">
      <label>
        <span>Nombre del docente</span>
        <input value={value.teacher_name} onChange={(event) => setField("teacher_name", event.target.value)} placeholder="Ej. Prof. María Gómez" />
      </label>
      <label>
        <span>Institución educativa</span>
        <input value={value.institution_name} onChange={(event) => setField("institution_name", event.target.value)} placeholder="Ej. I.E. N.° 5143 República del Perú" />
      </label>
      <label>
        <span>Modalidad educativa</span>
        <select value={value.modality} onChange={(event) => setField("modality", event.target.value as EducationFrame["modality"])}>
          {educationModalities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
      </label>
      <label>
        <span>Nivel educativo</span>
        <select value={value.education_level} onChange={(event) => setField("education_level", event.target.value)}>
          <option value="">Selecciona un nivel</option>
          {levels.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label>
        <span>Grado o ciclo</span>
        <select value={value.grade_or_cycle} onChange={(event) => setField("grade_or_cycle", event.target.value)} disabled={!value.education_level}>
          <option value="">{value.education_level ? "Selecciona un grado o ciclo" : "Primero selecciona el nivel"}</option>
          {grades.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
      </label>
      <label>
        <span>Sección</span>
        <input value={value.section} onChange={(event) => setField("section", event.target.value)} placeholder="Ej. A" />
      </label>
      {includeArea ? (
        <label className="evaluation-field--wide">
          <span>Área curricular (CNEB)</span>
          <select value={value.curricular_area} onChange={(event) => setField("curricular_area", event.target.value)} disabled={!value.education_level}>
            <option value="">{value.education_level ? "Selecciona un área" : "Primero selecciona el nivel"}</option>
            {areas.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      ) : null}
    </div>
  );
}

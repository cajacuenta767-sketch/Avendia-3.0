import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import type { RubricCriterion, RubricLevel } from "./rubricTypes";

type Props = {
  criteria: RubricCriterion[];
  levels: RubricLevel[];
  weighted: boolean;
  onCriteriaChange: (criteria: RubricCriterion[]) => void;
  onLevelsChange: (levels: RubricLevel[]) => void;
};

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function recodeCriteria(criteria: RubricCriterion[]) {
  return criteria.map((criterion, index) => ({ ...criterion, code: `C${index + 1}` }));
}

export function RubricBuilder({ criteria, levels, weighted, onCriteriaChange, onLevelsChange }: Props) {
  function addCriterion() {
    if (criteria.length >= 6) return;
    onCriteriaChange([...criteria, {
      id: uid("criterion"),
      code: `C${criteria.length + 1}`,
      title: "",
      description: "",
      weight: weighted ? 0 : null,
      descriptors: Object.fromEntries(levels.map((level) => [level.id, ""])),
    }]);
  }

  function updateCriterion(id: string, patch: Partial<RubricCriterion>) {
    onCriteriaChange(criteria.map((criterion) => criterion.id === id ? { ...criterion, ...patch } : criterion));
  }

  function moveCriterion(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= criteria.length) return;
    const next = [...criteria];
    [next[index], next[target]] = [next[target], next[index]];
    onCriteriaChange(recodeCriteria(next));
  }

  function removeCriterion(id: string) {
    if (criteria.length <= 3) return;
    onCriteriaChange(recodeCriteria(criteria.filter((criterion) => criterion.id !== id)));
  }

  function addLevel() {
    if (levels.length >= 4) return;
    const nextLevel: RubricLevel = { id: uid("level"), code: `N${levels.length + 1}`, label: "Nuevo nivel", score: levels.length + 1 };
    onLevelsChange([...levels, nextLevel]);
    onCriteriaChange(criteria.map((criterion) => ({ ...criterion, descriptors: { ...criterion.descriptors, [nextLevel.id]: "" } })));
  }

  function updateLevel(id: string, patch: Partial<RubricLevel>) {
    onLevelsChange(levels.map((level) => level.id === id ? { ...level, ...patch } : level));
  }

  function removeLevel(id: string) {
    if (levels.length <= 3) return;
    onLevelsChange(levels.filter((level) => level.id !== id));
    onCriteriaChange(criteria.map((criterion) => {
      const descriptors = { ...criterion.descriptors };
      delete descriptors[id];
      return { ...criterion, descriptors };
    }));
  }

  return (
    <div className="rubric-builder">
      <section className="rubric-levels" aria-labelledby="rubric-levels-title">
        <header><div><span>Escala configurable</span><h3 id="rubric-levels-title">Niveles de logro</h3><p>Usa AD/A/B/C o adapta los nombres a la escala institucional.</p></div><button type="button" className="evaluation-secondary" onClick={addLevel} disabled={levels.length >= 4}><Plus /> Añadir nivel</button></header>
        <div className="rubric-levels__grid">
          {levels.map((level) => (
            <fieldset key={level.id}>
              <legend>{level.code}</legend>
              <label><span>Código</span><input value={level.code} onChange={(event) => updateLevel(level.id, { code: event.target.value })} aria-label={`Código de ${level.label}`} /></label>
              <label><span>Nombre</span><input value={level.label} onChange={(event) => updateLevel(level.id, { label: event.target.value })} aria-label={`Nombre de nivel ${level.code}`} /></label>
              <label><span>Puntaje</span><input type="number" min={0} max={100} value={level.score} onChange={(event) => updateLevel(level.id, { score: Number(event.target.value) })} aria-label={`Puntaje de ${level.code}`} /></label>
              <button type="button" onClick={() => removeLevel(level.id)} disabled={levels.length <= 3} aria-label={`Eliminar nivel ${level.code}`}><Trash2 /></button>
            </fieldset>
          ))}
        </div>
      </section>

      <section className="rubric-criteria" aria-labelledby="rubric-criteria-title">
        <header><div><span>Entre 3 y 6 criterios</span><h3 id="rubric-criteria-title">Criterios y descriptores</h3><p>Describe evidencias observables para cada nivel; evita adjetivos sin evidencia.</p></div><button type="button" className="evaluation-secondary" onClick={addCriterion} disabled={criteria.length >= 6}><Plus /> Añadir criterio</button></header>
        <ol>
          {criteria.map((criterion, index) => (
            <li key={criterion.id} className="rubric-criterion-card">
              <header>
                <span>{criterion.code}</span>
                <div className="rubric-criterion-card__actions">
                  <button type="button" onClick={() => moveCriterion(index, -1)} disabled={index === 0} aria-label={`Subir ${criterion.code}`}><ArrowUp /></button>
                  <button type="button" onClick={() => moveCriterion(index, 1)} disabled={index === criteria.length - 1} aria-label={`Bajar ${criterion.code}`}><ArrowDown /></button>
                  <button type="button" onClick={() => removeCriterion(criterion.id)} disabled={criteria.length <= 3} aria-label={`Eliminar ${criterion.code}`}><Trash2 /></button>
                </div>
              </header>
              <div className="rubric-criterion-card__main">
                <label><span>Título del criterio</span><input value={criterion.title} onChange={(event) => updateCriterion(criterion.id, { title: event.target.value })} placeholder="Ej. Sustenta su respuesta con evidencias" /></label>
                {weighted ? <label><span>Ponderación (%)</span><input type="number" min={0} max={100} value={criterion.weight ?? 0} onChange={(event) => updateCriterion(criterion.id, { weight: Number(event.target.value) })} /></label> : null}
                <label className="rubric-field--wide"><span>Qué se observará</span><textarea rows={2} value={criterion.description} onChange={(event) => updateCriterion(criterion.id, { description: event.target.value })} placeholder="Ej. Selecciona datos pertinentes y explica cómo respaldan su conclusión." /></label>
              </div>
              <div className="rubric-descriptors-scroll" role="region" aria-label={`Descriptores de ${criterion.code}`} tabIndex={0}>
                <div className="rubric-descriptors" style={{ gridTemplateColumns: `repeat(${levels.length}, minmax(210px, 1fr))` }}>
                  {levels.map((level) => <label key={level.id}><span><strong>{level.code}</strong>{level.label}</span><textarea rows={4} value={criterion.descriptors[level.id] ?? ""} onChange={(event) => updateCriterion(criterion.id, { descriptors: { ...criterion.descriptors, [level.id]: event.target.value } })} placeholder={`Ej. En ${level.label.toLowerCase()}, explica el descriptor observable.`} /></label>)}
                </div>
              </div>
            </li>
          ))}
        </ol>
        <p className="rubric-builder__count" role="status">{criteria.length} criterios · {levels.length} niveles</p>
      </section>
    </div>
  );
}


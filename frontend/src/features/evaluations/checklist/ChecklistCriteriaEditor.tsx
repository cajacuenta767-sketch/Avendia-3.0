import { ArrowDown, ArrowUp, Plus, Sparkles, Trash2 } from "lucide-react";

import type { ChecklistCriterion } from "./checklistTypes";

type Props = {
  criteria: ChecklistCriterion[];
  onChange: (criteria: ChecklistCriterion[]) => void;
  maxCriteria?: number;
  onSuggest?: () => void;
};

function localId() {
  return `criterion-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function recode(criteria: ChecklistCriterion[]) {
  return criteria.map((criterion, index) => ({ ...criterion, code: `C${index + 1}` }));
}

export function ChecklistCriteriaEditor({ criteria, onChange, maxCriteria = 12, onSuggest }: Props) {
  function update(id: string, description: string) {
    onChange(criteria.map((criterion) => criterion.id === id ? { ...criterion, description } : criterion));
  }

  function move(index: number, offset: -1 | 1) {
    const target = index + offset;
    if (target < 0 || target >= criteria.length) return;
    const next = [...criteria];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(recode(next));
  }

  function remove(id: string) {
    if (criteria.length <= 1) return;
    onChange(recode(criteria.filter((criterion) => criterion.id !== id)));
  }

  function add() {
    if (criteria.length >= maxCriteria) return;
    onChange([...criteria, { id: localId(), code: `C${criteria.length + 1}`, description: "" }]);
  }

  return (
    <section className="checklist-criteria" aria-labelledby="checklist-criteria-title">
      <header>
        <div>
          <span>Construcción del instrumento</span>
          <h3 id="checklist-criteria-title">Criterios de evaluación</h3>
          <p>Escribe una conducta observable por fila. El código se actualiza al reordenar.</p>
        </div>
        <div className="checklist-criteria__header-actions">
          {onSuggest ? <button type="button" className="evaluation-secondary" onClick={onSuggest}><Sparkles aria-hidden="true" /> Sugerir criterios con IA</button> : null}
          <button type="button" className="evaluation-secondary" onClick={add} disabled={criteria.length >= maxCriteria}>
            <Plus aria-hidden="true" /> Añadir criterio
          </button>
        </div>
      </header>

      <ol className="checklist-criteria__list">
        {criteria.map((criterion, index) => (
          <li key={criterion.id}>
            <span className="checklist-criteria__code" aria-hidden="true">{criterion.code}</span>
            <label htmlFor={`checklist-${criterion.id}`}>
              <span>{criterion.code} · Descripción del criterio</span>
              <textarea
                id={`checklist-${criterion.id}`}
                rows={2}
                value={criterion.description}
                onChange={(event) => update(criterion.id, event.target.value)}
                placeholder="Ej. Explica su estrategia usando datos y vocabulario del área."
                required
              />
            </label>
            <div className="checklist-criteria__actions" aria-label={`Acciones de ${criterion.code}`}>
              <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Subir ${criterion.code}`}><ArrowUp /></button>
              <button type="button" onClick={() => move(index, 1)} disabled={index === criteria.length - 1} aria-label={`Bajar ${criterion.code}`}><ArrowDown /></button>
              <button type="button" className="is-danger" onClick={() => remove(criterion.id)} disabled={criteria.length <= 1} aria-label={`Eliminar ${criterion.code}`}><Trash2 /></button>
            </div>
          </li>
        ))}
      </ol>
      <p className="checklist-criteria__limit" role="status">{criteria.length} de {maxCriteria} criterios</p>
    </section>
  );
}

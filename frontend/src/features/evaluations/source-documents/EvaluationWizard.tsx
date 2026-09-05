import { Check, ChevronLeft, ChevronRight, Save } from "lucide-react";
import type { ReactNode } from "react";

export type EvaluationWizardStep = {
  id: string;
  label: string;
  description?: string;
};

type EvaluationWizardProps = {
  eyebrow: string;
  title: string;
  description: string;
  steps: EvaluationWizardStep[];
  currentStep: number;
  onStepChange: (index: number) => void;
  onSave: (finalize?: boolean) => void | Promise<void>;
  saving?: boolean;
  message?: string;
  error?: string;
  children: ReactNode;
};

export function EvaluationWizard({
  eyebrow,
  title,
  description,
  steps,
  currentStep,
  onStepChange,
  onSave,
  saving = false,
  message = "",
  error = "",
  children,
}: EvaluationWizardProps) {
  const lastStep = steps.length - 1;
  return (
    <section className="evaluation-wizard" aria-labelledby="evaluation-wizard-title">
      <header className="evaluation-wizard__heading">
        <div>
          <span>{eyebrow}</span>
          <h1 id="evaluation-wizard-title">{title}</h1>
          <p>{description}</p>
        </div>
        <button className="evaluation-button evaluation-button--secondary" type="button" onClick={() => void onSave(false)} disabled={saving}>
          <Save aria-hidden="true" /> {saving ? "Guardando…" : "Guardar borrador"}
        </button>
      </header>

      <nav className="evaluation-wizard__stepper" aria-label={`Pasos de ${title}`}>
        <ol>
          {steps.map((step, index) => {
            const active = index === currentStep;
            const completed = index < currentStep;
            return (
              <li key={step.id} className={active ? "is-active" : completed ? "is-completed" : ""}>
                <button
                  type="button"
                  aria-current={active ? "step" : undefined}
                  onClick={() => onStepChange(index)}
                >
                  <span aria-hidden="true">{completed ? <Check /> : index + 1}</span>
                  <strong>{step.label}</strong>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <article className="evaluation-wizard__card">
        <header>
          <span>Paso {currentStep + 1} de {steps.length}</span>
          <h2>{steps[currentStep].label}</h2>
          {steps[currentStep].description ? <p>{steps[currentStep].description}</p> : null}
        </header>
        {error ? <div className="evaluation-notice evaluation-notice--error" role="alert">{error}</div> : null}
        {message ? <div className="evaluation-notice evaluation-notice--success" role="status">{message}</div> : null}
        <div className="evaluation-wizard__content">{children}</div>
        <footer>
          <button
            className="evaluation-button evaluation-button--secondary"
            type="button"
            onClick={() => onStepChange(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            <ChevronLeft aria-hidden="true" /> Anterior
          </button>
          {currentStep < lastStep ? (
            <button className="evaluation-button" type="button" onClick={() => onStepChange(currentStep + 1)}>
              Continuar <ChevronRight aria-hidden="true" />
            </button>
          ) : (
            <button className="evaluation-button" type="button" onClick={() => void onSave(true)} disabled={saving}>
              <Save aria-hidden="true" /> {saving ? "Guardando…" : "Guardar instrumento"}
            </button>
          )}
        </footer>
      </article>
    </section>
  );
}

export function EvaluationPreviewSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="evaluation-preview__section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

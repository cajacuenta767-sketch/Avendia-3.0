import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export type FormValidationItem = {
  id: string;
  label: string;
  message?: string;
};

function focusValidationTarget(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView?.({ behavior: "smooth", block: "center" });
  const control = target.matches("input, select, textarea, button")
    ? target
    : target.querySelector<HTMLElement>("input:not([type='hidden']), select, textarea, button");
  control?.focus({ preventScroll: true });
}

export function FormValidationSummary({ items }: { items: FormValidationItem[] }) {
  const firstInvalidId = items[0]?.id ?? "";

  useEffect(() => {
    if (!firstInvalidId) return;
    const timeout = window.setTimeout(() => focusValidationTarget(firstInvalidId), 60);
    return () => window.clearTimeout(timeout);
  }, [firstInvalidId]);

  if (!items.length) return null;

  return (
    <section className="workflow-validation-summary specialized-validation-summary" role="alert" aria-live="assertive" aria-atomic="true">
      <AlertTriangle aria-hidden="true" />
      <div>
        <h3>{items.length === 1 ? "Falta completar 1 campo" : `Faltan completar ${items.length} campos`}</h3>
        <p>Selecciona un campo para revisarlo. Avendia llevará el foco al cuadro correspondiente.</p>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              <button type="button" onClick={() => focusValidationTarget(item.id)}>
                <strong>{item.label}</strong>
                <span>{item.message ?? "Completa este campo para continuar."}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

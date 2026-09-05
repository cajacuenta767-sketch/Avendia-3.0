import type { ReactNode } from "react";

export type UtilityMetric = { label: string; value: string | number; detail?: string };

export function UtilityHero({ eyebrow, title, description, metrics, action, children }: {
  eyebrow: string;
  title: string;
  description: string;
  metrics: UtilityMetric[];
  action?: ReactNode;
  children?: ReactNode;
}) {
  return <section className="utility-hero">
    <div className="utility-hero__copy">
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
      {action ? <div className="utility-hero__action">{action}</div> : null}
      {children}
    </div>
    <div className="utility-hero__metrics" aria-label="Resumen de esta utilidad">
      {metrics.map((metric) => <article key={metric.label}>
        <strong>{metric.value}</strong>
        <span>{metric.label}</span>
        {metric.detail ? <small>{metric.detail}</small> : null}
      </article>)}
    </div>
  </section>;
}

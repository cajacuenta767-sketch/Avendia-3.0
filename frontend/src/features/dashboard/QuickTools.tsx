import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { quickTools } from "./dashboardData";

export function QuickTools({ onSelect }: { onSelect: () => void }) {
  const navigate = useNavigate();
  return (
    <section className="dashboard-section" aria-labelledby="tools-title">
      <h2 id="tools-title">Herramientas frecuentes</h2>
      <div className="quick-tools">
        {quickTools.map(({ title, icon: Icon, tone, path }) => (
          <button className={`quick-tool quick-tool--${tone}`} key={title} onClick={() => { onSelect(); navigate(path); }}>
            <Icon aria-hidden="true" />
            <strong>{title}</strong>
            <ArrowRight aria-hidden="true" />
          </button>
        ))}
      </div>
    </section>
  );
}

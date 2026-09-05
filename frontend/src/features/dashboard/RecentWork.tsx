import { FileText, MoreVertical } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { recentDocuments } from "./dashboardData";

export function RecentWork() {
  const navigate = useNavigate();
  return (
    <section className="dashboard-section" aria-labelledby="recent-title">
      <h2 id="recent-title">Continúa tu trabajo</h2>
      <div className="recent-list">
        {recentDocuments.map((document) => (
          <article className="recent-row" key={document.title}>
            <span className={`recent-row__rail recent-row__rail--${document.color}`} />
            <FileText className="recent-row__icon" aria-hidden="true" />
            <strong>{document.title}</strong>
            <span className="recent-row__updated">{document.updatedLabel}</span>
            <button className="icon-button" aria-label={`Abrir ${document.title}`} onClick={() => navigate(document.path)}>
              <MoreVertical aria-hidden="true" />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

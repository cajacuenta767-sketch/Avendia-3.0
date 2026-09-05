import { ArrowRight } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";

import { getModule, tools } from "../../config/tools";

export function ModulePage() {
  const { moduleId } = useParams();
  const module = getModule(moduleId);
  if (!module) return <Navigate to="/dashboard" replace />;
  const moduleTools = tools.filter((item) => item.module === module.id);
  return (
    <main className="content-page">
      <header className="page-heading"><div className="page-heading__icon"><module.icon /></div><div><p>Herramientas docentes</p><h1>{module.title}</h1><span>{module.description}</span></div></header>
      <section className="tool-grid" aria-label={`Herramientas de ${module.title}`}>
        {moduleTools.map((item) => <Link className="tool-card" to={item.path} key={item.id}><span className="tool-card__icon"><item.icon /></span><span><strong>{item.title}</strong><small>{item.description}</small></span><ArrowRight /></Link>)}
      </section>
    </main>
  );
}

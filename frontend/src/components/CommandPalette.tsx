import { Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { modules, tools, utilityNavigation } from "../config/tools";

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  return open ? <CommandPaletteDialog onClose={onClose} /> : null;
}

function CommandPaletteDialog({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());
  const navigate = useNavigate();
  const results = useMemo(() => {
    const items = [...modules, ...tools, ...utilityNavigation].map((item) => ({
      title: item.title,
      path: item.path,
      icon: item.icon,
      description: "description" in item ? String(item.description) : "Acceso rápido de Avendia",
      keywords: "keywords" in item && Array.isArray(item.keywords) ? item.keywords.join(" ") : "",
    }));
    if (!deferredQuery) return items.slice(0, 10);
    return items.filter((item) => `${item.title} ${item.description} ${item.keywords}`.toLowerCase().includes(deferredQuery)).slice(0, 14);
  }, [deferredQuery]);
  const choose = (path: string) => { navigate(path); onClose(); };
  return (
    <div className="dialog-backdrop command-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="command-palette" role="dialog" aria-modal="true" aria-label="Buscar en Avendia">
        <div className="command-palette__input"><Search /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca una herramienta o módulo…" onKeyDown={(event) => { if (event.key === "Escape") onClose(); if (event.key === "Enter" && results[0]) choose(results[0].path); }} /><button className="icon-button" onClick={onClose} aria-label="Cerrar"><X /></button></div>
        <div className="command-palette__results">
          {results.length ? results.map((item) => { const Icon = item.icon; return <button key={item.path} onClick={() => choose(item.path)}><Icon /><span><strong>{item.title}</strong><small>{item.description}</small></span></button>; }) : <p className="empty-state">No encontramos resultados para “{query}”.</p>}
        </div>
      </section>
    </div>
  );
}

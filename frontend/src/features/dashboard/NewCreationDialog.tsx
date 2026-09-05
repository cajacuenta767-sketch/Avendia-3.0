import { ArrowRight, BookOpenText, ClipboardCheck, FolderPlus, X } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const options = [
  { title: "Planificación", detail: "Plan anual, unidad o sesión", icon: BookOpenText, path: "/dashboard/planificamos" },
  { title: "Evaluación", detail: "Instrumento o actividad", icon: ClipboardCheck, path: "/dashboard/evaluamos" },
  { title: "Recurso pedagógico", detail: "Material para el aula", icon: FolderPlus, path: "/dashboard/recursos" },
];

export function NewCreationDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="dialog-backdrop" onMouseDown={onClose}>
      <section
        className="creation-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="creation-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="creation-dialog__header">
          <div>
            <h2 id="creation-title">Nueva creación</h2>
            <p>Elige qué quieres preparar.</p>
          </div>
          <button className="icon-button dialog-close" onClick={onClose} aria-label="Cerrar">
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="creation-dialog__options">
          {options.map(({ title, detail, icon: Icon, path }, index) => (
            <button className={`creation-option ${index === 0 ? "creation-option--featured" : ""}`} key={title} onClick={() => { onClose(); navigate(path); }}>
              <Icon aria-hidden="true" />
              <span><strong>{title}</strong><small>{detail}</small></span>
              <ArrowRight aria-hidden="true" />
            </button>
          ))}
        </div>
        <footer className="creation-dialog__footer">
          <button className="secondary-button" onClick={onClose}>Cancelar</button>
        </footer>
      </section>
    </div>
  );
}

import {
  ArrowRight, Check, ChevronLeft, ChevronRight, ClipboardCheck, Crown, FileText, FolderOpen, Heart, History,
  Layers, Sparkles, Star, UsersRound, X,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { modules, tools, type ModuleId, type ToolDefinition } from "../../config/tools";
import { useWorkspacePreferences } from "../../context/WorkspacePreferencesContext";
import type { SessionUser } from "../../lib/session";
import type { DashboardActivity } from "./dashboardActivity";
import { HomePedagogicalCalendar } from "./HomePedagogicalCalendar";

const MOST_USED_IDS = [
  "plan-curricular-anual", "unidad-aprendizaje", "sesion-aprendizaje", "ficha-aprendizaje",
  "rubrica-evaluacion", "lista-cotejo", "examen", "adaptacion-nee-dua",
];

const ACADEMIC_LEVELS = ["Inicial", "Primaria", "Secundaria", "EBA", "EBE"];

function toolPath(module: ModuleId, id: string, fallback: string): { title: string; path: string } {
  const tool = tools.find((item) => item.module === module && item.id === id);
  return { title: tool?.title ?? fallback, path: tool?.path ?? `/dashboard/${module}` };
}

const CLASS_SESSION = toolPath("planificamos", "sesion-aprendizaje", "Sesión de aprendizaje");
const CLASS_PATH = CLASS_SESSION.path;
const CLASS_PARTS = [
  { label: "Sesión de aprendizaje", icon: FileText, ...CLASS_SESSION },
  { label: "Instrumento de evaluación", icon: ClipboardCheck, ...toolPath("evaluamos", "rubrica-evaluacion", "Rúbrica de evaluación") },
  { label: "Materiales", icon: FolderOpen, title: "Recursos", path: "/dashboard/recursos" },
];
const PREFERENCE_OPTIONS = ["Planificar con calma", "Crear recursos", "Evaluar avances", "Acompañar a mi aula"];

type HomeDashboardContentProps = {
  user: SessionUser;
  activity: DashboardActivity;
  activityLoading: boolean;
  onNewCreation: () => void;
};

export function HomeDashboardContent({ user, activity, activityLoading, onNewCreation }: HomeDashboardContentProps) {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState<"all" | ModuleId>("all");
  const [planOpen, setPlanOpen] = useState(false);
  const [preferenceOpen, setPreferenceOpen] = useState(false);
  const [contextOpen, setContextOpen] = useState(true);
  const { preferences: workspacePreferences, updatePreferences: updateWorkspacePreferences } = useWorkspacePreferences();
  const dailyPhrase = workspacePreferences.daily_phrase;
  const academicLevel = workspacePreferences.home_academic_level || user.education_level || "Secundaria";
  const favoriteKeys = workspacePreferences.favorite_tools;

  const featuredIds = activity.mostUsedToolIds.length ? activity.mostUsedToolIds : MOST_USED_IDS;
  const mostUsed = useMemo(() => featuredIds.map((id, index) => {
    const preferredModule = index === 7 ? "planificamos" : undefined;
    return tools.find((item) => item.id === id && (!preferredModule || item.module === preferredModule));
  }).filter((item): item is ToolDefinition => Boolean(item)), [featuredIds]);

  const visibleTools = activeModule === "all" ? tools : tools.filter((item) => item.module === activeModule);
  const favoriteTools = useMemo(() => tools.filter((tool) => favoriteKeys.includes(`${tool.module}/${tool.id}`)), [favoriteKeys]);
  const firstName = user.full_name.trim().split(/\s+/)[0] || "profe";

  const updateLevel = (value: string) => {
    void updateWorkspacePreferences({ home_academic_level: value });
  };

  const updatePreference = (preference: string) => {
    const message = `Tu prioridad de hoy es ${preference.toLocaleLowerCase("es-PE")}. Avanza a tu ritmo: cada paso cuenta.`;
    void updateWorkspacePreferences({ daily_phrase: message });
    setPreferenceOpen(false);
  };

  const toggleFavorite = (tool: ToolDefinition) => {
    const key = `${tool.module}/${tool.id}`;
    const next = favoriteKeys.includes(key) ? favoriteKeys.filter((item) => item !== key) : [...favoriteKeys, key];
    void updateWorkspacePreferences({ favorite_tools: next });
  };

  return (
    <main className={`home-dashboard${contextOpen ? "" : " home-dashboard--context-closed"}`}>
      <div className="home-dashboard__primary">
        <section className="home-profile-strip" aria-label="Perfil académico activo">
          <span><Layers aria-hidden="true" /> Perfil académico activo</span>
          <label>
            <span>Nivel</span>
            <select value={academicLevel} onChange={(event) => updateLevel(event.target.value)}>
              {ACADEMIC_LEVELS.map((level) => <option key={level}>{level}</option>)}
            </select>
          </label>
        </section>

        <section className="home-welcome" aria-labelledby="home-welcome-title">
          <span className="home-eyebrow">Tu espacio docente</span>
          <h1 id="home-welcome-title">¡Te damos la bienvenida, {firstName}!</h1>
          <p className="home-welcome__phrase"><Heart aria-hidden="true" /> {dailyPhrase}</p>
        </section>

        <section className="home-class-banner" aria-labelledby="home-class-banner-title">
          <ClassBannerArt />
          <div className="home-class-banner__copy">
            <h2 id="home-class-banner-title">Crea tu clase completa</h2>
            <p>Organiza tu sesión de aprendizaje, instrumento de evaluación y materiales en un solo lugar.</p>
            <div className="home-class-banner__chips" aria-label="Partes de la clase completa">
              {CLASS_PARTS.map((part) => {
                const Icon = part.icon;
                return <button key={part.label} type="button" onClick={() => navigate(part.path)} title={`Abrir ${part.title}`}><Icon aria-hidden="true" /> {part.label}</button>;
              })}
            </div>
          </div>
          <button type="button" className="home-class-banner__create" onClick={() => navigate(CLASS_PATH)}>Crear mi clase <ArrowRight aria-hidden="true" /></button>
        </section>

        <ToolSection
          title={activity.mostUsedToolIds.length ? "Herramientas más utilizadas" : "Recomendadas para empezar"}
          description={activity.mostUsedToolIds.length ? "Accede rápidamente a las herramientas que utilizas con mayor frecuencia." : "Estas herramientas te ayudan a crear tus primeros documentos docentes."}
          tools={mostUsed}
          onOpen={(path) => navigate(path)}
          favoriteKeys={favoriteKeys}
          onToggleFavorite={toggleFavorite}
          className="home-tool-grid--featured"
          actions={(
            <div className="home-section-actions">
              <button type="button" className="home-section-actions__secondary" onClick={() => setPreferenceOpen(true)}>Cambiar preferencia</button>
              <button type="button" className="home-section-actions__primary" onClick={onNewCreation}>Nueva creación <ArrowRight aria-hidden="true" /></button>
            </div>
          )}
        />

        {favoriteTools.length ? <ToolSection
          title="Tus favoritos"
          description="Herramientas que marcaste para tenerlas siempre a mano."
          tools={favoriteTools}
          onOpen={(path) => navigate(path)}
          favoriteKeys={favoriteKeys}
          onToggleFavorite={toggleFavorite}
          className="home-tool-grid--favorites"
        /> : null}

        <section className="home-explore" aria-labelledby="home-explore-title">
          <header className="home-section-heading home-section-heading--filters">
            <div>
              <span className="home-section-heading__icon"><Layers aria-hidden="true" /></span>
              <span><h2 id="home-explore-title">Explorar por módulos</h2><p>Filtra y abre las 57 herramientas disponibles en Avendia.</p></span>
            </div>
            <div className="home-module-filters" aria-label="Filtrar herramientas por módulo">
              <button type="button" aria-pressed={activeModule === "all"} onClick={() => setActiveModule("all")}>Todas</button>
              {modules.map((module) => (
                <button key={module.id} type="button" aria-pressed={activeModule === module.id} onClick={() => setActiveModule(module.id)}>
                  {module.title}
                </button>
              ))}
            </div>
          </header>
          <div className="home-tool-grid" aria-live="polite">
            {visibleTools.map((tool) => <HomeToolCard key={`${tool.module}-${tool.id}`} tool={tool} onOpen={() => navigate(tool.path)} favorite={favoriteKeys.includes(`${tool.module}/${tool.id}`)} onToggleFavorite={() => toggleFavorite(tool)} />)}
          </div>
        </section>

        <section className="home-referral" aria-labelledby="home-referral-title">
          <span className="home-referral__icon"><UsersRound aria-hidden="true" /></span>
          <div><small>Recomienda y gana</small><h2 id="home-referral-title">Tus clases, sin límites</h2><p>Invita a un colega docente y revisa los beneficios disponibles para tu cuenta.</p></div>
          <div className="home-referral__actions">
            <button type="button" className="primary-button" onClick={() => navigate("/dashboard/referidos")}>Invitar colega</button>
            <button type="button" className="secondary-button" onClick={() => setPlanOpen(true)}>Ver plan profesional</button>
          </div>
        </section>
      </div>

      {contextOpen ? <aside className="home-context" aria-label="Calendario e historial">
        <div className="home-context-toolbar"><span>Panel lateral</span><button type="button" onClick={() => setContextOpen(false)} aria-label="Ocultar panel lateral"><ChevronRight aria-hidden="true" /></button></div>
        <HomePedagogicalCalendar />
        <section className="home-history" aria-labelledby="home-history-title">
          <header><span><History aria-hidden="true" /><h2 id="home-history-title">Historial reciente</h2>{!activityLoading && activity.documentCount ? <em className="home-history__count" title="Documentos creados">{activity.documentCount}</em> : null}</span><button type="button" onClick={() => navigate("/dashboard/historial")}>Ver todo</button></header>
          <div>
            {activity.recentDocuments.map((document) => (
              <button key={document.id} type="button" className="home-history__item" onClick={() => navigate(`${document.path}?document=${document.id}`)}>
                <FileText aria-hidden="true" /><span><strong>{document.title}</strong><small>{document.updatedLabel} · {document.status === "completed" ? "Completado" : "Borrador"}</small></span><ArrowRight aria-hidden="true" />
              </button>
            ))}
            {!activityLoading && !activity.recentDocuments.length ? <div className="home-history__empty"><FileText aria-hidden="true" /><strong>Aún no tienes documentos</strong><p>Tu historial aparecerá aquí cuando guardes tu primera creación.</p><button type="button" onClick={onNewCreation}>Crear documento</button></div> : null}
          </div>
        </section>
      </aside> : <button type="button" className="home-context-reopen" onClick={() => setContextOpen(true)} aria-label="Mostrar panel lateral"><ChevronLeft aria-hidden="true" /></button>}

      {planOpen ? <ProfessionalPlanDialog user={user} onClose={() => setPlanOpen(false)} onOpenProfile={() => navigate("/dashboard/perfil")} /> : null}
      {preferenceOpen ? <PreferenceDialog onClose={() => setPreferenceOpen(false)} onSelect={updatePreference} /> : null}
    </main>
  );
}

/** Ilustración del banner: fichas de documento apiladas con sello de listo. */
function ClassBannerArt() {
  return (
    <svg className="home-class-banner__art" viewBox="0 0 200 150" aria-hidden="true" focusable="false">
      <g className="home-class-banner__spark"><path d="M168 18l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" /><path d="M186 46l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" /></g>
      <g className="home-class-banner__spark home-class-banner__spark--teal"><path d="M22 112l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" /></g>
      <g transform="rotate(-9 96 84)">
        <rect x="74" y="34" width="86" height="104" rx="10" className="home-class-banner__sheet home-class-banner__sheet--back" />
        <rect x="83" y="46" width="52" height="7" rx="3.5" className="home-class-banner__line" />
        <rect x="83" y="60" width="66" height="5" rx="2.5" className="home-class-banner__line home-class-banner__line--soft" />
        <rect x="83" y="71" width="58" height="5" rx="2.5" className="home-class-banner__line home-class-banner__line--soft" />
      </g>
      <g transform="rotate(4 88 84)">
        <rect x="42" y="30" width="86" height="104" rx="10" className="home-class-banner__sheet" />
        <rect x="52" y="42" width="48" height="7" rx="3.5" className="home-class-banner__line" />
        <rect x="52" y="56" width="66" height="5" rx="2.5" className="home-class-banner__line home-class-banner__line--soft" />
        <rect x="52" y="67" width="60" height="5" rx="2.5" className="home-class-banner__line home-class-banner__line--soft" />
        <rect x="52" y="78" width="40" height="5" rx="2.5" className="home-class-banner__line home-class-banner__line--soft" />
      </g>
      <circle cx="118" cy="120" r="17" className="home-class-banner__badge" />
      <path d="M110 120l6 6 11-12" className="home-class-banner__check" />
    </svg>
  );
}

function PreferenceDialog({ onClose, onSelect }: { onClose: () => void; onSelect: (value: string) => void }) {
  return (
    <div className="home-plan-layer" role="dialog" aria-modal="true" aria-labelledby="home-preference-title">
      <button className="home-plan-layer__backdrop" onClick={onClose} aria-label="Cerrar preferencia docente" />
      <article className="home-plan-dialog home-preference-dialog">
        <header><span><Heart aria-hidden="true" /></span><button type="button" onClick={onClose} aria-label="Cerrar"><X aria-hidden="true" /></button></header>
        <small>Preferencia docente del día</small>
        <h2 id="home-preference-title">¿En qué quieres enfocarte hoy?</h2>
        <p>Selecciona una opción y adaptaremos el mensaje principal de tu panel.</p>
        <div className="home-preference-dialog__options">
          {PREFERENCE_OPTIONS.map((option) => <button key={option} type="button" onClick={() => onSelect(option)}>{option}</button>)}
        </div>
      </article>
    </div>
  );
}

function ToolSection({ title, description, tools: sectionTools, onOpen, favoriteKeys, onToggleFavorite, className, actions }: {
  title: string; description: string; tools: ToolDefinition[]; onOpen: (path: string) => void; favoriteKeys: string[]; onToggleFavorite: (tool: ToolDefinition) => void; className?: string; actions?: ReactNode;
}) {
  return (
    <section className="home-tools" aria-labelledby="home-tools-title">
      <header className={`home-section-heading${actions ? " home-section-heading--with-actions" : ""}`}>
        <span className="home-section-heading__icon"><Sparkles aria-hidden="true" /></span>
        <span><h2 id="home-tools-title">{title}</h2><p>{description}</p></span>
        {actions}
      </header>
      <div className={`home-tool-grid ${className ?? ""}`}>
        {sectionTools.map((tool) => <HomeToolCard key={`${tool.module}-${tool.id}`} tool={tool} onOpen={() => onOpen(tool.path)} favorite={favoriteKeys.includes(`${tool.module}/${tool.id}`)} onToggleFavorite={() => onToggleFavorite(tool)} />)}
      </div>
    </section>
  );
}

function HomeToolCard({ tool, onOpen, favorite, onToggleFavorite }: { tool: ToolDefinition; onOpen: () => void; favorite: boolean; onToggleFavorite: () => void }) {
  const Icon = tool.icon;
  const module = modules.find((item) => item.id === tool.module);
  return (
    <article className={`home-tool-card home-tool-card--${tool.module}`}>
      <span className="home-tool-card__ready"><Check aria-hidden="true" /> Disponible</span>
      <button type="button" className={`home-tool-card__favorite ${favorite ? "is-active" : ""}`} onClick={onToggleFavorite} aria-pressed={favorite} aria-label={favorite ? `Quitar ${tool.title} de favoritos` : `Agregar ${tool.title} a favoritos`} title={favorite ? "Quitar de favoritos" : "Agregar a favoritos"}><Star aria-hidden="true" /></button>
      <span className="home-tool-card__icon"><Icon aria-hidden="true" /></span>
      <small>{module?.title}</small>
      <h3>{tool.title}</h3>
      <p>{tool.description}</p>
      <button type="button" onClick={onOpen}>Empezar creación <ArrowRight aria-hidden="true" /></button>
    </article>
  );
}

function ProfessionalPlanDialog({ user, onClose, onOpenProfile }: { user: SessionUser; onClose: () => void; onOpenProfile: () => void }) {
  return (
    <div className="home-plan-layer" role="dialog" aria-modal="true" aria-labelledby="home-plan-title">
      <button className="home-plan-layer__backdrop" onClick={onClose} aria-label="Cerrar plan profesional" />
      <article className="home-plan-dialog">
        <header><span><Crown aria-hidden="true" /></span><button type="button" onClick={onClose} aria-label="Cerrar"><X aria-hidden="true" /></button></header>
        <small>Tu cuenta actual</small>
        <h2 id="home-plan-title">Docente profesional</h2>
        <p>Consulta tu perfil educativo, el saldo de IA y las opciones disponibles para tu cuenta.</p>
        <dl><div><dt>Créditos IA</dt><dd>{Number(user.ai_credits_balance ?? 0).toLocaleString("es-PE")}</dd></div><div><dt>Modalidad</dt><dd>{user.education_modality || "Por completar"}</dd></div></dl>
        <button type="button" className="primary-button" onClick={onOpenProfile}>Abrir mi perfil</button>
      </article>
    </div>
  );
}

import {
  ArrowRight, Check, ChevronLeft, ChevronRight, Crown, FileText, GraduationCap, Heart, History,
  Layers, Sparkles, Star, UsersRound, X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { modules, tools, type ModuleId, type ToolDefinition } from "../../config/tools";
import type { SessionUser } from "../../lib/session";
import type { DashboardActivity } from "./dashboardActivity";
import { HomePedagogicalCalendar } from "./HomePedagogicalCalendar";

const MOST_USED_IDS = [
  "plan-curricular-anual", "unidad-aprendizaje", "sesion-aprendizaje", "ficha-aprendizaje",
  "rubrica-evaluacion", "lista-cotejo", "examen", "adaptacion-nee-dua",
];

const ACADEMIC_LEVELS = ["Inicial", "Primaria", "Secundaria", "EBA", "EBE"];
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
  const [dailyPhrase, setDailyPhrase] = useState(() => localStorage.getItem("avendia.home.dailyPhrase") || "Hoy es un buen día para convertir tus ideas en experiencias de aprendizaje.");
  const [academicLevel, setAcademicLevel] = useState(() =>
    sessionStorage.getItem("avendia.home.academicLevel") || user.education_level || "Secundaria",
  );
  const favoriteKey = `avendia.home.favorites.${user.id}`;
  const [favoriteKeys, setFavoriteKeys] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(favoriteKey) ?? "[]") as string[]; }
    catch { return []; }
  });

  const featuredIds = activity.mostUsedToolIds.length ? activity.mostUsedToolIds : MOST_USED_IDS;
  const mostUsed = useMemo(() => featuredIds.map((id, index) => {
    const preferredModule = index === 7 ? "planificamos" : undefined;
    return tools.find((item) => item.id === id && (!preferredModule || item.module === preferredModule));
  }).filter((item): item is ToolDefinition => Boolean(item)), [featuredIds]);

  const visibleTools = activeModule === "all" ? tools : tools.filter((item) => item.module === activeModule);
  const favoriteTools = useMemo(() => tools.filter((tool) => favoriteKeys.includes(`${tool.module}/${tool.id}`)), [favoriteKeys]);
  const firstName = user.full_name.trim().split(/\s+/)[0] || "profe";
  const area = user.curricular_area || "Área curricular por completar";

  const updateLevel = (value: string) => {
    setAcademicLevel(value);
    sessionStorage.setItem("avendia.home.academicLevel", value);
  };

  const updatePreference = (preference: string) => {
    const message = `Tu prioridad de hoy es ${preference.toLocaleLowerCase("es-PE")}. Avanza a tu ritmo: cada paso cuenta.`;
    setDailyPhrase(message);
    localStorage.setItem("avendia.home.dailyPhrase", message);
    setPreferenceOpen(false);
  };

  const toggleFavorite = (tool: ToolDefinition) => {
    const key = `${tool.module}/${tool.id}`;
    setFavoriteKeys((current) => {
      const next = current.includes(key) ? current.filter((item) => item !== key) : [...current, key];
      localStorage.setItem(favoriteKey, JSON.stringify(next));
      return next;
    });
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

        <section className="home-welcome-grid" aria-labelledby="home-welcome-title">
          <article className="home-welcome-card">
            <div className="home-welcome-card__copy">
              <span className="home-eyebrow">Tu espacio docente</span>
              <h1 id="home-welcome-title">¡Te damos la bienvenida, {firstName}!</h1>
              <p>Visualiza tu avance, abre las herramientas que más utilizas y continúa tu planificación desde un solo lugar.</p>
            </div>
            <Sparkles className="home-welcome-card__art" aria-hidden="true" />
            <footer>
              <span><Heart aria-hidden="true" /> {dailyPhrase}</span>
              <div className="home-welcome-card__actions">
                <button type="button" className="home-welcome-card__preference" onClick={() => setPreferenceOpen(true)}>Cambiar preferencia</button>
                <button type="button" className="home-welcome-card__create" onClick={onNewCreation}>Nueva creación <ArrowRight aria-hidden="true" /></button>
              </div>
            </footer>
          </article>

          <div className="home-status-stack">
            <article className="home-status-card home-status-card--violet">
              <span className="home-status-card__icon"><GraduationCap aria-hidden="true" /></span>
              <div><small>Nivel y área registrada</small><strong>{academicLevel}</strong><p>{area}</p></div>
            </article>
            <article className="home-status-card home-status-card--teal">
              <span className="home-status-card__icon"><FileText aria-hidden="true" /></span>
              <div><small>Documentos creados</small><strong>{activityLoading ? "—" : activity.documentCount}</strong><p>Disponibles en tu historial</p></div>
            </article>
          </div>
        </section>

        <ToolSection
          title={activity.mostUsedToolIds.length ? "Herramientas más utilizadas" : "Recomendadas para empezar"}
          description={activity.mostUsedToolIds.length ? "Accede rápidamente a las herramientas que utilizas con mayor frecuencia." : "Estas herramientas te ayudan a crear tus primeros documentos docentes."}
          tools={mostUsed}
          onOpen={(path) => navigate(path)}
          favoriteKeys={favoriteKeys}
          onToggleFavorite={toggleFavorite}
          className="home-tool-grid--featured"
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
          <header><span><History aria-hidden="true" /><h2 id="home-history-title">Historial reciente</h2></span><button type="button" onClick={() => navigate("/dashboard/historial")}>Ver todo</button></header>
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

function ToolSection({ title, description, tools: sectionTools, onOpen, favoriteKeys, onToggleFavorite, className }: {
  title: string; description: string; tools: ToolDefinition[]; onOpen: (path: string) => void; favoriteKeys: string[]; onToggleFavorite: (tool: ToolDefinition) => void; className?: string;
}) {
  return (
    <section className="home-tools" aria-labelledby="home-tools-title">
      <header className="home-section-heading">
        <span className="home-section-heading__icon"><Sparkles aria-hidden="true" /></span>
        <span><h2 id="home-tools-title">{title}</h2><p>{description}</p></span>
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

import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ChevronLeft,
  GraduationCap,
  School,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Brand } from "../../components/Brand";
import { areasByLevel, educationModalities, getEducationLevels, gradesByLevel, type EducationModality } from "../../config/education";
import { apiRequest } from "../../lib/api";
import { AuthThemeToggle } from "./AuthThemeToggle";

type RegistrationStep = {
  number: 1 | 2 | 3;
  label: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

const REGISTRATION_STEPS: RegistrationStep[] = [
  {
    number: 1,
    label: "Tus datos",
    title: "Cuéntanos sobre ti",
    description: "Crea tus datos de acceso y dinos cómo debemos llamarte.",
    icon: UserRound,
  },
  {
    number: 2,
    label: "Institución",
    title: "Agrega tu institución",
    description: "Esta información aparecerá lista en tus documentos institucionales.",
    icon: School,
  },
  {
    number: 3,
    label: "Tu aula",
    title: "Configura tu aula",
    description: "Elige la modalidad y los datos pedagógicos que usarás con más frecuencia.",
    icon: GraduationCap,
  },
];

type RequiredControl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

export function RegisterPage() {
  const [referralCode, setReferralCode] = useState(() => new URLSearchParams(window.location.search).get("referido") ?? "");
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  const [currentStep, setCurrentStep] = useState<RegistrationStep["number"]>(1);
  const [furthestStep, setFurthestStep] = useState<RegistrationStep["number"]>(1);
  const [modality, setModality] = useState<EducationModality>("EBR");
  const [level, setLevel] = useState("Primaria");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const grades = useMemo(() => gradesByLevel[level] ?? [], [level]);
  const areas = useMemo(() => areasByLevel[level] ?? [], [level]);
  const educationLevels = getEducationLevels(modality);

  function changeModality(nextModality: EducationModality) {
    const firstLevel = getEducationLevels(nextModality)[0] ?? "";
    setModality(nextModality);
    setLevel(firstLevel);
  }

  function focusActiveStep(step: RegistrationStep["number"]) {
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-step-heading="${step}"]`)?.focus());
  }

  function showStep(step: RegistrationStep["number"]) {
    setError("");
    setCurrentStep(step);
    focusActiveStep(step);
  }

  function validateStep(step: RegistrationStep["number"]) {
    const panel = formRef.current?.querySelector<HTMLFieldSetElement>(`[data-registration-step="${step}"]`);
    const controls = Array.from(panel?.querySelectorAll<RequiredControl>("input, select, textarea") ?? []);
    const invalidControl = controls.find((control) => !control.checkValidity());

    if (!invalidControl) return true;

    invalidControl.reportValidity();
    invalidControl.focus();
    return false;
  }

  function goForward() {
    if (!validateStep(currentStep) || currentStep === 3) return;

    const nextStep = (currentStep + 1) as RegistrationStep["number"];
    setFurthestStep((previousStep) => Math.max(previousStep, nextStep) as RegistrationStep["number"]);
    showStep(nextStep);
  }

  function goBack() {
    if (currentStep === 1) return;
    showStep((currentStep - 1) as RegistrationStep["number"]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (currentStep !== 3) {
      goForward();
      return;
    }
    if (!validateStep(3)) return;

    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          referral_code: referralCode || null,
          email: form.get("email"),
          password: form.get("password"),
          full_name: form.get("full_name"),
          dre: form.get("dre"),
          ugel: form.get("ugel"),
          school_name: form.get("school_name"),
          director_name: form.get("director_name"),
          education_modality: form.get("education_modality"),
          education_level: form.get("education_level"),
          grade: form.get("grade"),
          section: form.get("section"),
          curricular_area: form.get("curricular_area"),
          school_year: Number(form.get("school_year")),
        }),
      });
      navigate("/login", { replace: true, state: { registered: true } });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo crear la cuenta");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="register-page">
      <AuthThemeToggle />
      <header className="register-header">
        <Brand />
        <Link to="/login" className="back-link"><ArrowLeft /> Ya tengo una cuenta</Link>
      </header>

      <section className="register-intro">
        <span>Registro docente</span>
        <h1>Crea tu espacio docente</h1>
        <p>Te acompañamos paso a paso. Solo te tomará unos minutos.</p>
      </section>

      <nav className="registration-steps" aria-label="Progreso del registro">
        <ol>
          {REGISTRATION_STEPS.map((step) => {
            const completed = currentStep > step.number;
            const active = currentStep === step.number;
            return (
              <li key={step.number} className={completed ? "is-completed" : active ? "is-active" : ""}>
                <button
                  type="button"
                  onClick={() => showStep(step.number)}
                  disabled={step.number > furthestStep}
                  aria-current={active ? "step" : undefined}
                  aria-label={`Paso ${step.number}: ${step.label}${completed ? ", completado" : active ? ", actual" : ""}`}
                >
                  <span className="registration-steps__number">{completed ? <Check aria-hidden="true" /> : step.number}</span>
                  <span className="registration-steps__label"><small>Paso {step.number}</small><strong>{step.label}</strong></span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      <form ref={formRef} className="register-form" onSubmit={submit} noValidate>
        {referralCode ? <div className="register-consent"><p>Estás registrándote con una invitación docente. Se guardará la relación para revisar la recompensa del referente.</p><button type="button" onClick={() => setReferralCode("")}>Continuar sin invitación</button></div> : null}
        <fieldset data-registration-step="1" hidden={currentStep !== 1} aria-labelledby="register-step-1-title">
          <legend className="sr-only">Datos personales</legend>
          <RegistrationStepHeader step={REGISTRATION_STEPS[0]} />
          <div className="register-grid">
            <label className="span-2">Nombre completo<input name="full_name" autoComplete="name" required minLength={2} placeholder="Ej. María Elena Quispe" /></label>
            <label>Correo electrónico<input name="email" type="email" autoComplete="email" required placeholder="nombre@colegio.edu.pe" /></label>
            <label>Contraseña<input name="password" type="password" autoComplete="new-password" required minLength={10} placeholder="Mínimo 10 caracteres" /><small>Usa 10 caracteres o más.</small></label>
          </div>
        </fieldset>

        <fieldset data-registration-step="2" hidden={currentStep !== 2} aria-labelledby="register-step-2-title">
          <legend className="sr-only">Institución educativa</legend>
          <RegistrationStepHeader step={REGISTRATION_STEPS[1]} />
          <div className="register-grid">
            <label>DRE<input name="dre" required placeholder="Ej. DRE Lima Metropolitana" /></label>
            <label>UGEL<input name="ugel" required placeholder="Ej. UGEL 03" /></label>
            <label className="span-2">Nombre de la institución educativa<input name="school_name" required placeholder="Ej. I.E. José María Arguedas" /></label>
            <label className="span-2">Nombre del director o directora<input name="director_name" required placeholder="Ej. Rosa Mercedes Salazar" /></label>
          </div>
        </fieldset>

        <fieldset data-registration-step="3" hidden={currentStep !== 3} aria-labelledby="register-step-3-title">
          <legend className="sr-only">Información pedagógica</legend>
          <RegistrationStepHeader step={REGISTRATION_STEPS[2]} />
          <div className="register-grid">
            <label className="span-2">Modalidad educativa<select name="education_modality" required value={modality} onChange={(event) => changeModality(event.target.value as EducationModality)}>{educationModalities.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
            <label>Nivel educativo<select name="education_level" required value={level} onChange={(event) => setLevel(event.target.value)}>{educationLevels.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Grado predeterminado<select name="grade" required key={level}>{grades.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Sección<input name="section" required defaultValue="A" /></label>
            <label>Área curricular<select name="curricular_area" required key={`area-${level}`}>{areas.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label>Año lectivo<input name="school_year" type="number" required min={new Date().getFullYear() - 1} max="2100" defaultValue={new Date().getFullYear()} /></label>
          </div>
        </fieldset>

        {error ? <p className="form-error register-error" role="alert">{error}</p> : null}

        {currentStep === 3 && !error ? (
          <div className="register-consent"><CheckCircle2 /><p><strong>Todo listo para empezar.</strong> Estos datos se autocompletarán en las herramientas y podrás ajustarlos para cada documento.</p></div>
        ) : null}

        <div className={`register-actions ${currentStep === 1 ? "register-actions--first" : ""}`}>
          {currentStep > 1 ? <button type="button" className="register-back-button" onClick={goBack}><ChevronLeft /> Anterior</button> : <p><BookOpenCheck /> Podrás editar estos datos después.</p>}
          {currentStep < 3 ? (
            <button type="button" className="primary-button register-next-button" onClick={goForward}>Continuar <ArrowRight /></button>
          ) : (
            <button className="primary-button register-submit" disabled={submitting}>{submitting ? "Creando cuenta…" : "Crear mi cuenta"}<ArrowRight /></button>
          )}
        </div>
      </form>
    </main>
  );
}

function RegistrationStepHeader({ step }: { step: RegistrationStep }) {
  const Icon = step.icon;
  return (
    <header className="register-step-header">
      <span className="register-step-header__icon"><Icon aria-hidden="true" /></span>
      <span>
        <small>Paso {step.number} de {REGISTRATION_STEPS.length}</small>
        <h2 id={`register-step-${step.number}-title`} data-step-heading={step.number} tabIndex={-1}>{step.title}</h2>
        <p>{step.description}</p>
      </span>
    </header>
  );
}

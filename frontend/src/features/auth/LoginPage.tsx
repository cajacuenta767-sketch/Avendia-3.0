import { FormEvent, useState } from "react";
import {
  CalendarCheck2,
  ChevronRight,
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  SquarePen,
  UsersRound,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import learningScene from "../../assets/login-learning-scene-v2.png";
import { apiRequest } from "../../lib/api";
import { saveSession, type SessionUser } from "../../lib/session";
import { AuthThemeToggle } from "./AuthThemeToggle";
import { PasswordRecoveryDialog } from "./PasswordRecoveryDialog";

type LoginResponse = { access_token: string; user: SessionUser };

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");

  const benefits = [
    { number: "1", title: "Planifica en minutos", description: "Organiza tus clases, objetivos y actividades de forma simple y rápida.", icon: CalendarCheck2, tone: "blue" },
    { number: "2", title: "Crea recursos divertidos", description: "Diseña materiales interactivos, fichas y evaluaciones que tus estudiantes aman.", icon: SquarePen, tone: "violet" },
    { number: "3", title: "Acompaña cada aprendizaje", description: "Evalúa, da retroalimentación y celebra cada progreso de tu aula.", icon: UsersRound, tone: "coral" },
  ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const form = new FormData(event.currentTarget);

    try {
      const response = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
      });
      saveSession(response.access_token, response.user);
      navigate("/dashboard");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo iniciar sesión");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <AuthThemeToggle />
      <section className="login-story" aria-label="Todo lo que puedes hacer con Avendia">
        <span className="login-doodle login-doodle--dot" aria-hidden="true" />
        <span className="login-flight-path" aria-hidden="true" />
        <span className="login-cloud" aria-hidden="true" />
        <span className="login-doodle login-doodle--star"><Sparkles aria-hidden="true" /></span>
        <span className="login-doodle login-doodle--star-violet"><Sparkles aria-hidden="true" /></span>
        <span className="login-doodle login-doodle--plane" aria-hidden="true">➤</span>
        <ol className="login-benefits">
          {benefits.map(({ number, title, description, icon: Icon, tone }) => (
            <li className={`login-benefit login-benefit--${tone}`} key={number}>
              <span className="login-benefit__icon"><Icon aria-hidden="true" /></span>
              <span className="login-benefit__number">{number}</span>
              <span><strong>{title}</strong><small>{description}</small></span>
            </li>
          ))}
        </ol>
        <img className="login-story__art" src={learningScene} alt="Libro abierto con útiles escolares y una estrella sonriente" />
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-brand" aria-label="Avendia">
            <span className="login-brand__mark"><span>A</span><Sparkles aria-hidden="true" /></span>
            <strong>Avendia</strong>
          </div>
          <div className="login-panel__copy">
            <h1>¡Hola, profe!</h1>
            <p>Tu aula de ideas empieza aquí.</p>
          </div>
          <form className="login-form" onSubmit={handleSubmit}>
            {(location.state as { registered?: boolean } | null)?.registered ? <p className="form-success">🎉 Tu cuenta fue creada. Ya puedes ingresar.</p> : null}
            <label>
              <span>Correo electrónico</span>
              <span className="login-input">
                <Mail aria-hidden="true" />
                <input name="email" type="email" autoComplete="email" placeholder="ejemplo@colegio.edu.pe" value={loginEmail} onChange={(event) => setLoginEmail(event.target.value)} required />
              </span>
            </label>
            <label>
              <span>Contraseña</span>
              <span className="login-input">
                <LockKeyhole aria-hidden="true" />
                <input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Tu contraseña" required />
                <button className="password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                  {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                </button>
              </span>
            </label>
            <div className="login-help-row">
              <span><ShieldCheck aria-hidden="true" />Usa una contraseña segura para proteger tu cuenta.</span>
              <span className="login-password-meter" aria-hidden="true"><i /><i /><i /><i /><i /></span>
            </div>
            <button className="login-forgot" type="button" onClick={() => setRecoveryOpen(true)}>¿Olvidaste tu contraseña?</button>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button className="login-submit" disabled={submitting}>
              {submitting ? <><span className="login-spinner" />Ingresando…</> : <><LogIn aria-hidden="true" />Entrar a Avendia</>}
            </button>
            <div className="login-divider"><span>o</span></div>
            <p className="auth-switch">¿Aún no tienes cuenta? <Link to="/registro">Crear cuenta gratis <ChevronRight aria-hidden="true" /></Link></p>
          </form>
        </div>
      </section>
      {recoveryOpen ? <PasswordRecoveryDialog initialEmail={loginEmail} onClose={() => setRecoveryOpen(false)} /> : null}
    </main>
  );
}

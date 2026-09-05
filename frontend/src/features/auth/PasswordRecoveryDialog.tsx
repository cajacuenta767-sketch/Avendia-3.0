import { ArrowLeft, CheckCircle2, KeyRound, LoaderCircle, Mail, ShieldCheck, X } from "lucide-react";
import { FormEvent, useState } from "react";

import { apiRequest } from "../../lib/api";

type PasswordRecoveryDialogProps = {
  initialEmail: string;
  onClose: () => void;
};

type RequestResponse = {
  message: string;
  development_reset_code?: string | null;
};

export function PasswordRecoveryDialog({ initialEmail, onClose }: PasswordRecoveryDialogProps) {
  const [step, setStep] = useState<"request" | "reset" | "success">("request");
  const [email, setEmail] = useState(initialEmail);
  const [developmentCode, setDevelopmentCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function requestCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await apiRequest<RequestResponse>("/auth/password-reset/request", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMessage(response.message);
      setDevelopmentCode(response.development_reset_code ?? "");
      setStep("reset");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo solicitar el código.");
    } finally {
      setSubmitting(false);
    }
  }

  async function completeReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const newPassword = String(form.get("new_password") ?? "");
    if (newPassword !== String(form.get("confirm_password") ?? "")) {
      setError("Las contraseñas no coinciden.");
      setSubmitting(false);
      return;
    }
    try {
      const response = await apiRequest<{ message: string }>("/auth/password-reset/complete", {
        method: "POST",
        body: JSON.stringify({ email, code: form.get("code"), new_password: newPassword }),
      });
      setMessage(response.message);
      setStep("success");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo cambiar la contraseña.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="password-recovery-layer" role="dialog" aria-modal="true" aria-labelledby="password-recovery-title">
      <button className="password-recovery-layer__backdrop" type="button" onClick={onClose} aria-label="Cerrar recuperación" />
      <section className="password-recovery-dialog">
        <header>
          <span><KeyRound aria-hidden="true" /></span>
          <button type="button" onClick={onClose} aria-label="Cerrar"><X aria-hidden="true" /></button>
        </header>

        {step === "request" ? <>
          <h2 id="password-recovery-title">Recupera tu acceso</h2>
          <p>Escribe el correo de tu cuenta. Te enviaremos un código de seis dígitos.</p>
          <form onSubmit={requestCode}>
            <label>Correo electrónico<span className="recovery-input"><Mail aria-hidden="true" /><input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoFocus /></span></label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button className="login-submit" disabled={submitting}>{submitting ? <LoaderCircle className="is-spinning" /> : <ShieldCheck />}{submitting ? "Solicitando…" : "Enviar código"}</button>
          </form>
        </> : null}

        {step === "reset" ? <>
          <button className="recovery-back" type="button" onClick={() => { setStep("request"); setError(""); }}><ArrowLeft /> Cambiar correo</button>
          <h2 id="password-recovery-title">Escribe tu código</h2>
          <p>{message}</p>
          {developmentCode ? <div className="recovery-development-code"><small>Solo para pruebas locales</small><strong>{developmentCode}</strong><span>En producción este código llegará por correo.</span></div> : null}
          <form onSubmit={completeReset}>
            <label>Código de recuperación<input name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} defaultValue={developmentCode} required autoFocus /></label>
            <label>Nueva contraseña<input name="new_password" type="password" autoComplete="new-password" minLength={10} required placeholder="10 caracteres o más" /></label>
            <label>Repite la contraseña<input name="confirm_password" type="password" autoComplete="new-password" minLength={10} required /></label>
            {error ? <p className="form-error" role="alert">{error}</p> : null}
            <button className="login-submit" disabled={submitting}>{submitting ? <LoaderCircle className="is-spinning" /> : <KeyRound />}{submitting ? "Actualizando…" : "Cambiar contraseña"}</button>
          </form>
        </> : null}

        {step === "success" ? <div className="recovery-success">
          <CheckCircle2 aria-hidden="true" />
          <h2 id="password-recovery-title">Contraseña actualizada</h2>
          <p>{message}</p>
          <button className="login-submit" type="button" onClick={onClose}>Volver al inicio de sesión</button>
        </div> : null}
      </section>
    </div>
  );
}

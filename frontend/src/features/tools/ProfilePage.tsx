import { Accessibility, Building2, Check, ChevronRight, Coins, GraduationCap, LoaderCircle, Save, UserRound, UsersRound, Volume2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { areasByLevel, educationModalities, getEducationLevels, gradesByLevel } from "../../config/education";
import { ApiError, apiRequest } from "../../lib/api";
import { readSessionUser, sessionUserInitials, type SessionUser } from "../../lib/session";
import { useTeacherExperience } from "../../context/TeacherExperienceContext";

type ProfileForm = Required<Pick<SessionUser, "full_name" | "dre" | "ugel" | "school_name" | "director_name" | "education_modality" | "education_level" | "grade" | "section" | "curricular_area">> & { school_year: number };

function initialProfile(): ProfileForm {
  const user = readSessionUser();
  const modality = educationModalities.some((item) => item.value === user.education_modality) ? user.education_modality ?? "EBR" : "EBR";
  const level = getEducationLevels(modality).some((item) => item === user.education_level) ? user.education_level ?? "" : "";
  return {
    full_name: user.full_name ?? "",
    dre: user.dre ?? "",
    ugel: user.ugel ?? "",
    school_name: user.school_name ?? "",
    director_name: user.director_name ?? "",
    education_modality: modality,
    education_level: level,
    grade: level && gradesByLevel[level]?.includes(user.grade ?? "") ? user.grade ?? "" : "",
    section: user.section ?? "",
    curricular_area: level && areasByLevel[level]?.includes(user.curricular_area ?? "") ? user.curricular_area ?? "" : "",
    school_year: Number(user.school_year ?? new Date().getFullYear()),
  };
}

export function ProfilePage() {
  const sessionUser = readSessionUser();
  const [form, setForm] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const gradeOptions = useMemo(() => gradesByLevel[form.education_level] ?? [], [form.education_level]);
  const areaOptions = useMemo(() => areasByLevel[form.education_level] ?? [], [form.education_level]);
  const educationLevels = getEducationLevels(form.education_modality);
  const { preferences, updatePreferences } = useTeacherExperience();

  const update = <Field extends keyof ProfileForm>(field: Field, value: ProfileForm[Field]) => {
    setForm((current) => field === "education_modality"
      ? {
        ...current,
        education_modality: String(value),
        education_level: "",
        grade: "",
        curricular_area: "",
      }
      : { ...current, [field]: value });
    setMessage("");
    setError("");
  };

  const changeLevel = (level: string) => setForm((current) => ({
    ...current,
    education_level: level,
    grade: gradesByLevel[level]?.includes(current.grade) ? current.grade : "",
    curricular_area: areasByLevel[level]?.includes(current.curricular_area) ? current.curricular_area : "",
  }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = sessionStorage.getItem("avendia.accessToken");
      const updated = token ? await apiRequest<SessionUser>("/users/me", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      }) : { ...sessionUser, ...form };
      sessionStorage.setItem("avendia.user", JSON.stringify(updated));
      window.dispatchEvent(new Event("avendia-user-updated"));
      setMessage("Perfil actualizado. Estos datos se autocompletarán en las herramientas.");
    } catch (requestError) {
      setError(requestError instanceof ApiError ? requestError.message : "No se pudo actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  return <main className="profile-page"><header className="profile-heading"><div className="profile-avatar">{sessionUserInitials({ ...sessionUser, full_name: form.full_name })}</div><div><span>Cuenta docente</span><h1>Perfil institucional y curricular</h1><p>Completa estos datos una sola vez; Avendia los reutilizará como valores editables.</p></div><aside><Coins /><span><small>Créditos IA</small><strong>{Number(sessionUser.ai_credits_balance ?? 0).toLocaleString("es-PE")}</strong></span></aside></header><Link className="profile-roster-link" to="/dashboard/mis-estudiantes"><span><UsersRound /></span><div><strong>Mis estudiantes</strong><small>Crea aulas y reutiliza tus nóminas en las herramientas.</small></div><ChevronRight /></Link><form className="profile-form" onSubmit={submit}><section><header><span><UserRound /></span><div><h2>Datos personales</h2><p>Información de identificación de la cuenta.</p></div></header><div className="profile-grid"><label className="profile-wide"><span>Nombre completo <b>Obligatorio</b></span><input value={form.full_name} onChange={(event) => update("full_name", event.target.value)} required minLength={2} placeholder="Ej. Prof. María Gómez" /></label><label><span>Correo de acceso</span><input value={sessionUser.email ?? ""} disabled /></label><label><span>Rol</span><input value={sessionUser.role === "admin" ? "Administrador" : "Docente"} disabled /></label></div></section><section><header><span><Building2 /></span><div><h2>Institución educativa</h2><p>Datos que aparecerán en documentos oficiales.</p></div></header><div className="profile-grid"><label><span>DRE <b>Obligatorio</b></span><input value={form.dre} onChange={(event) => update("dre", event.target.value)} required placeholder="Ej. DRE Lima Metropolitana" /></label><label><span>UGEL <b>Obligatorio</b></span><input value={form.ugel} onChange={(event) => update("ugel", event.target.value)} required placeholder="Ej. UGEL 03" /></label><label className="profile-wide"><span>Institución educativa <b>Obligatorio</b></span><input value={form.school_name} onChange={(event) => update("school_name", event.target.value)} required placeholder="Ej. I.E. N.° 5143 República del Perú" /></label><label><span>Director(a) <b>Obligatorio</b></span><input value={form.director_name} onChange={(event) => update("director_name", event.target.value)} required placeholder="Ej. Lic. Carlos Rojas" /></label><label><span>Año lectivo <b>Obligatorio</b></span><input type="number" min={2025} max={2035} value={form.school_year} onChange={(event) => update("school_year", Number(event.target.value))} required /></label></div></section><section><header><span><GraduationCap /></span><div><h2>Contexto curricular predeterminado</h2><p>Podrás cambiarlo dentro de cada herramienta cuando sea necesario.</p></div></header><div className="profile-grid"><label><span>Modalidad <b>Obligatorio</b></span><select value={form.education_modality} onChange={(event) => update("education_modality", event.target.value)}>{educationModalities.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label><label><span>Nivel <b>Obligatorio</b></span><select value={form.education_level} onChange={(event) => changeLevel(event.target.value)} required><option value="">Selecciona el nivel</option>{educationLevels.map((level) => <option key={level}>{level}</option>)}</select></label><label><span>Grado / ciclo <b>Obligatorio</b></span><select value={form.grade} onChange={(event) => update("grade", event.target.value)} disabled={!form.education_level} required><option value="">Selecciona el grado</option>{gradeOptions.map((grade) => <option key={grade}>{grade}</option>)}</select></label><label><span>Sección <b>Obligatorio</b></span><input value={form.section} onChange={(event) => update("section", event.target.value)} required placeholder="Ej. A" /></label><label className="profile-wide"><span>Área curricular <b>Obligatorio</b></span><select value={form.curricular_area} onChange={(event) => update("curricular_area", event.target.value)} disabled={!form.education_level} required><option value="">Selecciona el área</option>{areaOptions.map((area) => <option key={area}>{area}</option>)}</select></label></div></section><section className="profile-comfort"><header><span><Accessibility /></span><div><h2>Lectura y comodidad</h2><p>Estas preferencias se guardan en tu cuenta y se aplican en todos tus dispositivos.</p></div></header><div className="profile-comfort__options"><label><input type="checkbox" checked={preferences.comfortable_spacing} onChange={(event) => void updatePreferences({ comfortable_spacing: event.target.checked })} /><span><strong>Controles grandes y mayor separación</strong><small>Facilita leer y pulsar botones sin amontonar la pantalla.</small></span></label><label><input type="checkbox" checked={preferences.always_show_help} onChange={(event) => void updatePreferences({ always_show_help: event.target.checked })} /><span><strong>Mostrar siempre la orientación</strong><small>Explica qué datos necesitas y qué creará cada herramienta.</small></span></label><label><input type="checkbox" checked={preferences.reduced_motion} onChange={(event) => void updatePreferences({ reduced_motion: event.target.checked })} /><span><strong>Reducir movimientos</strong><small>Disminuye animaciones y transiciones innecesarias.</small></span></label><label><Volume2 /><input type="checkbox" checked={preferences.read_aloud} onChange={(event) => void updatePreferences({ read_aloud: event.target.checked })} /><span><strong>Preparar lectura en voz alta</strong><small>Recuerda tu preferencia en los contenidos compatibles.</small></span></label></div></section>{message ? <div className="profile-message"><Check /> {message}</div> : null}{error ? <div className="profile-message profile-message--error">{error}</div> : null}<footer><button className="primary-button" disabled={saving}>{saving ? <LoaderCircle className="is-spinning" /> : <Save />}{saving ? "Guardando…" : "Guardar perfil"}</button></footer></form></main>;
}

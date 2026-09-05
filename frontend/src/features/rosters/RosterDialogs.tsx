import { AlertTriangle, Archive, GraduationCap, LoaderCircle, UserRound, X } from "lucide-react";
import { FormEvent, ReactNode, useMemo, useRef, useState } from "react";

import { educationModalities, getEducationLevels, gradesByLevel } from "../../config/education";
import { readSessionUser } from "../../lib/session";
import type { RosterPayload, Student, StudentPayload } from "./rosterTypes";
import type { Roster } from "./rosterTypes";
import { useDialogFocus } from "./useDialogFocus";

type DialogShellProps = {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  onClose: () => void;
};

export function DialogShell({ title, description, icon, children, onClose }: DialogShellProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const handleKeyDown = useDialogFocus(dialogRef, onClose);
  return <div className="dialog-backdrop roster-dialog-backdrop" role="presentation">
    <section ref={dialogRef} className="roster-dialog" role="dialog" aria-modal="true" aria-labelledby="roster-dialog-title" tabIndex={-1} onKeyDown={handleKeyDown}>
      <header><span>{icon}</span><div><h2 id="roster-dialog-title">{title}</h2><p>{description}</p></div><button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar"><X /></button></header>
      {children}
    </section>
  </div>;
}

type RosterFormDialogProps = {
  roster?: Roster | null;
  onClose: () => void;
  onSubmit: (payload: RosterPayload) => Promise<void>;
};

export function RosterFormDialog({ roster, onClose, onSubmit }: RosterFormDialogProps) {
  const user = readSessionUser();
  const initialModality = roster?.modality ?? user.education_modality?.split(" ")[0] ?? "EBR";
  const validModality = educationModalities.some((item) => item.value === initialModality) ? initialModality : "EBR";
  const preferredLevel = roster?.education_level ?? user.education_level;
  const initialLevel = getEducationLevels(validModality).includes(preferredLevel as never) ? preferredLevel ?? "" : "";
  const [form, setForm] = useState<RosterPayload>({
    school_year: Number(roster?.school_year ?? user.school_year ?? new Date().getFullYear()),
    institution_name: roster?.institution_name ?? user.school_name ?? "",
    modality: validModality,
    education_level: initialLevel,
    grade: roster?.grade ?? (initialLevel && gradesByLevel[initialLevel]?.includes(user.grade ?? "") ? user.grade ?? "" : ""),
    section: roster?.section ?? user.section ?? "",
    name: roster?.name ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const levels = getEducationLevels(form.modality);
  const grades = useMemo(() => gradesByLevel[form.education_level] ?? [], [form.education_level]);
  const update = (field: keyof RosterPayload, value: string | number) => {
    setForm((current) => {
      if (field === "modality") return { ...current, modality: String(value), education_level: "", grade: "" };
      if (field === "education_level") return { ...current, education_level: String(value), grade: "" };
      return { ...current, [field]: value };
    });
    setError("");
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSubmit({ ...form, institution_name: form.institution_name.trim(), section: form.section.trim(), name: form.name?.trim() });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : `No se pudo ${roster ? "actualizar" : "crear"} el aula.`);
    } finally {
      setSaving(false);
    }
  };
  return <DialogShell title={roster ? "Editar aula" : "Crear aula"} description="Organiza una nómina que podrás reutilizar en tus herramientas." icon={<GraduationCap />} onClose={onClose}>
    <form className="roster-dialog__form" onSubmit={submit}>
      {error ? <div className="roster-alert roster-alert--error" role="alert"><AlertTriangle />{error}</div> : null}
      <div className="roster-form-grid">
        <label><span>Año lectivo</span><input data-dialog-initial-focus type="number" min="2020" max="2100" value={form.school_year} onChange={(event) => update("school_year", Number(event.target.value))} required /></label>
        <label><span>Sección</span><input value={form.section} onChange={(event) => update("section", event.target.value)} placeholder="Ej. A" required /></label>
        <label className="roster-form-wide"><span>Institución educativa</span><input value={form.institution_name} onChange={(event) => update("institution_name", event.target.value)} placeholder="Ej. I.E. República del Perú" required /></label>
        <label><span>Modalidad</span><select value={form.modality} onChange={(event) => update("modality", event.target.value)}>{educationModalities.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        <label><span>Nivel o ciclo</span><select value={form.education_level} onChange={(event) => update("education_level", event.target.value)} required><option value="">Selecciona una opción</option>{levels.map((level) => <option key={level}>{level}</option>)}</select></label>
        <label><span>Grado o edad</span><select value={form.grade} onChange={(event) => update("grade", event.target.value)} disabled={!form.education_level} required><option value="">Selecciona una opción</option>{grades.map((grade) => <option key={grade}>{grade}</option>)}</select></label>
        <label><span>Nombre corto <small>Opcional</small></span><input value={form.name ?? ""} onChange={(event) => update("name", event.target.value)} placeholder="Ej. 4.º A · Comunicación" /></label>
      </div>
      <footer><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? <LoaderCircle className="is-spinning" /> : null}{saving ? "Guardando…" : roster ? "Guardar cambios" : "Crear aula"}</button></footer>
    </form>
  </DialogShell>;
}

type StudentFormDialogProps = {
  student?: Student | null;
  onClose: () => void;
  onSubmit: (payload: StudentPayload) => Promise<void>;
};

export function StudentFormDialog({ student, onClose, onSubmit }: StudentFormDialogProps) {
  const [form, setForm] = useState<StudentPayload>({
    full_name: student?.full_name ?? "",
    internal_code: student?.internal_code ?? "",
    document_number: student?.document_number ?? "",
    notes: student?.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSubmit({
        full_name: form.full_name.trim(),
        internal_code: form.internal_code?.trim(),
        document_number: form.document_number?.trim(),
        notes: form.notes?.trim(),
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo guardar el estudiante.");
    } finally {
      setSaving(false);
    }
  };
  return <DialogShell title={student ? "Editar estudiante" : "Agregar estudiante"} description="Registra únicamente datos pedagógicos necesarios." icon={<UserRound />} onClose={onClose}>
    <form className="roster-dialog__form" onSubmit={submit}>
      {error ? <div className="roster-alert roster-alert--error" role="alert"><AlertTriangle />{error}</div> : null}
      <div className="roster-form-grid">
        <label className="roster-form-wide"><span>Nombre completo</span><input data-dialog-initial-focus value={form.full_name} onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} placeholder="Ej. Ana Lucía Quispe Ramos" minLength={2} required /></label>
        <label><span>Código interno <small>Opcional</small></span><input value={form.internal_code} onChange={(event) => setForm((current) => ({ ...current, internal_code: event.target.value }))} placeholder="Ej. EST-024" /></label>
        <label><span>Documento <small>Opcional</small></span><input value={form.document_number} onChange={(event) => setForm((current) => ({ ...current, document_number: event.target.value }))} placeholder="DNI o código de identidad" inputMode="numeric" /></label>
        <label className="roster-form-wide"><span>Observación pedagógica <small>Opcional</small></span><textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Ej. Prefiere consignas breves y ejemplos visuales. No registres diagnósticos médicos." /></label>
      </div>
      <p className="roster-privacy-note">La nómina no debe contener diagnósticos médicos ni información sensible innecesaria.</p>
      <footer><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button className="primary-button" disabled={saving}>{saving ? <LoaderCircle className="is-spinning" /> : null}{saving ? "Guardando…" : student ? "Guardar cambios" : "Agregar estudiante"}</button></footer>
    </form>
  </DialogShell>;
}

type ConfirmStudentDialogProps = {
  student: Student;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function ConfirmStudentDialog({ student, onClose, onConfirm }: ConfirmStudentDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  return <DialogShell title="Retirar estudiante" description="Sus documentos anteriores se conservarán." icon={<AlertTriangle />} onClose={onClose}>
    <div className="roster-confirm"><p><strong>{student.full_name}</strong> dejará de aparecer en la nómina activa. Podrás reactivarlo desde el filtro “Retirados”.</p>{error ? <div className="roster-alert roster-alert--error" role="alert">{error}</div> : null}<footer><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button type="button" className="roster-danger-button" disabled={saving} onClick={async () => { setSaving(true); setError(""); try { await onConfirm(); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "No se pudo retirar."); setSaving(false); } }}>{saving ? "Retirando…" : "Retirar de la nómina"}</button></footer></div>
  </DialogShell>;
}

type ConfirmRosterDialogProps = {
  roster: Roster;
  onClose: () => void;
  onConfirm: () => Promise<void>;
};

export function ConfirmRosterDialog({ roster, onClose, onConfirm }: ConfirmRosterDialogProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  return <DialogShell title="Archivar aula" description="La nómina y sus documentos se conservarán." icon={<Archive />} onClose={onClose}>
    <div className="roster-confirm"><p><strong>{roster.name || `${roster.grade} · ${roster.section}`}</strong> dejará de estar disponible para nuevas selecciones. Podrás reactivarla desde esta misma página.</p>{error ? <div className="roster-alert roster-alert--error" role="alert">{error}</div> : null}<footer><button type="button" className="secondary-button" onClick={onClose}>Cancelar</button><button type="button" data-dialog-initial-focus className="roster-danger-button" disabled={saving} onClick={async () => { setSaving(true); setError(""); try { await onConfirm(); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "No se pudo archivar el aula."); setSaving(false); } }}>{saving ? "Archivando…" : "Archivar aula"}</button></footer></div>
  </DialogShell>;
}

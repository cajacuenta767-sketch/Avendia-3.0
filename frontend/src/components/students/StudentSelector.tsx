import {
  AlertCircle,
  Check,
  LoaderCircle,
  RefreshCw,
  Search,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { type KeyboardEvent, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import { listRosters, listStudents } from "../../features/rosters/rosterApi";
import type { Roster, Student } from "../../features/rosters/rosterTypes";
import "./StudentSelector.css";

export type StudentSelectorMode = "single" | "multiple" | "classroom" | "group";

/**
 * Stable selection value shared by the pedagogical tools.
 * `studentIds` always contains API IDs, never display names.
 */
export type StudentSelection = {
  mode: StudentSelectorMode;
  rosterId: string;
  studentIds: string[];
  groupName?: string;
};

/** Props accepted by {@link StudentSelector}. */
export type StudentSelectorProps = {
  /** Selection behavior: one student, several, the whole classroom, or a named group. */
  mode: StudentSelectorMode;
  /** Receives stable roster/student IDs, or `null` when no roster is available. */
  onChange: (selection: StudentSelection | null) => void;
  /** Controlled value. Omit it to let the component keep its own selection. */
  value?: StudentSelection | null;
  /** Initial value for uncontrolled usage. */
  defaultValue?: StudentSelection | null;
  /** Accessible title rendered as the fieldset legend. */
  label?: string;
  /** Help text associated with the roster picker and search field. */
  description?: string;
  /** Marks the student selection and, in group mode, the group name as required. */
  required?: boolean;
  /** Disables every interactive control. */
  disabled?: boolean;
  /** Locks the component to one roster supplied by the parent tool. */
  fixedRosterId?: string;
  /** Hides the roster select when `fixedRosterId` is already known. */
  hideRosterPicker?: boolean;
  /** Optional destination used in empty states to open the central roster manager. */
  manageStudentsHref?: string;
  /** Extra root class; component classes remain in place for responsive/theme styles. */
  className?: string;
  /** Optional accessible ID prefix; React creates one when omitted. */
  id?: string;
};

type LoadState = "idle" | "loading" | "success" | "error";

const MODE_COPY: Record<StudentSelectorMode, string> = {
  single: "Elige un estudiante de la nómina.",
  multiple: "Elige uno o varios estudiantes.",
  classroom: "Se incluirán todos los estudiantes activos del aula.",
  group: "Asigna un nombre y elige a los integrantes del grupo.",
};

function normalizeSearch(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim();
}

function uniqueIds(ids: string[]) {
  return [...new Set(ids.map((id) => String(id).trim()).filter(Boolean))];
}

function rosterTitle(roster: Roster | undefined) {
  if (!roster) return "Aula no disponible";
  return roster.name?.trim() || [roster.grade, roster.section].filter(Boolean).join(" · ") || "Aula sin nombre";
}

function rosterOption(roster: Roster) {
  const classroom = rosterTitle(roster);
  const institution = roster.institution_name?.trim();
  return institution ? `${classroom} — ${institution}` : classroom;
}

function errorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "No pudimos cargar la nómina. Inténtalo nuevamente.";
}

/**
 * Reusable roster-backed selector.
 *
 * It loads `/rosters` and `/rosters/{id}/students`, supports controlled and
 * uncontrolled values, and emits stable IDs for every selection mode.
 */
export function StudentSelector({
  mode,
  onChange,
  value,
  defaultValue = null,
  label = "Seleccionar estudiantes",
  description,
  required = false,
  disabled = false,
  fixedRosterId,
  hideRosterPicker = false,
  manageStudentsHref,
  className = "",
  id,
}: StudentSelectorProps) {
  const generatedId = useId().replace(/:/g, "");
  const baseId = id || `student-selector-${generatedId}`;
  const helpId = `${baseId}-help`;
  const rosterPickerId = `${baseId}-roster`;
  const groupNameId = `${baseId}-group-name`;
  const searchId = `${baseId}-search`;
  const listId = `${baseId}-list`;

  const [internalValue, setInternalValue] = useState<StudentSelection | null>(defaultValue);
  const effectiveValue = value === undefined ? internalValue : value;
  const initialRosterId = fixedRosterId || effectiveValue?.rosterId || "";
  const [activeRosterId, setActiveRosterId] = useState(initialRosterId);
  const resolvedRosterId = fixedRosterId || effectiveValue?.rosterId || activeRosterId;
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsRosterId, setStudentsRosterId] = useState("");
  const [rostersState, setRostersState] = useState<LoadState>("loading");
  const [studentsState, setStudentsState] = useState<LoadState>("idle");
  const [rostersError, setRostersError] = useState("");
  const [studentsError, setStudentsError] = useState("");
  const [rostersRetry, setRostersRetry] = useState(0);
  const [studentsRetry, setStudentsRetry] = useState(0);
  const [search, setSearch] = useState("");

  const onChangeRef = useRef(onChange);
  const effectiveValueRef = useRef(effectiveValue);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    effectiveValueRef.current = effectiveValue;
  }, [effectiveValue]);

  const commitSelection = useCallback((rosterId: string, ids: string[], groupName = "") => {
    const normalizedIds = uniqueIds(ids);
    const next: StudentSelection = {
      mode,
      rosterId,
      studentIds: mode === "single" ? normalizedIds.slice(0, 1) : normalizedIds,
      ...(mode === "group" ? { groupName } : {}),
    };
    setInternalValue(next);
    onChangeRef.current(next);
  }, [mode]);

  useEffect(() => {
    let active = true;
    void listRosters()
      .then((response) => {
        if (!active) return;
        const nextRosters = response.filter((roster) => roster.active !== false);
        setRosters(nextRosters);
        setRostersState("success");
        setActiveRosterId((current) => {
          if (fixedRosterId) return fixedRosterId;
          if (current && nextRosters.some((roster) => roster.id === current)) return current;
          const selectedRosterId = effectiveValueRef.current?.rosterId;
          if (selectedRosterId && nextRosters.some((roster) => roster.id === selectedRosterId)) return selectedRosterId;
          return nextRosters[0]?.id ?? "";
        });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setRosters([]);
        setRostersState("error");
        setRostersError(errorMessage(error));
      });
    return () => { active = false; };
  }, [fixedRosterId, rostersRetry]);

  useEffect(() => {
    if (!resolvedRosterId) return;
    let active = true;
    void listStudents(resolvedRosterId)
      .then((response) => {
        if (!active) return;
        const nextStudents = response.filter((student) => student.active !== false);
        setStudents(nextStudents);
        setStudentsRosterId(resolvedRosterId);
        setStudentsState("success");
        setStudentsError("");
        const current = effectiveValueRef.current;
        const groupName = current?.mode === "group" ? current.groupName ?? "" : "";
        if (mode === "classroom") {
          commitSelection(resolvedRosterId, nextStudents.map((student) => student.id));
        } else if (!current || current.rosterId !== resolvedRosterId || current.mode !== mode) {
          commitSelection(resolvedRosterId, [], groupName);
        } else if (mode === "single" && current.studentIds.length > 1) {
          commitSelection(resolvedRosterId, current.studentIds.slice(0, 1));
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        setStudentsRosterId(resolvedRosterId);
        setStudentsState("error");
        setStudentsError(errorMessage(error));
      });
    return () => { active = false; };
  }, [commitSelection, mode, resolvedRosterId, studentsRetry]);

  const displayedStudentsState: LoadState = !resolvedRosterId
    ? "idle"
    : studentsRosterId === resolvedRosterId
      ? studentsState
      : "loading";
  const displayedStudents = useMemo(
    () => studentsRosterId === resolvedRosterId ? students : [],
    [resolvedRosterId, students, studentsRosterId],
  );
  const selectedRoster = rosters.find((roster) => roster.id === resolvedRosterId);
  const selectedIds = useMemo(() => {
    if (mode === "classroom") return displayedStudents.map((student) => student.id);
    if (!effectiveValue || effectiveValue.rosterId !== resolvedRosterId) return [];
    const ids = uniqueIds(effectiveValue.studentIds);
    return mode === "single" ? ids.slice(0, 1) : ids;
  }, [displayedStudents, effectiveValue, mode, resolvedRosterId]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const groupName = effectiveValue?.mode === "group" && effectiveValue.rosterId === resolvedRosterId
    ? effectiveValue.groupName ?? ""
    : "";
  const normalizedQuery = normalizeSearch(search);
  const visibleStudents = useMemo(() => {
    if (!normalizedQuery) return displayedStudents;
    return displayedStudents.filter((student) => normalizeSearch(`${student.full_name} ${student.internal_code ?? ""}`).includes(normalizedQuery));
  }, [displayedStudents, normalizedQuery]);
  const visibleIds = visibleStudents.map((student) => student.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((studentId) => selectedSet.has(studentId));
  const unavailableSelectedCount = selectedIds.filter((studentId) => !displayedStudents.some((student) => student.id === studentId)).length;
  const rootClassName = ["student-selector", `student-selector--${mode}`, className].filter(Boolean).join(" ");
  const describedBy = description || MODE_COPY[mode] ? helpId : undefined;

  function handleRosterChange(nextRosterId: string) {
    setActiveRosterId(nextRosterId);
    setSearch("");
    setStudents([]);
    if (!nextRosterId) {
      setInternalValue(null);
      onChangeRef.current(null);
      return;
    }
    const preservedGroupName = effectiveValueRef.current?.mode === "group" ? effectiveValueRef.current.groupName ?? "" : "";
    commitSelection(nextRosterId, [], preservedGroupName);
  }

  function toggleStudent(studentId: string) {
    if (mode === "classroom" || disabled) return;
    if (mode === "single") {
      commitSelection(resolvedRosterId, selectedSet.has(studentId) ? [] : [studentId]);
      return;
    }
    const nextIds = selectedSet.has(studentId)
      ? selectedIds.filter((idValue) => idValue !== studentId)
      : [...selectedIds, studentId];
    commitSelection(resolvedRosterId, nextIds, groupName);
  }

  function toggleVisibleStudents() {
    const nextIds = allVisibleSelected
      ? selectedIds.filter((studentId) => !visibleIds.includes(studentId))
      : [...selectedIds, ...visibleIds];
    commitSelection(resolvedRosterId, nextIds, groupName);
  }

  function moveStudentFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const movement = event.key === "ArrowDown" || event.key === "ArrowRight"
      ? 1
      : event.key === "ArrowUp" || event.key === "ArrowLeft"
        ? -1
        : 0;
    if (!movement && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? visibleStudents.length - 1
        : (index + movement + visibleStudents.length) % visibleStudents.length;
    document.getElementById(`${baseId}-student-${visibleStudents[nextIndex].id}`)?.focus();
  }

  function retryRosters() {
    setRostersState("loading");
    setRostersError("");
    setRostersRetry((attempt) => attempt + 1);
  }

  function retryStudents() {
    setStudentsState("loading");
    setStudentsError("");
    setStudentsRetry((attempt) => attempt + 1);
  }

  return (
    <fieldset
      className={rootClassName}
      aria-busy={rostersState === "loading" || displayedStudentsState === "loading"}
      disabled={disabled}
    >
      <legend id={`${baseId}-legend`}>
        <span className="student-selector__legend-icon" aria-hidden="true">
          {mode === "single" ? <UserRound /> : <UsersRound />}
        </span>
        <span>{label}{required ? <sup aria-hidden="true">*</sup> : null}</span>
      </legend>
      <p id={helpId} className="student-selector__help">{description || MODE_COPY[mode]}</p>

      {rostersState === "loading" ? (
        <div className="student-selector__state" role="status">
          <LoaderCircle className="student-selector__spinner" aria-hidden="true" />
          <span>Cargando tus aulas…</span>
        </div>
      ) : null}

      {rostersState === "error" ? (
        <div className="student-selector__state student-selector__state--error" role="alert">
          <AlertCircle aria-hidden="true" />
          <div><strong>No se pudieron cargar las aulas</strong><span>{rostersError}</span></div>
          <button type="button" onClick={retryRosters}>
            <RefreshCw aria-hidden="true" /> Reintentar
          </button>
        </div>
      ) : null}

      {rostersState === "success" && rosters.length === 0 ? (
        <div className="student-selector__state student-selector__state--empty">
          <UsersRound aria-hidden="true" />
          <div><strong>Aún no tienes aulas activas</strong><span>Crea o activa una nómina para seleccionar estudiantes.</span></div>
          {manageStudentsHref && !disabled ? <a href={manageStudentsHref}>Ir a Mis estudiantes</a> : null}
        </div>
      ) : null}

      {rostersState === "success" && rosters.length > 0 ? (
        <div className="student-selector__content">
          {!hideRosterPicker ? (
            <label className="student-selector__field" htmlFor={rosterPickerId}>
              <span>Aula o nómina</span>
              <select
                id={rosterPickerId}
                value={resolvedRosterId}
                onChange={(event) => handleRosterChange(event.target.value)}
                aria-describedby={describedBy}
                disabled={disabled || Boolean(fixedRosterId)}
                required={required}
              >
                <option value="">Selecciona un aula</option>
                {rosters.map((roster) => <option key={roster.id} value={roster.id}>{rosterOption(roster)}</option>)}
              </select>
            </label>
          ) : (
            <div className="student-selector__roster-summary" aria-label={`Aula: ${rosterTitle(selectedRoster)}`}>
              <UsersRound aria-hidden="true" />
              <div>
                <strong>{rosterTitle(selectedRoster)}</strong>
                <span>{selectedRoster?.institution_name || "Institución no indicada"}</span>
              </div>
            </div>
          )}

          {mode === "group" ? (
            <label className="student-selector__field" htmlFor={groupNameId}>
              <span>Nombre del grupo{required ? <sup aria-hidden="true">*</sup> : null}</span>
              <input
                id={groupNameId}
                value={groupName}
                onChange={(event) => commitSelection(resolvedRosterId, selectedIds, event.target.value)}
                placeholder="Ej. Equipo Exploradores"
                autoComplete="off"
                aria-required={required}
                required={required}
                disabled={!resolvedRosterId || disabled}
              />
            </label>
          ) : null}

          {resolvedRosterId ? (
            <div className="student-selector__students">
              <div className="student-selector__toolbar">
                <label className="student-selector__search" htmlFor={searchId}>
                  <Search aria-hidden="true" />
                  <input
                    id={searchId}
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por nombre o código"
                    aria-label="Buscar estudiantes"
                    aria-controls={listId}
                    disabled={disabled || displayedStudentsState !== "success" || displayedStudents.length === 0}
                  />
                  {search ? (
                    <button type="button" onClick={() => setSearch("")} aria-label="Borrar texto de búsqueda">
                      <X aria-hidden="true" />
                    </button>
                  ) : null}
                </label>
                {(mode === "multiple" || mode === "group") && displayedStudentsState === "success" && visibleIds.length > 0 ? (
                  <button
                    type="button"
                    className="student-selector__select-all"
                    onClick={toggleVisibleStudents}
                    aria-pressed={allVisibleSelected}
                    disabled={disabled}
                  >
                    <Check aria-hidden="true" />
                    {allVisibleSelected ? "Quitar visibles" : search ? "Seleccionar visibles" : "Seleccionar todo"}
                  </button>
                ) : null}
              </div>

              <div className="student-selector__selection-status" role="status" aria-live="polite">
                <span>{selectedIds.length} {selectedIds.length === 1 ? "estudiante seleccionado" : "estudiantes seleccionados"}</span>
                {unavailableSelectedCount > 0 ? <small>{unavailableSelectedCount} ya no aparece en la nómina activa.</small> : null}
              </div>

              {displayedStudentsState === "loading" ? (
                <div className="student-selector__state" role="status">
                  <LoaderCircle className="student-selector__spinner" aria-hidden="true" />
                  <span>Cargando estudiantes…</span>
                </div>
              ) : null}

              {displayedStudentsState === "error" ? (
                <div className="student-selector__state student-selector__state--error" role="alert">
                  <AlertCircle aria-hidden="true" />
                  <div><strong>No se pudieron cargar los estudiantes</strong><span>{studentsError}</span></div>
                  <button type="button" onClick={retryStudents}>
                    <RefreshCw aria-hidden="true" /> Reintentar
                  </button>
                </div>
              ) : null}

              {displayedStudentsState === "success" && displayedStudents.length === 0 ? (
                <div className="student-selector__state student-selector__state--empty">
                  <UserRound aria-hidden="true" />
                  <div><strong>Esta aula aún no tiene estudiantes activos</strong><span>Agrega estudiantes antes de usar esta herramienta.</span></div>
                  {manageStudentsHref && !disabled ? <a href={manageStudentsHref}>Ir a Mis estudiantes</a> : null}
                </div>
              ) : null}

              {displayedStudentsState === "success" && displayedStudents.length > 0 && visibleStudents.length === 0 ? (
                <div className="student-selector__state student-selector__state--empty">
                  <Search aria-hidden="true" />
                  <div><strong>No encontramos coincidencias</strong><span>Prueba con otro nombre o código.</span></div>
                  <button type="button" onClick={() => setSearch("")}>Limpiar búsqueda</button>
                </div>
              ) : null}

              {displayedStudentsState === "success" && visibleStudents.length > 0 ? (
                <div
                  id={listId}
                  className="student-selector__list"
                  role="listbox"
                  aria-label={`Estudiantes de ${rosterTitle(selectedRoster)}`}
                  aria-multiselectable={mode !== "single"}
                  aria-required={required}
                >
                  {visibleStudents.map((student) => {
                    const selected = selectedSet.has(student.id);
                    const content = (
                      <>
                        <span className="student-selector__check" aria-hidden="true">{selected ? <Check /> : null}</span>
                        <span className="student-selector__student-copy">
                          <strong>{student.full_name}</strong>
                          {student.internal_code ? <small>Código: {student.internal_code}</small> : null}
                        </span>
                      </>
                    );
                    return mode === "classroom" ? (
                      <div
                        key={student.id}
                        className="student-selector__option is-selected is-readonly"
                        role="option"
                        aria-selected="true"
                        aria-disabled="true"
                      >{content}</div>
                    ) : (
                      <button
                        key={student.id}
                        id={`${baseId}-student-${student.id}`}
                        type="button"
                        className={`student-selector__option${selected ? " is-selected" : ""}`}
                        role="option"
                        aria-selected={selected}
                        aria-posinset={visibleStudents.indexOf(student) + 1}
                        aria-setsize={visibleStudents.length}
                        onClick={() => toggleStudent(student.id)}
                        onKeyDown={(event) => moveStudentFocus(event, visibleStudents.indexOf(student))}
                        disabled={disabled}
                      >{content}</button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </fieldset>
  );
}

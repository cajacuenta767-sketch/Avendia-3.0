import {
  AlertTriangle, Archive, ArrowDown, ArrowUp, Check, Download, FileSpreadsheet, GraduationCap,
  LoaderCircle, Pencil, Plus, RefreshCw, RotateCcw, Search, Trash2, UserRoundCheck, UsersRound,
} from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { ApiError } from "../../lib/api";
import {
  archiveRoster, createRoster, createStudent, downloadRosterTemplate, listRosters, listStudents,
  removeStudent, reorderStudents, updateRoster, updateStudent,
} from "./rosterApi";
import { ConfirmRosterDialog, ConfirmStudentDialog, RosterFormDialog, StudentFormDialog } from "./RosterDialogs";
import { RosterImportWizard } from "./RosterImportWizard";
import type { Roster, RosterPayload, Student, StudentPayload } from "./rosterTypes";

type StudentFilter = "active" | "inactive" | "all";

function rosterTitle(roster: Roster): string {
  return roster.name?.trim() || `${roster.grade} · ${roster.section}`;
}

function rosterCount(roster: Roster, selectedRosterId: string, students: Student[]): number {
  if (roster.id === selectedRosterId) return students.filter((student) => student.active).length;
  return roster.active_student_count ?? roster.student_count ?? roster.students_count ?? 0;
}

function messageFromError(error: unknown, fallback: string): string {
  return error instanceof ApiError || error instanceof Error ? error.message : fallback;
}

function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-PE").trim();
}

export function RosterPage() {
  const [rosters, setRosters] = useState<Roster[]>([]);
  const [selectedRosterId, setSelectedRosterId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingRosters, setLoadingRosters] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [pageError, setPageError] = useState("");
  const [studentError, setStudentError] = useState("");
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [studentFilter, setStudentFilter] = useState<StudentFilter>("active");
  const [yearFilter, setYearFilter] = useState("all");
  const [rosterDialog, setRosterDialog] = useState<"create" | Roster | null>(null);
  const [rosterToArchive, setRosterToArchive] = useState<Roster | null>(null);
  const [studentDialog, setStudentDialog] = useState<"create" | Student | null>(null);
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
  const [showImport, setShowImport] = useState(false);
  const [toast, setToast] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [templateError, setTemplateError] = useState("");
  const [reordering, setReordering] = useState(false);
  const studentRequestToken = useRef(0);

  const selectedRoster = rosters.find((roster) => roster.id === selectedRosterId) ?? null;
  const availableYears = useMemo(() => [...new Set(rosters.map((roster) => roster.school_year))].sort((left, right) => right - left), [rosters]);
  const visibleRosters = useMemo(() => yearFilter === "all" ? rosters : rosters.filter((roster) => String(roster.school_year) === yearFilter), [rosters, yearFilter]);
  const sortedStudents = useMemo(() => [...students].sort((left, right) => left.sort_order - right.sort_order), [students]);
  const filteredStudents = useMemo(() => {
    const query = normalizeSearch(deferredSearch);
    return sortedStudents.filter((student) => {
      const matchesStatus = studentFilter === "all" || (studentFilter === "active" ? student.active : !student.active);
      const searchable = normalizeSearch(`${student.full_name} ${student.internal_code ?? ""} ${student.document_number ?? ""}`);
      return matchesStatus && (!query || searchable.includes(query));
    });
  }, [deferredSearch, sortedStudents, studentFilter]);

  const loadRosters = useCallback(async (signal?: AbortSignal) => {
    setLoadingRosters(true);
    setPageError("");
    try {
      const nextRosters = await listRosters({ includeInactive: true, signal });
      if (signal?.aborted) return;
      setRosters(nextRosters);
      setSelectedRosterId((current) => nextRosters.some((roster) => roster.id === current) ? current : nextRosters[0]?.id ?? "");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setPageError(messageFromError(error, "No se pudieron cargar tus aulas."));
    } finally {
      if (!signal?.aborted) setLoadingRosters(false);
    }
  }, []);

  const loadStudents = useCallback(async (rosterId: string, signal?: AbortSignal) => {
    const requestToken = ++studentRequestToken.current;
    setLoadingStudents(true);
    setStudentError("");
    try {
      const nextStudents = await listStudents(rosterId, { includeInactive: true, signal });
      if (signal?.aborted || requestToken !== studentRequestToken.current) return;
      setStudents(nextStudents);
    } catch (error) {
      if (signal?.aborted || requestToken !== studentRequestToken.current || (error instanceof DOMException && error.name === "AbortError")) return;
      setStudents([]);
      setStudentError(messageFromError(error, "No se pudo cargar la nómina."));
    } finally {
      if (!signal?.aborted && requestToken === studentRequestToken.current) setLoadingStudents(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => void loadRosters(controller.signal), 0);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [loadRosters]);
  useEffect(() => {
    if (!selectedRosterId) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => void loadStudents(selectedRosterId, controller.signal), 0);
    return () => { window.clearTimeout(timeout); controller.abort(); };
  }, [loadStudents, selectedRosterId]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const saveRoster = async (payload: RosterPayload) => {
    if (rosterDialog && rosterDialog !== "create") {
      const updated = await updateRoster(rosterDialog.id, payload);
      setRosters((current) => current.map((roster) => roster.id === updated.id ? updated : roster));
      if (yearFilter !== "all" && String(updated.school_year) !== yearFilter) setYearFilter(String(updated.school_year));
      setToast("Datos del aula actualizados.");
    } else {
      const roster = await createRoster(payload);
      setRosters((current) => [...current, roster]);
      setSelectedRosterId(roster.id);
      setYearFilter(String(roster.school_year));
      setToast("Aula creada. Ya puedes agregar estudiantes.");
    }
    setRosterDialog(null);
  };

  const changeYearFilter = (year: string) => {
    setYearFilter(year);
    const nextVisible = year === "all" ? rosters : rosters.filter((roster) => String(roster.school_year) === year);
    if (!nextVisible.some((roster) => roster.id === selectedRosterId)) {
      setSelectedRosterId(nextVisible[0]?.id ?? "");
      if (!nextVisible.length) {
        studentRequestToken.current += 1;
        setStudents([]);
        setLoadingStudents(false);
      }
    }
  };

  const confirmArchiveRoster = async () => {
    if (!rosterToArchive) return;
    await archiveRoster(rosterToArchive.id);
    setRosters((current) => current.map((roster) => roster.id === rosterToArchive.id ? { ...roster, active: false } : roster));
    setRosterToArchive(null);
    setToast("Aula archivada. Podrás reactivarla cuando la necesites.");
  };

  const reactivateRoster = async (roster: Roster) => {
    setStudentError("");
    try {
      const updated = await updateRoster(roster.id, { active: true });
      setRosters((current) => current.map((item) => item.id === updated.id ? updated : item));
      setToast("Aula reactivada.");
    } catch (error) {
      setStudentError(messageFromError(error, "No se pudo reactivar el aula."));
    }
  };

  const saveStudent = async (payload: StudentPayload) => {
    if (!selectedRoster) return;
    if (studentDialog && studentDialog !== "create") {
      const updated = await updateStudent(selectedRoster.id, studentDialog.id, payload);
      setStudents((current) => current.map((student) => student.id === updated.id ? updated : student));
      setToast("Datos del estudiante actualizados.");
    } else {
      const created = await createStudent(selectedRoster.id, payload);
      setStudents((current) => [...current, created]);
      setToast("Estudiante agregado al aula.");
    }
    setStudentDialog(null);
  };

  const confirmRemove = async () => {
    if (!selectedRoster || !studentToRemove) return;
    await removeStudent(selectedRoster.id, studentToRemove.id);
    setStudents((current) => current.map((student) => student.id === studentToRemove.id ? { ...student, active: false } : student));
    setStudentToRemove(null);
    setToast("Estudiante retirado. Sus documentos anteriores se conservaron.");
  };

  const reactivate = async (student: Student) => {
    if (!selectedRoster) return;
    setStudentError("");
    try {
      const updated = await updateStudent(selectedRoster.id, student.id, { active: true });
      setStudents((current) => current.map((item) => item.id === updated.id ? updated : item));
      setToast("Estudiante reactivado.");
    } catch (error) {
      setStudentError(messageFromError(error, "No se pudo reactivar al estudiante."));
    }
  };

  const moveStudent = async (studentId: string, direction: -1 | 1) => {
    if (!selectedRoster || reordering) return;
    const activeStudents = sortedStudents.filter((student) => student.active);
    const currentIndex = activeStudents.findIndex((student) => student.id === studentId);
    const targetIndex = currentIndex + direction;
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= activeStudents.length) return;
    const next = [...activeStudents];
    [next[currentIndex], next[targetIndex]] = [next[targetIndex], next[currentIndex]];
    const optimistic = next.map((student, index) => ({ ...student, sort_order: index }));
    const optimisticById = new Map(optimistic.map((student) => [student.id, student]));
    setStudents((current) => current.map((student) => optimisticById.get(student.id) ?? student));
    setStudentError("");
    setReordering(true);
    try {
      const reordered = await reorderStudents(selectedRoster.id, next.map((student) => student.id));
      const reorderedById = new Map(reordered.map((student) => [student.id, student]));
      setStudents((current) => current.map((student) => reorderedById.get(student.id) ?? student));
    } catch (error) {
      setStudents((current) => current.map((student) => activeStudents.find((original) => original.id === student.id) ?? student));
      setStudentError(messageFromError(error, "No se pudo guardar el nuevo orden."));
    } finally {
      setReordering(false);
    }
  };

  const downloadTemplate = async () => {
    setDownloading(true);
    setTemplateError("");
    try {
      await downloadRosterTemplate();
      setToast("Plantilla descargada. La fila de ejemplo no se importará.");
    } catch (error) {
      setTemplateError(messageFromError(error, "No se pudo descargar la plantilla."));
    } finally {
      setDownloading(false);
    }
  };

  return <main className="roster-page">
    <header className="roster-page__heading"><div><span className="roster-page__icon"><UsersRound /></span><div><h1>Mis estudiantes</h1><p>Una nómina central, ordenada y reutilizable para todas tus herramientas.</p></div></div><button className="primary-button" onClick={() => setRosterDialog("create")}><Plus /> Crear aula</button></header>
    {pageError ? <section className="roster-load-state roster-load-state--error" role="alert"><AlertTriangle /><h2>No pudimos cargar tus aulas</h2><p>{pageError}</p><button className="secondary-button" onClick={() => void loadRosters()}><RefreshCw /> Reintentar</button></section> : null}
    {!pageError && loadingRosters ? <section className="roster-load-state" aria-live="polite"><LoaderCircle className="is-spinning" /><h2>Cargando tus aulas…</h2><p>Estamos preparando tus nóminas.</p></section> : null}
    {!pageError && !loadingRosters && !rosters.length ? <section className="roster-welcome"><span><GraduationCap /></span><h2>Crea tu primera aula</h2><p>Por ejemplo: “4.º A · Comunicación”. Luego podrás agregar estudiantes uno a uno o importar un archivo.</p>{templateError ? <div className="roster-alert roster-alert--error" role="alert"><AlertTriangle />{templateError}</div> : null}<div><button className="primary-button" onClick={() => setRosterDialog("create")}><Plus /> Crear mi primera aula</button><button className="secondary-button" onClick={() => void downloadTemplate()} disabled={downloading}>{downloading ? <LoaderCircle className="is-spinning" /> : <Download />}{downloading ? "Preparando plantilla…" : "Descargar plantilla"}</button></div></section> : null}
    {!pageError && !loadingRosters && rosters.length ? <div className="roster-layout">
      <aside className="roster-sidebar" aria-label="Aulas"><header><div><h2>Mis aulas</h2><span>{rosters.length}</span></div><label><span>Año</span><select value={yearFilter} onChange={(event) => changeYearFilter(event.target.value)}><option value="all">Todos</option>{availableYears.map((year) => <option key={year}>{year}</option>)}</select></label></header><div className="roster-sidebar__list">{visibleRosters.map((roster) => <button type="button" className={`${roster.id === selectedRosterId ? "is-active" : ""} ${!roster.active ? "is-archived" : ""}`} aria-pressed={roster.id === selectedRosterId} key={roster.id} onClick={() => setSelectedRosterId(roster.id)}><span><strong>{rosterTitle(roster)}</strong><small>{roster.education_level} · {roster.school_year}{!roster.active ? " · Archivada" : ""}</small></span><em>{rosterCount(roster, selectedRosterId, students)}</em></button>)}</div>{!visibleRosters.length ? <p>No hay aulas para este año.</p> : null}<button type="button" className="roster-sidebar__add" onClick={() => setRosterDialog("create")}><Plus /> Nueva aula</button></aside>
      <section className="roster-main">
        {selectedRoster ? <><header className="roster-main__header"><div><small>{selectedRoster.institution_name}</small><h2>{rosterTitle(selectedRoster)}</h2><p>{selectedRoster.modality} · {selectedRoster.education_level} · {students.filter((student) => student.active).length} estudiantes activos{!selectedRoster.active ? " · Aula archivada" : ""}</p></div><div><button className="secondary-button" onClick={() => setRosterDialog(selectedRoster)}><Pencil /> Editar aula</button>{selectedRoster.active ? <button className="secondary-button" onClick={() => setRosterToArchive(selectedRoster)}><Archive /> Archivar</button> : <button className="secondary-button" onClick={() => void reactivateRoster(selectedRoster)}><RotateCcw /> Reactivar</button>}<button className="secondary-button" onClick={() => void downloadTemplate()} disabled={downloading}>{downloading ? <LoaderCircle className="is-spinning" /> : <Download />}{downloading ? "Preparando…" : "Plantilla"}</button><button className="secondary-button" onClick={() => setShowImport(true)} disabled={!selectedRoster.active}><FileSpreadsheet /> Importar archivo</button><button className="primary-button" onClick={() => setStudentDialog("create")} disabled={!selectedRoster.active}><Plus /> Agregar estudiante</button></div></header>
          <div className="roster-mobile-select"><label><span>Aula activa</span><select value={selectedRosterId} onChange={(event) => setSelectedRosterId(event.target.value)}>{visibleRosters.map((roster) => <option value={roster.id} key={roster.id}>{rosterTitle(roster)}</option>)}</select></label></div>
          <div className="roster-toolbar"><label className="roster-search"><Search /><span className="sr-only">Buscar estudiantes</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, código o documento" /></label><label className="roster-filter"><span>Estado</span><select value={studentFilter} onChange={(event) => setStudentFilter(event.target.value as StudentFilter)}><option value="active">Activos</option><option value="inactive">Retirados</option><option value="all">Todos</option></select></label><span className="roster-toolbar__count">{filteredStudents.length} resultados</span></div>
          {!selectedRoster.active ? <div className="roster-alert roster-alert--warning" role="status"><Archive />Esta aula está archivada. Reactívala para agregar, editar, importar o reordenar estudiantes.</div> : null}
          {templateError ? <div className="roster-alert roster-alert--error" role="alert"><AlertTriangle />{templateError}</div> : null}
          {studentError ? <div className="roster-alert roster-alert--error" role="alert"><AlertTriangle />{studentError}<button onClick={() => void loadStudents(selectedRoster.id)}>Reintentar</button></div> : null}
          {loadingStudents ? <div className="roster-table-loading" aria-live="polite"><LoaderCircle className="is-spinning" /> Cargando estudiantes…</div> : null}
          {!studentError && !loadingStudents && !students.length ? <div className="roster-empty"><span><UsersRound /></span><h3>Esta aula aún no tiene estudiantes</h3><p>Agrega a “Ana Lucía Quispe Ramos” como ejemplo o importa tu archivo. Avendia nunca inventará nombres.</p><div><button className="primary-button" onClick={() => setStudentDialog("create")} disabled={!selectedRoster.active}><Plus /> Agregar estudiante</button><button className="secondary-button" onClick={() => setShowImport(true)} disabled={!selectedRoster.active}><FileSpreadsheet /> Importar archivo</button></div></div> : null}
          {!studentError && !loadingStudents && students.length && !filteredStudents.length ? <div className="roster-empty roster-empty--compact"><Search /><h3>No encontramos coincidencias</h3><p>Prueba otro nombre o cambia el filtro de estado.</p><button className="secondary-button" onClick={() => { setSearch(""); setStudentFilter("active"); }}>Limpiar filtros</button></div> : null}
          {!loadingStudents && filteredStudents.length ? <div className="roster-table-scroll"><table className="roster-table"><thead><tr><th scope="col">Orden</th><th scope="col">Estudiante</th><th scope="col">Código</th><th scope="col">Documento</th><th scope="col">Estado</th><th scope="col"><span className="sr-only">Acciones</span></th></tr></thead><tbody>{filteredStudents.map((student) => { const activeStudents = sortedStudents.filter((item) => item.active); const activeIndex = activeStudents.findIndex((item) => item.id === student.id); const canReorder = selectedRoster.active && student.active && studentFilter === "active" && !search && !reordering; return <tr key={student.id}><td data-label="Orden"><div className="roster-order"><button onClick={() => void moveStudent(student.id, -1)} disabled={!canReorder || activeIndex === 0} aria-label={`Subir a ${student.full_name}`} title={!canReorder ? "Muestra solo estudiantes activos y limpia la búsqueda para reordenar" : "Subir"}><ArrowUp /></button><button onClick={() => void moveStudent(student.id, 1)} disabled={!canReorder || activeIndex === activeStudents.length - 1} aria-label={`Bajar a ${student.full_name}`} title={!canReorder ? "Muestra solo estudiantes activos y limpia la búsqueda para reordenar" : "Bajar"}><ArrowDown /></button></div></td><td data-label="Estudiante"><div className="roster-student-name"><span>{student.full_name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span><div><strong>{student.full_name}</strong>{student.notes ? <small>{student.notes}</small> : null}</div></div></td><td data-label="Código">{student.internal_code || "—"}</td><td data-label="Documento">{student.document_number || "—"}</td><td data-label="Estado"><span className={`roster-status ${student.active ? "is-active" : "is-inactive"}`}>{student.active ? "Activo" : "Retirado"}</span></td><td data-label="Acciones"><div className="roster-actions"><button disabled={!selectedRoster.active} onClick={() => setStudentDialog(student)} aria-label={`Editar a ${student.full_name}`}><Pencil /></button>{student.active ? <button disabled={!selectedRoster.active} className="is-danger" onClick={() => setStudentToRemove(student)} aria-label={`Retirar a ${student.full_name}`}><Trash2 /></button> : <button disabled={!selectedRoster.active} className="is-success" onClick={() => void reactivate(student)} aria-label={`Reactivar a ${student.full_name}`}><UserRoundCheck /></button>}</div></td></tr>; })}</tbody></table></div> : null}
        </> : null}
      </section>
    </div> : null}
    {rosterDialog ? <RosterFormDialog roster={rosterDialog === "create" ? null : rosterDialog} onClose={() => setRosterDialog(null)} onSubmit={saveRoster} /> : null}
    {rosterToArchive ? <ConfirmRosterDialog roster={rosterToArchive} onClose={() => setRosterToArchive(null)} onConfirm={confirmArchiveRoster} /> : null}
    {studentDialog ? <StudentFormDialog student={studentDialog === "create" ? null : studentDialog} onClose={() => setStudentDialog(null)} onSubmit={saveStudent} /> : null}
    {studentToRemove ? <ConfirmStudentDialog student={studentToRemove} onClose={() => setStudentToRemove(null)} onConfirm={confirmRemove} /> : null}
    {showImport && selectedRoster ? <RosterImportWizard rosterId={selectedRoster.id} existingStudents={students} onClose={() => setShowImport(false)} onImported={async (count) => { await loadStudents(selectedRoster.id); setToast(`${count} estudiantes importados correctamente.`); }} /> : null}
    {toast ? <div className="toast" role="status"><Check />{toast}</div> : null}
  </main>;
}

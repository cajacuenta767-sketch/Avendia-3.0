import { useEffect, useState } from "react";

import type { StudentSelection } from "../../../components/students/StudentSelector";
import { listStudents } from "../../rosters/rosterApi";
import type { Student } from "../../rosters/rosterTypes";

export function useSelectedStudentNames(selection: StudentSelection | null) {
  const [result, setResult] = useState<{ rosterId: string; students: Student[]; error: string }>({ rosterId: "", students: [], error: "" });
  const rosterId = selection?.rosterId ?? "";

  useEffect(() => {
    if (!rosterId) return;
    const controller = new AbortController();
    void listStudents(rosterId, { signal: controller.signal })
      .then((items) => setResult({ rosterId, students: items, error: "" }))
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setResult({ rosterId, students: [], error: reason instanceof Error ? reason.message : "No se pudieron cargar los nombres del aula." });
      });
    return () => controller.abort();
  }, [rosterId]);

  const students = result.rosterId === rosterId ? result.students : [];
  const loading = Boolean(rosterId && result.rosterId !== rosterId);
  const error = result.rosterId === rosterId ? result.error : "";

  const selectedIds = new Set(selection?.studentIds ?? []);
  const selected = students.filter((student) => selectedIds.has(student.id));

  return { students: selected, allStudents: students, loading, error };
}

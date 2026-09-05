import { apiBlob, apiRequest, downloadApiBlob } from "../../lib/api";
import type {
  ConfirmImportPayload,
  ImportResult,
  PaginatedResponse,
  Roster,
  RosterImportPreview,
  RosterImportRow,
  RosterPayload,
  RosterUpdatePayload,
  Student,
  StudentPayload,
} from "./rosterTypes";

function asItems<Item>(response: Item[] | PaginatedResponse<Item>): Item[] {
  return Array.isArray(response) ? response : response.items;
}

async function fetchAllPages<Item>(
  path: (offset: number) => string,
  options: { signal?: AbortSignal } = {},
): Promise<Item[]> {
  const items: Item[] = [];
  let offset = 0;
  while (true) {
    const response = await apiRequest<Item[] | PaginatedResponse<Item>>(path(offset), {
      signal: options.signal,
    });
    const pageItems = asItems(response);
    items.push(...pageItems);
    if (Array.isArray(response) || items.length >= response.total || pageItems.length === 0) break;
    offset += response.limit ?? pageItems.length;
  }
  return items;
}

async function listRostersByStatus(active: boolean, signal?: AbortSignal): Promise<Roster[]> {
  return fetchAllPages<Roster>(
    (offset) => `/rosters?active=${active}&limit=200&offset=${offset}`,
    { signal },
  );
}

export async function listRosters(options: { signal?: AbortSignal; includeInactive?: boolean } = {}): Promise<Roster[]> {
  const rosters = options.includeInactive
    ? (await Promise.all([listRostersByStatus(true, options.signal), listRostersByStatus(false, options.signal)])).flat()
    : await listRostersByStatus(true, options.signal);
  return rosters.sort((left, right) => right.school_year - left.school_year || rosterLabel(left).localeCompare(rosterLabel(right), "es"));
}

function rosterLabel(roster: Roster): string {
  return roster.name || `${roster.grade} ${roster.section}`;
}

export async function createRoster(payload: RosterPayload): Promise<Roster> {
  return apiRequest<Roster>("/rosters", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateRoster(rosterId: string, payload: RosterUpdatePayload): Promise<Roster> {
  return apiRequest<Roster>(`/rosters/${rosterId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function archiveRoster(rosterId: string): Promise<void> {
  return apiRequest<void>(`/rosters/${rosterId}`, {
    method: "DELETE",
  });
}

async function listStudentsByStatus(rosterId: string, active: boolean, signal?: AbortSignal): Promise<Student[]> {
  return fetchAllPages<Student>(
    (offset) => `/rosters/${rosterId}/students?active=${active}&limit=5000&offset=${offset}`,
    { signal },
  );
}

export async function listStudents(
  rosterId: string,
  options: { includeInactive?: boolean; signal?: AbortSignal } = {},
): Promise<Student[]> {
  const students = options.includeInactive
    ? (await Promise.all([
      listStudentsByStatus(rosterId, true, options.signal),
      listStudentsByStatus(rosterId, false, options.signal),
    ])).flat()
    : await listStudentsByStatus(rosterId, true, options.signal);
  return students.sort((left, right) => left.sort_order - right.sort_order);
}

export async function createStudent(rosterId: string, payload: StudentPayload): Promise<Student> {
  return apiRequest<Student>(`/rosters/${rosterId}/students`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateStudent(rosterId: string, studentId: string, payload: Partial<StudentPayload>): Promise<Student> {
  return apiRequest<Student>(`/rosters/${rosterId}/students/${studentId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function removeStudent(rosterId: string, studentId: string): Promise<void> {
  return apiRequest<void>(`/rosters/${rosterId}/students/${studentId}`, {
    method: "DELETE",
  });
}

export async function reorderStudents(rosterId: string, studentIds: string[]): Promise<Student[]> {
  const response = await apiRequest<Student[] | PaginatedResponse<Student>>(`/rosters/${rosterId}/students/reorder`, {
    method: "POST",
    body: JSON.stringify({ student_ids: studentIds }),
  });
  return [...asItems(response)].sort((left, right) => left.sort_order - right.sort_order);
}

function normalizePreview(raw: RosterImportPreview & { rows?: Array<RosterImportRow | Record<string, unknown>> }): RosterImportPreview {
  const rows = (raw.rows ?? []).map((row, index) => {
    if ("values" in row && row.values && typeof row.values === "object") {
      return row as RosterImportRow;
    }
    return {
      row_number: index + 2,
      values: Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value == null ? "" : String(value)])),
    };
  });
  return {
    preview_token: raw.preview_token,
    columns: raw.columns ?? Object.keys(rows[0]?.values ?? {}),
    rows,
    suggested_mapping: raw.suggested_mapping ?? {},
    warnings: raw.warnings ?? [],
    total_rows: raw.total_rows ?? rows.length,
  };
}

export async function previewRosterImport(rosterId: string, file: File): Promise<RosterImportPreview> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await apiRequest<RosterImportPreview>(`/rosters/${rosterId}/imports/preview`, {
    method: "POST",
    body: formData,
  });
  return normalizePreview(response);
}

export async function confirmRosterImport(rosterId: string, payload: ConfirmImportPayload): Promise<ImportResult> {
  return apiRequest<ImportResult>(`/rosters/${rosterId}/imports/confirm`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function downloadRosterTemplate(): Promise<void> {
  const file = await apiBlob("/rosters/template");
  downloadApiBlob(file);
}

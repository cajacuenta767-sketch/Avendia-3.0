import { apiRequest } from "../../../lib/api";
import type {
  EvaluationDraftPayload,
  EvaluationInstrument,
  EvaluationInstrumentKind,
  EvaluationInstrumentList,
  EvaluationSourceDocument,
} from "./evaluationContracts";

function authHeaders(): HeadersInit {
  const token = sessionStorage.getItem("avendia.accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function asItems(response: EvaluationInstrument[] | EvaluationInstrumentList): EvaluationInstrument[] {
  return Array.isArray(response) ? response : response.items;
}

/** Creates an owned draft before files or compound records are attached. */
export function createEvaluationInstrument(payload: EvaluationDraftPayload): Promise<EvaluationInstrument> {
  return apiRequest<EvaluationInstrument>("/evaluation-instruments", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

/** Loads the complete transactional draft, including participants and observations. */
export function getEvaluationDraft(instrumentId: string, signal?: AbortSignal): Promise<EvaluationInstrument> {
  return apiRequest<EvaluationInstrument>(`/evaluation-instruments/${instrumentId}/draft`, {
    headers: authHeaders(),
    signal,
  });
}

/** Atomically replaces the draft and checks `expected_revision` when supplied. */
export function saveEvaluationDraft(
  instrumentId: string,
  payload: EvaluationDraftPayload,
): Promise<EvaluationInstrument> {
  return apiRequest<EvaluationInstrument>(`/evaluation-instruments/${instrumentId}/draft`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
}

export async function listEvaluationInstruments(
  kind?: EvaluationInstrumentKind,
  options: { signal?: AbortSignal; rosterId?: string; includeArchived?: boolean; search?: string } = {},
): Promise<EvaluationInstrument[]> {
  const query = new URLSearchParams({ limit: "100", offset: "0" });
  if (kind) query.set("kind", kind);
  if (options.rosterId) query.set("roster_id", options.rosterId);
  if (options.includeArchived) query.set("include_archived", "true");
  if (options.search?.trim()) query.set("search", options.search.trim());
  const response = await apiRequest<EvaluationInstrument[] | EvaluationInstrumentList>(
    `/evaluation-instruments?${query.toString()}`,
    { headers: authHeaders(), signal: options.signal },
  );
  return asItems(response);
}

/** Archives instead of permanently deleting an instrument so it can be restored from Historial. */
export function archiveEvaluationInstrument(instrumentId: string): Promise<void> {
  return apiRequest<void>(`/evaluation-instruments/${instrumentId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

export function restoreEvaluationInstrument(instrumentId: string): Promise<EvaluationInstrument> {
  return apiRequest<EvaluationInstrument>(`/evaluation-instruments/${instrumentId}/restore`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export function uploadEvaluationSource(
  instrumentId: string,
  file: File,
  signal?: AbortSignal,
): Promise<EvaluationSourceDocument> {
  const body = new FormData();
  body.append("file", file);
  return apiRequest<EvaluationSourceDocument>(`/evaluation-instruments/${instrumentId}/sources`, {
    method: "POST",
    headers: authHeaders(),
    body,
    signal,
  });
}

export function listEvaluationSources(
  instrumentId: string,
  signal?: AbortSignal,
): Promise<EvaluationSourceDocument[]> {
  return apiRequest<EvaluationSourceDocument[]>(`/evaluation-instruments/${instrumentId}/sources`, {
    headers: authHeaders(),
    signal,
  });
}

export function deleteEvaluationSource(instrumentId: string, sourceId: string): Promise<void> {
  return apiRequest<void>(`/evaluation-instruments/${instrumentId}/sources/${sourceId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}

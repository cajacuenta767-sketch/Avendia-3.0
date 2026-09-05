import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { errorText, utilityApi, utilityKey, type Page } from "./api";

export function NotificationFeed({ close }: { close: () => void }) {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const client = useQueryClient();
  const query = useQuery({ queryKey: utilityKey("notifications", page), queryFn: ({ signal }) => utilityApi<Page<{ id: string; message: string; path: string; is_read: boolean }> & { unread: number }>(`/notifications?page=${page}`, "GET", undefined, signal) });
  const mutation = useMutation({ mutationFn: () => utilityApi("/notifications/read", "PUT"), onSuccess: () => client.invalidateQueries({ queryKey: utilityKey("notifications") }) });
  return <div>{query.isPending ? <p>Cargando avisos de tu cuenta…</p> : query.isError ? <p role="alert">{errorText(query.error)}</p> : <><p>{query.data.unread} avisos sin leer</p>{query.data.items.map(n => <button key={n.id} onClick={() => { close(); navigate(n.path); }}>{n.is_read ? "" : "● "}{n.message}</button>)}{query.data.unread ? <button disabled={mutation.isPending} onClick={() => mutation.mutate()}>Marcar todos como leídos</button> : null}<button disabled={page === 1} onClick={() => setPage(p => p-1)}>Anteriores</button><button disabled={page*20 >= query.data.total} onClick={() => setPage(p => p+1)}>Más avisos</button></>}{mutation.isError ? <p role="alert">{errorText(mutation.error)}</p> : null}</div>;
}

import { useEffect, useState } from "react";

import { tools } from "../../config/tools";
import { apiRequest } from "../../lib/api";

export type DashboardRecentDocument = {
  id: string;
  title: string;
  status: string;
  path: string;
  updatedAt: string;
  updatedLabel: string;
};

export type DashboardNotification = {
  id: string;
  message: string;
  path: string;
};

export type DashboardActivity = {
  documentCount: number;
  recentDocuments: DashboardRecentDocument[];
  mostUsedToolIds: string[];
  notifications: DashboardNotification[];
};

type StoredDocument = {
  id: string;
  title: string;
  document_type: string;
  status: string;
  metadata_json: Record<string, unknown>;
  updated_at: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  event_date: string;
  completed: boolean;
};

const EMPTY_ACTIVITY: DashboardActivity = {
  documentCount: 0,
  recentDocuments: [],
  mostUsedToolIds: [],
  notifications: [],
};

let cachedActivity: { token: string; expiresAt: number; value: DashboardActivity } | null = null;
let activityRequest: Promise<DashboardActivity> | null = null;

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatRelativeDate(value: string) {
  const timestamp = new Date(value).getTime();
  const differenceMinutes = Math.max(0, Math.round((Date.now() - timestamp) / 60_000));
  if (differenceMinutes < 1) return "Actualizado ahora";
  if (differenceMinutes < 60) return `Actualizado hace ${differenceMinutes} min`;
  const hours = Math.round(differenceMinutes / 60);
  if (hours < 24) return `Actualizado hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days <= 7) return `Actualizado hace ${days} ${days === 1 ? "día" : "días"}`;
  return `Actualizado el ${new Date(value).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}`;
}

function sourceRoute(document: StoredDocument) {
  const route = document.metadata_json.source_route;
  if (typeof route === "string" && route.startsWith("/dashboard/")) return route;
  return tools.find((tool) => tool.id === document.document_type)?.path ?? "/dashboard/historial";
}

function documentToolId(document: StoredDocument) {
  const route = sourceRoute(document);
  return tools.find((tool) => tool.path === route)?.id
    ?? tools.find((tool) => tool.id === document.document_type)?.id
    ?? "";
}

function deriveActivity(documents: StoredDocument[], events: CalendarEvent[]): DashboardActivity {
  const orderedDocuments = [...documents].sort((left, right) =>
    new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime());
  const usage = new Map<string, number>();
  orderedDocuments.forEach((document) => {
    const toolId = documentToolId(document);
    if (toolId) usage.set(toolId, (usage.get(toolId) ?? 0) + 1);
  });

  const upcomingEvents = events
    .filter((event) => !event.completed && event.event_date >= dateOnly(new Date()))
    .sort((left, right) => left.event_date.localeCompare(right.event_date));
  const notifications: DashboardNotification[] = upcomingEvents.slice(0, 2).map((event) => ({
    id: `event-${event.id}`,
    message: `${event.title} · ${new Date(`${event.event_date}T12:00:00`).toLocaleDateString("es-PE", { day: "2-digit", month: "short" })}`,
    path: `/dashboard/calendario?month=${Number(event.event_date.slice(5, 7)) - 1}&year=${event.event_date.slice(0, 4)}`,
  }));

  if (!orderedDocuments.length) {
    notifications.push({
      id: "first-document",
      message: "Crea tu primer documento para iniciar tu historial docente.",
      path: "/dashboard",
    });
  } else {
    notifications.push({
      id: `document-${orderedDocuments[0].id}`,
      message: `Continúa: ${orderedDocuments[0].title}`,
      path: `${sourceRoute(orderedDocuments[0])}?document=${orderedDocuments[0].id}`,
    });
  }

  return {
    documentCount: orderedDocuments.length,
    recentDocuments: orderedDocuments.slice(0, 5).map((document) => ({
      id: document.id,
      title: document.title,
      status: document.status,
      path: sourceRoute(document),
      updatedAt: document.updated_at,
      updatedLabel: formatRelativeDate(document.updated_at),
    })),
    mostUsedToolIds: [...usage.entries()]
      .sort((left, right) => right[1] - left[1])
      .slice(0, 8)
      .map(([toolId]) => toolId),
    notifications: notifications.slice(0, 3),
  };
}

export function invalidateDashboardActivity() {
  cachedActivity = null;
  activityRequest = null;
}

export async function loadDashboardActivity(force = false): Promise<DashboardActivity> {
  const token = sessionStorage.getItem("avendia.accessToken");
  if (!token) return EMPTY_ACTIVITY;
  if (!force && cachedActivity?.token === token && cachedActivity.expiresAt > Date.now()) {
    return cachedActivity.value;
  }
  if (!force && activityRequest) return activityRequest;

  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + 45);
  activityRequest = Promise.all([
    apiRequest<StoredDocument[]>("/documents", { headers: { Authorization: `Bearer ${token}` } }),
    apiRequest<CalendarEvent[]>(`/calendar/events?start=${dateOnly(start)}&end=${dateOnly(end)}`, { headers: { Authorization: `Bearer ${token}` } }),
  ]).then(([documents, events]) => {
    const value = deriveActivity(documents, events);
    cachedActivity = { token, expiresAt: Date.now() + 15_000, value };
    return value;
  }).finally(() => {
    activityRequest = null;
  });
  return activityRequest;
}

export function useDashboardActivity() {
  const [activity, setActivity] = useState<DashboardActivity>(EMPTY_ACTIVITY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    void loadDashboardActivity()
      .then((value) => { if (mounted) setActivity(value); })
      .catch(() => { if (mounted) setActivity(EMPTY_ACTIVITY); })
      .finally(() => { if (mounted) setLoading(false); });
    const onActivityUpdated = () => {
      invalidateDashboardActivity();
      setLoading(true);
      void loadDashboardActivity(true)
        .then((value) => { if (mounted) setActivity(value); })
        .catch(() => { if (mounted) setActivity(EMPTY_ACTIVITY); })
        .finally(() => { if (mounted) setLoading(false); });
    };
    window.addEventListener("avendia-activity-updated", onActivityUpdated);
    return () => {
      mounted = false;
      window.removeEventListener("avendia-activity-updated", onActivityUpdated);
    };
  }, []);

  return { activity, loading };
}

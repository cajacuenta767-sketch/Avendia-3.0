import { useEffect, useState } from "react";

import { apiRequest } from "../../lib/api";
import { readAccessToken } from "../../lib/session";

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

type DashboardOverviewResponse = {
  document_count: number;
  recent_documents: Array<{
  id: string;
  title: string;
  status: string;
  path: string;
  updated_at: string;
  }>;
  most_used_tool_ids: string[];
  notifications: Array<{ id: string; message: string; path: string }>;
};

const EMPTY_ACTIVITY: DashboardActivity = {
  documentCount: 0,
  recentDocuments: [],
  mostUsedToolIds: [],
  notifications: [],
};

let cachedActivity: { token: string; expiresAt: number; value: DashboardActivity } | null = null;
let activityRequest: Promise<DashboardActivity> | null = null;

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

function mapOverview(response: DashboardOverviewResponse): DashboardActivity {
  return {
    documentCount: response.document_count,
    recentDocuments: response.recent_documents.map((document) => ({
      id: document.id,
      title: document.title,
      status: document.status,
      path: document.path,
      updatedAt: document.updated_at,
      updatedLabel: formatRelativeDate(document.updated_at),
    })),
    mostUsedToolIds: response.most_used_tool_ids,
    notifications: response.notifications,
  };
}

export function invalidateDashboardActivity() {
  cachedActivity = null;
  activityRequest = null;
}

export async function loadDashboardActivity(force = false): Promise<DashboardActivity> {
  const token = readAccessToken();
  if (!token) return EMPTY_ACTIVITY;
  if (!force && cachedActivity?.token === token && cachedActivity.expiresAt > Date.now()) {
    return cachedActivity.value;
  }
  if (!force && activityRequest) return activityRequest;

  activityRequest = apiRequest<DashboardOverviewResponse>("/dashboard/overview").then((response) => {
    const value = mapOverview(response);
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

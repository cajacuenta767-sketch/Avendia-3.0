import { useQuery } from "@tanstack/react-query";

import { utilityApi, utilityKey } from "./api";

export type UtilitySummary = {
  tutorials: { published: number; completed: number };
  history: { documents: number };
  templates: { total: number };
  ideas: { mine: number; votes: number };
  referrals: { total: number; credited: number };
  community: { posts: number; saved: number };
};

export function useUtilitySummary() {
  return useQuery({
    queryKey: utilityKey("summary"),
    queryFn: ({ signal }) => utilityApi<UtilitySummary>("/utilities/summary", "GET", undefined, signal),
    staleTime: 30_000,
  });
}

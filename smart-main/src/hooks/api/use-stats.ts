import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Stats } from "@/types/api";

async function fetchStats() {
  const { data } = await api.get<Stats>("/api/stats");
  return data;
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 5_000,
  });
}


import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Log } from "@/types/api";

async function fetchLogs() {
  try {
    const { data } = await api.get<{ items: Log[] }>("/logs");
    return data.items || [];
  } catch (err: any) {
    // If unauthorized or forbidden, return empty list for dev mode
    if (err.response?.status === 401 || err.response?.status === 403) {
      return [];
    }
    throw err;
  }
}

export function useLogs() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ssc_token') : null;

  return useQuery({
    queryKey: ["logs"],
    queryFn: fetchLogs,
    enabled: !!token,
    retry: false,
  });
}

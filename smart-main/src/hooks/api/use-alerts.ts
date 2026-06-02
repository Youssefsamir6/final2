import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Alert } from "@/types/api";

async function fetchAlerts() {
  try {
    const { data } = await api.get<{ items: Alert[] }>("/alerts");
    return data.items || [];
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      return [];
    }
    throw err;
  }
}

export function useAlerts() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ssc_token') : null;

  return useQuery({
    queryKey: ["alerts"],
    queryFn: fetchAlerts,
    enabled: !!token,
    retry: false,
  });
}


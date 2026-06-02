import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { HoneypotAlert } from "@/types/honeypot";

async function fetchHoneypotAlerts() {
  try {
    const { data } = await api.get<{ items: HoneypotAlert[] }>("/honeypot");
    return data.items || [];
  } catch (err: any) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      return [];
    }
    throw err;
  }
}

export function useHoneypot() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ssc_token') : null;

  return useQuery({
    queryKey: ["honeypot"],
    queryFn: fetchHoneypotAlerts,
    enabled: !!token,
    retry: false,
  });
}

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Camera } from "@/types/api";

async function fetchCameras() {
  const { data } = await api.get<{ items: Camera[] }>("/api/cameras");
  return data.items;
}

export function useCameras() {
  return useQuery({
    queryKey: ["cameras"],
    queryFn: fetchCameras,
    refetchInterval: 6_000,
  });
}


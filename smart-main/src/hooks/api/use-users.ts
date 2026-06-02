import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User } from "@/types/api";

async function fetchUsers() {
  const { data } = await api.get<{ items: User[] }>("/api/users");
  return data.items;
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    staleTime: 20_000,
  });
}


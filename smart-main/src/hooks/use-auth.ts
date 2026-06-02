"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { isAuthedClient, getUserRole, loginClient, logoutClient } from "@/lib/auth";

export function useAuth() {
  const [isAuthed, setIsAuthed] = React.useState(isAuthedClient());
  const [userRole, setUserRole] = React.useState<string | null>(getUserRole());
  const router = useRouter();

  React.useEffect(() => {
    setIsAuthed(isAuthedClient());
    setUserRole(getUserRole());

    const onStorage = () => {
      setIsAuthed(isAuthedClient());
      setUserRole(getUserRole());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    console.log('useAuth.login triggered:', email);
    await loginClient(email, password);
    setIsAuthed(true);
    setUserRole(getUserRole());
  }, []);

  const logout = React.useCallback(() => {
    logoutClient();
    setIsAuthed(false);
    setUserRole(null);
    router.push('/login');
  }, [router]);

  return { isAuthed, userRole, login, logout };
}

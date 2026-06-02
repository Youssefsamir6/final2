"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/brand/logo";
import LandingPage from "./(public)/page";

export default function HomePage() {
  const { isAuthed } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthed) {
      router.replace("/dashboard");
    }
  }, [isAuthed, router]);

  if (isAuthed) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Logo className="animate-ping [animation-duration:2s] scale-110 drop-shadow-2xl" />
      </div>
    );
  }

  return <LandingPage />;
}

"use client";

import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { useAuth } from "@/hooks/use-auth";

export function PublicFooter() {
  const { isAuthed } = useAuth();

  return (
    <footer className="border-t border-border/60 bg-background/40 backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            Futuristic security operations for modern campuses.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6 md:col-span-2 md:grid-cols-3">
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium text-foreground">Product</div>
            <Link className="text-sm text-muted-foreground hover:text-foreground" href="/about">
              About
            </Link>
            <Link className="text-sm text-muted-foreground hover:text-foreground" href="/contact">
              Contact
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium text-foreground">Dashboard</div>
            {isAuthed ? (
              <Link className="text-sm text-muted-foreground hover:text-foreground" href="/dashboard">
                Admin Dashboard
              </Link>
            ) : (
              <Link className="text-sm text-muted-foreground hover:text-foreground" href="/login">
                Login
              </Link>
            )}
            <Link
              className="text-sm text-muted-foreground hover:text-foreground"
              href="/dashboard"
            >
              Home
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-sm font-medium text-foreground">Legal</div>
            <div className="text-sm text-muted-foreground">© {new Date().getFullYear()}</div>
          </div>
        </div>
      </div>
    </footer>
  );
}


"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function PublicNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthed, logout } = useAuth();

  return (
    <div className="sticky top-0 z-40 border-b border-border/60 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm transition-colors hover:bg-white/5",
                    active ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {isAuthed ? (
            <>
              <Link href="/dashboard">
                <Button className="neon-ring bg-primary text-primary-foreground hover:bg-primary/90">
                  Admin Dashboard
                </Button>
              </Link>
              <Button
                variant="secondary"
                className="bg-white/5 text-foreground hover:bg-white/10"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
              >
                Logout
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button className="neon-ring bg-primary text-primary-foreground hover:bg-primary/90">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}


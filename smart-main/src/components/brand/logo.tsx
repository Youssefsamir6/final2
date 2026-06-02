import * as React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group inline-flex items-center gap-2 font-semibold tracking-tight",
        className,
      )}
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/25 shadow-[0_0_24px_theme(colors.primary/0.15)]">
        <Shield className="h-[18px] w-[18px] text-primary" />
      </span>
      <span className="text-sm leading-none">
        <span className="block text-foreground">Smart Secure</span>
        <span className="block text-muted-foreground">Campus</span>
      </span>
    </Link>
  );
}


"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { dashboardNav } from "@/components/dashboard/nav-items";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  const pathname = usePathname();
  const [width, setWidth] = React.useState(280);
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const saved = window.localStorage.getItem("ssc_sidebar_width");
    if (!saved) return;
    const parsed = Number(saved);
    if (Number.isFinite(parsed)) {
      setWidth(Math.max(240, Math.min(420, parsed)));
    }
  }, []);

  React.useEffect(() => {
    const initial: Record<string, boolean> = {};
    dashboardNav.forEach((item) => {
      if (item.children?.length) {
        initial[item.href] = pathname.startsWith(item.href);
      }
    });
    setExpanded((prev) => ({ ...initial, ...prev }));
  }, [pathname]);

  const startResize = React.useCallback((startX: number, startW: number) => {
    let latest = startW;
    const onMove = (ev: PointerEvent) => {
      const next = Math.max(240, Math.min(420, startW + (ev.clientX - startX)));
      latest = next;
      setWidth(next);
    };
    const onUp = () => {
      window.localStorage.setItem("ssc_sidebar_width", String(latest));
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }, []);

  return (
    <aside
      style={{ width }}
      className="relative hidden shrink-0 border-r border-border/60 bg-background/40 backdrop-blur-xl md:block"
    >
      <div className="flex h-16 items-center px-4">
        <Logo href="/dashboard" />
      </div>
      <div className="px-3 pb-6">
        <Separator className="mb-4 bg-border/60" />
        <nav className="grid gap-1">
          {dashboardNav.map((item) => {
            const active =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <div key={item.href} className="grid gap-1">
                <div
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-white/[0.06] text-foreground ring-1 ring-primary/20 shadow-[0_0_28px_theme(colors.primary/0.08)]"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Link href={item.href} className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      className={cn(
                        "grid h-9 w-9 place-items-center rounded-xl border border-border/60 bg-white/5",
                        active && "border-primary/30 bg-primary/10",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-[18px] w-[18px]",
                          active ? "text-primary" : "text-foreground",
                        )}
                      />
                    </span>
                    <span className="truncate font-medium">{item.label}</span>
                  </Link>
                  {item.children?.length ? (
                    <button
                      type="button"
                      aria-label={`Toggle ${item.label}`}
                      onClick={() =>
                        setExpanded((prev) => ({ ...prev, [item.href]: !prev[item.href] }))
                      }
                      className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                    >
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expanded[item.href] ? "rotate-0" : "-rotate-90",
                        )}
                      />
                    </button>
                  ) : null}
                </div>

                {item.children?.length && expanded[item.href] ? (
                  <div className="ml-12 grid gap-1">
                    {item.children.map((child) => {
                      const childActive = pathname === child.href || pathname.startsWith(`${child.href}/`);
                      const ChildIcon = child.icon;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-colors",
                            childActive
                              ? "bg-white/[0.06] text-foreground ring-1 ring-primary/20"
                              : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                          )}
                        >
                          <ChildIcon className={cn("h-3.5 w-3.5", childActive ? "text-primary" : "text-foreground")} />
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
        <div className="mt-6 rounded-2xl border border-border/60 bg-white/[0.04] p-4">
          <div className="text-xs text-muted-foreground">System</div>
          <div className="mt-2 text-sm font-medium">Smart Secure Campus</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Futuristic monitoring and alert triage.
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-label="Resize sidebar"
        className="absolute right-0 top-0 h-full w-2 cursor-col-resize bg-transparent hover:bg-primary/20"
        onPointerDown={(e) => startResize(e.clientX, width)}
      />
    </aside>
  );
}


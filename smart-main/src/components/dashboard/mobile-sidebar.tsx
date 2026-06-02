"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { dashboardNav } from "@/components/dashboard/nav-items";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";

export function MobileSidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  React.useEffect(() => {
    const initial: Record<string, boolean> = {};
    dashboardNav.forEach((item) => {
      if (item.children?.length) {
        initial[item.href] = pathname.startsWith(item.href);
      }
    });
    setExpanded((prev) => ({ ...initial, ...prev }));
  }, [pathname]);

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/5 hover:bg-white/10 md:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </Button>
        }
      />
      <SheetContent side="left" className="w-[320px] border-border/60 bg-background/70 p-0">
        <div className="flex h-16 items-center justify-between px-4">
          <SheetHeader>
            <SheetTitle>
              <Logo href="/dashboard" />
            </SheetTitle>
          </SheetHeader>
        </div>
        <div className="px-3 pb-6">
          <nav className="grid gap-1">
            {dashboardNav.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <div key={item.href} className="grid gap-1">
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-white/[0.06] text-foreground ring-1 ring-primary/20"
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
        </div>
      </SheetContent>
    </Sheet>
  );
}


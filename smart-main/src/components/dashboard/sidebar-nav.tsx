"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, AlertCircle, BarChart3, Shield, Users, Siren } from "lucide-react";
import { SheetClose } from "@/components/ui/sheet";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Activity },
  { href: "/dashboard/logs", label: "Live Logs", icon: Shield },
  { href: "/dashboard/alerts", label: "Alerts", icon: AlertCircle },
{ href: "/dashboard/honeypot", label: "Honeypot Alerts", icon: Siren },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
];

interface SidebarNavProps {
  isMobile?: boolean;
}

export function SidebarNav({ isMobile = false }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col space-y-2 p-4 lg:px-3">
      {navItems.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href;
        const ItemTag = isMobile ? SheetClose : "div";
        return (
          <ItemTag key={href}>
            <Link
              href={href}
              className={`group flex w-full items-center rounded-md border p-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground lg:px-3 lg:py-2 ${
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent"
              }`}
            >
              <Icon className="mr-3 h-5 w-5" aria-hidden="true" />
              <span>{label}</span>
            </Link>
          </ItemTag>
        );
      })}
    </nav>
  );
}

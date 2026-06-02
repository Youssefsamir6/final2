import type * as React from "react";
import {
  Activity,
  Archive,
  CircleAlert,
  Bell,
  Camera,
  LayoutDashboard,
  Settings,
Shield,
  ShieldAlert,
  Users,
  Siren,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: ReadonlyArray<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
};

export const dashboardNav: ReadonlyArray<DashboardNavItem> = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/monitoring", label: "Live Monitoring", icon: Camera },
  { href: "/dashboard/alerts", label: "Alerts", icon: Bell },
  { href: "/dashboard/honeypot", label: "Honeypot Alerts", icon: Siren },
  {
    href: "/dashboard/saved-footage",
    label: "Saved Footage",
    icon: Archive,
    children: [
      { href: "/dashboard/saved-footage/alerts", label: "Footage Alerts", icon: CircleAlert },
      {
        href: "/dashboard/saved-footage/critical-moments",
        label: "Critical Moments",
        icon: ShieldAlert,
      },
    ],
  },
  { href: "/dashboard/users", label: "User Management", icon: Users },
  { href: "/dashboard/reports", label: "Reports", icon: Activity },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export const systemBadges = [
  { label: "Secure Mode", icon: Shield },
] as const;


"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, AlertCircle, BarChart3, Shield, Users, ChevronLeft, ChevronRight, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SheetClose } from "@/components/ui/sheet";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Activity },
  { href: "/dashboard/live-monitoring", label: "Live Monitoring", icon: Shield },
  { href: "/dashboard/logs", label: "Live Logs", icon: Shield },
  { href: "/dashboard/alerts", label: "Alerts", icon: AlertCircle },
  { href: "/dashboard/honeypot", label: "Honeypot Alerts", icon: Siren },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/blacklist", label: "Blacklist", icon: AlertCircle },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: ChevronRight },
];

interface CollapsibleSidebarProps {
  isMobile?: boolean;
}

export function CollapsibleSidebar({ isMobile = false }: CollapsibleSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Persist collapse state to localStorage
    localStorage.setItem("sidebar-collapsed", isCollapsed.toString());
  }, [isCollapsed]);

  const isExpanded = !isCollapsed || isHovered || isMobile;

  const ItemTag = isMobile ? SheetClose : "div";

  return (
    <div 
      className={`flex h-full flex-col border-r bg-card transition-all duration-300 lg:w-[72px] lg:hover:w-72 ${
        isExpanded && !isMobile ? "w-72" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Toggle button */}
      {!isMobile && (
        <Button
          variant="ghost"
          size="sm"
          className="h-9 px-3 lg:px-0"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      )}
      
      {/* Nav items */}
      <nav className={`flex flex-1 flex-col p-2 lg:pt-4 ${isCollapsed && !isMobile ? "pt-4" : ""}`}>
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <ItemTag key={href}>
              <Link
                href={href}
                className={`group flex w-full items-center rounded-md border p-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground lg:px-3 lg:py-2 ${
                  isActive
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-transparent"
                } ${isCollapsed && !isMobile ? "justify-center p-2" : ""}`}
              >
                <Icon className={`mr-${isExpanded ? "3" : "0"} h-5 w-5 shrink-0 ${isCollapsed && !isMobile ? "mr-0" : ""}`} aria-hidden="true" />
                {isExpanded && (
                  <span className={`overflow-hidden whitespace-nowrap transition-all ${isCollapsed ? "w-0" : "w-full"}`}>
                    {label}
                  </span>
                )}
              </Link>
            </ItemTag>
          );
        })}
      </nav>
    </div>
  );
}

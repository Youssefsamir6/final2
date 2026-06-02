 "use client";

import { useState } from "react";
import { Bell, Shield, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useSocket } from "@/context/SocketProvider";
import { SoundAlert } from "@/components/dashboard/SoundAlert";

export function Topbar() {
  const { logout, isAuthed } = useAuth();
  const { unreadNotifications, isConnected } = useSocket();

  if (!isAuthed) return null;

  return (
    <div className="flex h-14 items-center gap-4 border-b bg-card px-6 lg:px-8">
      <div className="flex-1 lg:flex-none lg:w-72">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-primary/15 ring-1 ring-primary/25 shadow-[0_0_16px_theme(colors.primary/0.15)]">
            <Shield className="h-5 w-5 text-primary" />
          </span>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Security Dashboard</h1>
            <Badge variant={isConnected ? "default" : "secondary"} className="-mt-1">
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </Badge>
          </div>
        </div>
      </div>
       <div className="flex items-center gap-2 lg:ml-auto">
         <SoundAlert />
         <Popover>
          <PopoverTrigger>

            <div 
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-md p-0 text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none data-[state=pressed]:bg-accent data-[state=open]:bg-accent"
              role="button" 
              tabIndex={0}>
              <Bell className="h-4 w-4 shrink-0" />
              {unreadNotifications > 0 && (
                <span className="absolute right-0 top-0 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive text-xs font-bold ring-2 ring-background">
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </span>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-2">
              <h4 className="font-semibold">Recent Alerts</h4>
              <div className="text-xs text-muted-foreground">
                {unreadNotifications > 0 ? `${unreadNotifications} unread` : 'No new alerts'}
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="sm" onClick={() => {
            logout();
            window.location.href = '/contact';
          }} className="flex items-center gap-2 h-9 px-3">
          <div className="grid h-7 w-7 place-items-center rounded bg-destructive/15 ring-1 ring-destructive/25 shadow-[0_0_12px_theme(colors.destructive/0.15)]">
            <LogOut className="h-4 w-4 text-destructive" />
          </div>
          <span className="sr-only lg:not-sr-only">Logout</span>
        </Button>
      </div>
    </div>
  );
} 

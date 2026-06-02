"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { CollapsibleSidebar } from "@/components/dashboard/collapsible-sidebar";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";
const Topbar = dynamic(() => import("@/components/dashboard/topbar").then((mod) => mod.Topbar), { 
  ssr: false,
  loading: () => <Skeleton className="h-16 w-full" />
});
import { SocketProvider } from "@/context/SocketProvider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthed } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthed) {
      router.push('/login');
    }
  }, [isAuthed, router]);

  if (!isAuthed) {
    return null;
  }

  return (
    <SocketProvider>
      <div className="flex min-h-screen flex-col bg-background" suppressHydrationWarning>
        <Topbar />
        <div className="flex flex-1 overflow-auto">
          {/* Mobile sidebar */}
          <Sheet>
            <SheetTrigger className="lg:hidden mr-2 h-9 px-0 text-muted-foreground hover:text-foreground lg:hidden data-[state=open]:bg-muted">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="!w-72 p-0">
              <CollapsibleSidebar isMobile />
            </SheetContent>
          </Sheet>
          {/* Desktop collapsible sidebar */}
          <CollapsibleSidebar />

          {/* Main content */}
          <main className="flex-1">
            <Suspense fallback={<MainContentSkeleton />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </SocketProvider>
  );
}

function MainContentSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {Array(4).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  );
}


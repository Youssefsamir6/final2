"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { makeStats } from "@/lib/mock";
import LiveStatusCards from "@/components/dashboard/LiveStatusCards";
import LiveActivityFeed from "@/components/dashboard/LiveActivityFeed";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import PersonRecognition from "@/components/dashboard/PersonRecognition";
import CameraGrid from "@/components/dashboard/CameraGrid";
import { useTheme } from "next-themes";
import { RefreshCw } from "lucide-react";

function StatCard({ title, value, change, description }: {
  title: string;
  value: string | number;
  change?: string;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Skeleton className="h-4 w-4" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && <p className="text-xs text-muted-foreground mt-1">+{change} from yesterday</p>}
        {description && <p className="text-xs text-muted-foreground mt-2">{description}</p>}
      </CardContent>
    </Card>
  );
}

export default function DashboardOverview() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['stats'],
    queryFn: () => Promise.resolve(makeStats()),
    refetchInterval: 10000, // 10s polling
  });

  if (!stats) return null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">Real-time campus security metrics</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <LiveStatusCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Last Hour Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.series}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="accessEvents" stroke="#3b82f6" name="Access Events" />
                  <Line type="monotone" dataKey="alerts" stroke="#ef4444" name="Alerts" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <LiveActivityFeed />
        </div>

        <div className="space-y-4">
          <AlertsPanel />
          <PersonRecognition />
        </div>
      </div>

      <CameraGrid />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Last Hour Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.series}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="accessEvents" stroke="#3b82f6" name="Access Events" />
                <Line type="monotone" dataKey="alerts" stroke="#ef4444" name="Alerts" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Progress value={stats.securityAlerts < 10 ? 78 : stats.securityAlerts < 20 ? 45 : 20} className="h-3" />
              <div className="flex justify-between text-sm">
                <span>Overall System Status</span>
                <span>{stats.systemStatus}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>Network: <span className="font-medium text-green-500">Stable</span></div>
              <div>Cameras: <span className="font-medium text-green-500">{stats.activeCameras} Online</span></div>
              <div>AI Models: <span className="font-medium text-green-500">Nominal</span></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

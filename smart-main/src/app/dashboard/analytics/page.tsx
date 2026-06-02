"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Logo } from "@/components/brand/logo";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { makeStats, makeAlerts, makeUsers } from "@/lib/mock";
import { format } from "date-fns";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AnalyticsPage() {
  const statsQuery = useQuery({
    queryKey: ["analytics"],
    queryFn: () => Promise.resolve(makeStats()),
    refetchInterval: 15000,
  });

  const alertsQuery = useQuery({
    queryKey: ["alerts-analytics"],
    queryFn: () => Promise.resolve(makeAlerts()),
    refetchInterval: 15000,
  });

  const usersQuery = useQuery({
    queryKey: ["users-analytics"],
    queryFn: () => Promise.resolve(makeUsers()),
    refetchInterval: 30000,
  });

  if (statsQuery.isLoading || alertsQuery.isLoading || usersQuery.isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Logo className="animate-ping [animation-duration:2s] scale-110 drop-shadow-2xl" />
      </div>
    );
  }

  const stats = statsQuery.data!;
  const alerts = alertsQuery.data!;
  const users = usersQuery.data!;

  const severityData = [
    { name: 'Active', value: alerts.filter(a => a.severity === 'active').length },
    { name: 'Warning', value: alerts.filter(a => a.severity === 'warning').length },
    { name: 'Critical', value: alerts.filter(a => a.severity === 'critical').length },
  ];

  const roleData = [
    { name: 'Admin', value: users.filter(u => u.role === 'Admin').length },
    { name: 'Operator', value: users.filter(u => u.role === 'Operator').length },
    { name: 'Viewer', value: users.filter(u => u.role === 'Viewer').length },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Security trends and KPIs</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{stats.securityAlerts}</div>
                <div className="text-sm text-muted-foreground">Open Alerts</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.activeCameras}</div>
                <div className="text-sm text-muted-foreground">Active Cameras</div>
              </div>
            </div>
            <div className="text-sm space-y-1">
              <div>System Status: <Badge variant="default">{stats.systemStatus}</Badge></div>
              <div>Last Update: {format(new Date(), "HH:mm:ss")}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roleData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

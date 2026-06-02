"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { makeStats, makeAlerts, makeLogs } from "@/lib/mock";
import { useSocket } from "@/context/SocketProvider";

export default function LiveStatusCards() {
  const { logs: socketLogs, alerts: socketAlerts } = useSocket();

  const stats = React.useMemo(() => makeStats(), []);

  const logs = React.useMemo(() => (socketLogs && socketLogs.length ? socketLogs : makeLogs()), [socketLogs]);
  const alerts = React.useMemo(() => (socketAlerts && socketAlerts.length ? socketAlerts : makeAlerts()), [socketAlerts]);

  const authorizedToday = logs.filter((l: any) => l.status === 'authorized').length;
  const unauthorized = logs.filter((l: any) => l.status !== 'authorized').length;
  const activeGates = Array.from(new Set(logs.map((l: any) => l.location))).length;
  const peopleInside = Math.max(0, Math.round(stats.totalStudents * 0.12));
  const alertsToday = alerts.length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>🟢 Authorized Access Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{authorizedToday}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔴 Unauthorized Attempts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{unauthorized}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🚪 Active Gates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeGates}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>👥 People Inside Campus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{peopleInside.toLocaleString()}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>⚠️ Alerts Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{alertsToday}</div>
            <Badge variant={alertsToday > 8 ? 'destructive' : 'secondary'}>{alertsToday > 8 ? 'High' : 'OK'}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

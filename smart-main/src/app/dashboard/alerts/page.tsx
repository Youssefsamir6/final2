"use client";

import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { useSocket } from "@/context/SocketProvider";
import { useAlerts } from "@/hooks/api/use-alerts";
import { Alert } from "@/types/api";
import { format } from "date-fns";
import { MapPin } from "lucide-react";

const columns = [
  {
    accessorKey: "message || type || title",
    header: "Alert",
    cell: ({ row }: { row: { original: any } }) => (
      <div className="font-medium max-w-md truncate">{row.original.message || row.original.type || row.original.title || 'Alert'}</div>
    ),
  },
  {
    accessorKey: "severity",
    header: "Severity",
    cell: ({ row }: { row: { original: any } }) => {
      const severity = row.original.severity;
      return (
        <Badge variant={severity === "high" || severity === "critical" ? "destructive" : severity === "medium" || severity === "warning" ? "secondary" : "default"}>
          {severity?.toUpperCase()}
        </Badge>
      );
    },
  },
  {
    accessorKey: "gateName || location",
    header: "Location",
    cell: ({ row }: { row: { original: any } }) => (
      <div className="flex items-center">
        <MapPin className="mr-1 h-4 w-4" />
        {row.original.gateName || row.original.location || 'Campus'}
      </div>
    ),
  },
{
    accessorKey: "timestamp",
    header: "Time",
    cell: ({ row }: { row: { original: any } }) => {
      const date = row.original.timestamp || row.original.createdAt;
      if (!date) return '--:--';
      const parsed = new Date(date);
      if (isNaN(parsed.getTime())) return '--:--';
      return format(parsed, "HH:mm");
    },
  },
  {
    accessorKey: "userId",
    header: "User",
  },
];

export default function AlertsPage() {
  const { alerts, isConnected } = useSocket();
  const alertsQuery = useAlerts();

  const error = alertsQuery.error;
  const tableData = alerts.length > 0 ? alerts : (alertsQuery.data || []);
  const isTableLoading = alertsQuery.isLoading;

  return (
    <div className="space-y-4 p-6" suppressHydrationWarning>
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Security Alerts</h1>
        <p className="text-muted-foreground flex flex-wrap items-center gap-2">
          {alerts.length > 0 ? 'Live (Socket)' : 'REST fallback'} {isConnected ? '(Connected)' : '(Disconnected)'} | {alertsQuery.data?.length || 0} total
          {error && (
            <span className="text-destructive text-xs bg-destructive/10 px-2 py-1 rounded-full">
              Error: {error.message}
            </span>
          )}
        </p>
      </div>
      <div suppressHydrationWarning>
        <DataTable
          columns={columns}
          data={tableData}
          isLoading={isTableLoading}
        />
      </div>
    </div>
  );
}

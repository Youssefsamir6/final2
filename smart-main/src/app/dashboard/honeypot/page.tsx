"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHoneypot } from "@/hooks/api/use-honeypot";
import { HoneypotAlert } from "@/types/honeypot";

function getSeverityVariant(severity: string) {
  switch (severity) {
    case "critical":
      return "destructive";
    case "high":
      return "destructive";
    case "medium":
      return "secondary";
    default:
      return "default";
  }
}

function getStatusVariant(status: string) {
  return status === "new" ? "destructive" : "secondary";
}

function AlertCard({ alert }: { alert: HoneypotAlert }) {
  return (
    <Card className="border-l-4 border-l-red-500 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-mono">{alert.ip}</CardTitle>
          <Badge variant={getSeverityVariant(alert.severity)}>
            {alert.severity.toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Attack Type:</span>
            <span className="font-medium">{alert.attack}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Time:</span>
            <span className="font-mono text-xs">{alert.time}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Status:</span>
            <Badge variant={getStatusVariant(alert.status)}>
              {alert.status.toUpperCase()}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HoneypotPage() {
  const { data: alerts, isLoading } = useHoneypot();

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">🚨 Honeypot Alerts</h1>
        <p className="text-muted-foreground">
          Security alerts from honeypot trap systems
        </p>
      </div>
      
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 w-24 rounded bg-muted"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 w-32 rounded bg-muted"></div>
                  <div className="h-3 w-24 rounded bg-muted"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {alerts?.map((alert: HoneypotAlert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </div>
      )}
      
      <div className="text-sm text-muted-foreground">
        Total: {alerts?.length || 0} honeypot alerts
      </div>
    </div>
  );
}

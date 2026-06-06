"use client";

import React from "react";

import { useSocket } from "@/context/SocketProvider";

function Blinking({ children }: { children: React.ReactNode }) {
  return <span className="animate-pulse">{children}</span>;
}

function AlertsPanelComponent() {
  const { alerts: socketAlerts } = useSocket();

  const alerts = React.useMemo(() => {
    if (!socketAlerts || socketAlerts.length === 0) return [];
    return socketAlerts.slice(0, 6);
  }, [socketAlerts]);

  return (
    <div>
      <h3 className="text-lg font-semibold">Alerts</h3>

      <div className="space-y-2 mt-2">
        {alerts.length === 0 ? (
          <div className="p-3 rounded-md border bg-card text-muted-foreground">
            No alerts to display.
          </div>
        ) : (
          alerts.map((a: any) => (
            <div
              key={a.id}
              className={`p-3 rounded-md border ${
                a.severity === "critical"
                  ? "bg-destructive/10 border-destructive"
                  : a.severity === "warning"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-card"
              }`}

            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-medium">{a.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {a.location} • {a.source}
                  </div>
                </div>
                <div className="text-sm">
                  {a.severity === "critical" ? (
                    <Blinking>🚨</Blinking>
                  ) : a.severity === "warning" ? (
                    "⚠️"
                  ) : (
                    "ℹ️"
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default React.memo(AlertsPanelComponent);


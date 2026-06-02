"use client";

import React from "react";
import { useSocket } from "@/context/SocketProvider";
import { makeLogs } from "@/lib/mock";

export default function BlacklistPage() {
  const { logs: socketLogs } = useSocket();
  const logs = React.useMemo(() => (socketLogs && socketLogs.length ? socketLogs : makeLogs()), [socketLogs]);
  const denied = React.useMemo(() => logs.filter((l: any) => l.status !== 'authorized').slice(0, 50), [logs]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Blacklist</h1>

      {denied.length === 0 ? (
        <div className="text-sm text-muted-foreground">No denied entries yet.</div>
      ) : (
        <div className="space-y-2">
          {denied.map((d: any) => (
            <div key={d.id} className="p-3 border rounded-md flex items-center justify-between">
              <div>
                <div className="font-medium">{d.name || 'Unknown'}</div>
                <div className="text-xs text-muted-foreground">{d.studentId || '—'} • {d.location}</div>
              </div>
              <div className="text-sm text-destructive font-semibold">Denied</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

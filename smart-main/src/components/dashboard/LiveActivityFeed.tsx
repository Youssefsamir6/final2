"use client";

import React from "react";
import { makeLogs } from "@/lib/mock";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSocket } from "@/context/SocketProvider";

function LiveActivityFeedComponent() {
  const { logs: socketLogs } = useSocket();
  const logs = React.useMemo(() => (socketLogs && socketLogs.length ? socketLogs.slice(0, 12) : makeLogs().slice(0, 12)), [socketLogs]);

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">Live Activity Feed</h3>
      <div className="max-h-72 overflow-y-auto space-y-2 p-2">
        {logs.map((log: any) => (
          <div key={log.id} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted">
            <Avatar className="h-10 w-10">
              <AvatarImage src={log.photoUrl} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div className="flex-1 text-sm">
              <div className="font-medium">{log.name || 'Unknown'}</div>
              <div className="text-xs text-muted-foreground">{log.location} • {new Date(log.timestamp).toLocaleTimeString()}</div>
            </div>
            <div className={`text-xs font-semibold ${log.status === 'authorized' ? 'text-green-600' : 'text-destructive'}`}>
              {log.status === 'authorized' ? '✅ Authorized' : '❌ Denied'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(LiveActivityFeedComponent);

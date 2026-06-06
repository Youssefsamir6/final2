"use client";

import React from "react";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSocket } from "@/context/SocketProvider";

function PersonRecognitionComponent() {
  const { logs: socketLogs } = useSocket();
  const latest = React.useMemo(() => (socketLogs && socketLogs.length ? socketLogs[0] : null), [socketLogs]);

  if (!latest) {
    return (
      <div className="p-4 border rounded-md bg-card">
        <h3 className="text-lg font-semibold">Person Recognition</h3>
        <div className="text-sm text-muted-foreground mt-2">No live recognition events yet — start the camera device.</div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-md bg-card">
      <h3 className="text-lg font-semibold">Person Recognition</h3>
      <div className="flex items-center gap-4 mt-3">
        <Avatar className="h-20 w-20">
          <AvatarImage src={latest.photoUrl} />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-lg">{latest.name || 'Unknown'}</div>
          <div className="text-sm text-muted-foreground">ID: {latest.studentId || '—'}</div>
          <div className={`mt-2 font-semibold ${latest.status === 'authorized' ? 'text-green-600' : 'text-destructive'}`}>{latest.status.toUpperCase()}</div>
          <div className="text-xs text-muted-foreground mt-1">Last seen: {new Date(latest.timestamp).toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}

export default React.memo(PersonRecognitionComponent);

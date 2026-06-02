"use client";

import React from "react";
import { makeCameras } from "@/lib/mock";

function CameraGridComponent() {
  const cams = React.useMemo(() => makeCameras().slice(0, 8), []);

  return (
    <div>
      <h3 className="text-lg font-semibold">Camera Feeds</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
        {cams.map(c => (
          <div key={c.id} className="rounded-md overflow-hidden border bg-card p-2">
            <div className="h-24 w-full bg-gradient-to-br from-slate-800 to-slate-700 flex items-center justify-center text-sm text-white">{c.name}</div>
            <div className="mt-2 text-xs text-muted-foreground">{c.zone} • {c.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default React.memo(CameraGridComponent);

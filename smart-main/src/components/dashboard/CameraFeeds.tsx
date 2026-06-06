"use client";

import React from "react";
import RTSPPlayer from "@/components/dashboard/RTSPPlayer";
import WebcamAccessCard from "@/components/dashboard/WebcamAccessCard";

type CameraFeed = {
  id: string;
  name: string;
  zone: string;
  status: string;
  /** Browser-playable URL (HLS/MJPEG/Web) or special value: "local" for laptop webcam demo */
  streamUrl?: string;
};

const fallbackCameras: CameraFeed[] = [
  {
    id: "cam-1",
    name: "CAM-001",
    zone: "Gate",
    status: "Online",
    streamUrl: process.env.NEXT_PUBLIC_CAMERA_STREAM_URL_1,
  },
  {
    id: "cam-2",
    name: "CAM-002",
    zone: "Library",
    status: "Online",
    streamUrl: process.env.NEXT_PUBLIC_CAMERA_STREAM_URL_2,
  },
];

function normalizeSeverity(status: string) {
  const s = (status || "").toLowerCase();
  if (s.includes("off")) return "text-destructive";
  if (s.includes("degrad")) return "text-yellow-600";
  return "text-green-600";
}

export default function CameraFeeds() {
  const [feeds] = React.useState<CameraFeed[]>(fallbackCameras);

  const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
  const apiKey = process.env.NEXT_PUBLIC_DEVICE_API_KEY || "dev-key-123";

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Camera Feeds</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feeds.map((c, idx) => (
          <div key={c.id} className="rounded-md border bg-card p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.zone}</div>
              </div>
              <div className={`text-xs font-semibold ${normalizeSeverity(c.status)}`}>{c.status}</div>
            </div>

            <div className="mt-3">
              {c.streamUrl && c.streamUrl.toLowerCase() === "local" ? (
                <WebcamAccessCard
                  deviceId={process.env.NEXT_PUBLIC_WEBCAM_DEVICE_ID || `cam-webcam-${idx + 1}`}
                  gateName={c.zone}
                  apiUrl={apiUrl}
                  apiKey={apiKey}
                />
              ) : c.streamUrl ? (
                <RTSPPlayer src={c.streamUrl} title={c.name} className="h-72" />
              ) : (
                <div className="h-72 flex items-center justify-center text-sm text-muted-foreground border rounded-md">
Set NEXT_PUBLIC_CAMERA_STREAM_URL_1 / _2 to a browser stream URL or {'"local"'}.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}




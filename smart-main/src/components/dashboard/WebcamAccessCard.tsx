"use client";

import React from "react";

import { Button } from "@/components/ui/button";

type AccessState =
  | { kind: "idle" }
  | { kind: "running" }
  | { kind: "authorized"; confidence?: number; message?: string }
  | { kind: "denied"; confidence?: number; message?: string }
  | { kind: "error"; message: string };

export default function WebcamAccessCard({
  deviceId,
  gateName,
  apiUrl,
  apiKey,
}: {
  deviceId: string;
  gateName: string;
  apiUrl: string;
  apiKey: string;
}) {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const [accessState, setAccessState] = React.useState<AccessState>({ kind: "idle" });
  const [streamOn, setStreamOn] = React.useState(false);

  const timerRef = React.useRef<number | null>(null);

  const stopTimer = React.useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopStream = React.useCallback(() => {
    stopTimer();
    setStreamOn(false);

    const v = videoRef.current;
    if (v && v.srcObject) {
      const tracks = (v.srcObject as MediaStream).getTracks();
      tracks.forEach((t) => t.stop());
      v.srcObject = null;
    }
  }, [stopTimer]);

  const captureAndSend = React.useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (!w || !h) return;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85); // base64

    try {
      const res = await fetch(`${apiUrl}/api/ai/device/smart-access`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
        },
        body: JSON.stringify({
          image: dataUrl,
          deviceId,
          gateName,
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Backend error: ${res.status} ${text}`);
      }

      const json = await res.json();

      const decision = json?.data?.decision;
      const status = (decision?.status || "").toLowerCase();
      const confidence = decision?.confidence;

      if (status === "authorized") {
        setAccessState({
          kind: "authorized",
          confidence: typeof confidence === "number" ? confidence : undefined,
          message: decision?.reason,
        });
      } else {
        setAccessState({
          kind: "denied",
          confidence: typeof confidence === "number" ? confidence : undefined,
          message: decision?.reason,
        });
      }
    } catch (e: any) {
      setAccessState({ kind: "error", message: e?.message || String(e) });
    }
  }, [apiKey, apiUrl, deviceId, gateName]);

  const startStream = React.useCallback(async () => {
    setAccessState({ kind: "running" });

    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      const video = videoRef.current;
      if (!video) throw new Error("Video ref not ready");

      video.srcObject = media;
      await video.play();
      setStreamOn(true);

      // Capture every N ms (configurable via env in future if needed)
      stopTimer();

      // ensure webcam is actually delivering frames before first snapshot
      await new Promise((r) => setTimeout(r, 300));

      timerRef.current = window.setInterval(() => {
        captureAndSend();
      }, 2500);
    } catch (e: any) {
      stopStream();
      setAccessState({ kind: "error", message: e?.message || String(e) });
    }
  }, [captureAndSend, stopStream, stopTimer]);

  React.useEffect(() => {
    return () => {
      stopStream();
    };
  }, [stopStream]);

  const badge = React.useMemo(() => {
    if (accessState.kind === "authorized") {
      return { text: "AUTHORIZED", color: "text-green-600" };
    }
    if (accessState.kind === "denied") {
      return { text: "DENIED", color: "text-destructive" };
    }
    if (accessState.kind === "error") {
      return { text: "ERROR", color: "text-destructive" };
    }
    if (accessState.kind === "running") {
      return { text: "RUNNING", color: "text-yellow-600" };
    }
    return { text: "IDLE", color: "text-muted-foreground" };
  }, [accessState.kind]);

  return (
    <div className="rounded-md border bg-card p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Webcam Access</div>
          <div className="text-xs text-muted-foreground">{gateName}</div>
        </div>
        <div className={`text-xs font-semibold ${badge.color}`}>{badge.text}</div>
      </div>

      <div className="mt-3">
        <div className="relative rounded-md overflow-hidden bg-black">
          <video
            ref={videoRef}
            className="w-full h-72 object-cover"
            muted
            playsInline
          />
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="mt-3 flex items-center justify-between gap-3">
          <Button
            variant={streamOn ? "secondary" : "default"}
            onClick={() => {
              if (streamOn) stopStream();
              else startStream();
            }}
          >
            {streamOn ? "Stop" : "Start Webcam Demo"}
          </Button>

          {accessState.kind === "authorized" ? (
            <div className="text-xs text-green-600">
              {accessState.message || "Access granted"}
              {typeof accessState.confidence === "number"
                ? ` (conf ${accessState.confidence.toFixed(2)})`
                : ""}
            </div>
          ) : accessState.kind === "denied" ? (
            <div className="text-xs text-destructive">
              {accessState.message || "Access denied"}
              {typeof accessState.confidence === "number"
                ? ` (conf ${accessState.confidence.toFixed(2)})`
                : ""}
            </div>
          ) : accessState.kind === "error" ? (
            <div className="text-xs text-destructive">{accessState.message}</div>
          ) : (
            <div className="text-xs text-muted-foreground">Camera snapshots sent every ~2.5s</div>
          )}
        </div>
      </div>
    </div>
  );
}


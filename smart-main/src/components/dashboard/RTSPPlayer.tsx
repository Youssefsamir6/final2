"use client";

import React from "react";

type RTSPPlayerProps = {
  /**
   * URL for a stream that the browser can play directly.
   * For RTSP cameras you typically need an RTSP-to-Web (HLS/WebRTC/MJPEG) proxy.
   * Example supported URL formats: .m3u8 (HLS) or MJPEG (.mjpg) or a browser-friendly WebRTC URL.
   */
  src: string;
  title?: string;
  className?: string;
};

/**
 * Simplified stream player.
 * - If src is HLS (.m3u8) we render an HTML5 video with the URL.
 * - Otherwise we render an img tag (works for MJPEG streams).
 */
export default function RTSPPlayer({ src, title, className }: RTSPPlayerProps) {
  const isHls = React.useMemo(() => src.toLowerCase().includes(".m3u8"), [src]);

  return (
    <div className={className ?? "h-64 w-full rounded-md overflow-hidden border bg-card"}>
      {title ? (
        <div className="px-3 py-2 text-xs font-medium text-muted-foreground">
          {title}
        </div>
      ) : null}

      <div className="w-full h-[calc(100%-28px)] bg-black">
        {isHls ? (
          <video
            className="w-full h-full object-cover"
            src={src}
            controls={false}
            muted
            autoPlay
            playsInline
          />
        ) : (
          <img className="w-full h-full object-cover" src={src} alt={title ?? "camera"} />
        )}
      </div>
    </div>
  );
}


"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import { useSocket } from "@/context/SocketProvider";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SoundAlertProps {
  className?: string;
}

// Generate simple beep sounds using Web Audio API (no file dependency)
function playBeep(frequency: number, duration: number, type: OscillatorType = "sine") {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);

    return true;
  } catch (e) {
    console.warn("Web Audio API not supported:", e);
    return false;
  }
}

function playAccessGrantedSound() {
  // Pleasant ascending tones
  playBeep(523.25, 0.15, "sine"); // C5
  setTimeout(() => playBeep(659.25, 0.15, "sine"), 100); // E5
  setTimeout(() => playBeep(783.99, 0.2, "sine"), 200); // G5
}

function playAccessDeniedSound() {
  // Low buzzer sound
  playBeep(200, 0.3, "square");
  setTimeout(() => playBeep(150, 0.4, "square"), 300);
}

function playAlertSound() {
  // Urgent alert
  for (let i = 0; i < 3; i++) {
    setTimeout(() => playBeep(880, 0.1, "sawtooth"), i * 150);
  }
}

export function SoundAlert({ className }: SoundAlertProps) {
  const { logs: socketLogs } = useSocket();
  const [muted, setMuted] = useState(false);
  const lastProcessedTimestamp = useRef<string>("");

  const playSoundForLog = useCallback((log: any) => {
    if (muted) return;

    const status = log.status?.toLowerCase();
    
    if (status === "authorized" || status === "allowed") {
      playAccessGrantedSound();
    } else if (status === "unauthorized" || status === "denied") {
      playAccessDeniedSound();
    } else if (log.type === "alert" || log.severity === "high" || log.severity === "critical") {
      playAlertSound();
    }
  }, [muted]);

  // Process new logs from Socket.io
  useEffect(() => {
    if (!socketLogs || socketLogs.length === 0) return;

    const latestLog = socketLogs[0];
    const logIdentifier = `${latestLog.id}-${latestLog.timestamp}`;

    // Skip if already processed
    if (lastProcessedTimestamp.current === logIdentifier) return;

    lastProcessedTimestamp.current = logIdentifier;
    
    // Play sound for the new log
    playSoundForLog(latestLog);
  }, [socketLogs, playSoundForLog]);

  // Request audio permission on first interaction
  useEffect(() => {
    const handleUserInteraction = () => {
      // Web Audio API requires user interaction to start
      playBeep(440, 0.05);
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };

    document.addEventListener("click", handleUserInteraction);
    document.addEventListener("keydown", handleUserInteraction);

    return () => {
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={className}
            onClick={() => setMuted(!muted)}
            title={muted ? "Unmute alerts" : "Mute alerts"}
          >
            {muted ? (
              <VolumeX className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            <span className="sr-only">
              {muted ? "Unmute sound alerts" : "Mute sound alerts"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{muted ? "Sound alerts muted" : "Sound alerts enabled"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Hook for other components to trigger sounds
export function useSoundAlert() {
  const playAccessGranted = useCallback(() => {
    playAccessGrantedSound();
  }, []);

  const playAccessDenied = useCallback(() => {
    playAccessDeniedSound();
  }, []);

  const playAlert = useCallback(() => {
    playAlertSound();
  }, []);

  return { playAccessGranted, playAccessDenied, playAlert };
}

export default SoundAlert;
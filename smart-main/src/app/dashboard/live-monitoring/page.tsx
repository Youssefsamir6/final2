"use client";

import React from "react";
import LiveStatusCards from "@/components/dashboard/LiveStatusCards";
import LiveActivityFeed from "@/components/dashboard/LiveActivityFeed";
import AlertsPanel from "@/components/dashboard/AlertsPanel";
import CameraGrid from "@/components/dashboard/CameraGrid";
import PersonRecognition from "@/components/dashboard/PersonRecognition";

export default function LiveMonitoringPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Live Monitoring</h1>

      <LiveStatusCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <LiveActivityFeed />
        </div>

        <div className="space-y-4">
          <AlertsPanel />
          <PersonRecognition />
        </div>
      </div>

      <CameraGrid />
    </div>
  );
}

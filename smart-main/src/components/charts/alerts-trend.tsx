"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Stats } from "@/types/api";

export function AlertsTrendChart({ stats }: { stats: Stats }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={stats.series} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="gradAlerts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gradAccess" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(34, 211, 238)" stopOpacity={0.22} />
              <stop offset="100%" stopColor="rgb(34, 211, 238)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 12 }}
            axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
            tickLine={false}
            width={34}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(15, 15, 18, 0.8)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              backdropFilter: "blur(14px)",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.75)" }}
            itemStyle={{ color: "rgba(255,255,255,0.8)" }}
          />
          <Area
            type="monotone"
            dataKey="alerts"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#gradAlerts)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="accessEvents"
            stroke="rgb(34, 211, 238)"
            strokeWidth={2}
            fill="url(#gradAccess)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}


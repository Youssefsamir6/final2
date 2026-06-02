"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function SeverityBreakdownChart({
  critical,
  warning,
  active,
}: {
  critical: number;
  warning: number;
  active: number;
}) {
  const data = [
    { name: "Active", value: active, fill: "rgba(16, 185, 129, 0.75)" },
    { name: "Warning", value: warning, fill: "rgba(245, 158, 11, 0.8)" },
    { name: "Critical", value: critical, fill: "rgba(239, 68, 68, 0.85)" },
  ];

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="name"
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
            cursor={{ fill: "rgba(255,255,255,0.03)" }}
            contentStyle={{
              background: "rgba(10, 14, 24, 0.62)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 14,
              boxShadow: "0 12px 28px rgba(0,0,0,0.28)",
              backdropFilter: "blur(18px)",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.75)" }}
            itemStyle={{ color: "rgba(255,255,255,0.85)" }}
          />
          <Bar dataKey="value" radius={[14, 14, 8, 8]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


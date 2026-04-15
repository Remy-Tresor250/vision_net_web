/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RevenuePoint } from "@/types";

interface Props {
  data: RevenuePoint[];
}

export default function RevenueChart({ data }: Props) {
  return (
    <div className="h-64 w-full outline-none focus:outline-none" tabIndex={-1}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          accessibilityLayer={false}
          tabIndex={-1}
          data={data}
          barGap={8}
          margin={{ left: -16, right: 0, top: 8 }}
        >
          <CartesianGrid
            stroke="var(--color-border)"
            strokeDasharray="0"
            vertical={false}
          />
          <XAxis
            axisLine={false}
            dataKey="month"
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            tickLine={false}
          />
          <YAxis axisLine={false} tick={false} tickLine={false} width={12} />
          <Bar
            dataKey="value"
            shape={(props: any) => {
              const { x, y, width, height, index } = props;
              const fill = data[index]?.fill;
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={fill}
                  rx={6}
                  ry={6}
                />
              );
            }}
          />
          <Tooltip
            cursor={{ fill: "transparent" }}
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;

              const item = payload[0];
              return (
                <div
                  style={{
                    background: "white",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ color: "var(--color-text-muted)" }}>
                    {item.payload.month}
                  </div>
                  <div style={{ fontWeight: 600 }}>
                    {item.value}
                  </div>
                </div>
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

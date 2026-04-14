"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import type { RevenuePoint } from "@/types";

interface Props {
  data: RevenuePoint[];
}

export default function RevenueChart({ data }: Props) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={8} margin={{ left: -16, right: 0, top: 8 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="0" vertical={false} />
          <XAxis
            axisLine={false}
            dataKey="month"
            tick={{ fill: "var(--color-text-muted)", fontSize: 12 }}
            tickLine={false}
          />
          <YAxis axisLine={false} tick={false} tickLine={false} width={12} />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.month} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

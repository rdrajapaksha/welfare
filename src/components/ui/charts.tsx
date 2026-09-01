"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#ec2a2b", "#141414", "#9f7a32", "#6b6b6b", "#c91f20", "#407e7a"];

type Point = { label: string; value: number; extra?: number };

export function TrendChart({
  data,
  extraKey,
}: {
  data: Point[];
  extraKey?: boolean;
}) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="fillBrand" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ec2a2b" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#ec2a2b" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="fillTeal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#141414" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#141414" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,20,20,0.08)" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={48} />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="#ec2a2b" fill="url(#fillBrand)" strokeWidth={2} />
          {extraKey && (
            <Area type="monotone" dataKey="extra" stroke="#141414" fill="url(#fillTeal)" strokeWidth={2} />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarsChart({ data }: { data: Point[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(20,20,20,0.08)" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} width={48} />
          <Tooltip />
          <Bar dataKey="value" fill="#ec2a2b" radius={[8, 8, 0, 0]} />
          {data.some((d) => typeof d.extra === "number") && (
            <Bar dataKey="extra" fill="#141414" radius={[8, 8, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DonutChart({ data }: { data: Point[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius={58} outerRadius={90} paddingAngle={3}>
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

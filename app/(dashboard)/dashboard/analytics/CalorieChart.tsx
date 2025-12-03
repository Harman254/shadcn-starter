"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CalorieData {
  day: string;
  calories: number;
  target: number;
}

interface CalorieChartProps {
  data: CalorieData[];
}

export function CalorieChart({ data }: CalorieChartProps) {
  return (
    <div 
      className="h-[300px] w-full animate-fade-in opacity-0" 
      style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(152, 55%, 42%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(152, 55%, 42%)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(40, 95%, 55%)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(40, 95%, 55%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(45, 20%, 90%)" vertical={false} />
          <XAxis
            dataKey="day"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(160, 15%, 45%)", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(160, 15%, 45%)", fontSize: 12 }}
          />
          <Tooltip
            content={({ payload, label }) => {
              if (!payload?.length) return null;
              return (
                <div className="rounded-lg bg-card px-4 py-3 shadow-elevated">
                  <p className="mb-2 text-sm font-medium text-muted-foreground">{label}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm">Calories: <strong>{payload[0].value}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-warning" />
                      <span className="text-sm">Target: <strong>{payload[1]?.value}</strong></span>
                    </div>
                  </div>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="calories"
            stroke="hsl(152, 55%, 42%)"
            strokeWidth={2}
            fill="url(#calorieGradient)"
          />
          <Area
            type="monotone"
            dataKey="target"
            stroke="hsl(40, 95%, 55%)"
            strokeWidth={2}
            strokeDasharray="5 5"
            fill="url(#targetGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

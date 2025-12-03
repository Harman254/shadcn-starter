"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

interface NutritionData {
  name: string;
  value: number;
  color: string;
  [key: string]: any;
}

interface NutritionDonutProps {
  data: NutritionData[];
  centerLabel?: string;
  centerValue?: string;
}

export function NutritionDonut({ data, centerLabel, centerValue }: NutritionDonutProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="relative h-[280px] w-full animate-fade-in opacity-0" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="transition-all duration-300 hover:opacity-80"
              />
            ))}
          </Pie>
          <Tooltip
            content={({ payload }) => {
              if (!payload?.length) return null;
              const item = payload[0].payload;
              const percentage = ((item.value / total) * 100).toFixed(1);
              return (
                <div className="rounded-lg bg-card px-3 py-2 shadow-elevated">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-lg font-bold">{item.value}g</p>
                  <p className="text-xs text-muted-foreground">{percentage}%</p>
                </div>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold">{centerValue}</p>
          <p className="text-sm text-muted-foreground">{centerLabel}</p>
        </div>
      )}
    </div>
  );
}

interface NutritionLegendProps {
  data: NutritionData[];
}

export function NutritionLegend({ data }: NutritionLegendProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {data.map((item, index) => (
        <div
          key={item.name}
          className={cn(
            "flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2",
            "animate-fade-up opacity-0"
          )}
          style={{ animationDelay: `${300 + index * 50}ms`, animationFillMode: "forwards" }}
        >
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <div>
            <p className="text-xs text-muted-foreground">{item.name}</p>
            <p className="text-sm font-semibold">{item.value}g</p>
          </div>
        </div>
      ))}
    </div>
  );
}

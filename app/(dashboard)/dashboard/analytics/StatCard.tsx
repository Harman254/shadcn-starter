import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  iconColor?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  iconColor = "bg-primary/10 text-primary",
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1",
        "animate-fade-up opacity-0"
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {change && (
            <p
              className={cn(
                "text-sm font-medium",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            "rounded-xl p-3 transition-transform duration-300 group-hover:scale-110",
            iconColor
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150" />
    </div>
  );
}

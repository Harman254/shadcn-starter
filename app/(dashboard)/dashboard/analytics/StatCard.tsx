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
        "group relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-4 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20",
        "animate-fade-up opacity-0"
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:via-primary/0 group-hover:to-accent/5 transition-all duration-500 pointer-events-none" />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-1.5 sm:space-y-2 flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{value}</p>
          {change && (
            <p
              className={cn(
                "text-xs sm:text-sm font-medium truncate",
                changeType === "positive" && "text-green-500 dark:text-green-400",
                changeType === "negative" && "text-red-500 dark:text-red-400",
                changeType === "neutral" && "text-muted-foreground"
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div
          className={cn(
            "rounded-xl p-2.5 sm:p-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 flex-shrink-0",
            iconColor
          )}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </div>
      
      {/* Animated background circle */}
      <div className="absolute -bottom-4 -right-4 h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-primary/5 transition-transform duration-500 group-hover:scale-150 group-hover:bg-primary/10" />
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

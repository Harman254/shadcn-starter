import { cn } from "@/lib/utils";
import { Check, Clock } from "lucide-react";

interface MealPlanProgressProps {
  completed: number;
  total: number;
  weeklyPlans: { day: string; completed: boolean; meals: number }[];
}

export function MealPlanProgress({ completed, total, weeklyPlans }: MealPlanProgressProps) {
  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="space-y-6">
      <div 
        className="animate-fade-up opacity-0" 
        style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
      >
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-sm text-muted-foreground">Weekly Completion</p>
            <p className="text-2xl font-bold">{percentage}%</p>
          </div>
          <p className="text-sm text-muted-foreground">
            {completed} of {total} meals
          </p>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-primary transition-all duration-1000 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weeklyPlans.map((plan, index) => (
          <div
            key={plan.day}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl p-2 transition-all duration-300",
              plan.completed ? "bg-primary/10" : "bg-muted/50",
              "animate-scale-in opacity-0"
            )}
            style={{ animationDelay: `${300 + index * 50}ms`, animationFillMode: "forwards" }}
          >
            <span className="text-xs font-medium text-muted-foreground">{plan.day}</span>
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                plan.completed ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}
            >
              {plan.completed ? (
                <Check className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
            </div>
            <span className="text-xs font-medium">{plan.meals}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

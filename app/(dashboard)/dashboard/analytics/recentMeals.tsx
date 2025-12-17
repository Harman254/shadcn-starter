import { cn } from "@/lib/utils";
import { Clock, Flame } from "lucide-react";

interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  image: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
}

interface RecentMealsProps {
  meals: Meal[];
}

const typeColors = {
  breakfast: "bg-warning/10 text-warning",
  lunch: "bg-primary/10 text-primary",
  dinner: "bg-accent/10 text-accent",
  snack: "bg-info/10 text-info",
};

export function RecentMeals({ meals }: RecentMealsProps) {
  return (
    <div className="space-y-3">
      {meals.map((meal, index) => (
        <div
          key={meal.id}
          className={cn(
            "group flex items-center gap-4 rounded-xl bg-muted/30 p-3 transition-all duration-300 hover:bg-muted/60 hover:shadow-card cursor-pointer",
            "animate-fade-up opacity-0"
          )}
          style={{ animationDelay: `${400 + index * 100}ms`, animationFillMode: "forwards" }}
        >
          <div className="relative h-14 w-14 overflow-hidden rounded-lg">
            <img
              src={meal.image}
              alt={meal.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium truncate">{meal.name}</h4>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                  typeColors[meal.type]
                )}
              >
                {meal.type}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {meal.time}
              </span>
              <span className="flex items-center gap-1">
                <Flame className="h-3.5 w-3.5" />
                {meal.calories} kcal
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

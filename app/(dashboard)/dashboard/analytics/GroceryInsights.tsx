import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp } from "lucide-react";

interface GroceryCategory {
  name: string;
  amount: number;
  percentage: number;
  trend: "up" | "down";
  color: string;
}

interface GroceryInsightsProps {
  categories: GroceryCategory[];
  totalItems: number;
  totalSpent: string;
}

export function GroceryInsights({ categories, totalItems, totalSpent }: GroceryInsightsProps) {
  return (
    <div className="space-y-4">
      <div 
        className="flex items-center justify-between rounded-xl bg-gradient-primary p-4 text-primary-foreground animate-fade-up opacity-0"
        style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
      >
        <div>
          <p className="text-sm opacity-90">Total Items This Week</p>
          <p className="text-2xl font-bold">{totalItems} items</p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-90">Estimated Cost</p>
          <p className="text-2xl font-bold">{totalSpent}</p>
        </div>
      </div>

      <div className="space-y-3">
        {categories.map((category, index) => (
          <div
            key={category.name}
            className={cn(
              "group rounded-lg p-3 transition-all duration-300 hover:bg-muted/60",
              "animate-fade-up opacity-0"
            )}
            style={{ animationDelay: `${300 + index * 80}ms`, animationFillMode: "forwards" }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-medium">{category.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{category.amount} items</span>
                <span
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    category.trend === "up" ? "text-destructive" : "text-success"
                  )}
                >
                  {category.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {category.percentage}%
                </span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                style={{
                  width: `${(category.amount / 30) * 100}%`,
                  backgroundColor: category.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

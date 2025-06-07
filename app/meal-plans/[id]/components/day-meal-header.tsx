import { Badge } from "@/components/ui/badge";
import { Utensils, Flame } from "lucide-react";
import { DayMealHeaderProps } from "../components/types";

export const DayMealHeader = ({ day, dayIndex }: DayMealHeaderProps) => {
  const totalCalories = day.meals.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center">
        <div className="bg-emerald-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold mr-4 shadow-lg">
          {dayIndex + 1}
        </div>
        <div>
          <h2 className="text-xl font-bold">
            {new Date(day.date).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h2>
          <p className="text-muted-foreground">
            {day.meals.length} meals • {totalCalories} total calories
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Badge variant="secondary">
          <Utensils className="h-3 w-3 mr-1" />
          {day.meals.length} meals
        </Badge>
        <Badge className="bg-emerald-600">
          <Flame className="h-3 w-3 mr-1" />
          {totalCalories} cal
        </Badge>
      </div>
    </div>
  );
};

export default DayMealHeader;


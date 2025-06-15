import { Badge } from "@/components/ui/badge";
import { Flame, Star } from "lucide-react";
import { MealHeaderProps } from "../components/types";
import MealTypeBadge from "./meal-type-badge";
import CalorieBadge from "./calorie-badge";
import MealLikeButton from "@/components/meal-like";

export const MealHeader = ({ meal }: MealHeaderProps) => {
  return (
    <div>
      {/* Meal Header Badges */}
      <div className="flex flex-wrap items-center gap-3">
        <MealTypeBadge type={meal.type} />
        <CalorieBadge calories={meal.calories} variant="outline" />
        <div className="flex items-center text-sm text-muted-foreground">
          <Star className="h-4 w-4 mr-1 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold">4.8</span>
        </div>
        <MealLikeButton mealId={meal.id} />
      </div>

      {/* Meal Title and Description */}
      <div className="mt-4">
        <h3 className="text-2xl sm:text-3xl tracking-tight font-extrabold mb-2 bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent leading-tight">{meal.name}</h3>
        <p className="text-base text-gray-700 dark:text-gray-300 leading-relaxed max-w-prose">{meal.description}</p>
      </div>
    </div>
  );
};

export default MealHeader;


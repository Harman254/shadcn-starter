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
          4.8
        </div>
        <MealLikeButton mealId={meal.id} />
      </div>

      {/* Meal Title and Description */}
      <div className="mt-4">
        <h3 className="text-lg font-bold mb-2">{meal.name}</h3>
        <p className="text-muted-foreground leading-relaxed">{meal.description}</p>
      </div>
    </div>
  );
};

export default MealHeader;


import { MealItemProps } from "../components/types";
import MealActions from "./meal-actions";
import MealHeader from "./meal-header";
import MealIngredients from "./meal-ingredients";

export const MealItem = ({ meal, onViewRecipe, onSwapMeal }: MealItemProps) => {
  const mealTypeColors = {
    breakfast: "bg-yellow-50 border-l-yellow-400 dark:bg-yellow-950/20",
    lunch: "bg-emerald-50 border-l-emerald-400 dark:bg-emerald-950/20",
    dinner: "bg-blue-50 border-l-blue-400 dark:bg-blue-950/20",
    snack: "bg-purple-50 border-l-purple-400 dark:bg-purple-950/20",
    default: "bg-slate-50 border-l-slate-400 dark:bg-slate-950/20",
  };

  const mealType = meal.type?.toLowerCase() || "default";
  const bgColor = mealTypeColors[mealType as keyof typeof mealTypeColors] || mealTypeColors.default;

  return (
    <div className={`p-6 border-l-4 ${bgColor} hover:bg-opacity-80 transition-colors`}>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex-1 space-y-4">
          <MealHeader meal={meal} />
          <MealIngredients ingredients={meal.ingredients} />
        </div>
        <MealActions 
          onViewRecipe={() => onViewRecipe(meal)} 
          onSwapMeal={() => onSwapMeal(meal)} 
        />
      </div>
    </div>
  );
};


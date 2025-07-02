import { MealItemProps } from "../components/types";
import MealActions from "./meal-actions";
import MealHeader from "./meal-header";
import MealIngredients from "./meal-ingredients";
import { CldImage } from 'next-cloudinary';

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
  console.log(meal.imageUrl)

  return (
    <div className={`p-6 border-l-4 ${bgColor} hover:bg-opacity-80 transition-colors`}>
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex-1 space-y-4">
          {/* Meal Image */}
          {meal.imageUrl ? (
            <div className="mb-4">
              <CldImage
                width={400}
                height={256}
                src={meal.imageUrl}
                alt={meal.name}
                className="w-full h-48 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow"
              />
            </div>
          ) : (
            <div className="mb-4 w-full h-48 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-lg">
              No image
            </div>
          )}
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


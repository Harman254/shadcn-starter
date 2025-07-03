import { MealItemProps } from "../components/types";
import MealActions from "./meal-actions";
import MealHeader from "./meal-header";
import MealIngredients from "./meal-ingredients";
import { CldImage } from 'next-cloudinary';

export const MealItem = ({ meal, onViewRecipe, onSwapMeal }: MealItemProps) => {
  const mealTypeColors = {
    breakfast: {
      bg: "bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20",
      border: "border-l-yellow-400",
      shadow: "shadow-yellow-100 dark:shadow-yellow-900/20"
    },
    lunch: {
      bg: "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
      border: "border-l-emerald-400",
      shadow: "shadow-emerald-100 dark:shadow-emerald-900/20"
    },
    dinner: {
      bg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
      border: "border-l-blue-400",
      shadow: "shadow-blue-100 dark:shadow-blue-900/20"
    },
    snack: {
      bg: "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
      border: "border-l-purple-400",
      shadow: "shadow-purple-100 dark:shadow-purple-900/20"
    },
    default: {
      bg: "bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20",
      border: "border-l-slate-400",
      shadow: "shadow-slate-100 dark:shadow-slate-900/20"
    },
  };

  const mealType = meal.type?.toLowerCase() || "default";
  const colors = mealTypeColors[mealType as keyof typeof mealTypeColors] || mealTypeColors.default;

  return (
    <div className={`
      group relative overflow-hidden rounded-2xl border-l-4 ${colors.border} ${colors.bg} 
      hover:scale-[1.02] hover:shadow-xl ${colors.shadow} 
      transition-all duration-300 ease-out
      backdrop-blur-sm
    `}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 dark:to-transparent" />
      
      <div className="relative p-6">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            {/* Enhanced Meal Image */}
            {meal.imageUrl ? (
              <div className="relative mb-6 group/image">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl z-10" />
                <CldImage
                  width={400}
                  height={256}
                  src={meal.imageUrl}
                  alt={meal.name}
                  className="
                    w-full h-56 object-cover rounded-xl 
                    border-2 border-white/20 dark:border-white/10
                    shadow-2xl shadow-black/10 dark:shadow-black/30
                    group-hover/image:scale-105 
                    transition-all duration-500 ease-out
                    ring-1 ring-black/5 dark:ring-white/5
                  "
                />
                
                {/* Image overlay effects */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-t from-black/0 via-transparent to-white/10 dark:to-white/5 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
                
                {/* Floating meal type badge */}
                <div className={`
                  absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium
                  bg-white/90 dark:bg-black/90 backdrop-blur-sm
                  text-slate-700 dark:text-slate-200
                  shadow-lg border border-white/20 dark:border-white/10
                  capitalize
                `}>
                  {meal.type || 'meal'}
                </div>
                
                {/* Shine effect on hover */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/image:translate-x-[100%] transition-transform duration-1000 ease-out" />
              </div>
            ) : (
              <div className="relative mb-6 group/placeholder">
                <div className="
                  w-full h-56 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 
                  rounded-xl flex items-center justify-center 
                  border-2 border-dashed border-slate-300 dark:border-slate-600
                  text-slate-400 dark:text-slate-500 text-lg font-medium
                  group-hover/placeholder:border-slate-400 dark:group-hover/placeholder:border-slate-500
                  transition-all duration-300
                  shadow-inner
                ">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span>No image</span>
                  </div>
                </div>
              </div>
            )}
            
            <MealHeader meal={meal} />
            <MealIngredients ingredients={meal.ingredients} />
          </div>
          
          {/* Enhanced Actions */}
          <div className="lg:mt-6">
            <MealActions 
              onViewRecipe={() => onViewRecipe(meal)} 
              onSwapMeal={() => onSwapMeal(meal)} 
            />
          </div>
        </div>
      </div>
      
      {/* Decorative corner accent */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/10 to-transparent dark:from-white/5 dark:to-transparent rounded-bl-2xl" />
    </div>
  );
};
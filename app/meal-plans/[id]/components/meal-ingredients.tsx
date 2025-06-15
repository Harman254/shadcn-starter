import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { MealIngredientsProps } from "../components/types";

export const MealIngredients = ({ ingredients }: MealIngredientsProps) => {
  return (
    <div>
      <h4 className="text-xl font-bold mb-4 flex items-center text-gray-800 dark:text-gray-100 bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
        <Users className="h-5 w-5 mr-3 text-emerald-500 dark:text-teal-400" />
        Ingredients ({ingredients.length})
      </h4>
      <div className="flex flex-wrap gap-2">
        {ingredients.slice(0, 6).map((ingredient, index) => (
          <Badge key={index} variant="secondary" className="text-sm px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm">
            {ingredient}
          </Badge>
        ))}
        {ingredients.length > 6 && (
          <Badge variant="secondary" className="text-sm px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-sm">
            +{ingredients.length - 6} more
          </Badge>
        )}
      </div>
    </div>
  );
};

export default MealIngredients;


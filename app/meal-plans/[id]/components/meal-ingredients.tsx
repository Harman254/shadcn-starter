import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";
import { MealIngredientsProps } from "../components/types";

export const MealIngredients = ({ ingredients }: MealIngredientsProps) => {
  return (
    <div>
      <h4 className="font-semibold mb-3 flex items-center">
        <Users className="h-4 w-4 mr-2" />
        Ingredients ({ingredients.length})
      </h4>
      <div className="flex flex-wrap gap-2">
        {ingredients.slice(0, 6).map((ingredient, index) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {ingredient}
          </Badge>
        ))}
        {ingredients.length > 6 && (
          <Badge variant="secondary" className="text-xs">
            +{ingredients.length - 6} more
          </Badge>
        )}
      </div>
    </div>
  );
};

export default MealIngredients;


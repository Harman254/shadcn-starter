import { Button } from "@/components/ui/button";
import { MealActionsProps } from "../components/types";

export const MealActions = ({ onViewRecipe, onSwapMeal }: MealActionsProps) => {
  return (
    <div className="flex flex-col gap-3 lg:min-w-[160px]">
      <Button 
        className="w-full" 
        onClick={onViewRecipe}
      >
        View Recipe
      </Button>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={onSwapMeal}
      >
        Swap Meal
      </Button>
    </div>
  );
};

export default MealActions;


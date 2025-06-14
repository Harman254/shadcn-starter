import GroceryListButton from "@/components/groceries-button";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { MealPlanActionsProps } from "../components/types";

export const MealPlanActions = ({ mealPlanId }: MealPlanActionsProps) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <GroceryListButton mealplanId={mealPlanId} />
      <Button variant="secondary" size="sm">
        <Share2 className="h-4 w-4 mr-2" />
        Share Plan
      </Button>
      
    </div>
  );
};

export default MealPlanActions;


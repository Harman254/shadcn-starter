"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { MealActionsProps } from "../components/types";
import { Loader2 } from "lucide-react";

export const MealActions = ({ onViewRecipe, onSwapMeal }: MealActionsProps) => {
  const [isPending, startTransition] = useTransition();

  const handleSwap = () => {
    startTransition(() => {
      onSwapMeal();
    });
  };

  return (
    <div className="flex flex-col gap-3 lg:min-w-[160px]">
      <Button className="w-full" onClick={onViewRecipe}>
        View Recipe
      </Button>

      <Button
        variant="outline"
        className="w-full flex items-center justify-center"
        onClick={handleSwap}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Swapping...
          </>
        ) : (
          "Swap Meal"
        )}
      </Button>
    </div>
  );
};

export default MealActions;

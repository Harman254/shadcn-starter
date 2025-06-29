'use client';
import GroceryListButton from "@/components/groceries-button";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { MealPlanActionsProps } from "../components/types";
import toast from "react-hot-toast";

export const MealPlanActions = ({ mealPlanId }: MealPlanActionsProps) => {
  const handleShare = async () => {
    const url = `${window.location.origin}/meal-plans/${mealPlanId}`;
    const title = "Check out my meal plan on MealWise!";
    const text = "Here's a personalized meal plan I created with MealWise.";

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!");
      } catch (err) {
        toast.error("Failed to copy link");
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <GroceryListButton mealplanId={mealPlanId} />
      <Button variant="secondary" size="sm" onClick={handleShare}>
        <Share2 className="h-4 w-4 mr-2" />
        Share Plan
      </Button>
    </div>
  );
};

export default MealPlanActions;


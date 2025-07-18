'use client';
import GroceryListButton from "@/components/groceries-button";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { MealPlanActionsProps } from "../components/types";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

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
      <Button
        onClick={handleShare}
        disabled={false} // isLoading is not defined in this component, so set to false
        className={cn(
          "inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-base shadow-lg transition-all duration-200",
          "bg-[#1DCD9F] text-white hover:bg-[#169976] focus-visible:ring-2 focus-visible:ring-[#1DCD9F] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        <Share2 className="h-5 w-5 mr-2 text-white" />
        Share Plan
      </Button>
    </div>
  );
};

export default MealPlanActions;


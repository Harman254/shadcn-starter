'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DayMealCardProps, Meal } from "../components/types";
import DayMealHeader from "./day-meal-header";
import { MealItem } from "./meal-item";
import { swapAndUpdateMeal } from "@/actions/swap-meal";
import RecipeModal from "./recipe-modal";
import toast from "react-hot-toast";

const DayMealCard = ({ day, dayIndex, userId }: DayMealCardProps) => {
  const [meals, setMeals] = useState<Meal[]>(day.meals);
  const [selectedRecipe, setSelectedRecipe] = useState<Meal | null>(null);
  const [open, setOpen] = useState(false);

  const handleViewRecipe = (meal: Meal) => {
    setSelectedRecipe(meal);
  };

  const handleSwapMeal = async (mealToSwap: Meal) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading(`Swapping ${mealToSwap.name}...`);
      
      const swappedMeal = await swapAndUpdateMeal({
        id: mealToSwap.id,
        type: mealToSwap.type as 'breakfast' | 'lunch' | 'dinner' | 'snack',
        currentMealName: mealToSwap.name,
        currentMealIngredients: mealToSwap.ingredients,
        calories: mealToSwap.calories,
        dayMealId: mealToSwap.dayMealId,
      });

      // Update local state
      setMeals(prev =>
        prev.map(m => (m.id === mealToSwap.id ? swappedMeal : m))
      );

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`Successfully swapped to ${swappedMeal.name}!`);
      
    } catch (error) {
      console.error("Failed to swap meal:", error);
      toast.error("Failed to swap meal. Please try again.");
    }
  };

  return (
    <>
      <Card key={day.id} id={`day-${day.id}`} className="overflow-hidden scroll-mt-24">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
          <DayMealHeader day={day} dayIndex={dayIndex} />
        </CardHeader>

        <CardContent className="p-0">
          <div className="divide-y">
            {meals.map((meal) => (
              <MealItem
                key={meal.id}
                meal={meal}
                onViewRecipe={handleViewRecipe}
                onSwapMeal={handleSwapMeal}
              />
            ))}
          </div>
        </CardContent>
      </Card>

       {selectedRecipe && (
        <RecipeModal
          meal={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          userId={userId}
        /> 
      )}
    </>
  );
};

export default DayMealCard;

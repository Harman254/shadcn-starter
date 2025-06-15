// src/actions/mealActions.ts
'use server';

import { swapMealFlow } from "@/ai/flows/generate-meal";
import { fetchOnboardingData } from "@/data";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

type SwapAndUpdateMealProps = {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  currentMealName: string;
  currentMealIngredients: string[];
  calories: number;
  dayMealId: string;
};

// Validation function to ensure AI output is valid
function validateMealOutput(aiMeal: any, input: SwapAndUpdateMealProps) {
  if (!aiMeal.name || typeof aiMeal.name !== 'string') {
    throw new Error("Invalid meal name from AI");
  }
  
  if (!aiMeal.description || typeof aiMeal.description !== 'string') {
    throw new Error("Invalid meal description from AI");
  }
  
  if (!Array.isArray(aiMeal.ingredients) || aiMeal.ingredients.length === 0) {
    throw new Error("Invalid ingredients from AI");
  }
  
  if (!aiMeal.instructions || typeof aiMeal.instructions !== 'string') {
    throw new Error("Invalid meal instructions from AI");
  }
  
  if (typeof aiMeal.calories !== 'number' || aiMeal.calories <= 0) {
    throw new Error("Invalid calories from AI");
  }
  
  if (aiMeal.type !== input.type) {
    throw new Error("AI returned wrong meal type");
  }
  
  if (aiMeal.dayMealId !== input.dayMealId) {
    throw new Error("AI returned wrong dayMealId");
  }
  
  return true;
}

export async function swapAndUpdateMeal(input: SwapAndUpdateMealProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user?.id) {
    throw new Error("Unauthorized: User session not found");
  }

  const userPreferencesArray = await fetchOnboardingData(session.user.id);
  const userPreferences = userPreferencesArray?.[0];

  if (!userPreferences) {
    throw new Error("User preferences not found");
  }

  try {
    // Generate new meal using AI
    const aiMeal = await swapMealFlow({
      ...input,
      dietaryPreference: userPreferences.dietaryPreference,
      goal: userPreferences.goal,
      cuisinePreferences: userPreferences.cuisinePreferences,
    });

    // Validate AI output
    validateMealOutput(aiMeal, input);

    // Update the meal in the database with the AI-generated content
    const updatedMeal = await prisma.meal.update({
      where: { id: input.id },
      data: {
        name: aiMeal.name,
        description: aiMeal.description,
        ingredients: aiMeal.ingredients,
        instructions: aiMeal.instructions,
        calories: aiMeal.calories,
        type: input.type,
        dayMealId: input.dayMealId,
      },
      include: {
        dayMeal: {
          include: {
            mealPlan: true,
          },
        },
      },
    });

    

    return updatedMeal;
  } catch (error) {
    console.error("Error in swapAndUpdateMeal:", error);
    
    if (error instanceof Error) {
      throw new Error(`Failed to swap meal: ${error.message}`);
    } else {
      throw new Error("Failed to swap meal. Please try again.");
    }
  }
}

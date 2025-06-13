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
};

export async function swapAndUpdateMeal(input: SwapAndUpdateMealProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user?.id) {
    throw new Error("Unauthorized: User session not found");
  }

  const userPreferencesArray = await fetchOnboardingData(session.user.id);
  const userPreferences = userPreferencesArray?.[0]; // FIX: Use first element

  if (!userPreferences) {
    throw new Error("User preferences not found");
  }

  const aiMeal = await swapMealFlow({
    ...input,
    dietaryPreference: userPreferences.dietaryPreference,
    goal: userPreferences.goal,
    cuisinePreferences: userPreferences.cuisinePreferences,
  });

  const updatedMeal = await prisma.meal.update({
    where: { id: input.id },
    data: {
      name: aiMeal.name,
      description: aiMeal.description,
      ingredients: aiMeal.ingredients,
      calories: aiMeal.calories,
    },
  });

  return updatedMeal;
}

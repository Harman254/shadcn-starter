// src/actions/mealActions.ts
'use server';

import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { z } from "zod";
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

// Schema for AI-generated meal
const mealSchema = z.object({
  name: z.string().describe("Name of the meal"),
  description: z.string().describe("Brief description of the meal"),
  ingredients: z.array(z.string()).describe("List of ingredients"),
  instructions: z.string().describe("Cooking instructions"),
  calories: z.number().describe("Estimated calories"),
});

// Validation function to ensure AI output is valid
function validateMealOutput(aiMeal: z.infer<typeof mealSchema>, input: SwapAndUpdateMealProps) {
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
    // Generate new meal using AI SDK
    const result = await generateObject({
      model: google('gemini-2.0-flash'),
      temperature: 0.7,
      schema: mealSchema,
      prompt: `Generate a NEW ${input.type} meal to replace "${input.currentMealName}".

## User Preferences
- Dietary Preference: ${userPreferences.dietaryPreference || 'None'}
- Goal: ${userPreferences.goal || 'Balanced diet'}
- Cuisine Preferences: ${userPreferences.cuisinePreferences?.join(', ') || 'Any'}

## Current Meal to Replace
- Name: ${input.currentMealName}
- Ingredients: ${input.currentMealIngredients.join(', ')}
- Target Calories: ~${input.calories}

## Requirements
1. Generate a COMPLETELY DIFFERENT meal (not just a variation)
2. Match the meal type (${input.type})
3. Keep calories close to ${input.calories}
4. Honor dietary preferences
5. Provide complete cooking instructions

Return a JSON object with: name, description, ingredients, instructions, calories`,
    });

    if (!result.object) {
      throw new Error("Failed to generate meal from AI");
    }

    const aiMeal = result.object;

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


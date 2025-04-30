import { generateObject } from "ai"
import { z } from "zod"
import { geminiFlashModel } from "@/actions"
import { OnboardingData } from "@/types"

type MealPlanProps= {
    duration: number; // in days
    preferences: OnboardingData;
    mealsPerDay: number; // total meals per day
}


  
  const mealSchema = z.object({
    id: z.string(),
    name: z.string(),
    type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    description: z.string(),
    calories: z.number(),
  });
  
  const daySchema = z.object({
    date: z.string(), // ISO string
    meals: z.array(mealSchema),
  });
  
  const mealPlanSchema = z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.string(),
    days: z.array(daySchema),
  });
  
  export const generateMealPlan = async ({
    duration,
    preferences,
    mealsPerDay,
  }: MealPlanProps) => {
    const { object } = await generateObject({
      model: geminiFlashModel,
      schema: mealPlanSchema,
      prompt: `
  Generate a structured JSON meal plan object for a user with these preferences: ${JSON.stringify(preferences)}.
  
  Requirements:
  - Duration: ${duration} days
  - Meals per day: ${mealsPerDay}
  - Each day should contain exactly ${mealsPerDay} meals (breakfast, lunch, dinner, and optionally snacks).
  - Each meal must include:
    - name
    - type (breakfast, lunch, dinner, snack)
    - description
    - calories (as a number)
  - Return a complete meal plan object that matches the provided schema.
  - Today's date is: ${new Date().toISOString().split("T")[0]}.
  
  Format:
  {
    id: string,
    name: string,
    createdAt: ISO date string,
    days: Day[]
  }
  
  Each Day = {
    date: string (ISO),
    meals: Meal[]
  }
  
  Each Meal = {
    id: string,
    name: string,
    type: "breakfast" | "lunch" | "dinner" | "snack",
    description: string,
    calories: number
  }
  `,
    });
  
    return object;
  };


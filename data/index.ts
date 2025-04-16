import { DayMealPlan } from "@/components/create-meal-plan";
import { prisma } from "@/lib/prisma";
import { MealPlan, UserPreference } from "@/types";




export async function fetchOnboardingData(): Promise<UserPreference[]> {
const data = await prisma.onboardingData.findMany({
  where: {
    id: 3
  }
});
return data;
}


export async function SaveMealPlan(payload: {
  duration: number;
  mealsPerDay: number;
  days: DayMealPlan[];
  createdAt: string;
}) {
  const { duration, mealsPerDay, days, createdAt } = payload;

  try {
    const mealPlan = await prisma.mealPlan.create({
      data: {
        duration,
        mealsPerDay,
        createdAt: new Date(createdAt),
        days: {
          create: days.map((day, index) => ({
            date: new Date(), // Optional: you can customize this
            meals: {
              create: day.meals.map((meal) => ({
                name: meal.name,
                type: meal.name,
                description: meal.instructions,
                calories: meal.ingredients.length, // Example: you can customize this
              })),
            },
          })),
        },
      },
      include: {
        days: {
          include: {
            meals: true,
          },
        },
      },
    });

    return mealPlan;
  } catch (error) {
    console.error('[SaveMealPlan] Error:', error);
    throw new Error('Failed to save meal plan');
  }
}


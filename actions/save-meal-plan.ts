'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { incrementMealPlanGeneration } from '@/data';

interface Meal {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
  imageUrl?: string;
}

interface DayMealPlan {
  day: number;
  meals: Meal[];
}

interface SaveMealPlanInput {
  title: string;
  duration: number;
  mealsPerDay: number;
  days: DayMealPlan[];
  createdAt: string;
}

// Helper function to estimate calories based on ingredients
function calculateCalories(ingredients: string[]): number {
  return ingredients.length * 100;
}

export async function saveMealPlanAction(input: SaveMealPlanInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'User not authenticated',
      };
    }

    const userId = session.user.id;

    // Validate required fields
    if (!input.title || !input.duration || !input.mealsPerDay || !input.days) {
      return {
        success: false,
        error: 'Missing required fields: title, duration, mealsPerDay, or days',
      };
    }

    // Validate meal data structure
    for (const day of input.days) {
      if (!day.meals || !Array.isArray(day.meals)) {
        return {
          success: false,
          error: `Invalid meal data structure for day ${day.day}`,
        };
      }

      for (const meal of day.meals) {
        if (!meal.name || !meal.description || !meal.ingredients || !meal.instructions) {
          return {
            success: false,
            error: `Missing required meal fields for meal: ${meal.name || 'unnamed'}`,
          };
        }
      }
    }

    // Create the main MealPlan record
    const mealPlan = await prisma.mealPlan.create({
      data: {
        title: input.title,
        userId: userId,
        duration: input.duration,
        mealsPerDay: input.mealsPerDay,
        createdAt: new Date(input.createdAt),
      },
    });

    // For each day in the meal plan, create a DayMeal record
    for (const day of input.days) {
      // Create a date for this day (using the day number to offset from today)
      const dayDate = new Date();
      dayDate.setDate(dayDate.getDate() + (day.day - 1)); // Offset by day number (1-based)

      // Create the DayMeal record
      const dayMeal = await prisma.dayMeal.create({
        data: {
          date: dayDate,
          mealPlanId: mealPlan.id,
        },
      });

      // For each meal in this day, create a Meal record
      for (const meal of day.meals) {
        // Determine meal type based on index
        const mealIndex = day.meals.indexOf(meal);
        let mealType = 'snack';

        if (mealIndex === 0) mealType = 'breakfast';
        else if (mealIndex === 1) mealType = 'lunch';
        else if (mealIndex === 2) mealType = 'dinner';

        // Create the Meal record
        await prisma.meal.create({
          data: {
            name: meal.name,
            type: mealType,
            description: meal.description,
            calories: calculateCalories(meal.ingredients),
            ingredients: meal.ingredients,
            imageUrl: meal.imageUrl || null,
            dayMealId: dayMeal.id,
            instructions: meal.instructions,
          },
        });
      }
    }

    // Return the created meal plan with all related data
    const savedMealPlan = await prisma.mealPlan.findUnique({
      where: { id: mealPlan.id },
      include: {
        days: {
          include: {
            meals: true,
          },
        },
      },
    });

    // Increment meal plan generation count
    await incrementMealPlanGeneration(userId);

    // Analytics Tracking
    const allMeals = savedMealPlan?.days.flatMap((day) => day.meals) || [];
    const totalMeals = allMeals.length;
    const uniqueRecipes = new Set(allMeals.map((meal) => meal.name)).size;

    await prisma.userAnalytics.upsert({
      where: { userId },
      update: {
        totalMealsCooked: { increment: totalMeals },
        totalRecipesTried: { increment: uniqueRecipes },
      },
      create: {
        userId,
        totalMealsCooked: totalMeals,
        totalRecipesTried: uniqueRecipes,
      },
    });

    return {
      success: true,
      mealPlan: savedMealPlan,
    };
  } catch (error) {
    console.error('[saveMealPlanAction] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }
}


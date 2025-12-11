/**
 * Core service for meal plan operations
 * Handles all business logic, validation, and database operations
 * Does NOT handle authentication or revalidation (handled by callers)
 */

'use server';

import prisma from '@/lib/prisma';
import { incrementMealPlanGeneration } from '@/data';
import { validateMealPlanInput, type SaveMealPlanInput } from '@/lib/validators/meal-plan-validator';
import { MealPlanValidationError, MealPlanSaveError, isMealPlanError } from '@/lib/errors/meal-plan-errors';
import type { MealPlan } from '@/types';

export type SaveMealPlanResult =
  | {
    success: true;
    mealPlan: MealPlan;
  }
  | {
    success: false;
    error: string;
    code: string;
  };

/**
 * Helper function to estimate calories based on ingredients
 */
function calculateCalories(ingredients: string[]): number {
  return ingredients.length * 100;
}

/**
 * Determines meal type based on index
 */
function getMealType(mealIndex: number, mealsPerDay: number): string {
  if (mealIndex === 0) return 'breakfast';
  if (mealIndex === 1) return 'lunch';
  if (mealIndex === 2) return 'dinner';
  return 'snack';
}

/**
 * Core service for saving meal plans.
 * Uses database transactions for atomicity.
 * Handles validation, database operations, and analytics.
 */
export async function saveMealPlanService(
  input: SaveMealPlanInput,
  userId: string
): Promise<SaveMealPlanResult> {
  try {
    // Validate input
    const validation = validateMealPlanInput(input);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join('; '),
        code: 'VALIDATION_ERROR',
      };
    }

    // Check for existing meal plan with same metadata to prevent duplicates
    const existingMealPlan = await prisma.mealPlan.findFirst({
      where: {
        userId,
        title: input.title.trim(),
        duration: input.duration,
        mealsPerDay: input.mealsPerDay,
      },
      include: {
        days: {
          include: {
            meals: {
              orderBy: {
                type: 'asc',
              },
            },
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    if (existingMealPlan) {
      console.log('[saveMealPlanService] Found existing meal plan, returning it instead of creating new one');
      return {
        success: true,
        mealPlan: existingMealPlan,
      };
    }

    // Use transaction for atomicity - all or nothing
    const savedMealPlan = await prisma.$transaction(async (tx) => {
      // Create the main MealPlan record
      const mealPlan = await tx.mealPlan.create({
        data: {
          title: input.title.trim(),
          userId: userId,
          duration: input.duration,
          mealsPerDay: input.mealsPerDay,
          createdAt: new Date(input.createdAt),
        },
      });

      // Create DayMeal and Meal records for each day
      for (const day of input.days) {
        // Create a date for this day (using the day number to offset from today)
        const dayDate = new Date();
        dayDate.setDate(dayDate.getDate() + (day.day - 1)); // Offset by day number (1-based)
        dayDate.setHours(0, 0, 0, 0); // Normalize to start of day

        // Create the DayMeal record
        const dayMeal = await tx.dayMeal.create({
          data: {
            date: dayDate,
            mealPlanId: mealPlan.id,
          },
        });

        // Create Meal records for this day
        for (let mealIndex = 0; mealIndex < day.meals.length; mealIndex++) {
          const meal = day.meals[mealIndex];
          // Use AI-provided mealType if available, otherwise derive from index
          const mealType = meal.mealType || getMealType(mealIndex, input.mealsPerDay);

          await tx.meal.create({
            data: {
              name: meal.name.trim(),
              type: mealType,
              description: meal.description.trim(),
              // Use AI-provided calories if available, otherwise fallback to heuristic
              calories: meal.calories || calculateCalories(meal.ingredients),
              ingredients: meal.ingredients.map(ing => ing.trim()).filter(ing => ing.length > 0),
              imageUrl: meal.imageUrl?.trim() || null,
              dayMealId: dayMeal.id,
              instructions: meal.instructions.trim(),
            },
          });
        }
      }

      // Fetch the complete meal plan with all relations
      const completeMealPlan = await tx.mealPlan.findUnique({
        where: { id: mealPlan.id },
        include: {
          days: {
            include: {
              meals: {
                orderBy: {
                  type: 'asc', // Order meals by type (breakfast, lunch, dinner, snack)
                },
              },
            },
            orderBy: {
              date: 'asc', // Order days by date
            },
          },
        },
      });

      if (!completeMealPlan) {
        throw new MealPlanSaveError('Failed to retrieve saved meal plan');
      }

      return completeMealPlan;
    });

    // Increment meal plan generation count (outside transaction)
    // This is non-critical, so we don't fail the save if it fails
    try {
      await incrementMealPlanGeneration(userId);
    } catch (error) {
      console.error('[saveMealPlanService] Failed to increment generation count:', error);
      // Continue - this is not critical for the save operation
    }

    // Analytics Tracking (outside transaction)
    // This is also non-critical
    try {
      const allMeals = savedMealPlan.days.flatMap((day) => day.meals);
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
    } catch (error) {
      console.error('[saveMealPlanService] Failed to update analytics:', error);
      // Continue - analytics failure shouldn't fail the save
    }

    return {
      success: true,
      mealPlan: savedMealPlan,
    };
  } catch (error) {
    // Handle known error types
    if (isMealPlanError(error)) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }

    // Handle Prisma errors
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as { code: string; message?: string };

      if (prismaError.code === 'P2002') {
        return {
          success: false,
          error: 'A meal plan with this title already exists',
          code: 'DUPLICATE_ERROR',
        };
      }

      if (prismaError.code === 'P2025') {
        return {
          success: false,
          error: 'Related record not found',
          code: 'NOT_FOUND',
        };
      }
    }

    // Log unexpected errors
    console.error('[saveMealPlanService] Unexpected error:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred while saving the meal plan',
      code: 'UNKNOWN_ERROR',
    };
  }
}


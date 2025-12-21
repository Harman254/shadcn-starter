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

/**
 * Validates if a string is a proper URL
 */
function isValidUrl(urlString: string | undefined | null): boolean {
  if (!urlString) return false;
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

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
  // Comprehensive input validation before processing (using imported validator)
  const validation = validateMealPlanInput(input);
  if (!validation.valid) {
    console.error('[saveMealPlanService] Input validation failed:', validation.errors);
    return {
      success: false,
      error: validation.errors.join('; '),
      code: 'VALIDATION_ERROR',
    };
  }
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

    // Extract cover image from first meal's imageUrl
    // Validate URL before using it
    const rawCoverImageUrl = input.coverImageUrl || 
      (input.days?.[0]?.meals?.[0]?.imageUrl) || 
      null;
    const coverImageUrl = rawCoverImageUrl && isValidUrl(rawCoverImageUrl) ? rawCoverImageUrl : null;

    // Use transaction for atomicity - all or nothing
    // Increase timeout to 30 seconds for large meal plans
    const savedMealPlan = await prisma.$transaction(async (tx) => {
      // Create the main MealPlan record
      const mealPlan = await tx.mealPlan.create({
        data: {
          title: input.title.trim(),
          userId: userId,
          duration: input.duration,
          mealsPerDay: input.mealsPerDay,
          coverImageUrl: coverImageUrl?.trim() || null,
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
          
          // Validate required fields
          if (!meal || !meal.name) {
            console.error(`[saveMealPlanService] Invalid meal at day ${day.day}, index ${mealIndex}:`, meal);
            throw new MealPlanSaveError(`Invalid meal data: missing name`);
          }

          // Use AI-provided mealType if available, otherwise derive from index
          const mealType = meal.mealType || getMealType(mealIndex, input.mealsPerDay);

          // Ensure all required fields are present and valid
          const mealName = String(meal.name || '').trim();
          const mealDescription = String(meal.description || '').trim();
          const mealInstructions = String(meal.instructions || '').trim();
          const mealIngredients = Array.isArray(meal.ingredients) 
            ? meal.ingredients.map((ing: any) => String(ing || '').trim()).filter((ing: string) => ing.length > 0)
            : [];
          const mealCalories = typeof meal.calories === 'number' && meal.calories > 0 
            ? meal.calories 
            : calculateCalories(mealIngredients);
          const mealImageUrl = (meal.imageUrl && typeof meal.imageUrl === 'string' && isValidUrl(meal.imageUrl.trim())) 
            ? meal.imageUrl.trim() 
            : null;

          if (!mealName) {
            throw new MealPlanSaveError(`Invalid meal: name is required`);
          }

          if (mealIngredients.length === 0) {
            console.warn(`[saveMealPlanService] Meal "${mealName}" has no ingredients`);
          }

          await tx.meal.create({
            data: {
              name: mealName,
              type: mealType,
              description: mealDescription,
              calories: mealCalories,
              ingredients: mealIngredients,
              imageUrl: mealImageUrl,
              dayMealId: dayMeal.id,
              instructions: mealInstructions,
            },
          });
        }
      }

      // Return just the mealPlan ID - we'll fetch the complete plan outside the transaction
      return mealPlan;
    }, {
      maxWait: 30000, // Maximum time to wait for a transaction slot (30 seconds)
      timeout: 30000, // Maximum time the transaction can run (30 seconds)
    });

    // Fetch the complete meal plan with all relations OUTSIDE the transaction
    // This reduces transaction time and prevents timeout errors
    const completeMealPlan = await prisma.mealPlan.findUnique({
      where: { id: savedMealPlan.id },
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


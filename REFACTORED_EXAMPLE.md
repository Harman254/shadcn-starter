# Refactored Meal Plan Save Pattern - Example

## Structure

```
lib/
  meal-plan-service.ts      # Core business logic
  validators/
    meal-plan-validator.ts  # Validation logic
  errors/
    meal-plan-errors.ts     # Error types
actions/
  save-meal-plan.ts         # Server Action (primary)
app/api/
  savemealplan/
    route.ts                # API Route (delegates to action)
```

## Implementation

### 1. Shared Service (`lib/meal-plan-service.ts`)

```typescript
'use server';

import prisma from '@/lib/prisma';
import { incrementMealPlanGeneration } from '@/data';
import { validateMealPlanInput } from '@/lib/validators/meal-plan-validator';
import { MealPlanValidationError, MealPlanSaveError } from '@/lib/errors/meal-plan-errors';

export interface SaveMealPlanInput {
  title: string;
  duration: number;
  mealsPerDay: number;
  days: DayMealPlan[];
  createdAt: string;
}

export interface SaveMealPlanResult {
  success: true;
  mealPlan: MealPlan;
} | {
  success: false;
  error: string;
  code?: string;
}

function calculateCalories(ingredients: string[]): number {
  return ingredients.length * 100;
}

/**
 * Core service for saving meal plans.
 * Handles all business logic, validation, and database operations.
 * Does NOT handle authentication or revalidation (handled by callers).
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
        error: validation.errors.join(', '),
        code: 'VALIDATION_ERROR',
      };
    }

    // Use transaction for atomicity
    const savedMealPlan = await prisma.$transaction(async (tx) => {
      // Create the main MealPlan record
      const mealPlan = await tx.mealPlan.create({
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
        const dayDate = new Date();
        dayDate.setDate(dayDate.getDate() + (day.day - 1));

        const dayMeal = await tx.dayMeal.create({
          data: {
            date: dayDate,
            mealPlanId: mealPlan.id,
          },
        });

        // For each meal in this day, create a Meal record
        for (const meal of day.meals) {
          const mealIndex = day.meals.indexOf(meal);
          let mealType = 'snack';
          if (mealIndex === 0) mealType = 'breakfast';
          else if (mealIndex === 1) mealType = 'lunch';
          else if (mealIndex === 2) mealType = 'dinner';

          await tx.meal.create({
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

      // Fetch the complete meal plan with relations
      return await tx.mealPlan.findUnique({
        where: { id: mealPlan.id },
        include: {
          days: {
            include: {
              meals: true,
            },
          },
        },
      });
    });

    if (!savedMealPlan) {
      throw new MealPlanSaveError('Failed to save meal plan');
    }

    // Increment meal plan generation count (outside transaction)
    await incrementMealPlanGeneration(userId).catch((error) => {
      // Log but don't fail the save if analytics fails
      console.error('[saveMealPlanService] Failed to increment generation count:', error);
    });

    // Analytics Tracking (outside transaction)
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
    }).catch((error) => {
      // Log but don't fail the save if analytics fails
      console.error('[saveMealPlanService] Failed to update analytics:', error);
    });

    return {
      success: true,
      mealPlan: savedMealPlan,
    };
  } catch (error) {
    console.error('[saveMealPlanService] Error:', error);
    
    if (error instanceof MealPlanValidationError) {
      return {
        success: false,
        error: error.message,
        code: 'VALIDATION_ERROR',
      };
    }
    
    if (error instanceof MealPlanSaveError) {
      return {
        success: false,
        error: error.message,
        code: 'SAVE_ERROR',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }
}
```

### 2. Server Action (`actions/save-meal-plan.ts`)

```typescript
'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { saveMealPlanService, type SaveMealPlanInput } from '@/lib/meal-plan-service';
import { revalidatePath } from 'next/cache';

/**
 * Server Action for saving meal plans.
 * Handles authentication, calls service, and revalidates paths.
 */
export async function saveMealPlanAction(input: SaveMealPlanInput) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'User not authenticated',
        code: 'UNAUTHORIZED',
      };
    }

    const userId = session.user.id;

    // Call service
    const result = await saveMealPlanService(input, userId);

    // Revalidate paths if successful
    if (result.success) {
      revalidatePath('/meal-plans');
      revalidatePath(`/meal-plans/${result.mealPlan.id}`);
    }

    return result;
  } catch (error) {
    console.error('[saveMealPlanAction] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      code: 'ACTION_ERROR',
    };
  }
}
```

### 3. API Route (`app/api/savemealplan/route.ts`)

```typescript
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { saveMealPlanAction, type SaveMealPlanInput } from '@/actions/save-meal-plan';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

/**
 * API Route for saving meal plans.
 * Delegates to server action for consistency.
 * Useful for external integrations or webhooks.
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    let input: SaveMealPlanInput;
    try {
      input = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in request body', code: 'PARSE_ERROR' },
        { status: 400 }
      );
    }

    // Delegate to server action
    const result = await saveMealPlanAction(input);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      const statusCode = result.code === 'UNAUTHORIZED' ? 401 :
                        result.code === 'VALIDATION_ERROR' ? 400 : 500;
      return NextResponse.json(result, { status: statusCode });
    }
  } catch (error) {
    console.error('[POST /api/savemealplan] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        code: 'SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
```

### 4. Validator (`lib/validators/meal-plan-validator.ts`)

```typescript
import type { SaveMealPlanInput } from '@/lib/meal-plan-service';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateMealPlanInput(input: SaveMealPlanInput): ValidationResult {
  const errors: string[] = [];

  if (!input.title?.trim()) {
    errors.push('Title is required');
  }

  if (!input.duration || input.duration < 1 || input.duration > 30) {
    errors.push('Duration must be between 1 and 30 days');
  }

  if (!input.mealsPerDay || input.mealsPerDay < 1 || input.mealsPerDay > 5) {
    errors.push('Meals per day must be between 1 and 5');
  }

  if (!input.days || !Array.isArray(input.days) || input.days.length === 0) {
    errors.push('Days array is required and must not be empty');
  }

  // Validate each day
  input.days?.forEach((day, dayIndex) => {
    if (!day.meals || !Array.isArray(day.meals)) {
      errors.push(`Day ${dayIndex + 1}: meals array is required`);
      return;
    }

    if (day.meals.length !== input.mealsPerDay) {
      errors.push(`Day ${dayIndex + 1}: expected ${input.mealsPerDay} meals, got ${day.meals.length}`);
    }

    day.meals.forEach((meal, mealIndex) => {
      if (!meal.name?.trim()) {
        errors.push(`Day ${dayIndex + 1}, Meal ${mealIndex + 1}: name is required`);
      }
      if (!meal.description?.trim()) {
        errors.push(`Day ${dayIndex + 1}, Meal ${mealIndex + 1}: description is required`);
      }
      if (!meal.ingredients || !Array.isArray(meal.ingredients) || meal.ingredients.length === 0) {
        errors.push(`Day ${dayIndex + 1}, Meal ${mealIndex + 1}: ingredients array is required`);
      }
      if (!meal.instructions?.trim()) {
        errors.push(`Day ${dayIndex + 1}, Meal ${mealIndex + 1}: instructions is required`);
      }
    });
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### 5. Error Types (`lib/errors/meal-plan-errors.ts`)

```typescript
export class MealPlanValidationError extends Error {
  constructor(public errors: string[]) {
    super(`Meal plan validation failed: ${errors.join(', ')}`);
    this.name = 'MealPlanValidationError';
  }
}

export class MealPlanSaveError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'MealPlanSaveError';
    if (cause) {
      this.cause = cause;
    }
  }
}
```

## Benefits

✅ **Single Source of Truth**: Business logic in one place  
✅ **Transaction Safety**: Atomic operations, no orphaned data  
✅ **Better Error Handling**: Structured errors with codes  
✅ **Easier Testing**: Service can be tested independently  
✅ **Consistency**: API route and server action use same logic  
✅ **Maintainability**: Changes in one place  
✅ **Type Safety**: Shared types prevent mismatches  


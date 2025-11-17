'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { saveMealPlanService, type SaveMealPlanResult } from '@/lib/services/meal-plan-service';
import { MealPlanUnauthorizedError } from '@/lib/errors/meal-plan-errors';
import type { SaveMealPlanInput } from '@/lib/validators/meal-plan-validator';

/**
 * Server Action for saving meal plans.
 * Handles authentication, calls service, and revalidates paths.
 * 
 * This is the primary entry point for saving meal plans from:
 * - Chat tool calls
 * - Client components using server actions
 */
export async function saveMealPlanAction(input: SaveMealPlanInput): Promise<SaveMealPlanResult> {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return {
        success: false,
        error: 'User not authenticated. Please sign in to save meal plans.',
        code: 'UNAUTHORIZED',
      };
    }

    const userId = session.user.id;

    // Call service to handle business logic
    const result = await saveMealPlanService(input, userId);

    // Revalidate paths if successful
    if (result.success) {
      revalidatePath('/meal-plans');
      revalidatePath(`/meal-plans/${result.mealPlan.id}`);
    }

    return result;
  } catch (error) {
    console.error('[saveMealPlanAction] Unexpected error:', error);
    
    // Handle authentication errors
    if (error instanceof MealPlanUnauthorizedError) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }

    // Return generic error
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unknown error occurred',
      code: 'ACTION_ERROR',
    };
  }
}


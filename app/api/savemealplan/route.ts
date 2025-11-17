import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from '@/lib/auth';
import { saveMealPlanAction } from '@/actions/save-meal-plan';
import type { SaveMealPlanInput } from '@/lib/validators/meal-plan-validator';

// Configure API route for larger request bodies
export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic';

/**
 * API Route for saving meal plans.
 * Delegates to server action for consistency and code reuse.
 * 
 * This route is maintained for:
 * - External integrations
 * - Webhooks
 * - Legacy client code that uses fetch()
 * 
 * All business logic is handled by the server action.
 */
export async function POST(request: Request) {
  try {
    // Authenticate user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'User not authenticated',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // Parse request body
    let input: SaveMealPlanInput;
    try {
      input = await request.json();
    } catch (parseError) {
      console.error('[POST /api/savemealplan] Failed to parse request body:', parseError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid JSON in request body',
          code: 'PARSE_ERROR',
        },
        { status: 400 }
      );
    }

    // Log request for debugging (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('[POST /api/savemealplan] Request:', {
        title: input.title,
        duration: input.duration,
        mealsPerDay: input.mealsPerDay,
        daysCount: input.days?.length,
        totalMeals: input.days?.reduce((acc, day) => acc + (day.meals?.length || 0), 0),
      });
    }

    // Delegate to server action (handles all business logic)
    const result = await saveMealPlanAction(input);

    // Map result to appropriate HTTP status
    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      // Map error codes to HTTP status codes
      const statusCode = 
        result.code === 'UNAUTHORIZED' ? 401 :
        result.code === 'VALIDATION_ERROR' ? 400 :
        result.code === 'NOT_FOUND' ? 404 :
        result.code === 'DUPLICATE_ERROR' ? 409 :
        500;

      return NextResponse.json(result, { status: statusCode });
    }
  } catch (error) {
    console.error('[POST /api/savemealplan] Unexpected error:', error);
    
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

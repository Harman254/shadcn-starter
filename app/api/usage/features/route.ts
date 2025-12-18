import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getUserFeatureLimits, getUserPlan } from '@/lib/utils/feature-gates';
import { getToolUsageCount } from '@/lib/utils/tool-usage-tracker';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') || 'week') as 'week' | 'month';

    const plan = await getUserPlan(session.user.id);
    const limits = await getUserFeatureLimits(session.user.id);

    const featureUsage = [];

    // Only show usage limits for free users (Pro users have unlimited)
    if (plan === 'free') {
      // Check meal plan usage
      if (limits.mealPlansPerWeek !== Infinity) {
        const usage = await getToolUsageCount(session.user.id, 'generateMealPlan', 'week');
        featureUsage.push({
          toolName: 'generateMealPlan',
          currentUsage: usage,
          limit: limits.mealPlansPerWeek,
          remaining: Math.max(0, limits.mealPlansPerWeek - usage),
          period: 'week',
        });
      }

      // Check pantry analysis usage
      if (limits.pantryAnalysesPerMonth !== Infinity) {
        const usage = await getToolUsageCount(session.user.id, 'analyzePantryImage', 'month');
        featureUsage.push({
          toolName: 'analyzePantryImage',
          currentUsage: usage,
          limit: limits.pantryAnalysesPerMonth,
          remaining: Math.max(0, limits.pantryAnalysesPerMonth - usage),
          period: 'month',
        });
      }

      // Check recipe generation usage
      if (limits.recipeGenerationsPerWeek !== Infinity) {
        const usage = await getToolUsageCount(session.user.id, 'generateMealRecipe', 'week');
        featureUsage.push({
          toolName: 'generateMealRecipe',
          currentUsage: usage,
          limit: limits.recipeGenerationsPerWeek,
          remaining: Math.max(0, limits.recipeGenerationsPerWeek - usage),
          period: 'week',
        });
      }
    }

    // Return both limits and featureUsage for all users
    return NextResponse.json({
      limits,
      featureUsage,
      plan,
    });
  } catch (error) {
    console.error('[Usage Features API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature usage' },
      { status: 500 }
    );
  }
}


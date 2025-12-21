import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/meal-plans
 * Returns all meal plans for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      );
    }

    const mealPlans = await prisma.mealPlan.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        duration: true,
        mealsPerDay: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      mealPlans,
    });
  } catch (error) {
    console.error('[GET /api/meal-plans] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch meal plans',
      },
      { status: 500 }
    );
  }
}


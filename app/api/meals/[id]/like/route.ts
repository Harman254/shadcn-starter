import { NextRequest, NextResponse } from 'next/server';
import { setMealLiked, getMealLikeStatus } from '@/data/index';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: mealId } = await params;
    const { isLiked } = await request.json();

    if (typeof isLiked !== 'boolean') {
      return NextResponse.json(
        { error: 'isLiked must be a boolean' },
        { status: 400 }
      );
    }

    const updatedMeal = await setMealLiked(mealId, isLiked, session.user.id);

    // Revalidate the recipes page and cache tags
    revalidatePath('/recipes');
    revalidateTag('favorites');

    return NextResponse.json({
      success: true,
      meal: updatedMeal,
    });
  } catch (error) {
    console.error('Error updating meal like status:', error);
    return NextResponse.json(
      { error: 'Failed to update meal like status' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: mealId } = await params;
    const isLiked = await getMealLikeStatus(mealId, session.user.id);

    return NextResponse.json({
      success: true,
      isLiked,
    });
  } catch (error) {
    console.error('Error getting meal like status:', error);
    return NextResponse.json(
      { error: 'Failed to get meal like status' },
      { status: 500 }
    );
  }
} 
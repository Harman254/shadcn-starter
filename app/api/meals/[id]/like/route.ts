import { NextRequest, NextResponse } from 'next/server';
import { setMealLiked, getMealLikeStatus } from '@/data/index';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: mealId } = await params;
    const { isLiked } = await request.json();

    if (typeof isLiked !== 'boolean') {
      return NextResponse.json(
        { error: 'isLiked must be a boolean' },
        { status: 400 }
      );
    }

    const updatedMeal = await setMealLiked(mealId, isLiked);

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
    const { id: mealId } = await params;
    const isLiked = await getMealLikeStatus(mealId);

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
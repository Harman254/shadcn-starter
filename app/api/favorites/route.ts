import { NextRequest, NextResponse } from 'next/server';
import { getUserFavorites, addToFavorites, removeFromFavorites } from '@/data/index';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
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

    const favorites = await getUserFavorites(session.user.id);

    return NextResponse.json({
      success: true,
      favorites,
    });
  } catch (error) {
    console.error('Error getting user favorites:', error);
    return NextResponse.json(
      { error: 'Failed to get user favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { mealId, action } = await request.json();

    if (!mealId || !action) {
      return NextResponse.json(
        { error: 'mealId and action are required' },
        { status: 400 }
      );
    }

    if (action !== 'add' && action !== 'remove') {
      return NextResponse.json(
        { error: 'action must be either "add" or "remove"' },
        { status: 400 }
      );
    }

    let result;
    if (action === 'add') {
      result = await addToFavorites(mealId, session.user.id);
    } else {
      result = await removeFromFavorites(mealId, session.user.id);
    }

    // Revalidate the recipes page
    revalidatePath('/recipes');

    return NextResponse.json({
      success: true,
      action,
      result,
    });
  } catch (error) {
    console.error('Error managing favorites:', error);
    return NextResponse.json(
      { error: 'Failed to manage favorites' },
      { status: 500 }
    );
  }
}
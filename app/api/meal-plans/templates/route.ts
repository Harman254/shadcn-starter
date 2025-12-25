import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { hasMealPlanTemplates } from '@/lib/utils/feature-gates';

/**
 * Get available meal plan templates (Pro feature)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user has access to templates
    const hasAccess = await hasMealPlanTemplates(session.user.id);
    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'Meal plan templates are a Pro feature. Upgrade to Pro to access premium templates.',
          requiresPro: true,
        },
        { status: 403 }
      );
    }

    // Return available templates
    const templates = [
      {
        id: 'keto-7-day',
        name: 'Keto 7-Day Plan',
        description: 'A week of low-carb, high-fat meals perfect for ketogenic diet',
        duration: 7,
        mealsPerDay: 3,
        category: 'keto',
        imageUrl: '/templates/keto.jpg',
      },
      {
        id: 'mediterranean-14-day',
        name: 'Mediterranean 14-Day Plan',
        description: 'Two weeks of heart-healthy Mediterranean cuisine',
        duration: 14,
        mealsPerDay: 3,
        category: 'mediterranean',
        imageUrl: '/templates/mediterranean.jpg',
      },
      {
        id: 'vegetarian-7-day',
        name: 'Vegetarian 7-Day Plan',
        description: 'A week of delicious plant-based meals',
        duration: 7,
        mealsPerDay: 3,
        category: 'vegetarian',
        imageUrl: '/templates/vegetarian.jpg',
      },
      {
        id: 'high-protein-7-day',
        name: 'High Protein 7-Day Plan',
        description: 'A week of protein-rich meals for muscle building',
        duration: 7,
        mealsPerDay: 3,
        category: 'fitness',
        imageUrl: '/templates/high-protein.jpg',
      },
      {
        id: 'budget-friendly-7-day',
        name: 'Budget-Friendly 7-Day Plan',
        description: 'Affordable meals that don\'t compromise on nutrition',
        duration: 7,
        mealsPerDay: 3,
        category: 'budget',
        imageUrl: '/templates/budget.jpg',
      },
      {
        id: 'family-friendly-7-day',
        name: 'Family-Friendly 7-Day Plan',
        description: 'Meals the whole family will love',
        duration: 7,
        mealsPerDay: 3,
        category: 'family',
        imageUrl: '/templates/family.jpg',
      },
    ];

    return NextResponse.json({
      success: true,
      templates,
    });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to fetch templates',
      },
      { status: 500 }
    );
  }
}


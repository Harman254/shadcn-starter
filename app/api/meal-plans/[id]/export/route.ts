import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getUserFeatureLimits } from '@/lib/utils/feature-gates';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function convertMealPlanToCSV(mealPlan: any): string {
  const rows: string[] = [];
  
  // Header
  rows.push(`Meal Plan: ${mealPlan.title || 'Untitled'}`);
  rows.push(`Duration: ${mealPlan.duration} days`);
  rows.push(`Meals Per Day: ${mealPlan.mealsPerDay || 3}`);
  rows.push('');
  rows.push('Day,Meal Type,Meal Name,Description,Ingredients,Instructions,Calories,Prep Time,Servings');
  
  // Meals
  mealPlan.days?.forEach((day: any, dayIndex: number) => {
    day.meals?.forEach((meal: any) => {
      const ingredients = Array.isArray(meal.ingredients) 
        ? meal.ingredients.join('; ') 
        : meal.ingredients || '';
      rows.push([
        day.day || (dayIndex + 1).toString(), // Use day.day if exists, otherwise use index + 1
        meal.mealType || '',
        meal.name || '',
        meal.description || '',
        ingredients,
        meal.instructions || '',
        meal.calories || '',
        meal.prepTime || '',
        meal.servings || ''
      ].join(','));
    });
  });
  
  return rows.join('\n');
}

function convertMealPlanToJSON(mealPlan: any): string {
  return JSON.stringify(mealPlan, null, 2);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: mealPlanId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const format = (searchParams.get('format') || 'pdf') as 'pdf' | 'csv' | 'json';

    // Check user's export format limits
    const limits = await getUserFeatureLimits(session.user.id);
    if (!limits.exportFormats.includes(format)) {
      return NextResponse.json(
        { 
          error: `${format.toUpperCase()} export is not available on your plan. Available formats: ${limits.exportFormats.join(', ').toUpperCase()}. Upgrade to Pro for CSV and JSON exports.` 
        },
        { status: 403 }
      );
    }

    // Fetch meal plan
    const mealPlan = await prisma.mealPlan.findUnique({
      where: {
        id: mealPlanId,
        userId: session.user.id, // Ensure user owns the meal plan
      },
      include: {
        days: {
          include: {
            meals: true,
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      );
    }

    // Transform to export format
    const mealPlanData = {
      title: mealPlan.title,
      duration: mealPlan.duration,
      mealsPerDay: mealPlan.mealsPerDay,
      days: mealPlan.days.map((day, index) => ({
        day: index + 1, // Calculate day number from index (DayMeal doesn't have a 'day' field)
        date: day.date.toISOString(),
        meals: day.meals.map(meal => ({
          name: meal.name,
          description: meal.description,
          ingredients: meal.ingredients,
          instructions: meal.instructions,
          calories: meal.calories,
          prepTime: '', // Meal model doesn't have prepTime
          servings: 1, // Meal model doesn't have servings, default to 1
          mealType: meal.type, // Meal model uses 'type' not 'mealType'
          imageUrl: meal.imageUrl || '',
        })),
      })),
    };

    let content: string;
    let contentType: string;
    let filename: string;

    if (format === 'csv') {
      content = convertMealPlanToCSV(mealPlanData);
      contentType = 'text/csv';
      filename = `meal-plan-${mealPlanId}-${new Date().toISOString().split('T')[0]}.csv`;
    } else if (format === 'json') {
      content = convertMealPlanToJSON(mealPlanData);
      contentType = 'application/json';
      filename = `meal-plan-${mealPlanId}-${new Date().toISOString().split('T')[0]}.json`;
    } else {
      // PDF - would need a PDF library like pdfkit or puppeteer
      // For now, return JSON as fallback
      content = convertMealPlanToJSON(mealPlanData);
      contentType = 'application/json';
      filename = `meal-plan-${mealPlanId}-${new Date().toISOString().split('T')[0]}.json`;
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[Meal Plan Export API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export meal plan' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getUserFeatureLimits } from '@/lib/utils/feature-gates';
import prisma from '@/lib/prisma';

function convertRecipeToCSV(recipe: any): string {
  const rows: string[] = [];
  
  // Header
  rows.push(`Recipe: ${recipe.name || 'Untitled'}`);
  rows.push(`Description: ${recipe.description || ''}`);
  rows.push(`Prep Time: ${recipe.prepTime || ''}`);
  rows.push(`Cook Time: ${recipe.cookTime || ''}`);
  rows.push(`Servings: ${recipe.servings || ''}`);
  rows.push(`Calories: ${recipe.calories || ''}`);
  rows.push('');
  rows.push('Ingredient,Quantity,Unit');
  
  // Ingredients
  if (Array.isArray(recipe.ingredients)) {
    recipe.ingredients.forEach((ing: any) => {
      if (typeof ing === 'string') {
        rows.push(`${ing},,`);
      } else {
        rows.push(`${ing.name || ing.ingredient || ''},${ing.quantity || ''},${ing.unit || ''}`);
      }
    });
  }
  
  rows.push('');
  rows.push('Instructions');
  rows.push(recipe.instructions || '');
  
  return rows.join('\n');
}

function convertRecipeToJSON(recipe: any): string {
  return JSON.stringify(recipe, null, 2);
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

    const { id: recipeId } = await params;
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

    // Fetch recipe (could be from Meal or a separate Recipe table)
    // For now, we'll check if it's a meal from a user's meal plan
    const meal = await prisma.meal.findFirst({
      where: {
        id: recipeId,
        dayMeal: {
          mealPlan: {
            userId: session.user.id,
          },
        },
      },
      include: {
        dayMeal: {
          include: {
            mealPlan: true,
          },
        },
      },
    });

    if (!meal) {
      return NextResponse.json(
        { error: 'Recipe not found or you do not have access to it' },
        { status: 404 }
      );
    }

    // Transform to export format
    const recipeData = {
      name: meal.name,
      description: meal.description,
      ingredients: meal.ingredients,
      instructions: meal.instructions,
      calories: meal.calories,
      prepTime: '', // Meal model doesn't have prepTime
      servings: 1, // Meal model doesn't have servings, default to 1
      mealType: meal.type, // Meal model uses 'type' not 'mealType'
      imageUrl: meal.imageUrl || '',
    };

    let content: string;
    let contentType: string;
    let filename: string;

    if (format === 'csv') {
      content = convertRecipeToCSV(recipeData);
      contentType = 'text/csv';
      filename = `recipe-${recipeId}-${new Date().toISOString().split('T')[0]}.csv`;
    } else if (format === 'json') {
      content = convertRecipeToJSON(recipeData);
      contentType = 'application/json';
      filename = `recipe-${recipeId}-${new Date().toISOString().split('T')[0]}.json`;
    } else {
      // PDF - would need a PDF library
      // For now, return JSON as fallback
      content = convertRecipeToJSON(recipeData);
      contentType = 'application/json';
      filename = `recipe-${recipeId}-${new Date().toISOString().split('T')[0]}.json`;
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[Recipe Export API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export recipe' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { canImportRecipes } from '@/lib/utils/feature-gates';
import prisma from '@/lib/prisma';

/**
 * Import recipe from external source
 * Supports URL import (from popular recipe sites) or JSON format
 */
export async function POST(request: NextRequest) {
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

    // Check if user has recipe import feature
    const canImport = await canImportRecipes(session.user.id);
    if (!canImport) {
      return NextResponse.json(
        {
          error: 'Recipe import is a Pro feature. Upgrade to Pro to import recipes from external sources.',
          requiresPro: true,
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { url, recipeData } = body;

    if (!url && !recipeData) {
      return NextResponse.json(
        { error: 'Either url or recipeData is required' },
        { status: 400 }
      );
    }

    let recipe;

    // If URL provided, fetch and parse recipe
    if (url) {
      recipe = await importRecipeFromUrl(url);
    } else if (recipeData) {
      // Validate recipe data structure
      recipe = validateRecipeData(recipeData);
    }

    if (!recipe) {
      return NextResponse.json(
        { error: 'Failed to import recipe. Please check the URL or recipe data format.' },
        { status: 400 }
      );
    }

    // Save recipe to database (as a Meal)
    // Note: This is a simplified version - you may want to create a separate Recipe model
    const savedRecipe = await prisma.meal.create({
      data: {
        name: recipe.name,
        description: recipe.description || '',
        ingredients: recipe.ingredients || [],
        instructions: recipe.instructions || '',
        calories: recipe.calories || 0,
        type: recipe.type || 'main',
        imageUrl: recipe.imageUrl || null,
        dayMealId: '', // Will be assigned when added to a meal plan
      },
    });

    return NextResponse.json({
      success: true,
      recipe: savedRecipe,
      message: 'Recipe imported successfully',
    });
  } catch (error: any) {
    console.error('Error importing recipe:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to import recipe',
      },
      { status: 500 }
    );
  }
}

/**
 * Import recipe from URL
 * Supports common recipe sites like AllRecipes, Food Network, etc.
 */
async function importRecipeFromUrl(url: string): Promise<any> {
  try {
    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MealWise/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const html = await response.text();

    // Try to extract structured data (JSON-LD)
    const jsonLdMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
    if (jsonLdMatch) {
      const structuredData = JSON.parse(jsonLdMatch[1]);
      
      // Handle Recipe schema.org format
      if (structuredData['@type'] === 'Recipe' || structuredData['@type'] === 'https://schema.org/Recipe') {
        return {
          name: structuredData.name || '',
          description: structuredData.description || '',
          ingredients: Array.isArray(structuredData.recipeIngredient)
            ? structuredData.recipeIngredient
            : [],
          instructions: Array.isArray(structuredData.recipeInstructions)
            ? structuredData.recipeInstructions
                .map((step: any) => step.text || step)
                .join('\n')
            : structuredData.recipeInstructions || '',
          calories: structuredData.nutrition?.calories || 0,
          imageUrl: structuredData.image?.url || structuredData.image || null,
          type: 'main',
        };
      }
    }

    // Fallback: Return basic structure (could be enhanced with more parsing)
    return {
      name: 'Imported Recipe',
      description: `Recipe imported from ${url}`,
      ingredients: [],
      instructions: '',
      calories: 0,
      imageUrl: null,
      type: 'main',
    };
  } catch (error) {
    console.error('Error importing from URL:', error);
    throw error;
  }
}

/**
 * Validate and normalize recipe data
 */
function validateRecipeData(data: any): any {
  if (!data.name) {
    throw new Error('Recipe name is required');
  }

  return {
    name: data.name,
    description: data.description || '',
    ingredients: Array.isArray(data.ingredients) ? data.ingredients : [],
    instructions: typeof data.instructions === 'string'
      ? data.instructions
      : Array.isArray(data.instructions)
      ? data.instructions.join('\n')
      : '',
    calories: typeof data.calories === 'number' ? data.calories : 0,
    imageUrl: data.imageUrl || null,
    type: data.type || 'main',
  };
}


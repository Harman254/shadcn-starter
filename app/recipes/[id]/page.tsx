import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { RecipeDetailClient } from "./components/recipe-detail-client"
import { Metadata } from 'next'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params;
  
  // We can't easily get the session here without performance hit or duplicating logic,
  // but we can try to fetch the recipe name at least.
  const recipe = await prisma.recipe.findUnique({
    where: { id },
    select: { name: true }
  });

  if (!recipe) return { title: 'Recipe Not Found' };

  return {
    title: `${recipe.name} | MealWise Recipes`,
    description: `View details and instructions for ${recipe.name} on MealWise.`,
  };
}

export const dynamic = 'force-dynamic'
export const revalidate = 60

export default async function RecipeDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  // Fetch recipe from database
  const recipe = await prisma.recipe.findUnique({
    where: {
      id: id,
      userId: session.user.id, // Ensure user owns the recipe
    },
  });

  if (!recipe) {
    notFound();
  }

  // Transform recipe data for client component
  const recipeData = {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    imageUrl: recipe.imageUrl,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    calories: recipe.calories,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fat: recipe.fat,
    difficulty: recipe.difficulty,
    ingredients: (recipe.ingredients as string[]) || [],
    instructions: (recipe.instructions as string[]) || [],
    tags: (recipe.tags as string[]) || null,
  };

  return <RecipeDetailClient recipe={recipeData} />
}

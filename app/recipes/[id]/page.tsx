import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { RecipeDetailClient } from "./components/recipe-detail-client"

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

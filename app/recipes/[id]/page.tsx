import { notFound, redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import prisma from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Flame, ChefHat, ArrowLeft } from "lucide-react"
import Image from "next/image"

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-4">
        <a href="/recipes">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Recipes
        </a>
      </Button>

      {/* Recipe Header */}
      <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden mb-6">
        <Image
          src={recipe.imageUrl || 'https://res.cloudinary.com/dcidanigq/image/upload/v1742111994/samples/food/fish-vegetables.jpg'}
          alt={recipe.name}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            {recipe.name}
          </h1>
          {recipe.description && (
            <p className="text-white/90 text-sm sm:text-base">
              {recipe.description}
            </p>
          )}
        </div>
      </div>

      {/* Recipe Info */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{recipe.servings}</div>
            <div className="text-xs text-muted-foreground">Servings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-sm font-semibold">{recipe.prepTime || 'N/A'}</div>
            <div className="text-xs text-muted-foreground">Prep Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-sm font-semibold">{recipe.cookTime || 'N/A'}</div>
            <div className="text-xs text-muted-foreground">Cook Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-sm font-semibold">{recipe.difficulty}</div>
            <div className="text-xs text-muted-foreground">Difficulty</div>
          </CardContent>
        </Card>
      </div>

      {/* Nutrition */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-primary" />
            Nutrition (per serving)
          </h3>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="text-lg font-bold">{recipe.calories}</div>
              <div className="text-xs text-muted-foreground">Calories</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{recipe.protein}g</div>
              <div className="text-xs text-muted-foreground">Protein</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{recipe.carbs}g</div>
              <div className="text-xs text-muted-foreground">Carbs</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold">{recipe.fat}g</div>
              <div className="text-xs text-muted-foreground">Fat</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">Ingredients</h3>
          <ul className="space-y-2">
            {(recipe.ingredients as string[]).map((ingredient, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-primary mt-1.5">•</span>
                <span>{ingredient}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold mb-4">Instructions</h3>
          <ol className="space-y-4">
            {(recipe.instructions as string[]).map((instruction, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{instruction}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Tags */}
      {recipe.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag: string, idx: number) => (
            <Badge key={idx} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

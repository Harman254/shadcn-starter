import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChefHat, Clock, Users, Flame } from "lucide-react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Image from "next/image"

export default async function SavedRecipesPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  // Fetch saved recipes from database
  const recipes = await prisma.recipe.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return (
    <div className="container min-h-screen mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <ChefHat className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">My Saved Recipes</h1>
        </div>
        <p className="text-muted-foreground">
          {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} saved from chat
        </p>
      </div>

      {/* Recipes Grid */}
      {recipes.length === 0 ? (
        <div className="text-center py-16">
          <ChefHat className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No saved recipes yet</h3>
          <p className="text-muted-foreground mb-4">
            Ask the AI for recipes in chat and save them here!
          </p>
          <Button asChild>
            <a href="/chat">Go to Chat</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe: any) => (
            <Card key={recipe.id} className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow">
              {/* Recipe Image */}
              <div className="relative h-48 w-full bg-muted">
                <Image
                  src={recipe.imageUrl || 'https://res.cloudinary.com/dcidanigq/image/upload/v1742111994/samples/food/fish-vegetables.jpg'}
                  alt={recipe.name}
                  fill
                  className="object-cover"
                />
              </div>

              <CardHeader>
                <h3 className="text-xl font-bold line-clamp-2">{recipe.name}</h3>
                {recipe.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {recipe.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="flex-1">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{recipe.prepTime || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{recipe.servings} servings</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Flame className="h-4 w-4 text-muted-foreground" />
                    <span>{recipe.calories} cal</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary">{recipe.difficulty}</Badge>
                  </div>
                </div>

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.tags.slice(0, 3).map((tag: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {recipe.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{recipe.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>

              <CardFooter>
                <Button className="w-full" asChild>
                  <a href={`/recipes/${recipe.id}`}>View Recipe</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

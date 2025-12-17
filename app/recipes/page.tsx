import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChefHat, Clock, Users, Flame, Loader2 } from "lucide-react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import Image from "next/image"
import { CldImage } from 'next-cloudinary'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading recipes...</p>
      </div>
    </div>
  );
}

async function RecipesContent() {
  let session;
  try {
    session = await auth.api.getSession({
      headers: await headers()
    });
  } catch (error) {
    console.error('[Recipes Page] Error fetching session:', error);
    redirect('/sign-in');
  }

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  // Fetch saved recipes from database with error handling
  let recipes: any[] = [];
  try {
    recipes = await prisma.recipe.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  } catch (error) {
    console.error('[Recipes Page] Error fetching recipes:', error);
    // Return empty array on error - page will show empty state
    recipes = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header - Enhanced design */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <ChefHat className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              My Saved Recipes
            </h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground ml-12 sm:ml-14">
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} saved from chat
          </p>
        </div>

      {/* Recipes Grid - Enhanced responsive design */}
      {recipes.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted/50 mb-4 sm:mb-6">
            <ChefHat className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold mb-2">No saved recipes yet</h3>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">
            Ask the AI for recipes in chat and save them here!
          </p>
          <Button asChild className="rounded-xl">
            <a href="/chat">Go to Chat</a>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {recipes.map((recipe: any, index: number) => (
            <Card 
              key={recipe.id} 
              className="group overflow-hidden flex flex-col bg-card/80 backdrop-blur-sm border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-up opacity-0"
              style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
            >
              {/* Recipe Image - Enhanced with hover effect and proper image handling */}
              <div className="relative h-48 sm:h-56 w-full bg-muted overflow-hidden">
                {recipe.imageUrl && recipe.imageUrl.trim() && recipe.imageUrl.includes('cloudinary.com') ? (
                  <CldImage
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    width={800}
                    height={600}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : recipe.imageUrl && recipe.imageUrl.trim() ? (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg';
                    }}
                  />
                ) : (
                  <Image
                    src="https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg"
                    alt={recipe.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <CardHeader className="pb-3">
                <h3 className="text-lg sm:text-xl font-bold line-clamp-2 group-hover:text-primary transition-colors">
                  {recipe.name}
                </h3>
                {recipe.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                    {recipe.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="flex-1 pt-0">
                {/* Quick Stats - Enhanced design */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm p-2 rounded-lg bg-muted/50">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{recipe.prepTime || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm p-2 rounded-lg bg-muted/50">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">{recipe.servings} servings</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm p-2 rounded-lg bg-muted/50">
                    <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500 flex-shrink-0" />
                    <span className="truncate">{recipe.calories} cal</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    <Badge variant="secondary" className="w-full justify-center">{recipe.difficulty || 'Medium'}</Badge>
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

              <CardFooter className="pt-4">
                <Button className="w-full rounded-xl" asChild>
                  <a href={`/recipes/${recipe.id}`}>View Recipe</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}

export default function SavedRecipesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RecipesContent />
    </Suspense>
  );
}

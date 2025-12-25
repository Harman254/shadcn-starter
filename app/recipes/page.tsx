import { ChefHat } from "lucide-react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Suspense } from 'react'
import { RecipesGrid } from './components/recipes-grid'
import { LoadingFallback } from './components/loading-fallback'
import { RecipeImport } from '@/components/recipes/recipe-import'

export const dynamic = 'force-dynamic'
export const revalidate = 60

async function RecipesContent() {
  let session
  try {
    session = await auth.api.getSession({
      headers: await headers()
    })
  } catch (error) {
    console.error('[Recipes Page] Error fetching session:', error)
    redirect('/sign-in')
  }

  if (!session?.user?.id) {
    redirect('/sign-in')
  }

  // Fetch saved recipes from database with error handling
  let recipes: any[] = []
  try {
    recipes = await prisma.recipe.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
  } catch (error) {
    console.error('[Recipes Page] Error fetching recipes:', error)
    recipes = []
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Header - Enhanced */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            <div className="p-2.5 sm:p-3 rounded-xl bg-primary/10 text-primary transition-transform hover:scale-110">
              <ChefHat className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              My Saved Recipes
            </h1>
          </div>
          <p className="text-base sm:text-lg text-muted-foreground ml-12 sm:ml-14">
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} saved from chat
          </p>
        </div>

        {/* Recipe Import Section */}
        <div className="mb-8 sm:mb-10">
          <RecipeImport />
        </div>

        {/* Recipes Grid - Client Component */}
        <RecipesGrid recipes={recipes} />
      </div>
    </div>
  )
}

const Index = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RecipesContent />
    </Suspense>
  )
}

export default Index

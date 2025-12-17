'use client'

import { RecipeCard } from './recipe-card'

interface Recipe {
  id: string
  name: string
  description?: string | null
  imageUrl?: string | null
  prepTime?: string | null
  servings: number
  calories: number
  difficulty?: string | null
  tags?: string[] | null
}

interface RecipesGridProps {
  recipes: Recipe[]
}

export function RecipesGrid({ recipes }: RecipesGridProps) {
  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-muted/50 mb-4 sm:mb-6">
          <svg className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold mb-2">No saved recipes yet</h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 max-w-md mx-auto">
          Ask the AI for recipes in chat and save them here!
        </p>
        <a 
          href="/chat" 
          className="inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition-colors"
        >
          Go to Chat
        </a>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  )
}


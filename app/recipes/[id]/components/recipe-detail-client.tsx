'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Flame, ArrowLeft, ChefHat, Timer, Zap } from "lucide-react"
import Image from "next/image"
import { CldImage } from 'next-cloudinary'
import { cn } from "@/lib/utils"

interface Recipe {
  id: string
  name: string
  description?: string | null
  imageUrl?: string | null
  prepTime?: string | null
  cookTime?: string | null
  servings: number
  calories: number
  protein: number
  carbs: number
  fat: number
  difficulty?: string | null
  ingredients: string[]
  instructions: string[]
  tags?: string[] | null
}

interface RecipeDetailClientProps {
  recipe: Recipe
}

export function RecipeDetailClient({ recipe }: RecipeDetailClientProps) {
  const imageUrl = recipe.imageUrl?.trim() || 'https://res.cloudinary.com/dcidanigq/image/upload/v1742111994/samples/food/fish-vegetables.jpg'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-4 py-8 sm:px-6 sm:py-10 lg:px-8 max-w-5xl">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6 hover:bg-primary/10 transition-colors">
          <a href="/recipes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recipes
          </a>
        </Button>

        {/* Recipe Header */}
        <div className="relative h-64 sm:h-80 md:h-96 lg:h-[28rem] w-full rounded-2xl overflow-hidden mb-8 sm:mb-10">
        {!imageUrl || imageUrl === '' ? (
          <Image
            src="https://res.cloudinary.com/dcidanigq/image/upload/v1742111994/samples/food/fish-vegetables.jpg"
            alt={recipe.name}
            fill
            className="object-cover"
          />
        ) : imageUrl.includes('cloudinary.com') ? (
          <CldImage
            src={imageUrl}
            alt={recipe.name}
            fill
            className="object-cover"
          />
        ) : (
          <Image
            src={imageUrl}
            alt={recipe.name}
            fill
            className="object-cover"
          />
        )}
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

      {/* Recipe Info - Enhanced with glassmorphism and icons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-5 mb-8 sm:mb-10">
        <div className="group relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-5 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:via-primary/0 group-hover:to-accent/5 transition-all duration-500 pointer-events-none" />
          <div className="relative flex flex-col items-center text-center">
            <div className="rounded-xl p-2.5 sm:p-3 bg-primary/10 text-primary mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-1">{recipe.servings}</div>
            <div className="text-xs sm:text-sm font-medium text-muted-foreground">Servings</div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-5 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:via-primary/0 group-hover:to-accent/5 transition-all duration-500 pointer-events-none" />
          <div className="relative flex flex-col items-center text-center">
            <div className="rounded-xl p-2.5 sm:p-3 bg-blue-500/10 text-blue-500 mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Timer className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-1">{recipe.prepTime || 'N/A'}</div>
            <div className="text-xs sm:text-sm font-medium text-muted-foreground">Prep Time</div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-5 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:via-primary/0 group-hover:to-accent/5 transition-all duration-500 pointer-events-none" />
          <div className="relative flex flex-col items-center text-center">
            <div className="rounded-xl p-2.5 sm:p-3 bg-orange-500/10 text-orange-500 mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-1">{recipe.cookTime || 'N/A'}</div>
            <div className="text-xs sm:text-sm font-medium text-muted-foreground">Cook Time</div>
          </div>
        </div>
        
        <div className="group relative overflow-hidden rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-5 sm:p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/5 group-hover:via-primary/0 group-hover:to-accent/5 transition-all duration-500 pointer-events-none" />
          <div className="relative flex flex-col items-center text-center">
            <div className="rounded-xl p-2.5 sm:p-3 bg-purple-500/10 text-purple-500 mb-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-1">{recipe.difficulty || 'N/A'}</div>
            <div className="text-xs sm:text-sm font-medium text-muted-foreground">Difficulty</div>
          </div>
        </div>
      </div>

      {/* Nutrition - Enhanced */}
      <Card className="mb-8 sm:mb-10 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="rounded-xl p-2 bg-orange-500/10 text-orange-500">
              <Flame className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span>Nutrition (per serving)</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{recipe.calories}</div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">Calories</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{recipe.protein}g</div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">Protein</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{recipe.carbs}g</div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">Carbs</div>
            </div>
            <div className="text-center p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">{recipe.fat}g</div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">Fat</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients - Enhanced */}
      <Card className="mb-8 sm:mb-10 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="rounded-xl p-2 bg-green-500/10 text-green-500">
              <ChefHat className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span>Ingredients</span>
          </h3>
          <ul className="space-y-3 sm:space-y-4">
            {recipe.ingredients.map((ingredient, idx) => (
              <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <span className="text-primary mt-1 font-bold text-lg">•</span>
                <span className="text-base sm:text-lg text-foreground/90 flex-1">{ingredient}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Instructions - Enhanced */}
      <Card className="mb-8 sm:mb-10 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6 sm:p-8">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
            <div className="rounded-xl p-2 bg-blue-500/10 text-blue-500">
              <ChefHat className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span>Instructions</span>
          </h3>
          <ol className="space-y-4 sm:space-y-5">
            {recipe.instructions.map((instruction, idx) => (
              <li key={idx} className="flex gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <span className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm sm:text-base font-bold shadow-md">
                  {idx + 1}
                </span>
                <span className="pt-1 text-base sm:text-lg text-foreground/90 leading-relaxed flex-1">{instruction}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Tags - Enhanced */}
      {recipe.tags && recipe.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
          {recipe.tags.map((tag: string, idx: number) => (
            <Badge 
              key={idx} 
              variant="secondary" 
              className="text-sm sm:text-base px-3 py-1.5 hover:bg-primary/20 hover:text-primary transition-colors cursor-default"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}


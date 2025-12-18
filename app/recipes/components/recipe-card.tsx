'use client'

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Flame } from "lucide-react"
import Image from "next/image"
import { CldImage } from 'next-cloudinary'

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

interface RecipeCardProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const imageUrl = recipe.imageUrl?.trim() || ''
  const fallbackUrl = 'https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg'
  
  return (
    <Card className="group overflow-hidden flex flex-col bg-card/80 backdrop-blur-sm border border-border/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Recipe Image */}
      <div className="relative h-48 sm:h-56 w-full bg-muted overflow-hidden">
        {!imageUrl || imageUrl === '' ? (
          <Image
            src={fallbackUrl}
            alt={recipe.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : imageUrl.includes('cloudinary.com') ? (
          <CldImage
            src={imageUrl}
            alt={recipe.name}
            width={800}
            height={600}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <Image
            src={imageUrl}
            alt={recipe.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <CardHeader className="pb-4">
        <h3 className="text-xl sm:text-2xl font-bold line-clamp-2 group-hover:text-primary transition-colors leading-tight">
          {recipe.name}
        </h3>
        {recipe.description && (
          <p className="text-sm sm:text-base text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
            {recipe.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 pt-0">
        {/* Quick Stats - Enhanced */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-5">
          <div className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-base p-2.5 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500 flex-shrink-0" />
            <span className="truncate font-medium text-foreground/90">{recipe.prepTime || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-base p-2.5 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
            <span className="truncate font-medium text-foreground/90">{recipe.servings} servings</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5 text-sm sm:text-base p-2.5 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
            <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 flex-shrink-0" />
            <span className="truncate font-medium text-foreground/90">{recipe.calories} cal</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <Badge variant="secondary" className="w-full justify-center text-sm sm:text-base px-3 py-1.5 hover:bg-primary/20 transition-colors">
              {recipe.difficulty || 'Medium'}
            </Badge>
          </div>
        </div>

        {/* Tags - Enhanced */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {recipe.tags.slice(0, 3).map((tag: string, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs sm:text-sm px-2.5 py-1 hover:bg-primary/10 hover:border-primary/50 transition-colors">
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 3 && (
              <Badge variant="outline" className="text-xs sm:text-sm px-2.5 py-1 hover:bg-primary/10 hover:border-primary/50 transition-colors">
                +{recipe.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-5">
        <Button className="w-full rounded-xl text-sm sm:text-base font-semibold h-11 hover:shadow-lg transition-all" asChild>
          <a href={`/recipes/${recipe.id}`}>View Recipe</a>
        </Button>
      </CardFooter>
    </Card>
  )
}


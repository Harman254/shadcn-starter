"use client"

import { motion } from "framer-motion"
import { Clock, Wand2, ChefHat, ArrowRight, Star, Flame, ExternalLink, Search, Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useMemo } from "react"

interface MealSuggestionsProps {
  results: any[]
  title?: string
  onActionClick?: (action: string) => void
}

// Random Unsplash food images for variety
const RANDOM_FOOD_IMAGES = [
  "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop",
]

/**
 * Get a random food image from Unsplash
 * Uses index-based selection for consistency across renders
 */
function getRandomFoodImage(index: number): string {
  return RANDOM_FOOD_IMAGES[index % RANDOM_FOOD_IMAGES.length]
}

export function MealSuggestions({ results, title, onActionClick }: MealSuggestionsProps) {
  if (!results?.length) return null

  // Check if this is from a search (has sourceUrl) vs AI generated
  const isFromSearch = results.some(r => r.sourceUrl)

  // Assign random images to recipes that don't have images
  const recipesWithImages = useMemo(() => {
    return results.map((recipe, index) => ({
      ...recipe,
      imageUrl: recipe.imageUrl || getRandomFoodImage(index)
    }))
  }, [results])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className={cn(
            "p-2.5 rounded-xl",
            isFromSearch 
              ? "bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800" 
              : "bg-primary/10 border border-primary/20"
          )}>
            {isFromSearch ? (
              <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            ) : (
              <ChefHat className="h-5 w-5 text-primary" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              {title || (isFromSearch ? "Search Results" : "Recipe Suggestions")}
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm text-muted-foreground">{results.length} recipes found</span>
              {isFromSearch && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <Globe className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">Web Search</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipesWithImages.map((recipe: any, idx: number) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ y: -2 }}
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-xl",
              "bg-card border border-border",
              "hover:border-primary/50 hover:shadow-lg",
              "transition-all duration-200",
              "cursor-pointer"
            )}
            onClick={() => onActionClick?.(`Give me the full recipe for ${recipe.name}`)}
          >
            {/* Hero Image */}
            <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = getRandomFoodImage(Math.floor(Math.random() * RANDOM_FOOD_IMAGES.length));
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
              
              {/* Floating Badges */}
              <div className="absolute top-2 right-2 flex flex-col gap-2">
                {recipe.rating && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/20 text-xs font-medium text-amber-400">
                    <Star className="h-3 w-3 fill-amber-400" /> {recipe.rating}
                  </div>
                )}
              </div>
              
              {/* Bottom Badges */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
                {recipe.calories && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/20 text-[10px] font-medium text-white">
                    <Flame className="h-3 w-3 text-orange-400" /> {recipe.calories} kcal
                  </div>
                )}
                {recipe.totalTime && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm border border-white/20 text-[10px] font-medium text-white">
                    <Clock className="h-3 w-3 text-blue-400" /> {recipe.totalTime}
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 flex flex-col gap-2">
              <div>
                <h3 className="font-semibold text-base text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-1">
                  {recipe.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                  {recipe.description || "A delicious culinary experience tailored just for you."}
                </p>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Actions Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-3 mt-auto">
                {recipe.sourceUrl ? (
                  <a
                    href={recipe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                    <span className="max-w-[80px] truncate">{new URL(recipe.sourceUrl).hostname.replace('www.', '')}</span>
                  </a>
                ) : (
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Original Recipe</span>
                )}

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onActionClick?.(`Give me the full recipe for ${recipe.name}`);
                  }}
                >
                  View
                  <ArrowRight className="h-3 w-3 ml-1.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

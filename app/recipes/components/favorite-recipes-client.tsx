"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, Search, Filter, ChefHat } from "lucide-react"
import toast from "react-hot-toast"

interface FavoriteRecipe {
  id: string
  name: string
  description: string
  imageUrl?: string
  type: string
  calories: number
  ingredients: string[]
  dayMeal: {
    mealPlan: {
      userId: string
    }
  }
}

interface FavoriteRecipesClientProps {
  initialFavorites: FavoriteRecipe[]
}

export function FavoriteRecipesClient({ initialFavorites }: FavoriteRecipesClientProps) {
  const [recipes, setRecipes] = useState<FavoriteRecipe[]>(initialFavorites)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRecipes, setFilteredRecipes] = useState<FavoriteRecipe[]>(initialFavorites)

  // Filter recipes based on search term
  useEffect(() => {
    const filtered = recipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.ingredients.some((ingredient) => 
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        ),
    )
    setFilteredRecipes(filtered)
  }, [searchTerm, recipes])

  const handleUnlike = async (recipeId: string) => {
    // Optimistic update - remove from UI immediately
    const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId)
    setRecipes(updatedRecipes)

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          mealId: recipeId, 
          action: 'remove' 
        }),
      })

      if (response.ok) {
        toast.success('Recipe removed from favorites')
      } else {
        // Revert optimistic update on error
        setRecipes(recipes)
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to remove from favorites')
      }
    } catch (error) {
      // Revert optimistic update on network error
      setRecipes(recipes)
      console.error('Error removing from favorites:', error)
      toast.error('Failed to remove from favorites')
    }
  }

  const getMealTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "breakfast":
        return "bg-orange-100 text-orange-800"
      case "lunch":
        return "bg-blue-100 text-blue-800"
      case "dinner":
        return "bg-purple-100 text-purple-800"
      case "snack":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCalories = (calories: number) => {
    return `${calories} cal`
  }

  return (
    <>
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search recipes, ingredients, or meal types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Results count */}
      {searchTerm && (
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? "s" : ""} found
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>
      )}

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No recipes found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? "Try adjusting your search terms" : "Start liking some recipes to see them here!"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecipes.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="p-0">
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                    <ChefHat className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => handleUnlike(recipe.id)}
                  >
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg leading-tight">{recipe.name}</h3>
                  <Badge variant="secondary" className={`text-xs ${getMealTypeColor(recipe.type)}`}>
                    {recipe.type}
                  </Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{recipe.description}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <ChefHat className="h-4 w-4" />
                    <span>{formatCalories(recipe.calories)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {ingredient}
                    </Badge>
                  ))}
                  {recipe.ingredients.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{recipe.ingredients.length - 3} more
                    </Badge>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button className="w-full">View Recipe</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  )
} 
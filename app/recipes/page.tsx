"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Users, ChefHat, Heart, Search, Filter } from "lucide-react"
import Image from "next/image"

interface Recipe {
  id: string
  title: string
  description: string
  image: string
  cookTime: number
  servings: number
  difficulty: "Easy" | "Medium" | "Hard"
  rating: number
  author: {
    name: string
    avatar: string
  }
  tags: string[]
  likedAt: string
}

// Mock data for liked recipes
const mockLikedRecipes: Recipe[] = [
  {
    id: "1",
    title: "Creamy Garlic Parmesan Pasta",
    description:
      "A rich and creamy pasta dish with garlic, parmesan, and fresh herbs that's perfect for weeknight dinners.",
    image: "/placeholder.svg?height=200&width=300",
    cookTime: 25,
    servings: 4,
    difficulty: "Easy",
    rating: 4.8,
    author: {
      name: "Maria Rodriguez",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    tags: ["Pasta", "Italian", "Vegetarian"],
    likedAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Honey Glazed Salmon",
    description: "Perfectly flaky salmon with a sweet and savory honey glaze, served with roasted vegetables.",
    image: "/placeholder.svg?height=200&width=300",
    cookTime: 20,
    servings: 2,
    difficulty: "Medium",
    rating: 4.9,
    author: {
      name: "Chef David Kim",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    tags: ["Seafood", "Healthy", "Gluten-Free"],
    likedAt: "2024-01-12",
  },
  {
    id: "3",
    title: "Classic Chocolate Chip Cookies",
    description: "Soft, chewy chocolate chip cookies that are crispy on the edges and gooey in the center.",
    image: "/placeholder.svg?height=200&width=300",
    cookTime: 15,
    servings: 24,
    difficulty: "Easy",
    rating: 4.7,
    author: {
      name: "Sarah Johnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    tags: ["Dessert", "Baking", "Sweet"],
    likedAt: "2024-01-10",
  },
  {
    id: "4",
    title: "Thai Green Curry",
    description: "Authentic Thai green curry with coconut milk, fresh vegetables, and aromatic herbs and spices.",
    image: "/placeholder.svg?height=200&width=300",
    cookTime: 35,
    servings: 4,
    difficulty: "Hard",
    rating: 4.6,
    author: {
      name: "Ploy Thanakit",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    tags: ["Thai", "Spicy", "Curry"],
    likedAt: "2024-01-08",
  },
  {
    id: "5",
    title: "Mediterranean Quinoa Bowl",
    description: "A healthy and colorful bowl packed with quinoa, fresh vegetables, feta cheese, and tahini dressing.",
    image: "/placeholder.svg?height=200&width=300",
    cookTime: 30,
    servings: 2,
    difficulty: "Easy",
    rating: 4.5,
    author: {
      name: "Elena Papadopoulos",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    tags: ["Healthy", "Mediterranean", "Vegetarian"],
    likedAt: "2024-01-05",
  },
  {
    id: "6",
    title: "BBQ Pulled Pork Sandwich",
    description: "Slow-cooked pulled pork with tangy BBQ sauce, served on brioche buns with coleslaw.",
    image: "/placeholder.svg?height=200&width=300",
    cookTime: 480,
    servings: 8,
    difficulty: "Medium",
    rating: 4.8,
    author: {
      name: "Jake Thompson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    tags: ["BBQ", "Pork", "American"],
    likedAt: "2024-01-03",
  },
]

export default function LikedRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([])

  // Simulate fetching liked recipes
  useEffect(() => {
    const fetchLikedRecipes = async () => {
      setLoading(true)
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setRecipes(mockLikedRecipes)
      setFilteredRecipes(mockLikedRecipes)
      setLoading(false)
    }

    fetchLikedRecipes()
  }, [])

  // Filter recipes based on search term
  useEffect(() => {
    const filtered = recipes.filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        recipe.author.name.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredRecipes(filtered)
  }, [searchTerm, recipes])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-green-100 text-green-800"
      case "Medium":
        return "bg-yellow-100 text-yellow-800"
      case "Hard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCookTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your favorite recipes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-6 w-6 text-red-500 fill-current" />
          <h1 className="text-3xl font-bold">My Favorite Recipes</h1>
        </div>
        <p className="text-muted-foreground">
          {recipes.length} recipe{recipes.length !== 1 ? "s" : ""} you have liked
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search recipes, tags, or authors..."
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
                  <Image
                    src={recipe.image || "/placeholder.svg"}
                    alt={recipe.title}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                  <Button size="icon" variant="secondary" className="absolute top-2 right-2 h-8 w-8">
                    <Heart className="h-4 w-4 text-red-500 fill-current" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg leading-tight">{recipe.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground ml-2">
                    <span>★</span>
                    <span>{recipe.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{recipe.description}</p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatCookTime(recipe.cookTime)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{recipe.servings}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ChefHat className="h-4 w-4" />
                    <Badge variant="secondary" className={`text-xs ${getDifficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {recipe.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={recipe.author.avatar || "/placeholder.svg"} alt={recipe.author.name} />
                    <AvatarFallback>
                      {recipe.author.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{recipe.author.name}</span>
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button className="w-full">View Recipe</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

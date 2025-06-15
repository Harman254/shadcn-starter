import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, ChefHat } from "lucide-react"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getUserFavorites } from "@/data"
import { redirect } from "next/navigation"
import { FavoriteRecipesClient } from "./components/favorite-recipes-client"
import { unstable_cache as useCache } from 'next/cache'

// Cache the favorites data with a tag for efficient revalidation
const getCachedFavorites = useCache(
  async (userId: string) => {
    return await getUserFavorites(userId);
  },
  ['user-favorites'],
  {
    tags: ['favorites'],
    revalidate: 60, // Revalidate every 60 seconds as fallback
  }
);

export default async function LikedRecipesPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const favorites = await getCachedFavorites(session.user.id);

  return (
    <div className="container min-h-screen mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="h-6 w-6 text-red-500 fill-current" />
          <h1 className="text-3xl font-bold">My Favorite Recipes</h1>
        </div>
        <p className="text-muted-foreground">
          {favorites.length} recipe{favorites.length !== 1 ? "s" : ""} you have liked
        </p>
      </div>

      {/* Client component for interactive features */}
      <FavoriteRecipesClient initialFavorites={favorites} />
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

interface MealLikeButtonProps {
  initialIsLiked?: boolean;
  onLikeToggle?: (isLiked: boolean) => void;
  mealId: string;
}

const MealLikeButton = ({ initialIsLiked = false, onLikeToggle, mealId }: MealLikeButtonProps) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Fetch initial like status from API
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (!mealId) return;
      
      try {
        setIsLoading(true)
        const response = await fetch(`/api/meals/${mealId}/like`)
        if (response.ok) {
          const data = await response.json()
          setIsLiked(data.isLiked)
        } else if (response.status === 401) {
          // User not authenticated, keep initial state
          console.log('User not authenticated for like status')
        } else {
          console.error('Failed to fetch like status:', response.status)
        }
      } catch (error) {
        console.error('Error fetching like status:', error)
        // Keep initial state on error
      } finally {
        setIsLoading(false)
        setIsInitialized(true)
      }
    }

    fetchLikeStatus()
  }, [mealId])

  const handleLikeToggle = async () => {
    if (!mealId || isLoading) return;
    
    const newLikedState = !isLiked
    
    // Optimistic update - update UI immediately
    setIsLiked(newLikedState)
    if (onLikeToggle) {
      onLikeToggle(newLikedState)
    }

    try {
      const response = await fetch(`/api/meals/${mealId}/like`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isLiked: newLikedState }),
      })

      if (response.ok) {
        toast.success(newLikedState ? 'Meal liked!' : 'Meal unliked!')
      } else {
        // Revert optimistic update on error
        setIsLiked(!newLikedState)
        if (onLikeToggle) {
          onLikeToggle(!newLikedState)
        }
        
        if (response.status === 401) {
          toast.error('Please sign in to like meals')
        } else {
          const errorData = await response.json()
          toast.error(errorData.error || 'Failed to update like status')
        }
      }
    } catch (error) {
      // Revert optimistic update on network error
      setIsLiked(!newLikedState)
      if (onLikeToggle) {
        onLikeToggle(!newLikedState)
      }
      
      console.error('Error updating like status:', error)
      toast.error('Failed to update like status')
    }
  }

  // Don't render until we've fetched the initial state
  if (!isInitialized) {
    return (
      <Button
        variant="secondary"
        size="sm"
        disabled
        className="rounded-full p-2 opacity-50"
      >
        <Heart className="h-5 w-5 animate-pulse" />
        Like
      </Button>
    )
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleLikeToggle}
      disabled={isLoading}
      className={cn(
        "rounded-full p-2 transition-colors duration-200",
        isLiked
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
          : "text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
      aria-label={isLiked ? "Unlike meal" : "Like meal"}
    >
      <Heart
        className={cn(
          "h-5 w-5 fill-current transition-all duration-200",
          isLiked ? "fill-red-500" : "fill-none",
          isLoading && "animate-spin"
        )}
      />

      {isLiked ? "Liked" : "Like"}  
    </Button>
  )
}

export default MealLikeButton

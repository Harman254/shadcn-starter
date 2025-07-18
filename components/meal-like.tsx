"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"
import { useMealLikeStore } from "./meal-like-store"

interface MealLikeButtonProps {
  initialIsLiked?: boolean;
  onLikeToggle?: (isLiked: boolean) => void;
  mealId: string;
}

const MealLikeButton = ({ initialIsLiked = false, onLikeToggle, mealId }: MealLikeButtonProps) => {
  const { likes, toggleLike } = useMealLikeStore();
  const isLiked = likes[mealId];
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // If like status is present in store, consider initialized
    if (typeof isLiked === 'boolean') {
      setIsInitialized(true);
    }
  }, [isLiked]);

  // Trigger pop animation on like toggle
  useEffect(() => {
    if (isInitialized) {
      setAnimate(true);
      const timeout = setTimeout(() => setAnimate(false), 250);
      return () => clearTimeout(timeout);
    }
  }, [isLiked, isInitialized]);

  const handleLikeToggle = async () => {
    if (!mealId || isLoading) return;
    const newLikedState = !isLiked;
    // Optimistic update
    toggleLike(mealId, newLikedState);
    if (onLikeToggle) onLikeToggle(newLikedState);
    setIsLoading(true);
    try {
      const response = await fetch(`/api/meals/${mealId}/like`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isLiked: newLikedState }),
      });
      if (response.ok) {
        toast.success(newLikedState ? 'Meal liked!' : 'Meal unliked!');
      } else {
        // Revert optimistic update on error
        toggleLike(mealId, !newLikedState);
        if (onLikeToggle) onLikeToggle(!newLikedState);
        if (response.status === 401) {
          toast.error('Please sign in to like meals');
        } else {
          const errorData = await response.json();
          toast.error(errorData.error || 'Failed to update like status');
        }
      }
    } catch (error) {
      toggleLike(mealId, !newLikedState);
      if (onLikeToggle) onLikeToggle(!newLikedState);
      console.error('Error updating like status:', error);
      toast.error('Failed to update like status');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <Button
        variant="secondary"
        size="sm"
        disabled
        className="rounded-full p-2 opacity-50"
        aria-label="Loading like button"
      >
        <Heart className="h-5 w-5 animate-pulse" />
        Like
      </Button>
    );
  }

  return (
    <button
      onClick={handleLikeToggle}
      disabled={isLoading || !isInitialized}
      className={cn(
        "p-1.5 sm:p-2 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2",
        isLiked
          ? "bg-red-50 dark:bg-red-950 text-red-500 focus:ring-red-500"
          : "bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-red-400 focus:ring-gray-500",
        (isLoading || !isInitialized) && "opacity-50 cursor-not-allowed"
      )}
      aria-label={isLiked ? "Unlike meal" : "Like meal"}
      aria-pressed={isLiked}
      type="button"
    >
      <Heart className={cn(
        "w-5 h-5",
        isLiked ? "fill-current" : "",
        isLoading ? "animate-pulse" : ""
      )} />
    </button>
  );
}

export default MealLikeButton

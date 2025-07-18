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
    <Button
      onClick={handleLikeToggle}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-base shadow transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1DCD9F]",
        isLiked
          ? "bg-[#1DCD9F] text-white shadow-lg hover:bg-[#169976]"
          : "bg-white text-red-500 border border-slate-200 hover:bg-slate-100 dark:bg-[#222222] dark:text-red-400 dark:border-slate-700 dark:hover:bg-slate-800",
        isLoading && "opacity-50 cursor-not-allowed"
      )}
      aria-label={isLiked ? "Unlike meal" : "Like meal"}
      tabIndex={0}
      type="button"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Heart
          className={cn(
            "h-5 w-5 transition-all duration-200",
            isLiked ? "fill-white" : "fill-none",
            animate && "scale-125",
            isLiked ? "stroke-white" : "stroke-red-500"
          )}
        />
      )}
      <span className="ml-1">
        {isLiked ? "Liked" : "Like"}
      </span>
    </Button>
  );
}

export default MealLikeButton

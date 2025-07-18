"use client";

import React from "react";
import { useTransition, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MealActionsProps } from "../components/types";
import { Loader2, Crown, Lock, Zap } from "lucide-react";
import { useProFeatures, PRO_FEATURES } from "@/hooks/use-pro-features";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useMealSwapStore } from "@/components/meal-swap-store";
import { cn } from "@/lib/utils";

// Helper function to get the start of the current week (Monday)
const getWeekStart = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, Monday = 1
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Helper function to get the week key (YYYY-MM-DD format for Monday)
const getWeekKey = () => {
  const weekStart = getWeekStart();
  return weekStart.toISOString().split('T')[0];
};

export const MealActions = ({ onViewRecipe, onSwapMeal }: MealActionsProps) => {
  const [isPending, startTransition] = useTransition();
  const { hasFeature, unlockFeature, getFeatureBadge } = useProFeatures();
  const router = useRouter();
  const { data: session } = useSession();
  const { swapCount, maxSwaps, loading, fetchSwapCount, incrementSwapCount } = useMealSwapStore();

  // Fetch swap count on mount if not loaded
  useEffect(() => {
    if (session?.user?.id && swapCount === 0 && !loading) {
      fetchSwapCount();
    }
  }, [session?.user?.id]);

  const handleSwap = async () => {
    const isUnlimitedSwaps = hasFeature("unlimited-meal-plans");
    if (isUnlimitedSwaps) {
      startTransition(() => {
        onSwapMeal();
      });
      return;
    }
    if (swapCount >= maxSwaps) {
      toast.error("You've reached your weekly swap limit! Upgrade to Pro for unlimited swaps.", {
        duration: 4000,
        icon: "👑"
      });
      unlockFeature(PRO_FEATURES["unlimited-meal-plans"]);
      return;
    }
    startTransition(async () => {
      try {
        const response = await fetch("/api/meal-swaps", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "validate-and-increment" }),
        });
        const data = await response.json();
        if (response.ok) {
          onSwapMeal();
          incrementSwapCount();
        } else {
          console.error("Failed to swap meal:", data.error);
          if (data.error === "Swap limit reached") {
            toast.error("You've reached your weekly swap limit! Upgrade to Pro for unlimited swaps.", {
              duration: 4000,
              icon: "👑"
            });
            unlockFeature(PRO_FEATURES["unlimited-meal-plans"]);
          } else {
            toast.error("Failed to swap meal. Please try again.");
          }
        }
      } catch (error) {
        console.error("Error during meal swap:", error);
        toast.error("Error swapping meal. Check your connection.");
      }
    });
  };

  const isUnlimitedSwaps = hasFeature("unlimited-meal-plans");
  const currentMaxSwaps = isUnlimitedSwaps ? Infinity : maxSwaps;
  const swapsRemaining = Math.max(0, currentMaxSwaps - swapCount);
  const canSwap = isUnlimitedSwaps || swapsRemaining > 0;

  // Get next reset date (next Monday) - adjusted to match backend's Sunday start of week
  const getNextResetDate = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 for Sunday, 1 for Monday...
    const daysToNextSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek; 
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysToNextSunday);
    return nextSunday;
  };

  const nextResetDate = getNextResetDate();

  return (
    <div className="flex flex-col gap-3 lg:min-w-[160px]">
      <Button
        onClick={onViewRecipe}
        className={cn(
          "inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-base shadow transition-all duration-200",
          "bg-[#1DCD9F] text-white shadow-lg hover:bg-[#169976] focus-visible:ring-2 focus-visible:ring-[#1DCD9F] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        View Recipe
      </Button>

      <div className="space-y-2">
        <Button
          variant="outline"
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-base shadow transition-all duration-200",
            "border border-[#1DCD9F] text-[#1DCD9F] bg-white hover:bg-[#EAFBF7] dark:bg-[#222222] dark:hover:bg-[#1DCD9F]/10 dark:text-[#1DCD9F] dark:border-[#1DCD9F]"
          )}
          onClick={handleSwap}
          disabled={isPending || !canSwap}
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Swapping...
            </>
          ) : (
            <>
              <Zap className="h-5 w-5 mr-2" />
              Swap Meal
            </>
          )}
        </Button>

        {/* Swap Limit Indicator */}
        {!isUnlimitedSwaps && (swapCount < maxSwaps || swapsRemaining > 0) && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Swaps remaining:</span>
              <div className="flex items-center gap-1">
                <span className={`font-semibold ${swapsRemaining <= 1 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                  {swapsRemaining}
                </span>
                <span>/ {maxSwaps}</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-500">
              Resets {nextResetDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>
          </div>
        )}

        {/* Pro Badge for Unlimited Users */}
        {isUnlimitedSwaps && (
          <div className="flex items-center justify-center">
            {getFeatureBadge(PRO_FEATURES["unlimited-meal-plans"])}
          </div>
        )}

        {/* Upgrade Prompt for Free Users */}
        {!isUnlimitedSwaps && swapsRemaining === 0 && (
          <div className="p-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-xs">
              <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span className="text-amber-700 dark:text-amber-300 font-medium">
                No swaps left this week!
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-1 h-6 text-xs bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300"
              onClick={() => unlockFeature(PRO_FEATURES["unlimited-meal-plans"])}
            >
              <Crown className="w-3 h-3 mr-1" />
              Upgrade to Pro
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealActions;

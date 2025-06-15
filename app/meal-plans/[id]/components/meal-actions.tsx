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

export const MealActions = ({ onViewRecipe, onSwapMeal }: MealActionsProps) => {
  const [isPending, startTransition] = useTransition();
  const [swapCount, setSwapCount] = useState(0);
  const { hasFeature, unlockFeature, getFeatureBadge } = useProFeatures();
  const router = useRouter();

  // Load swap count from localStorage
  useEffect(() => {
    const savedSwapCount = localStorage.getItem("meal-swap-count");
    if (savedSwapCount) {
      setSwapCount(parseInt(savedSwapCount, 10));
    }
  }, []);

  // Save swap count to localStorage
  const updateSwapCount = (newCount: number) => {
    setSwapCount(newCount);
    localStorage.setItem("meal-swap-count", newCount.toString());
  };

  const handleSwap = () => {
    const isUnlimitedSwaps = hasFeature("unlimited-meal-plans");
    const maxSwaps = isUnlimitedSwaps ? Infinity : 3;
    
    if (swapCount >= maxSwaps && !isUnlimitedSwaps) {
      toast.error("You've reached your swap limit! Upgrade to Pro for unlimited swaps.", {
        duration: 4000,
        icon: "👑"
      });
      unlockFeature(PRO_FEATURES["unlimited-meal-plans"]);
      router.push("/dashboard/pricing");
      return;
    }

    startTransition(() => {
      onSwapMeal();
      // Increment swap count only for free users
      if (!isUnlimitedSwaps) {
        updateSwapCount(swapCount + 1);
      }
    });
  };

  const isUnlimitedSwaps = hasFeature("unlimited-meal-plans");
  const maxSwaps = isUnlimitedSwaps ? Infinity : 3;
  const swapsRemaining = Math.max(0, maxSwaps - swapCount);
  const canSwap = isUnlimitedSwaps || swapsRemaining > 0;

  return (
    <div className="flex flex-col gap-3 lg:min-w-[160px]">
      <Button className="w-full" onClick={onViewRecipe}>
        View Recipe
      </Button>

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full flex items-center justify-center"
          onClick={handleSwap}
          disabled={isPending || !canSwap}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Swapping...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Swap Meal
            </>
          )}
        </Button>

        {/* Swap Limit Indicator */}
        {!isUnlimitedSwaps && (
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Swaps remaining:</span>
            <div className="flex items-center gap-1">
              <span className={`font-semibold ${swapsRemaining <= 1 ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
                {swapsRemaining}
              </span>
              <span>/ {maxSwaps}</span>
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
        {!isUnlimitedSwaps && swapsRemaining <= 1 && (
          <div className="p-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-xs">
              <Lock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span className="text-amber-700 dark:text-amber-300 font-medium">
                {swapsRemaining === 0 ? "No swaps left!" : "Last swap!"}
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

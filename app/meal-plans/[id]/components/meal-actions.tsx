"use client";

import React from "react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MealActionsProps } from "../components/types";
import { Loader2, Crown, Lock, Zap } from "lucide-react";
import { useProFeatures, PRO_FEATURES } from "@/hooks/use-pro-features";
import toast from "react-hot-toast";
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

  const handleSwap = () => {
    // Check if user has Pro access (using "unlimited-meal-plans" as proxy for Pro meal features)
    const isPro = hasFeature("unlimited-meal-plans");

    if (!isPro) {
      toast.error("Swapping meals is a Pro feature! Upgrade to unlock.", {
        duration: 4000,
        icon: "👑"
      });
      unlockFeature(PRO_FEATURES["unlimited-meal-plans"]);
      return;
    }

    // Execute swap if Pro
    startTransition(() => {
      onSwapMeal();
    });
  };

  const isPro = hasFeature("unlimited-meal-plans");

  return (
    <div className="flex flex-col gap-3 lg:min-w-[160px]">
      <Button
        onClick={onViewRecipe}
        className={cn(
          "inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-base shadow-lg transition-all duration-200",
          "bg-[#1DCD9F] text-white hover:bg-[#169976] focus-visible:ring-2 focus-visible:ring-[#1DCD9F] focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
        )}
      >
        View Recipe
      </Button>

      <div className="space-y-2">
        <Button
          variant="outline"
          className={cn(
            "inline-flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-base shadow transition-all duration-200",
            "border border-[#1DCD9F] text-[#1DCD9F] bg-white hover:bg-[#EAFBF7] dark:bg-[#222222] dark:hover:bg-[#1DCD9F]/10 dark:text-[#1DCD9F] dark:border-[#1DCD9F]",
            !isPro && "opacity-80"
          )}
          onClick={handleSwap}
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Swapping...
            </>
          ) : (
            <>
              {!isPro ? <Lock className="h-4 w-4 mr-2" /> : <Zap className="h-5 w-5 mr-2" />}
              Swap Meal
              {!isPro && <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wide">PRO</span>}
            </>
          )}
        </Button>

        {/* Upgrade Prompt for Free Users */}
        {!isPro && (
          <div className="p-2 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 text-xs mb-1">
              <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span className="text-amber-700 dark:text-amber-300 font-medium">
                Want to swap this meal?
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-6 text-xs bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300"
              onClick={() => unlockFeature(PRO_FEATURES["unlimited-meal-plans"])}
            >
              Unlock Pro Features
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealActions;

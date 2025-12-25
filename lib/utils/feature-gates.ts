/**
 * @fileOverview
 * Feature Gating Infrastructure for Free vs Pro Plans
 * Centralized feature limits and access control
 */

import { getSubscriptionByUserId } from '@/data/index';
import prisma from '@/lib/prisma';
import { getToolUsageCount } from './tool-usage-tracker';

// ============================================================================
// FEATURE LIMITS
// ============================================================================

export type PlanType = 'free' | 'pro' | 'enterprise';

export interface FeatureLimits {
  mealPlansPerWeek: number;
  pantryAnalysesPerMonth: number;
  recipeGenerationsPerWeek: number;
  groceryListOptimizations: number;
  advancedAnalytics: boolean;
  exportFormats: string[];
  aiSuggestions: 'basic' | 'advanced';
  maxMealPlanDuration: number; // days
  maxRecipesPerMealPlan: number;
  maxFavorites: number; // Maximum saved recipes
  recipeImport: boolean; // Can import recipes from external sources
  mealPlanTemplates: boolean; // Access to premium templates
  prioritySupport: boolean; // Priority customer support
}

export const FEATURE_LIMITS: Record<PlanType, FeatureLimits> = {
  free: {
    mealPlansPerWeek: 3,
    pantryAnalysesPerMonth: 10,
    recipeGenerationsPerWeek: 5,
    groceryListOptimizations: 0,
    advancedAnalytics: false,
    exportFormats: ['pdf'],
    aiSuggestions: 'basic',
    maxMealPlanDuration: 7, // 1 week max
    maxRecipesPerMealPlan: 20,
    maxFavorites: 20, // Free users can save up to 20 recipes
    recipeImport: false,
    mealPlanTemplates: false,
    prioritySupport: false,
  },
  pro: {
    mealPlansPerWeek: Infinity,
    pantryAnalysesPerMonth: Infinity,
    recipeGenerationsPerWeek: Infinity,
    groceryListOptimizations: Infinity,
    advancedAnalytics: true,
    exportFormats: ['pdf', 'csv', 'json'],
    aiSuggestions: 'advanced',
    maxMealPlanDuration: 30, // 1 month max (realistic limit)
    maxRecipesPerMealPlan: Infinity,
    maxFavorites: Infinity, // Pro users can save unlimited recipes
    recipeImport: true,
    mealPlanTemplates: true,
    prioritySupport: true,
  },
  enterprise: {
    mealPlansPerWeek: Infinity,
    pantryAnalysesPerMonth: Infinity,
    recipeGenerationsPerWeek: Infinity,
    groceryListOptimizations: Infinity,
    advancedAnalytics: true,
    exportFormats: ['pdf', 'csv', 'json', 'xlsx'],
    aiSuggestions: 'advanced',
    maxMealPlanDuration: 30, // Same as Pro (realistic limit)
    maxRecipesPerMealPlan: Infinity,
    maxFavorites: Infinity,
    recipeImport: true,
    mealPlanTemplates: true,
    prioritySupport: true,
  },
};

// ============================================================================
// FEATURE ACCESS CHECKS
// ============================================================================

export interface FeatureAccessResult {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number;
  remaining?: number;
}

/**
 * Get user's plan type
 */
export async function getUserPlan(userId: string): Promise<PlanType> {
  try {
    const subscription = await getSubscriptionByUserId(userId);
    if (!subscription || subscription.plan === 'free') {
      return 'free';
    }
    return subscription.plan as PlanType;
  } catch (error) {
    console.error('[FeatureGates] Error getting user plan:', error);
    return 'free'; // Default to free on error
  }
}

/**
 * Check if user can generate a meal plan
 */
export async function canGenerateMealPlan(
  userId: string
): Promise<FeatureAccessResult> {
  const plan = await getUserPlan(userId);
  const limits = FEATURE_LIMITS[plan];

  if (limits.mealPlansPerWeek === Infinity) {
    return { allowed: true };
  }

  const usage = await getToolUsageCount(userId, 'generateMealPlan', 'week');
  const remaining = limits.mealPlansPerWeek - usage;

    if (usage >= limits.mealPlansPerWeek) {
      return {
        allowed: false,
        reason: `You've used all ${limits.mealPlansPerWeek} meal plans this week. Upgrade to Pro for unlimited meal plans, or wait until next week.`,
        currentUsage: usage,
        limit: limits.mealPlansPerWeek,
        remaining: 0,
      };
    }

  return {
    allowed: true,
    currentUsage: usage,
    limit: limits.mealPlansPerWeek,
    remaining,
  };
}

/**
 * Check if user can analyze pantry image
 */
export async function canAnalyzePantryImage(
  userId: string
): Promise<FeatureAccessResult> {
  const plan = await getUserPlan(userId);
  const limits = FEATURE_LIMITS[plan];

  if (limits.pantryAnalysesPerMonth === Infinity) {
    return { allowed: true };
  }

  const usage = await getToolUsageCount(userId, 'analyzePantryImage', 'month');
  const remaining = limits.pantryAnalysesPerMonth - usage;

    if (usage >= limits.pantryAnalysesPerMonth) {
      return {
        allowed: false,
        reason: `You've used all ${limits.pantryAnalysesPerMonth} pantry analyses this month. Upgrade to Pro for unlimited analyses, or wait until next month.`,
        currentUsage: usage,
        limit: limits.pantryAnalysesPerMonth,
        remaining: 0,
      };
    }

  return {
    allowed: true,
    currentUsage: usage,
    limit: limits.pantryAnalysesPerMonth,
    remaining,
  };
}

/**
 * Check if user can generate recipe
 */
export async function canGenerateRecipe(
  userId: string
): Promise<FeatureAccessResult> {
  const plan = await getUserPlan(userId);
  const limits = FEATURE_LIMITS[plan];

  if (limits.recipeGenerationsPerWeek === Infinity) {
    return { allowed: true };
  }

  const usage = await getToolUsageCount(userId, 'generateMealRecipe', 'week');
  const remaining = limits.recipeGenerationsPerWeek - usage;

    if (usage >= limits.recipeGenerationsPerWeek) {
      return {
        allowed: false,
        reason: `You've used all ${limits.recipeGenerationsPerWeek} recipe generations this week. Upgrade to Pro for unlimited recipes, or wait until next week.`,
        currentUsage: usage,
        limit: limits.recipeGenerationsPerWeek,
        remaining: 0,
      };
    }

  return {
    allowed: true,
    currentUsage: usage,
    limit: limits.recipeGenerationsPerWeek,
    remaining,
  };
}

/**
 * Check if user has access to advanced analytics
 */
export async function hasAdvancedAnalytics(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return FEATURE_LIMITS[plan].advancedAnalytics;
}

/**
 * Check if user can optimize grocery list
 */
export async function canOptimizeGroceryList(
  userId: string
): Promise<FeatureAccessResult> {
  const plan = await getUserPlan(userId);
  const limits = FEATURE_LIMITS[plan];

  if (limits.groceryListOptimizations === Infinity) {
    return { allowed: true };
  }

  if (limits.groceryListOptimizations === 0) {
    return {
      allowed: false,
      reason: 'Grocery list optimization is a Pro feature. Upgrade to unlock this feature.',
      limit: 0,
      remaining: 0,
    };
  }

  // For now, we'll track this separately if needed
  // For simplicity, if limit > 0, allow it
  return { allowed: true };
}

/**
 * Check if user can generate realistic AI images for meals
 * Pro feature - Free users get static placeholder images
 */
export async function canGenerateRealisticImages(
  userId: string
): Promise<FeatureAccessResult> {
  const plan = await getUserPlan(userId);
  
  if (plan === 'pro' || plan === 'enterprise') {
    return { allowed: true };
  }

  return {
    allowed: false,
    reason: 'Realistic AI-generated images are a Pro feature. Upgrade to Pro to see meal-specific, professional-quality images for all your meals.',
  };
}

/**
 * Check if user can add more favorites
 */
export async function canAddFavorite(
  userId: string
): Promise<FeatureAccessResult> {
  const plan = await getUserPlan(userId);
  const limits = FEATURE_LIMITS[plan];

  if (limits.maxFavorites === Infinity) {
    return { allowed: true };
  }

  // Count current favorites
  const favoriteCount = await prisma.favoriteRecipe.count({
    where: { userId },
  });

  const remaining = limits.maxFavorites - favoriteCount;

  if (favoriteCount >= limits.maxFavorites) {
    return {
      allowed: false,
      reason: `You've reached your limit of ${limits.maxFavorites} saved recipes. Upgrade to Pro for unlimited favorites.`,
      currentUsage: favoriteCount,
      limit: limits.maxFavorites,
      remaining: 0,
    };
  }

  return {
    allowed: true,
    currentUsage: favoriteCount,
    limit: limits.maxFavorites,
    remaining,
  };
}

/**
 * Check if user can import recipes
 */
export async function canImportRecipes(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return FEATURE_LIMITS[plan].recipeImport;
}

/**
 * Check if user has access to meal plan templates
 */
export async function hasMealPlanTemplates(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return FEATURE_LIMITS[plan].mealPlanTemplates;
}

/**
 * Check if user has priority support
 */
export async function hasPrioritySupport(userId: string): Promise<boolean> {
  const plan = await getUserPlan(userId);
  return FEATURE_LIMITS[plan].prioritySupport;
}

/**
 * Get user's feature limits
 */
export async function getUserFeatureLimits(
  userId: string
): Promise<FeatureLimits> {
  const plan = await getUserPlan(userId);
  return FEATURE_LIMITS[plan];
}

/**
 * Check if a specific feature is available
 */
export async function checkFeatureAccess(
  userId: string,
  feature: keyof FeatureLimits
): Promise<FeatureAccessResult> {
  const limits = await getUserFeatureLimits(userId);
  const limit = limits[feature];

  // Handle boolean features
  if (typeof limit === 'boolean') {
    return {
      allowed: limit,
      reason: limit
        ? undefined
        : 'This feature is only available in Pro plan.',
    };
  }

  // Handle number features (Infinity means unlimited)
  if (typeof limit === 'number') {
    if (limit === Infinity) {
      return { allowed: true };
    }

    // Map feature names to tool names for usage tracking
    const toolNameMap: Record<string, string> = {
      mealPlansPerWeek: 'generateMealPlan',
      pantryAnalysesPerMonth: 'analyzePantryImage',
      recipeGenerationsPerWeek: 'generateMealRecipe',
    };

    const toolName = toolNameMap[feature];
    if (!toolName) {
      return { allowed: true }; // Unknown feature, allow by default
    }

    const period = feature.includes('Week') ? 'week' : 'month';
    const usage = await getToolUsageCount(userId, toolName, period);
    const remaining = limit - usage;

    if (usage >= limit) {
      return {
        allowed: false,
        reason: `You've reached your limit for this feature. Upgrade to Pro for unlimited access.`,
        currentUsage: usage,
        limit,
        remaining: 0,
      };
    }

    return {
      allowed: true,
      currentUsage: usage,
      limit,
      remaining,
    };
  }

  // Handle array features (like exportFormats)
  if (Array.isArray(limit)) {
    return {
      allowed: limit.length > 0,
      reason: limit.length === 0 ? 'This feature is not available.' : undefined,
    };
  }

  return { allowed: true };
}


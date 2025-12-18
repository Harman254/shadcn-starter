/**
 * @fileOverview
 * Smart Caching Strategies for AI Tool Responses
 * Optimizes cache TTLs and implements stale-while-revalidate pattern
 */

import { getCacheManager } from './cache-manager';
import crypto from 'crypto';

// ============================================================================
// CACHE STRATEGIES
// ============================================================================

export interface CacheStrategy {
  ttl: number; // Time to live in milliseconds
  staleWhileRevalidate: boolean; // Return stale data while fetching new
  cacheKey: (input: any) => string;
  tags?: string[]; // For tag-based invalidation
}

/**
 * Hash object to create consistent cache keys
 */
function hashObject(obj: any): string {
  const str = JSON.stringify(obj, Object.keys(obj).sort());
  return crypto.createHash('sha256').update(str).digest('hex').substring(0, 16);
}

/**
 * Cache strategies for different tools
 */
export const CACHE_STRATEGIES: Record<string, CacheStrategy> = {
  generateMealPlan: {
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days - meal plans don't change often
    staleWhileRevalidate: true,
    cacheKey: (input) => {
      const key = {
        duration: input.duration,
        mealsPerDay: input.mealsPerDay,
        dietaryPreferences: input.dietaryPreferences?.sort(),
        cuisinePreferences: input.cuisinePreferences?.sort(),
        goal: input.goal,
        householdSize: input.householdSize,
      };
      return `meal-plan:${hashObject(key)}`;
    },
    tags: ['meal-plans'],
  },

  searchRecipes: {
    ttl: 24 * 60 * 60 * 1000, // 24 hours - recipes are relatively stable
    staleWhileRevalidate: true,
    cacheKey: (input) => {
      const key = {
        query: input.query?.toLowerCase(),
        cuisine: input.cuisine,
        dietaryRestrictions: input.dietaryRestrictions?.sort(),
        maxResults: input.maxResults,
      };
      return `recipes:${hashObject(key)}`;
    },
    tags: ['recipes'],
  },

  getSeasonalIngredients: {
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days - seasonal data changes weekly
    staleWhileRevalidate: false,
    cacheKey: (input) => {
      const key = {
        season: input.season,
        location: input.location,
      };
      return `seasonal:${hashObject(key)}`;
    },
    tags: ['seasonal'],
  },

  analyzeNutrition: {
    ttl: 60 * 60 * 1000, // 1 hour - nutrition data for same meals is stable
    staleWhileRevalidate: true,
    cacheKey: (input) => {
      const key = {
        meals: input.meals?.map((m: any) => ({
          name: m.name,
          ingredients: m.ingredients?.sort(),
          servings: m.servings,
        })),
      };
      return `nutrition:${hashObject(key)}`;
    },
    tags: ['nutrition'],
  },

  getGroceryPricing: {
    ttl: 6 * 60 * 60 * 1000, // 6 hours - prices change but not too frequently
    staleWhileRevalidate: true,
    cacheKey: (input) => {
      const key = {
        items: input.items?.sort(),
        location: input.location,
        currency: input.currency,
      };
      return `pricing:${hashObject(key)}`;
    },
    tags: ['pricing'],
  },

  suggestIngredientSubstitutions: {
    ttl: 30 * 24 * 60 * 60 * 1000, // 30 days - substitutions are stable
    staleWhileRevalidate: false,
    cacheKey: (input) => {
      const key = {
        ingredient: input.ingredient?.toLowerCase(),
        dietaryRestrictions: input.dietaryRestrictions?.sort(),
      };
      return `substitutions:${hashObject(key)}`;
    },
    tags: ['substitutions'],
  },

  planFromInventory: {
    ttl: 12 * 60 * 60 * 1000, // 12 hours - inventory-based plans
    staleWhileRevalidate: true,
    cacheKey: (input) => {
      const key = {
        ingredients: input.ingredients?.sort(),
        mealType: input.mealType,
        dietaryPreferences: input.dietaryPreferences?.sort(),
      };
      return `inventory-plan:${hashObject(key)}`;
    },
    tags: ['inventory', 'meal-plans'],
  },

  // Default strategy for unknown tools
  default: {
    ttl: 5 * 60 * 1000, // 5 minutes - conservative default
    staleWhileRevalidate: false,
    cacheKey: (input) => `default:${hashObject(input)}`,
  },
};

// ============================================================================
// SMART CACHE HELPERS
// ============================================================================

/**
 * Get cache strategy for a tool
 */
export function getCacheStrategy(toolName: string): CacheStrategy {
  return CACHE_STRATEGIES[toolName] || CACHE_STRATEGIES.default;
}

/**
 * Get cached data with stale-while-revalidate support
 */
export async function getCachedOrFetch<T>(
  toolName: string,
  input: any,
  fetchFn: () => Promise<T>
): Promise<{ data: T; cached: boolean; stale?: boolean }> {
  const strategy = getCacheStrategy(toolName);
  const cacheKey = strategy.cacheKey(input);
  const cache = getCacheManager();

  // Check cache
  const cached = cache.get<T>(cacheKey);
  if (cached) {
    const entry = (cache as any).cache.get(cacheKey);
    if (entry) {
      const age = Date.now() - entry.timestamp;
      const isStale = age > strategy.ttl;

      // If stale but staleWhileRevalidate is enabled, return stale and fetch in background
      if (isStale && strategy.staleWhileRevalidate) {
        // Fetch new data in background (don't await)
        fetchFn()
          .then((newData) => {
            cache.set(cacheKey, newData, {
              ttl: strategy.ttl,
              tags: strategy.tags,
            });
          })
          .catch((error) => {
            console.error(`[SmartCache] Background fetch failed for ${toolName}:`, error);
            // Keep stale data if fetch fails
          });

        return { data: cached, cached: true, stale: true };
      }

      // Not stale, return cached
      if (!isStale) {
        return { data: cached, cached: true };
      }
    }
  }

  // No cache or expired, fetch new data
  const data = await fetchFn();
  cache.set(cacheKey, data, {
    ttl: strategy.ttl,
    tags: strategy.tags,
  });

  return { data, cached: false };
}

/**
 * Invalidate cache by tags
 */
export function invalidateCacheByTags(tags: string[]): number {
  const cache = getCacheManager();
  return cache.invalidateByTags(tags);
}

/**
 * Invalidate cache for a specific tool
 */
export function invalidateToolCache(toolName: string): void {
  const strategy = getCacheStrategy(toolName);
  if (strategy.tags) {
    invalidateCacheByTags(strategy.tags);
  }
}


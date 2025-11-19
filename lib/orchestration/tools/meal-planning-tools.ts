/**
 * @fileOverview
 * Tool Definitions for Meal Planning Orchestration
 * Integrates with existing meal plan generation system
 */

import { ToolDefinition, OrchestrationContext } from '../tool-orchestrator';
import { generateMealPlanCore } from '@/ai/flows/chat/dynamic-select-tools';
import { getNutritionClient } from '../api-clients/nutrition-api';
import { getPricingClient } from '../api-clients/grocery-pricing-api';
import { generateGroceryListCore } from '@/ai/flows/chat/dynamic-select-tools';
import { getCacheManager } from '../cache-manager';

// ============================================================================
// MEAL PLAN GENERATION TOOL
// ============================================================================

export const mealPlanTool: ToolDefinition = {
  name: 'generateMealPlan',
  
  async execute(input: any, context: OrchestrationContext) {
    const { duration = 1, mealsPerDay = 3, preferences } = input;
    
    // Use existing meal plan generation
    const result = await generateMealPlanCore({
      duration,
      mealsPerDay,
      chatMessages: context.conversationHistory.slice(-5),
    });

    if (!result.success || !result.mealPlan) {
      throw new Error(result.message || 'Failed to generate meal plan');
    }

    return {
      mealPlan: result.mealPlan,
      message: result.message,
    };
  },

  validateInput(input: any): boolean {
    return (
      typeof input.duration === 'number' &&
      input.duration >= 1 &&
      input.duration <= 30 &&
      typeof input.mealsPerDay === 'number' &&
      input.mealsPerDay >= 1 &&
      input.mealsPerDay <= 5
    );
  },

  cacheKey(input: any, context: OrchestrationContext): string {
    const cache = getCacheManager();
    return cache.generateKey('meal-plan', {
      duration: input.duration,
      mealsPerDay: input.mealsPerDay,
      userId: context.userId,
      preferencesHash: context.userPreferences ? 
        JSON.stringify(context.userPreferences).slice(0, 50) : 'default',
    });
  },

  timeout: 30000, // 30 seconds
};

// ============================================================================
// NUTRITION ANALYSIS TOOL
// ============================================================================

export const nutritionAnalysisTool: ToolDefinition = {
  name: 'analyzeNutrition',
  
  async execute(input: any, context: OrchestrationContext) {
    let { mealPlan } = input;
    
    // Use meal plan from previous tool if not provided
    if (!mealPlan && context.previousResults?.generateMealPlan) {
      mealPlan = context.previousResults.generateMealPlan.mealPlan;
    }
    
    if (!mealPlan || !mealPlan.days) {
      throw new Error('Meal plan is required for nutrition analysis');
    }

    const nutritionClient = getNutritionClient();
    const allIngredients: string[] = [];

    // Extract all ingredients from meal plan
    mealPlan.days.forEach((day: any) => {
      day.meals.forEach((meal: any) => {
        if (meal.ingredients) {
          allIngredients.push(...meal.ingredients);
        }
      });
    });

    // Get nutrition data for all ingredients
    const nutritionData = await nutritionClient.getBatchNutritionData(
      allIngredients.map(ing => ({ name: ing }))
    );

    // Aggregate nutrition per day
    const dailyNutrition = mealPlan.days.map((day: any) => {
      let dayCalories = 0;
      let dayProtein = 0;
      let dayCarbs = 0;
      let dayFat = 0;

      day.meals.forEach((meal: any) => {
        meal.ingredients?.forEach((ingredient: string) => {
          const nutrition = nutritionData[ingredient];
          if (nutrition) {
            dayCalories += nutrition.calories || 0;
            dayProtein += nutrition.protein || 0;
            dayCarbs += nutrition.carbs || 0;
            dayFat += nutrition.fat || 0;
          }
        });
      });

      return {
        day: day.day,
        calories: Math.round(dayCalories),
        protein: Math.round(dayProtein),
        carbs: Math.round(dayCarbs),
        fat: Math.round(dayFat),
      };
    });

    return {
      dailyNutrition,
      totalNutrition: {
        calories: dailyNutrition.reduce((sum, d) => sum + d.calories, 0),
        protein: dailyNutrition.reduce((sum, d) => sum + d.protein, 0),
        carbs: dailyNutrition.reduce((sum, d) => sum + d.carbs, 0),
        fat: dailyNutrition.reduce((sum, d) => sum + d.fat, 0),
      },
      itemNutrition: nutritionData,
    };
  },

  getDependencies(input: any): string[] {
    // Nutrition analysis depends on meal plan
    return ['generateMealPlan'];
  },

  shouldExecute(input: any, context: OrchestrationContext): boolean {
    // Only execute if meal plan exists in previous results
    return !!context.previousResults?.generateMealPlan;
  },

  cacheKey(input: any, context: OrchestrationContext): string {
    const cache = getCacheManager();
    const mealPlanId = context.previousResults?.generateMealPlan?.mealPlan?.id || 'unknown';
    return cache.generateKey('nutrition', { mealPlanId });
  },
};

// ============================================================================
// GROCERY PRICING TOOL
// ============================================================================

export const groceryPricingTool: ToolDefinition = {
  name: 'getGroceryPricing',
  
  async execute(input: any, context: OrchestrationContext) {
    const { mealPlan } = input;
    
    if (!mealPlan && context.previousResults?.generateMealPlan) {
      // Use meal plan from previous tool
      input.mealPlan = context.previousResults.generateMealPlan.mealPlan;
    }

    if (!input.mealPlan) {
      throw new Error('Meal plan is required for grocery pricing');
    }

    const pricingClient = getPricingClient();
    
    if (!context.locationData) {
      throw new Error('Location data is required for pricing');
    }

    // Extract all ingredients
    const allIngredients: string[] = [];
    input.mealPlan.days.forEach((day: any) => {
      day.meals.forEach((meal: any) => {
        if (meal.ingredients) {
          allIngredients.push(...meal.ingredients);
        }
      });
    });

    // Get unique ingredients
    const uniqueIngredients = [...new Set(allIngredients)];

    // Get prices
    const pricingResult = await pricingClient.getPrices(
      uniqueIngredients,
      context.locationData
    );

    return {
      prices: pricingResult.prices || [],
      total: pricingResult.total || 0,
      currency: pricingResult.currency || context.locationData.currencyCode,
    };
  },

  getDependencies(input: any): string[] {
    return ['generateMealPlan'];
  },

  shouldExecute(input: any, context: OrchestrationContext): boolean {
    return !!context.previousResults?.generateMealPlan;
  },

  cacheKey(input: any, context: OrchestrationContext): string {
    const mealPlanId = context.previousResults?.generateMealPlan?.mealPlan?.id || 'unknown';
    const location = context.locationData?.city || 'unknown';
    return CacheManager.generateKey('pricing', { mealPlanId, location });
  },
};

// ============================================================================
// GROCERY LIST GENERATION TOOL
// ============================================================================

export const groceryListTool: ToolDefinition = {
  name: 'generateGroceryList',
  
  async execute(input: any, context: OrchestrationContext) {
    const { mealPlan } = input;
    
    if (!mealPlan && context.previousResults?.generateMealPlan) {
      input.mealPlan = context.previousResults.generateMealPlan.mealPlan;
    }

    if (!input.mealPlan) {
      throw new Error('Meal plan is required for grocery list generation');
    }

    // Use existing grocery list generation
    const result = await generateGroceryListCore({
      mealPlan: input.mealPlan,
    });

    if (!result.success || !result.groceryList) {
      throw new Error(result.message || 'Failed to generate grocery list');
    }

    return {
      groceryList: result.groceryList,
      locationInfo: result.locationInfo,
      message: result.message,
    };
  },

  getDependencies(input: any): string[] {
    return ['generateMealPlan'];
  },

  shouldExecute(input: any, context: OrchestrationContext): boolean {
    return !!context.previousResults?.generateMealPlan;
  },

  onError: async (error, input, context) => {
    // Fallback: return a basic grocery list structure
    console.warn('[GroceryListTool] Error occurred, using fallback:', error);
    
    const mealPlan = input.mealPlan || context.previousResults?.generateMealPlan?.mealPlan;
    if (!mealPlan) {
      throw error; // Re-throw if no meal plan available
    }

    // Create basic grocery list from ingredients
    const allIngredients: string[] = [];
    mealPlan.days.forEach((day: any) => {
      day.meals.forEach((meal: any) => {
        if (meal.ingredients) {
          allIngredients.push(...meal.ingredients);
        }
      });
    });

    return {
      groceryList: allIngredients.map((ing, idx) => ({
        id: `item-${idx}`,
        item: ing,
        quantity: '1 unit',
        category: 'Other',
        estimatedPrice: '$0.00',
      })),
      locationInfo: context.locationData || {
        currencySymbol: '$',
        localStores: [],
      },
      message: 'Generated basic grocery list (some features may be limited)',
    };
  },
};

// ============================================================================
// EXPORT ALL TOOLS
// ============================================================================

export const mealPlanningTools: ToolDefinition[] = [
  mealPlanTool,
  nutritionAnalysisTool,
  groceryPricingTool,
  groceryListTool,
];


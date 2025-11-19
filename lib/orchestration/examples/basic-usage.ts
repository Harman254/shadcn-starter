/**
 * @fileOverview
 * Basic Usage Examples for Orchestration System
 * Copy and adapt these examples for your use case
 */

import { getOrchestrator } from '../tool-orchestrator';
import { mealPlanningTools } from '../tools/meal-planning-tools';
import { getOrchestratedChatFlow } from '../orchestrated-chat-flow';
import { getCacheManager } from '../cache-manager';
import { getChatStateManager } from '../enhanced-chat-state';

// ============================================================================
// EXAMPLE 1: Basic Tool Orchestration
// ============================================================================

export async function example1_BasicOrchestration() {
  const orchestrator = getOrchestrator();
  orchestrator.registerTools(mealPlanningTools);

  const result = await orchestrator.executeTools(
    [
      { toolName: 'generateMealPlan', input: { duration: 7, mealsPerDay: 3 } },
      { toolName: 'analyzeNutrition', input: {} }, // Depends on meal plan
      { toolName: 'getGroceryPricing', input: {} }, // Depends on meal plan
    ],
    {
      conversationHistory: [],
      userId: 'user123',
      locationData: {
        city: 'Nairobi',
        country: 'Kenya',
        currencyCode: 'KES',
        currencySymbol: 'KSh',
      },
    }
  );

  console.log('Success:', result.success);
  console.log('Results:', result.results);
  console.log('Execution time:', result.executionTime, 'ms');
}

// ============================================================================
// EXAMPLE 2: Full Chat Flow
// ============================================================================

export async function example2_FullChatFlow() {
  const chatFlow = getOrchestratedChatFlow();

  const result = await chatFlow.processMessage({
    message: 'Generate a 7-day vegetarian meal plan with nutrition info and grocery prices',
    userId: 'user123',
    sessionId: 'session456',
    conversationHistory: [
      { role: 'user', content: 'I need help with meal planning' },
      { role: 'assistant', content: 'I can help you create a personalized meal plan!' },
    ],
    userPreferences: {
      dietaryPreference: 'vegetarian',
      goal: 'weight loss',
    },
    locationData: {
      city: 'Nairobi',
      country: 'Kenya',
      currencyCode: 'KES',
      currencySymbol: 'KSh',
    },
  });

  console.log('Response:', result.response);
  console.log('Structured Data:', result.structuredData);
  console.log('Suggestions:', result.suggestions);
  console.log('Confidence:', result.confidence);
}

// ============================================================================
// EXAMPLE 3: Caching
// ============================================================================

export async function example3_Caching() {
  const cache = getCacheManager();

  // Set cache with tags
  cache.set('meal-plan:user123', { plan: 'data' }, {
    ttl: 10 * 60 * 1000, // 10 minutes
    tags: ['meal-plans', 'user-123'],
  });

  // Get from cache
  const cached = cache.get('meal-plan:user123');
  if (cached) {
    console.log('Cache hit!', cached);
  }

  // Invalidate by tags
  cache.invalidateByTags(['meal-plans']);

  // Generate cache key
  const key = cache.generateKey('nutrition', {
    mealPlanId: 'plan123',
    userId: 'user123',
  });
  console.log('Cache key:', key);
}

// ============================================================================
// EXAMPLE 4: State Management
// ============================================================================

export async function example4_StateManagement() {
  const stateManager = getChatStateManager();

  // Set active meal plan
  stateManager.setActiveMealPlan({
    id: 'plan123',
    duration: 7,
    mealsPerDay: 3,
    days: [],
  });

  // Add refinement
  stateManager.addRefinement({
    type: 'replace',
    target: 'meal:1:2',
    value: { name: 'New Meal', ingredients: [] },
  });

  // Apply refinements
  const mealPlan = stateManager.getState().activeMealPlan;
  const refined = stateManager.applyRefinementsToMealPlan(mealPlan);

  // Get conversation context for AI
  const context = stateManager.getConversationContext();
  console.log('Context:', context);
}

// ============================================================================
// EXAMPLE 5: Custom Tool
// ============================================================================

export async function example5_CustomTool() {
  const orchestrator = getOrchestrator();

  // Define custom tool
  const customTool = {
    name: 'recipeSearch',
    
    async execute(input: any, context: any) {
      // Search for recipes
      return {
        recipes: [
          { name: 'Recipe 1', ingredients: [] },
          { name: 'Recipe 2', ingredients: [] },
        ],
      };
    },
    
    validateInput(input: any) {
      return typeof input.query === 'string' && input.query.length > 0;
    },
    
    cacheKey(input: any, context: any) {
      return `recipe:${input.query}:${context.userId}`;
    },
  };

  // Register and use
  orchestrator.registerTool(customTool);

  const result = await orchestrator.executeTools(
    [{ toolName: 'recipeSearch', input: { query: 'chicken curry' } }],
    { conversationHistory: [], userId: 'user123' }
  );

  console.log('Recipes:', result.results.recipeSearch);
}

// ============================================================================
// EXAMPLE 6: Error Handling with Fallbacks
// ============================================================================

export async function example6_ErrorHandling() {
  const orchestrator = getOrchestrator();
  orchestrator.registerTools(mealPlanningTools);

  const result = await orchestrator.executeTools(
    [
      { toolName: 'generateMealPlan', input: { duration: 7, mealsPerDay: 3 } },
      { toolName: 'analyzeNutrition', input: {} },
    ],
    {
      conversationHistory: [],
      userId: 'user123',
    }
  );

  // Check for errors
  if (result.errors) {
    console.error('Errors occurred:', result.errors);
    
    // Handle specific errors
    if (result.errors.analyzeNutrition) {
      console.log('Nutrition analysis failed, but meal plan succeeded');
      // Continue with meal plan only
    }
  }

  // Results may be partial
  if (result.results.generateMealPlan) {
    console.log('Meal plan generated successfully');
  }
}

// ============================================================================
// EXAMPLE 7: React Hook Integration
// ============================================================================

/**
 * Example React hook for orchestrated chat
 * Use this in your React components
 * 
 * NOTE: This is a TypeScript example. In your actual React component file,
 * import React hooks: import { useState, useCallback } from 'react';
 */
export const useOrchestratedChatExample = `
'use client';

import { useState, useCallback } from 'react';
import { getOrchestratedChatFlow } from '@/lib/orchestration/orchestrated-chat-flow';

export function useOrchestratedChat() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(async (
    message: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const chatFlow = getOrchestratedChatFlow();
      const result = await chatFlow.processMessage({
        message,
        conversationHistory,
      });

      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    sendMessage,
    isLoading,
    error,
  };
}
`;


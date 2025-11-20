/**
 * @fileOverview
 * Examples and Usage Patterns for Robust Orchestration
 * 
 * This file demonstrates how to use the robust orchestrator with:
 * - Custom error handlers
 * - Retry strategies
 * - Context state management
 * - Partial results handling
 */

import { RobustOrchestrator, DefaultErrorHandler, ErrorHandler, RetryOptions } from '../robust-orchestrator';
import { ToolDefinition, OrchestrationContext } from '../tool-orchestrator';
import { mealPlanningTools } from '../tools/meal-planning-tools';

// ============================================================================
// EXAMPLE 1: Basic Usage with Default Error Handling
// ============================================================================

export async function basicRobustOrchestrationExample() {
  const orchestrator = new RobustOrchestrator({
    maxRetries: 3,
    enablePartialResults: true,
    enableContextState: true,
    enableStaleDataFallback: true,
  });

  // Register tools
  orchestrator.registerTools(mealPlanningTools);

  // Execute tools
  const context: OrchestrationContext = {
    userId: 'user-123',
    sessionId: 'session-456',
    conversationHistory: [],
    userPreferences: { dietaryRestrictions: ['vegetarian'] },
  };

  const result = await orchestrator.executeTools(
    [
      { toolName: 'generateMealPlan', input: { duration: 7, mealsPerDay: 3 } },
      { toolName: 'analyzeNutrition', input: {} },
      { toolName: 'getGroceryPricing', input: {} },
    ],
    context
  );

  console.log('Execution result:', {
    success: result.success,
    completedTools: Object.keys(result.results || {}),
    failedTools: result.failedTools,
    retryAttempts: result.retryAttempts,
  });
}

// ============================================================================
// EXAMPLE 2: Custom Error Handler for Specific Tool
// ============================================================================

/**
 * Custom error handler for nutrition analysis tool
 * Provides more specific error messages and fallback data
 */
class NutritionAnalysisErrorHandler extends DefaultErrorHandler {
  generateErrorMessage(error: Error, toolName: string, context: OrchestrationContext): string {
    // Check for specific nutrition API errors
    if (error.message.includes('ingredient not found')) {
      return 'Some ingredients in your meal plan aren\'t in my nutrition database. I\'ll use estimated values based on similar ingredients.';
    }

    if (error.message.includes('API quota')) {
      return 'The nutrition analysis service is temporarily unavailable. I can still provide your meal plan without detailed nutrition info.';
    }

    // Fall back to default handler
    return super.generateErrorMessage(error, toolName, context);
  }

  async createFallbackResponse(
    error: Error,
    toolName: string,
    input: any,
    context: OrchestrationContext
  ): Promise<any> {
    // Provide estimated nutrition data as fallback
    return {
      success: false,
      fallback: true,
      dailyNutrition: context.previousResults?.generateMealPlan?.mealPlan?.days?.map((day: any) => ({
        day: day.day,
        calories: 2000, // Estimated
        protein: 50, // Estimated
        carbs: 200, // Estimated
        fat: 65, // Estimated
        note: 'Estimated values - detailed analysis unavailable',
      })) || [],
      message: 'Using estimated nutrition values due to service unavailability',
    };
  }
}

export async function customErrorHandlerExample() {
  const orchestrator = new RobustOrchestrator({
    maxRetries: 3,
    enablePartialResults: true,
  });

  orchestrator.registerTools(mealPlanningTools);

  // Register custom error handler for nutrition analysis
  orchestrator.registerErrorHandler('analyzeNutrition', new NutritionAnalysisErrorHandler());

  const context: OrchestrationContext = {
    userId: 'user-123',
    sessionId: 'session-456',
    conversationHistory: [],
  };

  const result = await orchestrator.executeTools(
    [
      { toolName: 'generateMealPlan', input: { duration: 7, mealsPerDay: 3 } },
      { toolName: 'analyzeNutrition', input: {} },
    ],
    context
  );

  // Even if nutrition analysis fails, we get a fallback response
  if (result.partialResults?.analyzeNutrition?.fallback) {
    console.log('Using fallback nutrition data:', result.partialResults.analyzeNutrition);
  }
}

// ============================================================================
// EXAMPLE 3: Custom Retry Strategy
// ============================================================================

export async function customRetryStrategyExample() {
  const orchestrator = new RobustOrchestrator({
    maxRetries: 5, // More retries for critical operations
    retryOptions: {
      retryDelay: 500, // Start with 500ms delay
      backoffMultiplier: 1.5, // Less aggressive backoff
      maxDelay: 10000, // Cap at 10 seconds
      retryableErrors: [
        'timeout',
        'network',
        'rate limit',
      ],
      nonRetryableErrors: [
        'authentication',
        'not found',
        'invalid input',
      ],
    },
    enablePartialResults: true,
  });

  orchestrator.registerTools(mealPlanningTools);

  const context: OrchestrationContext = {
    userId: 'user-123',
    sessionId: 'session-456',
    conversationHistory: [],
  };

  const result = await orchestrator.executeTools(
    [
      { toolName: 'generateMealPlan', input: { duration: 7, mealsPerDay: 3 } },
    ],
    context
  );

  console.log('Retry attempts:', result.retryAttempts);
}

// ============================================================================
// EXAMPLE 4: Context State Management Across Turns
// ============================================================================

export async function contextStateManagementExample() {
  const orchestrator = new RobustOrchestrator({
    enableContextState: true,
    enablePartialResults: true,
  });

  orchestrator.registerTools(mealPlanningTools);

  const sessionId = 'session-789';
  
  // First turn: Generate meal plan
  const context1: OrchestrationContext = {
    userId: 'user-123',
    sessionId,
    conversationHistory: [
      { role: 'user', content: 'Generate a 7-day meal plan' },
    ],
  };

  const result1 = await orchestrator.executeTools(
    [{ toolName: 'generateMealPlan', input: { duration: 7, mealsPerDay: 3 } }],
    context1
  );

  console.log('Turn 1 - Meal plan generated:', result1.success);

  // Second turn: Use previous results (meal plan is in context state)
  const context2: OrchestrationContext = {
    userId: 'user-123',
    sessionId, // Same session ID
    conversationHistory: [
      { role: 'user', content: 'Generate a 7-day meal plan' },
      { role: 'assistant', content: 'Here is your meal plan...' },
      { role: 'user', content: 'What about the nutrition info?' },
    ],
    // Previous results are automatically loaded from context state
  };

  const result2 = await orchestrator.executeTools(
    [{ toolName: 'analyzeNutrition', input: {} }],
    context2
  );

  // The nutrition tool can access the meal plan from context state
  const contextState = orchestrator.getContextState(sessionId);
  console.log('Context state has meal plan:', !!contextState?.previousResults?.generateMealPlan);
}

// ============================================================================
// EXAMPLE 5: Handling Partial Results Gracefully
// ============================================================================

export async function partialResultsExample() {
  const orchestrator = new RobustOrchestrator({
    enablePartialResults: true,
    enableStaleDataFallback: true,
    staleDataThreshold: 2 * 60 * 60 * 1000, // 2 hours
  });

  orchestrator.registerTools(mealPlanningTools);

  const context: OrchestrationContext = {
    userId: 'user-123',
    sessionId: 'session-456',
    conversationHistory: [],
  };

  const result = await orchestrator.executeTools(
    [
      { toolName: 'generateMealPlan', input: { duration: 7, mealsPerDay: 3 } },
      { toolName: 'analyzeNutrition', input: {} },
      { toolName: 'getGroceryPricing', input: {} },
      { toolName: 'generateGroceryList', input: {} },
    ],
    context
  );

  // Check what succeeded and what failed
  if (!result.success) {
    console.log('Partial success:');
    console.log('- Completed:', Object.keys(result.partialResults || {}));
    console.log('- Failed:', result.failedTools);
    console.log('- Used cached:', result.usedCachedData);
    console.log('- Used stale:', result.usedStaleData);
    console.log('- User-friendly errors:', result.userFriendlyErrors);
  }

  // Generate user-friendly response
  const { generateRobustResponse } = await import('../response-generator-robust');
  const response = generateRobustResponse(result, context, {
    includePartialResults: true,
    explainLimitations: true,
    maintainContext: true,
    tone: 'friendly',
  });

  console.log('Response:', response);
}

// ============================================================================
// EXAMPLE 6: Tool with Built-in Retry Logic
// ============================================================================

/**
 * Example tool definition with custom retry and error handling
 */
export const robustMealPlanTool: ToolDefinition = {
  name: 'generateMealPlanRobust',
  
  async execute(input: any, context: OrchestrationContext) {
    // Tool implementation with internal retry logic if needed
    const { duration = 1, mealsPerDay = 3 } = input;
    
    // Simulate API call that might fail
    const result = await generateMealPlanWithRetry({
      duration,
      mealsPerDay,
      preferences: context.userPreferences,
    });

    return result;
  },

  validateInput(input: any): boolean {
    return (
      typeof input.duration === 'number' &&
      input.duration >= 1 &&
      input.duration <= 30
    );
  },

  onError: async (error, input, context) => {
    // Fallback: Return a basic meal plan structure
    return {
      mealPlan: {
        title: 'Basic Meal Plan',
        duration: input.duration || 1,
        mealsPerDay: input.mealsPerDay || 3,
        days: Array.from({ length: input.duration || 1 }, (_, i) => ({
          day: i + 1,
          meals: Array.from({ length: input.mealsPerDay || 3 }, (_, j) => ({
            name: `Meal ${j + 1}`,
            description: 'A balanced meal',
            ingredients: ['Ingredient 1', 'Ingredient 2'],
          })),
        })),
      },
      message: 'Generated a basic meal plan. Some features may be limited.',
      fallback: true,
    };
  },

  cacheKey(input: any, context: OrchestrationContext): string {
    return `meal-plan:${input.duration}:${input.mealsPerDay}:${context.userId}`;
  },

  timeout: 30000,
};

async function generateMealPlanWithRetry(params: any): Promise<any> {
  // Internal retry logic for the tool itself
  // This is in addition to the orchestrator's retry logic
  // Use this for tool-specific retry needs
  throw new Error('Not implemented - example only');
}


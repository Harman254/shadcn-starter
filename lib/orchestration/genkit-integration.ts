/**
 * @fileOverview
 * Integration layer between Robust Orchestrator and Genkit
 * 
 * This module provides utilities to integrate the robust orchestration
 * system with Genkit flows, enabling error handling, retries, and
 * context management within Genkit tool calls.
 */

import { RobustOrchestrator, RobustOrchestrationResult } from './robust-orchestrator';
import { OrchestrationContext } from './tool-orchestrator';
import { generateRobustResponse } from './response-generator-robust';
import { mealPlanningTools } from './tools/meal-planning-tools';

// ============================================================================
// GENKIT-ORCHESTRATOR INTEGRATION
// ============================================================================

/**
 * Create a robust orchestrator instance configured for Genkit
 */
export function createGenkitOrchestrator() {
  return new RobustOrchestrator({
    maxRetries: 3,
    enablePartialResults: true,
    enableContextState: true,
    enableStaleDataFallback: true,
    staleDataThreshold: 60 * 60 * 1000, // 1 hour
    enableProgressTracking: true,
    enableStreaming: true,
    maxConcurrency: 5,
  });
}

/**
 * Execute Genkit tools through robust orchestrator
 * 
 * @example
 * ```typescript
 * // In a Genkit flow
 * const orchestrator = createGenkitOrchestrator();
 * orchestrator.registerTools(mealPlanningTools);
 * 
 * const result = await executeGenkitTools(
 *   [
 *     { toolName: 'generateMealPlan', input: { duration: 7 } },
 *     { toolName: 'analyzeNutrition', input: {} },
 *   ],
 *   {
 *     userId: 'user-123',
 *     sessionId: 'session-456',
 *     conversationHistory: [],
 *   }
 * );
 * 
 * // Generate user-friendly response
 * const response = generateGenkitResponse(result, context);
 * ```
 */
export async function executeGenkitTools(
  toolCalls: Array<{ toolName: string; input: any; priority?: number }>,
  context: OrchestrationContext
): Promise<RobustOrchestrationResult> {
  const orchestrator = createGenkitOrchestrator();
  orchestrator.registerTools(mealPlanningTools);

  return await orchestrator.executeTools(toolCalls, context);
}

/**
 * Generate a Genkit-compatible response from orchestration results
 * 
 * This function converts robust orchestration results into a format
 * suitable for Genkit flows, including user-friendly error messages
 * and partial results.
 */
export function generateGenkitResponse(
  result: RobustOrchestrationResult,
  context: OrchestrationContext,
  options: {
    includePartialResults?: boolean;
    explainLimitations?: boolean;
    tone?: 'friendly' | 'professional' | 'casual';
  } = {}
): string {
  // Generate natural language response
  const response = generateRobustResponse(result, context, {
    includePartialResults: options.includePartialResults ?? true,
    explainLimitations: options.explainLimitations ?? true,
    maintainContext: true,
    tone: options.tone ?? 'friendly',
  });

  // If there are user-friendly errors, append them
  if (result.userFriendlyErrors && Object.keys(result.userFriendlyErrors).length > 0) {
    const errorMessages = Object.values(result.userFriendlyErrors).join(' ');
    return `${response} ${errorMessages}`;
  }

  return response;
}

/**
 * Wrapper for Genkit tool execution with robust error handling
 * 
 * This wrapper can be used to wrap individual Genkit tool calls
 * with retry logic and error handling.
 */
export async function executeGenkitToolWithRetry<T>(
  toolName: string,
  input: any,
  context: OrchestrationContext,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    onError?: (error: Error, attempt: number) => Promise<T | null>;
  } = {}
): Promise<{ success: boolean; result?: T; error?: Error; attempts: number }> {
  const maxRetries = options.maxRetries ?? 3;
  const retryDelay = options.retryDelay ?? 1000;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Get tool from orchestrator
      const orchestrator = createGenkitOrchestrator();
      orchestrator.registerTools(mealPlanningTools);
      
      const result = await orchestrator.executeTools(
        [{ toolName, input }],
        context
      );

      if (result.success && result.results[toolName]) {
        return {
          success: true,
          result: result.results[toolName] as T,
          attempts: attempt + 1,
        };
      }

      // If tool failed, try fallback
      if (result.errors?.[toolName] && options.onError) {
        const fallback = await options.onError(result.errors[toolName], attempt);
        if (fallback !== null) {
          return {
            success: true,
            result: fallback,
            attempts: attempt + 1,
          };
        }
      }

      lastError = result.errors?.[toolName] || new Error('Tool execution failed');
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Try fallback if available
      if (options.onError) {
        const fallback = await options.onError(lastError, attempt);
        if (fallback !== null) {
          return {
            success: true,
            result: fallback,
            attempts: attempt + 1,
          };
        }
      }

      // If not last attempt, wait and retry
      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  return {
    success: false,
    error: lastError || new Error('Tool execution failed after retries'),
    attempts: maxRetries + 1,
  };
}

/**
 * Create a Genkit tool wrapper with robust error handling
 * 
 * This function wraps a Genkit tool definition to add retry logic
 * and error handling automatically.
 */
export function wrapGenkitTool<TInput, TOutput>(
  toolName: string,
  toolFunction: (input: TInput, context: OrchestrationContext) => Promise<TOutput>,
  options: {
    maxRetries?: number;
    timeout?: number;
    onError?: (error: Error, input: TInput, context: OrchestrationContext) => Promise<TOutput | null>;
  } = {}
) {
  return async (input: TInput, context: OrchestrationContext): Promise<TOutput> => {
    const maxRetries = options.maxRetries ?? 3;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Set timeout if specified
        const executionPromise = toolFunction(input, context);
        
        const result = options.timeout
          ? await Promise.race([
              executionPromise,
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error(`Tool ${toolName} timed out`)), options.timeout)
              ),
            ])
          : await executionPromise;

        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Try fallback if available
        if (options.onError) {
          const fallback = await options.onError(lastError, input, context);
          if (fallback !== null) {
            return fallback;
          }
        }

        // If not last attempt, wait and retry
        if (attempt < maxRetries) {
          const delay = 1000 * Math.pow(2, attempt); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }

    // All retries exhausted
    throw lastError || new Error(`Tool ${toolName} failed after ${maxRetries} retries`);
  };
}

/**
 * Example: Using robust orchestrator in a Genkit flow
 * 
 * @example
 * ```typescript
 * import { ai } from '@genkit-ai/ai';
 * import { executeGenkitTools, generateGenkitResponse } from '@/lib/orchestration/genkit-integration';
 * 
 * export const myFlow = ai.defineFlow({
 *   name: 'myFlow',
 *   inputSchema: z.object({ message: z.string() }),
 *   outputSchema: z.object({ response: z.string() }),
 * }, async (input) => {
 *   // Execute tools with robust error handling
 *   const result = await executeGenkitTools(
 *     [
 *       { toolName: 'generateMealPlan', input: { duration: 7 } },
 *       { toolName: 'analyzeNutrition', input: {} },
 *     ],
 *     {
 *       userId: 'user-123',
 *       sessionId: 'session-456',
 *       conversationHistory: [],
 *     }
 *   );
 * 
 *   // Generate user-friendly response
 *   const response = generateGenkitResponse(result, context);
 * 
 *   return { response };
 * });
 * ```
 */


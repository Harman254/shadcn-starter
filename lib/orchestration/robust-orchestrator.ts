/**
 * @fileOverview
 * Robust Tool Orchestrator with Advanced Error Handling, Retry Logic, and Context Management
 * 
 * Features:
 * - Exponential backoff retry with configurable strategies
 * - Graceful degradation with partial results
 * - Context state management across conversation turns
 * - User-friendly error message generation
 * - Cached data fallback for responsiveness
 * - Modular error handlers and retry policies
 * - Streaming partial results for better UX
 * 
 * @example
 * ```typescript
 * const orchestrator = new RobustOrchestrator({
 *   maxRetries: 3,
 *   retryDelay: 1000,
 *   enablePartialResults: true,
 *   enableContextState: true,
 * });
 * 
 * const result = await orchestrator.executeTools(toolCalls, context);
 * ```
 */

import { ToolOrchestrator, ToolCall, OrchestrationContext, OrchestrationResult, ToolDefinition } from './tool-orchestrator';
import { EnhancedToolOrchestrator, EnhancedOrchestrationOptions } from './enhanced-orchestrator';
import { getCacheManager } from './cache-manager';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface RetryOptions {
  maxRetries?: number; // Maximum number of retry attempts (default: 3)
  retryDelay?: number; // Initial delay in ms (default: 1000)
  backoffMultiplier?: number; // Exponential backoff multiplier (default: 2)
  maxDelay?: number; // Maximum delay between retries in ms (default: 30000)
  retryableErrors?: string[]; // Error patterns that should trigger retry
  nonRetryableErrors?: string[]; // Error patterns that should NOT trigger retry
}

export interface ErrorHandler {
  /**
   * Determines if an error should trigger a retry
   */
  shouldRetry(error: Error, attempt: number, maxRetries: number): boolean;
  
  /**
   * Generates a user-friendly error message
   */
  generateErrorMessage(error: Error, toolName: string, context: OrchestrationContext): string;
  
  /**
   * Creates a fallback response when tool fails
   */
  createFallbackResponse?(error: Error, toolName: string, input: any, context: OrchestrationContext): Promise<any>;
}

export interface ContextState {
  sessionId: string;
  conversationId: string;
  previousResults: Record<string, any>;
  cachedData: Record<string, { data: any; timestamp: number; ttl: number }>;
  metadata: Record<string, any>;
  lastUpdated: Date;
}

export interface RobustOrchestrationOptions extends EnhancedOrchestrationOptions {
  maxRetries?: number;
  retryOptions?: RetryOptions;
  enablePartialResults?: boolean; // Return partial results even if some tools fail
  enableContextState?: boolean; // Maintain state across conversation turns
  errorHandlers?: Map<string, ErrorHandler>; // Tool-specific error handlers
  defaultErrorHandler?: ErrorHandler; // Default error handler for all tools
  enableStaleDataFallback?: boolean; // Use stale cached data if fresh data unavailable
  staleDataThreshold?: number; // Max age for stale data in ms (default: 1 hour)
}

export interface RobustOrchestrationResult extends OrchestrationResult {
  partialResults?: Record<string, any>; // Results from tools that completed successfully
  failedTools?: string[]; // Names of tools that failed
  retryAttempts?: Record<string, number>; // Number of retries per tool
  usedCachedData?: string[]; // Tools that used cached data
  usedStaleData?: string[]; // Tools that used stale cached data
  userFriendlyErrors?: Record<string, string>; // User-friendly error messages
  contextState?: ContextState; // Updated context state
}

// ============================================================================
// DEFAULT ERROR HANDLER
// ============================================================================

/**
 * Default error handler with sensible retry logic and user-friendly messages
 */
export class DefaultErrorHandler implements ErrorHandler {
  private retryablePatterns = [
    /timeout/i,
    /network/i,
    /connection/i,
    /ECONNREFUSED/i,
    /ETIMEDOUT/i,
    /ENOTFOUND/i,
    /rate.?limit/i,
    /429/i, // HTTP 429
    /503/i, // HTTP 503
    /502/i, // HTTP 502
  ];

  private nonRetryablePatterns = [
    /authentication/i,
    /authorization/i,
    /401/i, // HTTP 401
    /403/i, // HTTP 403
    /400/i, // HTTP 400
    /invalid/i,
    /validation/i,
    /not found/i,
    /404/i, // HTTP 404
  ];

  shouldRetry(error: Error, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) return false;

    const errorMessage = error.message.toLowerCase();
    const errorStack = error.stack?.toLowerCase() || '';

    // Check if error is explicitly non-retryable
    for (const pattern of this.nonRetryablePatterns) {
      if (pattern.test(errorMessage) || pattern.test(errorStack)) {
        return false;
      }
    }

    // Check if error is retryable
    for (const pattern of this.retryablePatterns) {
      if (pattern.test(errorMessage) || pattern.test(errorStack)) {
        return true;
      }
    }

    // Default: retry transient errors, don't retry permanent errors
    return errorMessage.includes('temporary') || errorMessage.includes('retry');
  }

  generateErrorMessage(error: Error, toolName: string, context: OrchestrationContext): string {
    const errorMessage = error.message.toLowerCase();

    // Network/connection errors
    if (/network|connection|timeout|econnrefused|etimedout/.test(errorMessage)) {
      return `I'm having trouble connecting to the ${toolName} service right now. This is usually temporary - please try again in a moment.`;
    }

    // Rate limiting
    if (/rate.?limit|429/.test(errorMessage)) {
      return `The ${toolName} service is currently busy. I'll retry automatically, or you can try again in a few moments.`;
    }

    // Server errors
    if (/500|502|503|server error/.test(errorMessage)) {
      return `The ${toolName} service is experiencing issues. I'm retrying automatically, but you may need to try again later.`;
    }

    // Authentication errors
    if (/auth|401|403|unauthorized|forbidden/.test(errorMessage)) {
      return `I need your permission to use ${toolName}. Please check your account settings or sign in again.`;
    }

    // Not found errors
    if (/not found|404/.test(errorMessage)) {
      return `I couldn't find the information needed for ${toolName}. This might be because the data doesn't exist or has been removed.`;
    }

    // Validation errors
    if (/invalid|validation|400/.test(errorMessage)) {
      return `There was an issue with the request for ${toolName}. Let me try a different approach.`;
    }

    // Generic fallback
    return `I encountered an issue with ${toolName}: ${error.message}. I'll do my best to continue with the information I have.`;
  }

  async createFallbackResponse(
    error: Error,
    toolName: string,
    input: any,
    context: OrchestrationContext
  ): Promise<any> {
    // Return a minimal fallback structure
    return {
      success: false,
      error: error.message,
      toolName,
      fallback: true,
      message: this.generateErrorMessage(error, toolName, context),
    };
  }
}

// ============================================================================
// RETRY UTILITIES
// ============================================================================

/**
 * Calculate exponential backoff delay
 */
function calculateRetryDelay(
  attempt: number,
  baseDelay: number,
  multiplier: number,
  maxDelay: number
): number {
  const delay = baseDelay * Math.pow(multiplier, attempt);
  return Math.min(delay, maxDelay);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// ROBUST ORCHESTRATOR
// ============================================================================

export class RobustOrchestrator extends EnhancedToolOrchestrator {
  private maxRetries: number;
  private retryOptions: RetryOptions;
  private enablePartialResults: boolean;
  private enableContextState: boolean;
  private errorHandlers: Map<string, ErrorHandler>;
  private defaultErrorHandler: ErrorHandler;
  private enableStaleDataFallback: boolean;
  private staleDataThreshold: number;
  private contextStates: Map<string, ContextState> = new Map();
  private cacheManager = getCacheManager(); // Use different name to avoid conflict with base class cache

  constructor(options: RobustOrchestrationOptions = {}) {
    super(options);
    
    this.maxRetries = options.maxRetries ?? 3;
    this.retryOptions = {
      maxRetries: this.maxRetries,
      retryDelay: options.retryOptions?.retryDelay ?? 1000,
      backoffMultiplier: options.retryOptions?.backoffMultiplier ?? 2,
      maxDelay: options.retryOptions?.maxDelay ?? 30000,
      retryableErrors: options.retryOptions?.retryableErrors,
      nonRetryableErrors: options.retryOptions?.nonRetryableErrors,
    };
    this.enablePartialResults = options.enablePartialResults ?? true;
    this.enableContextState = options.enableContextState ?? true;
    this.errorHandlers = options.errorHandlers ?? new Map();
    this.defaultErrorHandler = options.defaultErrorHandler ?? new DefaultErrorHandler();
    this.enableStaleDataFallback = options.enableStaleDataFallback ?? true;
    this.staleDataThreshold = options.staleDataThreshold ?? 60 * 60 * 1000; // 1 hour
  }

  /**
   * Register a custom error handler for a specific tool
   */
  registerErrorHandler(toolName: string, handler: ErrorHandler): void {
    this.errorHandlers.set(toolName, handler);
  }

  /**
   * Get error handler for a tool (tool-specific or default)
   */
  private getErrorHandler(toolName: string): ErrorHandler {
    return this.errorHandlers.get(toolName) || this.defaultErrorHandler;
  }

  /**
   * Execute tools with robust error handling and retry logic
   */
  async executeTools(
    toolCalls: Array<{ toolName: string; input: any; priority?: number }>,
    context: OrchestrationContext,
    options: RobustOrchestrationOptions = {}
  ): Promise<RobustOrchestrationResult> {
    // Load or create context state
    const contextState = this.loadOrCreateContextState(context);
    
    // Merge context state with current context
    const enrichedContext: OrchestrationContext = {
      ...context,
      previousResults: {
        ...contextState.previousResults,
        ...context.previousResults,
      },
    };

    const startTime = Date.now();
    const calls: ToolCall[] = toolCalls.map((call, index) => ({
      id: `tool-${Date.now()}-${index}`,
      toolName: call.toolName,
      input: call.input,
      status: 'pending' as const,
    }));

    const results: Record<string, any> = {};
    const errors: Record<string, Error> = {};
    const partialResults: Record<string, any> = {};
    const failedTools: string[] = [];
    const retryAttempts: Record<string, number> = {};
    const usedCachedData: string[] = [];
    const usedStaleData: string[] = [];
    const userFriendlyErrors: Record<string, string> = {};

    // Execute tools with retry logic
    for (const call of calls) {
      const tool = this.tools.get(call.toolName);
      if (!tool) {
        const error = new Error(`Tool ${call.toolName} not found`);
        errors[call.toolName] = error;
        failedTools.push(call.toolName);
        const handler = this.getErrorHandler(call.toolName);
        userFriendlyErrors[call.toolName] = handler.generateErrorMessage(error, call.toolName, enrichedContext);
        continue;
      }

      // Try to execute with retries
      let result: any = null;
      let lastError: Error | null = null;
      let attempts = 0;

      for (attempts = 0; attempts <= this.maxRetries; attempts++) {
        try {
          // Check cache first (including stale data if enabled)
          if (tool.cacheKey) {
            const cacheKey = tool.cacheKey(call.input, enrichedContext);
            // Check CacheManager first
            const cached = this.cacheManager.get(cacheKey);
            
            if (cached) {
              usedCachedData.push(call.toolName);
              result = cached;
              break;
            }

            // Also check base class cache for compatibility
            const baseCached = this.cache.get(cacheKey);
            if (baseCached && Date.now() - baseCached.timestamp < baseCached.ttl) {
              usedCachedData.push(call.toolName);
              result = baseCached.result;
              break;
            }

            // Try stale data if enabled
            if (this.enableStaleDataFallback && attempts > 0) {
              const staleCacheKey = `${cacheKey}:stale`;
              const staleCached = this.cacheManager.get(staleCacheKey);
              if (staleCached) {
                // CacheManager handles TTL internally, so if we get it, it's valid
                usedStaleData.push(call.toolName);
                result = staleCached;
                break;
              }
            }
          }

          // Execute tool
          call.status = 'running';
          call.startedAt = new Date();
          
          const executionPromise = tool.execute(call.input, {
            ...enrichedContext,
            previousResults: results,
          });

          result = tool.timeout
            ? await Promise.race([
                executionPromise,
                new Promise((_, reject) =>
                  setTimeout(() => reject(new Error(`Tool ${call.toolName} timed out`)), tool.timeout)
                ),
              ])
            : await executionPromise;

          // Success - cache result
          if (tool.cacheKey) {
            const cacheKey = tool.cacheKey(call.input, enrichedContext);
            // Cache in both CacheManager and base class cache for compatibility
            this.cacheManager.set(cacheKey, result, { ttl: 5 * 60 * 1000 });
            this.cache.set(cacheKey, {
              result,
              timestamp: Date.now(),
              ttl: 5 * 60 * 1000,
            });
            
            // Also cache as stale fallback
            if (this.enableStaleDataFallback) {
              const staleCacheKey = `${cacheKey}:stale`;
              this.cacheManager.set(staleCacheKey, result, { ttl: this.staleDataThreshold });
            }
          }

          call.status = 'completed';
          call.result = result;
          call.completedAt = new Date();
          results[call.toolName] = result;
          partialResults[call.toolName] = result;
          break; // Success, exit retry loop

        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          call.error = lastError;
          retryAttempts[call.toolName] = attempts + 1;

          const handler = this.getErrorHandler(call.toolName);
          
          // Check if we should retry
          if (attempts < this.maxRetries && handler.shouldRetry(lastError, attempts, this.maxRetries)) {
            // Calculate delay with exponential backoff
            const delay = calculateRetryDelay(
              attempts,
              this.retryOptions.retryDelay,
              this.retryOptions.backoffMultiplier,
              this.retryOptions.maxDelay
            );

            // Add jitter to prevent thundering herd
            const jitter = Math.random() * 0.3 * delay; // Up to 30% jitter
            const finalDelay = delay + jitter;

            console.log(`[RobustOrchestrator] Retrying ${call.toolName} (attempt ${attempts + 1}/${this.maxRetries}) after ${finalDelay}ms`);
            await sleep(finalDelay);
            continue;
          }

          // No more retries - try fallback
          if (handler.createFallbackResponse) {
            try {
              const fallbackResult = await handler.createFallbackResponse(
                lastError,
                call.toolName,
                call.input,
                enrichedContext
              );
              result = fallbackResult;
              partialResults[call.toolName] = fallbackResult;
              call.status = 'completed';
              call.result = result;
              break;
            } catch (fallbackError) {
              // Fallback also failed
              console.error(`[RobustOrchestrator] Fallback for ${call.toolName} also failed:`, fallbackError);
            }
          }

          // All retries exhausted and no fallback
          call.status = 'failed';
          call.completedAt = new Date();
          errors[call.toolName] = lastError;
          failedTools.push(call.toolName);
          userFriendlyErrors[call.toolName] = handler.generateErrorMessage(lastError, call.toolName, enrichedContext);
          break;
        }
      }
    }

    // Update context state
    if (this.enableContextState) {
      contextState.previousResults = {
        ...contextState.previousResults,
        ...results,
      };
      contextState.lastUpdated = new Date();
      this.saveContextState(contextState);
    }

    // Aggregate results
    const aggregatedData = this.aggregateResults(results, enrichedContext);

    return {
      success: failedTools.length === 0,
      results,
      aggregatedData,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
      executionTime: Date.now() - startTime,
      toolCalls: calls,
      partialResults: this.enablePartialResults ? partialResults : undefined,
      failedTools: failedTools.length > 0 ? failedTools : undefined,
      retryAttempts: Object.keys(retryAttempts).length > 0 ? retryAttempts : undefined,
      usedCachedData: usedCachedData.length > 0 ? usedCachedData : undefined,
      usedStaleData: usedStaleData.length > 0 ? usedStaleData : undefined,
      userFriendlyErrors: Object.keys(userFriendlyErrors).length > 0 ? userFriendlyErrors : undefined,
      contextState: this.enableContextState ? contextState : undefined,
    };
  }

  /**
   * Load or create context state for a session
   */
  private loadOrCreateContextState(context: OrchestrationContext): ContextState {
    if (!this.enableContextState || !context.sessionId) {
      return this.createEmptyContextState(context);
    }

    const existing = this.contextStates.get(context.sessionId);
    if (existing) {
      return existing;
    }

    const newState = this.createEmptyContextState(context);
    this.contextStates.set(context.sessionId, newState);
    return newState;
  }

  /**
   * Create empty context state
   */
  private createEmptyContextState(context: OrchestrationContext): ContextState {
    return {
      sessionId: context.sessionId || 'default',
      conversationId: context.sessionId || 'default',
      previousResults: {},
      cachedData: {},
      metadata: {},
      lastUpdated: new Date(),
    };
  }

  /**
   * Save context state
   */
  private saveContextState(state: ContextState): void {
    this.contextStates.set(state.sessionId, state);
  }

  /**
   * Get context state for a session
   */
  getContextState(sessionId: string): ContextState | undefined {
    return this.contextStates.get(sessionId);
  }

  /**
   * Clear context state for a session
   */
  clearContextState(sessionId: string): void {
    this.contextStates.delete(sessionId);
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let robustOrchestratorInstance: RobustOrchestrator | null = null;

export function getRobustOrchestrator(options?: RobustOrchestrationOptions): RobustOrchestrator {
  if (!robustOrchestratorInstance) {
    robustOrchestratorInstance = new RobustOrchestrator(options);
  }
  return robustOrchestratorInstance;
}


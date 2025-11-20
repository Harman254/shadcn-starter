# Robust Orchestration Guide

This guide explains how to use the robust orchestration layer for handling tool calls with error handling, retries, context management, and user-friendly responses.

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Error Handling](#error-handling)
4. [Retry Logic](#retry-logic)
5. [Context State Management](#context-state-management)
6. [Partial Results](#partial-results)
7. [Caching and Stale Data](#caching-and-stale-data)
8. [User-Friendly Responses](#user-friendly-responses)
9. [Best Practices](#best-practices)

## Overview

The `RobustOrchestrator` extends the `EnhancedToolOrchestrator` with:

- **Automatic Retry Logic**: Exponential backoff with configurable strategies
- **Error Handling**: Custom error handlers per tool with fallback responses
- **Context State**: Maintains state across conversation turns
- **Partial Results**: Returns successful results even if some tools fail
- **Stale Data Fallback**: Uses cached data when fresh data is unavailable
- **User-Friendly Messages**: Converts technical errors to natural language

## Quick Start

```typescript
import { RobustOrchestrator } from '@/lib/orchestration/robust-orchestrator';
import { mealPlanningTools } from '@/lib/orchestration/tools/meal-planning-tools';

// Create orchestrator
const orchestrator = new RobustOrchestrator({
  maxRetries: 3,
  enablePartialResults: true,
  enableContextState: true,
  enableStaleDataFallback: true,
});

// Register tools
orchestrator.registerTools(mealPlanningTools);

// Execute tools
const result = await orchestrator.executeTools(
  [
    { toolName: 'generateMealPlan', input: { duration: 7, mealsPerDay: 3 } },
    { toolName: 'analyzeNutrition', input: {} },
  ],
  {
    userId: 'user-123',
    sessionId: 'session-456',
    conversationHistory: [],
  }
);

// Check results
if (result.success) {
  console.log('All tools succeeded:', result.results);
} else {
  console.log('Partial results:', result.partialResults);
  console.log('Failed tools:', result.failedTools);
  console.log('User-friendly errors:', result.userFriendlyErrors);
}
```

## Error Handling

### Default Error Handler

The orchestrator includes a `DefaultErrorHandler` that:

- Identifies retryable vs non-retryable errors
- Generates user-friendly error messages
- Provides fallback responses when possible

### Custom Error Handlers

Create tool-specific error handlers:

```typescript
import { ErrorHandler, DefaultErrorHandler } from '@/lib/orchestration/robust-orchestrator';

class CustomErrorHandler extends DefaultErrorHandler {
  shouldRetry(error: Error, attempt: number, maxRetries: number): boolean {
    // Custom retry logic
    if (error.message.includes('rate limit') && attempt < 5) {
      return true; // Retry rate limit errors up to 5 times
    }
    return super.shouldRetry(error, attempt, maxRetries);
  }

  generateErrorMessage(error: Error, toolName: string, context: OrchestrationContext): string {
    // Custom error messages
    if (error.message.includes('ingredient not found')) {
      return `Some ingredients aren't in my database. I'll use estimated values.`;
    }
    return super.generateErrorMessage(error, toolName, context);
  }

  async createFallbackResponse(error: Error, toolName: string, input: any, context: OrchestrationContext) {
    // Return fallback data
    return {
      success: false,
      fallback: true,
      data: getEstimatedData(input),
      message: 'Using estimated values due to service unavailability',
    };
  }
}

// Register handler
orchestrator.registerErrorHandler('analyzeNutrition', new CustomErrorHandler());
```

## Retry Logic

### Retry Options

Configure retry behavior:

```typescript
const orchestrator = new RobustOrchestrator({
  maxRetries: 5,
  retryOptions: {
    retryDelay: 1000,        // Initial delay: 1 second
    backoffMultiplier: 2,    // Double delay each retry
    maxDelay: 30000,         // Cap at 30 seconds
    retryableErrors: [       // Patterns that trigger retry
      'timeout',
      'network',
      'rate limit',
    ],
    nonRetryableErrors: [    // Patterns that skip retry
      'authentication',
      'not found',
      'invalid input',
    ],
  },
});
```

### Retry Behavior

- **Exponential Backoff**: Delay increases exponentially: 1s, 2s, 4s, 8s...
- **Jitter**: Random variation (up to 30%) to prevent thundering herd
- **Max Retries**: Configurable per orchestrator instance
- **Error Classification**: Automatically determines if error is retryable

## Context State Management

### Maintaining State Across Turns

The orchestrator maintains context state across conversation turns:

```typescript
// Turn 1: Generate meal plan
const result1 = await orchestrator.executeTools(
  [{ toolName: 'generateMealPlan', input: { duration: 7 } }],
  { sessionId: 'session-123', ... }
);

// Turn 2: Use previous results (automatically available)
const result2 = await orchestrator.executeTools(
  [{ toolName: 'analyzeNutrition', input: {} }],
  { sessionId: 'session-123', ... } // Same session ID
);

// Nutrition tool can access meal plan from context state
const contextState = orchestrator.getContextState('session-123');
console.log(contextState.previousResults.generateMealPlan);
```

### Context State Structure

```typescript
interface ContextState {
  sessionId: string;
  conversationId: string;
  previousResults: Record<string, any>;  // Results from previous tools
  cachedData: Record<string, any>;       // Cached data
  metadata: Record<string, any>;          // Custom metadata
  lastUpdated: Date;
}
```

## Partial Results

Enable partial results to continue even if some tools fail:

```typescript
const orchestrator = new RobustOrchestrator({
  enablePartialResults: true, // Return successful results even if some fail
});

const result = await orchestrator.executeTools(
  [
    { toolName: 'generateMealPlan', input: {} },
    { toolName: 'analyzeNutrition', input: {} },
    { toolName: 'getGroceryPricing', input: {} },
  ],
  context
);

// Check what succeeded
if (result.partialResults) {
  console.log('Completed:', Object.keys(result.partialResults));
}

// Check what failed
if (result.failedTools) {
  console.log('Failed:', result.failedTools);
  console.log('Errors:', result.userFriendlyErrors);
}
```

## Caching and Stale Data

### Cache Configuration

Tools can define cache keys:

```typescript
const tool: ToolDefinition = {
  name: 'myTool',
  cacheKey: (input, context) => {
    return `myTool:${input.param1}:${context.userId}`;
  },
  // ...
};
```

### Stale Data Fallback

Use stale cached data when fresh data is unavailable:

```typescript
const orchestrator = new RobustOrchestrator({
  enableStaleDataFallback: true,
  staleDataThreshold: 60 * 60 * 1000, // 1 hour
});

const result = await orchestrator.executeTools(toolCalls, context);

// Check if stale data was used
if (result.usedStaleData) {
  console.log('Used stale data for:', result.usedStaleData);
}
```

## User-Friendly Responses

Generate natural language responses from orchestration results:

```typescript
import { generateRobustResponse } from '@/lib/orchestration/response-generator-robust';

const response = generateRobustResponse(result, context, {
  includePartialResults: true,
  explainLimitations: true,
  maintainContext: true,
  tone: 'friendly', // 'friendly' | 'professional' | 'casual'
});

console.log(response);
// "I've got some information for you. I used cached data for nutrition analysis
//  to give you a quick response. However, I wasn't able to get pricing information
//  right now - the service is temporarily unavailable. I'm retrying automatically."
```

### Response Options

- **includePartialResults**: Mention successful tools in response
- **explainLimitations**: Transparently explain data limitations
- **maintainContext**: Reference previous conversation
- **tone**: Adjust response tone (friendly/professional/casual)

## Best Practices

### 1. Always Enable Partial Results

```typescript
enablePartialResults: true // Don't fail entire operation if one tool fails
```

### 2. Use Context State for Multi-Turn Conversations

```typescript
enableContextState: true // Maintain state across turns
```

### 3. Configure Appropriate Retry Strategies

```typescript
// For critical operations
maxRetries: 5,
retryOptions: {
  retryDelay: 500,
  backoffMultiplier: 1.5,
}

// For non-critical operations
maxRetries: 2,
retryOptions: {
  retryDelay: 1000,
  backoffMultiplier: 2,
}
```

### 4. Provide Fallback Responses

```typescript
onError: async (error, input, context) => {
  // Always return something useful, even if it's a fallback
  return {
    success: false,
    fallback: true,
    data: getMinimalData(input),
    message: 'Using limited data due to service unavailability',
  };
}
```

### 5. Use Stale Data for Better UX

```typescript
enableStaleDataFallback: true,
staleDataThreshold: 60 * 60 * 1000, // 1 hour
```

### 6. Generate User-Friendly Messages

```typescript
// Always use userFriendlyErrors in UI
if (result.userFriendlyErrors) {
  showError(result.userFriendlyErrors[toolName]);
}
```

### 7. Monitor Retry Attempts

```typescript
if (result.retryAttempts) {
  // Log retry patterns for monitoring
  console.log('Retries:', result.retryAttempts);
}
```

## Integration with Genkit

The robust orchestrator works seamlessly with Genkit:

```typescript
import { ai } from '@genkit-ai/ai';

// In your Genkit flow
export const myFlow = ai.defineFlow({
  name: 'myFlow',
  inputSchema: z.object({ message: z.string() }),
  outputSchema: z.object({ response: z.string() }),
}, async (input) => {
  const orchestrator = getRobustOrchestrator();
  
  // Execute tools
  const result = await orchestrator.executeTools(toolCalls, context);
  
  // Generate response
  const response = generateRobustResponse(result, context);
  
  return { response };
});
```

## Error Patterns

The default error handler recognizes these patterns:

### Retryable Errors
- Network/connection errors
- Timeouts
- Rate limiting (429)
- Server errors (500, 502, 503)

### Non-Retryable Errors
- Authentication (401)
- Authorization (403)
- Not found (404)
- Validation errors (400)

Customize these patterns in `retryOptions`.


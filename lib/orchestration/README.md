# Orchestration Layer

This directory contains the orchestration system for managing multiple tool calls in the meal planning chatbot.

## Architecture

```
tool-orchestrator.ts          # Base orchestrator with dependency management
enhanced-orchestrator.ts      # Enhanced version with concurrency, progress tracking
robust-orchestrator.ts        # Robust version with retry, error handling, context state
response-generator-robust.ts  # User-friendly response generation
genkit-integration.ts         # Integration utilities for Genkit flows
```

## Quick Start

### Basic Usage

```typescript
import { RobustOrchestrator } from '@/lib/orchestration/robust-orchestrator';
import { mealPlanningTools } from '@/lib/orchestration/tools/meal-planning-tools';

const orchestrator = new RobustOrchestrator({
  maxRetries: 3,
  enablePartialResults: true,
  enableContextState: true,
});

orchestrator.registerTools(mealPlanningTools);

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
```

### With Genkit Integration

```typescript
import { executeGenkitTools, generateGenkitResponse } from '@/lib/orchestration/genkit-integration';

// In a Genkit flow
const result = await executeGenkitTools(toolCalls, context);
const response = generateGenkitResponse(result, context);
```

## Features

### ✅ Error Handling & Retries
- Exponential backoff retry logic
- Custom error handlers per tool
- Fallback responses
- User-friendly error messages

### ✅ Context State Management
- Maintains state across conversation turns
- Automatic result caching
- Previous results available to dependent tools

### ✅ Partial Results
- Returns successful results even if some tools fail
- Graceful degradation
- Transparent limitation explanations

### ✅ Caching & Performance
- Automatic result caching
- Stale data fallback
- Memory management

### ✅ User Experience
- Natural language responses
- Progress tracking
- Streaming results

## Documentation

- [Robust Orchestration Guide](./ROBUST_ORCHESTRATION_GUIDE.md) - Complete guide with examples
- [Examples](./examples/robust-orchestration-example.ts) - Code examples

## Key Files

- `robust-orchestrator.ts` - Main robust orchestrator implementation
- `response-generator-robust.ts` - Response generation utilities
- `genkit-integration.ts` - Genkit integration helpers
- `tools/meal-planning-tools.ts` - Tool definitions

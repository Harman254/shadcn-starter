# Meal Planning Orchestration System

A comprehensive, modular orchestration layer for building a Perplexity AI-like meal planning chatbot with multiple tool calls, state management, and intelligent response generation.

## 🏗️ Architecture Overview

```
User Message
    ↓
Orchestrated Chat Flow
    ↓
Intent Detection → Tool Selection
    ↓
Tool Orchestrator (Dependency Resolution)
    ↓
Parallel/Sequential Tool Execution
    ↓
API Clients (Nutrition, Pricing) with Fallbacks
    ↓
Result Aggregation
    ↓
Response Generator (Natural Language)
    ↓
Enhanced State Management (Refinements)
    ↓
User Response
```

## 📦 Components

### 1. Tool Orchestrator (`tool-orchestrator.ts`)
- Manages multiple tool calls with dependency resolution
- Supports parallel and sequential execution
- Handles errors with fallback mechanisms
- Caching support

### 2. API Clients
- **Nutrition API** (`api-clients/nutrition-api.ts`): Multiple providers with fallback
- **Grocery Pricing API** (`api-clients/grocery-pricing-api.ts`): Local pricing with estimation

### 3. Response Generator (`response-generator.ts`)
- Combines tool results into natural language
- Generates suggestions for next actions
- Calculates confidence levels

### 4. Cache Manager (`cache-manager.ts`)
- TTL-based caching
- Tag-based invalidation
- Automatic cleanup

### 5. Enhanced Chat State (`enhanced-chat-state.ts`)
- Manages conversation state
- Handles refinements and iterations
- State snapshots for undo/redo

### 6. Tool Definitions (`tools/meal-planning-tools.ts`)
- Pre-configured tools for meal planning
- Dependency management
- Error handling

## 🚀 Quick Start

### Basic Usage

```typescript
import { getOrchestratedChatFlow } from '@/lib/orchestration/orchestrated-chat-flow';

const chatFlow = getOrchestratedChatFlow();

const result = await chatFlow.processMessage({
  message: "Generate a 7-day meal plan with nutrition info and grocery prices",
  userId: "user123",
  sessionId: "session456",
  conversationHistory: [
    { role: 'user', content: 'I want a meal plan' },
    { role: 'assistant', content: 'I can help with that!' }
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

console.log(result.response); // Natural language response
console.log(result.structuredData); // Structured data (meal plan, nutrition, etc.)
console.log(result.suggestions); // Next action suggestions
```

### Advanced: Custom Tool Definition

```typescript
import { ToolDefinition } from '@/lib/orchestration/tool-orchestrator';
import { getOrchestrator } from '@/lib/orchestration/tool-orchestrator';

const customTool: ToolDefinition = {
  name: 'customAnalysis',
  
  async execute(input, context) {
    // Your tool logic here
    return { result: 'analysis complete' };
  },
  
  validateInput(input) {
    return typeof input.query === 'string';
  },
  
  getDependencies() {
    return ['generateMealPlan']; // Depends on meal plan
  },
  
  cacheKey(input, context) {
    return `custom:${input.query}:${context.userId}`;
  },
  
  timeout: 10000, // 10 seconds
};

// Register tool
const orchestrator = getOrchestrator();
orchestrator.registerTool(customTool);
```

### Integration with Genkit Flow

```typescript
// ai/flows/orchestrated-chat.ts
import { ai } from '@/ai/instance';
import { getOrchestratedChatFlow } from '@/lib/orchestration/orchestrated-chat-flow';
import { z } from 'zod';

const OrchestratedChatInputSchema = z.object({
  message: z.string(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
  userPreferences: z.any().optional(),
  locationData: z.any().optional(),
});

export const orchestratedChatFlow = ai.defineFlow(
  {
    name: 'orchestratedChatFlow',
    inputSchema: OrchestratedChatInputSchema,
    outputSchema: z.object({
      response: z.string(),
      structuredData: z.any().optional(),
      suggestions: z.array(z.string()).optional(),
    }),
  },
  async (input) => {
    const chatFlow = getOrchestratedChatFlow();
    return await chatFlow.processMessage(input);
  }
);
```

## 🔧 Configuration

### Environment Variables

```env
# Nutrition API
NUTRITION_API_KEY=your_edamam_key
EDAMAM_APP_ID=your_app_id
USDA_API_KEY=your_usda_key

# Grocery Pricing API
GROCERY_API_KEY=your_grocery_api_key
```

### Caching Configuration

```typescript
import { getCacheManager } from '@/lib/orchestration/cache-manager';

const cache = getCacheManager();

// Set with custom TTL
cache.set('key', data, {
  ttl: 10 * 60 * 1000, // 10 minutes
  tags: ['meal-plans', 'user-123'],
});

// Invalidate by tags
cache.invalidateByTags(['meal-plans']);
```

## 📊 State Management

### Handling Refinements

```typescript
import { getChatStateManager } from '@/lib/orchestration/enhanced-chat-state';

const stateManager = getChatStateManager();

// User wants to swap a meal
stateManager.addRefinement({
  type: 'replace',
  target: 'meal:1:2', // Day 1, Meal 2
  value: { name: 'New Meal', ... },
  originalValue: { name: 'Old Meal', ... },
});

// Apply refinements
const refinedPlan = stateManager.applyRefinementsToMealPlan(mealPlan);
```

## 🎯 Best Practices

1. **Tool Dependencies**: Always define dependencies correctly to ensure proper execution order
2. **Error Handling**: Use `onError` handlers for graceful fallbacks
3. **Caching**: Cache expensive operations (API calls, complex calculations)
4. **State Management**: Save snapshots frequently for undo/redo functionality
5. **Response Generation**: Always provide structured data alongside natural language

## 🔄 Integration with Existing System

The orchestration system integrates seamlessly with your existing:
- `generateMealPlanCore` - Used by `mealPlanTool`
- `generateGroceryListCore` - Used by `groceryListTool`
- Chat store (`store/chat-store.ts`) - Can be extended to use `EnhancedChatStateManager`
- Location caching (`lib/location.ts`) - Used by pricing tool

## 📈 Performance Optimization

1. **Parallel Execution**: Tools without dependencies run in parallel
2. **Caching**: Results cached with appropriate TTLs
3. **Batch Operations**: Nutrition API supports batch requests
4. **Lazy Loading**: Tools only execute when needed

## 🧪 Testing

```typescript
// Example test
import { getOrchestrator } from '@/lib/orchestration/tool-orchestrator';
import { mealPlanningTools } from '@/lib/orchestration/tools/meal-planning-tools';

const orchestrator = getOrchestrator();
orchestrator.registerTools(mealPlanningTools);

const result = await orchestrator.executeTools(
  [
    { toolName: 'generateMealPlan', input: { duration: 1, mealsPerDay: 3 } },
    { toolName: 'analyzeNutrition', input: {} },
  ],
  { conversationHistory: [] }
);

console.log(result.success); // true/false
console.log(result.results); // Tool results
```

## 🚧 Extending the System

### Adding New Tools

1. Create tool definition in `tools/`
2. Register in `orchestrated-chat-flow.ts`
3. Update `determineToolCalls()` to detect when to use it

### Adding New API Clients

1. Create client in `api-clients/`
2. Implement fallback mechanisms
3. Integrate with cache manager
4. Add to tool definitions

## 📝 License

Part of the Mealwise application.



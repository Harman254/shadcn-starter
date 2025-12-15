# Integration Guide: Orchestration System

## 🎯 Quick Start

### Step 1: Install Dependencies

The orchestration system uses existing dependencies. No additional packages needed.

### Step 2: Basic Integration

Replace your current chat flow with the orchestrated version:

```typescript
// app/actions.ts (or your existing actions file)
import { processOrchestratedChat } from '@/app/actions/orchestrated-chat';

export async function getResponse(
  chatType: 'context-aware' | 'tool-selection',
  messages: Message[],
  preferencesSummary?: string
): Promise<Message> {
  // Use orchestrated chat for enhanced experience
  if (chatType === 'context-aware') {
    const result = await processOrchestratedChat({
      message: messages[messages.length - 1].content,
      conversationHistory: messages.slice(0, -1),
    });

    return {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: result.response,
      ui: result.structuredData, // Add structured data as UI metadata
    };
  }
  
  // Fallback to existing flow
  // ... your existing code
}
```

### Step 3: Update Chat Panel

```typescript
// components/chat/chat-panel.tsx
import { OrchestratedChatPanel } from './orchestrated-chat-panel';

// Replace your existing ChatPanel with:
<OrchestratedChatPanel chatType="context-aware" />
```

## 🔄 Migration Path

### Option 1: Gradual Migration

Keep existing flow, add orchestration for specific intents:

```typescript
// In context-aware.ts
if (isComplexRequest) {
  // Use orchestration for complex requests
  const chatFlow = getOrchestratedChatFlow();
  return await chatFlow.processMessage({...});
} else {
  // Use existing simple flow
  return await existingFlow({...});
}
```

### Option 2: Full Replacement

Replace entire chat flow with orchestration system.

## 🎨 UI Integration

### Display Structured Data

```typescript
// components/chat/chat-message.tsx
{message.ui?.mealPlan && (
  <MealPlanDisplay mealPlan={message.ui.mealPlan} />
)}

{message.ui?.groceryList && (
  <GroceryListDisplay groceryList={message.ui.groceryList} />
)}
```

### Show Suggestions

```typescript
// components/chat/quick-actions.tsx
{result.suggestions?.map(suggestion => (
  <Button onClick={() => handleSuggestion(suggestion)}>
    {suggestion}
  </Button>
))}
```

## 🔧 Configuration

### Environment Variables

Add to `.env.local`:

```env
# Nutrition APIs
NUTRITION_API_KEY=your_edamam_key
EDAMAM_APP_ID=your_app_id
USDA_API_KEY=your_usda_key

# Grocery Pricing (optional)
GROCERY_API_KEY=your_key
```

### Cache Configuration

```typescript
// lib/orchestration/cache-manager.ts
// Adjust TTLs based on your needs
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
```

## 📝 Examples

See `lib/orchestration/examples/basic-usage.ts` for complete examples.

## 🚀 Advanced Usage

### Custom Tool Registration

```typescript
import { getOrchestrator } from '@/lib/orchestration/tool-orchestrator';
import { ToolDefinition } from '@/lib/orchestration/tool-orchestrator';

const myCustomTool: ToolDefinition = {
  name: 'myTool',
  async execute(input, context) {
    // Your logic
  },
  // ... other properties
};

const orchestrator = getOrchestrator();
orchestrator.registerTool(myCustomTool);
```

### State Management Integration

```typescript
import { getChatStateManager } from '@/lib/orchestration/enhanced-chat-state';

const stateManager = getChatStateManager();

// In your chat component
useEffect(() => {
  const state = stateManager.getState();
  if (state.activeMealPlan) {
    // Update UI with active meal plan
  }
}, []);
```

## 🐛 Troubleshooting

### Tools Not Executing

1. Check tool registration: `orchestrator.registerTools([...])`
2. Verify dependencies are correct
3. Check `shouldExecute()` conditions

### API Errors

1. Verify API keys in environment variables
2. Check fallback mechanisms are working
3. Review error logs in console

### Performance Issues

1. Enable caching for expensive operations
2. Check for unnecessary tool calls
3. Review dependency graph for optimization

## 📚 Next Steps

1. **Add More Tools**: Create tools for recipe search, meal swapping, etc.
2. **Enhance APIs**: Integrate more nutrition/pricing providers
3. **Improve Caching**: Add Redis for distributed caching
4. **Add Analytics**: Track tool usage and performance




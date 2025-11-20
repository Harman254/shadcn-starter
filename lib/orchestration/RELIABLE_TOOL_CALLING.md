# Reliable Tool Calling System

This document explains the reliable tool calling system that ensures deterministic tool calls and smooth conversation flow like Perplexity AI.

## Overview

The system uses **pre-flight detection** to determine if a tool should be called BEFORE the AI processes the message. This ensures:

1. **Deterministic tool calls** - Tools are called reliably when needed
2. **Smooth conversation flow** - No awkward pauses or acknowledgments
3. **Natural responses** - The AI responds naturally, either with tools or text
4. **No broken flows** - Tool failures don't break the conversation

## How It Works

### 1. Pre-Flight Detection

Before the AI processes the message, the system runs deterministic pattern matching to detect tool requests:

```typescript
const toolDecision = ReliableToolCaller.detectToolCall(
  userMessage,
  conversationHistory,
  context
);
```

This returns:
- `shouldCallTool`: Whether a tool should be called
- `toolName`: Which tool to call
- `confidence`: 'high' | 'medium' | 'low'
- `reason`: Why this decision was made

### 2. Tool Call Priority

Tools are detected in priority order:

1. **Grocery List** (highest priority)
2. **Meal Plan**
3. **Save Meal Plan**

### 3. Forced Tool Calls

If pre-flight detection says a tool should be called with high confidence, but the AI doesn't call it, the system **forces the tool call**:

```typescript
if (toolDecision.shouldCallTool && toolDecision.confidence === 'high' && !hasToolCalls) {
  // Force tool call
  await executeTool(toolDecision.toolName, toolDecision.toolInput);
}
```

This ensures reliability even if the AI prompt doesn't trigger correctly.

## Detection Patterns

### Grocery List Detection

**High Confidence:**
- "create grocery list"
- "grocery list for this meal plan"
- "what do I need to buy"
- "shopping list for meal plan"

**Medium Confidence:**
- "grocery list"
- "shopping list"
- "list for meal plan"

### Meal Plan Detection

**High Confidence:**
- "create meal plan"
- "generate 7-day meal plan"
- "meal plan for 3 days"

**Medium Confidence:**
- "meal plan"
- "plan meals"
- "7 day plan"

## Conversation Flow

The system ensures smooth conversation flow:

1. **Tool Mode**: When a tool is detected, it's called immediately (no text before/after)
2. **Chat Mode**: When no tool is needed, natural conversation continues
3. **Error Handling**: Tool failures don't break the flow - graceful fallback responses

## Benefits

✅ **Reliability**: Tools are called deterministically, not dependent on AI prompt interpretation
✅ **Smooth Flow**: No awkward "I will..." acknowledgments
✅ **Natural Feel**: Like Perplexity AI - tools feel seamless
✅ **Scalable**: Easy to add new tools with clear detection patterns

## Adding New Tools

To add a new tool:

1. Add detection method in `ReliableToolCaller`:
```typescript
private static detectNewToolRequest(
  messageLower: string,
  conversationHistory: Array<...>,
  context: OrchestrationContext
): ToolCallDecision {
  // Detection logic
}
```

2. Add to `detectToolCall` method with appropriate priority

3. Add forced execution logic if needed

## Example Flow

**User**: "Create a grocery list for this meal plan"

1. Pre-flight detection: ✅ Grocery list request (high confidence)
2. Check meal plan exists: ✅ Found in conversation history
3. Force tool call: ✅ Execute `generate_grocery_list`
4. Return result: ✅ Grocery list displayed

**Result**: Smooth, reliable, Perplexity-like experience


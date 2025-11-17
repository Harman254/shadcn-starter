# Tool Calls Testing Guide

## How Tool Calls Work

### Architecture
1. **Tools Defined**: `logMeal`, `generateMealPlan`, `saveMealPlan` are defined using `ai.defineTool()`
2. **Tools Added to Prompt**: Tools are passed to `ai.definePrompt()` via the `tools` array
3. **Genkit Handles Execution**: When the AI decides to use a tool, Genkit automatically:
   - Executes the tool function
   - Passes the result back to the AI
   - AI includes the result in the final answer
4. **Response**: The final answer (including tool results) is returned as `output.answer`

### Flow
```
User Message → answerQuestion() → answerQuestionPrompt (with tools)
  ↓
AI decides to use tool → Genkit executes tool → Tool returns result
  ↓
AI receives tool result → AI formulates final answer → Returns to user
```

## Testing Checklist

### 1. Test Meal Plan Generation
**Command**: "Generate a 7-day meal plan"
**Expected**:
- ✅ `generate_meal_plan` tool is called
- ✅ Tool receives: `{ duration: 7, mealsPerDay: 3 }`
- ✅ Tool generates meal plan using user preferences
- ✅ Tool returns success message with meal plan data
- ✅ AI automatically calls `save_meal_plan` tool
- ✅ Meal plan is saved to database
- ✅ User sees confirmation message

### 2. Test Meal Plan Saving
**Command**: "Save my meal plan"
**Expected**:
- ✅ `save_meal_plan` tool is called
- ✅ Tool receives meal plan data
- ✅ Tool saves to database
- ✅ User sees success message

### 3. Test Log Meal
**Command**: "I ate pizza for dinner"
**Expected**:
- ✅ `logMeal` tool is called
- ✅ Tool receives meal description
- ✅ User sees confirmation message

### 4. Test Without Preferences
**Command**: "Generate a meal plan"
**Expected**:
- ✅ Tool detects no preferences
- ✅ Returns helpful error message
- ✅ User is directed to set preferences

### 5. Test Without Authentication
**Command**: "Generate a meal plan" (while logged out)
**Expected**:
- ✅ Tool detects no session
- ✅ Returns authentication error
- ✅ User is prompted to sign in

## Debugging

### Development Logs
When `NODE_ENV === 'development'`, the following logs will appear:

1. **Tool Call Initiation**:
   ```
   [answerQuestionFlow] Tools available: ['logMeal', 'generateMealPlan', 'saveMealPlan']
   [answerQuestionFlow] Processing question: "Generate a meal plan"
   ```

2. **Tool Execution**:
   ```
   [generateMealPlan] Tool called with input: { duration: 7, mealsPerDay: 3 }
   [generateMealPlan] ✅ Successfully generated meal plan: { title: "...", days: 7, totalMeals: 21 }
   ```

3. **Save Execution**:
   ```
   [saveMealPlan] Tool called with input: { title: "...", duration: 7, ... }
   [saveMealPlan] Save result: { success: true, mealPlanId: "..." }
   ```

4. **Final Response**:
   ```
   [answerQuestionFlow] Received output: { hasAnswer: true, answerLength: 150, ... }
   ```

### Common Issues

1. **Tool Not Called**
   - Check if `chatType === 'tool-selection'`
   - Verify tools are in the `tools` array
   - Check prompt instructions

2. **Tool Error**
   - Check console for error logs
   - Verify user is authenticated
   - Verify user has preferences set

3. **Tool Result Not in Response**
   - Genkit automatically includes tool results
   - Check if tool returned proper format
   - Verify output schema matches

## Verification Steps

1. **Check Console Logs** (Development)
   - Look for tool call logs
   - Verify tool execution
   - Check for errors

2. **Check Database**
   - Verify meal plan was created
   - Check MealPlan, DayMeal, Meal records
   - Verify analytics updated

3. **Check User Experience**
   - User sees confirmation message
   - Meal plan appears in meal plans list
   - No errors displayed

## Production Monitoring

Monitor these metrics:
- Tool call success rate
- Tool execution time
- Error rates by tool
- User satisfaction with tool results


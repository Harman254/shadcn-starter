# How the Save Meal Plan Tool Call Works

## 📋 Overview

The save meal plan tool call is a complete flow that allows users to save AI-generated meal plans directly from the chat interface. Here's how it works end-to-end.

## 🔄 Complete Flow Diagram

```
User Request
    ↓
AI Processes Request
    ↓
AI Calls save_meal_plan Tool
    ↓
Tool Validates & Authenticates
    ↓
Server Action (saveMealPlanAction)
    ↓
Service Layer (saveMealPlanService)
    ↓
Database Transaction (Atomic Save)
    ↓
Analytics & Generation Count
    ↓
Path Revalidation
    ↓
Tool Returns Success Message
    ↓
AI Formats Response
    ↓
Chat Panel Detects Marker
    ↓
Toast Notification
    ↓
Redirect to /meal-plans
```

## 📝 Step-by-Step Breakdown

### 1. **Tool Definition** (`ai/flows/chat/dynamic-select-tools.ts`)

The tool is registered with the AI system:

```typescript
const saveMealPlan = ai.defineTool({
  name: "save_meal_plan",
  description: "Saves a meal plan to the user's account...",
  inputSchema: SaveMealPlanInputSchema,  // Defines expected input structure
  outputSchema: SaveMealPlanOutputSchema, // Defines return structure
  async (input) => { /* implementation */ }
});
```

**Input Schema:**
- `title`: string
- `duration`: number (days)
- `mealsPerDay`: number
- `days`: array of day objects, each containing:
  - `day`: number (1-based)
  - `meals`: array of meal objects with:
    - `name`, `description`, `ingredients[]`, `instructions`, `imageUrl?`

**Output Schema:**
- `success`: boolean
- `mealPlanId`: string (optional)
- `message`: string (includes redirect marker)

### 2. **AI Decision Making**

When a user says something like:
- "Save this meal plan"
- "Save the meal plan I just generated"
- "I want to save this"

The AI:
1. Recognizes the intent to save
2. Checks if a meal plan was generated in the conversation
3. Calls `save_meal_plan` tool with the meal plan data

### 3. **Tool Execution** (`saveMealPlan` function)

**Step 3.1: Authentication**
```typescript
const session = await auth.api.getSession({ headers: await headers() });
if (!session?.user?.id) {
  return { success: false, message: "You must be logged in..." };
}
```

**Step 3.2: Data Preparation**
```typescript
const saveData = {
  title: input.title,
  duration: input.duration,
  mealsPerDay: input.mealsPerDay,
  days: input.days,
  createdAt: new Date().toISOString(),
};
```

**Step 3.3: Call Server Action**
```typescript
const result = await saveMealPlanAction(saveData);
```

### 4. **Server Action** (`actions/save-meal-plan.ts`)

**Purpose:** Thin layer that handles:
- Authentication verification
- Calling the service
- Path revalidation (Next.js cache invalidation)

**Flow:**
1. Authenticates user (double-check)
2. Calls `saveMealPlanService(input, userId)`
3. If successful, revalidates:
   - `/meal-plans` (list page)
   - `/meal-plans/${mealPlanId}` (detail page)
4. Returns result to tool

### 5. **Service Layer** (`lib/services/meal-plan-service.ts`)

**Purpose:** Core business logic with database transactions

**Step 5.1: Validation**
```typescript
const validation = validateMealPlanInput(input);
if (!validation.valid) {
  return { success: false, error: validation.errors.join('; '), code: 'VALIDATION_ERROR' };
}
```

Validates:
- Title is non-empty, < 200 chars
- Duration is 1-30 days
- Meals per day is 1-5
- Days array matches duration
- Each meal has required fields
- Ingredients are non-empty arrays

**Step 5.2: Database Transaction** (Atomic Operation)

```typescript
const savedMealPlan = await prisma.$transaction(async (tx) => {
  // 1. Create MealPlan record
  const mealPlan = await tx.mealPlan.create({ ... });
  
  // 2. For each day:
  for (const day of input.days) {
    // Create DayMeal record
    const dayMeal = await tx.dayMeal.create({ ... });
    
    // 3. For each meal in the day:
    for (const meal of day.meals) {
      // Create Meal record
      await tx.meal.create({ ... });
    }
  }
  
  // 4. Fetch complete meal plan with relations
  return await tx.mealPlan.findUnique({ include: { days: { include: { meals: true } } } });
});
```

**Why Transaction?**
- **Atomicity**: All or nothing - if any step fails, everything rolls back
- **Data Integrity**: No orphaned records (e.g., MealPlan without DayMeal)
- **Consistency**: Database always in valid state

**Step 5.3: Non-Critical Operations** (Outside Transaction)

These don't block the save if they fail:

1. **Generation Count Increment**
   ```typescript
   await incrementMealPlanGeneration(userId);
   ```
   - Tracks how many meal plans user has generated
   - Used for free tier limits

2. **Analytics Tracking**
   ```typescript
   await prisma.userAnalytics.upsert({
     update: {
       totalMealsCooked: { increment: totalMeals },
       totalRecipesTried: { increment: uniqueRecipes },
     },
   });
   ```
   - Updates user statistics
   - Doesn't fail the save if it fails

**Step 5.4: Return Result**
```typescript
return {
  success: true,
  mealPlan: savedMealPlan, // Complete meal plan with all relations
};
```

### 6. **Tool Response**

The tool formats the response:

```typescript
return {
  success: true,
  mealPlanId: result.mealPlan.id,
  message: `Meal plan "${input.title}" has been saved successfully! You can view it in your meal plans at /meal-plans. [MEAL_PLAN_SAVED:${result.mealPlan.id}]`,
};
```

**Key Points:**
- Includes success message
- Contains redirect marker: `[MEAL_PLAN_SAVED:mealPlanId]`
- Marker is used by client to trigger redirect

### 7. **AI Response Formatting**

The AI receives the tool result and formats it into a natural language response:

```
"Great! I've saved your meal plan '7-Day Meal Plan (3 meals/day)' successfully! 
You can view it in your meal plans at /meal-plans. [MEAL_PLAN_SAVED:abc123]"
```

### 8. **Client-Side Detection** (`components/chat/chat-panel.tsx`)

After the AI response is received:

**Step 8.1: Marker Detection**
```typescript
const mealPlanSavedMatch = assistantMessage.content.match(/\[MEAL_PLAN_SAVED:([^\]]+)\]/);
```

**Step 8.2: Clean Up Message**
```typescript
assistantMessage.content = assistantMessage.content.replace(/\[MEAL_PLAN_SAVED:[^\]]+\]/g, '').trim();
```
- Removes marker from displayed message
- User never sees the technical marker

**Step 8.3: Show Toast**
```typescript
toast({
  title: 'Meal Plan Saved!',
  description: 'Redirecting to your meal plans...',
  duration: 2000,
});
```

**Step 8.4: Redirect**
```typescript
setTimeout(() => {
  router.push('/meal-plans');
}, 1500);
```
- 1.5 second delay allows user to see success message
- Navigates to meal plans page

### 9. **Fallback Detection**

If AI paraphrases and doesn't include the marker:

```typescript
const hasMealPlanKeywords = 
  message.includes('meal plan') &&
  (message.includes('saved') || message.includes('successfully')) &&
  message.includes('/meal-plans');
```

This provides a backup detection method.

## 🗄️ Database Structure

The save creates a hierarchical structure:

```
MealPlan (1)
  ├── DayMeal (N - one per day)
  │     ├── Meal (M - one per meal in day)
  │     │     ├── name, description, ingredients[], instructions
  │     │     └── type: breakfast/lunch/dinner/snack
  │     └── date: calculated from day number
  └── userId, title, duration, mealsPerDay
```

## 🔒 Security & Validation

1. **Authentication**: Checked at tool, action, and service levels
2. **Authorization**: Verifies user owns the session
3. **Input Validation**: Comprehensive validation before database operations
4. **Transaction Safety**: Atomic operations prevent partial saves
5. **Error Handling**: Structured errors with codes for proper handling

## 📊 Data Flow Summary

```
User Input (Chat)
    ↓
AI Tool Call (save_meal_plan)
    ↓
Tool Handler (authentication + data prep)
    ↓
Server Action (authentication + revalidation)
    ↓
Service Layer (validation + transaction)
    ↓
Database (Prisma Transaction)
    ├── MealPlan.create()
    ├── DayMeal.create() × N days
    └── Meal.create() × M meals
    ↓
Analytics (non-blocking)
    ↓
Path Revalidation (Next.js cache)
    ↓
Tool Response (with marker)
    ↓
AI Response (formatted message)
    ↓
Client Detection (marker parsing)
    ↓
Toast + Redirect
```

## 🎯 Key Features

1. **Atomic Saves**: Database transaction ensures all-or-nothing
2. **Data Integrity**: No orphaned records possible
3. **Error Handling**: Comprehensive error codes and messages
4. **User Feedback**: Toast notification + automatic redirect
5. **Cache Invalidation**: Next.js paths revalidated automatically
6. **Non-Blocking Analytics**: Doesn't fail save if analytics fails

## 🔍 Error Scenarios

1. **Not Authenticated** → Returns error, no save
2. **Validation Fails** → Returns detailed validation errors
3. **Database Error** → Transaction rolls back, returns error
4. **Analytics Fails** → Save succeeds, analytics logged but doesn't block

## 💡 Why This Architecture?

1. **Separation of Concerns**: Tool → Action → Service → Database
2. **Reusability**: Service can be called from anywhere
3. **Testability**: Each layer can be tested independently
4. **Maintainability**: Single source of truth for business logic
5. **Type Safety**: TypeScript ensures correct data flow
6. **Transaction Safety**: Prevents data corruption


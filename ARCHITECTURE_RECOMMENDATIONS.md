# Architecture Recommendations for Meal Plan Saving

## Current Issues

### 1. **Code Duplication** ⚠️
- `actions/save-meal-plan.ts` and `app/api/savemealplan/route.ts` contain nearly identical logic
- Both validate, save to database, track analytics, and revalidate paths
- Maintenance burden: changes must be made in two places

### 2. **Pattern Inconsistency** ⚠️
- Chat tool calls use Server Actions (good ✅)
- Regular UI uses API Routes (acceptable, but inconsistent)
- Mixed patterns make the codebase harder to understand

### 3. **Transaction Safety** ⚠️
- No database transactions for multi-step operations
- If DayMeal creation fails, MealPlan is still created (orphaned data)
- No rollback mechanism

### 4. **Error Handling** ⚠️
- Inconsistent error responses between server action and API route
- No structured error types
- Limited error context for debugging

## Recommended Improvements

### Option 1: **Unified Server Action Pattern** (Recommended) ⭐

**Best for**: Next.js 13+ apps, internal operations, better DX

```typescript
// lib/meal-plan-service.ts - Shared business logic
export async function saveMealPlanService(input: SaveMealPlanInput, userId: string) {
  // All business logic here
  // Returns result, no revalidation (handled by caller)
}

// actions/save-meal-plan.ts - Server Action
export async function saveMealPlanAction(input: SaveMealPlanInput) {
  // Auth check
  // Call service
  // Revalidate paths
  // Return result
}

// app/api/savemealplan/route.ts - API Route (if needed for external access)
export async function POST(request: Request) {
  // Auth check
  // Parse body
  // Call service
  // Revalidate paths
  // Return NextResponse
}
```

**Benefits**:
- Single source of truth for business logic
- Server Actions preferred for Next.js apps
- API route can delegate to service if needed for external access
- Easier to test and maintain

### Option 2: **API Route Delegates to Server Action** (Simpler)

```typescript
// actions/save-meal-plan.ts - Primary implementation
export async function saveMealPlanAction(input: SaveMealPlanInput) {
  // All logic here
}

// app/api/savemealplan/route.ts - Thin wrapper
export async function POST(request: Request) {
  const input = await request.json();
  const result = await saveMealPlanAction(input);
  return NextResponse.json(result);
}
```

**Benefits**:
- Minimal changes
- API route becomes a thin wrapper
- Server Action is the source of truth

## Specific Recommendations

### 1. **Add Database Transactions** 🔒

```typescript
const mealPlan = await prisma.$transaction(async (tx) => {
  // Create MealPlan
  const plan = await tx.mealPlan.create({ ... });
  
  // Create DayMeals
  for (const day of input.days) {
    const dayMeal = await tx.dayMeal.create({ ... });
    
    // Create Meals
    for (const meal of day.meals) {
      await tx.meal.create({ ... });
    }
  }
  
  return plan;
});
```

**Benefits**:
- Atomic operations
- No orphaned data
- Automatic rollback on failure

### 2. **Extract Validation Logic** ✅

```typescript
// lib/validators/meal-plan-validator.ts
export function validateMealPlanInput(input: SaveMealPlanInput): ValidationResult {
  // Centralized validation
  // Returns { valid: boolean, errors: string[] }
}
```

### 3. **Structured Error Types** 📋

```typescript
// lib/errors/meal-plan-errors.ts
export class MealPlanValidationError extends Error {
  constructor(public errors: string[]) {
    super('Meal plan validation failed');
  }
}

export class MealPlanSaveError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
  }
}
```

### 4. **Revalidation Strategy** 🔄

```typescript
// lib/revalidation.ts
export function revalidateMealPlanPaths(mealPlanId?: string) {
  revalidatePath('/meal-plans');
  if (mealPlanId) {
    revalidatePath(`/meal-plans/${mealPlanId}`);
  }
  // Could also revalidate dashboard, etc.
}
```

### 5. **Type Safety** 🔷

```typescript
// types/meal-plan.ts - Shared types
export interface SaveMealPlanInput {
  title: string;
  duration: number;
  mealsPerDay: number;
  days: DayMealPlan[];
  createdAt: string;
}

export interface SaveMealPlanResult {
  success: true;
  mealPlan: MealPlan;
} | {
  success: false;
  error: string;
  code?: string;
}
```

## Implementation Priority

1. **High Priority** 🔴
   - Add database transactions
   - Extract shared business logic
   - Unify error handling

2. **Medium Priority** 🟡
   - Extract validation
   - Improve type safety
   - Centralize revalidation

3. **Low Priority** 🟢
   - Refactor API route to delegate
   - Add structured error types
   - Add comprehensive logging

## Migration Path

1. Create `lib/meal-plan-service.ts` with shared logic
2. Refactor `saveMealPlanAction` to use service
3. Refactor API route to call service (or delegate to action)
4. Add transactions
5. Extract validation
6. Improve error handling

## Example Refactored Code

See `REFACTORED_EXAMPLE.md` for a complete example of the recommended pattern.


/**
 * Custom error types for meal plan operations
 * Provides structured error handling with error codes
 */

export class MealPlanValidationError extends Error {
  public readonly code = 'VALIDATION_ERROR';
  
  constructor(
    public readonly errors: string[],
    message?: string
  ) {
    super(message || `Meal plan validation failed: ${errors.join(', ')}`);
    this.name = 'MealPlanValidationError';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MealPlanValidationError);
    }
  }
}

export class MealPlanSaveError extends Error {
  public readonly code = 'SAVE_ERROR';
  
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'MealPlanSaveError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MealPlanSaveError);
    }
  }
}

export class MealPlanNotFoundError extends Error {
  public readonly code = 'NOT_FOUND';
  
  constructor(mealPlanId?: string) {
    super(mealPlanId 
      ? `Meal plan with ID ${mealPlanId} not found`
      : 'Meal plan not found'
    );
    this.name = 'MealPlanNotFoundError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MealPlanNotFoundError);
    }
  }
}

export class MealPlanUnauthorizedError extends Error {
  public readonly code = 'UNAUTHORIZED';
  
  constructor(message = 'User not authenticated') {
    super(message);
    this.name = 'MealPlanUnauthorizedError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MealPlanUnauthorizedError);
    }
  }
}

/**
 * Type guard to check if an error is a meal plan error
 */
export function isMealPlanError(error: unknown): error is 
  | MealPlanValidationError 
  | MealPlanSaveError 
  | MealPlanNotFoundError 
  | MealPlanUnauthorizedError {
  return (
    error instanceof MealPlanValidationError ||
    error instanceof MealPlanSaveError ||
    error instanceof MealPlanNotFoundError ||
    error instanceof MealPlanUnauthorizedError
  );
}


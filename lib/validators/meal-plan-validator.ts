/**
 * Validation logic for meal plan operations
 * Centralized validation to ensure consistency
 */

export interface DayMealPlan {
  day: number;
  meals: Meal[];
}

export interface Meal {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
  imageUrl?: string;
  calories?: number;
  prepTime?: string;
  servings?: number;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface SaveMealPlanInput {
  title: string;
  duration: number;
  mealsPerDay: number;
  days: DayMealPlan[];
  createdAt: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a meal plan input
 * Returns detailed validation errors
 */
export function validateMealPlanInput(input: SaveMealPlanInput): ValidationResult {
  const errors: string[] = [];

  // Validate title
  if (!input.title || typeof input.title !== 'string' || !input.title.trim()) {
    errors.push('Title is required and must be a non-empty string');
  } else if (input.title.length > 200) {
    errors.push('Title must be 200 characters or less');
  }

  // Validate duration
  if (typeof input.duration !== 'number' || !Number.isInteger(input.duration)) {
    errors.push('Duration must be an integer');
  } else if (input.duration < 1) {
    errors.push('Duration must be at least 1 day');
  } else if (input.duration > 30) {
    errors.push('Duration must not exceed 30 days');
  }

  // Validate mealsPerDay
  if (typeof input.mealsPerDay !== 'number' || !Number.isInteger(input.mealsPerDay)) {
    errors.push('Meals per day must be an integer');
  } else if (input.mealsPerDay < 1) {
    errors.push('Meals per day must be at least 1');
  } else if (input.mealsPerDay > 5) {
    errors.push('Meals per day must not exceed 5');
  }

  // Validate createdAt
  if (!input.createdAt || typeof input.createdAt !== 'string') {
    errors.push('CreatedAt must be a valid ISO date string');
  } else {
    const date = new Date(input.createdAt);
    if (isNaN(date.getTime())) {
      errors.push('CreatedAt must be a valid date');
    }
  }

  // Validate days array
  if (!input.days || !Array.isArray(input.days)) {
    errors.push('Days must be an array');
  } else if (input.days.length === 0) {
    errors.push('Days array must not be empty');
  } else if (input.days.length !== input.duration) {
    errors.push(`Days array length (${input.days.length}) must match duration (${input.duration})`);
  } else {
    // Validate each day
    input.days.forEach((day, dayIndex) => {
      // Validate day number
      if (typeof day.day !== 'number' || !Number.isInteger(day.day)) {
        errors.push(`Day ${dayIndex + 1}: day number must be an integer`);
      } else if (day.day < 1 || day.day > input.duration) {
        errors.push(`Day ${dayIndex + 1}: day number must be between 1 and ${input.duration}`);
      }

      // Validate meals array
      if (!day.meals || !Array.isArray(day.meals)) {
        errors.push(`Day ${dayIndex + 1}: meals must be an array`);
      } else if (day.meals.length === 0) {
        errors.push(`Day ${dayIndex + 1}: meals array must not be empty`);
      } else {
        // Validate each meal
        day.meals.forEach((meal, mealIndex) => {
          const mealPrefix = `Day ${dayIndex + 1}, Meal ${mealIndex + 1}`;

          // Validate meal name
          if (!meal.name || typeof meal.name !== 'string' || !meal.name.trim()) {
            errors.push(`${mealPrefix}: name is required and must be a non-empty string`);
          } else if (meal.name.length > 200) {
            errors.push(`${mealPrefix}: name must be 200 characters or less`);
          }

          // Validate meal description
          if (!meal.description || typeof meal.description !== 'string' || !meal.description.trim()) {
            errors.push(`${mealPrefix}: description is required and must be a non-empty string`);
          } else if (meal.description.length > 1000) {
            errors.push(`${mealPrefix}: description must be 1000 characters or less`);
          }

          // Validate ingredients
          if (!meal.ingredients || !Array.isArray(meal.ingredients)) {
            errors.push(`${mealPrefix}: ingredients must be an array`);
          } else {
            meal.ingredients.forEach((ingredient, ingIndex) => {
              if (typeof ingredient !== 'string' || !ingredient.trim()) {
                errors.push(`${mealPrefix}, Ingredient ${ingIndex + 1}: must be a non-empty string`);
              }
            });
          }

          // Validate instructions
          if (!meal.instructions || typeof meal.instructions !== 'string' || !meal.instructions.trim()) {
            errors.push(`${mealPrefix}: instructions is required and must be a non-empty string`);
          } else if (meal.instructions.length > 5000) {
            errors.push(`${mealPrefix}: instructions must be 5000 characters or less`);
          }

          // Validate imageUrl (optional)
          if (meal.imageUrl !== undefined && meal.imageUrl !== null) {
            if (typeof meal.imageUrl !== 'string') {
              errors.push(`${mealPrefix}: imageUrl must be a string or null`);
            } else if (meal.imageUrl.length > 500) {
              errors.push(`${mealPrefix}: imageUrl must be 500 characters or less`);
            }
          }
        });
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}


export interface OnboardingData {
    dietaryPreference: string;
    goal: string;
    householdSize: number;
    cuisinePreferences: string[];
  }
  
  export type OnboardingStep = 'dietary' | 'goals' | 'household' | 'cuisine';


  export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

  export type MealPlan = {
    id: string;
    userId: string;
    duration: number;
    mealsPerDay: number;
    createdAt: Date;
  };
  
  export type DayMeal = {
    id: string;
    date: Date;
    mealPlanId: string;
    mealPlan: MealPlan;
  };
  export type Meal = {
    id: string;
    type: MealType;
    name: string;
    description: string;
    ingredients: string[];
    calories: number;
    dayMealId: string;
    dayMeal: DayMeal;
  };
  export type FullMealPlanWithDays = {
    days: {
      date: Date;
      meals: {
        name: string;
        ingredients: string[];
        description: string;
      }[];
    }[];
  };
  

export interface UserPreference {
  id: number;
  userId: string;
  dietaryPreference: string;
  goal: string;
  householdSize: number;
  cuisinePreferences: string[];

  // Add other user preferences here
}






  // 1Lj8dVPG3L5eqlD2

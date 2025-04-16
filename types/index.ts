export interface OnboardingData {
    dietaryPreference: string;
    goal: string;
    householdSize: number;
    cuisinePreferences: string[];
  }
  
  export type OnboardingStep = 'dietary' | 'goals' | 'household' | 'cuisine';


  export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal {
  id: string;
  type: MealType;
  name: string;
  description: string;
  calories: number;
}

export interface DayPlan {
  id: string;
  date: string;
  meals: Meal[];
}

export interface MealPlan {
  id: string;
  name: string;
  description: string;
  days: DayPlan[];
}


export interface UserPreference {
  dietaryPreference: string;
  goal: string;
  householdSize: number;
  cuisinePreferences: string[];
}

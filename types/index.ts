export interface OnboardingData {
    dietaryPreference: string;
    goal: string;
    householdSize: number;
    cuisinePreferences: string[];
  }
  export type MealPlanStats = {
    totalPlanCalories: number
    avgCaloriesPerDay: number
  }
  
  
  export type OnboardingStep = 'dietary' | 'goals' | 'household' | 'cuisine';


  export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

  export type MealPlan = {
    id: string;
    userId: string;
    title: string;
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
  preferencesSummary?: string | null; // Cached AI-generated summary
  preferencesHash?: string | null; // Hash to detect preference changes

  // Add other user preferences here
}



// Tool call structure for assistant messages
export type ToolCall = {
  id: string;
  name: string;
  arguments: string; // JSON string of tool arguments
};

export type MessageStatus = 'sending' | 'sent' | 'failed';

// UI action button metadata
export type MessageUIAction = {
  label: string;
  action: 'navigate' | 'save' | 'view';
  url?: string; // For navigate action
  onClick?: string; // For custom actions (e.g., 'saveMealPlan')
  data?: Record<string, any>; // Additional data for the action
};

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  // Message status for user messages (sending, sent, failed)
  status?: MessageStatus;
  // Tool call support for assistant messages
  tool_calls?: ToolCall[]; // Assistant can call tools
  tool_call_id?: string; // User message can be a tool result
  // UI metadata for rendering buttons/actions
  ui?: {
    actions?: MessageUIAction[];
    mealPlan?: {
      title: string;
      duration: number;
      mealsPerDay: number;
      days: Array<{
        day: number;
        meals: Array<{
          name: string;
          description: string;
          ingredients: string[];
          instructions: string;
          imageUrl?: string;
        }>;
      }>;
    };
    groceryList?: {
      items?: Array<{
        id: string;
        item: string;
        quantity: string;
        category: string;
        estimatedPrice: string;
        suggestedLocation?: string;
      }>;
      locationInfo?: {
        currencySymbol: string;
        localStores?: string[];
      };
      totalEstimatedCost?: string;
    };
  };
};







  // 1Lj8dVPG3L5eqlD2

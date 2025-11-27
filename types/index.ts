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

// Tool invocation structure from Vercel AI SDK
// Tool invocation structure from Vercel AI SDK
export type ToolInvocation =
  | { state: 'partial-call'; toolCallId: string; toolName: string; args: any }
  | { state: 'call'; toolCallId: string; toolName: string; args: any }
  | { state: 'result'; toolCallId: string; toolName: string; args: any; result: any };

export type Message = {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'data';
  content: string;
  timestamp?: Date; // Kept for backward compatibility
  createdAt?: Date; // Vercel AI SDK uses createdAt
  // Message status for user messages (sending, sent, failed)
  status?: MessageStatus;
  // Tool call support for assistant messages
  tool_calls?: ToolCall[]; // Assistant can call tools
  tool_call_id?: string; // User message can be a tool result
  // Vercel AI SDK tool invocations
  toolInvocations?: ToolInvocation[];
  // UI metadata for rendering buttons/actions
  ui?: {
    actions?: MessageUIAction[];
    mealPlan?: {
      id?: string; // Added id
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
      id?: string; // Added id
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
    mealSuggestions?: Array<{
      name: string;
      calories: number;
      protein: number;
      tags: string[];
      image?: string;
      description?: string;
    }>;
    mealRecipe?: {
      name: string;
      description: string;
      servings: number;
      prepTime: string;
      cookTime: string;
      difficulty: string;
      cuisine: string;
      imageUrl: string;
      ingredients: string[];
      instructions: string[];
      nutrition: {
        calories: number;
        protein: string;
        carbs: string;
        fat: string;
      };
      tags: string[];
    };
  };
};







// 1Lj8dVPG3L5eqlD2

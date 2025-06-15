import { LucideIcon } from "lucide-react";

export type MealType = string;

export type Meal = {
  id: string;
  type: MealType;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
  calories: number;
  dayMealId: string;
  isLiked: boolean;
  imageUrl: string | null;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
  rating?: number;
  tags?: string[];
  dayMeal?: {
    id: string;
    date: Date;
    mealPlanId: string;
    mealPlan?: {
      id: string;
      title: string;
      userId: string;
      duration: number;
      mealsPerDay: number;
      createdAt: Date;
    };
  };
};

export type DayMeal = {
  id: string;
  date: Date;
  mealPlanId: string;
  meals: Meal[];
};

export type MealPlan = {
  id: string;
  title: string;
  duration: number;
  mealsPerDay: number;
  createdAt: Date;
  days: DayMeal[];
};

export type MealPlanDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

// Header component props
export type MealPlanHeaderProps = {
  mealPlan: MealPlan;
  avgCaloriesPerDay: number;
};

export type MealPlanActionsProps = {
  mealPlanId: string;
};

export type MealPlanStatsProps = {
  duration: number;
  mealsPerDay: number;
  avgCaloriesPerDay: number;
  totalDays: number;
};

// Statistics component props
export type MealPlanStatCardsProps = {
  duration: number;
  mealsPerDay: number;
  avgCaloriesPerDay: number;
  totalPlanCalories: number;
};

export type StatisticItemProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  subtext: string;
  color: string;
  bgColor: string;
};

// Calendar component props
export type MealPlanCalendarProps = {
  days: DayMeal[];
};

export type CalendarDayCardProps = {
  day: DayMeal;
  isToday: boolean;
};

// Daily meal component props
export type DayMealCardProps = {
  day: DayMeal;
  dayIndex: number;
  userId: string;
};

export type DayMealHeaderProps = {
  day: DayMeal;
  dayIndex: number;
};

export type MealItemProps = {
  meal: Meal;
  onViewRecipe: (meal: Meal) => void;
  onSwapMeal: (meal: Meal) => void;
};

export type MealHeaderProps = {
  meal: Meal;
};

export type MealIngredientsProps = {
  ingredients: string[];
};

export type MealActionsProps = {
  onViewRecipe?: () => void;
  onSwapMeal: () => void 
};

// UI component props
export type CalorieBadgeProps = {
  calories: number;
  variant?: 'default' | 'outline' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
};

export type MealTypeBadgeProps = {
  type: MealType;
};

export type RecipeModalProps = {
  meal: Meal | null;
  onClose: () => void;
  userId: string;
};


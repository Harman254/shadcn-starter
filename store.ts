import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Meal {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string;
  imageUrl?: string;
}

interface DayMealPlan {
  day: number;
  meals: Meal[];
}

interface MealPlanStore {
  mealPlan: DayMealPlan[];
  duration: number;
  mealsPerDay: number;
  startDate: string | null;
  setMealPlan: (mealPlan: DayMealPlan[], duration: number, mealsPerDay: number, startDate: string) => void;
  clearMealPlan: () => void;
  setDuration: (duration: number) => void;
  setMealsPerDay: (mealsPerDay: number) => void;
  setStartDate: (startDate: string) => void;
}

export const useMealPlanStore = create<MealPlanStore>()(
  persist(
    (set) => ({
      mealPlan: [],
      duration: 7, // Default duration to 7 days
      mealsPerDay: 3, // Default meals per day to 3
      startDate: null, // Default start date to null

      setMealPlan: (mealPlan, duration, mealsPerDay, startDate) => set(() => ({
        mealPlan,
        duration,
        mealsPerDay,
        startDate, // Set the start date as well
      })),

      clearMealPlan: () => set(() => ({
        mealPlan: [],
        duration: 7, // Reset the duration to default
        mealsPerDay: 3,
        startDate: null, // Reset the start date to null
      })),

      setDuration: (duration) => set(() => ({ duration })),
      setMealsPerDay: (mealsPerDay) => set(() => ({ mealsPerDay })),
      setStartDate: (startDate) => set(() => ({ startDate })), // Setter for start date
    }),
    {
      name: 'meal-plan-storage', // Name for the persisted state in localStorage
    }
  )
);


type MealPlanState = {
  title: string;
  setTitle: (title: string) => void;
  resetTitle: () => void;
};

export const useMealPlanTitleStore = create<MealPlanState>()(
  persist(
    (set) => ({
      title: 'Your Meal Plan',
      setTitle: (title) => set({ title }),
      resetTitle: () => set({ title: 'Your Meal Plan' }),
    }),
    {
      name: 'meal-plan-title', // \u{1F512} localStorage key
    }
  )
);
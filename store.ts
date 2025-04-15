import { create } from 'zustand';

export type Meal = {
  name: string;
  calories: number;
  protein: number;
};

export type DayPlan = {
  breakfast?: Meal;
  lunch?: Meal;
  dinner?: Meal;
  snack?: Meal;
};

export type MealPlan = {
  id: string;
  name: string;
  days: DayPlan[];
  mealsPerDay: number;
  createdAt: string;
};

type MealPlanStore = {
  plans: MealPlan[];
  addPlan: (plan: MealPlan) => void;
};

export const useMealPlanStore = create<MealPlanStore>((set) => ({
  plans: [],
  addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
}));
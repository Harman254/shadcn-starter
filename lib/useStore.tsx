import { useMealPlanStore } from "@/store";
import { useMemo } from "react";

export function useMealsByDate() {
  const mealPlan = useMealPlanStore((s) => s.mealPlan);
  const startDate = useMealPlanStore((s) => s.startDate);

  const mealsByDate = useMemo(() => {
    if (!startDate) return {};

    const baseDate = new Date(startDate);

    const result: Record<string, typeof mealPlan[0]['meals']> = {};

    mealPlan.forEach((dayPlan) => {
      const date = new Date(baseDate);
      date.setDate(baseDate.getDate() + dayPlan.day);
      const key = date.toISOString().split('T')[0];
      result[key] = dayPlan.meals;
    });

    return result;
  }, [mealPlan, startDate]);

  return mealsByDate;
}
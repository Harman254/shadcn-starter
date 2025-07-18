"use client"

import MealPlanHeader from "./meal-plan-header";
import MealPlanStatCards from "./meal-plan-stat-cards";
import MealPlanCalendar from "./meal-plan-calendar";
import DayMealCard from "./day-meal-card";
import type { MealPlan } from "./types";

interface MealPlanDetailClientProps {
  mealPlan: MealPlan;
  avgCaloriesPerDay: number;
  totalPlanCalories: number;
  userId: string;
}

const MealPlanDetailClient = ({ mealPlan, avgCaloriesPerDay, totalPlanCalories, userId }: MealPlanDetailClientProps) => {
  // Scroll to the corresponding meal day card
  const handleDayClick = (dayId: string) => {
    const el = document.getElementById(`meal-day-${dayId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-7xl dark:bg-[#222222]  mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <MealPlanHeader mealPlan={mealPlan} avgCaloriesPerDay={avgCaloriesPerDay} />
      <MealPlanStatCards
        duration={mealPlan.duration}
        mealsPerDay={mealPlan.mealsPerDay}
        avgCaloriesPerDay={avgCaloriesPerDay}
        totalPlanCalories={totalPlanCalories}
      />
      <MealPlanCalendar days={mealPlan.days} onDayClick={handleDayClick} />
      <div className="grid gap-6 mt-8">
        {mealPlan.days.map((day, index) => (
          <div key={day.id} id={`meal-day-${day.id}`}>
            <DayMealCard day={day} dayIndex={index} userId={userId} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealPlanDetailClient; 
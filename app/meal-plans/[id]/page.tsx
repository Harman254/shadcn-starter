import { fetchMealPlanById } from "@/data";
import { MealPlan, MealPlanDetailPageProps } from "./components/types";
import MealPlanNotFound from "./components/meal-plan-not-found";
import MealPlanHeader from "./components/meal-plan-header";
import MealPlanStatCards from "./components/meal-plan-stat-cards";
import MealPlanCalendar from "./components/meal-plan-calendar";
import DayMealCard from "./components/day-meal-card";

const MealPlanDetailPage = async ({ params }: MealPlanDetailPageProps) => {
  const { id } = await params;
  const mealPlan: MealPlan | null = await fetchMealPlanById(id);

  if (!mealPlan) {
    return <MealPlanNotFound />;
  }

  // Calculate statistics
  const totalPlanCalories = mealPlan.days.reduce(
    (sum, day) => sum + day.meals.reduce((daySum, meal) => daySum + meal.calories, 0),
    0
  );
  const avgCaloriesPerDay = Math.round(totalPlanCalories / mealPlan.days.length);

  return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Header */}
        <MealPlanHeader mealPlan={mealPlan} avgCaloriesPerDay={avgCaloriesPerDay} />

        {/* Enhanced Statistics Cards */}
        <MealPlanStatCards
          duration={mealPlan.duration}
          mealsPerDay={mealPlan.mealsPerDay}
          avgCaloriesPerDay={avgCaloriesPerDay}
          totalPlanCalories={totalPlanCalories}
        />

        {/* Calendar Timeline */}
        <MealPlanCalendar days={mealPlan.days} />

        {/* Daily Meal Plans */}
        <div className="space-y-8">
          {mealPlan.days.map((day, dayIndex) => (
            <DayMealCard key={day.id} day={day} dayIndex={dayIndex} />
          ))}
        </div>
      </div>
    // </div>
  );
};

export default MealPlanDetailPage;


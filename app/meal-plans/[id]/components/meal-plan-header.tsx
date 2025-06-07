import { Card, CardContent } from "@/components/ui/card";
import { Utensils } from "lucide-react";
import { MealPlanHeaderProps } from "../components/types";
import MealPlanActions from "./meal-plan-actions";
import MealPlanStats from "./meal-plan-stats";

export const MealPlanHeader = ({ mealPlan, avgCaloriesPerDay }: MealPlanHeaderProps) => {
  return (
    <Card className="mb-8 overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white">
        <CardContent className="p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl mr-4">
                  <Utensils className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-4xl lg:text-5xl font-bold mb-2">Your Meal Plan</h1>
                  <p className="text-emerald-100 text-lg">Personalized nutrition for your fitness journey</p>
                </div>
              </div>
            </div>

            <MealPlanActions mealPlanId={mealPlan.id} />
          </div>

          <MealPlanStats
            duration={mealPlan.duration}
            mealsPerDay={mealPlan.mealsPerDay}
            avgCaloriesPerDay={avgCaloriesPerDay}
            totalDays={mealPlan.days.length}
          />
        </CardContent>
      </div>
    </Card>
  );
};

export default MealPlanHeader;


import { MealPlanStatsProps } from "../components/types";

export const MealPlanStats = ({
  duration,
  mealsPerDay,
  avgCaloriesPerDay,
  totalDays,
}: MealPlanStatsProps) => {
  return (
    <div className="mt-6 pt-6 border-t border-white/20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{duration}</div>
          <div className="text-emerald-100 text-sm">Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{mealsPerDay}</div>
          <div className="text-emerald-100 text-sm">Meals/Day</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{avgCaloriesPerDay}</div>
          <div className="text-emerald-100 text-sm">Avg Calories</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{totalDays}</div>
          <div className="text-emerald-100 text-sm">Total Days</div>
        </div>
      </div>
    </div>
  );
};

export default MealPlanStats;


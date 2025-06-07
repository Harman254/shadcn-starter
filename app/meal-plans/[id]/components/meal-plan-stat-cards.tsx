import { Target, Utensils, Flame, TrendingUp } from "lucide-react";
import { MealPlanStatCardsProps } from "../components/types";
import StatisticItem from "./statistic-item";

export const MealPlanStatCards = ({
  duration,
  mealsPerDay,
  avgCaloriesPerDay,
  totalPlanCalories,
}: MealPlanStatCardsProps) => {
  const stats = [
    {
      icon: Target,
      label: "Plan Duration",
      value: `${duration} days`,
      subtext: "Total program length",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/50",
    },
    {
      icon: Utensils,
      label: "Daily Meals",
      value: mealsPerDay.toString(),
      subtext: "Meals per day",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
    },
    {
      icon: Flame,
      label: "Daily Average",
      value: `${avgCaloriesPerDay}`,
      subtext: "calories per day",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/50",
    },
    {
      icon: TrendingUp,
      label: "Total Calories",
      value: `${totalPlanCalories.toLocaleString()}`,
      subtext: "across all days",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/50",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatisticItem key={index} {...stat} />
      ))}
    </div>
  );
};

export default MealPlanStatCards;

import { Badge } from "@/components/ui/badge";
import { MealTypeBadgeProps } from "../components/types";

export const MealTypeBadge = ({ type }: MealTypeBadgeProps) => {
  const mealTypeBadges = {
    breakfast: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    lunch: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300",
    dinner: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
    snack: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
    default: "bg-slate-100 text-slate-800 dark:bg-slate-900/50 dark:text-slate-300",
  };

  const mealType = type?.toLowerCase() || "default";
  const badgeColor = mealTypeBadges[mealType as keyof typeof mealTypeBadges] || mealTypeBadges.default;

  return <Badge className={badgeColor}>{type}</Badge>;
};

export default MealTypeBadge;


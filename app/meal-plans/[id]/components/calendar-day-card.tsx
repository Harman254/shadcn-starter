import { Badge } from "@/components/ui/badge";
import { CalendarDayCardProps } from "../components/types";

export const CalendarDayCard = ({ day, isToday }: CalendarDayCardProps) => {
  const date = new Date(day.date);
  const totalCalories = day.meals.reduce((sum, meal) => sum + meal.calories, 0);

  return (
    <a
      href={`#day-${day.id}`}
      className={`flex-shrink-0 w-24 p-4 rounded-xl text-center transition-all duration-300 hover:scale-105 ${
        isToday
          ? "bg-emerald-600 text-white shadow-lg"
          : "bg-muted hover:bg-muted/80 border-2 border-transparent hover:border-emerald-200"
      }`}
    >
      <div className="space-y-1">
        <p className="text-xs font-medium opacity-75">
          {date.toLocaleDateString(undefined, { weekday: "short" })}
        </p>
        <p className="text-xl font-bold">{date.getDate()}</p>
        <p className="text-xs opacity-75">{date.toLocaleDateString(undefined, { month: "short" })}</p>
        <Badge variant={isToday ? "secondary" : "outline"} className="text-xs">
          {totalCalories} cal
        </Badge>
      </div>
    </a>
  );
};

export default CalendarDayCard;
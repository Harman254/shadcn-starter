import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DayMealCardProps } from "../components/types";
import DayMealHeader from "./day-meal-header";
import MealItem from "./meal-item";

export const DayMealCard = ({ day, dayIndex }: DayMealCardProps) => {
  return (
    <Card key={day.id} id={`day-${day.id}`} className="overflow-hidden scroll-mt-24">
      {/* Day Header */}
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
        <DayMealHeader day={day} dayIndex={dayIndex} />
      </CardHeader>

      {/* Meals Grid */}
      <CardContent className="p-0">
        <div className="divide-y">
          {day.meals.map((meal) => (
            <MealItem key={meal.id} meal={meal} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DayMealCard;


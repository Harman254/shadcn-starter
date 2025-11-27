"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarClock, ChefHat } from "lucide-react";

interface PrepTimelineProps {
  mealPlan: {
    days: {
      id: string;
      date: Date;
      meals: {
        name: string;
        description?: string;
        instructions?: string;
      }[];
    }[];
  };
}

export function PrepTimeline({ mealPlan }: PrepTimelineProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarClock className="h-5 w-5" />
          Meal Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {mealPlan.days.map((day, index) => (
            <div key={day.id} className="relative pl-6 border-l-2 border-muted">
              <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary" />
              <h3 className="text-lg font-semibold mb-4">
                Day {index + 1} <span className="text-sm font-normal text-muted-foreground ml-2">({new Date(day.date).toLocaleDateString()})</span>
              </h3>
              <div className="space-y-4">
                {day.meals.map((meal, index) => (
                  <div key={index} className="bg-muted/30 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <ChefHat className="h-4 w-4 text-primary" />
                      <span className="font-medium">{meal.name}</span>
                    </div>
                    {meal.description && (
                      <p className="text-sm text-muted-foreground mb-2">{meal.description}</p>
                    )}
                    {meal.instructions && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        Prep: {meal.instructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

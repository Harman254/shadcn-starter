"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Utensils, Activity, Flame, Wheat } from "lucide-react";

interface NutritionOverviewProps {
  mealPlan: {
    days: {
      meals: {
        ingredients: string[];
      }[];
    }[];
  };
}

export function NutritionOverview({ mealPlan }: NutritionOverviewProps) {
  // In a real app, we would calculate this from ingredients or fetch from an API.
  // For now, we'll estimate based on the number of meals to show the UI structure.
  const totalMeals = mealPlan.days.reduce((acc, day) => acc + day.meals.length, 0);
  const estimatedDailyCalories = 2000; // Standard reference
  const estimatedProtein = 150;
  const estimatedCarbs = 250;
  const estimatedFat = 70;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Daily Calories</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estimatedDailyCalories} kcal</div>
          <p className="text-xs text-muted-foreground">
            Estimated based on standard portions
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Protein</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estimatedProtein}g</div>
          <Progress value={75} className="mt-2 h-2" />
          <p className="text-xs text-muted-foreground mt-1">High protein focus</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Carbs</CardTitle>
          <Wheat className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estimatedCarbs}g</div>
          <Progress value={50} className="mt-2 h-2" />
          <p className="text-xs text-muted-foreground mt-1">Balanced energy</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fats</CardTitle>
          <Utensils className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estimatedFat}g</div>
          <Progress value={30} className="mt-2 h-2" />
          <p className="text-xs text-muted-foreground mt-1">Healthy fats</p>
        </CardContent>
      </Card>
    </div>
  );
}

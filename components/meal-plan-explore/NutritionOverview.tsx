"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Utensils, Activity, Flame, Wheat, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface NutritionOverviewProps {
  mealPlan: {
    id: string;
    days: Array<{
      date?: Date | string;
      meals: Array<{
        ingredients: string[];
        [key: string]: any;
      }>;
      [key: string]: any;
    }>;
  };
}

export function NutritionOverview({ mealPlan }: NutritionOverviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [nutrition, setNutrition] = useState({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0
  });

  useEffect(() => {
    const analyzePlan = async () => {
      try {
        // Simulate AI Analysis Delay
        // In production, this calls the analyzeNutrition tool via API
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock logic to simulate "real" analysis based on ingredients count
        // This makes the numbers feel dynamic and related to the plan size
        const totalMeals = mealPlan.days.reduce((acc, day) => acc + day.meals.length, 0);
        const baseCalories = 450; // Avg per meal
        
        setNutrition({
          calories: totalMeals * baseCalories,
          protein: totalMeals * 25,
          carbs: totalMeals * 45,
          fat: totalMeals * 15
        });
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to analyze nutrition", error);
        setIsLoading(false);
      }
    };

    analyzePlan();
  }, [mealPlan]);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded mb-2" />
              <div className="h-2 w-full bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate daily averages
  const dayCount = mealPlan.days.length || 1;
  const dailyCalories = Math.round(nutrition.calories / dayCount);
  const dailyProtein = Math.round(nutrition.protein / dayCount);
  const dailyCarbs = Math.round(nutrition.carbs / dayCount);
  const dailyFat = Math.round(nutrition.fat / dayCount);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg. Daily Calories</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dailyCalories} kcal</div>
          <p className="text-xs text-muted-foreground">
            {nutrition.calories} kcal total for {dayCount} days
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Protein</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dailyProtein}g</div>
          <Progress value={75} className="mt-2 h-2" />
          <p className="text-xs text-muted-foreground mt-1">Daily average</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Carbs</CardTitle>
          <Wheat className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dailyCarbs}g</div>
          <Progress value={50} className="mt-2 h-2" />
          <p className="text-xs text-muted-foreground mt-1">Daily average</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Fats</CardTitle>
          <Utensils className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{dailyFat}g</div>
          <Progress value={30} className="mt-2 h-2" />
          <p className="text-xs text-muted-foreground mt-1">Daily average</p>
        </CardContent>
      </Card>
    </div>
  );
}

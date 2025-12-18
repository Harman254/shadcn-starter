'use client';

import { useState, useCallback } from 'react';
import { AnalyticsHeader } from "./AnalyticsHeader";
import { StatCard } from "./StatCard";
import { NutritionDonut, NutritionLegend } from "./NutritionDonut";
import { CalorieChart } from "./CalorieChart";
import { RecentMeals } from "./recentMeals";
import { MealPlanProgress } from "./MealPlanProgress";
import { GroceryInsights } from "./GroceryInsights";
import { Utensils, CalendarCheck, ShoppingCart, TrendingUp, DollarSign, Target, TrendingDown } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { AnalyticsData } from './analytics-data';
import { useProFeatures } from '@/hooks/use-pro-features';
import { toast } from 'sonner';

interface AnalyticsClientProps {
  analyticsData: AnalyticsData;
}

export function AnalyticsClient({ analyticsData: initialData }: AnalyticsClientProps) {
  const [range, setRange] = useState<'week' | 'month' | 'all'>('week');
  const [analyticsData, setAnalyticsData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const { isPro } = useProFeatures();

  const handleRangeChange = useCallback(async (newRange: 'week' | 'month' | 'all') => {
    if (newRange === range) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?range=${newRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
        setRange(newRange);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [range]);

  const handleExport = useCallback(async (format: 'csv' | 'json') => {
    try {
      const response = await fetch(`/api/analytics/export?format=${format}&range=${range}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${range}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success(`Analytics exported as ${format.toUpperCase()}`);
      } else {
        toast.error('Failed to export analytics');
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export analytics');
    }
  }, [range]);

  // Calculate cost per meal (if grocery data available)
  const avgCostPerMeal = analyticsData.groceryInsights.totalSpent 
    ? parseFloat(analyticsData.groceryInsights.totalSpent.replace(/[^0-9.]/g, '')) / Math.max(analyticsData.totalMeals, 1)
    : 0;

  // Calculate meal prep efficiency (meals per plan)
  const mealPrepEfficiency = analyticsData.totalMealPlans > 0
    ? (analyticsData.totalMeals / analyticsData.totalMealPlans).toFixed(1)
    : '0';

  // Calculate nutrition trends (simplified - would need historical data for real trends)
  const nutritionTrend = analyticsData.nutritionBreakdown.reduce((sum, item) => sum + item.value, 0);
  const targetNutrition = 2000; // Example target
  const nutritionProgress = Math.min((nutritionTrend / targetNutrition) * 100, 100);

  const mealsChangeText = analyticsData.mealsChange.value > 0 
    ? `+${analyticsData.mealsChange.value}% from last ${range === 'all' ? 'period' : range}`
    : analyticsData.mealsChange.value < 0
    ? `${analyticsData.mealsChange.value}% from last ${range === 'all' ? 'period' : range}`
    : 'No change';

  const groceriesChangeText = analyticsData.groceriesChange.value > 0
    ? `+${analyticsData.groceriesChange.value}% vs last ${range === 'all' ? 'period' : range}`
    : analyticsData.groceriesChange.value < 0
    ? `${analyticsData.groceriesChange.value}% vs last ${range === 'all' ? 'period' : range}`
    : 'No change';

  const avgCaloriesText = analyticsData.avgCalories > 0
    ? analyticsData.avgCalories.toLocaleString()
    : '0';

  return (
    <>
      <AnalyticsHeader 
        range={range} 
        onRangeChange={handleRangeChange}
        onExport={handleExport}
      />

      {/* Stats Grid */}
      <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Meals"
          value={analyticsData.totalMeals}
          change={mealsChangeText}
          changeType={analyticsData.mealsChange.type}
          icon={Utensils}
          iconColor="bg-primary/10 text-primary"
          delay={0}
        />
        <StatCard
          title="Meal Plans"
          value={analyticsData.totalMealPlans}
          change={analyticsData.mealPlansChange.value}
          changeType={analyticsData.mealPlansChange.type}
          icon={CalendarCheck}
          iconColor="bg-warning/10 text-warning"
          delay={100}
        />
        <StatCard
          title="Groceries"
          value={analyticsData.totalGroceryItems}
          change={groceriesChangeText}
          changeType={analyticsData.groceriesChange.type}
          icon={ShoppingCart}
          iconColor="bg-accent/10 text-accent"
          delay={200}
        />
        <StatCard
          title="Avg. Calories"
          value={avgCaloriesText}
          change="On target"
          changeType="positive"
          icon={TrendingUp}
          iconColor="bg-info/10 text-info"
          delay={300}
        />
      </div>

      {/* Advanced Pro Features */}
      {isPro && (
        <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Cost Analysis */}
          <Card className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Cost Analysis</CardTitle>
              </div>
              <CardDescription>Average cost per meal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                ${avgCostPerMeal.toFixed(2)}
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {analyticsData.totalGroceryItems} grocery items
              </p>
              {analyticsData.groceryInsights.totalSpent && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Spent</span>
                    <span className="font-semibold">{analyticsData.groceryInsights.totalSpent}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Meal Prep Efficiency */}
          <Card className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Meal Prep Efficiency</CardTitle>
              </div>
              <CardDescription>Meals per meal plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {mealPrepEfficiency}
              </div>
              <p className="text-sm text-muted-foreground">
                Average meals per plan
              </p>
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Efficiency Score</span>
                  <span className="font-semibold">
                    {parseFloat(mealPrepEfficiency) > 15 ? 'Excellent' : parseFloat(mealPrepEfficiency) > 10 ? 'Good' : 'Fair'}
                  </span>
                </div>
                <Progress value={Math.min((parseFloat(mealPrepEfficiency) / 20) * 100, 100)} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Dietary Goal Tracking */}
          <Card className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Nutrition Goals</CardTitle>
              </div>
              <CardDescription>Progress toward daily targets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Daily Nutrition</span>
                    <span className="font-semibold">{nutritionProgress.toFixed(0)}%</span>
                  </div>
                  <Progress value={nutritionProgress} className="h-2" />
                </div>
                <div className="pt-2 border-t space-y-2">
                  {analyticsData.nutritionBreakdown.map((nutrient) => (
                    <div key={nutrient.name} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{nutrient.name}</span>
                      <span className="font-medium">{nutrient.value}g</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Calorie Trend */}
        <div className="lg:col-span-2 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Calorie Intake Trend</h2>
              <p className="text-sm text-muted-foreground">
                {range === 'week' ? 'Daily' : range === 'month' ? 'Weekly' : 'Monthly'} calories vs target
              </p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-warning" />
                <span className="text-muted-foreground">Target</span>
              </div>
            </div>
          </div>
          <CalorieChart data={analyticsData.calorieChartData} />
        </div>

        {/* Nutrition Breakdown */}
        <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-lg font-semibold">Nutrition Breakdown</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {range === 'week' ? 'This week' : range === 'month' ? 'This month' : 'All time'} macros distribution
          </p>
          <NutritionDonut
            data={analyticsData.nutritionBreakdown}
            centerLabel="Total"
            centerValue={`${analyticsData.nutritionBreakdown.reduce((sum, item) => sum + item.value, 0)}g`}
          />
          <NutritionLegend data={analyticsData.nutritionBreakdown} />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Recent Meals */}
        <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Recent Meals</h2>
            <p className="text-sm text-muted-foreground">Your latest logged meals</p>
          </div>
          <RecentMeals meals={analyticsData.recentMeals} />
        </div>

        {/* Meal Plan Progress */}
        <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Meal Plan Progress</h2>
            <p className="text-sm text-muted-foreground">This {range === 'week' ? 'week' : range === 'month' ? 'month' : 'period'}'s adherence</p>
          </div>
          <MealPlanProgress
            completed={analyticsData.mealPlanProgress.completed}
            total={analyticsData.mealPlanProgress.total}
            weeklyPlans={analyticsData.mealPlanProgress.weeklyPlans}
          />
        </div>

        {/* Grocery Insights */}
        <div className="rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Grocery Insights</h2>
            <p className="text-sm text-muted-foreground">Shopping breakdown by category</p>
          </div>
          <GroceryInsights
            categories={analyticsData.groceryInsights.categories}
            totalItems={analyticsData.groceryInsights.totalItems}
            totalSpent={analyticsData.groceryInsights.totalSpent}
          />
        </div>
      </div>
    </>
  );
}


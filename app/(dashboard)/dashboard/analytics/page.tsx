import { AnalyticsHeader } from "./AnalyticsHeader";
import { StatCard } from "./StatCard";
import { NutritionDonut, NutritionLegend } from "./NutritionDonut";
import { CalorieChart } from "./CalorieChart";
import { RecentMeals } from "./recentMeals";
import { MealPlanProgress } from "./MealPlanProgress";
import { GroceryInsights } from "./GroceryInsights";
import { Utensils, CalendarCheck, ShoppingCart, TrendingUp } from "lucide-react";
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { fetchAnalyticsData } from './analytics-data';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    </div>
  );
}

async function AnalyticsContent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const analyticsData = await fetchAnalyticsData(session.user.id);

  // Format change strings
  const mealsChangeText = analyticsData.mealsChange.value > 0 
    ? `+${analyticsData.mealsChange.value}% from last week`
    : analyticsData.mealsChange.value < 0
    ? `${analyticsData.mealsChange.value}% from last week`
    : 'No change';

  const groceriesChangeText = analyticsData.groceriesChange.value > 0
    ? `+${analyticsData.groceriesChange.value}% vs last week`
    : analyticsData.groceriesChange.value < 0
    ? `${analyticsData.groceriesChange.value}% vs last week`
    : 'No change';

  const avgCaloriesText = analyticsData.avgCalories > 0
    ? analyticsData.avgCalories.toLocaleString()
    : '0';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Animated background elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <AnalyticsHeader />

        {/* Stats Grid - Enhanced with better spacing and animations */}
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

        {/* Charts Row - Enhanced responsive design */}
        <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Calorie Trend */}
          <div className="lg:col-span-2 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Calorie Intake</h2>
                <p className="text-sm text-muted-foreground">Daily calories vs target</p>
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
            <p className="text-sm text-muted-foreground">Today&apos;s macros distribution</p>
            <NutritionDonut
              data={analyticsData.nutritionBreakdown}
              centerLabel="Total"
              centerValue={`${analyticsData.nutritionBreakdown.reduce((sum, item) => sum + item.value, 0)}g`}
            />
            <NutritionLegend data={analyticsData.nutritionBreakdown} />
          </div>
        </div>

        {/* Bottom Row - Enhanced responsive grid */}
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
              <p className="text-sm text-muted-foreground">This week&apos;s adherence</p>
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
      </div>
    </div>
  );
}

const Index = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AnalyticsContent />
    </Suspense>
  );
};

export default Index;

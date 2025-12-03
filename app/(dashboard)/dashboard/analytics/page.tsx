import { AnalyticsHeader } from "./AnalyticsHeader";
import { StatCard } from "./StatCard";
import { NutritionDonut, NutritionLegend } from "./NutritionDonut";
import { CalorieChart } from "./CalorieChart";
import { RecentMeals } from "./recentMeals";
import { MealPlanProgress } from "./MealPlanProgress";
import { GroceryInsights } from "./GroceryInsights";
import { Utensils, CalendarCheck, ShoppingCart, TrendingUp } from "lucide-react";

// Mock data
const nutritionData = [
  { name: "Protein", value: 125, color: "hsl(152, 55%, 42%)" },
  { name: "Carbs", value: 280, color: "hsl(40, 95%, 55%)" },
  { name: "Fats", value: 65, color: "hsl(24, 85%, 60%)" },
  { name: "Fiber", value: 32, color: "hsl(200, 85%, 55%)" },
];

const calorieData = [
  { day: "Mon", calories: 1850, target: 2000 },
  { day: "Tue", calories: 2100, target: 2000 },
  { day: "Wed", calories: 1920, target: 2000 },
  { day: "Thu", calories: 1780, target: 2000 },
  { day: "Fri", calories: 2050, target: 2000 },
  { day: "Sat", calories: 2200, target: 2000 },
  { day: "Sun", calories: 1950, target: 2000 },
];

const recentMeals = [
  {
    id: "1",
    name: "Avocado Toast with Eggs",
    time: "8:30 AM",
    calories: 420,
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=200&h=200&fit=crop",
    type: "breakfast" as const,
  },
  {
    id: "2",
    name: "Grilled Chicken Salad",
    time: "12:45 PM",
    calories: 550,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop",
    type: "lunch" as const,
  },
  {
    id: "3",
    name: "Salmon with Quinoa",
    time: "7:00 PM",
    calories: 680,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=200&h=200&fit=crop",
    type: "dinner" as const,
  },
  {
    id: "4",
    name: "Greek Yogurt Parfait",
    time: "3:30 PM",
    calories: 220,
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&h=200&fit=crop",
    type: "snack" as const,
  },
];

const weeklyPlans = [
  { day: "Mon", completed: true, meals: 4 },
  { day: "Tue", completed: true, meals: 3 },
  { day: "Wed", completed: true, meals: 4 },
  { day: "Thu", completed: true, meals: 3 },
  { day: "Fri", completed: false, meals: 2 },
  { day: "Sat", completed: false, meals: 0 },
  { day: "Sun", completed: false, meals: 0 },
];

const groceryCategories = [
  { name: "Vegetables", amount: 24, percentage: 12, trend: "down" as const, color: "hsl(152, 55%, 42%)" },
  { name: "Proteins", amount: 18, percentage: 8, trend: "up" as const, color: "hsl(24, 85%, 60%)" },
  { name: "Dairy", amount: 12, percentage: 5, trend: "down" as const, color: "hsl(200, 85%, 55%)" },
  { name: "Grains", amount: 8, percentage: 3, trend: "down" as const, color: "hsl(40, 95%, 55%)" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AnalyticsHeader />

        {/* Stats Grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Meals"
            value={47}
            change="+12% from last week"
            changeType="positive"
            icon={Utensils}
            iconColor="bg-primary/10 text-primary"
            delay={0}
          />
          <StatCard
            title="Meal Plans"
            value={6}
            change="2 active plans"
            changeType="neutral"
            icon={CalendarCheck}
            iconColor="bg-warning/10 text-warning"
            delay={100}
          />
          <StatCard
            title="Groceries"
            value={62}
            change="-8% vs last week"
            changeType="positive"
            icon={ShoppingCart}
            iconColor="bg-accent/10 text-accent"
            delay={200}
          />
          <StatCard
            title="Avg. Calories"
            value="1,978"
            change="On target"
            changeType="positive"
            icon={TrendingUp}
            iconColor="bg-info/10 text-info"
            delay={300}
          />
        </div>

        {/* Charts Row */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Calorie Trend */}
          <div className="lg:col-span-2 rounded-2xl bg-card p-6 shadow-card">
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
            <CalorieChart data={calorieData} />
          </div>

          {/* Nutrition Breakdown */}
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <h2 className="text-lg font-semibold">Nutrition Breakdown</h2>
            <p className="text-sm text-muted-foreground">Today's macros distribution</p>
            <NutritionDonut
              data={nutritionData}
              centerLabel="Total"
              centerValue="502g"
            />
            <NutritionLegend data={nutritionData} />
          </div>
        </div>

        {/* Bottom Row */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Recent Meals */}
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Recent Meals</h2>
              <p className="text-sm text-muted-foreground">Your latest logged meals</p>
            </div>
            <RecentMeals meals={recentMeals} />
          </div>

          {/* Meal Plan Progress */}
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Meal Plan Progress</h2>
              <p className="text-sm text-muted-foreground">This week's adherence</p>
            </div>
            <MealPlanProgress
              completed={14}
              total={21}
              weeklyPlans={weeklyPlans}
            />
          </div>

          {/* Grocery Insights */}
          <div className="rounded-2xl bg-card p-6 shadow-card">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">Grocery Insights</h2>
              <p className="text-sm text-muted-foreground">Shopping breakdown by category</p>
            </div>
            <GroceryInsights
              categories={groceryCategories}
              totalItems={62}
              totalSpent="$124.50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

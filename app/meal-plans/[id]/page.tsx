import GroceryListButton from "@/components/groceries-button";
import { Button } from "@/components/ui/button";
import { fetchMealPlanById } from "@/data";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarIcon, Utensils, Clock, ChevronRight, Info, Award, Activity, ChevronLeft, ArrowLeft } from "lucide-react";

// TypeScript types
type MealType = string;

type Meal = {
  id: string;
  type: MealType;
  name: string;
  description: string;
  ingredients: string[];
  calories: number;
  dayMealId: string;
};

type DayMeal = {
  id: string;
  date: Date;
  mealPlanId: string;
  meals: Meal[];
};

type MealPlan = {
  id: string;
  duration: number;
  mealsPerDay: number;
  createdAt: Date;
  days: DayMeal[];
};

type MealPlanDetailPageProps = {
  params: {
    id: string;
  };
};

const MealPlanDetailPage = async ({ params }: MealPlanDetailPageProps) => {
  const { id } = params;


  const mealPlan: MealPlan | null = await fetchMealPlanById(id);

  if (!mealPlan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 dark:from-red-900/50 dark:to-red-800/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Info className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Meal Plan Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">The requested meal plan could not be found or may have been deleted.</p>
          <a
            href="/meal-plans"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-medium rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Meal Plans
          </a>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalPlanCalories = mealPlan.days.reduce(
    (sum, day) => sum + day.meals.reduce((daySum, meal) => daySum + meal.calories, 0),
    0
  );
  const avgCaloriesPerDay = Math.round(totalPlanCalories / mealPlan.days.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Header Section - Redesigned */}
        <div className="relative mb-8">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-6 sm:p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-green-500/5 to-teal-500/5 dark:from-emerald-400/5 dark:via-green-400/5 dark:to-teal-400/5"></div>
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-emerald-200/30 to-green-300/30 dark:from-emerald-600/20 dark:to-green-700/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col space-y-6">
                {/* Title Section */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <div className="bg-gradient-to-br from-emerald-100 to-green-100 dark:from-emerald-800/50 dark:to-green-800/50 p-3 rounded-2xl mr-4 shadow-sm">
                        <Utensils className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                          Your Meal Plan
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">Personalized nutrition for your fitness journey</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3">
                    <GroceryListButton mealplanId={mealPlan.id} />
                    <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 dark:from-emerald-800/50 dark:to-green-800/50 text-emerald-700 dark:text-emerald-300 text-sm font-medium rounded-xl shadow-sm">
                      <Activity className="h-4 w-4 mr-2" />
                      Active Plan
                    </span>
                    <span className="inline-flex items-center px-4 py-2 bg-gray-100/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl shadow-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      {new Date(mealPlan.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Grid - Enhanced */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            {
              icon: CalendarIcon,
              label: "Duration",
              value: `${mealPlan.duration} days`,
              gradient: "from-blue-500 to-cyan-500",
              bg: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
              iconBg: "from-blue-100 to-cyan-100 dark:from-blue-800/50 dark:to-cyan-800/50"
            },
            {
              icon: Utensils,
              label: "Meals Per Day",
              value: mealPlan.mealsPerDay.toString(),
              gradient: "from-emerald-500 to-green-500",
              bg: "from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
              iconBg: "from-emerald-100 to-green-100 dark:from-emerald-800/50 dark:to-green-800/50"
            },
            {
              icon: Award,
              label: "Avg. Calories/Day",
              value: `${avgCaloriesPerDay} cal`,
              gradient: "from-purple-500 to-pink-500",
              bg: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
              iconBg: "from-purple-100 to-pink-100 dark:from-purple-800/50 dark:to-pink-800/50"
            },
            {
              icon: Clock,
              label: "Total Days",
              value: mealPlan.days.length.toString(),
              gradient: "from-orange-500 to-amber-500",
              bg: "from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20",
              iconBg: "from-orange-100 to-amber-100 dark:from-orange-800/50 dark:to-amber-800/50"
            }
          ].map(({ icon: Icon, label, value, gradient, bg, iconBg }, index) => (
            <div key={index} className={`bg-gradient-to-br ${bg} backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-white/20 dark:border-gray-700/30 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 hover:scale-105`}>
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${iconBg} mb-4 shadow-sm`}>
                <Icon className={`h-5 w-5 sm:h-6 sm:w-6 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`} />
              </div>
              <h3 className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</h3>
              <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
            </div>
          ))}
        </div>

        {/* Calendar Section - Completely Redesigned */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 mb-8 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-emerald-50/50 to-green-50/50 dark:from-emerald-900/20 dark:to-green-900/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Calendar Overview</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Tap any day to jump to its meals</p>
              </div>
              <div className="flex space-x-2">
                <button className="p-3 rounded-xl bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-600/80 transition-all duration-200 shadow-sm border border-gray-200/50 dark:border-gray-600/50">
                  <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button className="p-3 rounded-xl bg-white/60 dark:bg-gray-700/60 hover:bg-white/80 dark:hover:bg-gray-600/80 transition-all duration-200 shadow-sm border border-gray-200/50 dark:border-gray-600/50">
                  <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Calendar Days Container */}
          <div className="p-6 sm:p-8">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex w-max space-x-3 sm:space-x-4 pb-4">
                {mealPlan.days.map((day: DayMeal, index: number) => {
                  const date = new Date(day.date);
                  const isToday = new Date().toDateString() === date.toDateString();
                  const totalCalories = day.meals.reduce((sum, meal) => sum + meal.calories, 0);
                  
                  return (
                    <a
                      key={day.id}
                      href={`#day-${day.id}`}
                      className={`flex-shrink-0 w-20 sm:w-24 p-4 sm:p-5 rounded-2xl text-center transition-all duration-300 transform hover:scale-105 ${
                        isToday
                          ? "bg-gradient-to-b from-emerald-500 to-green-600 text-white shadow-xl shadow-emerald-500/25 scale-105"
                          : "bg-white/60 dark:bg-gray-700/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-gray-700 dark:text-gray-300 hover:shadow-lg backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50"
                      }`}
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-medium opacity-75">
                          {date.toLocaleDateString(undefined, { weekday: "short" })}
                        </p>
                        <p className="text-xl sm:text-2xl font-bold">
                          {date.getDate()}
                        </p>
                        <p className="text-xs opacity-75">
                          {date.toLocaleDateString(undefined, { month: "short" })}
                        </p>
                        <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                          isToday 
                            ? "bg-white/20 text-white" 
                            : "bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300"
                        }`}>
                          {totalCalories} cal
                        </div>
                      </div>
                    </a>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Daily Meals Section - Enhanced */}
        <div className="space-y-6 sm:space-y-8">
          {mealPlan.days.map((day: DayMeal, dayIndex: number) => (
            <div
              key={day.id}
              id={`day-${day.id}`}
              className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden scroll-mt-24"
            >
              {/* Day Header - Enhanced */}
              <div className="bg-gradient-to-r from-emerald-50/80 to-green-50/80 dark:from-emerald-900/30 dark:to-green-900/30 p-6 sm:p-8 border-b border-gray-200/50 dark:border-gray-700/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-br from-emerald-600 to-green-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold mr-4 sm:mr-6 shadow-lg">
                      {dayIndex + 1}
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {new Date(day.date).toLocaleDateString(undefined, { 
                          weekday: "long", 
                          month: "long", 
                          day: "numeric" 
                        })}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {day.meals.length} meals planned
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <span className="inline-flex items-center px-4 py-2 bg-white/80 dark:bg-gray-700/80 text-emerald-700 dark:text-emerald-300 text-sm font-medium rounded-xl shadow-sm border border-emerald-200/50 dark:border-emerald-600/50">
                      <Utensils className="h-4 w-4 mr-2" />
                      {day.meals.length} meals
                    </span>
                    <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm font-medium rounded-xl shadow-lg">
                      {day.meals.reduce((sum, meal) => sum + meal.calories, 0)} total calories
                    </span>
                  </div>
                </div>
              </div>

              {/* Meals List - Enhanced */}
              <div className="divide-y divide-gray-200/50 dark:divide-gray-700/50">
                {day.meals.map((meal: Meal) => {
                  const mealColors = {
                    breakfast: {
                      bg: "from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20",
                      badge: "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 dark:from-yellow-800/50 dark:to-amber-800/50 dark:text-yellow-300",
                      border: "border-yellow-200/50 dark:border-yellow-600/30"
                    },
                    lunch: {
                      bg: "from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
                      badge: "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 dark:from-emerald-800/50 dark:to-green-800/50 dark:text-emerald-300",
                      border: "border-emerald-200/50 dark:border-emerald-600/30"
                    },
                    dinner: {
                      bg: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
                      badge: "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 dark:from-blue-800/50 dark:to-indigo-800/50 dark:text-blue-300",
                      border: "border-blue-200/50 dark:border-blue-600/30"
                    },
                    snack: {
                      bg: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
                      badge: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-800/50 dark:to-pink-800/50 dark:text-purple-300",
                      border: "border-purple-200/50 dark:border-purple-600/30"
                    },
                    default: {
                      bg: "from-gray-50 to-slate-50 dark:from-gray-800/20 dark:to-slate-800/20",
                      badge: "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 dark:from-gray-700/50 dark:to-slate-700/50 dark:text-gray-300",
                      border: "border-gray-200/50 dark:border-gray-600/30"
                    }
                  };
                  
                  const mealType = meal.type?.toLowerCase() || "default";
                  const colors = mealColors[mealType as keyof typeof mealColors] || mealColors.default;
                  
                  return (
                    <div key={meal.id} className={`p-6 sm:p-8 hover:bg-gradient-to-r ${colors.bg} transition-all duration-300 group`}>
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                        <div className="flex-1 space-y-4">
                          {/* Meal Header */}
                          <div className="flex flex-wrap items-center gap-3">
                            <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${colors.badge} shadow-sm border ${colors.border}`}>
                              {meal.type}
                            </span>
                            <span className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 shadow-sm">
                              {meal.calories} calories
                            </span>
                          </div>
                          
                          {/* Meal Content */}
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                              {meal.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                              {meal.description}
                            </p>
                          </div>
                          
                          {/* Ingredients */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                              Ingredients ({meal.ingredients.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {meal.ingredients.map((ingredient, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1.5 bg-white/60 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 text-sm rounded-lg border border-gray-200/50 dark:border-gray-600/50 hover:bg-white/80 dark:hover:bg-gray-600/80 transition-colors"
                                >
                                  {ingredient}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:min-w-[140px]">
                          <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-xl px-6 py-3 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                            View Recipe
                          </Button>
                          <Button className="bg-white/80 hover:bg-white text-gray-700 border border-gray-300/50 dark:bg-gray-700/80 dark:hover:bg-gray-600 dark:text-gray-200 dark:border-gray-600/50 rounded-xl px-6 py-3 text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200">
                            Swap Meal
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MealPlanDetailPage;
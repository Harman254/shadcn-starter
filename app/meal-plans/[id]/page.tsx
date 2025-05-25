import { generateGroceryListFromMealPlan } from "@/ai/flows/generate-grocery-list";
import GroceryListButton from "@/components/groceries-button";
import { Button } from "@/components/ui/button";
import { fetchMealPlanById } from "@/data";
import { Calendar as CalendarIcon, Utensils, Clock, ChevronRight, Info, Award, Activity, ChevronLeft, CarIcon } from "lucide-react";

// Add TypeScript types based on Prisma schema
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





const MealPlanDetailPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const { id } = params;
  const mealPlan: MealPlan | null = await fetchMealPlanById(id);


const handleGenerateGroceryList = (mealPlanId: string) => async () => {
  try {

    if (!mealPlanId) {
      throw new Error("Meal plan ID is required to generate grocery list.");
    }
   const groceries = await generateGroceryListFromMealPlan(mealPlanId);

    
  } catch (error) {
    
  }

}



  if (!mealPlan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50/35 to-green-100/35 dark:from-green-950/20 dark:to-green-900/20 p-4">
        <div className="text-center space-y-4 max-w-md w-full p-6 sm:p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-green-100/50 dark:border-green-900/50">
          <div className="mx-auto w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <Info className="h-8 w-8 text-red-500 dark:text-red-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">Meal Plan Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300">The requested meal plan could not be found or may have been deleted.</p>
          <a
            href="/meal-plans"
            className="inline-block mt-6 px-6 py-3 bg-green-600 text-white font-medium rounded-full hover:bg-green-700 transition-colors shadow-md"
          >
            Back to Meal Plans
          </a>
        </div>
      </div>
    );
  }

  // Calculate total calories across all days
  const totalPlanCalories = mealPlan.days.reduce(
    (sum, day) => sum + day.meals.reduce((daySum, meal) => daySum + meal.calories, 0),
    0
  );

  // Calculate average calories per day
  const avgCaloriesPerDay = Math.round(totalPlanCalories / mealPlan.days.length);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50/35 to-green-100/35 dark:from-green-950/20 dark:to-green-900/20 px-0 pb-12">
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-10">
        {/* Header - Enhanced with dark mode support and improved mobile responsiveness */}
        <header className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg border border-green-100/50 dark:border-green-900/50 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-100/20 to-green-200/30 dark:from-green-800/10 dark:to-green-700/20 rounded-full -mr-32 -mt-32 z-0"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-100/20 to-green-200/30 dark:from-green-800/10 dark:to-green-700/20 rounded-full -ml-24 -mb-24 z-0"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center mb-2">
                <div className="bg-green-100 dark:bg-green-800/50 p-2 rounded-lg mr-3">
                  <Utensils className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50 break-words">Your Meal Plans</h1>
              </div>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">Personalized nutrition for your fitness journey</p>
            </div>
            <div className="flex flex-wrap items-center justify-start md:justify-end gap-2 sm:gap-3">
            <GroceryListButton  mealplanId={mealPlan.id}   />
              <span className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-green-50 dark:bg-green-800/30 text-green-700 dark:text-green-300 text-xs sm:text-sm font-medium rounded-full shadow-sm border border-green-100 dark:border-green-800/50">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Active
              </span>
              <div className="bg-green-50 dark:bg-green-800/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full flex items-center shadow-sm border border-green-100 dark:border-green-800/50">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400 mr-1" />
                <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300 whitespace-nowrap">
                  Updated {new Date(mealPlan.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Plan Summary Grid - Enhanced with dark mode support and improved mobile responsiveness */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 md:mb-8">
          {[
            {
              icon: <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />,
              label: "Duration",
              value: `${mealPlan.duration} days`,
              bg: "bg-green-50 dark:bg-green-800/30",
              border: "border-green-100 dark:border-green-800/50",
            },
            {
              icon: <Utensils className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />,
              label: "Meals Per Day",
              value: mealPlan.mealsPerDay,
              bg: "bg-green-50 dark:bg-green-800/30",
              border: "border-green-100 dark:border-green-800/50",
            },
            {
              icon: <Award className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />,
              label: "Avg. Calories/Day",
              value: `${avgCaloriesPerDay} cal`,
              bg: "bg-green-50 dark:bg-green-800/30",
              border: "border-green-100 dark:border-green-800/50",
            },
            {
              icon: <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />,
              label: "Created On",
              value: new Date(mealPlan.createdAt).toLocaleDateString(),
              bg: "bg-green-50 dark:bg-green-800/30",
              border: "border-green-100 dark:border-green-800/50",
            },
          ].map(({ icon, label, value, bg, border }, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-md border border-green-100/50 dark:border-green-900/50 p-3 sm:p-4 md:p-6 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className={`${bg} p-2 sm:p-3 rounded-lg sm:rounded-xl ${border} group-hover:bg-green-100 dark:group-hover:bg-green-800/50 transition-colors duration-300`}>
                  {icon}
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
                  <p className="text-sm sm:text-base md:text-xl font-semibold text-gray-800 dark:text-gray-100">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Calendar View - Enhanced with dark mode support and improved mobile responsiveness */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg border border-green-100/50 dark:border-green-900/50 mb-4 sm:mb-6 md:mb-8 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">Calendar View</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Select a day to view your scheduled meals</p>
            </div>
            <div className="flex space-x-2 self-end sm:self-auto">
              <button className="p-1.5 sm:p-2 rounded-full bg-green-50 dark:bg-green-800/30 hover:bg-green-100 dark:hover:bg-green-700/50 transition-colors">
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
              </button>
              <button className="p-1.5 sm:p-2 rounded-full bg-green-50 dark:bg-green-800/30 hover:bg-green-100 dark:hover:bg-green-700/50 transition-colors">
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
              </button>
            </div>
          </div>
          
          {/* Calendar container with improved scrolling, visual indicators, and scalability */}
          <div className="relative">
            {/* Scroll indicators */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none h-full flex items-center">
              <div className="w-8 sm:w-12 h-full bg-gradient-to-r from-white to-transparent dark:from-gray-800 dark:to-transparent"></div>
            </div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 pointer-events-none h-full flex items-center">
              <div className="w-8 sm:w-12 h-full bg-gradient-to-l from-white to-transparent dark:from-gray-800 dark:to-transparent"></div>
            </div>
            
            {/* Scrollable container with fixed height and improved scalability */}
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-green-200 dark:scrollbar-thumb-green-700 scrollbar-track-transparent py-3 sm:py-4 md:py-6 px-3 sm:px-4 md:px-6 -mx-1 sm:mx-0">
              {/* Calendar grid with improved layout for many days */}
              <div className="flex gap-2 sm:gap-3 min-w-max pb-1 max-w-full">
                {/* Pagination controls for large number of days */}
                <div className="hidden">
                  {/* These controls would be shown via JavaScript when days exceed viewport */}
                  <button className="p-1.5 sm:p-2 rounded-full bg-green-50 dark:bg-green-800/30 hover:bg-green-100 dark:hover:bg-green-700/50 transition-colors">
                    <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                  </button>
                </div>
                
                {/* Calendar days with consistent sizing */}
                {mealPlan.days.map((day: DayMeal) => {
                  const date = new Date(day.date);
                  const isToday = new Date().toDateString() === date.toDateString();
                  const totalCalories = day.meals.reduce((sum, meal) => sum + meal.calories, 0);
                  return (
                    <a
                      key={day.id}
                      href={`#day-${day.id}`}
                      className={`flex flex-col items-center p-2 sm:p-3 md:p-4 w-[70px] sm:w-[80px] md:w-[90px] flex-shrink-0 rounded-xl sm:rounded-2xl transition-all duration-300 ${
                        isToday
                          ? "bg-gradient-to-b from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white shadow-lg"
                          : "bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900/50 text-gray-800 dark:text-gray-200 border border-green-100/50 dark:border-green-900/50 shadow-sm hover:shadow-md"
                      }`}
                    >
                      <span className="text-xs font-medium mb-0.5 sm:mb-1">{date.toLocaleDateString(undefined, { weekday: "short" })}</span>
                      <span className="text-xl sm:text-2xl font-bold">{date.getDate()}</span>
                      <span className="text-xs mt-0.5 sm:mt-1">{date.toLocaleDateString(undefined, { month: "short" })}</span>
                      <div
                        className={`mt-1 sm:mt-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs ${
                          isToday ? "bg-white/20 text-white" : "bg-green-100 dark:bg-green-800/50 text-green-700 dark:text-green-300"
                        }`}
                      >
                        {totalCalories} cal
                      </div>
                    </a>
                  );
                })}
                
                {/* Pagination controls for large number of days */}
                <div className="hidden">
                  {/* These controls would be shown via JavaScript when days exceed viewport */}
                  <button className="p-1.5 sm:p-2 rounded-full bg-green-50 dark:bg-green-800/30 hover:bg-green-100 dark:hover:bg-green-700/50 transition-colors">
                    <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Meals - Enhanced with dark mode support and improved mobile responsiveness */}
        <div className="space-y-4 sm:space-y-6">
          {mealPlan.days.map((day: DayMeal, index: number) => (
            <div 
              id={`day-${day.id}`} 
              key={day.id} 
              className="bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg border border-green-100/50 dark:border-green-900/50 overflow-hidden scroll-mt-16 sm:scroll-mt-20 md:scroll-mt-24"
            >
              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 px-4 sm:px-6 py-3 sm:py-5 border-b dark:border-gray-700 sticky top-0 backdrop-blur-sm z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center">
                    <span className="inline-flex items-center justify-center bg-green-600 dark:bg-green-700 text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full mr-2 sm:mr-3 font-bold text-xs sm:text-sm shadow-md">
                      {index + 1}
                    </span>
                    <span className="break-words">
                      {new Date(day.date).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                    </span>
                  </h2>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300 bg-white dark:bg-gray-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-green-200 dark:border-green-800 shadow-sm flex items-center">
                      <Utensils className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 text-green-500 dark:text-green-400" />
                      {day.meals.length} meals
                    </span>
                    <span className="text-xs sm:text-sm font-medium bg-green-600 dark:bg-green-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-md flex items-center">
                      {day.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0)} total calories
                    </span>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {day.meals.map((meal: Meal) => {
                  // Simplified color mapping with dark mode support
                  const mealTypeColors = {
                    breakfast: {
                      light: { bg: "bg-amber-100", text: "text-amber-600", bgHover: "bg-amber-50" },
                      dark: { bg: "dark:bg-amber-900/30", text: "dark:text-amber-400", bgHover: "dark:bg-amber-800/40" }
                    },
                    lunch: {
                      light: { bg: "bg-green-100", text: "text-green-600", bgHover: "bg-green-50" },
                      dark: { bg: "dark:bg-green-900/30", text: "dark:text-green-400", bgHover: "dark:bg-green-800/40" }
                    },
                    dinner: {
                      light: { bg: "bg-emerald-100", text: "text-emerald-600", bgHover: "bg-emerald-50" },
                      dark: { bg: "dark:bg-emerald-900/30", text: "dark:text-emerald-400", bgHover: "dark:bg-emerald-800/40" }
                    },
                    snack: {
                      light: { bg: "bg-lime-100", text: "text-lime-600", bgHover: "bg-lime-50" },
                      dark: { bg: "dark:bg-lime-900/30", text: "dark:text-lime-400", bgHover: "dark:bg-lime-800/40" }
                    },
                    default: {
                      light: { bg: "bg-blue-100", text: "text-blue-600", bgHover: "bg-blue-50" },
                      dark: { bg: "dark:bg-blue-900/30", text: "dark:text-blue-400", bgHover: "dark:bg-blue-800/40" }
                    }
                  };
                  
                  const typeKey = (meal.type?.toLowerCase() || "default") as keyof typeof mealTypeColors;
                  const colorSet = mealTypeColors[typeKey] || mealTypeColors.default;
                  
                  return (
                    <div key={meal.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorSet.light.bg} ${colorSet.light.text} ${colorSet.dark.bg} ${colorSet.dark.text}`}>
                              {meal.type}
                            </span>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                              {meal.calories} calories
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">{meal.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{meal.description}</p>
                          
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">Ingredients</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {meal.ingredients.map((ingredient, i) => (
                                <span 
                                  key={i} 
                                  className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2.5 py-1 rounded-full"
                                >
                                  {ingredient}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-3 sm:min-w-[100px]">
                          <Button className="text-xs w-full sm:w-auto px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-sm">
                            View Recipe
                          </Button>
                          <Button className="text-xs w-full sm:w-auto px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 border border-gray-200 dark:border-gray-600 rounded-full shadow-sm">
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

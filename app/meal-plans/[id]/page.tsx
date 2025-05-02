import { fetchMealPlanById } from "@/data";
import { Calendar as CalendarIcon, Utensils, Clock, ChevronRight, Info, Award, Activity, ChevronLeft } from "lucide-react";

// Add TypeScript types based on Prisma schema
type MealType = string;


type DayMeal = {
  id: string;
  date: Date;
  mealPlanId: string;
  meals: Meal[];
};

type Meal = {
  id: string;
  type: MealType;
  name: string;
  description: string;
  ingredients: string[];
  calories: number;
  dayMealId: string;
};

const MealPlanDetailPage = async (props: { params: Promise<{ id: string }> }) => {
  const params = await props.params;
  const { id } = params;
  const mealPlan = await fetchMealPlanById(id);

  if (!mealPlan) 
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="text-center space-y-4 max-w-md w-full p-6 md:p-8 bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <Info className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Meal Plan Not Found</h1>
          <p className="text-gray-600">The requested meal plan could not be found or may have been deleted.</p>
          <a
            href="/meal-plans"
            className="inline-block mt-6 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            Back to Meal Plans
          </a>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <header className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Your Meal Plan</h1>
              <p className="text-lg text-gray-600">Personalized nutrition for your fitness journey</p>
            </div>
            <div className="flex flex-wrap items-center justify-start md:justify-end gap-2">
              <span className="inline-flex items-center px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                <Activity className="h-4 w-4 mr-1" />
                Active
              </span>
              <div className="bg-primary/10 px-4 py-2 rounded-full flex items-center">
                <Clock className="h-4 w-4 text-primary mr-1" />
                <span className="text-sm font-medium text-primary">
                  Updated {new Date(mealPlan.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </header>
  
        {/* Plan Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {[
            {
              icon: <CalendarIcon className="h-6 w-6 text-primary" />,
              label: 'Duration',
              value: `${mealPlan.duration} days`,
              bg: 'bg-primary/10',
            },
            {
              icon: <Utensils className="h-6 w-6 text-indigo-600" />,
              label: 'Meals Per Day',
              value: mealPlan.mealsPerDay,
              bg: 'bg-indigo-50',
            },
            {
              icon: <Award className="h-6 w-6 text-amber-600" />,
              label: 'Goal',
              value: 'N/A',
              bg: 'bg-amber-50',
            },
            {
              icon: <Clock className="h-6 w-6 text-teal-600" />,
              label: 'Created On',
              value: new Date(mealPlan.createdAt).toLocaleDateString(),
              bg: 'bg-teal-50',
            },
          ].map(({ icon, label, value, bg }, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`${bg} p-3 rounded-full`}>{icon}</div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{label}</p>
                  <p className="text-xl font-semibold text-gray-800">{value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
  
        {/* Calendar View */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 mb-8">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-800">Calendar View</h2>
            <p className="text-gray-600 text-sm">Select a day to view your scheduled meals</p>
          </div>
          <div className="p-4 overflow-x-auto">
            <div className="flex gap-3 min-w-max">
              {mealPlan.days.map((day) => {
                const date = new Date(day.date);
                const isToday = new Date().toDateString() === date.toDateString();
                const totalCalories = day.meals.reduce((sum, meal) => sum + meal.calories, 0);
                return (
                  <a
                    key={day.id}
                    href={`#day-${day.id}`}
                    className={`flex flex-col items-center p-4 min-w-[84px] rounded-xl transition-all ${
                      isToday
                        ? 'bg-gradient-to-b from-primary to-primary/90 text-white shadow-lg'
                        : 'bg-white hover:bg-gray-50 text-gray-800 border border-gray-100 shadow-sm hover:shadow-md'
                    }`}
                  >
                    <span className="text-xs font-medium mb-1">{date.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                    <span className="text-2xl font-bold">{date.getDate()}</span>
                    <span className="text-xs mt-1">{date.toLocaleDateString(undefined, { month: 'short' })}</span>
                    <div
                      className={`mt-2 px-2 py-1 rounded-full text-xs ${
                        isToday ? 'bg-white/20 text-white' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {totalCalories} cal
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
  
        {/* Daily Meals */}
        <div className="space-y-6">
          {mealPlan.days.map((day, index) => (
            <div id={`day-${day.id}`} key={day.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden scroll-mt-24">
              <div className="bg-gradient-to-r from-primary/5 to-primary/20 px-6 py-5 border-b sticky top-0 backdrop-blur-sm z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    <span className="inline-flex items-center justify-center bg-primary text-white w-10 h-10 rounded-full mr-3 font-bold text-sm shadow-sm">
                      {index + 1}
                    </span>
                    {new Date(day.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                  </h2>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-primary bg-white px-4 py-2 rounded-full border border-primary/20 shadow-sm flex items-center">
                      <Utensils className="h-4 w-4 mr-2 text-primary/70" />
                      {day.meals.length} meals
                    </span>
                    <span className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-full shadow-sm flex items-center">
                      {day.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0)} total calories
                    </span>
                  </div>
                </div>
              </div>
  
              <div className="divide-y divide-gray-100">
                {day.meals.map((meal) => {
                  const type = meal.type.toLowerCase();
                  const colorMap = {
                    breakfast: ['amber'],
                    lunch: ['emerald'],
                    dinner: ['indigo'],
                    default: ['purple'],
                  }[type] || ['purple'];
                  return (
                    <div key={meal.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                        <div className="flex items-start gap-4">
                          <div className={`p-4 rounded-xl shadow-sm bg-${colorMap[0]}-50 text-${colorMap[0]}-600`}>
                            <Utensils className="h-6 w-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full bg-${colorMap[0]}-100 text-${colorMap[0]}-800`}>
                                {meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}
                              </span>
                              <span className="text-xs text-gray-500">•</span>
                              <span className="text-xs text-gray-500">{meal.calories} calories</span>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800">{meal.name}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-gray-100 px-4 py-2 rounded-lg shadow-sm">
                            <span className="text-sm font-bold text-gray-700">{meal.calories} calories</span>
                          </div>
                          <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                          </button>
                        </div>
                      </div>
  
                      {meal.description && (
                        <div className="pl-0 sm:pl-16">
                          <p className="text-gray-600 mb-3">{meal.description}</p>
                          {meal.ingredients?.length > 0 && (
                            <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-100">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <svg className="h-4 w-4 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0..." />
                                </svg>
                                Ingredients
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {meal.ingredients.map((ingredient, idx) => (
                                  <span key={idx} className="inline-flex items-center px-3 py-1 text-xs bg-white text-gray-700 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50">
                                    <span className="w-2 h-2 bg-primary/70 rounded-full mr-1.5"></span>
                                    {ingredient}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
  
        {/* CTA */}
        <div className="mt-10 flex justify-center">
          <a
            href="/meal-plans"
            className="flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors shadow-md"
          >
            Back to All Meal Plans
            <ChevronRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
    

export default MealPlanDetailPage;
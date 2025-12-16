import prisma from '@/lib/prisma';

export interface AnalyticsData {
  // Stats
  totalMeals: number;
  totalMealPlans: number;
  totalGroceryItems: number;
  avgCalories: number;
  
  // Changes
  mealsChange: { value: number; type: 'positive' | 'negative' | 'neutral' };
  mealPlansChange: { value: string; type: 'positive' | 'negative' | 'neutral' };
  groceriesChange: { value: number; type: 'positive' | 'negative' | 'neutral' };
  
  // Charts
  calorieChartData: Array<{ day: string; calories: number; target: number }>;
  nutritionBreakdown: Array<{ name: string; value: number; color: string }>;
  
  // Recent Meals
  recentMeals: Array<{
    id: string;
    name: string;
    time: string;
    calories: number;
    image: string;
    type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  }>;
  
  // Meal Plan Progress
  mealPlanProgress: {
    completed: number;
    total: number;
    weeklyPlans: Array<{ day: string; completed: boolean; meals: number }>;
  };
  
  // Grocery Insights
  groceryInsights: {
    categories: Array<{ name: string; amount: number; percentage: number; trend: 'up' | 'down'; color: string }>;
    totalItems: number;
    totalSpent: string;
  };
}

export async function fetchAnalyticsData(userId: string, range: 'week' | 'month' | 'all' = 'week'): Promise<AnalyticsData> {
  try {
    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    
    if (range === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (range === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(2000); // All time
    }
    
    // Fetch data in parallel
    const [
      mealPlans,
      meals,
      groceryLists,
      previousPeriodMealPlans,
      previousPeriodMeals,
    ] = await Promise.all([
      // Current period meal plans
      prisma.mealPlan.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
        include: {
          days: {
            include: {
              meals: true,
            },
          },
        },
      }),
      // Current period meals
      prisma.meal.findMany({
        where: {
          dayMeal: {
            mealPlan: {
              userId,
              createdAt: { gte: startDate },
            },
          },
        },
        orderBy: {
          dayMeal: {
            date: 'desc',
          },
        },
        take: 10,
        include: {
          dayMeal: {
            select: {
              date: true,
            },
          },
        },
      }),
      // Grocery lists
      prisma.groceryList.findMany({
        where: {
          userId,
          createdAt: { gte: startDate },
        },
      }),
      // Previous period for comparison
      prisma.mealPlan.findMany({
        where: {
          userId,
          createdAt: {
            gte: new Date(startDate.getTime() - (now.getTime() - startDate.getTime())),
            lt: startDate,
          },
        },
      }),
      prisma.meal.count({
        where: {
          dayMeal: {
            mealPlan: {
              userId,
              createdAt: {
                gte: new Date(startDate.getTime() - (now.getTime() - startDate.getTime())),
                lt: startDate,
              },
            },
          },
        },
      }),
    ]);

    // Calculate stats
    const totalMeals = meals.length;
    const totalMealPlans = mealPlans.length;
    const totalGroceryItems = groceryLists.reduce((sum, list) => {
      const items = Array.isArray(list.items) ? list.items : [];
      return sum + items.length;
    }, 0);

    // Calculate average calories
    let totalCalories = 0;
    let daysWithMeals = 0;
    mealPlans.forEach(plan => {
      plan.days.forEach(day => {
        const dayCalories = day.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
        if (dayCalories > 0) {
          totalCalories += dayCalories;
          daysWithMeals++;
        }
      });
    });
    const avgCalories = daysWithMeals > 0 ? Math.round(totalCalories / daysWithMeals) : 0;

    // Calculate changes
    const previousMeals = previousPeriodMeals;
    const mealsChangeValue = previousMeals > 0 
      ? Math.round(((totalMeals - previousMeals) / previousMeals) * 100)
      : totalMeals > 0 ? 100 : 0;
    const mealsChange = {
      value: mealsChangeValue,
      type: mealsChangeValue > 0 ? 'positive' : mealsChangeValue < 0 ? 'negative' : 'neutral' as const,
    };

    const previousMealPlans = previousPeriodMealPlans.length;
    const mealPlansChange = {
      value: previousMealPlans > 0 ? `${mealPlans.length - previousMealPlans} active plans` : `${totalMealPlans} plans`,
      type: 'neutral' as const,
    };

    // Calculate calorie chart data (last 7 days)
    const calorieChartData: Array<{ day: string; calories: number; target: number }> = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const targetCalories = 2000; // Default target, could come from user preferences
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayName = daysOfWeek[date.getDay()];
      
      // Find meals for this day
      let dayCalories = 0;
      mealPlans.forEach(plan => {
        plan.days.forEach(day => {
          const dayDate = new Date(day.date);
          if (dayDate.toDateString() === date.toDateString()) {
            dayCalories += day.meals.reduce((sum, meal) => sum + (meal.calories || 0), 0);
          }
        });
      });
      
      calorieChartData.push({
        day: dayName,
        calories: dayCalories || 0,
        target: targetCalories,
      });
    }

    // Calculate nutrition breakdown (simplified - would need actual macro data)
    const nutritionBreakdown = [
      { name: 'Protein', value: Math.round(avgCalories * 0.25 / 4), color: 'hsl(152, 55%, 42%)' },
      { name: 'Carbs', value: Math.round(avgCalories * 0.50 / 4), color: 'hsl(40, 95%, 55%)' },
      { name: 'Fats', value: Math.round(avgCalories * 0.25 / 9), color: 'hsl(24, 85%, 60%)' },
      { name: 'Fiber', value: Math.round(avgCalories * 0.05 / 2), color: 'hsl(200, 85%, 55%)' },
    ];

    // Format recent meals
    const recentMeals = meals.slice(0, 4).map(meal => {
      const dayDate = meal.dayMeal?.date ? new Date(meal.dayMeal.date) : new Date();
      const time = dayDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      
      return {
        id: meal.id,
        name: meal.name,
        time,
        calories: meal.calories || 0,
        image: meal.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=200&fit=crop',
        type: (meal.type || 'breakfast') as 'breakfast' | 'lunch' | 'dinner' | 'snack',
      };
    });

    // Calculate meal plan progress (this week)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    weekStart.setHours(0, 0, 0, 0);
    
    const thisWeekPlans = mealPlans.filter(plan => 
      new Date(plan.createdAt) >= weekStart
    );
    
    const weeklyPlans = daysOfWeek.map((day, index) => {
      const dayDate = new Date(weekStart);
      dayDate.setDate(weekStart.getDate() + index);
      
      const dayPlan = thisWeekPlans.find(plan => {
        return plan.days.some(d => {
          const planDay = new Date(d.date);
          return planDay.toDateString() === dayDate.toDateString();
        });
      });
      
      return {
        day,
        completed: !!dayPlan,
        meals: dayPlan ? dayPlan.days.reduce((sum, d) => sum + d.meals.length, 0) : 0,
      };
    });

    const completed = weeklyPlans.filter(p => p.completed).length;
    const total = weeklyPlans.length;

    // Calculate grocery insights
    const groceryCategories: Record<string, number> = {};
    let totalSpent = 0;
    
    groceryLists.forEach(list => {
      const items = Array.isArray(list.items) ? list.items : [];
      items.forEach((item: any) => {
        const category = item.category || 'Other';
        groceryCategories[category] = (groceryCategories[category] || 0) + 1;
        if (item.price) {
          totalSpent += parseFloat(item.price) || 0;
        }
      });
    });

    const categoryColors: Record<string, string> = {
      'Vegetables': 'hsl(152, 55%, 42%)',
      'Proteins': 'hsl(24, 85%, 60%)',
      'Dairy': 'hsl(200, 85%, 55%)',
      'Grains': 'hsl(40, 95%, 55%)',
      'Other': 'hsl(280, 50%, 50%)',
    };

    const groceryCategoriesArray = Object.entries(groceryCategories)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalGroceryItems > 0 ? Math.round((amount / totalGroceryItems) * 100) : 0,
        trend: 'down' as const, // Would need historical data to calculate
        color: categoryColors[name] || categoryColors['Other'],
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 4);

    return {
      totalMeals,
      totalMealPlans,
      totalGroceryItems,
      avgCalories,
      mealsChange,
      mealPlansChange,
      groceriesChange: { value: 0, type: 'neutral' as const },
      calorieChartData,
      nutritionBreakdown,
      recentMeals,
      mealPlanProgress: {
        completed,
        total,
        weeklyPlans,
      },
      groceryInsights: {
        categories: groceryCategoriesArray,
        totalItems: totalGroceryItems,
        totalSpent: `$${totalSpent.toFixed(2)}`,
      },
    };
  } catch (error) {
    console.error('[fetchAnalyticsData] Error:', error);
    // Return empty/default data on error
    return {
      totalMeals: 0,
      totalMealPlans: 0,
      totalGroceryItems: 0,
      avgCalories: 0,
      mealsChange: { value: 0, type: 'neutral' },
      mealPlansChange: { value: '0 plans', type: 'neutral' },
      groceriesChange: { value: 0, type: 'neutral' },
      calorieChartData: [],
      nutritionBreakdown: [],
      recentMeals: [],
      mealPlanProgress: {
        completed: 0,
        total: 0,
        weeklyPlans: [],
      },
      groceryInsights: {
        categories: [],
        totalItems: 0,
        totalSpent: '$0.00',
      },
    };
  }
}


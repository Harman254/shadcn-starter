//import  Create a singleton instance of PrismaClient
// Define the interface for meal data
import  prisma  from "@/lib/prisma";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from '@/lib/auth'
import { Meal as MealType } from '@/app/meal-plans/[id]/components/types';
import { incrementMealPlanGeneration } from "@/data";

// Configure API route for larger request bodies
export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic';

interface Meal extends MealType {}

// Define the interface for day meal plan data
interface DayMealPlan {
  day: number;
  meals: Meal[];
}

// Define the interface for save meal plan input
interface SaveMealPlanInput {
  title: string; // Optional title for the meal plan
  duration: number;
  mealsPerDay: number;
  days: DayMealPlan[];
  createdAt: string;
}

// This is the API route handler for POST requests
export async function POST(request:Request) {
  try {
    // Log request details for debugging
    const contentLength = request.headers.get('content-length')
    console.log('Request content length:', contentLength)
    
    const session = await auth.api.getSession({
      headers: await headers() // you need to pass the headers object.
  });
  
    if (!session) {
      return NextResponse.json(
        { 
          success: false, 
          error: "User not authenticated" 
        },
        { status: 401 }
      );
    }
    const userId = session.user.id;

    if (!userId){
      throw new Error("User not authenticated");
    }

    // Test database connection
    try {
      await prisma.$connect()
      console.log('Database connection successful')
    } catch (dbError) {
      console.error('Database connection failed:', dbError)
      return NextResponse.json(
        { 
          success: false, 
          error: "Database connection failed" 
        },
        { status: 500 }
      );
    }

    // Parse the request body
    let input: SaveMealPlanInput
    try {
      input = await request.json();
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError)
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid JSON in request body" 
        },
        { status: 400 }
      );
    }
    
    console.log('Parsed input:', {
      title: input.title,
      duration: input.duration,
      mealsPerDay: input.mealsPerDay,
      daysCount: input.days?.length,
      totalMeals: input.days?.reduce((acc, day) => acc + day.meals.length, 0)
    })
    
    // Validate required fields
    if (!input.title || !input.duration || !input.mealsPerDay || !input.days) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Missing required fields: title, duration, mealsPerDay, or days" 
        },
        { status: 400 }
      );
    }
    
    // Validate meal data structure
    for (const day of input.days) {
      if (!day.meals || !Array.isArray(day.meals)) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Invalid meal data structure for day ${day.day}` 
          },
          { status: 400 }
        );
      }
      
      for (const meal of day.meals) {
        if (!meal.name || !meal.description || !meal.ingredients || !meal.instructions) {
          return NextResponse.json(
            { 
              success: false, 
              error: `Missing required meal fields for meal: ${meal.name || 'unnamed'}` 
            },
            { status: 400 }
          );
        }
      }
    }
    
    // Create the main MealPlan record
    const mealPlan = await prisma.mealPlan.create({
      data: {
        title: input.title,
        userId: userId,
        duration: input.duration,
        mealsPerDay: input.mealsPerDay,
        createdAt: new Date(input.createdAt),
      },
    });
    
    console.log('Created meal plan with ID:', mealPlan.id)

    // For each day in the meal plan, create a DayMeal record
    for (const day of input.days) {
      try {
        // Create a date for this day (using the day number to offset from today)
        const dayDate = new Date();
        dayDate.setDate(dayDate.getDate() + (day.day - 1)); // Offset by day number (1-based)
        
        // Create the DayMeal record
        const dayMeal = await prisma.dayMeal.create({
          data: {
            date: dayDate,
            mealPlanId: mealPlan.id, // Direct field assignment
          },
        });
        
        console.log(`Created day meal for day ${day.day} with ID:`, dayMeal.id)
        
        // For each meal in this day, create a Meal record
        for (const meal of day.meals) {
          try {
            // Determine meal type based on index or other logic
            const mealIndex = day.meals.indexOf(meal);
            let mealType = "snack";
            
            if (mealIndex === 0) mealType = "breakfast";
            else if (mealIndex === 1) mealType = "lunch";
            else if (mealIndex === 2) mealType = "dinner";
            
            // Create the Meal record
            const createdMeal = await prisma.meal.create({
              data: {
                name: meal.name,
                type: mealType,
                description: meal.description,
                calories: calculateCalories(meal.ingredients),
                ingredients: meal.ingredients,
                imageUrl: meal.imageUrl || null,
                dayMealId: dayMeal.id,
                instructions: meal.instructions,
              },
            });
            
            console.log(`Created meal "${meal.name}" with ID:`, createdMeal.id)
          } catch (mealError) {
            console.error(`Error creating meal "${meal.name}":`, mealError)
            throw new Error(`Failed to create meal "${meal.name}": ${mealError instanceof Error ? mealError.message : 'Unknown error'}`)
          }
        }
      } catch (dayError) {
        console.error(`Error creating day ${day.day}:`, dayError)
        throw new Error(`Failed to create day ${day.day}: ${dayError instanceof Error ? dayError.message : 'Unknown error'}`)
      }
    }

    // Return the created meal plan with all related data
    const savedMealPlan = await prisma.mealPlan.findUnique({
      where: { id: mealPlan.id },
      include: {
        days: {
          include: {
            meals: true
          }
        }
      }
    });
    
    // Increment meal plan generation count
    await incrementMealPlanGeneration(userId);

    // --- Analytics Tracking ---
    // Count total meals and unique recipes in this meal plan
    const allMeals = savedMealPlan?.days.flatMap(day => day.meals) || [];
    const totalMeals = allMeals.length;
    const uniqueRecipes = new Set(allMeals.map(meal => meal.name)).size;

    // Upsert UserAnalytics
    await prisma.userAnalytics.upsert({
      where: { userId },
      update: {
        totalMealsCooked: { increment: totalMeals },
        totalRecipesTried: { increment: uniqueRecipes },
      },
      create: {
        userId,
        totalMealsCooked: totalMeals,
        totalRecipesTried: uniqueRecipes,
      },
    });
    // --- End Analytics Tracking ---

    // Return success response
    return NextResponse.json(
        { 
            success: true, 
            mealPlan: savedMealPlan 
        },
        { status: 200 }
    )
  } catch (error) {
    console.error('Error in save meal plan API route:', error);
    
    // Log additional details for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred' 
      },
      { status: 500 }
    );
  }
}

// Helper function to estimate calories based on ingredients
function calculateCalories(ingredients: string[]): number {
  // Simple estimation: 100 calories per ingredient
  return ingredients.length * 100;
}


//import  Create a singleton instance of PrismaClient
// Define the interface for meal data
import { prisma } from "@/lib/prisma";
import {NextResponse} from "next/server";


interface Meal {
  name: string;
  ingredients: string[];
  instructions: string;
}

// Define the interface for day meal plan data
interface DayMealPlan {
  day: number;
  meals: Meal[];
}

// Define the interface for save meal plan input
interface SaveMealPlanInput {
  duration: number;
  mealsPerDay: number;
  days: DayMealPlan[];
  createdAt: string;
}

// This is the API route handler for POST requests
export async function POST(request:Request) {
  try {
    // Parse the request body
    const input: SaveMealPlanInput = await request.json();
    
    console.log("API route received meal plan data:", JSON.stringify(input, null, 2));
    
    // Create the main MealPlan record
    const mealPlan = await prisma.mealPlan.create({
      data: {
        duration: input.duration,
        mealsPerDay: input.mealsPerDay,
        createdAt: new Date(input.createdAt),
      },
    });
    
    console.log("Created MealPlan record:", mealPlan);

    // For each day in the meal plan, create a DayMeal record
    for (const day of input.days) {
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
      
      // For each meal in this day, create a Meal record
      for (const meal of day.meals) {
        // Determine meal type based on index or other logic
        const mealIndex = day.meals.indexOf(meal);
        let mealType = "snack";
        
        if (mealIndex === 0) mealType = "breakfast";
        else if (mealIndex === 1) mealType = "lunch";
        else if (mealIndex === 2) mealType = "dinner";
        
        // Create the Meal record
        await prisma.meal.create({
          data: {
            name: meal.name,
            type: mealType,
            description: meal.instructions, // Map instructions to description
            calories: calculateCalories(meal.ingredients), // Helper function to estimate calories
            dayMealId: dayMeal.id, // Direct field assignment
          },
        });
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
    
    // Return success response
    return NextResponse.json(
        { 
            success: true, 
            mealPlan: savedMealPlan 
        },
        { status: 200 }
    )
  } catch (error) {
    console.error('Error in API route:', error);
    
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

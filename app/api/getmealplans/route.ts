import { getLatestMealPlanByUserId,  getMealsByUserId} from "@/data"; // make sure this exists
import { Meal, MealType } from "@/types";
import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';






export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ meals: [], mealPlan: null });
  }

  const meals = (await getMealsByUserId(userId) as Meal[]).map((meal) => ({
    ...meal,
    type: meal.type as MealType, // May not be needed if already a MealType
  }));

  const mealPlan = await getLatestMealPlanByUserId(userId);

  return NextResponse.json({ meals, mealPlan });
}

import { getLatestMealPlanByUserId,  getMealsByUserId} from "@/data"; // make sure this exists
import { auth } from "@/lib/auth";
import { Meal, MealType } from "@/types";
import { headers } from "next/headers";
import { NextResponse } from "next/server";






export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers()
})


  const userId = session?.user.id;

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

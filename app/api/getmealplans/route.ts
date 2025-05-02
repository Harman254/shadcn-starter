import { getLatestMealPlanByUserId,  getMealsByUserId} from "@/data"; // make sure this exists
import { MealType } from "@/types";
import { NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { prisma } from "@/lib/prisma";






export async function GET(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ meals: [], mealPlan: null });
  }

  const meals = (await getMealsByUserId(userId)).map((meal) => ({
    ...meal,
    type: meal.type as MealType,
  }));

  const mealPlan = await getLatestMealPlanByUserId(userId); // you need to implement this if it doesn't exist

  return NextResponse.json({ meals, mealPlan });
}

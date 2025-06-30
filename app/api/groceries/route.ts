// app/api/groceries/route.ts
import { generateGroceryListById } from '@/ai/flows/generate-grocery-list';
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mealPlanId = searchParams.get('id');

  if (!mealPlanId) {
    return NextResponse.json({ error: 'Meal Plan ID is required' }, { status: 400 });
  }

  try {
    // The AI flow now returns the full object { groceryList, locationInfo }
    const groceryData = await generateGroceryListById(mealPlanId);
    return NextResponse.json(groceryData);
  } catch (error) {
    console.error(`Error generating grocery list for ID ${mealPlanId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: `Failed to generate grocery list: ${errorMessage}` }, { status: 500 });
  }
}

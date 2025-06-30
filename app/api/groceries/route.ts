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
    const groceryList = await generateGroceryListById(mealPlanId);
    return NextResponse.json({ groceryList });
  } catch (error) {
    console.error(`Error generating grocery list for ID ${mealPlanId}:`, error);
    return NextResponse.json({ error: 'Failed to generate grocery list' }, { status: 500 });
  }
}

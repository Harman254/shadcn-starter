import { NextRequest, NextResponse } from 'next/server';
import { generateGroceryListFromMealPlan } from '@/ai/flows/generate-grocery-list';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "Invalid or missing meal plan ID." }, { status: 400 });
    }
    
    const { groceryList, locationData } = await generateGroceryListFromMealPlan(id, session.user.id);

    const responsePayload = {
      groceryList: groceryList.groceryList,
      locationInfo: {
        ...locationData,
        ...groceryList.locationInfo,
      }
    };

    return NextResponse.json(responsePayload);
    
  } catch (error) {
    console.error("Error in GET /api/grocery-list/[id]:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: `Failed to generate grocery list: ${errorMessage}` }, { status: 500 });
  }
}

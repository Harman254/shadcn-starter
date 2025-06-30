import { NextRequest, NextResponse } from 'next/server';
import { generateGroceryListFromMealPlan } from '@/ai/flows/generate-grocery-list';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { id } = context.params;

  if (!id) {
    return NextResponse.json({ error: "Invalid meal plan ID." }, { status: 400 });
  }

  try {
    const result = await generateGroceryListFromMealPlan(id, session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in GET /api/grocery-list/[id]:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return NextResponse.json({ error: `Failed to generate grocery list: ${errorMessage}` }, { status: 500 });
  }
}

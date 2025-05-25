import { NextRequest, NextResponse } from 'next/server';
import { generateGroceryListFromMealPlan } from '@/ai/flows/generate-grocery-list';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const data = await generateGroceryListFromMealPlan(id);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch grocery list' }, { status: 500 });
  }
}

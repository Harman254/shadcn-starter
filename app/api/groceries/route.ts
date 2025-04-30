// app/api/groceries/route.ts
import { generateGroceryListFromLatest } from '@/ai/flows/generate-grocery-list';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const groceryList = await generateGroceryListFromLatest();
    return NextResponse.json({ groceryList });
  } catch (error) {
    console.error('Error generating grocery list:', error);
    return NextResponse.json({ error: 'Failed to generate grocery list' });
  }
}

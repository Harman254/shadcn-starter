import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { generateGroceryList } from '@/lib/orchestration/ai-tools'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if grocery list already exists in database
    const existingList = await prisma.groceryList.findFirst({
      where: {
        mealPlanId: id,
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (existingList && existingList.items) {
      // Return existing list
      const items = Array.isArray(existingList.items) 
        ? existingList.items 
        : JSON.parse(existingList.items as string)
      
      // Extract location info from items if available, or use defaults
      const firstItem = items[0]
      const cityFromItem = firstItem?.suggestedLocation?.split(',')[0] || 'Local'
      
      return NextResponse.json({
        items: items.map((item: any, index: number) => ({
          id: item.id || `item-${index}`,
          item: item.item || item.name || '',
          quantity: item.quantity || '',
          category: item.category || 'Other',
          estimatedPrice: item.estimatedPrice || item.price || '0',
          suggestedLocation: item.suggestedLocation || item.location || '',
          checked: false,
        })),
        userLocation: {
          city: cityFromItem,
          country: 'Area',
          currencySymbol: existingList.currency || '$',
        },
      })
    }

    // Fetch meal plan from database
    const mealPlan = await prisma.mealPlan.findUnique({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        days: {
          include: {
            meals: true,
          },
        },
      },
    })

    if (!mealPlan) {
      return NextResponse.json(
        { error: 'Meal plan not found' },
        { status: 404 }
      )
    }

    // Generate grocery list using AI SDK tool
    const result = await generateGroceryList.execute(
      {
        source: 'mealplan',
        mealPlanId: id,
      },
      {
        context: {
          userId: session.user.id,
          sessionId: session.session.id,
        },
      } as any
    )

    if (!result.success || !result.data?.groceryList) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate grocery list' },
        { status: 500 }
      )
    }

    const groceryListData = result.data.groceryList

    // Save to database
    const savedList = await prisma.groceryList.create({
      data: {
        userId: session.user.id,
        mealPlanId: id,
        items: groceryListData.items as any,
        totalCost: parseFloat(
          groceryListData.totalEstimatedCost?.replace(/[^0-9.]/g, '') || '0'
        ),
        currency: groceryListData.locationInfo?.currencySymbol || '$',
      },
    })

    return NextResponse.json({
      items: groceryListData.items.map((item: any, index: number) => ({
        id: item.id || `item-${index}`,
        item: item.item || item.name || '',
        quantity: item.quantity || '',
        category: item.category || 'Other',
        estimatedPrice: item.estimatedPrice || item.price || '0',
        suggestedLocation: item.suggestedLocation || item.location || '',
        checked: false,
      })),
      userLocation: {
        city: groceryListData.locationInfo?.localStores?.[0]?.split(',')[0] || 'Local',
        country: 'Area',
        currencySymbol: groceryListData.locationInfo?.currencySymbol || '$',
      },
    })
  } catch (error) {
    console.error('[GET /api/grocery-list/[id]] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate grocery list' },
      { status: 500 }
    )
  }
}


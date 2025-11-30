import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        // Authenticate user
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return NextResponse.json(
                { success: false, error: 'User not authenticated' },
                { status: 401 }
            );
        }

        // Parse request body
        const body = await request.json();
        const { items, locationInfo, totalEstimatedCost, mealPlanId } = body;

        if (!items || !Array.isArray(items)) {
            return NextResponse.json(
                { success: false, error: 'Invalid items data' },
                { status: 400 }
            );
        }

        // Parse cost
        const currency = locationInfo?.currencySymbol || '$';
        const totalCost = parseFloat(totalEstimatedCost?.replace(/[^0-9.]/g, '') || '0');

        // Save to Database
        const savedList = await prisma.groceryList.create({
            data: {
                userId: session.user.id,
                mealPlanId: mealPlanId || null,
                items: items as any,
                totalCost: totalCost,
                currency: currency,
            }
        });

        return NextResponse.json({
            success: true,
            list: savedList,
            message: 'Grocery list saved successfully'
        });

    } catch (error) {
        console.error('[POST /api/grocery/save] Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to save grocery list'
            },
            { status: 500 }
        );
    }
}

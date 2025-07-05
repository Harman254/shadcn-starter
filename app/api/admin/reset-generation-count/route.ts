import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { resetMealPlanGenerationCount } from '@/data'; // Im
// 
// 
// 
// port the new data function

export async function POST(request: NextRequest) {
  try {
    // TODO: Restrict to admin users only in production
    // const session = await auth.api.getSession({ headers: await headers() });
    // if (!session?.user?.isAdmin) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });

    const { userIdOrEmail } = await request.json();
    if (!userIdOrEmail) {
      return NextResponse.json({ success: false, error: 'Missing userIdOrEmail' }, { status: 400 });
    }

    // Lookup user by email or ID
    let userId = userIdOrEmail;
    if (userIdOrEmail.includes('@')) {
      const user = await prisma.user.findUnique({ where: { email: userIdOrEmail } });
      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found by email' }, { status: 404 });
      }
      userId = user.id;
    }

    // Use the new data layer function to reset the count
    const result = await resetMealPlanGenerationCount(userId);

    if (result.success) {
      return NextResponse.json({ success: true, record: result.record });
    } else {
      return NextResponse.json({ success: false, error: 'Failed to reset generation count' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error resetting generation count:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}


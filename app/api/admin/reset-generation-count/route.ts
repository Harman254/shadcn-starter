import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { startOfWeek } from 'date-fns';
import { auth } from '@/lib/auth';

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

    // Find the current week's start (Sunday)
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });

    // Find or create the mealPlanGeneration record for this user and week
    let record = await prisma.mealPlanGeneration.findFirst({
      where: { userId, weekStart },
    });
    if (!record) {
      record = await prisma.mealPlanGeneration.create({
        data: { userId, weekStart, generationCount: 0 },
      });
    } else {
      await prisma.mealPlanGeneration.update({
        where: { id: record.id },
        data: { generationCount: 0 },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error resetting generation count:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 
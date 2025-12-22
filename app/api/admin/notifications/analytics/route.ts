import { NextRequest, NextResponse } from 'next/server';
import { getNotificationAnalytics } from '@/lib/notifications/tracking';
import { getServerSession } from '@/lib/auth-server';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin access
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin (you may need to adjust this based on your admin check)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    // TODO: Add proper admin check
    // For now, allow if user exists
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get date range from query params
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined;
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined;

    // Get analytics
    const analytics = await getNotificationAnalytics(startDate, endDate);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('[Admin Analytics] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}


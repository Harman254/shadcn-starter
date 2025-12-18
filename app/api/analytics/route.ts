import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { fetchAnalyticsData } from '@/app/(dashboard)/dashboard/analytics/analytics-data';
import { hasAdvancedAnalytics } from '@/lib/utils/feature-gates';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check Pro access
    const hasAccess = await hasAdvancedAnalytics(session.user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Pro feature - upgrade required' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const range = (searchParams.get('range') || 'week') as 'week' | 'month' | 'all';

    const data = await fetchAnalyticsData(session.user.id, range);

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Analytics API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}


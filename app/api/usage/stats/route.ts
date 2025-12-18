import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { getUserUsageStats } from '@/lib/utils/tool-usage-tracker';

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

    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') || 'week') as 'day' | 'week' | 'month';

    const stats = await getUserUsageStats(session.user.id, period);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[Usage Stats API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage stats' },
      { status: 500 }
    );
  }
}


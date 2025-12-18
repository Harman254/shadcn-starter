import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { fetchAnalyticsData } from '@/app/(dashboard)/dashboard/analytics/analytics-data';
import { hasAdvancedAnalytics } from '@/lib/utils/feature-gates';

function convertToCSV(data: any): string {
  // Convert analytics data to CSV format
  const rows: string[] = [];
  
  // Header
  rows.push('Metric,Value');
  rows.push(`Total Meals,${data.totalMeals}`);
  rows.push(`Total Meal Plans,${data.totalMealPlans}`);
  rows.push(`Total Grocery Items,${data.totalGroceryItems}`);
  rows.push(`Average Calories,${data.avgCalories}`);
  rows.push('');
  rows.push('Date,Calories,Target');
  data.calorieChartData.forEach((item: any) => {
    rows.push(`${item.day},${item.calories},${item.target}`);
  });
  rows.push('');
  rows.push('Nutrient,Value (g)');
  data.nutritionBreakdown.forEach((item: any) => {
    rows.push(`${item.name},${item.value}`);
  });
  
  return rows.join('\n');
}

function convertToJSON(data: any): string {
  return JSON.stringify(data, null, 2);
}

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
    const format = (searchParams.get('format') || 'csv') as 'csv' | 'json';
    const range = (searchParams.get('range') || 'week') as 'week' | 'month' | 'all';

    const data = await fetchAnalyticsData(session.user.id, range);

    let content: string;
    let contentType: string;
    let filename: string;

    if (format === 'csv') {
      content = convertToCSV(data);
      contentType = 'text/csv';
      filename = `analytics-${range}-${new Date().toISOString().split('T')[0]}.csv`;
    } else {
      content = convertToJSON(data);
      contentType = 'application/json';
      filename = `analytics-${range}-${new Date().toISOString().split('T')[0]}.json`;
    }

    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[Analytics Export API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    );
  }
}


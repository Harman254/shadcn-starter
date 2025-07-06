import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { checkAndNotifyGenerationReset, notifyGenerationLimitReached } from '@/data';

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { testType } = body;

    if (testType === 'reset') {
      // Test generation reset notification
      const result = await checkAndNotifyGenerationReset(session.user.id);
      return NextResponse.json({
        success: true,
        message: 'Generation reset notification test completed',
        result
      });
    } else if (testType === 'limit') {
      // Test generation limit notification
      await notifyGenerationLimitReached(session.user.id);
      return NextResponse.json({
        success: true,
        message: 'Generation limit notification sent'
      });
    } else {
      return NextResponse.json({
        error: 'Invalid test type. Use "reset" or "limit"'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error testing generation notifications:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Generation notification test API',
    usage: {
      reset: 'POST with { "testType": "reset" } to test generation reset notification',
      limit: 'POST with { "testType": "limit" } to test generation limit notification'
    }
  });
} 
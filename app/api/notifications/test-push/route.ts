import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications/sender';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

/**
 * Test endpoint to verify push notification setup
 * GET: Check configuration
 * POST: Send test notification
 */
export async function GET(request: NextRequest) {
  const PUSHENGAGE_API_KEY = process.env.PUSHENGAGE_API_KEY;
  const PUSHENGAGE_SITE_ID = process.env.PUSHENGAGE_SITE_ID || 'cf02cb04-3bc3-40bc-aef1-dc98cb81379d';

  return NextResponse.json({
    configured: !!PUSHENGAGE_API_KEY,
    siteId: PUSHENGAGE_SITE_ID,
    apiKeyPresent: !!PUSHENGAGE_API_KEY,
    apiKeyLength: PUSHENGAGE_API_KEY?.length || 0,
    message: PUSHENGAGE_API_KEY
      ? 'PushEngage is configured. You can test sending notifications.'
      : 'PUSHENGAGE_API_KEY is missing. Add it to your .env file.',
  });
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Send test push notification
    const notificationId = await sendNotification({
      userId: session.user.id,
      type: 'test-push',
      channel: 'push',
      data: {
        title: '🧪 Test Push Notification',
        message: 'If you received this, PushEngage is working correctly!',
      },
      actionUrl: 'https://www.aimealwise.com/dashboard',
    });

    return NextResponse.json({
      success: true,
      message: 'Test push notification sent!',
      notificationId,
      note: 'Make sure you have subscribed to push notifications in your browser.',
    });
  } catch (error: any) {
    console.error('Error sending test push notification:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to send test notification',
        details: error.stack,
      },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';

// PushEngage API configuration
const PUSHENGAGE_API_KEY = process.env.PUSHENGAGE_API_KEY;
const PUSHENGAGE_SITE_ID = process.env.PUSHENGAGE_SITE_ID || 'cf02cb04-3bc3-40bc-aef1-dc98cb81379d';

interface NotificationPayload {
  title: string;
  message: string;
  url?: string;
  icon?: string;
  category?: string;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: NotificationPayload = await request.json();
    const { title, message, url, icon, category, userId } = body;

    // Validate required fields
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' },
        { status: 400 }
      );
    }

    // Prepare notification data for PushEngage
    const notificationData = {
      title,
      message,
      url: url || 'https://www.aimealwise.com',
      icon: icon || 'https://www.aimealwise.com/favicon.ico',
      category: category || 'mealwise-general',
      // Add any additional PushEngage specific fields here
    };

    // Send notification via PushEngage API
    const response = await fetch('https://api.pushengage.com/apiv1/notification/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PUSHENGAGE_API_KEY}`,
      },
      body: JSON.stringify({
        site_id: PUSHENGAGE_SITE_ID,
        notification: notificationData,
        // You can add targeting options here
        // target: {
        //   user_id: userId,
        //   segments: ['meal-planners'],
        // }
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('PushEngage API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to send notification' },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      data: result,
    });

  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Example usage for different notification types
export async function GET() {
  return NextResponse.json({
    message: 'Notification API is running',
    examples: {
      mealPlanReminder: {
        title: 'Time to plan your meals!',
        message: 'Your weekly meal plan is ready to be created.',
        url: 'https://www.aimealwise.com/dashboard/create-meal-plan',
        category: 'meal-plan-reminder'
      },
      newRecipe: {
        title: 'New recipe available!',
        message: 'Check out our latest healthy recipe.',
        url: 'https://www.aimealwise.com/recipes',
        category: 'new-recipe'
      },
      nutritionTip: {
        title: 'Nutrition tip of the week',
        message: 'Learn how to boost your energy with these foods.',
        url: 'https://www.aimealwise.com/blog',
        category: 'nutrition-tip'
      }
    }
  });
} 
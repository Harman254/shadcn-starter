import prisma from "@/lib/prisma";
import { resend } from "@/lib/helpers/email/resend";

export interface NotificationData {
  userId: string;
  type: string;
  channel: "email" | "push" | "in-app" | "all";
  data: Record<string, any>;
}

/**
 * Centralized notification sender
 * Handles routing to appropriate channels based on user preferences
 */
export async function sendNotification({
  userId,
  type,
  channel,
  data,
}: NotificationData): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { Subscription: true },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  // Get user preferences
  // TODO: Uncomment once NotificationPreferences model is added to Prisma schema
  let preferences = null;
  let todayNotifications = 0;
  
  try {
    // @ts-ignore - NotificationPreferences may not exist in schema yet
    preferences = await (prisma as any).notificationPreferences.findUnique({
      where: { userId },
    });
  } catch (error) {
    // Model doesn't exist yet - continue without preference checks
    console.warn('[sendNotification] NotificationPreferences model not found, continuing without preference check');
  }

  try {
    // Check if user has reached daily limits
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // @ts-ignore - NotificationLog may not exist in schema yet
    todayNotifications = await (prisma as any).notificationLog.count({
      where: {
        userId,
        createdAt: { gte: today },
      },
    }) || 0;
  } catch (error) {
    // Model doesn't exist yet - continue without limit checks
    console.warn('[sendNotification] NotificationLog model not found, continuing without limit check');
  }

  // Send based on channel preference
  if (channel === "email" || channel === "all") {
    if (
      !preferences ||
      (preferences.emailEnabled &&
        todayNotifications < preferences.maxEmailsPerDay)
    ) {
      await sendEmailNotification(user.email, type, data);
      await logNotification(userId, type, "email");
    }
  }

  if (channel === "push" || channel === "all") {
    if (
      !preferences ||
      (preferences.pushEnabled &&
        todayNotifications < preferences.maxPushPerDay)
    ) {
      await sendPushNotification(userId, type, data);
      await logNotification(userId, type, "push");
    }
  }

  // Always send in-app notification
  await createInAppNotification(userId, type, data);
  await logNotification(userId, type, "in-app");
}

/**
 * Send email notification via Resend
 */
async function sendEmailNotification(
  email: string,
  type: string,
  data: Record<string, any>
): Promise<void> {
  const templates = {
    "meal-plan-reminder": {
      subject: "Time to plan your week! 🍽️",
      html: `
        <h1>Hi ${data.userName}!</h1>
        <p>It's time to plan your meals for the week. Let's create something delicious!</p>
        ${data.isPro ? "" : '<p><a href="/chat">Create your meal plan</a></p>'}
      `,
    },
    // Add more templates...
  };

  const template = templates[type as keyof typeof templates];
  if (!template) {
    throw new Error(`No email template for type: ${type}`);
  }

  await resend.emails.send({
    from: "MealWise <notifications@aimealwise.com>",
    to: email,
    subject: template.subject,
    html: template.html,
  });
}

/**
 * Send push notification via PushEngage
 */
async function sendPushNotification(
  userId: string,
  type: string,
  data: Record<string, any>
): Promise<void> {
  // Implementation using PushEngage API
  // Similar to existing app/api/notifications/send/route.ts
}

/**
 * Create in-app notification
 */
async function createInAppNotification(
  userId: string,
  type: string,
  data: Record<string, any>
): Promise<void> {
  // Store in database for in-app notification center
  // This would require a Notification model in Prisma
}

/**
 * Log notification for analytics
 * TODO: Uncomment once NotificationLog model is added to Prisma schema
 */
async function logNotification(
  userId: string,
  type: string,
  channel: string
): Promise<void> {
  // TODO: Uncomment once NotificationLog model exists
  /*
  try {
    await prisma.notificationLog.create({
      data: {
        userId,
        type,
        channel,
      },
    });
  } catch (error) {
    // NotificationLog model doesn't exist yet - log to console for now
    console.log(`[Notification] ${type} sent via ${channel} to user ${userId}`);
  }
  */
  // Temporary: Just log to console until NotificationLog model is added
  console.log(`[Notification] ${type} sent via ${channel} to user ${userId}`);
}


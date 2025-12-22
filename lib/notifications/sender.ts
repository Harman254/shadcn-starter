import prisma from "@/lib/prisma";
import { resend } from "@/lib/helpers/email/resend";
import { createTrackedUrl, trackConversionEvent } from "./tracking";

export interface NotificationData {
  userId: string;
  type: string;
  channel: "email" | "push" | "in-app" | "all";
  data: Record<string, any>;
  actionUrl?: string; // URL to track clicks on
}

/**
 * Centralized notification sender
 * Handles routing to appropriate channels based on user preferences
 * Includes click tracking and conversion tracking
 */
export async function sendNotification({
  userId,
  type,
  channel,
  data,
  actionUrl,
}: NotificationData): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { Subscription: true },
  });

  if (!user) {
    throw new Error(`User ${userId} not found`);
  }

  // Get user preferences
  let preferences = null;
  let todayNotifications = 0;
  
  try {
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

  // Create notification log entry first to get ID for tracking
  let notificationLogId: string | null = null;
  try {
    const logEntry = await (prisma as any).notificationLog.create({
      data: {
        userId,
        type,
        channel: channel === "all" ? "email" : channel,
        read: false,
        clicked: false,
      },
    });
    notificationLogId = logEntry.id;
  } catch (error) {
    // NotificationLog model doesn't exist yet - generate a temporary ID
    notificationLogId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.warn('[sendNotification] NotificationLog model not found, using temporary ID');
  }

  // Create tracked URLs if actionUrl provided
  const trackedActionUrl = actionUrl && notificationLogId
    ? createTrackedUrl(actionUrl, {
        userId,
        notificationId: notificationLogId,
        type,
        channel: channel === "all" ? "email" : channel,
      }, 'notification', channel === "all" ? "email" : channel, type)
    : actionUrl;

  // Send based on channel preference
  if (channel === "email" || channel === "all") {
    if (
      !preferences ||
      (preferences.emailEnabled &&
        todayNotifications < (preferences.maxEmailsPerDay || 3))
    ) {
      await sendEmailNotification(user.email, type, {
        ...data,
        actionUrl: trackedActionUrl,
        notificationId: notificationLogId,
      });
    }
  }

  if (channel === "push" || channel === "all") {
    if (
      !preferences ||
      (preferences.pushEnabled &&
        todayNotifications < (preferences.maxPushPerDay || 5))
    ) {
      await sendPushNotification(userId, type, {
        ...data,
        actionUrl: trackedActionUrl,
        notificationId: notificationLogId,
      });
    }
  }

  // Always send in-app notification
  await createInAppNotification(userId, type, {
    ...data,
    actionUrl: trackedActionUrl,
    notificationId: notificationLogId,
  });

  return notificationLogId;
}

/**
 * Send email notification via Resend with tracking
 */
async function sendEmailNotification(
  email: string,
  type: string,
  data: Record<string, any>
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const actionUrl = data.actionUrl || `${baseUrl}/chat`;
  const notificationId = data.notificationId;

  // Create tracking pixel URL for email opens
  const trackingPixelUrl = notificationId
    ? `${baseUrl}/api/notifications/track/open?token=${Buffer.from(JSON.stringify({
        notificationId,
        type,
        channel: 'email',
        timestamp: Date.now(),
      })).toString('base64')}`
    : null;

  const templates: Record<string, { subject: string; html: (data: any) => string }> = {
    "meal-plan-reminder": {
      subject: "Time to plan your week! 🍽️",
      html: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Hi ${data.userName || 'there'}! 👋</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <p style="font-size: 18px; margin-bottom: 20px;">It's time to plan your meals for the week! Let's create something delicious! 🍽️</p>
            ${data.isPro ? '' : `
              <p style="margin-bottom: 20px;">As a Pro member, you get access to AI-generated realistic images for your meal plans!</p>
            `}
            <a href="${actionUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Create Your Meal Plan →</a>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            Happy meal planning!<br>
            The MealWise Team
          </p>
          ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" style="display: none;" />` : ''}
        </body>
        </html>
      `,
    },
    "pro-expiration-warning": {
      subject: "Your Pro subscription expires soon ⏰",
      html: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Don't lose your Pro benefits! ⚠️</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Hi ${data.userName || 'there'},</p>
            <p style="margin-bottom: 20px;">Your ${data.plan || 'Pro'} subscription expires in <strong>${data.daysRemaining || 7} days</strong> (${new Date(data.expirationDate).toLocaleDateString()}).</p>
            <p style="margin-bottom: 20px;">Renew now to keep enjoying:</p>
            <ul style="margin-bottom: 20px; padding-left: 20px;">
              <li>✨ AI-generated realistic meal images</li>
              <li>📊 Advanced analytics</li>
              <li>🎯 Unlimited meal plans</li>
              <li>🚀 Priority support</li>
            </ul>
            <a href="${actionUrl || `${baseUrl}/dashboard?upgrade=true`}" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Renew Subscription →</a>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            Questions? Reply to this email or visit our support center.<br>
            The MealWise Team
          </p>
          ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" style="display: none;" />` : ''}
        </body>
        </html>
      `,
    },
    "usage-limit-reset": {
      subject: "Your usage limits have been reset! 🎉",
      html: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Fresh start! 🎉</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Hi ${data.userName || 'there'},</p>
            <p style="margin-bottom: 20px;">Great news! Your weekly usage limits have been reset. You can now create more meal plans and recipes!</p>
            <a href="${actionUrl || `${baseUrl}/chat`}" style="display: inline-block; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Start Creating →</a>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            Happy meal planning!<br>
            The MealWise Team
          </p>
          ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" style="display: none;" />` : ''}
        </body>
        </html>
      `,
    },
    "pantry-expiration-alert": {
      subject: "Items in your pantry are expiring soon 🥗",
      html: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Use it before you lose it! ⏰</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Hi ${data.userName || 'there'},</p>
            <p style="margin-bottom: 20px;">You have <strong>${data.expiringCount || 0} items</strong> in your pantry expiring in the next 3 days!</p>
            ${data.suggestedMeals ? `
              <p style="margin-bottom: 20px;">We've prepared some meal suggestions using these ingredients:</p>
              <ul style="margin-bottom: 20px; padding-left: 20px;">
                ${data.suggestedMeals.map((meal: string) => `<li>${meal}</li>`).join('')}
              </ul>
            ` : ''}
            <a href="${actionUrl || `${baseUrl}/dashboard/pantry`}" style="display: inline-block; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">View Pantry →</a>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            Happy cooking!<br>
            The MealWise Team
          </p>
          ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" style="display: none;" />` : ''}
        </body>
        </html>
      `,
    },
    "proactive-meal-suggestion": {
      subject: "Dinner suggestion for tonight 🍽️",
      html: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">What's for dinner? 🍽️</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Hi ${data.userName || 'there'},</p>
            <p style="margin-bottom: 20px;">We noticed you don't have a meal plan for tonight. Here's a suggestion:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #30cfd0;">
              <h2 style="margin: 0 0 10px 0; color: #330867;">${data.suggestedMeal || 'Delicious Meal'}</h2>
              <p style="margin: 0; color: #666;">${data.suggestedMealDescription || 'A perfect meal for tonight!'}</p>
            </div>
            <a href="${actionUrl || `${baseUrl}/chat`}" style="display: inline-block; background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Get Recipe →</a>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            Bon appétit!<br>
            The MealWise Team
          </p>
          ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" style="display: none;" />` : ''}
        </body>
        </html>
      `,
    },
    "meal-plan-completion": {
      subject: "Congratulations on completing your meal plan! 🎉",
      html: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">You did it! 🎉</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Hi ${data.userName || 'there'},</p>
            <p style="margin-bottom: 20px;">Congratulations! You've successfully completed your meal plan. That's amazing progress! 🎊</p>
            <p style="margin-bottom: 20px;">Ready for your next challenge?</p>
            <a href="${actionUrl || `${baseUrl}/chat`}" style="display: inline-block; background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Create New Meal Plan →</a>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            Keep up the great work!<br>
            The MealWise Team
          </p>
          ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" style="display: none;" />` : ''}
        </body>
        </html>
      `,
    },
    "weekly-digest": {
      subject: "Your weekly meal planning digest 📊",
      html: (data) => `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Your Weekly Summary 📊</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <p style="font-size: 18px; margin-bottom: 20px;">Hi ${data.userName || 'there'},</p>
            <p style="margin-bottom: 20px;">Here's what you accomplished this week:</p>
            <ul style="margin-bottom: 20px; padding-left: 20px;">
              <li>📅 Meal plans created: <strong>${data.mealPlansCreated || 0}</strong></li>
              <li>🍳 Recipes saved: <strong>${data.recipesSaved || 0}</strong></li>
              <li>📊 Goals progress: <strong>${data.goalsProgress || 'On track'}</strong></li>
            </ul>
            <a href="${actionUrl || `${baseUrl}/dashboard`}" style="display: inline-block; background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">View Dashboard →</a>
          </div>
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            See you next week!<br>
            The MealWise Team
          </p>
          ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" style="display: none;" />` : ''}
        </body>
        </html>
      `,
    },
  };

  const template = templates[type as keyof typeof templates];
  if (!template) {
    console.warn(`[sendEmailNotification] No email template for type: ${type}, using default`);
    // Fallback template
    await resend.emails.send({
      from: "MealWise <notifications@aimealwise.com>",
      to: email,
      subject: `Notification from MealWise`,
      html: `
        <h1>Hi ${data.userName || 'there'}!</h1>
        <p>${data.message || 'You have a new notification from MealWise.'}</p>
        ${actionUrl ? `<p><a href="${actionUrl}">View Details</a></p>` : ''}
        ${trackingPixelUrl ? `<img src="${trackingPixelUrl}" width="1" height="1" style="display: none;" />` : ''}
      `,
    });
    return;
  }

  await resend.emails.send({
    from: "MealWise <notifications@aimealwise.com>",
    to: email,
    subject: template.subject,
    html: template.html(data),
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
  const actionUrl = data.actionUrl;
  
  // TODO: Integrate with PushEngage API
  console.log(`[PushNotification] Sending ${type} to user ${userId}`, { actionUrl });
}

/**
 * Create in-app notification
 */
async function createInAppNotification(
  userId: string,
  type: string,
  data: Record<string, any>
): Promise<void> {
  try {
    const notificationTitles: Record<string, string> = {
      "meal-plan-reminder": "Time to plan your week! 🍽️",
      "pro-expiration-warning": "Your Pro subscription expires soon ⏰",
      "usage-limit-reset": "Your usage limits have been reset! 🎉",
      "pantry-expiration-alert": "Items in your pantry are expiring soon 🥗",
      "proactive-meal-suggestion": "Dinner suggestion for tonight 🍽️",
      "meal-plan-completion": "Congratulations on completing your meal plan! 🎉",
      "weekly-digest": "Your weekly meal planning digest 📊",
    };

    const notificationMessages: Record<string, string> = {
      "meal-plan-reminder": "It's time to plan your meals for the week. Let's create something delicious!",
      "pro-expiration-warning": `Your ${data.plan || 'Pro'} subscription expires in ${data.daysRemaining || 7} days. Renew now to keep enjoying all Pro features!`,
      "usage-limit-reset": "Great news! Your weekly usage limits have been reset. You can now create more meal plans and recipes!",
      "pantry-expiration-alert": `You have ${data.expiringCount || 0} items in your pantry expiring in the next 3 days!`,
      "proactive-meal-suggestion": `We noticed you don't have a meal plan for tonight. Here's a suggestion: ${data.suggestedMeal || 'Delicious Meal'}`,
      "meal-plan-completion": "Congratulations! You've successfully completed your meal plan. That's amazing progress!",
      "weekly-digest": `This week you created ${data.mealPlansCreated || 0} meal plans and saved ${data.recipesSaved || 0} recipes!`,
    };

    await (prisma as any).inAppNotification.create({
      data: {
        userId,
        type,
        title: notificationTitles[type] || "New Notification",
        message: notificationMessages[type] || "You have a new notification",
        actionUrl: data.actionUrl,
        actionLabel: data.actionLabel || "View",
        read: false,
      },
    });
  } catch (error) {
    // InAppNotification model might not exist yet
    console.warn('[createInAppNotification] Model not found, skipping in-app notification');
  }
}

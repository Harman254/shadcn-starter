import { inngest } from "@/lib/inngest/client";
import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications/sender";

/**
 * Weekly Meal Plan Reminder
 * Sends reminders every Sunday at 9 AM (user's timezone)
 */
export const weeklyMealPlanReminder = inngest.createFunction(
  {
    id: "weekly-meal-plan-reminder",
    name: "Weekly Meal Plan Reminder",
  },
  {
    cron: "0 9 * * 0", // Every Sunday at 9 AM UTC (adjust for user timezones)
  },
  async ({ event, step }) => {
    // Get all active users with email verified
    const users = await step.run("get-active-users", async () => {
      return await prisma.user.findMany({
        where: {
          emailVerified: true,
        },
        include: {
          Subscription: true,
        },
      });
    });

    // Process each user
    const results = await step.run("send-reminders", async () => {
      return Promise.allSettled(
        users.map(async (user) => {
          // Check if user has notification preferences
          const preferences = await prisma.notificationPreferences.findUnique({
            where: { userId: user.id },
          });

          // Skip if meal plan reminders disabled
          if (preferences && !preferences.mealPlanReminders) {
            return { userId: user.id, skipped: true, reason: "disabled" };
          }

          // Check last meal plan creation
          const lastMealPlan = await prisma.mealPlan.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
          });

          // Skip if created within last 7 days
          if (lastMealPlan) {
            const daysSinceLastPlan =
              (Date.now() - lastMealPlan.createdAt.getTime()) /
              (1000 * 60 * 60 * 24);
            if (daysSinceLastPlan < 7) {
              return {
                userId: user.id,
                skipped: true,
                reason: "recent_plan",
              };
            }
          }

          // Get user preferences for personalization
          const userPreferences = await prisma.onboardingData.findUnique({
            where: { userId: user.id },
          });

          // Send notification
          await sendNotification({
            userId: user.id,
            type: "meal-plan-reminder",
            channel: preferences?.emailEnabled ? "email" : "in-app",
            data: {
              userName: user.name,
              dietaryPreference: userPreferences?.dietaryPreference,
              goal: userPreferences?.goal,
              isPro: user.Subscription?.plan === "pro",
              lastPlanDate: lastMealPlan?.createdAt,
            },
          });

          return { userId: user.id, sent: true };
        })
      );
    });

    return {
      totalUsers: users.length,
      results: results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: r.reason }
      ),
    };
  }
);


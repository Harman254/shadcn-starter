import { inngest } from "@/lib/inngest/client";
import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications/sender";

/**
 * Incomplete Meal Plan Reminder
 * Reminds users about unsaved meal plans every 6 hours
 */
export const incompleteMealPlanReminder = inngest.createFunction(
  {
    id: "incomplete-meal-plan-reminder",
    name: "Incomplete Meal Plan Reminder",
  },
  {
    cron: "0 */6 * * *", // Every 6 hours
  },
  async ({ event, step }) => {
    // Get users who have chat sessions but no saved meal plans in last 24 hours
    const usersWithIncompletePlans = await step.run("get-users-with-incomplete-plans", async () => {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      // Get unique user IDs with recent chat sessions
      const recentChatSessions = await prisma.chatSession.findMany({
        where: {
          createdAt: {
            gte: oneDayAgo,
          },
        },
        select: {
          userId: true,
        },
        distinct: ['userId'],
      });

      // Get unique user IDs
      const userIds = [...new Set(recentChatSessions.map(s => s.userId))];

      // Fetch users with their subscriptions
      const users = await prisma.user.findMany({
        where: {
          id: {
            in: userIds,
          },
        },
        include: {
          Subscription: true,
        },
      });

      // Filter users who don't have saved meal plans
      const usersToNotify = [];
      for (const user of users) {
        const savedMealPlan = await prisma.mealPlan.findFirst({
          where: {
            userId: user.id,
            createdAt: {
              gte: oneDayAgo,
            },
          },
        });

        if (!savedMealPlan) {
          usersToNotify.push(user);
        }
      }

      return usersToNotify;
    });

    // Send notifications
    const results = await step.run("send-reminders", async () => {
      return Promise.allSettled(
        usersWithIncompletePlans.map(async (user) => {
          // Check preferences
          let preferences = null;
          try {
            preferences = await (prisma as any).notificationPreferences.findUnique({
              where: { userId: user.id },
            });
          } catch (error) {
            // Model doesn't exist - continue
          }

          if (preferences && !preferences.mealPlanReminders) {
            return { userId: user.id, skipped: true, reason: "disabled" };
          }

          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

          await sendNotification({
            userId: user.id,
            type: "meal-plan-reminder",
            channel: preferences?.emailEnabled ? "email" : "in-app",
            actionUrl: `${baseUrl}/chat`,
            data: {
              userName: user.name,
              isPro: user.Subscription?.plan === "pro",
              isIncomplete: true,
            },
          });

          return { userId: user.id, sent: true };
        })
      );
    });

    return {
      totalUsers: usersWithIncompletePlans.length,
      results: results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: r.reason }
      ),
    };
  }
);

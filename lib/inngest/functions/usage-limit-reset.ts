import { inngest } from "@/lib/inngest/client";
import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications/sender";

/**
 * Usage Limit Reset Notification
 * Sends notifications when free tier limits reset (every Monday)
 */
export const usageLimitResetNotification = inngest.createFunction(
  {
    id: "usage-limit-reset-notification",
    name: "Usage Limit Reset Notification",
  },
  {
    cron: "0 9 * * 1", // Every Monday at 9 AM UTC
  },
  async ({ event, step }) => {
    // Get all free tier users
    const freeUsers = await step.run("get-free-users", async () => {
      return await prisma.user.findMany({
        where: {
          emailVerified: true,
          Subscription: {
            none: {
              status: "active",
            },
          },
        },
        include: {
          Subscription: true,
        },
      });
    });

    // Send notifications
    const results = await step.run("send-notifications", async () => {
      return Promise.allSettled(
        freeUsers.map(async (user) => {
          // Check notification preferences
          let preferences = null;
          try {
            preferences = await (prisma as any).notificationPreferences.findUnique({
              where: { userId: user.id },
            });
          } catch (error) {
            // Model doesn't exist - continue
          }

          // Skip if disabled
          if (preferences && !preferences.weeklyDigest) {
            return { userId: user.id, skipped: true, reason: "disabled" };
          }

          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

          await sendNotification({
            userId: user.id,
            type: "usage-limit-reset",
            channel: preferences?.emailEnabled ? "email" : "in-app",
            actionUrl: `${baseUrl}/chat`,
            data: {
              userName: user.name,
              isPro: false,
            },
          });

          return { userId: user.id, sent: true };
        })
      );
    });

    return {
      totalUsers: freeUsers.length,
      results: results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: r.reason }
      ),
    };
  }
);

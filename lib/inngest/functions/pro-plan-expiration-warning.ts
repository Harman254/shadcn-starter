import { inngest } from "@/lib/inngest/client";
import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications/sender";

/**
 * Pro Plan Expiration Warning
 * Sends warnings 7 days before subscription expires
 */
export const proPlanExpirationWarning = inngest.createFunction(
  {
    id: "pro-plan-expiration-warning",
    name: "Pro Plan Expiration Warning",
  },
  {
    cron: "0 10 * * *", // Daily at 10 AM UTC
  },
  async ({ event, step }) => {
    // Get subscriptions expiring in 7 days
    const expiringSubscriptions = await step.run(
      "get-expiring-subscriptions",
      async () => {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

        return await prisma.subscription.findMany({
          where: {
            plan: { in: ["pro", "enterprise"] },
            status: "active",
            currentPeriodEnd: {
              lte: sevenDaysFromNow,
              gte: new Date(),
            },
          },
          include: {
            user: true,
          },
        });
      }
    );

    // Send warnings
    const results = await step.run("send-warnings", async () => {
      return Promise.allSettled(
        expiringSubscriptions.map(async (subscription) => {
          const daysRemaining = Math.ceil(
            (subscription.currentPeriodEnd.getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          );

          // Check if already notified recently (within 3 days)
          const recentNotification = await prisma.notificationLog.findFirst({
            where: {
              userId: subscription.userID,
              type: "pro-expiration-warning",
              createdAt: {
                gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
              },
            },
          });

          if (recentNotification) {
            return {
              userId: subscription.userID,
              skipped: true,
              reason: "recently_notified",
            };
          }

          await sendNotification({
            userId: subscription.userID,
            type: "pro-expiration-warning",
            channel: "email", // High priority - use email
            data: {
              userName: subscription.user.name,
              daysRemaining,
              plan: subscription.plan,
              expirationDate: subscription.currentPeriodEnd,
            },
          });

          return { userId: subscription.userID, sent: true };
        })
      );
    });

    return {
      totalExpiring: expiringSubscriptions.length,
      results: results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: r.reason }
      ),
    };
  }
);


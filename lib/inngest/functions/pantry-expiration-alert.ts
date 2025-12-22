import { inngest } from "@/lib/inngest/client";
import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications/sender";

/**
 * Pantry Expiration Alert
 * Sends alerts for items expiring within 3 days
 */
export const pantryExpirationAlert = inngest.createFunction(
  {
    id: "pantry-expiration-alert",
    name: "Pantry Expiration Alert",
  },
  {
    cron: "0 8 * * *", // Daily at 8 AM UTC
  },
  async ({ event, step }) => {
    // Get users with items expiring in 3 days
    const usersWithExpiringItems = await step.run("get-users-with-expiring-items", async () => {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get all pantry items expiring in next 3 days
      const expiringItems = await prisma.pantryItem.findMany({
        where: {
          expirationDate: {
            gte: today,
            lte: threeDaysFromNow,
          },
        },
        include: {
          user: {
            include: {
              Subscription: true,
            },
          },
        },
      });

      // Group by user
      const userMap = new Map<string, typeof expiringItems>();
      expiringItems.forEach((item) => {
        if (!userMap.has(item.userId)) {
          userMap.set(item.userId, []);
        }
        userMap.get(item.userId)!.push(item);
      });

      return Array.from(userMap.entries()).map(([userId, items]) => ({
        user: items[0].user,
        expiringItems: items,
        expiringCount: items.length,
      }));
    });

    // Send notifications with meal suggestions
    const results = await step.run("send-alerts", async () => {
      return Promise.allSettled(
        usersWithExpiringItems.map(async ({ user, expiringItems, expiringCount }) => {
          // Check preferences
          let preferences = null;
          try {
            preferences = await (prisma as any).notificationPreferences.findUnique({
              where: { userId: user.id },
            });
          } catch (error) {
            // Model doesn't exist - continue
          }

          if (preferences && !preferences.pantryAlerts) {
            return { userId: user.id, skipped: true, reason: "disabled" };
          }

          // Generate meal suggestions using expiring items
          const itemNames = expiringItems.map((item) => item.name).join(', ');
          const suggestedMeals = [
            `Quick recipe using ${expiringItems[0]?.name || 'your expiring items'}`,
            `Delicious meal with ${itemNames}`,
          ];

          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

          await sendNotification({
            userId: user.id,
            type: "pantry-expiration-alert",
            channel: preferences?.emailEnabled ? "email" : "in-app",
            actionUrl: `${baseUrl}/dashboard/pantry`,
            data: {
              userName: user.name,
              expiringCount,
              expiringItems: expiringItems.map((item) => ({
                name: item.name,
                expirationDate: item.expirationDate,
              })),
              suggestedMeals,
            },
          });

          return { userId: user.id, sent: true, expiringCount };
        })
      );
    });

    return {
      totalUsers: usersWithExpiringItems.length,
      results: results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: r.reason }
      ),
    };
  }
);

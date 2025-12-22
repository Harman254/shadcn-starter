import { inngest } from "@/lib/inngest/client";
import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications/sender";

/**
 * Weekly Digest Email
 * Sends weekly summary every Sunday
 */
export const weeklyDigestEmail = inngest.createFunction(
  {
    id: "weekly-digest-email",
    name: "Weekly Digest Email",
  },
  {
    cron: "0 10 * * 0", // Every Sunday at 10 AM UTC
  },
  async ({ event, step }) => {
    // Get all active users
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
    const results = await step.run("send-digests", async () => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      return Promise.allSettled(
        users.map(async (user) => {
          // Check preferences
          let preferences = null;
          try {
            preferences = await (prisma as any).notificationPreferences.findUnique({
              where: { userId: user.id },
            });
          } catch (error) {
            // Model doesn't exist - continue
          }

          if (preferences && !preferences.weeklyDigest) {
            return { userId: user.id, skipped: true, reason: "disabled" };
          }

          // Get user's weekly stats
          const mealPlansCreated = await prisma.mealPlan.count({
            where: {
              userId: user.id,
              createdAt: {
                gte: oneWeekAgo,
              },
            },
          });

          const recipesSaved = await prisma.recipe.count({
            where: {
              userId: user.id,
              createdAt: {
                gte: oneWeekAgo,
              },
            },
          });

          // Only send if user had activity
          if (mealPlansCreated === 0 && recipesSaved === 0) {
            return { userId: user.id, skipped: true, reason: "no_activity" };
          }

          // Get goals progress
          const userPreferences = await prisma.onboardingData.findUnique({
            where: { userId: user.id },
          });

          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

          await sendNotification({
            userId: user.id,
            type: "weekly-digest",
            channel: preferences?.emailEnabled ? "email" : "in-app",
            actionUrl: `${baseUrl}/dashboard`,
            data: {
              userName: user.name,
              mealPlansCreated,
              recipesSaved,
              goalsProgress: userPreferences?.goal || "On track",
              isPro: user.Subscription?.plan === "pro",
            },
          });

          return { userId: user.id, sent: true, mealPlansCreated, recipesSaved };
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

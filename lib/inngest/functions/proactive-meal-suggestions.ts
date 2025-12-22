import { inngest } from "@/lib/inngest/client";
import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications/sender";

/**
 * Proactive Meal Suggestions
 * Sends dinner suggestions at 6 PM for users without plans
 */
export const proactiveMealSuggestions = inngest.createFunction(
  {
    id: "proactive-meal-suggestions",
    name: "Proactive Meal Suggestions",
  },
  {
    cron: "0 18 * * *", // Daily at 6 PM UTC
  },
  async ({ event, step }) => {
    // Get users without meal plans for today
    const usersWithoutPlans = await step.run("get-users-without-plans", async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Get all active users
      const allUsers = await prisma.user.findMany({
        where: {
          emailVerified: true,
        },
        include: {
          Subscription: true,
          MealPlan: {
            where: {
              createdAt: {
                gte: today,
                lt: tomorrow,
              },
            },
          },
        },
      });

      // Filter users without meal plans today
      return allUsers.filter((user) => user.MealPlan.length === 0);
    });

    // Send suggestions
    const results = await step.run("send-suggestions", async () => {
      return Promise.allSettled(
        usersWithoutPlans.map(async (user) => {
          // Check preferences
          let preferences = null;
          try {
            preferences = await (prisma as any).notificationPreferences.findUnique({
              where: { userId: user.id },
            });
          } catch (error) {
            // Model doesn't exist - continue
          }

          if (preferences && !preferences.proactiveSuggestions) {
            return { userId: user.id, skipped: true, reason: "disabled" };
          }

          // Get user preferences for personalized suggestions
          const userPreferences = await prisma.onboardingData.findUnique({
            where: { userId: user.id },
          });

          // Generate personalized meal suggestion
          const mealSuggestions = [
            "Grilled Salmon with Quinoa and Roasted Vegetables",
            "Mediterranean Bowl with Chickpeas and Feta",
            "Thai Curry with Jasmine Rice",
            "Italian Pasta Primavera",
            "Mexican Quinoa Stuffed Peppers",
          ];

          const suggestedMeal = mealSuggestions[Math.floor(Math.random() * mealSuggestions.length)];
          const suggestedMealDescription = `A delicious ${userPreferences?.dietaryPreference || 'balanced'} meal perfect for tonight!`;

          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

          await sendNotification({
            userId: user.id,
            type: "proactive-meal-suggestion",
            channel: preferences?.emailEnabled ? "email" : "in-app",
            actionUrl: `${baseUrl}/chat?prompt=${encodeURIComponent(`Create a recipe for ${suggestedMeal}`)}`,
            data: {
              userName: user.name,
              suggestedMeal,
              suggestedMealDescription,
              dietaryPreference: userPreferences?.dietaryPreference,
            },
          });

          return { userId: user.id, sent: true, suggestedMeal };
        })
      );
    });

    return {
      totalUsers: usersWithoutPlans.length,
      results: results.map((r) =>
        r.status === "fulfilled" ? r.value : { error: r.reason }
      ),
    };
  }
);

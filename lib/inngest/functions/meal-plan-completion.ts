import { inngest } from "@/lib/inngest/client";
import prisma from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications/sender";
import { trackConversionEvent } from "@/lib/notifications/tracking";

/**
 * Meal Plan Completion Celebration
 * Triggered when user completes a meal plan
 */
export const mealPlanCompletionCelebration = inngest.createFunction(
  {
    id: "meal-plan-completion-celebration",
    name: "Meal Plan Completion Celebration",
  },
  {
    event: "meal-plan.completed",
  },
  async ({ event, step }) => {
    const { userId, mealPlanId } = event.data;

    // Get user and meal plan details
    const userData = await step.run("get-user-data", async () => {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          Subscription: true,
        },
      });

      const mealPlan = await prisma.mealPlan.findUnique({
        where: { id: mealPlanId },
      });

      return { user, mealPlan };
    });

    if (!userData.user || !userData.mealPlan) {
      return { error: "User or meal plan not found" };
    }

    // Check preferences
    let preferences = null;
    try {
      preferences = await (prisma as any).notificationPreferences.findUnique({
        where: { userId },
      });
    } catch (error) {
      // Model doesn't exist - continue
    }

    if (preferences && !preferences.completionCelebrations) {
      return { skipped: true, reason: "disabled" };
    }

    // Send celebration notification
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    await step.run("send-celebration", async () => {
      await sendNotification({
        userId,
        type: "meal-plan-completion",
        channel: preferences?.emailEnabled ? "email" : "in-app",
        actionUrl: `${baseUrl}/dashboard/meal-plans/${mealPlanId}`,
        data: {
          userName: userData.user!.name,
          mealPlanName: userData.mealPlan!.title || "Your Meal Plan",
          mealPlanId,
        },
      });

      // Track conversion event
      await trackConversionEvent(
        {
          userId,
          notificationId: "completion-celebration",
          type: "meal-plan-completion",
          channel: preferences?.emailEnabled ? "email" : "in-app",
        },
        "meal_plan_created",
        {
          mealPlanId,
          completed: true,
        }
      );
    });

    return {
      userId,
      mealPlanId,
      sent: true,
    };
  }
);

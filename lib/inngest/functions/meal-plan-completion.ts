import { inngest } from "@/lib/inngest/client";
import { sendNotification } from "@/lib/notifications/sender";

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
    // TODO: Implement completion celebrations
    const { userId, mealPlanId } = event.data;
    return { message: "Not yet implemented" };
  }
);


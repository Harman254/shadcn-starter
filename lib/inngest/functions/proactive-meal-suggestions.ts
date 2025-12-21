import { inngest } from "@/lib/inngest/client";
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
    // TODO: Implement proactive meal suggestions
    return { message: "Not yet implemented" };
  }
);


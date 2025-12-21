import { inngest } from "@/lib/inngest/client";
import { sendNotification } from "@/lib/notifications/sender";

/**
 * Incomplete Meal Plan Reminder
 * Reminds users about unsaved meal plans
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
    // TODO: Implement incomplete meal plan reminders
    return { message: "Not yet implemented" };
  }
);


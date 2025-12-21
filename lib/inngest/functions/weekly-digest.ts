import { inngest } from "@/lib/inngest/client";
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
    // TODO: Implement weekly digest
    return { message: "Not yet implemented" };
  }
);


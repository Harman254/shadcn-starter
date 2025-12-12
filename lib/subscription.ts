
import { getSubscriptionByUserId } from "@/data";

export async function checkUserProStatus(userId: string): Promise<boolean> {
    if (!userId) return false;

    try {
        const subscription = await getSubscriptionByUserId(userId);

        // Check if plan is active and is "pro" (or "enterprise" if that exists later)
        if (subscription &&
            (subscription.status === 'active' || subscription.status === 'trialing') &&
            (subscription.plan === 'pro' || subscription.plan === 'Mealwise-Pro')) {
            return true;
        }

        return false;
    } catch (error) {
        console.error("Error checking pro status:", error);
        return false;
    }
}

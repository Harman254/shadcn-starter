'use server';

import { generateUserInsights } from "@/lib/analytics";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function refreshAiInsights() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        const result = await generateUserInsights(session.user.id);
        revalidatePath("/dashboard/analytics");
        return { success: true, data: result };
    } catch (error) {
        console.error("Failed to generate insights:", error);
        return { success: false, error: "Failed to analyze data" };
    }
}

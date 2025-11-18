// app/actions/saveOnboardingData.ts
"use server";

import { getDBSession } from "@/data";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function saveOnboardingData(formData: {
  dietaryPreference: string;
  goal: string;
  householdSize: number;
  cuisinePreferences: string[];
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id || typeof session.user.id !== "string") {
    redirect("/sign-in");
  }
  
  const userId = session.user.id;

  const { dietaryPreference, goal, householdSize, cuisinePreferences } = formData;

  await prisma.onboardingData.upsert({
    where: { userId },
    update: {
      dietaryPreference,
      goal,
      householdSize,
      cuisinePreferences,
      // Clear cached summary when preferences change - will be regenerated on next chat load
      preferencesSummary: null,
      preferencesHash: null,
    },
    create: {
      userId,
      dietaryPreference,
      goal,
      householdSize,
      cuisinePreferences,
      // No summary yet - will be generated on first chat load
      preferencesSummary: null,
      preferencesHash: null,
    },
  });

  await prisma.account.updateMany({
    where: {
      userId,
    },
    data: {
      isOnboardingComplete: true,
    },
  });



  revalidatePath('/preferences'); 
  revalidatePath('/chat'); // Revalidate the chat page to reflect the new data
  // Revalidate the chat page to reflect the new data
  redirect('/chat'); // Redirect to chat page after saving onboarding data
  
  
  // Revalidate the onboarding page to reflect the new data
}

// app/actions/saveOnboardingData.ts
"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
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
    },
    create: {
      userId,
      dietaryPreference,
      goal,
      householdSize,
      cuisinePreferences,
    },
  });
}

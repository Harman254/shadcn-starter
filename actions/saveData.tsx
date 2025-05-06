// app/actions/saveOnboardingData.ts
"use server";

import { auth, clerkClient } from '@clerk/nextjs/server'
import  prisma  from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function saveOnboardingData(formData: any) {

const { userId } = await auth();


  if (!userId) throw new Error("Unauthorized");

  const { dietaryPreference, goal, householdSize, cuisinePreferences } = formData;
  await prisma.onboardingData.upsert({
    where: { userId }, // assumes userId is a unique field
    update: {
      dietaryPreference,
      goal,
      householdSize,
      cuisinePreferences, // assuming string[]
    },
    create: {
      userId,
      dietaryPreference,
      goal,
      householdSize,
      cuisinePreferences,
    },
  });



  const client = await clerkClient()
  
    const res = await client.users.updateUser(userId, {
      publicMetadata: {
        onboardingComplete: true,
        applicationName: 'Mealwise',
        applicationType: 'Ai assistant for meal planning',
      },
    })



    
}














// 'use server'

// import { prisma } from "@/lib/prisma";
// import { auth, clerkClient } from '@clerk/nextjs/server';

// export const saveOnboarding = async (formData: any) => {
//   const { dietaryPreference, goal, householdSize, cuisinePreferences } = formData;
//   const { userId } = await auth();

//   if (!userId) {
//     return { success: false, message: 'No Logged In User' };
//   }

//   try {
//     const saved = await prisma.onboardingData.create({
//       data: {
//         userId,
//         dietaryPreference,
//         goal,
//         householdSize,
//         cuisinePreferences, // must be JSON-compatible
//       },
//     });

//     if (saved) {
//       await clerkClient.users.updateUser(userId, {
//         publicMetadata: {
//           onboardingComplete: true,
//           applicationName: 'Mealwise',
//           applicationType: 'Ai assistant for meal planning',
//         },
//       });

//       return {
//         success: true,
//         message: 'Onboarding data and metadata saved successfully',
//       };
//     }

//     return { success: false, message: 'Failed to save onboarding data' };

//   } catch (error: any) {
//     console.error("[SAVE_ONBOARDING_ERROR]", error);
//     return { success: false, message: error.message || 'Internal error' };
//   }
// };

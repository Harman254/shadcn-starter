'use server'

import { prisma } from "@/lib/prisma"



export const saveOnboarding = async (formData: any) => {
    const { dietaryPreference, goal, householdSize, cuisinePreferences } = formData;
try {
    await prisma.onboardingData.create({
        data: {
          dietaryPreference,
          goal,
          householdSize,
          cuisinePreferences, // this works with Json type
        },
      });
  
      return { success: true };
       
} catch (error) {
    console.log(error)
    
}

}
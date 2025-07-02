import CreateMealPlan from '@/components/create-meal-plan'
import { fetchOnboardingData, getAccount } from '@/data'
import { auth } from '@/lib/auth'
import { UserPreference } from '@/types'
import { headers } from 'next/headers'
import React from 'react'




const MealNew = async () => {

    const user = await auth.api.getSession({
        headers: await headers()
    })

    let isOnboardComplete = false;
    let preferences: UserPreference[] = [];
    if (user?.user?.id) {
      const checkOnboard = await getAccount(user.user.id);
      isOnboardComplete = !!checkOnboard?.isOnboardingComplete;
      try {
        preferences = await fetchOnboardingData(user.user.id);
      } catch (e) {
        preferences = [];
      }
    }
    return <CreateMealPlan isOnboardComplete={isOnboardComplete} preferences={preferences} />
}

export default MealNew 
import CreateMealPlan from '@/components/create-meal-plan'
import { fetchOnboardingData, getAccount, getDBSession } from '@/data'
import { auth } from '@/lib/auth'
import { UserPreference } from '@/types'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'


const MealNew = async () => {
  const session = await auth.api.getSession({
    headers: await headers() // you need to pass the headers object.
})

  const userId = session?.user?.id

  if (!userId) redirect('/sign-in');
  
  const preferences: UserPreference[]= await fetchOnboardingData(userId)

  const checkOnboard = await getAccount(userId)
  const isOnboarded = checkOnboard?.isOnboardingComplete

  if (!isOnboarded) {
    redirect('/onboarding')
  }



  if (preferences) {
    return (
        <CreateMealPlan preferences={preferences}/>
    )
  }


}

export default MealNew
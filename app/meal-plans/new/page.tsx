import CreateMealPlan from '@/components/create-meal-plan'
import { fetchOnboardingData } from '@/data'
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


  if (preferences) {
    return (
      <div>
        <CreateMealPlan preferences={preferences}/>
      </div>
    )
  }


}

export default MealNew
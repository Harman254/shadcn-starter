import CreateMealPlan from '@/components/create-meal-plan'
import { fetchOnboardingData } from '@/data'
import { UserPreference } from '@/types'
import { redirect } from 'next/navigation'
import React from 'react'
import { auth, currentUser } from '@clerk/nextjs/server'


const MealNew = async () => {
  const { userId } =await auth();


  if (!userId) redirect('/sign-in');
  
  const preferences: UserPreference[]= await fetchOnboardingData(userId)

  console.log(preferences)

  if (preferences) {
    return (
      <div>
        <CreateMealPlan preferences={preferences}/>
      </div>
    )
  }


}

export default MealNew
import CreateMealPlan, { UserPreference } from '@/components/create-meal-plan'
import { fetchOnboardingData } from '@/data'
import { OnboardingData } from '@prisma/client'
import React from 'react'

const MealNew = async () => {
  const preferences: UserPreference[]= await fetchOnboardingData()
  console.log(preferences)

  return (
    <div>
      <CreateMealPlan preferences={preferences}/>
      
    </div>
  )
}

export default MealNew

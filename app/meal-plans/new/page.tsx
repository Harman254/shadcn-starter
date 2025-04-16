import CreateMealPlan from '@/components/create-meal-plan'
import { fetchOnboardingData } from '@/data'
import { UserPreference } from '@/types'
import React from 'react'

const MealNew = async () => {
  const preferences: UserPreference[]= await fetchOnboardingData()

  if (preferences) {
    return (
      <div>
        <CreateMealPlan preferences={preferences}/>
      </div>
    )
  }


}

export default MealNew
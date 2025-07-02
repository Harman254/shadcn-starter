import CreateMealPlan from '@/components/create-meal-plan'
import { fetchOnboardingData } from '@/data'
import { UserPreference } from '@/types'
import React from 'react'

const MealNew = async () => {
  let preferences: UserPreference[] = []
  try {
    // Try to fetch preferences if user is logged in
    const userId = null // Replace with logic to get userId from session if available
    if (userId) {
      preferences = await fetchOnboardingData(userId)
    }
  } catch (e) {
    // Not logged in or error fetching preferences, use empty
    preferences = []
  }
  return <CreateMealPlan preferences={preferences} />
}

export default MealNew 
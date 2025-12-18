import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserProfile {
  user: any
  subscription: any
  mealStats: {
    totalPlans: number
    totalMeals: number
    averageRating: number
    streakDays: number
    caloriesGoal: number
    currentCalories: number
    nutritionScore: number
    favoriteRecipes: number
  }
  timestamp: number
}

interface ProfileStore {
  profile: UserProfile | null
  
  setProfile: (user: any, subscription: any, mealStats: any) => void
  getProfile: () => UserProfile | null
  clearProfile: () => void
  isProfileValid: (maxAge?: number) => boolean
}

const PROFILE_CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      profile: null,

      setProfile: (user, subscription, mealStats) => {
        set({
          profile: {
            user,
            subscription,
            mealStats,
            timestamp: Date.now(),
          },
        })
      },

      getProfile: () => {
        const cached = get().profile
        if (!cached) return null
        
        if (!get().isProfileValid()) {
          get().clearProfile()
          return null
        }
        
        return cached
      },

      clearProfile: () => {
        set({ profile: null })
      },

      isProfileValid: (maxAge = PROFILE_CACHE_DURATION) => {
        const cached = get().profile
        if (!cached) return false
        return Date.now() - cached.timestamp < maxAge
      },
    }),
    {
      name: 'profile-store',
      partialize: (state) => ({
        profile: state.profile,
      }),
    }
  )
)


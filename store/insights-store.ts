import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { FeedItem } from '@/lib/data/feed-data'

interface StoryDetail {
  id: string
  title: string
  description: string
  content: string
  imageUrl?: string
}

interface CachedStory {
  data: StoryDetail
  timestamp: number
}

interface InsightsStore {
  // Story details cache
  storyDetails: Record<string, CachedStory>
  
  // AI stories cache
  aiStories: {
    stories: FeedItem[]
    timestamp: number
    category: string
  } | null
  
  // Actions
  setStoryDetail: (storyId: string, data: StoryDetail) => void
  getStoryDetail: (storyId: string) => StoryDetail | null
  clearStoryDetail: (storyId: string) => void
  clearAllStoryDetails: () => void
  
  setAiStories: (stories: FeedItem[], category: string) => void
  getAiStories: (category: string) => FeedItem[] | null
  clearAiStories: () => void
  
  // Cache validation
  isStoryDetailValid: (storyId: string, maxAge?: number) => boolean
  isAiStoriesValid: (category: string, maxAge?: number) => boolean
}

const STORY_DETAIL_CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
const AI_STORIES_CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export const useInsightsStore = create<InsightsStore>()(
  persist(
    (set, get) => ({
      storyDetails: {},
      aiStories: null,

      setStoryDetail: (storyId, data) => {
        set((state) => ({
          storyDetails: {
            ...state.storyDetails,
            [storyId]: {
              data,
              timestamp: Date.now(),
            },
          },
        }))
      },

      getStoryDetail: (storyId) => {
        const cached = get().storyDetails[storyId]
        if (!cached) return null
        
        // Check if cache is still valid
        if (!get().isStoryDetailValid(storyId)) {
          get().clearStoryDetail(storyId)
          return null
        }
        
        return cached.data
      },

      clearStoryDetail: (storyId) => {
        set((state) => {
          const { [storyId]: _, ...rest } = state.storyDetails
          return { storyDetails: rest }
        })
      },

      clearAllStoryDetails: () => {
        set({ storyDetails: {} })
      },

      setAiStories: (stories, category) => {
        set({
          aiStories: {
            stories: stories as FeedItem[],
            timestamp: Date.now(),
            category,
          },
        })
      },

      getAiStories: (category) => {
        const cached = get().aiStories
        if (!cached || cached.category !== category) return null
        
        // Check if cache is still valid
        if (!get().isAiStoriesValid(category)) {
          get().clearAiStories()
          return null
        }
        
        return cached.stories as FeedItem[]
      },

      clearAiStories: () => {
        set({ aiStories: null })
      },

      isStoryDetailValid: (storyId, maxAge = STORY_DETAIL_CACHE_DURATION) => {
        const cached = get().storyDetails[storyId]
        if (!cached) return false
        return Date.now() - cached.timestamp < maxAge
      },

      isAiStoriesValid: (category, maxAge = AI_STORIES_CACHE_DURATION) => {
        const cached = get().aiStories
        if (!cached || cached.category !== category) return false
        return Date.now() - cached.timestamp < maxAge
      },
    }),
    {
      name: 'insights-store',
      partialize: (state) => ({
        storyDetails: state.storyDetails,
        aiStories: state.aiStories,
      }),
    }
  )
)


import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'
import { generateObject } from 'ai'
import { google } from '@ai-sdk/google'
import { z } from 'zod'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Cache for 1 hour (stories are personalized, but don't need to regenerate too often)

// Fallback images pool for unique assignment
const FALLBACK_IMAGES = [
  'https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-4.jpg',
  'https://res.cloudinary.com/dcidanigq/image/upload/v1742112004/cld-sample-5.jpg',
  '/feed-images/salmon-bowl.png',
  '/feed-images/pasta.png',
  '/feed-images/smoothie.png',
  '/feed-images/salad.png',
  '/feed-images/curry.png',
  '/feed-images/soup.png',
  '/feed-images/stir-fry.png',
  '/feed-images/dessert.png',
  '/feed-images/breakfast.png',
]

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch user's recent meals and preferences
    const [recentMeals, onboardingData] = await Promise.all([
      prisma.meal.findMany({
        where: {
          dayMeal: {
            mealPlan: {
              userId: session.user.id,
            },
          },
        },
        orderBy: {
          dayMeal: {
            date: 'desc',
          },
        },
        take: 20,
        include: {
          dayMeal: {
            include: {
              mealPlan: true,
            },
          },
        },
      }),
      prisma.onboardingData.findUnique({
        where: { userId: session.user.id },
      }),
    ])

    // Generate personalized meal stories using AI
    const result = await generateObject({
      model: google('gemini-2.0-flash'),
      temperature: 0.8,
      schema: z.object({
        stories: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            imagePrompt: z.string().describe('Detailed prompt for generating an image of this meal story'),
            category: z.enum(['for-you', 'trending', 'quick-meals', 'healthy', 'seasonal', 'budget']),
            tags: z.array(z.string()),
            metadata: z.object({
              prepTime: z.string().optional(),
              calories: z.number().optional(),
              cuisine: z.string().optional(),
              servings: z.number().optional(),
              difficulty: z.enum(['Easy', 'Medium', 'Hard']).optional(),
            }),
          })
        ),
      }),
      prompt: `Generate 6 personalized meal stories/insights based on the user's meal history and preferences.

USER'S RECENT MEALS:
${recentMeals.slice(0, 10).map(m => `- ${m.name} (${m.calories || 0} cal)`).join('\n')}

USER PREFERENCES:
- Dietary: ${onboardingData?.dietaryPreference || 'Not specified'}
- Cuisines: ${onboardingData?.cuisinePreferences?.join(', ') || 'Not specified'}
- Goal: ${onboardingData?.goal || 'Not specified'}

Generate diverse, engaging meal stories that:
1. Relate to their meal history and preferences
2. Provide insights and tips
3. Include varied categories (for-you, trending, quick-meals, healthy, seasonal, budget)
4. Have detailed image prompts for AI generation
5. Include relevant tags and metadata

Each story should be unique and valuable.`,
    })

    if (!result.object?.stories) {
      return NextResponse.json({ stories: [] })
    }

    // Assign unique fallback images to each story
    const storiesWithImages = result.object.stories.map((story, index) => ({
      ...story,
      id: `ai-story-${Date.now()}-${index}`,
      imageUrl: FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
      author: {
        name: 'AI Assistant',
      },
      createdAt: new Date().toISOString(),
    }))

    return NextResponse.json({ stories: storiesWithImages })
  } catch (error) {
    console.error('[Insights Stories] Error:', error)
    return NextResponse.json({ stories: [] }, { status: 500 })
  }
}


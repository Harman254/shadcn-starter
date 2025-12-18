import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

export const dynamic = 'force-dynamic'
export const revalidate = 1800 // Cache story details for 30 minutes

// Fallback images pool (same as stories route)
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const title = searchParams.get('title')
    const description = searchParams.get('description')

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    // Determine image URL based on story ID
    // For AI stories, use the same fallback image logic
    let imageUrl = FALLBACK_IMAGES[0]; // Default fallback
    if (id.startsWith('ai-story-')) {
      // Extract index from ID if possible, or use hash of ID
      const indexMatch = id.match(/-(\d+)$/);
      const index = indexMatch ? parseInt(indexMatch[1]) : id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      imageUrl = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
    }

    // Generate detailed content for the story
    const result = await generateText({
      model: google('gemini-2.0-flash'),
      temperature: 0.7,
      prompt: `Write a detailed, engaging article about this meal insight:

Title: ${title}
Description: ${description}

Provide:
1. An engaging introduction
2. Detailed insights and tips
3. Practical advice
4. Nutritional information if relevant
5. A conclusion with actionable takeaways

Format the response in markdown with proper headings, lists, and paragraphs.`,
    })

    return NextResponse.json({
      id,
      title,
      description,
      content: result.text,
      imageUrl, // Include image URL in response
    })
  } catch (error) {
    console.error('[Story Detail] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate story details' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { generateText } from 'ai'
import { google } from '@ai-sdk/google'

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
    })
  } catch (error) {
    console.error('[Story Detail] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate story details' },
      { status: 500 }
    )
  }
}


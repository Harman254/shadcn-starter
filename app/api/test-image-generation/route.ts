import { NextRequest, NextResponse } from 'next/server'
import { generateGeminiImage } from '@/lib/services/gemini-image-generator'

// Ensure this route runs in the Node.js runtime
export const runtime = 'nodejs'

// Increase max duration for image generation (takes ~40 seconds)
export const maxDuration = 60 // 60 seconds to handle ~40s generation time

// Image generation model to test (exact name from Google AI Studio)
// User can override via env: TEST_IMAGE_MODEL="gemini-2.5-flash-image"
const TEST_IMAGE_MODEL = process.env.TEST_IMAGE_MODEL || 'gemini-2.5-flash-image'

export async function GET(request: NextRequest) {
  const startedAt = Date.now()

  // Get test prompt from query params or use default
  const searchParams = request.nextUrl.searchParams
  const testPrompt = searchParams.get('prompt') || 
    'Professional food photography of a healthy Mediterranean bowl with quinoa, roasted vegetables, and feta cheese. High quality, appetizing, well-lit, restaurant style, food blog quality, realistic ingredients, proper plating, natural lighting, shallow depth of field.'

  try {
    const result = await generateGeminiImage({
      prompt: testPrompt,
      model: TEST_IMAGE_MODEL,
    })

    const imageSizeKB = Math.round(
      result.imageUrl.split(',')[1]?.length 
        ? Buffer.from(result.imageUrl.split(',')[1], 'base64').length / 1024 
        : 0
    )

    return NextResponse.json({
      ok: true,
      model: result.model,
      latencyMs: result.latencyMs,
      imageSizeKB,
      imageUrl: result.imageUrl,
      mimeType: result.mimeType,
      prompt: testPrompt,
      message: `✅ Image generation successful with ${result.model}!`,
      metadata: {
        format: result.mimeType,
        hasImage: true,
      },
    })
  } catch (error: unknown) {
    const elapsedMs = Date.now() - startedAt
    const errorMessage = error instanceof Error ? error.message : String(error)

    return NextResponse.json(
      {
        ok: false,
        latencyMs: elapsedMs,
        error: errorMessage,
        prompt: testPrompt,
        suggestion: 'Check that gemini-2.5-flash-image is available in your Google AI Studio account and API key has image generation permissions.',
      },
      { status: 500 },
    )
  }
}

// POST endpoint for custom prompts
export async function POST(request: NextRequest) {
  const startedAt = Date.now()

  try {
    const { prompt } = await request.json()

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required in request body' },
        { status: 400 },
      )
    }

    try {
      const result = await generateGeminiImage({
        prompt: prompt,
        model: TEST_IMAGE_MODEL,
      })

      const imageSizeKB = Math.round(
        result.imageUrl.split(',')[1]?.length 
          ? Buffer.from(result.imageUrl.split(',')[1], 'base64').length / 1024 
          : 0
      )

      return NextResponse.json({
        ok: true,
        model: result.model,
        latencyMs: result.latencyMs,
        imageSizeKB,
        imageUrl: result.imageUrl,
        mimeType: result.mimeType,
        prompt: prompt,
        message: `✅ Image generation successful with ${result.model}!`,
        metadata: {
          format: result.mimeType,
          hasImage: true,
        },
      })
    } catch (error: unknown) {
      const elapsedMs = Date.now() - startedAt
      const errorMessage = error instanceof Error ? error.message : String(error)

      return NextResponse.json(
        {
          ok: false,
          latencyMs: elapsedMs,
          error: errorMessage,
          prompt: prompt,
        },
        { status: 500 },
      )
    }
  } catch (error: unknown) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : typeof error === 'string'
            ? error
            : 'Unknown error',
      },
      { status: 500 },
    )
  }
}

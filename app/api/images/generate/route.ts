import { NextRequest, NextResponse } from 'next/server'
import { generateGeminiImage } from '@/lib/services/gemini-image-generator'

// In-memory cache for generated images (in production, use Redis or DB)
const imageCache = new Map<string, string>()

// Increase max duration for image generation (takes ~40 seconds)
export const maxDuration = 60 // 60 seconds to handle ~40s generation time

export async function POST(request: NextRequest) {
    try {
        const { prompt, id, fallbackUrl } = await request.json()

        if (!prompt) {
            return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
        }

        // Check cache first
        const cacheKey = `img_${id || prompt.slice(0, 50)}`
        if (imageCache.has(cacheKey)) {
            return NextResponse.json({
                imageUrl: imageCache.get(cacheKey),
                cached: true
            })
        }

        // Check if API key is available
        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
        if (!apiKey) {
            console.log('[Image Gen] No API key, returning fallback')
            return NextResponse.json({
                imageUrl: fallbackUrl || '/feed-images/salmon-bowl.png',
                fallback: true
            })
        }

        try {
            // Generate image using Gemini 2.5 Flash Image (AI SDK-like interface)
            const result = await generateGeminiImage({
                prompt: prompt,
                model: process.env.IMAGE_GEN_MODEL || 'gemini-2.5-flash-image',
            })
            
            // Cache the generated image
            imageCache.set(cacheKey, result.imageUrl)
            
            console.log(`[Image Gen] Success with model: ${result.model}`)
            
            return NextResponse.json({
                imageUrl: result.imageUrl,
                generated: true,
                model: result.model
            })

        } catch (genError: unknown) {
            console.error('[Image Gen] Generation error:', genError)

            // Return fallback image on error
            return NextResponse.json({
                imageUrl: fallbackUrl || '/feed-images/salmon-bowl.png',
                fallback: true,
                reason: genError instanceof Error ? genError.message : 'Generation failed'
            })
        }

    } catch (error) {
        console.error('[Image Gen] Request error:', error)
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        )
    }
}

// GET endpoint to check status
export async function GET() {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY
    return NextResponse.json({
        enabled: !!apiKey,
        cacheSize: imageCache.size,
        message: apiKey
            ? 'Image generation is enabled'
            : 'Set GOOGLE_GENERATIVE_AI_API_KEY to enable image generation'
    })
}

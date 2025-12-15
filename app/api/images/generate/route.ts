import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, Modality } from '@google/genai'

// In-memory cache for generated images (in production, use Redis or DB)
const imageCache = new Map<string, string>()

// Initialize Google GenAI
const genai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY || '',
})

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
            // Generate image using Imagen 3
            const response = await genai.models.generateImages({
                model: 'imagen-3.0-generate-001',
                prompt: prompt,
                config: {
                    numberOfImages: 1,
                    aspectRatio: '16:9',
                    outputMimeType: 'image/png',
                },
            })

            if (response.generatedImages && response.generatedImages.length > 0) {
                const imageData = response.generatedImages[0]

                // For now, return as base64 data URL
                // In production, upload to Cloudinary and return the URL
                const base64Image = imageData.image?.imageBytes
                if (base64Image) {
                    const dataUrl = `data:image/png;base64,${base64Image}`

                    // Cache the result
                    imageCache.set(cacheKey, dataUrl)

                    return NextResponse.json({
                        imageUrl: dataUrl,
                        generated: true
                    })
                }
            }

            // Fallback if generation fails
            return NextResponse.json({
                imageUrl: fallbackUrl || '/feed-images/salmon-bowl.png',
                fallback: true,
                reason: 'No image generated'
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

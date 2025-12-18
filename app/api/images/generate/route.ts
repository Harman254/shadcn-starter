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
            // Generate image using Gemini 2.5 Flash Image (Nano Banana)
            // Try multiple model names as the exact identifier may vary
            const modelNames = [
                process.env.IMAGE_GEN_MODEL, // User-defined model
                'gemini-2.5-flash-image',    // Gemini 2.5 Flash Image (Nano Banana)
                'gemini-2.5-flash-generate', // Alternative naming
                'imagen-3.0-generate-002',   // Imagen 3 fallback
            ].filter(Boolean) as string[]
            
            let lastError: Error | null = null
            
            for (const modelName of modelNames) {
                try {
                    console.log(`[Image Gen] Attempting model: ${modelName}`)
                    
                    const response = await genai.models.generateImages({
                        model: modelName,
                        prompt: prompt,
                        config: {
                            numberOfImages: 1,
                            aspectRatio: '16:9',
                            outputMimeType: 'image/png',
                        },
                    })
                    
                    if (response.generatedImages && response.generatedImages.length > 0) {
                        const imageData = response.generatedImages[0]
                        const base64Image = imageData.image?.imageBytes
                        
                        if (base64Image) {
                            const dataUrl = `data:image/png;base64,${base64Image}`
                            imageCache.set(cacheKey, dataUrl)
                            
                            console.log(`[Image Gen] Success with model: ${modelName}`)
                            
                            return NextResponse.json({
                                imageUrl: dataUrl,
                                generated: true,
                                model: modelName
                            })
                        }
                    }
                } catch (modelError: unknown) {
                    lastError = modelError instanceof Error ? modelError : new Error(String(modelError))
                    console.warn(`[Image Gen] Model ${modelName} failed:`, lastError.message)
                    // Continue to next model
                }
            }
            
            // All models failed
            throw lastError || new Error('All image generation models failed')


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

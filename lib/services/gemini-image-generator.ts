/**
 * Gemini Image Generation Service
 * 
 * Wraps the low-level @google/genai client to provide an AI SDK-like interface
 * for image generation. Uses the Google AI Studio pattern with generateContentStream.
 */

import { GoogleGenAI } from '@google/genai'

export interface ImageGenerationOptions {
  prompt: string
  model?: string
  aspectRatio?: '16:9' | '1:1' | '9:16'
  mimeType?: 'image/png' | 'image/jpeg'
  timeoutMs?: number // Default: 60 seconds (60000ms) to handle ~40s generation time
}

export interface ImageGenerationResult {
  imageUrl: string
  mimeType: string
  model: string
  latencyMs: number
}

/**
 * Generate an image using Gemini 2.5 Flash Image
 * Follows the Google AI Studio pattern with generateContentStream
 */
/**
 * Generate an image using Gemini 2.5 Flash Image
 * Follows the Google AI Studio pattern with generateContentStream
 * 
 * Note: Image generation typically takes ~40 seconds, so timeout is set to 60s by default
 */
export async function generateGeminiImage(
  options: ImageGenerationOptions
): Promise<ImageGenerationResult> {
  const startedAt = Date.now()
  const timeoutMs = options.timeoutMs || 60000 // 60 seconds default (handles ~40s generation)
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY / GEMINI_API_KEY env var')
  }

  // Model name variants to try
  const modelVariants = [
    options.model,
    process.env.IMAGE_GEN_MODEL,
    'gemini-2.5-flash-image', // Exact name from Google AI Studio
    'models/gemini-2.5-flash-image', // With prefix
  ].filter(Boolean) as string[]

  const genai = new GoogleGenAI({ apiKey })
  let lastError: Error | null = null

  for (const modelName of modelVariants) {
    try {
      console.log(`[GeminiImageGen] Attempting model: ${modelName} (timeout: ${timeoutMs}ms)`)

      const config = {
        responseModalities: ['IMAGE', 'TEXT'] as const,
      }

      const contents = [
        {
          role: 'user' as const,
          parts: [
            {
              text: options.prompt,
            },
          ],
        },
      ]

      // Start image generation
      const responsePromise = genai.models.generateContentStream({
        model: modelName,
        config,
        contents,
      })

      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Image generation timed out after ${timeoutMs}ms`))
        }, timeoutMs)
      })

      // Race between image generation and timeout
      const response = await Promise.race([responsePromise, timeoutPromise])

      // Stream through the response to find image data
      let imageData: string | null = null
      let mimeType: string = options.mimeType || 'image/png'

      for await (const chunk of response) {
        // Check timeout during streaming
        if (Date.now() - startedAt > timeoutMs) {
          throw new Error(`Image generation timed out after ${timeoutMs}ms during streaming`)
        }

        if (!chunk.candidates || !chunk.candidates[0]?.content?.parts) {
          continue
        }

        const part = chunk.candidates[0].content.parts[0]

        // Check for inline image data (base64)
        if (part.inlineData) {
          imageData = part.inlineData.data || null
          mimeType = part.inlineData.mimeType || mimeType
          break // Found image, stop streaming
        }
      }

      if (imageData) {
        const dataUrl = `data:${mimeType};base64,${imageData}`
        const elapsedMs = Date.now() - startedAt

        console.log(`[GeminiImageGen] Success with ${modelName} in ${elapsedMs}ms`)

        return {
          imageUrl: dataUrl,
          mimeType,
          model: modelName,
          latencyMs: elapsedMs,
        }
      }

      throw new Error('Model responded but no image data found in stream')
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error))
      const errorMsg = lastError.message.toLowerCase()

      console.warn(`[GeminiImageGen] Model ${modelName} failed:`, lastError.message)

      // If it's a timeout or not a "model not found" error, stop trying
      if (
        errorMsg.includes('timeout') ||
        (!errorMsg.includes('not found') && !errorMsg.includes('not supported'))
      ) {
        break
      }
    }
  }

  // All models failed
  throw lastError || new Error('All image generation model variants failed')
}


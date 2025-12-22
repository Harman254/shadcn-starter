import { NextResponse } from 'next/server'
import { google } from '@ai-sdk/google'
import { generateText } from 'ai'

// Ensure this route runs in the Node.js runtime (not Edge)
export const runtime = 'nodejs'

// Common Gemini 3 Flash model name variations to try
const GEMINI_3_MODEL_VARIANTS = [
  process.env.GEMINI_3_MODEL, // User override
  'gemini-3.0-flash',
  'gemini-3-flash',
  'gemini-3.0-flash-exp',
  'gemini-3-flash-exp',
  'gemini-3.0-flash-latest',
  'gemini-2.0-flash', // Fallback to known working model
].filter(Boolean) as string[]

export async function GET() {
  const startedAt = Date.now()
  const prompt =
    'You are a health-focused meal planning assistant. Reply with one short, concrete example of a 1-day healthy meal plan.'

  // Try each model variant until one works
  let lastError: Error | null = null

  for (const modelName of GEMINI_3_MODEL_VARIANTS) {
    try {
      console.log(`[Test Gemini 3] Trying model: ${modelName}`)

      const result = await generateText({
        model: google(modelName),
        temperature: 0.7,
        maxTokens: 512,
        prompt,
      })

      const elapsedMs = Date.now() - startedAt

      return NextResponse.json({
        ok: true,
        model: modelName,
        latencyMs: elapsedMs,
        text: result.text.trim(),
        usage: result.usage,
        message: modelName.includes('3') 
          ? '✅ Gemini 3 Flash is working!' 
          : `✅ Using fallback model: ${modelName}`,
      })
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error))
      console.warn(`[Test Gemini 3] Model ${modelName} failed:`, lastError.message)
      
      // If it's not a "model not found" error, stop trying
      const errorMsg = lastError.message.toLowerCase()
      if (!errorMsg.includes('not found') && !errorMsg.includes('not supported')) {
        break
      }
      // Otherwise, continue to next model variant
    }
  }

  // All models failed
  const elapsedMs = Date.now() - startedAt

  return NextResponse.json(
    {
      ok: false,
      modelsTried: GEMINI_3_MODEL_VARIANTS,
      latencyMs: elapsedMs,
      error: lastError?.message || 'All model variants failed',
      suggestion: 'Gemini 3 Flash may not be available yet. Check Google AI Studio for the exact model name, or use gemini-2.0-flash as fallback.',
    },
    { status: 500 },
  )
}


